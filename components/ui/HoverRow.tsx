"use client";

export function HoverRow({
  children,
  isLast,
  style,
}: {
  children: React.ReactNode;
  isLast?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--c-border)",
        ...style,
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