"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = async (provider: "google" | "github") => {
    setLoading(provider);
    setError(null);
    const supabase = createClient();
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (e) { setError(e.message); setLoading(null); }
  };

  return (
    <main
  className="min-h-screen flex items-center justify-center"
  style={{
    background: "var(--c-bg)",
    
  }}
>
  <div className="w-full max-w-[360px]">
  
    {/* Logo / Header */}
    <div style={{ textAlign: "center", marginBottom: "28px" }}>
    
      <div
        className="inline-flex items-center justify-center"
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "14px",
          marginBottom: "14px",
          background: "var(--c-accent-bg)",
          color: "var(--c-accent)",
          border: "1px solid var(--c-accent-bd)",
          fontSize: "18px",
          fontWeight: 700,
        }}
      >
        S
      </div>

      <h1
        style={{
          margin: "0 0 6px",
          fontSize: "22px",
          fontWeight: 700,
          lineHeight: 1.15,
          color: "var(--c-text)",
          marginBottom: "8px",
        }}
      >
        Masuk ke SyncTeam
      </h1>

      <p
        style={{
          margin: 0,
          fontSize: "14px",
          color: "var(--c-muted)",
        }}
      >
        Kolaborasi tim berbasis AI
      </p>
    </div>

    {/* Card */}
    <div
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        borderRadius: "22px",
        padding: "32px",
        boxShadow: "0 6px 24px rgba(0,0,0,.04)",
      }}
    >
      {error && (
        <div
          className="flex items-center"
          style={{
            gap: "10px",
            marginBottom: "20px",
            padding: "14px 16px",
            borderRadius: "14px",
            background: "var(--c-red-bg)",
            border: "1px solid rgba(239,68,68,.18)",
            color: "var(--c-red)",
            fontSize: "12px",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M6 4v2.5M6 8v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {/* Google */}
        <button
          onClick={() => handleOAuth("google")}
          disabled={loading !== null}
          className="w-full flex items-center justify-center transition-all disabled:opacity-50"
          style={{
            gap: "12px",
            height: "52px",
            padding: "0 18px",
            borderRadius: "14px",
            background: "var(--c-raised)",
            color: "var(--c-text)",
            border: "1px solid var(--c-border)",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {loading === "google" ? (
            <span
              className="w-4 h-4 border-2 rounded-full animate-spin"
              style={{
                borderColor:"var(--c-border)",
                borderTopColor:"var(--c-muted)"
              }}
            />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Lanjutkan dengan Google
        </button>

        {/* Github */}
        <button
          onClick={() => handleOAuth("github")}
          disabled={loading !== null}
          className="w-full flex items-center justify-center transition-all disabled:opacity-50"
          style={{
            gap: "12px",
            height: "52px",
            padding: "0 18px",
            borderRadius: "14px",
            background: "var(--c-raised)",
            color: "var(--c-text)",
            border: "1px solid var(--c-border)",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {loading === "github" ? (
            <span
              className="w-4 h-4 border-2 rounded-full animate-spin"
              style={{
                borderColor:"var(--c-border)",
                borderTopColor:"var(--c-muted)"
              }}
            />
          ) : (
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .319.192.694.801.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
</svg>
          )}
          Lanjutkan dengan GitHub
        </button>
      </div>
    </div>

    <p
      style={{
        textAlign: "center",
        marginTop: "22px",
        fontSize: "12px",
        color: "var(--c-muted)",
      }}
    >
      Belum punya akun?{" "}
      <Link
        href="/register"
        className="hover:underline"
        style={{
          color: "var(--c-accent)",
          fontWeight: 600,
        }}
      >
        Daftar sekarang
      </Link>
    </p>
  </div>
</main>
  );
}
