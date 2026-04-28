"use client";

import { useState } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import { useRealtimeTasks } from "@/hooks/use-realtime";
import { createClient } from "@/lib/supabase/client";
import type { Task, TaskStatus, TaskPriority } from "@/types";
import { STATUS_LABELS } from "@/lib/utils/constants";
import Badge from "@/components/ui/Badge";

interface BoardViewProps {
  projectId: string;
  initialTasks: Task[];
}

const columns: { id: TaskStatus; variant: "backlog" | "in_progress" | "completed" }[] = [
  { id: "backlog", variant: "backlog" },
  { id: "in_progress", variant: "in_progress" },
  { id: "completed", variant: "completed" },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function AddTaskForm({
  status,
  projectId,
  onAdd,
  onCancel,
}: {
  status: TaskStatus;
  projectId: string;
  onAdd: (task: Task) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        project_id: projectId,
        title: title.trim(),
        priority,
        status,
        ai_generated: false,
        order_index: 0,
        required_skills: [],
      })
      .select("*")
      .single();

    if (!error && data) {
      onAdd(data as Task);
      setTitle("");
      setPriority("medium");
    }
    setSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg p-3 mt-2"
      style={{ background: "var(--c-raised)", border: "1px solid var(--c-accent-bd)" }}
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Judul task..."
        className="w-full text-xs bg-transparent outline-none mb-2"
        style={{ color: "var(--c-text)" }}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
        }}
      />
      <div className="flex items-center gap-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          className="text-[10px] rounded px-1.5 py-1 flex-1 outline-none"
          style={{
            background: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            color: "var(--c-muted)",
          }}
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onCancel}
          className="text-[10px] px-2 py-1 rounded transition-colors"
          style={{ color: "var(--c-muted)" }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="text-[10px] px-2.5 py-1 rounded font-semibold disabled:opacity-40 transition-opacity"
          style={{ background: "var(--c-accent)", color: "var(--c-bg)" }}
        >
          {saving ? "..." : "Tambah"}
        </button>
      </div>
    </form>
  );
}

const COLUMN_DOT: Record<string, string> = {
  in_progress: "var(--c-amber)",
  completed: "var(--c-green)",
  backlog: "var(--c-faint)",
};

export default function BoardView({ projectId, initialTasks }: BoardViewProps) {
  const { tasks, setTasks, byStatus } = useRealtimeTasks(projectId, initialTasks);
  const supabase = createClient();
  const [addingToColumn, setAddingToColumn] = useState<TaskStatus | null>(null);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const taskId = result.draggableId;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as TaskStatus;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
  };

  const handleTaskAdded = (task: Task) => {
    setTasks((prev) => [...prev, task]);
    setAddingToColumn(null);
  };

  void tasks;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
  <DragDropContext onDragEnd={onDragEnd}>
    <div
      style={{
        flex: 1,
        overflowX: "auto",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "16px",
          height: "100%",
          minWidth: "max-content",
        }}
      >
        {columns.map(({ id, variant }) => {
          const colTasks = byStatus[id];

          return (
            <div
              key={id}
              style={{
                width: "320px",
                flexShrink: 0,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                borderRadius: "18px",
                background: "color-mix(in srgb, var(--c-surface) 60%, transparent)",
                border: "1px solid var(--c-border)",
              }}
            >
              {/* Column header */}
              <div
                className="flex items-center justify-between shrink-0"
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--c-border)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "999px",
                      flexShrink: 0,
                      background: COLUMN_DOT[id],
                    }}
                  />
                  <h2
                    className="text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: "var(--c-muted)" }}
                  >
                    {STATUS_LABELS[id]}
                  </h2>
                </div>

                <Badge variant={variant}>{colTasks.length}</Badge>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "12px",
                      transition: "background 0.15s ease",
                      background: snapshot.isDraggingOver
                        ? "color-mix(in srgb, var(--c-accent) 5%, transparent)"
                        : "transparent",
                    }}
                  >
                    {colTasks.length === 0 &&
                      !snapshot.isDraggingOver &&
                      addingToColumn !== id && (
                        <div
                          className="flex flex-col items-center justify-center text-xs border-2 border-dashed rounded-xl"
                          style={{
                            height: "96px",
                            gap: "6px",
                            color: "var(--c-faint)",
                            borderColor: "var(--c-border)",
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" opacity="0.4">
                            <rect x="2" y="2" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                          <span>Kosong</span>
                        </div>
                      )}

                    {colTasks.map((task: Task, index: number) => (
                      <TaskCard key={task.id} task={task} index={index} />
                    ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Add Task area */}
              <div
                style={{
                  flexShrink: 0,
                  padding: "10px 12px",
                  borderTop: "1px solid var(--c-border)",
                }}
              >
                {addingToColumn === id ? (
                  <AddTaskForm
                    status={id}
                    projectId={projectId}
                    onAdd={handleTaskAdded}
                    onCancel={() => setAddingToColumn(null)}
                  />
                ) : (
                  <button
                    onClick={() => setAddingToColumn(id)}
                    className="w-full flex items-center text-xs rounded-lg transition-all"
                    style={{
                      gap: "6px",
                      padding: "10px 10px",
                      color: "var(--c-muted)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "var(--c-accent)";
                      (e.currentTarget as HTMLElement).style.background = "var(--c-accent-bg)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "var(--c-muted)";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Tambah task
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </DragDropContext>
</div>
  );
}