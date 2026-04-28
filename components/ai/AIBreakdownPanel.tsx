"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Suggestion {
  id: string;
  type: string;
  title: string;
  body: string;
  is_accepted: boolean | null;
  metadata?: Record<string, unknown>;
}

interface AIBreakdownPanelProps {
  projectId: string;
  suggestions: Suggestion[];
  backlogTaskIds: string[];
  memberMap: Record<string, string>;
  taskMap: Record<string, string>;
}

export default function AIBreakdownPanel({
  projectId,
  suggestions,
  backlogTaskIds,
  memberMap,
  taskMap,
}: AIBreakdownPanelProps) {
  const router = useRouter();
  const supabase = createClient();
  const [description, setDescription] = useState("");
  const [isBreakdownLoading, setIsBreakdownLoading] = useState(false);
  const [isRecommendLoading, setIsRecommendLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [localSuggestions, setLocalSuggestions] = useState<Suggestion[]>(suggestions);

  const handleBreakdown = async () => {
    if (description.trim().length < 10) return;
    setIsBreakdownLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, description: description.trim() }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Gagal generate");
      setStatus({ type: "success", msg: "Tasks berhasil dibuat dan ditambahkan ke Backlog!" });
      setDescription("");
      router.refresh();
    } catch (err) {
      setStatus({ type: "error", msg: err instanceof Error ? err.message : "Terjadi kesalahan" });
    } finally {
      setIsBreakdownLoading(false);
    }
  };

  const handleRecommend = async () => {
    if (backlogTaskIds.length === 0) {
      setStatus({ type: "error", msg: "Tidak ada task di Backlog untuk direkomendasikan." });
      return;
    }
    setIsRecommendLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, taskIds: backlogTaskIds }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Gagal generate rekomendasi");
      setStatus({ type: "success", msg: "Rekomendasi penugasan berhasil dibuat!" });
      router.refresh();
    } catch (err) {
      setStatus({ type: "error", msg: err instanceof Error ? err.message : "Terjadi kesalahan" });
    } finally {
      setIsRecommendLoading(false);
    }
  };

  const handleAccept = async (suggestion: Suggestion) => {
    const meta = suggestion.metadata as { taskId?: string; userId?: string } | undefined;
    if (!meta?.taskId || !meta?.userId) return;

    setAcceptingId(suggestion.id);
    try {
      // Assign task ke member yang direkomendasikan
      await supabase
        .from("tasks")
        .update({ assigned_to: meta.userId, status: "in_progress" })
        .eq("id", meta.taskId);

      // Tandai saran sebagai diterima
      await supabase
        .from("ai_suggestions")
        .update({ is_accepted: true })
        .eq("id", suggestion.id);

      setLocalSuggestions((prev) =>
        prev.map((s) => (s.id === suggestion.id ? { ...s, is_accepted: true } : s)),
      );
      router.refresh();
    } finally {
      setAcceptingId(null);
    }
  };

  const pending = localSuggestions.filter((s) => s.is_accepted === null);

  return (
    <aside
  className="w-72 shrink-0 flex flex-col overflow-hidden"
  style={{
    background: "var(--c-surface)",
    borderLeft: "1px solid var(--c-border)",
  }}
>
  {/* ── Header ── */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      borderBottom: "1px solid var(--c-border)",
      flexShrink: 0,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
      <div
        style={{
          width: "26px",
          height: "26px",
          borderRadius: "7px",
          background: "var(--c-accent-bg)",
          border: "1px solid var(--c-accent-bd)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 8 8" fill="var(--c-accent)">
          <path d="M4 0l.9 2.7H8L5.5 4.4l.9 2.7L4 5.5 1.6 7.1l.9-2.7L0 2.7h3.1z"/>
        </svg>
      </div>
      <span
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "var(--c-text)",
          letterSpacing: "0.01em",
        }}
      >
        AI Assistant
      </span>
    </div>
    <span
      style={{
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "var(--c-green)",
        boxShadow: "0 0 0 2px var(--c-green-bg)",
        flexShrink: 0,
      }}
    />
  </div>
 
  <div className="overflow-y-auto flex-1 flex flex-col">
 
    {/* ── Task Breakdown ── */}
    <div style={{ borderBottom: "1px solid var(--c-border)", flexShrink: 0 }}>
      {/* Section heading */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 16px 6px",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <rect x="1" y="1" width="4" height="4" rx="1" stroke="var(--c-accent)" strokeWidth="1.2"/>
          <rect x="7" y="1" width="4" height="4" rx="1" stroke="var(--c-accent)" strokeWidth="1.2" opacity="0.5"/>
          <rect x="1" y="7" width="4" height="4" rx="1" stroke="var(--c-accent)" strokeWidth="1.2" opacity="0.4"/>
          <rect x="7" y="7" width="4" height="4" rx="1" stroke="var(--c-accent)" strokeWidth="1.2" opacity="0.25"/>
        </svg>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--c-text)", margin: 0 }}>
          Task Breakdown
        </p>
      </div>
 
      <p
        style={{
          fontSize: "11px",
          color: "var(--c-muted)",
          lineHeight: 1.55,
          padding: "0 16px 10px",
          margin: 0,
        }}
      >
        Deskripsikan fitur/modul, AI akan membuat sub-tasks otomatis.
      </p>
 
      {/* Textarea — full bleed */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Contoh: Buat fitur login dengan Google OAuth, session management, dan redirect ke dashboard..."
        rows={4}
        disabled={isBreakdownLoading}
        style={{
          display: "block",
          width: "100%",
          fontSize: "11px",
          padding: "10px 16px",
          background: "var(--c-raised)",
          border: "none",
          borderTop: "1px solid var(--c-border)",
          borderBottom: "1px solid var(--c-border)",
          color: "var(--c-text)",
          resize: "none",
          outline: "none",
          lineHeight: 1.6,
          boxSizing: "border-box",
          opacity: isBreakdownLoading ? 0.5 : 1,
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderTopColor = "var(--c-accent)";
          e.currentTarget.style.borderBottomColor = "var(--c-accent)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderTopColor = "var(--c-border)";
          e.currentTarget.style.borderBottomColor = "var(--c-border)";
        }}
      />
 
      {/* Status message */}
      {status && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "6px",
            fontSize: "11px",
            margin: "8px 16px",
            padding: "8px 10px",
            borderRadius: "8px",
            color: status.type === "success" ? "var(--c-green)" : "var(--c-danger)",
            background: status.type === "success" ? "var(--c-green-bg)" : "var(--c-red-bg)",
            border: `1px solid ${status.type === "success" ? "var(--c-green)" : "var(--c-danger)"}22`,
          }}
        >
          {status.type === "success" ? (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M3.5 6l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M6 4v2.5M6 8v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
          {status.msg}
        </div>
      )}
 
      {/* Generate button — full bleed */}
      <button
        onClick={handleBreakdown}
        disabled={isBreakdownLoading || description.trim().length < 10}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          width: "100%",
          padding: "10px 16px",
          fontSize: "12px",
          fontWeight: 700,
          background: "var(--c-accent)",
          border: "none",
          color: "var(--c-bg)",
          cursor: isBreakdownLoading || description.trim().length < 10 ? "not-allowed" : "pointer",
          opacity: isBreakdownLoading || description.trim().length < 10 ? 0.4 : 1,
          letterSpacing: "0.01em",
          transition: "opacity 0.15s",
        }}
      >
        {isBreakdownLoading ? (
          <>
            <span
              style={{
                width: "11px",
                height: "11px",
                border: "2px solid rgba(0,0,0,0.2)",
                borderTopColor: "black",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.7s linear infinite",
              }}
            />
            Generating...
          </>
        ) : (
          <>
            <svg width="10" height="10" viewBox="0 0 8 8" fill="currentColor">
              <path d="M4 0l.9 2.7H8L5.5 4.4l.9 2.7L4 5.5 1.6 7.1l.9-2.7L0 2.7h3.1z"/>
            </svg>
            Generate Tasks
          </>
        )}
      </button>
    </div>
 
    {/* ── Rekomendasi Anggota ── */}
    <div style={{ borderBottom: "1px solid var(--c-border)", flexShrink: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 16px 6px",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="4.5" cy="4" r="2" stroke="var(--c-accent)" strokeWidth="1.2"/>
          <path d="M1 10c0-1.93 1.57-3.5 3.5-3.5" stroke="var(--c-accent)" strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx="8.5" cy="4" r="2" stroke="var(--c-accent)" strokeWidth="1.2" opacity="0.5"/>
          <path d="M8.5 6.5c1.93 0 3.5 1.57 3.5 3.5" stroke="var(--c-accent)" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
        </svg>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--c-text)", margin: 0 }}>
          Rekomendasi Anggota
        </p>
      </div>
 
      <p
        style={{
          fontSize: "11px",
          color: "var(--c-muted)",
          lineHeight: 1.55,
          padding: "0 16px 10px",
          margin: 0,
        }}
      >
        AI merekomendasikan siapa yang paling cocok untuk task di Backlog.
      </p>
 
      {/* Rekomendasikan button — full bleed */}
      <button
        onClick={handleRecommend}
        disabled={isRecommendLoading || backlogTaskIds.length === 0}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          width: "100%",
          padding: "10px 16px",
          fontSize: "12px",
          fontWeight: 700,
          background: "var(--c-raised)",
          border: "none",
          borderTop: "1px solid var(--c-border)",
          color: "var(--c-accent)",
          cursor: isRecommendLoading || backlogTaskIds.length === 0 ? "not-allowed" : "pointer",
          opacity: isRecommendLoading || backlogTaskIds.length === 0 ? 0.4 : 1,
          letterSpacing: "0.01em",
          transition: "background 0.12s, opacity 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!isRecommendLoading && backlogTaskIds.length > 0)
            (e.currentTarget as HTMLElement).style.background =
              "color-mix(in srgb, var(--c-accent) 10%, transparent)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--c-raised)";
        }}
      >
        {isRecommendLoading ? (
          <>
            <span
              style={{
                width: "11px",
                height: "11px",
                border: "2px solid var(--c-accent-bd)",
                borderTopColor: "var(--c-accent)",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.7s linear infinite",
              }}
            />
            Menganalisis...
          </>
        ) : (
          <>
            <svg width="10" height="10" viewBox="0 0 8 8" fill="currentColor">
              <path d="M4 0l.9 2.7H8L5.5 4.4l.9 2.7L4 5.5 1.6 7.1l.9-2.7L0 2.7h3.1z"/>
            </svg>
            Rekomendasikan ({backlogTaskIds.length} task)
          </>
        )}
      </button>
    </div>
 
    {/* ── Saran AI ── */}
    <div className="flex-1" style={{ overflowY: "auto" }}>
      {/* Sticky label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px 8px",
          position: "sticky",
          top: 0,
          background: "var(--c-surface)",
          borderBottom: "1px solid var(--c-border)",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--c-muted)",
          }}
        >
          Saran AI
        </span>
        {pending.length > 0 && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              padding: "1px 8px",
              borderRadius: "99px",
              background: "var(--c-accent-bg)",
              border: "1px solid var(--c-accent-bd)",
              color: "var(--c-accent)",
            }}
          >
            {pending.length}
          </span>
        )}
      </div>
 
      {/* Empty state */}
      {pending.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 24px",
            textAlign: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--c-accent-bg)",
              border: "1px solid var(--c-accent-bd)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 8 8" fill="var(--c-accent)">
              <path d="M4 0l.9 2.7H8L5.5 4.4l.9 2.7L4 5.5 1.6 7.1l.9-2.7L0 2.7h3.1z"/>
            </svg>
          </div>
          <p style={{ fontSize: "11px", color: "var(--c-muted)", lineHeight: 1.6, maxWidth: "170px", margin: 0 }}>
            Generate tasks atau rekomendasi untuk mendapatkan saran AI.
          </p>
        </div>
      ) : (
        /* Suggestion cards — full bleed */
        <div>
          {pending.map((s) => {
            const meta = s.metadata as { taskId?: string; userId?: string; score?: number } | undefined;
            const isRecommendation = s.type === "recommendation";
            const memberName = meta?.userId ? memberMap[meta.userId] : null;
            const taskTitle = meta?.taskId ? taskMap[meta.taskId] : null;
 
            return (
              <div
                key={s.id}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--c-border)",
                }}
              >
                {/* Type pill + score */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "2px 7px",
                      borderRadius: "4px",
                      background: "var(--c-accent-bg)",
                      border: "1px solid var(--c-accent-bd)",
                      color: "var(--c-accent)",
                    }}
                  >
                    {s.type}
                  </span>
                  {meta?.score !== undefined && (
                    <span style={{ fontSize: "10px", color: "var(--c-muted)" }}>
                      {meta.score}% cocok
                    </span>
                  )}
                </div>
 
                {isRecommendation && taskTitle && (
                  <p
                    style={{
                      fontSize: "10px",
                      color: "var(--c-muted)",
                      marginBottom: "2px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Task: <span style={{ color: "var(--c-text)" }}>{taskTitle}</span>
                  </p>
                )}
                {isRecommendation && memberName && (
                  <p style={{ fontSize: "10px", color: "var(--c-muted)", marginBottom: "6px" }}>
                    Assign ke:{" "}
                    <span style={{ fontWeight: 600, color: "var(--c-text)" }}>{memberName}</span>
                  </p>
                )}
 
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--c-muted)",
                    lineHeight: 1.6,
                    marginBottom: isRecommendation && meta?.taskId && meta?.userId ? "8px" : 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {s.body}
                </p>
 
                {isRecommendation && meta?.taskId && meta?.userId && (
                  <button
                    onClick={() => handleAccept(s)}
                    disabled={acceptingId === s.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      width: "100%",
                      padding: "7px 0",
                      fontSize: "10px",
                      fontWeight: 700,
                      borderRadius: "6px",
                      border: "none",
                      background: "var(--c-accent)",
                      color: "var(--c-bg)",
                      cursor: acceptingId === s.id ? "not-allowed" : "pointer",
                      opacity: acceptingId === s.id ? 0.5 : 1,
                      letterSpacing: "0.01em",
                      transition: "opacity 0.15s",
                    }}
                  >
                    {acceptingId === s.id ? (
                      <>
                        <span
                          style={{
                            width: "10px",
                            height: "10px",
                            border: "1.5px solid rgba(0,0,0,0.2)",
                            borderTopColor: "black",
                            borderRadius: "50%",
                            display: "inline-block",
                            animation: "spin 0.7s linear infinite",
                          }}
                        />
                        Menerima...
                      </>
                    ) : (
                      <>
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Terima & Assign
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
</aside>
  );
}
