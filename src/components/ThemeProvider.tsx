'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ReactNode } from 'react'

interface ThemeProviderProps {
    children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute="data-theme"
            defaultTheme="system"
            enableSystem={true}
            themes={['light', 'dark', 'system']}
            disableTransitionOnChange={false}
        >
            {children}
        </NextThemesProvider>
    )
} 