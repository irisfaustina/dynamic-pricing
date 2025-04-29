import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function removeTrailingSlash(path: string){ /* for src/schema/products */
  return path.replace(/\/$/, "")
}

export function createURL(
  href: string,
  oldParams: Record<string, string | undefined>,
  newParam: Record<string, string | undefined>,
) {
  // Filter out undefined values from oldParams
  const filteredOldParams = Object.fromEntries(
    Object.entries(oldParams).filter(([_, value]) => value !== undefined)
  ) as Record<string, string>

  const params = new URLSearchParams(filteredOldParams)

  // Handle new parameters
  Object.entries(newParam).forEach(([key, value]) => {
    if (value === undefined) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
  })

  return `${href}?${params.toString()}`
}