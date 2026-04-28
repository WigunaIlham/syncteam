import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import InviteMemberModal from "@/components/project/InviteMemberModal";
import type { Profile } from "@/types";

export default async function MembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects").select("owner_id").eq("id", id).single();

  const isOwner = project?.owner_id === user.id;

  const { data: memberRows } = await supabase
    .from("project_members")
    .select("id, role_in_project, joined_at, user_id")
    .eq("project_id", id);

  const userIds = (memberRows ?? []).map((m) => m.user_id);
  const { data: profiles } = userIds.length > 0
    ? await supabase.from("profiles")
        .select("id, full_name, avatar_url, role, skills, xp_points, available_hours")
        .in("id", userIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p as Profile]));
  const members = (memberRows ?? [])
    .map((m) => ({ ...m, profile: profileMap.get(m.user_id) ?? null }))
    .sort((a, b) => (b.profile?.xp_points ?? 0) - (a.profile?.xp_points ?? 0));

  return (
    <div
  className="mx-auto"
  style={{
    maxWidth: "1200px",
    padding: "40px 32px 56px",
  }}
>
  {/* Header */}
  <div
    className="flex items-center justify-between"
    style={{
      marginBottom: "24px",
      paddingBottom: "14px",
      borderBottom: "1px solid var(--c-border)",
    }}
  >
    <div>
      <h2
        className="font-semibold"
        style={{
          color: "var(--c-text)",
          fontSize: "22px",
          lineHeight: 1.2,
          marginBottom: "10px",
        }}
      >
        Anggota Tim
      </h2>

      <p
        style={{
          color: "var(--c-muted)",
          fontSize: "14px",
          marginBottom: 4,
        
        }}
      >
        {members.length} anggota · diurutkan berdasarkan XP
      </p>
    </div>

    {isOwner && (
  <div
    style={{
      marginLeft: "28px",
      paddingLeft: "12px",
      flexShrink: 0,
      minWidth: "fit-content",
    }}
  >
    <InviteMemberModal projectId={id} />
  </div>
)}
  </div>

  {/* Members Card */}
  <div
    style={{
      background: "var(--c-surface)",
      border: "1px solid var(--c-border)",
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0 4px 18px rgba(0,0,0,.03)",
    }}
  >
    {members.length === 0 ? (
      <div
        style={{
          padding: "72px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "var(--c-muted)",
            fontSize: "14px",
            margin: 0,
          }}
        >
          Belum ada anggota tim.
        </p>
      </div>
    ) : (
      members.map((m, index) => {
        const profile = m.profile;
        if (!profile) return null;

        const initials = profile.full_name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return (
          <div
            key={m.id}
            className="flex items-center"
            style={{
              gap: "18px",
              padding: "22px 26px",
              borderBottom:
                index < members.length - 1
                  ? "1px solid var(--c-border)"
                  : "none",
              transition: "all .2s ease",
            }}
          >
            {/* Rank */}
            <div
              style={{
                width: "32px",
                flexShrink: 0,
                textAlign: "center",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--c-faint)",
              }}
            >
              #{index + 1}
            </div>

            {/* Avatar */}
            <div
              className="flex items-center justify-center"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                flexShrink: 0,
                fontSize: "13px",
                fontWeight: 700,
                background: "var(--c-accent-bg)",
                color: "var(--c-accent)",
                border: "1px solid var(--c-accent-bd)",
              }}
            >
              {initials}
            </div>

            {/* Info */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                className="flex items-center"
                style={{
                  gap: "10px",
                  marginBottom: "6px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    color: "var(--c-text)",
                    fontSize: "15px",
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                >
                  {profile.full_name}
                </span>

                {m.user_id === user.id && (
                  <span
                    style={{
                      background: "var(--c-accent-bg)",
                      color: "var(--c-accent)",
                      border: "1px solid var(--c-accent-bd)",
                      borderRadius: "999px",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      letterSpacing: ".04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Anda
                  </span>
                )}
              </div>

              <p
                style={{
                  color: "var(--c-muted)",
                  fontSize: "12px",
                  margin: 0,
                }}
              >
                {m.role_in_project ?? profile.role ?? "Anggota"}

                {profile.available_hours && (
                  <span style={{ color: "var(--c-faint)" }}>
                    {" "}
                    · {profile.available_hours}h/minggu
                  </span>
                )}
              </p>

              {profile.skills && profile.skills.length > 0 && (
                <div
                  className="flex flex-wrap"
                  style={{
                    gap: "8px",
                    marginTop: "12px",
                  }}
                >
                  {profile.skills.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      style={{
                        background: "var(--c-raised)",
                        color: "var(--c-muted)",
                        border: "1px solid var(--c-border)",
                        borderRadius: "999px",
                        padding: "5px 10px",
                        fontSize: "11px",
                        lineHeight: 1,
                      }}
                    >
                      {s}
                    </span>
                  ))}

                  {profile.skills.length > 4 && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--c-faint)",
                        alignSelf: "center",
                      }}
                    >
                      +{profile.skills.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* XP */}
            <div
              style={{
                minWidth: "70px",
                flexShrink: 0,
                textAlign: "right",
              }}
            >
              <div
                style={{
                  color: "var(--c-accent)",
                  fontWeight: 700,
                  fontSize: "18px",
                  lineHeight: 1,
                  marginBottom: "5px",
                }}
              >
                {profile.xp_points ?? 0}
              </div>

              <div
                style={{
                  color: "var(--c-muted)",
                  fontSize: "10px",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                }}
              >
                XP
              </div>
            </div>
          </div>
        );
      })
    )}
  </div>
</div>
  );
}
