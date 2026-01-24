import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Online Python Compiler - Run Python Code Instantly",
    description:
        "Free online Python compiler and IDE. Write, run, and share Python code directly in your browser. Supports standard library, real-time output, and no installation required.",
    keywords: [
        "python compiler",
        "online python ide",
        "run python online",
        "python editor",
        "python 3 compiler",
        "python playground",
    ],
    openGraph: {
        title: "Online Python Compiler - Run Python Code Instantly",
        description:
            "Free online Python compiler and IDE. Write, run, and share Python code directly in your browser.",
        url: "/compilers/python",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Online Python Compiler - Run Python Code Instantly",
        description:
            "Free online Python compiler and IDE. Write, run, and share Python code directly in your browser.",
    },
    alternates: {
        canonical: "/compilers/python",
    },
};

export default function PythonLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "Online Python Compiler",
                        "applicationCategory": "DeveloperTool",
                        "operatingSystem": "Any",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD"
                        },
                        "description": "Free online Python compiler and IDE. Write, run, and share Python code directly in your browser."
                    })
                }}
            />
            {children}
        </>
    );
}
