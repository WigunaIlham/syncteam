"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type InviteMethod = "email" | "github";

interface Props {
  projectId: string;
}

export default function InviteMemberModal({ projectId }: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<InviteMethod>("email");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);

    const body =
      method === "email"
        ? { email: value.trim() }
        : { github_username: value.trim().replace(/^@/, "") };

    try {
      const res = await fetch(`/api/projects/${projectId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = (await res.json()) as {
        data?: { message: string; fullName: string };
        error?: string;
      };

      if (!res.ok) {
        setError(json.error ?? "Gagal mengundang anggota.");
      } else {
        setSuccess(json.data?.message ?? "Berhasil ditambahkan.");
        setValue("");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setValue("");
    setError(null);
    setSuccess(null);
  }

  function handleMethodChange(m: InviteMethod) {
    setMethod(m);
    setValue("");
    setError(null);
    setSuccess(null);
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center font-semibold transition-all"
        style={{
          gap: "8px",
          padding: "10px 18px",
          fontSize: "13px",
          borderRadius: "14px",
          background: "var(--c-accent-bg)",
          color: "var(--c-accent)",
          border: "1px solid var(--c-accent-bd)",
          boxShadow: "0 1px 3px rgba(0,0,0,.04)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 1v10M1 6h10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        Undang Anggota
      </button>

      {open && (
        <div
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--c-surface)",
              border: "1px solid var(--c-border)",
              borderRadius: "24px",
              padding: "30px",
              width: "100%",
              maxWidth: "460px",
              margin: "20px",
              boxShadow: "0 20px 60px rgba(0,0,0,.18)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-start justify-between"
              style={{
                marginBottom: "24px",
              }}
            >
              <div>
                <h3
                  style={{
                    color: "var(--c-text)",
                    fontWeight: 700,
                    fontSize: "18px",
                    marginBottom: "6px",
                    lineHeight: 1.2,
                  }}
                >
                  Undang Anggota Tim
                </h3>

                <p
                  style={{
                    color: "var(--c-muted)",
                    fontSize: "13px",
                    margin: 0,
                  }}
                >
                  Cari via email atau username GitHub
                </p>
              </div>

              <button
                onClick={handleClose}
                className="flex items-center justify-center transition-colors"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  color: "var(--c-muted)",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M1 1l10 10M11 1L1 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div
              className="flex gap-1"
              style={{
                background: "var(--c-raised)",
                padding: "6px",
                borderRadius: "14px",
                marginBottom: "20px",
              }}
            >
              {(["email", "github"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => handleMethodChange(m)}
                  className="flex-1 flex items-center justify-center gap-2 transition-all"
                  style={{
                    padding: "10px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    background:
                      method === m
                        ? "var(--c-surface)"
                        : "transparent",
                    color:
                      method === m
                        ? "var(--c-text)"
                        : "var(--c-muted)",
                    boxShadow:
                      method === m
                        ? "0 1px 2px rgba(0,0,0,.04)"
                        : "none",
                  }}
                >
                  {m === "email" ? (
                    <>
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <rect
                          x="1"
                          y="2.5"
                          width="10"
                          height="7"
                          rx="1.5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M1 4l5 3.5L11 4"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                      Email
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                      GitHub
                    </>
                  )}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--c-muted)",
                    marginBottom: "8px",
                  }}
                >
                  {method === "email"
                    ? "Alamat Email"
                    : "Username GitHub"}
                </label>

                <div className="relative">
                  {method === "github" && (
                    <span
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--c-muted)",
                        fontWeight: 600,
                      }}
                    >
                      @
                    </span>
                  )}

                  <input
                    type={method === "email" ? "email" : "text"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={
                      method === "email"
                        ? "nama@email.com"
                        : "username"
                    }
                    required
                    className="w-full"
                    style={{
                      background: "var(--c-raised)",
                      border: "1px solid var(--c-border)",
                      borderRadius: "14px",
                      padding:
                        method === "github"
                          ? "12px 14px 12px 36px"
                          : "12px 14px",
                      fontSize: "14px",
                      color: "var(--c-text)",
                      outline: "none",
                    }}
                  />
                </div>

                {method === "github" && (
                  <p
                    style={{
                      marginTop: "8px",
                      fontSize: "11px",
                      color: "var(--c-muted)",
                    }}
                  >
                    Hanya untuk akun yang login via GitHub OAuth
                  </p>
                )}
              </div>

              {error && (
                <div
                  style={{
                    padding: "11px 13px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "var(--c-danger)",
                    background: "var(--c-red-bg)",
                    border: "1px solid rgba(255,0,0,.08)",
                  }}
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  style={{
                    padding: "11px 13px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "var(--c-green)",
                    background: "var(--c-green-bg)",
                    border: "1px solid rgba(0,160,0,.08)",
                  }}
                >
                  {success}
                </div>
              )}

              <div
                className="flex gap-3"
                style={{
                  paddingTop: "6px",
                }}
              >
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1"
                  style={{
                    padding: "11px 0",
                    borderRadius: "12px",
                    border: "1px solid var(--c-border)",
                    background: "transparent",
                    color: "var(--c-muted)",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading || !value.trim()}
                  className="flex-1"
                  style={{
                    padding: "11px 0",
                    borderRadius: "12px",
                    border: "none",
                    background: "var(--c-accent)",
                    color: "var(--c-bg)",
                    fontSize: "12px",
                    fontWeight: 700,
                    opacity:
                      loading || !value.trim()
                        ? 0.45
                        : 1,
                    cursor:
                      loading || !value.trim()
                        ? "not-allowed"
                        : "pointer",
                    boxShadow:"0 1px 2px rgba(0,0,0,.06)"
                  }}
                >
                  {loading ? "Mengundang..." : "Undang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}