import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ReadingProgressBar } from "@/components/ui/reading-progress-bar";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://zestcompilers.vercel.app"),
    title: {
        default: "Zest Compilers - Online Coding Playground",
        template: "%s | Zest Compilers",
    },
    description:
        "Practice Python, C, SQL, and Web Development instantly with our free online compilers. No setup required - just code.",
    keywords: [
        "online compiler",
        "python compiler",
        "c compiler",
        "sql compiler",
        "web playground",
        "html css js compiler",
        "coding playground",
        "zest compilers",
        "programming",
        "coding",
    ],
    authors: [{ name: "Zest Academy" }],
    creator: "Zest Academy",
    publisher: "Zest Academy",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://zestcompilers.vercel.app",
        title: "Zest Compilers - Online Coding Playground",
        description:
            "Practice Python, C, SQL, and Web Development instantly with our free online compilers.",
        siteName: "Zest Compilers",
        images: [
            {
                url: "/opengraph-image.png", // Next.js standard for dynamic OG or static file
                width: 1200,
                height: 630,
                alt: "Zest Compilers - Code Instantly",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Zest Compilers - Online Coding Playground",
        description:
            "Practice Python, C, SQL, and Web Development instantly with our free online compilers.",
        images: ["/twitter-image.png"], // Next.js standard
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    alternates: {
        canonical: "./",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    <ToastProvider>
                        <ReadingProgressBar />
                        <Navbar />
                        <main className="flex-1">{children}</main>
                        <Footer />
                    </ToastProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
