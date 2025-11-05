import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        // Light mode styles
        "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500",
        // Dark mode styles - MAXIMUM visibility
        "dark:bg-slate-700 dark:border-slate-500 dark:text-white dark:placeholder:text-slate-300",
        // Focus states
        "focus-visible:border-indigo-500 focus-visible:ring-indigo-500/50 focus-visible:ring-[3px]",
        "dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/50",
        // Invalid states
        "aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Input }
