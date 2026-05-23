"use client";

import { Draggable } from "@hello-pangea/dnd";
import type { Task } from "@/types";
import { PRIORITY_LABELS } from "@/lib/utils/constants";

interface TaskCardProps {
  task: Task;
  index: number;
}

const PRIORITY_COLOR: Record<string, string> = {
  high:   "var(--c-red)",
  medium: "var(--c-amber)",
  low:    "var(--c-muted)",
};

const PRIORITY_BAR_BG: Record<string, string> = {
  high:   "var(--c-red-bg)",
  medium: "var(--c-amber-bg)",
  low:    "transparent",
};

export default function TaskCard({ task, index }: TaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
  {(provided, snapshot) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="cursor-grab active:cursor-grabbing group transition-all duration-200 card-hover overflow-hidden flex"
      style={{
        ...provided.draggableProps.style,
        marginBottom: "12px",
        borderRadius: "14px",
        overflow: "hidden",
        display: "flex",
        border: `1px solid ${snapshot.isDragging ? "var(--c-accent)" : "var(--c-border)"}`,
        transform: snapshot.isDragging
          ? `${provided.draggableProps.style?.transform ?? ""} scale(1.02)`
          : provided.draggableProps.style?.transform,
        boxShadow: snapshot.isDragging ? "0 16px 40px rgba(0,0,0,0.4)" : "none",
        background: snapshot.isDragging ? "var(--c-raised)" : "var(--c-surface)",
      }}
    >
      {/* Vertical Accent */}
      <div
        style={{
          width: "3px",
          flexShrink: 0,
          background: PRIORITY_COLOR[task.priority] ?? "var(--c-faint)",
        }}
      />

      {/* Card Body */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "16px",
        }}
      >
        {/* Title */}
        <p
          className="text-sm font-semibold leading-snug"
          style={{ color: "var(--c-text)" }}
        >
          {task.title}
        </p>

        {/* Description */}
        {task.description && (
          <p
            className="text-[11px] line-clamp-2"
            style={{
              color: "var(--c-muted)",
              lineHeight: 1.45,
            }}
          >
            {task.description}
          </p>
        )}

        {/* Meta Row */}
        <div
          className="flex items-center justify-between"
          style={{ paddingTop: "4px" }}
        >
          <span
            className="text-[9px] font-bold uppercase tracking-[0.12em] rounded-md"
            style={{
              padding: "3px 6px",
              color: PRIORITY_COLOR[task.priority] ?? "var(--c-muted)",
              background: PRIORITY_BAR_BG[task.priority] ?? "var(--c-raised)",
            }}
          >
            {PRIORITY_LABELS[task.priority] ?? task.priority}
          </span>

          {task.estimated_hours && (
            <div
              className="flex items-center text-[10px] font-mono tabular-nums"
              style={{
                gap: "4px",
                color: "var(--c-muted)",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" />
                <path
                  d="M5 3v2l1.5 1.5"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
              <span>{task.estimated_hours}h</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between"
          style={{ paddingTop: "4px" }}
        >
          {task.assignee ? (
            <div className="flex items-center min-w-0" style={{ gap: "8px" }}>
              <div
                className="rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold"
                style={{
                  width: "20px",
                  height: "20px",
                  background: "var(--c-accent-bg)",
                  color: "var(--c-accent)",
                  border: "1px solid var(--c-accent-bd)",
                }}
              >
                {(task.assignee as { full_name: string }).full_name?.[0]?.toUpperCase()}
              </div>

              <span
                className="text-[10px] truncate"
                style={{
                  maxWidth: "90px",
                  color: "var(--c-muted)",
                }}
              >
                {(task.assignee as { full_name: string }).full_name}
              </span>
            </div>
          ) : (
            <span
              className="text-[10px] italic"
              style={{ color: "var(--c-faint)" }}
            >
              Belum diassign
            </span>
          )}

          {task.ai_generated && (
            <span
              className="text-[8px] font-semibold tracking-[0.08em] rounded-md"
              style={{
                padding: "3px 6px",
                color: "var(--c-accent)",
                background: "var(--c-accent-bg)",
                border: "1px solid var(--c-accent-bd)",
              }}
            >
              ✦ AI
            </span>
          )}
        </div>
      </div>
    </div>
  )}
</Draggable>
  );
}