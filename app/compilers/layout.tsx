import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "All Online Compilers",
    description:
        "Explore our collection of free online compilers and coding playgrounds. Python, C, SQL, and Web Development tools available instantly.",
    alternates: {
        canonical: "/compilers",
    },
    openGraph: {
        title: "All Online Compilers - Zest",
        description: "Explore our collection of free online compilers and coding playgrounds.",
        url: "/compilers",
    }
};

export default function CompilersLayout({
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
                        "@type": "ItemList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Python Compiler",
                                "url": "https://zestcompilers.vercel.app/compilers/python"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Web Playground",
                                "url": "https://zestcompilers.vercel.app/compilers/web"
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": "SQL Practice Lab",
                                "url": "https://zestcompilers.vercel.app/compilers/sql"
                            },
                            {
                                "@type": "ListItem",
                                "position": 4,
                                "name": "C Programming Compiler",
                                "url": "https://zestcompilers.vercel.app/compilers/c"
                            },
                            {
                                "@type": "ListItem",
                                "position": 5,
                                "name": "Java Compiler",
                                "url": "https://zestcompilers.vercel.app/compilers/java"
                            }
                        ]
                    })
                }}
            />
            {children}
        </>
    );
}
