"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type CollisionDetection,
  rectIntersection,
} from "@dnd-kit/core";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";
import EditTaskModal from "./EditTaskModal";

type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

interface TaskAssignee {
  id: string;
  name: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  deadline: string | null;
  assigneeId: string | null;
  assignee: TaskAssignee | null;
  projectId: string;
  position: number;
  _count?: { subtasks: number; comments: number; attachments: number };
}

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "TODO", title: "К выполнению", color: "bg-slate-400" },
  { id: "IN_PROGRESS", title: "В работе", color: "bg-blue-500" },
  { id: "REVIEW", title: "На проверке", color: "bg-amber-500" },
  { id: "DONE", title: "Готово", color: "bg-emerald-500" },
];

const COLUMN_IDS = new Set<string>(COLUMNS.map((c) => c.id));

export default function KanbanBoard({
  tasks,
  members,
  onUpdate,
}: {
  tasks: Task[];
  members: Member[];
  onUpdate: () => void;
}) {
  const [items, setItems] = useState<Task[]>(tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const isDragging = useRef(false);
  const pendingSave = useRef(false);

  useEffect(() => {
    if (!isDragging.current && !pendingSave.current) {
      setItems(tasks);
    }
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const collisionDetection: CollisionDetection = useCallback((args) => {
    const collisions = rectIntersection(args);
    const columnHit = collisions.find((c) => COLUMN_IDS.has(c.id as string));
    return columnHit ? [columnHit] : collisions;
  }, []);

  function getTasksByStatus(status: TaskStatus) {
    return items
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position);
  }

  function handleDragStart(event: DragStartEvent) {
    isDragging.current = true;
    const task = items.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  async function handleDragEnd(event: DragEndEvent) {
    isDragging.current = false;
    const { over } = event;
    const draggedTask = activeTask;
    setActiveTask(null);

    if (!over || !draggedTask) return;

    const overId = over.id as string;
    if (!COLUMN_IDS.has(overId)) return;

    const targetStatus = overId as TaskStatus;
    if (targetStatus === draggedTask.status) return;

    pendingSave.current = true;
    setItems((prev) =>
      prev.map((t) =>
        t.id === draggedTask.id ? { ...t, status: targetStatus } : t
      )
    );

    try {
      await fetch(`/api/tasks/${draggedTask.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus, position: 0 }),
      });
    } finally {
      pendingSave.current = false;
      onUpdate();
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              color={col.color}
              tasks={getTasksByStatus(col.id)}
              activeTaskId={activeTask?.id ?? null}
              onTaskClick={setEditingTask}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {editingTask && (
        <EditTaskModal
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
          task={editingTask}
          members={members}
          onUpdated={() => {
            setEditingTask(null);
            onUpdate();
          }}
        />
      )}
    </>
  );
}
