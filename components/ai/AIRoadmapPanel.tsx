"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AIRoadmapPanel({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Gagal generate roadmap");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
  {error && (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "6px",
        fontSize: "11px",
        borderRadius: "8px",
        padding: "8px 12px",
        maxWidth: "240px",
        textAlign: "right",
        color: "var(--c-danger)",
        background: "var(--c-red-bg)",
        border: "1px solid color-mix(in srgb, var(--c-danger) 20%, transparent)",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M6 4v2.5M6 8v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      {error}
    </div>
  )}
  <button
    onClick={handleGenerate}
    disabled={isLoading}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "7px",
      padding: "8px 14px",
      fontSize: "12px",
      fontWeight: 700,
      borderRadius: "8px",
      background: "var(--c-accent-bg)",
      border: "1px solid var(--c-accent-bd)",
      color: "var(--c-accent)",
      cursor: isLoading ? "not-allowed" : "pointer",
      opacity: isLoading ? 0.4 : 1,
      letterSpacing: "0.01em",
      transition: "background 0.15s, opacity 0.15s",
    }}
    onMouseEnter={(e) => {
      if (!isLoading)
        (e.currentTarget as HTMLElement).style.background =
          "color-mix(in srgb, var(--c-accent) 20%, transparent)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.background = "var(--c-accent-bg)";
    }}
  >
    {isLoading ? (
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
        Generating Roadmap...
      </>
    ) : (
      <>
        <svg width="10" height="10" viewBox="0 0 8 8" fill="currentColor">
          <path d="M4 0l.9 2.7H8L5.5 4.4l.9 2.7L4 5.5 1.6 7.1l.9-2.7L0 2.7h3.1z"/>
        </svg>
        Generate AI Roadmap
      </>
    )}
  </button>
</div>
  );
}
