import { auth } from "@clerk/nextjs/server"
import { AwaitedReactNode } from "react"
import { NoPermissionCard } from "./NoPermissionCard"

export async function HasPermission({
  permission,
  renderFallback = false,
  fallbackText,
  children,
}: {
  permission: (userId: string | null) => Promise<boolean> /* takes a user id or null */
  renderFallback?: boolean 
  fallbackText?: string
  children: AwaitedReactNode
}) {
  const { userId } = await auth() /* check if user has permission and if yes renter children */
  const hasPermission = await permission(userId)
  if (hasPermission) return children
  if (renderFallback) return <NoPermissionCard>{fallbackText}</NoPermissionCard> /* if you don't want to render fallback then returns null */
  return null
}