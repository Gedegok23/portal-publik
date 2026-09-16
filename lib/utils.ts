import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Standard shadcn/ui utility: merges Tailwind classes safely (later classes
// override earlier conflicting ones instead of both landing in the DOM).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
