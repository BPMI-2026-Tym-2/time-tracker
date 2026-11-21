"use client"

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { cn } from "cn"

function AvatarXL({
  className,
  ...props
}: AvatarPrimitive.Root.Props) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size="xl"
      className={cn(
        "group/avatar relative flex size-32 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten",
        className
      )}
      {...props}
    />
  )
}

export { AvatarXL }
