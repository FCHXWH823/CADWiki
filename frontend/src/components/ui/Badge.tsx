import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "blue" | "green" | "red" | "gray" | "yellow"
  className?: string
}

const variantClasses = {
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  green: "bg-green-100 text-green-800 border-green-200",
  red: "bg-red-100 text-red-800 border-red-200",
  gray: "bg-gray-100 text-gray-700 border-gray-200",
  yellow: "bg-amber-100 text-amber-800 border-amber-200",
}

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
