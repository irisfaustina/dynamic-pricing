import { cn } from "@/lib/utils"
import { AsteriskIcon } from "lucide-react"
import { ComponentPropsWithoutRef } from "react"

export function RequiredLabelIcon({ /* taks in no props or all props */
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AsteriskIcon>) {/* give all props to AsteriskIcon */
  return (
    <AsteriskIcon
      {...props}
      className={cn("text-destructive inline size-3 align-top", className)} /* define custom class names, render red asterisk */
    />
  )
}