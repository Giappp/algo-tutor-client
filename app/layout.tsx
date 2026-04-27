import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
