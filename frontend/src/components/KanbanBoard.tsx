"use client";

import { useState, useEffect, useRef } from "react";
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
import { Plus, Trash2, GripVertical, MoreHorizontal, Edit2 } from "lucide-react";
import { ConfirmationDialog } from "./ConfirmationDialog";

interface KanbanBoardProps {
  tasks: ProjectTask[];
  onTaskUpdate: (id: string, updates: Partial<ProjectTask>) => void;
  onAddTask: (content: string, status: string) => void;
  onDeleteTask: (id: string) => void;
  onTasksReorder?: (reorderedTasks: { id: string; order_index: number; status: string }[]) => void;
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
  onDelete,
  onUpdate
}: { 
  task: ProjectTask; 
  onDelete: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<ProjectTask>) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);

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
    disabled: isEditing, // Disable drag when editing
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleSave = () => {
    if (editContent.trim() && onUpdate) {
      onUpdate(task.id, { content: editContent.trim() });
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative flex flex-col gap-2 border-2 border-primary bg-background p-4 shadow-hard-sm"
      >
        <textarea
          autoFocus
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full min-h-[80px] resize-none rounded-none bg-transparent text-sm font-medium focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSave();
            }
            if (e.key === "Escape") {
              setIsEditing(false);
              setEditContent(task.content);
            }
          }}
        />
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => {
              setIsEditing(false);
              setEditContent(task.content);
            }}
            className="text-xs font-bold text-muted-foreground hover:underline"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="bg-primary text-primary-foreground px-2 py-1 text-xs font-bold shadow-hard-sm active:translate-y-px"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex flex-col gap-2 border-2 border-foreground bg-background p-4 shadow-hard-sm hover:translate-y-[-2px] hover:shadow-hard transition-all"
    >
      <div className="flex items-start justify-between">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 text-muted-foreground hover:text-primary"
            title="Edit Task"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1 text-muted-foreground hover:text-destructive"
            title="Delete Task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <p className="text-sm font-medium leading-relaxed break-words whitespace-pre-wrap">
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
  onDeleteTask,
  onTaskUpdate
}: {
  id: string;
  title: string;
  tasks: ProjectTask[];
  onAddTask: (content: string, status: string) => void;
  onDeleteTask: (id: string) => void;
  onTaskUpdate: (id: string, updates: Partial<ProjectTask>) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  // Make column droppable
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: "Column",
      column: id,
    },
  });

  // Handle click outside to close the add form
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsAdding(false);
      }
    }

    if (isAdding) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAdding]);

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
      className={`flex flex-col w-80 max-h-[calc(100vh-10rem)] bg-secondary/10 border-x border-foreground/5 p-4 rounded-lg transition-colors ${
        isOver ? "bg-primary/10 ring-2 ring-primary/30" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
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

      <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1 custom-scrollbar">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <KanbanTaskItem 
                key={task.id} 
                task={task} 
                onDelete={onDeleteTask} 
                onUpdate={onTaskUpdate}
              />
            ))}
        </SortableContext>
      </div>

      <div className="mt-4 flex-shrink-0">
        {isAdding ? (
          <div ref={formRef} className="space-y-2 animate-in fade-in duration-200">
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
  onDeleteTask,
  onTasksReorder
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<ProjectTask | null>(null);
  const [localTasks, setLocalTasks] = useState<ProjectTask[]>(tasks);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Keep local tasks in sync with props when tasks array changes
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

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
    const task = localTasks.find((t) => t.id === active.id);
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
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskObj = localTasks.find((t) => t.id === activeId);
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
      const overTask = localTasks.find((t) => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
      } else {
        // Fallback: If overId is a column ID string
        const column = COLUMNS.find((c) => c.id === overId);
        if (column) targetStatus = column.id;
      }
    }

    // Get tasks in the target column
    const columnTasks = localTasks
      .filter((t) => t.status === targetStatus)
      .sort((a, b) => a.order_index - b.order_index);

    // Find position of over task
    const overTaskIndex = columnTasks.findIndex((t) => t.id === overId);
    const activeTaskIndex = columnTasks.findIndex((t) => t.id === activeId);

    // If moving to a different column or reordering within same column
    if (activeTaskObj.status !== targetStatus) {
      // Moving to different column - add at the end or at over position
      const newOrderIndex =
        overTaskIndex >= 0
          ? columnTasks[overTaskIndex].order_index
          : columnTasks.length > 0
          ? columnTasks[columnTasks.length - 1].order_index + 1
          : 0;

      onTaskUpdate(activeId, { status: targetStatus, order_index: newOrderIndex });
    } else if (activeId !== overId && overTaskIndex >= 0) {
      // Reordering within same column
      const newColumnTasks = arrayMove(columnTasks, activeTaskIndex, overTaskIndex);

      // Update local state immediately for visual feedback
      const reorderedTasks = newColumnTasks.map((task, index) => ({
        ...task,
        order_index: index,
      }));

      setLocalTasks((prev) => {
        const otherTasks = prev.filter((t) => t.status !== targetStatus);
        return [...otherTasks, ...reorderedTasks].sort((a, b) => {
          if (a.status !== b.status) return a.status.localeCompare(b.status);
          return a.order_index - b.order_index;
        });
      });

      // Notify parent of reorder
      if (onTasksReorder) {
        onTasksReorder(
          reorderedTasks.map((t) => ({
            id: t.id,
            order_index: t.order_index,
            status: t.status,
          }))
        );
      }
    }

    setActiveTask(null);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-8 h-full items-start overflow-x-auto pb-4">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={localTasks
                .filter((t) => t.status === column.id)
                .sort((a, b) => a.order_index - b.order_index)}
              onAddTask={onAddTask}
              onDeleteTask={setTaskToDelete}
              onTaskUpdate={onTaskUpdate}
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

      <ConfirmationDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            onDeleteTask(taskToDelete);
          }
        }}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        variant="destructive"
        confirmText="Delete Task"
      />
    </>
  );
}