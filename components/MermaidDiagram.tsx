"use client"

import React, { useEffect, useRef } from "react"
import mermaid from "mermaid"

export default function MermaidDiagram({ chart }: { chart: string }) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            securityLevel: "loose",
            fontFamily: "monospace"
        })
    }, [])

    useEffect(() => {
        if (ref.current && chart) {
            // Unique ID to avoid conflicts if multiple diagrams exist (though unlikely here)
            const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

            // Clear previous content
            ref.current.innerHTML = ''

            mermaid.render(id, chart)
                .then((result) => {
                    if (ref.current) {
                        ref.current.innerHTML = result.svg
                    }
                })
                .catch((error) => {
                    console.error("Mermaid failed to render", error)
                    if (ref.current) {
                        ref.current.innerHTML = `<div class="text-red-400 text-xs p-2 border border-red-800 rounded bg-red-900/10">Failed to render flowchart: ${error.message?.slice(0, 50)}...</div>`
                    }
                })
        }
    }, [chart])

    return (
        <div className="w-full flex justify-center py-4 overflow-x-auto bg-[#1a1a1a] rounded-lg">
            <div ref={ref} className="text-white fill-white" />
        </div>
    )
}
