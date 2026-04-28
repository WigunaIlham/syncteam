"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  href: string;
  label: string;
  icon?: string;
}

export default function TabNav({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex items-center" style={{ gap: "2px" }}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex items-center transition-all"
            style={{
              gap: "6px",
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: isActive ? "600" : "400",
              letterSpacing: isActive ? "0.01em" : "0",
              borderRadius: "8px",
              background: isActive ? "var(--c-accent-bg)" : "transparent",
              color: isActive ? "var(--c-accent)" : "var(--c-muted)",
              border: isActive ? "1px solid var(--c-accent-bd)" : "1px solid transparent",
              textDecoration: "none",
            }}
          >
            {tab.icon && (
              <span style={{ fontSize: "11px", lineHeight: 1, opacity: isActive ? 1 : 0.5 }}>
                {tab.icon}
              </span>
            )}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}