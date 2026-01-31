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
import { useState } from "react";

interface DraggableNoteGridProps {
  notes: Note[];
  onReorder: (notes: Note[]) => void;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
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

function SortableNoteItem({ note, onDelete, onEdit }: { note: Note; onDelete: (id: string) => void; onEdit: (note: Note) => void }) {
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none h-fit break-inside-avoid mb-4">
      <NoteCard note={note} onDelete={onDelete} onEdit={onEdit} />
    </div>
  );
}

export function DraggableNoteGrid({ notes, onReorder, onDelete, onEdit }: DraggableNoteGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8, // Prevent accidental drags
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
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 pb-20 block">
          {notes.map((note) => (
            <SortableNoteItem
              key={note.id}
              note={note}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      </SortableContext>
      
      <DragOverlay dropAnimation={dropAnimation}>
          {activeNote ? (
              <NoteCard note={activeNote} onDelete={() => {}} onEdit={() => {}} isOverlay />
          ) : null}
      </DragOverlay>
    </DndContext>
  );
}
