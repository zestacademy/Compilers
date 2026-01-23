"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
    return (
        <div className="h-[80vh] flex flex-col items-center justify-center text-center p-4">
            <div className="bg-muted p-6 rounded-full mb-6 animate-bounce">
                <FileQuestion className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <div className="flex gap-4">
                <Link href="/">
                    <Button>Return Home</Button>
                </Link>
                <Link href="/compilers">
                    <Button variant="outline">Browse Compilers</Button>
                </Link>
            </div>
        </div>
    )
}
