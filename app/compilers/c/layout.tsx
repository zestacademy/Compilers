import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Online C Compiler - Run C Code Instantly",
    description:
        "Free online C compiler and IDE. Write, compile, and run C programming code directly in your browser. Fast, efficient, and no setup needed.",
    keywords: [
        "c compiler",
        "online c compiler",
        "run c online",
        "c programming ide",
        "gcc compiler online",
        "c playground",
    ],
    openGraph: {
        title: "Online C Compiler - Run C Code Instantly",
        description:
            "Free online C compiler and IDE. Write, compile, and run C programming code directly in your browser.",
        url: "/compilers/c",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Online C Compiler - Run C Code Instantly",
        description:
            "Free online C compiler and IDE. Write, compile, and run C programming code directly in your browser.",
    },
    alternates: {
        canonical: "/compilers/c",
    },
};

export default function CLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
