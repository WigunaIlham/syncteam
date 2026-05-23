import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AIRoadmapPanel from "@/components/ai/AIRoadmapPanel";
import { formatDate } from "@/lib/utils/date";

interface SprintItem { title: string; estimatedHours: number; priority: string; }
interface SprintFromRoadmap {
  sprintNumber: number; name: string; startDate: string; endDate: string;
  focus: string; milestones: string[]; suggestedTasks: SprintItem[];
}
interface RoadmapContent {
  sprints: SprintFromRoadmap[]; totalEstimatedHours: number; riskFactors: string[];
}

export default async function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects").select("owner_id").eq("id", id).single();
  const isOwner = project?.owner_id === user.id;

  const { data: sprints } = await supabase
    .from("sprints").select("*").eq("project_id", id)
    .order("sprint_number", { ascending: true });

  const { data: roadmap } = await supabase
    .from("roadmaps").select("content").eq("project_id", id)
    .order("version", { ascending: false }).limit(1).single();

  const roadmapContent = roadmap?.content as RoadmapContent | null;

  return (
    <div
  style={{
    maxWidth: "1200px",
    padding: "40px 32px 56px",
  }}
>
  {/* Header */}
  <div
    className="flex items-center justify-between"
    style={{
      marginBottom: "36px",
      gap: "24px",
    }}
  >
    <div>
      <h2
        style={{
          margin: 0,
          fontSize: "22px",
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: "8px",
          color: "var(--c-text)",
        }}
      >
        Timeline & Roadmap
      </h2>

      <p
        style={{
          margin: 0,
          fontSize: "14px",
          color: "var(--c-muted)",
        }}
      >
        Sprint planning dan AI-generated roadmap
      </p>
    </div>

    {isOwner && <AIRoadmapPanel projectId={id} />}
  </div>


  {/* Sprint Progress */}
  {sprints && sprints.length > 0 && (
    <section style={{ marginBottom: "44px" }}>
      <h3
        style={{
          margin: 0,
          marginBottom: "16px",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "var(--c-muted)",
        }}
      >
        Sprint Progress
      </h3>

      <div className="space-y-4">
        {sprints.map((sprint) => (
          <div
            key={sprint.id}
            style={{
              background: "var(--c-surface)",
              border: "1px solid var(--c-border)",
              borderRadius: "22px",
              padding: "24px 28px",
              boxShadow: "0 4px 18px rgba(0,0,0,.03)",
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                marginBottom: "14px",
              }}
            >
              <div
                className="flex items-center"
                style={{
                  gap: "14px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--c-text)",
                  }}
                >
                  {sprint.name ?? `Sprint ${sprint.sprint_number}`}
                </span>

                <span
                  style={{
                    fontSize: "10px",
                    padding: "5px 10px",
                    borderRadius: "999px",
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    background:
                      sprint.status === "completed"
                        ? "var(--c-green-bg)"
                        : "var(--c-amber-bg)",
                    color:
                      sprint.status === "completed"
                        ? "var(--c-green)"
                        : "var(--c-amber)",
                    border:
                      sprint.status === "completed"
                        ? "1px solid rgba(34,197,94,.18)"
                        : "1px solid rgba(245,158,11,.18)",
                  }}
                >
                  {sprint.status === "completed"
                    ? "Selesai"
                    : "Aktif"}
                </span>
              </div>

              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--c-accent)",
                }}
              >
                {sprint.progress_snapshot}%
              </span>
            </div>

            <p
              style={{
                margin: 0,
                marginBottom: "16px",
                fontSize: "12px",
                color: "var(--c-muted)",
              }}
            >
              {formatDate(sprint.start_date)} —{" "}
              {formatDate(sprint.end_date)}
            </p>

            <div
              style={{
                height: "8px",
                borderRadius: "999px",
                background: "var(--c-raised)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${sprint.progress_snapshot}%`,
                  height: "100%",
                  borderRadius: "999px",
                  background: "var(--c-accent)",
                  transition: "all .45s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )}


  {/* Empty State */}
  {(!sprints || sprints.length === 0) && !roadmapContent && (
    <div
      style={{
        background: "var(--c-surface)",
        border: "1px dashed var(--c-border)",
        borderRadius: "24px",
        padding: "70px 30px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "999px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 18px",
          background: "var(--c-accent-bg)",
          border: "1px solid var(--c-accent-bd)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 8 8" fill="var(--c-accent)">
          <path d="M4 0l.9 2.7H8L5.5 4.4l.9 2.7L4 5.5 1.6 7.1l.9-2.7L0 2.7h3.1z"/>
        </svg>
      </div>

      <p
        style={{
          margin: 0,
          marginBottom: "8px",
          fontWeight: 600,
          color: "var(--c-text)",
        }}
      >
        Belum ada roadmap
      </p>

      <p
        style={{
          margin: 0,
          maxWidth: "420px",
          marginInline: "auto",
          fontSize: "13px",
          lineHeight: 1.7,
          color: "var(--c-muted)",
        }}
      >
        {isOwner
          ? 'Klik "Generate AI Roadmap" di atas untuk membuat sprint otomatis.'
          : "Owner proyek belum membuat roadmap."}
      </p>
    </div>
  )}


  {/* AI Roadmap */}
  {roadmapContent && (
    <section>
      <div
        className="flex items-center"
        style={{
          gap: "14px",
          marginBottom: "22px",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "7px 12px",
            borderRadius: "999px",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            background: "var(--c-accent-bg)",
            color: "var(--c-accent)",
            border: "1px solid var(--c-accent-bd)",
          }}
        >
          AI Roadmap
        </span>

        {roadmapContent.totalEstimatedHours && (
          <span
            style={{
              fontSize: "13px",
              color: "var(--c-muted)",
            }}
          >
            ~{roadmapContent.totalEstimatedHours} jam total
          </span>
        )}
      </div>


      {/* Sprint Roadmap Grid */}
      <div
        className="grid grid-cols-1 xl:grid-cols-2"
        style={{
          gap: "24px",
          marginBottom: "42px",
          
        }}
      >
        {roadmapContent.sprints?.map((sprint) => (
          <div
            key={sprint.sprintNumber}
            style={{
              background: "var(--c-surface)",
              border: "1px solid var(--c-border)",
              borderRadius: "22px",
              padding: "28px",
              boxShadow: "0 4px 18px rgba(0,0,0,.03)",
            }}
          >
            <div
              className="flex items-start justify-between"
              style={{
                marginBottom: "18px",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    marginBottom: "8px",
                    fontSize: "11px",
                    color: "var(--c-muted)",
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                  }}
                >
                  Sprint {sprint.sprintNumber}
                </p>

                <h4
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--c-text)",
                  }}
                >
                  {sprint.name}
                </h4>

                {sprint.focus && (
                  <p
                    style={{
                      marginTop: "8px",
                      marginBottom: 0,
                      fontSize: "13px",
                      color: "var(--c-accent)",
                    }}
                  >
                    {sprint.focus}
                  </p>
                )}
              </div>

              <div
                style={{
                  fontSize: "11px",
                  textAlign: "right",
                  color: "var(--c-muted)",
                }}
              >
                {sprint.startDate}<br/>
                {sprint.endDate}
              </div>
            </div>


            {sprint.milestones?.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    marginBottom: "10px",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    color: "var(--c-muted)",
                  }}
                >
                  Milestones
                </p>

                <div className="flex flex-wrap gap-2">
                  {sprint.milestones.map((m,i)=>(
                    <span
                      key={i}
                      style={{
                        padding:"6px 10px",
                        borderRadius:"10px",
                        background:"var(--c-raised)",
                        border:"1px solid var(--c-border)",
                        fontSize:"11px",
                        color:"var(--c-text)"
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}


            {sprint.suggestedTasks?.length > 0 && (
              <div
                style={{
                  paddingTop:"18px",
                  borderTop:"1px solid var(--c-border)"
                }}
              >
                <p
                  style={{
                    marginBottom:"14px",
                    fontSize:"11px",
                    letterSpacing:".08em",
                    textTransform:"uppercase",
                    color:"var(--c-muted)"
                  }}
                >
                  Suggested Tasks
                </p>

                <div style={{
  display:"flex",
  flexDirection:"column",
  gap:"14px"
}}>
                  {sprint.suggestedTasks.slice(0,4).map((t,i)=>(
                    <div
                      key={i}
                      className="flex items-center justify-between"
                      style={{
                        padding:"10px 12px",
                        background:"var(--c-raised)",
                        borderRadius:"10px",
                        gap:"16px"
                      }}
                    >
                      <span
                        style={{
                          fontSize:"13px",
                          color:"var(--c-text)"
                        }}
                      >
                        {t.title}
                      </span>

                      <span
                        style={{
                          fontSize:"11px",
                          fontWeight:600,
                          color:"var(--c-muted)"
                        }}
                      >
                        {t.estimatedHours}h
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>


      {/* Risks */}
      {roadmapContent.riskFactors?.length > 0 && (
        <div>
          <h3
            style={{
              marginBottom:"16px",
              fontSize:"11px",
              fontWeight:700,
              letterSpacing:".12em",
              textTransform:"uppercase",
              color:"var(--c-muted)"
            }}
          >
            Risk Factors
          </h3>

          <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  }}
>
  {roadmapContent.riskFactors.map((risk, i) => (
    <div
      key={i}
      className="flex items-start"
      style={{
        
        gap: "16px",
        padding: "10px 16px",
        borderRadius: "18px",
        background: "var(--c-red-bg)",
        border: "1px solid rgba(239,68,68,.15)",
      }}
    >
      <div
        style={{
          width: "20px",
          paddingTop: "2px",
          flexShrink: 0,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            color: "var(--c-red)",
          }}
        >
          <path
            d="M6 1L11.2 10H.8L6 1z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path
            d="M6 5v2.5M6 9v.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: "13px",
          lineHeight: 1.85,
          color: "var(--c-text)",
          maxWidth: "92%",
        }}
      >
        {risk}
      </p>
    </div>
  ))}
</div>
        </div>
      )}
    </section>
  )}
</div>
  );
}
