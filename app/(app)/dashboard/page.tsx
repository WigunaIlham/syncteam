import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";
import type { Project } from "@/types";
import { HoverRow } from "@/components/ui/HoverRow";

const STATUS_DOT: Record<string, string> = {
  backlog:     "var(--c-muted)",
  in_progress: "var(--c-amber)",
  completed:   "var(--c-green)",
};

const PRIORITY_COLOR: Record<string, string> = {
  high:   "var(--c-red)",
  medium: "var(--c-amber)",
  low:    "var(--c-muted)",
};

const PRIORITY_BG: Record<string, string> = {
  high:   "var(--c-red-bg)",
  medium: "var(--c-amber-bg)",
  low:    "transparent",
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "Tinggi", medium: "Sedang", low: "Rendah",
};

const STATUS_LABEL: Record<string, string> = {
  backlog: "Backlog", in_progress: "In Progress", completed: "Selesai",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, xp_points, role")
    .eq("id", user.id)
    .single();

  const { data: memberIds } = await supabase
    .from("project_members").select("project_id").eq("user_id", user.id);

  const { data: ownedProjects } = await supabase
    .from("projects")
    .select("id, name, status, start_date, end_date, owner_id, sprint_count, created_at, description")
    .eq("owner_id", user.id).eq("status", "active");

  const ownedIds = (ownedProjects ?? []).map((p) => p.id);
  const memberProjectIds = (memberIds ?? []).map((r) => r.project_id).filter((id) => !ownedIds.includes(id));

  const { data: memberProjects } = memberProjectIds.length > 0
    ? await supabase
        .from("projects")
        .select("id, name, status, start_date, end_date, owner_id, sprint_count, created_at, description")
        .in("id", memberProjectIds).eq("status", "active")
    : { data: [] };

  const projects: Project[] = [...(ownedProjects ?? []), ...(memberProjects ?? [])] as Project[];

  const { data: myTasks } = await supabase
    .from("tasks").select("id, title, status, priority, due_date, project_id")
    .eq("assigned_to", user.id).neq("status", "completed")
    .order("created_at", { ascending: false }).limit(6);

  const firstName = profile?.full_name?.split(" ")[0] ?? "User";

  return (
    <div style={{ width: "100%", padding: "40px", display: "flex", flexDirection: "column", gap: "15px" }}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between" style={{ gap: "32px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--c-text)" }}>
            Halo, {firstName}
          </h1>
          <p className="text-sm" style={{ color: "var(--c-muted)" }}>
            {profile?.role ?? (
              <Link href="/profile" style={{ color: "var(--c-accent)" }} className="hover:underline">
                Setup profil Anda →
              </Link>
            )}
          </p>
        </div>

        {/* XP Card */}
        <div
          className="flex flex-col items-center justify-center rounded-2xl shrink-0"
          style={{
            padding: "16px 24px",
            background: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            minWidth: "96px",
          }}
        >
          <p className="text-3xl font-bold tabular-nums" style={{ color: "var(--c-accent)" }}>
            {profile?.xp_points ?? 0}
          </p>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--c-muted)", marginTop: "4px" }}>
            XP Points
          </p>
        </div>
      </div>

      {/* ── Proyek Aktif ── */}
      <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--c-muted)" }}>
              Proyek Aktif
            </h2>
            <span
              className="text-[10px] rounded font-semibold tabular-nums"
              style={{
                padding: "2px 6px",
                background: "var(--c-raised)",
                color: "var(--c-muted)",
              }}
            >
              {projects.length}
            </span>
          </div>

          <Link
            href="/projects/new"
            className="text-xs flex items-center gap-1.5 font-semibold rounded-lg transition-all"
            style={{
              padding: "8px 14px",
              color: "var(--c-accent)",
              background: "var(--c-accent-bg)",
              border: "1px solid var(--c-accent-bd)",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Buat Proyek
          </Link>
        </div>

        {projects.length === 0 ? (
          <div
            className="rounded-2xl text-center"
            style={{
              padding: "48px",
              background: "var(--c-surface)",
              border: "1px dashed var(--c-border)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--c-muted)" }}>
              Belum ada proyek aktif.{" "}
              <Link href="/projects/new" style={{ color: "var(--c-accent)" }} className="hover:underline">
                Buat proyek pertama Anda
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}/board`} className="block group">
                <div
                  className="rounded-2xl overflow-hidden flex h-full min-h-[148px] transition-all card-hover"
                  style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
                >
                  <div style={{ width: "3px", flexShrink: 0, background: "var(--c-green)" }} />

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      padding: "20px",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold leading-snug" style={{ color: "var(--c-text)" }}>
                        {p.name}
                      </h3>
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "999px",
                          flexShrink: 0,
                          marginTop: "4px",
                          background: "var(--c-green)",
                        }}
                      />
                    </div>

                    {p.description && (
                      <p className="text-xs line-clamp-3 leading-relaxed" style={{ color: "var(--c-muted)" }}>
                        {p.description}
                      </p>
                    )}

                    <p className="text-[10px]" style={{ color: "var(--c-faint)", marginTop: "auto", paddingTop: "8px" }}>
                      {formatDate(p.start_date)} — {formatDate(p.end_date)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Tugas Saya ── */}
      <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--c-muted)" }}>
            Tugas Saya
          </h2>
          {myTasks && myTasks.length > 0 && (
            <span
              className="text-[10px] rounded font-semibold tabular-nums"
              style={{
                padding: "2px 6px",
                background: "var(--c-raised)",
                color: "var(--c-muted)",
              }}
            >
              {myTasks.length}
            </span>
          )}
        </div>

        {!myTasks || myTasks.length === 0 ? (
          <div
            className="rounded-2xl text-center"
            style={{
              padding: "48px",
              background: "var(--c-surface)",
              border: "1px dashed var(--c-border)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--c-muted)" }}>
              Tidak ada tugas yang ditugaskan ke Anda.
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
          >
            {myTasks.map((task, i) => (
              <HoverRow
                key={task.id}
                isLast={i === myTasks.length - 1}
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "999px",
                    flexShrink: 0,
                    background: STATUS_DOT[task.status] ?? "var(--c-muted)",
                  }}
                />

                <span className="text-sm flex-1 truncate" style={{ color: "var(--c-text)" }}>
                  {task.title}
                </span>

                {task.priority && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest rounded shrink-0"
                    style={{
                      padding: "2px 8px",
                      color: PRIORITY_COLOR[task.priority] ?? "var(--c-muted)",
                      background: PRIORITY_BG[task.priority] ?? "var(--c-raised)",
                    }}
                  >
                    {PRIORITY_LABEL[task.priority] ?? task.priority}
                  </span>
                )}

                <span className="text-[10px] shrink-0 hidden sm:block" style={{ color: "var(--c-faint)" }}>
                  {STATUS_LABEL[task.status] ?? task.status}
                </span>

                {task.due_date && (
                  <span className="text-xs shrink-0" style={{ color: "var(--c-muted)" }}>
                    {formatDate(task.due_date)}
                  </span>
                )}
              </HoverRow>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}