import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const { data: memberIds } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", user.id);

  const projectIds = (memberIds ?? []).map((r) => r.project_id);

  const { data: ownedProjects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("owner_id", user.id)
    .eq("status", "active");

  const { data: memberProjects } = projectIds.length > 0
    ? await supabase
        .from("projects")
        .select("id, name")
        .in("id", projectIds)
        .eq("status", "active")
    : { data: [] };

  const ownedIds = (ownedProjects ?? []).map((p) => p.id);
  const allProjects = [
    ...(ownedProjects ?? []),
    ...(memberProjects ?? []).filter((p) => !ownedIds.includes(p.id)),
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        projects={allProjects}
        userName={profile?.full_name ?? user.email ?? "User"}
        userEmail={profile?.email ?? user.email}
      />
      <main style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}