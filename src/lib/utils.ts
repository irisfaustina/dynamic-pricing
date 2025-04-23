import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function removeTrailingSlash(path: string){ /* for src/schema/products */
  return path.replace(/\/$/, "")
}