import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getBackgroundColor(name: string): string {
  const colors = [
    "bg-red-500",
    "bg-orange-500", 
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];
  
  const hash = name
    .split("")
    .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  
  return colors[hash % colors.length];
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ name = "", src, size = "md", className, ...props }, ref) => {
    const initials = getInitials(name);
    const bgColor = getBackgroundColor(name);

    if (src) {
      return (
        <div
          ref={ref}
          className={cn(
            "relative inline-flex items-center justify-center rounded-full overflow-hidden",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full text-white font-medium",
          sizeClasses[size],
          bgColor,
          className
        )}
        {...props}
      >
        {initials}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };