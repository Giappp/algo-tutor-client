"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70 aria-invalid:text-destructive",
  {
    variants: {
      variant: {
        default: "",
        caption: "text-xs text-muted-foreground",
        hint: "text-xs text-muted-foreground/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Label({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      data-variant={variant}
      className={cn(labelVariants({ variant }), className)}
      {...props}
    />
  )
}

function LabelCaption({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="label-caption"
      className={cn("block text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function LabelHint({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="label-hint"
      className={cn("block text-xs text-muted-foreground/80", className)}
      {...props}
    />
  )
}

export { Label, LabelCaption, LabelHint, labelVariants }
