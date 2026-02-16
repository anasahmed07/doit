"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Note } from "@/lib/types";
import { NoteCard } from "./NoteCard";
import { useState, useEffect, useMemo, useRef } from "react";
import { Archive } from "lucide-react";

interface DraggableNoteGridProps {
  notes: Note[];
  onReorder: (notes: Note[]) => void;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  onView: (note: Note) => void;
  onToggleTodo: (note: Note, index: number) => void;
  onArchive?: (id: string) => void;
}

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: "0.5",
            },
        },
    }),
};

function SortableNoteItem({
  note,
  onDelete,
  onEdit,
  onView,
  onToggleTodo,
  onArchive
}: {
  note: Note;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  onView: (note: Note) => void;
  onToggleTodo: (note: Note, index: number) => void;
  onArchive?: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="h-fit">
      <NoteCard
        note={note}
        onDelete={onDelete}
        onEdit={onEdit}
        onView={onView}
        onToggleTodo={onToggleTodo}
        onArchive={onArchive}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}

function NoteArchiveDropZone({ isDragging }: { isDragging: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "NOTE_ARCHIVE",
    data: {
      type: "Archive",
    },
  });

  if (!isDragging) return null;

  return (
    <div
      ref={setNodeRef}
      className="fixed right-0 top-0 h-full w-3 z-40 pointer-events-auto"
    >
      {/* Visible glow extends further than the narrow hit zone */}
      <div
        className={`absolute top-0 right-0 h-full w-12 transition-opacity duration-500 pointer-events-none ${
          isOver ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "linear-gradient(to left, rgba(249,115,22,0.3) 0%, rgba(249,115,22,0.08) 50%, transparent 100%)",
        }}
      />
      <div className={`absolute right-1 top-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none ${
        isOver ? "opacity-80 scale-100" : "opacity-0 scale-90"
      }`}>
        <Archive className="h-3.5 w-3.5 text-orange-500" />
      </div>
    </div>
  );
}

export function DraggableNoteGrid({ notes, onReorder, onDelete, onEdit, onView, onToggleTodo, onArchive }: DraggableNoteGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [columnCount, setColumnCount] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine number of columns based on container width
  useEffect(() => {
    if (!containerRef.current) return;

    const updateColumns = (width: number) => {
      // Calculate columns based on available width and minimum card width (approx 300px)
      const minColWidth = 300;
      // We subtract gap space roughly: (cols - 1) * 16px.
      // Simplified: just use width / minWidth.
      const cols = Math.max(1, Math.floor(width / minColWidth));
      setColumnCount(cols);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updateColumns(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);

    // Initial calculation
    updateColumns(containerRef.current.offsetWidth);

    return () => resizeObserver.disconnect();
  }, []);

  // Distribute notes into columns round-robin to maintain 1x1, 1x2, 1x3 order across rows
  const columns = useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => [] as Note[]);
    notes.forEach((note, index) => {
      cols[index % columnCount].push(note);
    });
    return cols;
  }, [notes, columnCount]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);

    if (!over) {
      setActiveId(null);
      return;
    }

    const overId = over.id as string;

    // Handle archive drop
    if (overId === "NOTE_ARCHIVE" || over.data.current?.type === "Archive") {
      if (onArchive) {
        onArchive(active.id as string);
      }
      setActiveId(null);
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = notes.findIndex((note) => note.id === active.id);
      const newIndex = notes.findIndex((note) => note.id === over.id);

      const newOrder = arrayMove(notes, oldIndex, newIndex);
      onReorder(newOrder);
    }
    setActiveId(null);
  };

  const activeNote = activeId ? notes.find((note) => note.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={notes.map(n => n.id)} strategy={rectSortingStrategy}>
        <div ref={containerRef} className="flex gap-4 pb-20 items-start w-full min-w-0">
          {columns.map((columnNotes, colIdx) => (
            <div key={colIdx} className="flex-1 flex flex-col gap-4 min-w-0">
              {columnNotes.map((note) => (
                <SortableNoteItem
                  key={note.id}
                  note={note}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onView={onView}
                  onToggleTodo={onToggleTodo}
                  onArchive={onArchive}
                />
              ))}
            </div>
          ))}
        </div>
      </SortableContext>

      <NoteArchiveDropZone isDragging={isDragging} />

      <DragOverlay dropAnimation={dropAnimation}>
          {activeNote ? (
              <div className="w-full h-full max-w-[400px]">
                <NoteCard note={activeNote} onDelete={() => {}} onEdit={() => {}} onView={onView} onToggleTodo={onToggleTodo} isOverlay />
              </div>
          ) : null}
      </DragOverlay>
    </DndContext>
  );
}
