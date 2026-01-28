import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Online Java Compiler - Run Java Code Instantly",
    description:
        "Free online Java compiler and IDE. Write, compile, and run Java programming code directly in your browser. Fast, efficient, and no setup needed.",
    keywords: [
        "java compiler",
        "online java compiler",
        "run java online",
        "java programming ide",
        "jdk online",
        "java playground",
    ],
    openGraph: {
        title: "Online Java Compiler - Run Java Code Instantly",
        description:
            "Free online Java compiler and IDE. Write, compile, and run Java programming code directly in your browser.",
        url: "/compilers/java",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Online Java Compiler - Run Java Code Instantly",
        description:
            "Free online Java compiler and IDE. Write, compile, and run Java programming code directly in your browser.",
    },
    alternates: {
        canonical: "/compilers/java",
    },
};

export default function JavaLayout({
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
                        "name": "Online Java Compiler",
                        "applicationCategory": "DeveloperTool",
                        "operatingSystem": "Any",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD"
                        },
                        "description": "Free online Java compiler and IDE. Write, compile, and run Java programming code directly in your browser."
                    })
                }}
            />
            {children}
        </>
    );
}
