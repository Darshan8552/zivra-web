import * as React from "react";
import { cn } from "#/lib/utils.ts";
import { getAvatarFallbackProps } from "#/lib/avatar.ts";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";
type AvatarShape = "circle" | "rounded" | "square";
type AvatarVariant = "color" | "neutral";

const sizeClasses: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-20 w-20 text-xl",
  hero: "h-28 w-28 sm:h-36 sm:w-36 text-2xl sm:text-3xl",
};

const shapeClasses: Record<AvatarShape, string> = {
  circle: "rounded-full",
  rounded: "rounded-3xl",
  square: "rounded-xl",
};

const elevatedFallback =
  "shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_20px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.06)] ring-1 ring-black/[0.03] dark:ring-white/[0.06]";

const elevatedBySize: Record<AvatarSize, string> = {
  xs: "shadow-sm",
  sm: "shadow-sm",
  md: "shadow-[0_1px_3px_rgba(0,0,0,0.07),0_4px_10px_rgba(0,0,0,0.04)]",
  lg: "shadow-[0_2px_6px_rgba(0,0,0,0.07),0_8px_16px_rgba(0,0,0,0.06)]",
  xl: "shadow-[0_4px_12px_rgba(0,0,0,0.08),0_12px_24px_rgba(0,0,0,0.06)]",
  hero: "shadow-[0_4px_16px_rgba(0,0,0,0.08),0_16px_32px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.5),0_16px_40px_rgba(0,0,0,0.4)]",
};

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  username?: string | null;
  alt?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  variant?: AvatarVariant;
  className?: string;
  fallbackClassName?: string;
  imgClassName?: string;
  border?: boolean;
}

export function Avatar({
  src,
  name,
  username,
  alt,
  size = "md",
  shape = "circle",
  variant = "color",
  className,
  fallbackClassName,
  imgClassName,
  border = false,
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const showFallback = !src || imgError;

  // reset error when src changes
  React.useEffect(() => {
    setImgError(false);
  }, [src]);

  const fallback = getAvatarFallbackProps(name, username, variant);
  const ariaLabel = name || username || "Avatar";

  if (showFallback) {
    return (
      <div
        aria-label={ariaLabel}
        title={ariaLabel ?? undefined}
        style={fallback.style}
        className={cn(
          "relative inline-flex items-center justify-center font-display font-bold tracking-tight shrink-0 select-none overflow-hidden",
          "before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-b before:from-white/55 before:to-transparent before:opacity-60 dark:before:from-white/[0.07] dark:before:opacity-100 before:pointer-events-none",
          sizeClasses[size],
          shapeClasses[shape],
          fallback.className,
          elevatedFallback,
          elevatedBySize[size],
          border && "border-4 border-background",
          className,
          fallbackClassName,
        )}
      >
        <span aria-hidden className="relative z-[1]">
          {fallback.initials}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt ?? ""}
      onError={() => setImgError(true)}
      className={cn(
        "object-cover shrink-0",
        sizeClasses[size],
        shapeClasses[shape],
        elevatedFallback,
        elevatedBySize[size],
        border && "border-4 border-background",
        className,
        imgClassName,
      )}
    />
  );
}
