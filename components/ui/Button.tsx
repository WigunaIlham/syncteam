import { ButtonHTMLAttributes } from "react";
import Spinner from "./Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  disabled,
  className = "",
  style,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed rounded-xl select-none";

  const sizes: Record<string, string> = {
    sm: "px-6 py-4 text-xs",
    md: "px-6 py-3.5 text-sm",
    lg: "px-8 py-4 text-sm",
  };

  const variantStyle: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--c-accent)",
      color: "#000",
      border: "1px solid transparent",
    },
    secondary: {
      background: "var(--c-surface)",
      color: "var(--c-text)",
      border: "1px solid var(--c-border)",
    },
    ghost: {
      background: "transparent",
      color: "var(--c-muted)",
      border: "1px solid transparent",
    },
    danger: {
      background: "var(--c-red-bg)",
      color: "var(--c-red)",
      border: "1px solid rgba(239,68,68,0.20)",
    },
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${className}`}
      style={{ ...variantStyle[variant], ...style }}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}