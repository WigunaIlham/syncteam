export default function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const base =
  "inline-flex items-center justify-center gap-2 font-semibold tracking-[0.01em] transition-all disabled:opacity-40 disabled:cursor-not-allowed rounded-xl select-none";

const sizes: Record<string, string> = {
  sm: "h-10 min-w-[110px] px-4 text-xs",
  md: "h-12 min-w-[140px] px-6 text-sm",
  lg: "h-14 min-w-[160px] px-8 text-base",
};
}
