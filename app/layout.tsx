import type { Metadata } from "next";
import { Be_Vietnam_Pro, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { SWRProvider } from "@/components/providers/SWRProvider";

const sansFont = Be_Vietnam_Pro({
    subsets: ["latin", "vietnamese"],
    weight: ["300", "400", "500", "600", "700", "800", "900"],
    variable: "--font-sans",
    display: "swap",
});

const headingFont = Plus_Jakarta_Sans({
    subsets: ["latin", "vietnamese"],
    weight: ["300", "400", "500", "600", "700", "800"],
    variable: "--font-heading",
    display: "swap",
});

const monoFont = JetBrains_Mono({
    subsets: ["latin", "vietnamese"],
    weight: ["300", "400", "500", "600", "700", "800"],
    variable: "--font-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: "AlgoTutor — Master Algorithms with AI-Powered Guidance",
    description:
        "AlgoTutor is a smart online learning platform that combines algorithmic theory with hands-on coding through structured roadmaps and a context-aware AI tutor.",
    keywords: ["algorithms", "data structures", "coding practice", "AI tutor", "roadmaps", "dynamic programming"],
    openGraph: {
        title: "AlgoTutor — Master Algorithms with AI",
        description: "Learn algorithms systematically from foundational concepts to advanced problem-solving, powered by AI hints.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
            <body className={`${sansFont.variable} ${headingFont.variable} ${monoFont.variable} h-full antialiased font-sans`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                    storageKey="theme"
                >
                    <SWRProvider>
                        {children}
                        <Toaster position={"bottom-center"} />
                    </SWRProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
