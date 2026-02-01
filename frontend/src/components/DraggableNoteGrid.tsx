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
import { CSS } from "@dnd-kit/utilities";
import { Note } from "@/lib/types";
import { NoteCard } from "./NoteCard";
import { useState, useEffect, useMemo, useRef } from "react";

interface DraggableNoteGridProps {
  notes: Note[];
  onReorder: (notes: Note[]) => void;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  onView: (note: Note) => void;
  onToggleTodo: (note: Note, index: number) => void;
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
  onToggleTodo 
}: { 
  note: Note; 
  onDelete: (id: string) => void; 
  onEdit: (note: Note) => void;
  onView: (note: Note) => void;
  onToggleTodo: (note: Note, index: number) => void;
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
    transform: CSS.Transform.toString(transform),
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
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}

export function DraggableNoteGrid({ notes, onReorder, onDelete, onEdit, onView, onToggleTodo }: DraggableNoteGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
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
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
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
        <div ref={containerRef} className="flex gap-4 pb-20 items-start w-full">
          {columns.map((columnNotes, colIdx) => (
            <div key={colIdx} className="flex-1 flex flex-col gap-4">
              {columnNotes.map((note) => (
                <SortableNoteItem
                  key={note.id}
                  note={note}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onView={onView}
                  onToggleTodo={onToggleTodo}
                />
              ))}
            </div>
          ))}
        </div>
      </SortableContext>
      
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
