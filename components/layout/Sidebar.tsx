"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/types";

interface SidebarProps {
  projects: Project[];
  userName: string;
  userEmail?: string;
}

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    href: "/projects",
    label: "Semua Proyek",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M1 4.5C1 3.12 2.12 2 3.5 2H6l1.5 2H13a1 1 0 011 1v7a1 1 0 01-1 1H3.5C2.12 13 1 11.88 1 10.5V4.5z" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profil Saya",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M2 13c0-2.76 2.46-5 5.5-5s5.5 2.24 5.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

function NavItem({ item, active }: { item: (typeof NAV_ITEMS)[0]; active: boolean }) {
  const [hovered, setHovered] = useState(false);
  const lit = active || hovered;

  return (
    <Link
      href={item.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "9px",
        padding: "7px 10px",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: active ? 600 : 400,
        textDecoration: "none",
        position: "relative",
        background: lit ? "var(--c-raised)" : "transparent",
        color: lit ? "var(--c-text)" : "var(--c-muted)",
        transition: "background 0.12s, color 0.12s",
      }}
    >
      {active && (
        <span
          style={{
            position: "absolute",
            left: 0,
            top: "20%",
            bottom: "20%",
            width: "2px",
            borderRadius: "0 2px 2px 0",
            background: "var(--c-accent)",
          }}
        />
      )}
      <span
        style={{
          width: "15px",
          height: "15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          opacity: active ? 1 : 0.6,
          color: active ? "var(--c-accent)" : "currentColor",
        }}
      >
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}

function ProjectItem({ project, active }: { project: Project; active: boolean }) {
  const [hovered, setHovered] = useState(false);
  const lit = active || hovered;

  return (
    <Link
      href={`/projects/${project.id}/board`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 10px",
        borderRadius: "7px",
        fontSize: "12px",
        fontWeight: active ? 500 : 400,
        textDecoration: "none",
        background: lit ? "var(--c-raised)" : "transparent",
        color: lit ? "var(--c-text)" : "var(--c-muted)",
        transition: "background 0.12s, color 0.12s",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          flexShrink: 0,
          background: active ? "var(--c-accent)" : "var(--c-faint)",
          transition: "background 0.12s",
        }}
      />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        # {project.name}
      </span>
    </Link>
  );
}

export default function Sidebar({ projects, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectHovered, setNewProjectHovered] = useState(false);
  const [logoutHovered, setLogoutHovered] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    router.push(`/projects/new?name=${encodeURIComponent(newProjectName)}`);
    setIsCreating(false);
    setNewProjectName("");
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        width: "220px",
        minWidth: "220px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--c-surface)",
        borderRight: "1px solid var(--c-border)",
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          padding: "16px 16px 14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderBottom: "1px solid var(--c-border)",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--c-accent-bg)",
            border: "1px solid var(--c-accent-bd)",
            color: "var(--c-accent)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "17px",
            fontWeight: 700,
          }}
        >
          S
        </div>
        <span
          style={{
            color: "var(--c-accent)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "0.01em",
          }}
        >
          SyncTeam
        </span>
      </div>

      {/* ── Nav ── */}
      <nav
        style={{
          padding: "8px 10px 4px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} item={item} active={pathname === item.href} />
        ))}
      </nav>

      {/* ── Divider ── */}
      <div style={{ height: "1px", background: "var(--c-border)", margin: "4px 0" }} />

      {/* ── Projects ── */}
      <div style={{ padding: "0 10px", flex: 1, overflowY: "auto" }}>
        <p
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--c-faint)",
            padding: "10px 10px 6px",
          }}
        >
          Proyek
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {projects.map((p) => (
            <ProjectItem
              key={p.id}
              project={p}
              active={pathname.startsWith(`/projects/${p.id}`)}
            />
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--c-border)", margin: "6px 4px" }} />

        {/* Quick create */}
        {isCreating ? (
          <div style={{ padding: "0 4px", marginTop: "4px" }}>
            <input
              autoFocus
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateProject();
                if (e.key === "Escape") setIsCreating(false);
              }}
              placeholder="Nama proyek..."
              style={{
                width: "100%",
                fontSize: "12px",
                padding: "6px 10px",
                borderRadius: "7px",
                outline: "none",
                background: "var(--c-raised)",
                border: "1px solid var(--c-accent)",
                color: "var(--c-text)",
              }}
            />
            <p
              style={{
                fontSize: "10px",
                marginTop: "4px",
                paddingLeft: "4px",
                color: "var(--c-muted)",
              }}
            >
              Enter untuk buat · Esc untuk batal
            </p>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            onMouseEnter={() => setNewProjectHovered(true)}
            onMouseLeave={() => setNewProjectHovered(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 10px",
              borderRadius: "7px",
              fontSize: "12px",
              cursor: "pointer",
              width: "100%",
              background: newProjectHovered ? "var(--c-accent-bg)" : "transparent",
              border: "none",
              color: newProjectHovered ? "var(--c-accent)" : "var(--c-muted)",
              marginTop: "2px",
              transition: "color 0.12s, background 0.12s",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 1v10M1 6h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Buat proyek baru
          </button>
        )}
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          padding: "10px 12px",
          borderTop: "1px solid var(--c-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        {/* User info */}
        <div style={{ display: "flex", alignItems: "center", gap: "9px", minWidth: 0 }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--c-accent-bg)",
              border: "1px solid var(--c-accent-bd)",
              color: "var(--c-accent)",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--c-text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                margin: 0,
              }}
            >
              {userName}
            </p>
            {userEmail && (
              <p
                style={{
                  fontSize: "10px",
                  color: "var(--c-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  margin: 0,
                }}
              >
                {userEmail}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            onMouseEnter={() => setLogoutHovered(true)}
            onMouseLeave={() => setLogoutHovered(false)}
            title="Keluar"
            style={{
              width: "27px",
              height: "27px",
              borderRadius: "7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: logoutHovered ? "var(--c-red-bg)" : "transparent",
              border: "none",
              color: logoutHovered ? "var(--c-red)" : "var(--c-muted)",
              cursor: "pointer",
              transition: "color 0.12s, background 0.12s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M12 7H5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}