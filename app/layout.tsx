import type {Metadata} from "next";
import {Inter, JetBrains_Mono} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/theme-provider";
import {Toaster} from "sonner";
import {SWRProvider} from "@/components/providers/SWRProvider";

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin", "vietnamese"],
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
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
        <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased font-sans`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="theme"
        >
            <SWRProvider>
                {children}
                <Toaster position={"bottom-center"}/>
            </SWRProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
