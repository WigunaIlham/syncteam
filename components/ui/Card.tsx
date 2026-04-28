"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-4 ${onClick ? "cursor-pointer transition-all" : ""} ${className}`}
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
      }}
      onMouseEnter={
        onClick
          ? (e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--c-accent-bd)";
            }
          : undefined
      }
      onMouseLeave={
        onClick
          ? (e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border)";
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
