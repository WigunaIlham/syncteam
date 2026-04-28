import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";
import { HoverRow } from "@/components/ui/HoverRow";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: ownedProjects } = await supabase
    .from("projects")
    .select("id, name, description, status, start_date, end_date, sprint_count, created_at, owner_id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const { data: memberIds } = await supabase
    .from("project_members").select("project_id").eq("user_id", user.id);

  const ownedIds = (ownedProjects ?? []).map((p) => p.id);
  const memberProjectIds = (memberIds ?? []).map((r) => r.project_id).filter((id) => !ownedIds.includes(id));

  const { data: memberProjects } = memberProjectIds.length > 0
    ? await supabase
        .from("projects")
        .select("id, name, description, status, start_date, end_date, sprint_count, created_at, owner_id")
        .in("id", memberProjectIds).order("created_at", { ascending: false })
    : { data: [] };

  const allProjects = [
    ...(ownedProjects ?? []).map((p) => ({ ...p, isOwner: true })),
    ...(memberProjects ?? []).map((p) => ({ ...p, isOwner: false })),
  ];

  const STATUS_COLOR: Record<string, string> = {
    active: "var(--c-green)",
    completed: "var(--c-accent)",
    archived: "var(--c-muted)",
  };

  const STATUS_LABEL: Record<string, string> = {
    active: "Aktif",
    completed: "Selesai",
    archived: "Diarsipkan",
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--c-text)" }}
          >
            Semua Proyek
          </h1>
          <p
            className="text-sm"
            style={{
              color: "var(--c-muted)",
              marginTop: "4px",
            }}
          >
            {allProjects.length} proyek
          </p>
        </div>

        <Link
          href="/projects/new"
          className="flex items-center gap-2 text-sm font-semibold rounded-xl transition-all"
          style={{
            padding: "10px 16px",
            background: "var(--c-accent)",
            color: "#000",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 1v10M1 6h10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Buat Proyek
        </Link>
      </div>

      {/* ── Content ── */}
      {allProjects.length === 0 ? (
        <div
          style={{
            padding: "56px",
            textAlign: "center",
            borderRadius: "20px",
            background: "var(--c-surface)",
            border: "1px dashed var(--c-border)",
          }}
        >
          <p
            className="text-sm"
            style={{
              color: "var(--c-muted)",
              marginBottom: "12px",
            }}
          >
            Belum ada proyek.
          </p>

          <Link
            href="/projects/new"
            className="text-sm font-semibold hover:underline"
            style={{ color: "var(--c-accent)" }}
          >
            Buat proyek pertama Anda →
          </Link>
        </div>
      ) : (
        <div
          style={{
            overflow: "hidden",
            borderRadius: "20px",
            background: "var(--c-surface)",
            border: "1px solid var(--c-border)",
          }}
        >
          {allProjects.map((p, i) => (
            <Link key={p.id} href={`/projects/${p.id}/board`}>
              <HoverRow
                isLast={i === allProjects.length - 1}
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  cursor: "pointer",
                }}
              >
                {/* Status Dot */}
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    flexShrink: 0,
                    borderRadius: "999px",
                    background: STATUS_COLOR[p.status] ?? "var(--c-muted)",
                  }}
                />

                {/* Name + Description */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--c-text)" }}
                    >
                      {p.name}
                    </span>

                    {p.isOwner && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider shrink-0 rounded"
                        style={{
                          padding: "2px 6px",
                          color: "var(--c-accent)",
                          background: "var(--c-accent-bg)",
                          border: "1px solid var(--c-accent-bd)",
                        }}
                      >
                        Owner
                      </span>
                    )}
                  </div>

                  {p.description && (
                    <p
                      className="text-xs truncate"
                      style={{
                        color: "var(--c-muted)",
                        marginTop: "4px",
                      }}
                    >
                      {p.description}
                    </p>
                  )}
                </div>

                {/* Dates + Status */}
                <div
                  className="hidden sm:block"
                  style={{
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  <p className="text-xs" style={{ color: "var(--c-muted)" }}>
                    {formatDate(p.start_date)} — {formatDate(p.end_date)}
                  </p>

                  <p
                    className="text-[10px]"
                    style={{
                      marginTop: "4px",
                      color: STATUS_COLOR[p.status] ?? "var(--c-muted)",
                    }}
                  >
                    {STATUS_LABEL[p.status] ?? p.status}
                  </p>
                </div>

                {/* Arrow */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  style={{
                    flexShrink: 0,
                    color: "var(--c-faint)",
                  }}
                >
                  <path
                    d="M5 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </HoverRow>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}