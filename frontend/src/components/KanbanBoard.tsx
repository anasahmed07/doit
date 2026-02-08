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
import { Plus, Trash2, GripVertical, MoreHorizontal, Edit2, Calendar, AlertCircle } from "lucide-react";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { TaskDialog } from "./TaskDialog";
import { formatDistanceToNow, isPast, isToday } from "date-fns";

interface KanbanBoardProps {
  tasks: ProjectTask[];
  onTaskUpdate: (id: string, updates: Partial<ProjectTask>) => void;
  onAddTask: (content: string, status: string, priority?: string, due_date?: string | null) => void;
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

  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
  const isDueToday = task.due_date && isToday(new Date(task.due_date));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex flex-col gap-2 border-2 bg-background p-3 shadow-hard-sm hover:translate-y-[-2px] hover:shadow-hard transition-all cursor-pointer ${
        isOverdue && task.status !== 'DONE' ? 'border-destructive/50 bg-destructive/5' : 
        task.priority === 'HIGH' ? 'border-red-500/20' : 
        'border-foreground'
      }`}
      onClick={() => onUpdate?.(task.id, {})}
    >
      <div className="flex items-start justify-between gap-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-0.5">
          <GripVertical className="h-3.5 w-3.5" />
        </div>
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {task.priority !== 'MEDIUM' && (
             <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                task.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
             }`}>
                {task.priority === 'HIGH' && <AlertCircle className="h-2.5 w-2.5" />}
                {task.priority}
             </div>
          )}
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate?.(task.id, {});
            }}
            className="p-1 text-muted-foreground hover:text-primary"
            title="Edit Task"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1 text-muted-foreground hover:text-destructive"
            title="Delete Task"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      <p className="text-xs font-bold leading-relaxed break-words whitespace-pre-wrap line-clamp-3">
        {task.content}
      </p>

      {task.due_date && (
        <div className={`flex items-center gap-1.5 text-[10px] font-bold mt-1 ${
           task.status === 'DONE' ? 'text-muted-foreground line-through' :
           isOverdue ? 'text-destructive' :
           isDueToday ? 'text-yellow-600' :
           'text-muted-foreground'
        }`}>
           <Calendar className="h-3 w-3" />
           <span>{formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}</span>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  id,
  title,
  tasks,
  onAddTaskClick,
  onDeleteTask,
  onTaskUpdateClick
}: {
  id: string;
  title: string;
  tasks: ProjectTask[];
  onAddTaskClick: (status: string) => void;
  onDeleteTask: (id: string) => void;
  onTaskUpdateClick: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: "Column",
      column: id,
    },
  });

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
                onUpdate={() => onTaskUpdateClick(task.id)}
              />
            ))}
        </SortableContext>
      </div>

      <div className="mt-4 flex-shrink-0">
        <button
          onClick={() => onAddTaskClick(id)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-foreground/10 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Task
        </button>
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
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | undefined>(undefined);
  const [defaultStatus, setDefaultStatus] = useState<string>("TODO");

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

  const handleAddTaskClick = (status: string) => {
    setDefaultStatus(status);
    setEditingTask(undefined);
    setIsTaskDialogOpen(true);
  };

  const handleEditTaskClick = (taskId: string) => {
    const task = localTasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setIsTaskDialogOpen(true);
    }
  };

  const handleTaskDialogSuccess = (content: string, status?: string, priority?: string, due_date?: string | null) => {
    if (editingTask) {
      onTaskUpdate(editingTask.id, { content, status, priority, due_date });
    } else {
      onAddTask(content, status || defaultStatus, priority, due_date);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = localTasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
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

    let targetStatus = activeTaskObj.status;

    if (over.data.current?.type === "Column") {
      targetStatus = over.data.current.column;
    } else {
      const overTask = localTasks.find((t) => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
      } else {
        const column = COLUMNS.find((c) => c.id === overId);
        if (column) targetStatus = column.id;
      }
    }

    const columnTasks = localTasks
      .filter((t) => t.status === targetStatus)
      .sort((a, b) => a.order_index - b.order_index);

    const overTaskIndex = columnTasks.findIndex((t) => t.id === overId);
    const activeTaskIndex = columnTasks.findIndex((t) => t.id === activeId);

    if (activeTaskObj.status !== targetStatus) {
      const newOrderIndex =
        overTaskIndex >= 0
          ? columnTasks[overTaskIndex].order_index
          : columnTasks.length > 0
          ? columnTasks[columnTasks.length - 1].order_index + 1
          : 0;

      onTaskUpdate(activeId, { status: targetStatus, order_index: newOrderIndex });
    } else if (activeId !== overId && overTaskIndex >= 0) {
      const newColumnTasks = arrayMove(columnTasks, activeTaskIndex, overTaskIndex);
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
              onAddTaskClick={handleAddTaskClick}
              onDeleteTask={setTaskToDelete}
              onTaskUpdateClick={handleEditTaskClick}
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

      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        onSuccess={handleTaskDialogSuccess}
        initialTask={editingTask}
        defaultStatus={defaultStatus}
      />
    </>
  );
}
