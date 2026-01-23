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
    return <>{children}</>;
}
