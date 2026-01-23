import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Online Web Playground - HTML, CSS, & JavaScript Compiler",
    description:
        "Interactive online web development playground. Write and preview HTML, CSS, and JavaScript code instantly. Perfect for frontend experiments.",
    keywords: [
        "web playground",
        "html compiler",
        "css editor",
        "javascript console",
        "frontend playground",
        "html css js online",
        "codepen alternative",
    ],
    openGraph: {
        title: "Online Web Playground - HTML, CSS, & JavaScript Compiler",
        description:
            "Interactive online web development playground. Write and preview HTML, CSS, and JavaScript code instantly.",
        url: "/compilers/web",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Online Web Playground - HTML, CSS, & JavaScript Compiler",
        description:
            "Interactive online web development playground. Write and preview HTML, CSS, and JavaScript code instantly.",
    },
    alternates: {
        canonical: "/compilers/web",
    },
};

export default function WebLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
