"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number
    max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
    ({ className, value = 0, max = 100, ...props }, ref) => {
        const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

        return (
            <div
                ref={ref}
                className={cn(
                    "relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
                    className
                )}
                {...props}
            >
                <div
                    className="h-full bg-slate-900 dark:bg-slate-50 transition-all duration-300 ease-in-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        )
    }
)

Progress.displayName = "Progress"

export { Progress } 