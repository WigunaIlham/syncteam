"use client";

interface TaskRowProps {
  children: React.ReactNode;
  isLast: boolean;
}

export function TaskRow({ children, isLast }: TaskRowProps) {
  return (
    <div
      className="flex items-center gap-4 transition-colors"
      style={{
        padding: "16px 20px",
        borderBottom: isLast ? "none" : "1px solid var(--c-border)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--c-raised)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {children}
    </div>
  );
}