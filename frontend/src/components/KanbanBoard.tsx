"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ProjectTask } from "@/lib/types";
import { Plus, Trash2, GripVertical, MoreHorizontal } from "lucide-react";

interface KanbanBoardProps {
  tasks: ProjectTask[];
  onTaskUpdate: (id: string, updates: Partial<ProjectTask>) => void;
  onAddTask: (content: string, status: string) => void;
  onDeleteTask: (id: string) => void;
}

const COLUMNS = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "DONE", title: "Done" },
];

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

function KanbanTaskItem({ 
  task, 
  onDelete 
}: { 
  task: ProjectTask; 
  onDelete: (id: string) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex flex-col gap-2 border-2 border-foreground bg-background p-4 shadow-hard-sm"
    >
      <div className="flex items-start justify-between">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
        <button 
          onClick={() => onDelete(task.id)}
          className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="text-sm font-medium leading-relaxed break-words">
        {task.content}
      </p>
    </div>
  );
}

function KanbanColumn({
  id,
  title,
  tasks,
  onAddTask,
  onDeleteTask
}: {
  id: string;
  title: string;
  tasks: ProjectTask[];
  onAddTask: (content: string, status: string) => void;
  onDeleteTask: (id: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState("");

  // Make column droppable
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: "Column",
      column: id,
    },
  });

  const handleAdd = () => {
    if (content.trim()) {
      onAddTask(content.trim(), id);
      setContent("");
      setIsAdding(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-80 min-h-[500px] bg-secondary/10 border-x border-foreground/5 p-4 rounded-lg transition-colors ${
        isOver ? "bg-primary/10 ring-2 ring-primary/30" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
           <h3 className="font-black uppercase tracking-widest text-xs">{title}</h3>
           <span className="bg-foreground/10 px-2 py-0.5 rounded-full text-[10px] font-black">
              {tasks.length}
           </span>
        </div>
        <button className="text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-4 min-h-[100px]">
          {tasks.map((task) => (
            <KanbanTaskItem key={task.id} task={task} onDelete={onDeleteTask} />
          ))}
        </div>
      </SortableContext>

      <div className="mt-6">
        {isAdding ? (
          <div className="space-y-2 animate-in fade-in duration-200">
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-none border-2 border-foreground bg-background p-3 text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:shadow-hard-sm"
              placeholder="Enter task description..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsAdding(false)}
                className="text-xs font-bold text-muted-foreground hover:underline"
              >
                Cancel
              </button>
              <button 
                onClick={handleAdd}
                className="bg-foreground text-background px-3 py-1.5 text-xs font-bold shadow-hard-sm active:translate-y-px"
              >
                Add Task
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-foreground/10 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </button>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ 
  tasks, 
  onTaskUpdate, 
  onAddTask,
  onDeleteTask 
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<ProjectTask | null>(null);

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
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    if (!isActiveTask) return;

    // Check if dropping over a task or a column
    // For simplicity with dnd-kit columns, we can use id of columns as potential droppable targets
    // But here we use a simple approach: if overId is a task, move it. If overId is a column (not implemented yet as droppable), do nothing.
    // Actually, we should make columns droppable too.
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
        setActiveTask(null);
        return;
    }

    const activeId = active.id;
    const overId = over.id;

    const activeTaskObj = tasks.find((t) => t.id === activeId);
    if (!activeTaskObj) {
        setActiveTask(null);
        return;
    }

    // Determine target status
    let targetStatus = activeTaskObj.status;

    // Check if dropped on a column
    if (over.data.current?.type === "Column") {
        targetStatus = over.data.current.column;
    } else {
        // Check if dropped on another task
        const overTask = tasks.find((t) => t.id === overId);
        if (overTask) {
            targetStatus = overTask.status;
        } else {
            // Fallback: If overId is a column ID string
            const column = COLUMNS.find(c => c.id === overId);
            if (column) targetStatus = column.id;
        }
    }

    if (activeTaskObj.status !== targetStatus) {
        onTaskUpdate(activeId as string, { status: targetStatus });
    } else if (activeId !== overId) {
        // Just reordering within same column
        // We'd need to implement order_index updates here if we wanted full persistence of order
        // For MVP, we'll just handle status changes.
    }

    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-8 h-full">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={tasks.filter((t) => t.status === column.id)}
            onAddTask={onAddTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? (
          <div className="w-80 scale-105 rotate-2 shadow-hard-lg z-50">
            <KanbanTaskItem task={activeTask} onDelete={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
