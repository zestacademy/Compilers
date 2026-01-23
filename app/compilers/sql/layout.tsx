import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Online SQL Compiler - Run SQL Queries",
    description:
        "Free online SQL interface. Practice SQL queries, create tables, and manipulate data (SQLite) directly in your browser. Interactive and instant results.",
    keywords: [
        "sql compiler",
        "online sql editor",
        "run sql online",
        "sqlite online",
        "sql playground",
        "database practice",
    ],
    openGraph: {
        title: "Online SQL Compiler - Run SQL Queries",
        description:
            "Free online SQL interface. Practice SQL queries, create tables, and manipulate data directly in your browser.",
        url: "/compilers/sql",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Online SQL Compiler - Run SQL Queries",
        description:
            "Free online SQL interface. Practice SQL queries, create tables, and manipulate data directly in your browser.",
    },
    alternates: {
        canonical: "/compilers/sql",
    },
};

export default function SQLLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
