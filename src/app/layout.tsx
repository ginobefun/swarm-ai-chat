import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from '../contexts/AppContext'
import { ThemeProvider } from '../components/ThemeProvider'

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: {
        default: "SwarmAI.chat - AI 协作平台",
        template: "%s | SwarmAI.chat"
    },
    description: "SwarmAI.chat 是新一代 AI 协作平台，通过多智能体团队协作模式，为用户提供专业的需求分析、用户研究、技术评估等服务。零学习成本，即开即用。",
    keywords: [
        "SwarmAI",
        "AI 协作",
        "多智能体",
        "AI 团队",
        "需求分析",
        "用户研究",
        "技术评估",
        "数据分析",
        "创意设计",
        "人工智能",
        "AI 助手",
        "智能对话"
    ],
    authors: [{ name: "SwarmAI Team" }],
    creator: "SwarmAI Team",
    publisher: "SwarmAI",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: "website",
        locale: "zh_CN",
        alternateLocale: ["en_US"],
        url: "https://swarm-ai.chat",
        siteName: "SwarmAI.chat",
        title: "SwarmAI.chat - AI 协作平台",
        description: "新一代 AI 协作平台，多智能体团队协作，专业服务，零学习成本",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "SwarmAI.chat - AI 协作平台",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        site: "@SwarmAI_chat",
        creator: "@SwarmAI_chat",
        title: "SwarmAI.chat - AI 协作平台",
        description: "新一代 AI 协作平台，多智能体团队协作，专业服务，零学习成本",
        images: ["/og-image.png"],
    },
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 1,
    },
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#6366f1" },
        { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
    ],
    manifest: "/manifest.json",
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
    verification: {
        google: "verification_code_here",
        yandex: "verification_code_here",
        other: {
            "msvalidate.01": "verification_code_here",
        },
    },
    category: "technology",
    classification: "AI Platform",
    referrer: "origin-when-cross-origin",
    generator: "Next.js",
    applicationName: "SwarmAI.chat",
    appleWebApp: {
        capable: true,
        title: "SwarmAI.chat",
        statusBarStyle: "default",
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider>
                    <LanguageProvider>
                        {children}
                    </LanguageProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
