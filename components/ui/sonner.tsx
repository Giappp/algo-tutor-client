"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      duration={4500}
      gap={10}
      visibleToasts={4}
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        closeButtonAriaLabel: "Đóng thông báo",
        classNames: {
          toast: "cn-toast !min-h-14 !rounded-xl !border !border-l-4 !px-4 !py-3 !shadow-lg !backdrop-blur-xl",
          content: "!gap-0.5",
          title: "!text-sm !font-semibold !leading-5",
          description: "!text-xs !leading-5 !opacity-80",
          icon: "!mr-1 !flex !size-8 !shrink-0 !items-center !justify-center !rounded-lg !border !border-current/15 !bg-current/10",
          closeButton: "!border-border !bg-background !text-muted-foreground hover:!bg-muted hover:!text-foreground",
          actionButton: "!rounded-md !bg-foreground !px-3 !text-background",
          cancelButton: "!rounded-md !bg-muted !px-3 !text-muted-foreground",
          default: "!border-primary/25 !bg-primary/10 !text-primary",
          info: "!border-primary/25 !bg-primary/10 !text-primary",
          success: "!border-difficulty-easy/30 !bg-difficulty-easy/10 !text-difficulty-easy",
          warning: "!border-difficulty-medium/35 !bg-difficulty-medium/10 !text-difficulty-medium",
          error: "!border-destructive/30 !bg-destructive/10 !text-destructive",
          loading: "!border-primary/20 !bg-popover/95 !text-primary",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
