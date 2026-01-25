"use client"

import { useState, useEffect, useRef } from "react"
import Script from "next/script"
import Editor from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Loader2, Terminal, Download, Trash2, Maximize2, Minimize2, Sparkles, BookOpen, GitGraph } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import dynamic from "next/dynamic"

const MermaidDiagram = dynamic(() => import("@/components/MermaidDiagram"), { ssr: false })

export default function PythonCompiler() {
    const [code, setCode] = useState<string>("# Write your Python code here\nprint('Hello, Zest Academy!')\n\ndef fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)\n\nprint(f'Fibonacci(10): {fib(10)}')")
    const [output, setOutput] = useState<string>("")
    const [isRunning, setIsRunning] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isOutputMaximized, setIsOutputMaximized] = useState(false)

    // Explanation State
    const [explanation, setExplanation] = useState<any>(null)
    const [isExplaining, setIsExplaining] = useState(false)
    const [activeTab, setActiveTab] = useState("output")

    const pyodideRef = useRef<any>(null)

    // Clear output when code changes is annoying for some, so we keep it until manual clear or run
    // But usually clearing on new run is expected.

    const runCode = async () => {
        if (!pyodideRef.current) return
        setIsRunning(true)
        // We don't clear output automatically on run to allow accumulating logs, 
        // but typically a "fresh run" feels better if it clears. 
        // Let's clear it for this use case.
        setOutput("")
        try {
            await pyodideRef.current.runPythonAsync(code)
        } catch (error: any) {
            setOutput((prev) => prev + `Error: ${error.message}\n`)
        } finally {
            setIsRunning(false)
        }
    }

    const clearOutput = () => setOutput("")

    const clearCode = () => setCode("")

    const toggleMaximize = () => setIsOutputMaximized(!isOutputMaximized)

    const resetCode = () => {
        setCode("# Write your Python code here\nprint('Hello, Zest Academy!')\n\ndef fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)\n\nprint(f'Fibonacci(10): {fib(10)}')")
        setOutput("")
        setExplanation(null)
    }

    const handleExplain = async () => {
        if (!code.trim()) return
        setIsExplaining(true)
        setActiveTab("explanation")
        setExplanation(null)

        try {
            const res = await fetch("/api/explain-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code })
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setExplanation(data)
        } catch (err: any) {
            setExplanation({ error: err.message || "Failed to generate explanation" })
        } finally {
            setIsExplaining(false)
        }
    }

    return (
        <div className="flex flex-col h-[85vh] gap-4">
            <Script
                src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"
                strategy="afterInteractive"
                onLoad={async () => {
                    try {
                        // @ts-ignore
                        const pyodide = await window.loadPyodide({
                            stdout: (text: string) => {
                                setOutput((prev) => prev + text + "\n")
                            },
                            stderr: (text: string) => {
                                setOutput((prev) => prev + "Error: " + text + "\n")
                            }
                        })
                        pyodideRef.current = pyodide
                        setIsLoading(false)
                    } catch (e) {
                        console.error("Failed to load Pyodide:", e)
                        setOutput("Failed to load Python environment. Please refresh.")
                    }
                }}
            />

            <div className="flex items-center justify-between bg-card p-2 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2 px-2">
                    <Terminal className="w-5 h-5 text-green-500" />
                    <span className="font-semibold text-lg hidden sm:inline">Python Playground</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={resetCode}
                        title="Reset Code"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Reset</span>
                    </Button>

                    <Button
                        onClick={handleExplain}
                        disabled={isLoading || isExplaining || isRunning}
                        variant="secondary"
                        className="min-w-[100px]"
                    >
                        {isExplaining ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                <span className="hidden sm:inline">Thinking...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                                <span className="hidden sm:inline">Explain</span>
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={runCode}
                        disabled={isLoading || isRunning || isExplaining}
                        className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                <span className="hidden sm:inline">Loading...</span>
                            </>
                        ) : isRunning ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                <span className="hidden sm:inline">Running...</span>
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Run</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className={`grid gap-4 flex-1 min-h-0 ${isOutputMaximized ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
                {/* Editor Section */}
                {!isOutputMaximized && (
                    <Card className="flex flex-col overflow-hidden border-border h-full shadow-md">
                        <div className="bg-muted px-4 py-2 border-b text-xs font-mono text-muted-foreground flex justify-between items-center">
                            <span>main.py</span>
                            <div className="flex items-center gap-3">
                                <span>Python 3.11 (Pyodide)</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearCode}
                                    title="Clear Code"
                                    className="h-6 px-2 text-xs"
                                >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Clear
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0">
                            <Editor
                                height="100%"
                                defaultLanguage="python"
                                value={code}
                                onChange={(value) => setCode(value || "")}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    padding: { top: 16 }
                                }}
                            />
                        </div>
                    </Card>
                )}

                {/* Output Section */}
                {/* Output/Explanation Section */}
                <Card className="flex flex-col overflow-hidden border-border bg-[#1e1e1e] h-full shadow-md">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                        <div className="bg-[#2d2d2d] px-4 py-2 border-b border-[#3e3e3e] flex justify-between items-center shrink-0">
                            <TabsList className="bg-[#1e1e1e]">
                                <TabsTrigger value="output" className="data-[state=active]:bg-[#3e3e3e] data-[state=active]:text-white text-gray-400">
                                    <Terminal className="w-4 h-4 mr-2" />
                                    Output
                                </TabsTrigger>
                                <TabsTrigger value="flowchart" className="data-[state=active]:bg-[#3e3e3e] data-[state=active]:text-white text-gray-400">
                                    <GitGraph className="w-4 h-4 mr-2" />
                                    Flowchart
                                </TabsTrigger>
                                <TabsTrigger value="explanation" className="data-[state=active]:bg-[#3e3e3e] data-[state=active]:text-white text-gray-400">
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Explanation
                                </TabsTrigger>
                            </TabsList>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleMaximize}
                                    title={isOutputMaximized ? "Restore" : "Maximize"}
                                    className="h-6 px-2 text-xs hover:bg-[#3e3e3e] text-gray-400 hover:text-white"
                                >
                                    {isOutputMaximized ? (
                                        <>
                                            <Minimize2 className="w-3 h-3 mr-1" />
                                            Restore
                                        </>
                                    ) : (
                                        <>
                                            <Maximize2 className="w-3 h-3 mr-1" />
                                            Maximize
                                        </>
                                    )}
                                </Button>
                                {activeTab === "output" && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearOutput}
                                        title="Clear Terminal Output"
                                        className="h-6 px-2 text-xs hover:bg-[#3e3e3e] text-gray-400 hover:text-white"
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>

                        <TabsContent value="output" className="flex-1 p-0 m-0 min-h-0 relative">
                            <ScrollArea className="h-full w-full">
                                <div className="p-4 font-mono text-sm whitespace-pre-wrap text-white">
                                    {isRunning && <div className="text-green-400 animate-pulse mb-2">● Executing...</div>}
                                    {output ? output : <span className="text-gray-500 italic"># output will appear here...</span>}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="flowchart" className="flex-1 p-0 m-0 min-h-0 bg-[#0f0f0f] relative">
                            <ScrollArea className="h-full w-full">
                                <div className="p-4 flex flex-col items-center justify-center min-h-[300px]">
                                    {isExplaining && (
                                        <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                            <p>Generating flowchart...</p>
                                        </div>
                                    )}

                                    {!isExplaining && !explanation && (
                                        <div className="flex flex-col items-center justify-center py-10 text-gray-500 italic">
                                            <GitGraph className="w-12 h-12 mb-3 opacity-20" />
                                            <p>Click "Explain" to visualize the code flow.</p>
                                        </div>
                                    )}

                                    {!isExplaining && explanation?.error && (
                                        <div className="p-4 text-red-400 bg-red-900/10 border border-red-900 rounded-md">
                                            Error: {explanation.error}
                                        </div>
                                    )}

                                    {!isExplaining && explanation?.mermaid_code && (
                                        <div className="w-full">
                                            <MermaidDiagram chart={explanation.mermaid_code} />
                                        </div>
                                    )}

                                    {!isExplaining && explanation && !explanation.mermaid_code && !explanation.error && (
                                        <div className="text-gray-500 italic">No flowchart available for this code.</div>
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="explanation" className="flex-1 p-0 m-0 min-h-0 bg-[#0f0f0f] relative">
                            <ScrollArea className="h-full w-full">
                                <div className="p-4 space-y-6">
                                    {isExplaining && (
                                        <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                            <p>Analyzing your code...</p>
                                        </div>
                                    )}

                                    {!isExplaining && !explanation && (
                                        <div className="flex flex-col items-center justify-center py-10 text-gray-500 italic">
                                            <Sparkles className="w-12 h-12 mb-3 opacity-20" />
                                            <p>Click "Explain" to generate a step-by-step breakdown.</p>
                                        </div>
                                    )}

                                    {!isExplaining && explanation?.error && (
                                        <div className="p-4 text-red-400 bg-red-900/10 border border-red-900 rounded-md">
                                            Error: {explanation.error}
                                        </div>
                                    )}

                                    {!isExplaining && explanation?.blocks && (
                                        <div className="space-y-6">
                                            {explanation.blocks.map((block: any, index: number) => (
                                                <div key={index} className="border border-[#333] rounded-lg overflow-hidden bg-[#1a1a1a]">
                                                    <div className="p-3 bg-[#252525] border-b border-[#333] flex justify-between items-center">
                                                        <h4 className="font-semibold text-white flex items-center gap-2">
                                                            <span className="bg-blue-600/20 text-blue-400 w-6 h-6 rounded-full flex items-center justify-center text-xs border border-blue-600/30">{index + 1}</span>
                                                            {block.title}
                                                        </h4>
                                                        {block.concept && (
                                                            <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-300 bg-purple-500/10">
                                                                {block.concept}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="p-0">
                                                        <div className="bg-[#0d0d0d] p-3 font-mono text-xs text-green-300 border-b border-[#333] overflow-x-auto">
                                                            {block.code}
                                                        </div>
                                                        <div className="p-4 text-gray-300 text-sm leading-relaxed">
                                                            {block.explanation}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="text-center text-xs text-gray-600 pt-4">
                                                Generated by AI • May act unpredictably
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    )
}
