import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils/date";
import type { Profile } from "@/types";

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: memberRows } = await supabase
    .from("project_members")
    .select("user_id")
    .eq("project_id", id);

  const memberUserIds = (memberRows ?? []).map((m) => m.user_id);

  const { data: profiles } =
    memberUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, xp_points")
          .in("id", memberUserIds)
      : { data: [] };

  const leaderboard = (profiles ?? []).sort(
    (a, b) => (b.xp_points ?? 0) - (a.xp_points ?? 0)
  ) as Profile[];

  const { data: rewards } = await supabase
    .from("reward_history")
    .select("user_id, points, reason, type, created_at")
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name])
  );

  return (
    <div
      style={{
        maxWidth: "1200px",
    padding: "40px 32px 56px",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "36px",
      gap: "24px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--c-text)",
            lineHeight: 1.2,
            marginBottom: "8px",
          }}
        >
          Laporan & XP
        </h2>

        <p
          style={{
            margin: 0,
            fontSize: "14px",
            color: "var(--c-muted)",
          }}
        >
          Leaderboard dan riwayat reward anggota tim
        </p>
      </div>

      {/* Two Panels */}
      <div
        className="grid grid-cols-1 xl:grid-cols-2"
        style={{
          gap: "24px",
        }}
      >
        {/* Leaderboard */}
        <section>
          <div
            style={{
              marginBottom: "14px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--c-muted)",
              }}
            >
              Leaderboard XP
            </h3>
          </div>

          <div
            style={{
              background: "var(--c-surface)",
              border: "1px solid var(--c-border)",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 4px 18px rgba(0,0,0,.03)",
            }}
          >
            {leaderboard.length === 0 ? (
              <div
                style={{
                  padding: "70px 24px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "var(--c-muted)",
                  }}
                >
                  Belum ada data XP.
                </p>
              </div>
            ) : (
              leaderboard.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center"
                  style={{
                    gap: "18px",
                    padding: "22px 24px",
                    borderBottom:
                      i < leaderboard.length - 1
                        ? "1px solid var(--c-border)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: "14px",
                      color:
                        i === 0
                          ? "var(--c-accent)"
                          : i === 1
                          ? "var(--c-muted)"
                          : "var(--c-faint)",
                    }}
                  >
                    #{i + 1}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        color: "var(--c-text)",
                        fontSize: "15px",
                        fontWeight: 600,
                      }}
                    >
                      {p.full_name}
                    </div>
                  </div>

                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "16px",
                      color: "var(--c-accent)",
                    }}
                  >
                    {p.xp_points ?? 0}
                    <span
                      style={{
                        marginLeft: "6px",
                        fontSize: "11px",
                        color: "var(--c-muted)",
                      }}
                    >
                      XP
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Reward History */}
        <section>
          <div
            style={{
              marginBottom: "14px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--c-muted)",
              }}
            >
              Riwayat Reward
            </h3>
          </div>

          <div
            style={{
              background: "var(--c-surface)",
              border: "1px solid var(--c-border)",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 4px 18px rgba(0,0,0,.03)",
            }}
          >
            {!rewards || rewards.length === 0 ? (
              <div
                style={{
                  padding: "24px 24px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "var(--c-muted)",
                  }}
                >
                  Belum ada riwayat reward.
                </p>
              </div>
            ) : (
              rewards.map((r, i) => (
                <div
                  key={`${r.user_id}-${r.created_at}`}
                  className="flex items-start"
                  style={{
                    gap: "16px",
                    padding: "20px 24px",
                    borderBottom:
                      i < rewards.length - 1
                        ? "1px solid var(--c-border)"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "999px",
                      marginTop: "8px",
                      flexShrink: 0,
                      background:
                        r.type === "reward"
                          ? "var(--c-green)"
                          : "var(--c-red)",
                    }}
                  />

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--c-text)",
                        marginBottom: "6px",
                      }}
                    >
                      {profileMap.get(r.user_id) ?? "Unknown"}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "var(--c-muted)",
                        marginBottom: "8px",
                      }}
                    >
                      {r.reason}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "11px",
                        color: "var(--c-faint)",
                      }}
                    >
                      {formatDate(r.created_at)}
                    </p>
                  </div>

                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color:
                        r.type === "reward"
                          ? "var(--c-green)"
                          : "var(--c-red)",
                    }}
                  >
                    {r.type === "reward" ? "+" : ""}
                    {r.points}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}