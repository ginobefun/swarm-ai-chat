import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"

/**
 * FormField component - Accessible form field with label, input, and error message
 *
 * Features:
 * - Full ARIA support (aria-label, aria-describedby, aria-required, aria-invalid)
 * - Error message with aria-live for screen readers
 * - Optional/required indicator
 * - Help text support
 * - Dark mode compatible
 * - Follows WCAG 2.1 AA guidelines
 *
 * Design Tokens:
 * - Colors: Follows semantic error color system
 * - Spacing: gap-1.5 (6px) for compact vertical rhythm
 * - Typography: text-sm for labels, text-xs for hints
 *
 * @example
 * ```tsx
 * <FormField
 *   label="Email Address"
 *   id="email"
 *   type="email"
 *   required
 *   error="Please enter a valid email"
 *   helpText="We'll never share your email"
 * />
 * ```
 */

interface FormFieldProps extends Omit<React.ComponentProps<"input">, "id"> {
  /**
   * Unique identifier for the input field (required for accessibility)
   */
  id: string
  /**
   * Label text for the field
   */
  label: string
  /**
   * Error message to display (triggers aria-invalid and error styling)
   */
  error?: string
  /**
   * Optional help text displayed below the input
   */
  helpText?: string
  /**
   * Whether to show the label visually (default: true)
   * If false, label is still available to screen readers
   */
  showLabel?: boolean
  /**
   * Custom className for the container
   */
  containerClassName?: string
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      id,
      label,
      error,
      helpText,
      required,
      showLabel = true,
      containerClassName,
      className,
      ...props
    },
    ref
  ) => {
    const errorId = `${id}-error`
    const helpId = `${id}-help`
    const describedBy = [
      error ? errorId : null,
      helpText ? helpId : null,
    ]
      .filter(Boolean)
      .join(" ")

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {/* Label */}
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium text-slate-700 dark:text-slate-200",
            !showLabel && "sr-only"
          )}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
          {!required && (
            <span className="text-slate-400 dark:text-slate-500 text-xs ml-1 font-normal">
              (optional)
            </span>
          )}
        </label>

        {/* Input */}
        <Input
          ref={ref}
          id={id}
          aria-label={!showLabel ? label : undefined}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          className={cn(error && "border-red-500 focus-visible:border-red-500", className)}
          required={required}
          {...props}
        />

        {/* Help Text */}
        {helpText && !error && (
          <p
            id={helpId}
            className="text-xs text-slate-500 dark:text-slate-400"
          >
            {helpText}
          </p>
        )}

        {/* Error Message with aria-live for screen reader announcements */}
        {error && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1"
          >
            <svg
              className="w-3.5 h-3.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = "FormField"

/**
 * FormFieldGroup component - Group multiple form fields with a legend
 *
 * Use this for radio button groups, checkbox groups, or related fields
 *
 * @example
 * ```tsx
 * <FormFieldGroup legend="Notification Preferences">
 *   <FormField id="email-notif" type="checkbox" label="Email notifications" />
 *   <FormField id="sms-notif" type="checkbox" label="SMS notifications" />
 * </FormFieldGroup>
 * ```
 */
interface FormFieldGroupProps {
  /**
   * Legend text for the fieldset
   */
  legend: string
  /**
   * Child form fields
   */
  children: React.ReactNode
  /**
   * Optional description for the group
   */
  description?: string
  /**
   * Whether to show the legend visually (default: true)
   */
  showLegend?: boolean
  /**
   * Custom className for the fieldset
   */
  className?: string
}

const FormFieldGroup: React.FC<FormFieldGroupProps> = ({
  legend,
  children,
  description,
  showLegend = true,
  className,
}) => {
  return (
    <fieldset className={cn("border-0 p-0 m-0", className)}>
      <legend
        className={cn(
          "text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3",
          !showLegend && "sr-only"
        )}
      >
        {legend}
      </legend>
      {description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          {description}
        </p>
      )}
      <div className="flex flex-col gap-3">{children}</div>
    </fieldset>
  )
}

export { FormField, FormFieldGroup }
export type { FormFieldProps, FormFieldGroupProps }
