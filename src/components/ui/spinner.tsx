import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "inline-block border-2 rounded-full animate-spin",
  {
    variants: {
      size: {
        sm: "size-4 border-[2px]",
        default: "size-6 border-[2.5px]",
        lg: "size-8 border-[3px]",
        xl: "size-12 border-[3.5px]",
      },
      variant: {
        default: "border-slate-300 border-t-indigo-600 dark:border-slate-600 dark:border-t-indigo-400",
        primary: "border-indigo-200 border-t-indigo-600 dark:border-indigo-900 dark:border-t-indigo-400",
        white: "border-white/30 border-t-white",
        muted: "border-slate-200 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-400",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Accessible label for screen readers
   */
  label?: string
}

/**
 * Spinner component - Unified loading indicator
 *
 * Features:
 * - Multiple size variants (sm, default, lg, xl)
 * - Multiple color variants (default, primary, white, muted)
 * - Accessible with ARIA labels
 * - Smooth animation with Tailwind's animate-spin
 * - Dark mode support
 *
 * Design Tokens:
 * - Animation: transition-all duration-200 (from design-tokens.md)
 * - Colors: Follows semantic color system
 *
 * @example
 * ```tsx
 * // Default spinner
 * <Spinner />
 *
 * // Large primary spinner with label
 * <Spinner size="lg" variant="primary" label="Loading data..." />
 *
 * // Small white spinner (for dark backgrounds)
 * <Spinner size="sm" variant="white" />
 * ```
 */
function Spinner({
  className,
  size,
  variant,
  label = "Loading...",
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <div className={cn(spinnerVariants({ size, variant }))} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

/**
 * LoadingState component - Full-screen loading state
 *
 * Use this for page-level loading states
 *
 * @example
 * ```tsx
 * <LoadingState message="Loading your sessions..." />
 * ```
 */
interface LoadingStateProps {
  /**
   * Optional message to display below the spinner
   */
  message?: string
  /**
   * Size of the spinner
   */
  size?: "default" | "lg" | "xl"
  /**
   * Whether to use full screen height
   */
  fullScreen?: boolean
  /**
   * Custom className for the container
   */
  className?: string
}

function LoadingState({
  message,
  size = "lg",
  fullScreen = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8",
        fullScreen && "min-h-screen",
        !fullScreen && "min-h-[200px]",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Spinner size={size} variant="primary" label={message || "Loading..."} />
      {message && (
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-md">
          {message}
        </p>
      )}
    </div>
  )
}

/**
 * InlineSpinner component - Inline loading indicator
 *
 * Use this for inline loading states, like inside buttons
 *
 * @example
 * ```tsx
 * <button disabled>
 *   <InlineSpinner /> Loading...
 * </button>
 * ```
 */
interface InlineSpinnerProps {
  /**
   * Size of the spinner
   */
  size?: "sm" | "default"
  /**
   * Color variant
   */
  variant?: "default" | "primary" | "white" | "muted"
  /**
   * Custom className
   */
  className?: string
}

function InlineSpinner({ size = "sm", variant = "default", className }: InlineSpinnerProps) {
  return (
    <Spinner
      size={size}
      variant={variant}
      className={cn("mr-2", className)}
      label="Loading..."
    />
  )
}

export { Spinner, LoadingState, InlineSpinner, spinnerVariants }
export type { SpinnerProps, LoadingStateProps, InlineSpinnerProps }
