import { cn } from "@labas/ui/lib/utils";

const sizeClasses = {
  xs: { container: "h-6 w-6", text: "text-xs" },
  sm: { container: "h-8 w-8", text: "text-sm" },
  md: { container: "h-10 w-10", text: "text-sm" },
  lg: { container: "h-16 w-16", text: "text-xl" },
  xl: { container: "h-16 w-16 md:h-20 md:w-20", text: "text-2xl md:text-3xl" },
} as const;

const variantClasses = {
  profile: "bg-[var(--matcha-300)] text-[var(--matcha-800)]",
  leaderboard: "bg-[var(--oat-light)] text-[var(--warm-charcoal)]",
} as const;

interface AvatarProps {
  src: string | null | undefined;
  name: string;
  size?: keyof typeof sizeClasses;
  variant?: keyof typeof variantClasses;
  bordered?: boolean;
  className?: string;
}

export function Avatar({
  src,
  name,
  size = "md",
  variant = "profile",
  bordered = false,
  className,
}: AvatarProps) {
  const sizes = sizeClasses[size];
  const borderClass = bordered
    ? "border-4 border-[var(--pure-white)] clay-shadow"
    : "";
  const initial = (name?.[0] ?? "?").toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          sizes.container,
          "rounded-full object-cover shrink-0",
          borderClass,
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        sizes.container,
        "rounded-full flex items-center justify-center shrink-0",
        variantClasses[variant],
        borderClass,
        className,
      )}
    >
      <span className={cn(sizes.text, "font-headline font-bold")}>
        {initial}
      </span>
    </div>
  );
}
