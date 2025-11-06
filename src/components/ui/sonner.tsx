"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

/**
 * Toaster component - Toast notification system
 *
 * Based on Sonner library with custom styling to match design system
 *
 * Features:
 * - Auto theme detection (light/dark mode)
 * - Rich toast variants (default, success, error, warning, info)
 * - Accessible with ARIA labels
 * - Customizable duration and position
 * - Supports actions and descriptions
 *
 * Design Tokens:
 * - Colors: Follows semantic color system
 * - Border radius: rounded-lg (8px) - from design-tokens.md
 * - Shadows: Uses system shadow-lg
 *
 * @example
 * ```tsx
 * import { toast } from "sonner"
 *
 * // Success toast
 * toast.success("Session created successfully!")
 *
 * // Error toast
 * toast.error("Failed to delete session")
 *
 * // Toast with action
 * toast("Session deleted", {
 *   action: {
 *     label: "Undo",
 *     onClick: () => console.log("Undo"),
 *   },
 * })
 * ```
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      closeButton
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-slate-950 dark:group-[.toaster]:text-slate-50 dark:group-[.toaster]:border-slate-800",
          description: "group-[.toast]:text-slate-500 dark:group-[.toast]:text-slate-400",
          actionButton:
            "group-[.toast]:bg-indigo-600 group-[.toast]:text-white hover:group-[.toast]:bg-indigo-700 dark:group-[.toast]:bg-indigo-500 dark:hover:group-[.toast]:bg-indigo-600",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500 hover:group-[.toast]:bg-slate-200 dark:group-[.toast]:bg-slate-800 dark:group-[.toast]:text-slate-400 dark:hover:group-[.toast]:bg-slate-700",
          closeButton:
            "group-[.toast]:bg-white group-[.toast]:text-slate-500 hover:group-[.toast]:text-slate-900 group-[.toast]:border-slate-200 dark:group-[.toast]:bg-slate-950 dark:group-[.toast]:text-slate-400 dark:hover:group-[.toast]:text-slate-50 dark:group-[.toast]:border-slate-800",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
