import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from '../contexts/AppContext'
import { ThemeProvider } from '../components/ThemeProvider'
import { AuthProvider } from '../components/providers/AuthProvider'
import { Toaster } from '../components/ui/sonner'

// Configure Google Fonts with CSS variables for optimal performance
// Geist Sans is used for body text and UI elements
const geistSans = Geist({
    variable: "--font-geist-sans", // CSS custom property for dynamic font switching
    subsets: ["latin"], // Only load Latin characters to reduce bundle size
})

// Geist Mono is used for code blocks and monospace text
const geistMono = Geist_Mono({
    variable: "--font-geist-mono", // CSS custom property for monospace font
    subsets: ["latin"], // Only load Latin characters to reduce bundle size
})

// Comprehensive SEO and metadata configuration
// Note: Static metadata doesn't support internationalization
// Using English as default for better international accessibility
export const metadata: Metadata = {
    // Dynamic title configuration with template support
    title: {
        default: "SwarmAI - AI Collaboration Platform", // English default for international users
        template: "%s | SwarmAI.chat" // Template for other pages
    },
    // Detailed description for better SEO ranking
    description: "SwarmAI.chat is a next-generation AI collaboration platform that enables professional services through multi-agent team collaboration, including requirement analysis, user research, and technical evaluation. Zero learning curve, ready to use.",

    // Keywords for search engine optimization (English for international reach)
    keywords: [
        "SwarmAI",
        "AI collaboration",
        "multi-agent",
        "AI team",
        "requirement analysis",
        "user research",
        "technical evaluation",
        "data analysis",
        "creative design",
        "artificial intelligence",
        "AI assistant",
        "intelligent conversation"
    ],

    // Author and creator information
    authors: [{ name: "SwarmAI Team" }],
    creator: "SwarmAI Team",
    publisher: "SwarmAI",

    // Search engine crawling configuration
    robots: {
        index: true, // Allow search engines to index this site
        follow: true, // Allow search engines to follow links
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1, // No video preview limit
            'max-image-preview': 'large', // Allow large image previews
            'max-snippet': -1, // No snippet length limit
        },
    },

    // Open Graph tags for social media sharing
    openGraph: {
        type: "website",
        locale: "en_US", // Default to English for international users
        alternateLocale: ["zh_CN"],
        url: "https://swarm-ai.chat",
        siteName: "SwarmAI.chat",
        title: "SwarmAI.chat - AI Collaboration Platform",
        description: "Next-generation AI collaboration platform with multi-agent team collaboration for professional services",
        images: [
            {
                url: "/og-image.png", // Note: should be .png, not .svg for better compatibility
                width: 1200,
                height: 630,
                alt: "SwarmAI.chat - AI Collaboration Platform",
            },
        ],
    },

    // Twitter Card configuration for Twitter sharing
    twitter: {
        card: "summary_large_image", // Large image card type
        site: "@SwarmAI_chat",
        creator: "@SwarmAI_chat",
        title: "SwarmAI.chat - AI Collaboration Platform",
        description: "Next-generation AI collaboration platform with multi-agent team collaboration",
        images: ["/og-image.png"], // Consistent with Open Graph image
    },

    // PWA manifest file
    manifest: "/manifest.json",

    // Favicon and icon configuration
    // Using SVG icons for scalability across all devices
    icons: {
        icon: [
            { url: "/favicon.svg", type: "image/svg+xml" },
            { url: "/favicon-16x16.svg", sizes: "16x16", type: "image/svg+xml" },
            { url: "/favicon-32x32.svg", sizes: "32x32", type: "image/svg+xml" },
            { url: "/favicon-96x96.svg", sizes: "96x96", type: "image/svg+xml" },
        ],
        shortcut: "/favicon.svg",
        apple: [
            { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
        ],
    },

    // Additional metadata for categorization
    category: "technology",
    classification: "AI Platform",
    referrer: "origin-when-cross-origin", // Privacy-conscious referrer policy
    generator: "Next.js", // Framework information
    applicationName: "SwarmAI.chat",

    // Apple-specific configuration for web app appearance
    appleWebApp: {
        capable: true, // Enable web app mode on iOS
        title: "SwarmAI.chat",
        statusBarStyle: "default", // Use default status bar style
    },
}

/**
 * Root layout component that wraps all pages
 * Provides theme support, internationalization, and proper font loading
 * 
 * @param children - The page content to be rendered
 * @returns The complete HTML structure with providers and styling
 */
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {/* Theme provider must wrap everything for proper dark mode support */}
                <ThemeProvider>
                    {/* Language provider for internationalization support */}
                    <LanguageProvider>
                        {/* Auth provider for user authentication state management */}
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </LanguageProvider>
                    {/* Toast notification system */}
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    )
}
