import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function difficultyColor(difficulty: string) {
  switch (difficulty) {
    case "beginner": return "green"
    case "intermediate": return "yellow"
    case "advanced": return "red"
    default: return "gray"
  }
}

export function topicColor(color: string) {
  switch (color) {
    case "blue": return "blue"
    case "green": return "green"
    case "red": return "red"
    default: return "gray"
  }
}
