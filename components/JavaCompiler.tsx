"use client"

import { useState } from "react"
import Editor from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Code, Loader2, Terminal, Clock, Coffee, Trash2, Maximize2, Minimize2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

const DEFAULT_CODE = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Welcome to Java Compiler!");
        
        int a = 10, b = 20;
        System.out.println("Sum of " + a + " and " + b + " is " + (a + b));
    }
}`

export default function JavaCompiler() {
    const [code, setCode] = useState<string>(DEFAULT_CODE)
    const [input, setInput] = useState<string>("")
    const [output, setOutput] = useState<string>("")
    const [compileError, setCompileError] = useState<string>("")
    const [isRunning, setIsRunning] = useState(false)
    const [executionTime, setExecutionTime] = useState<number>(0)
    const [status, setStatus] = useState<"idle" | "compiling" | "running" | "success" | "error">("idle")
    const [isOutputMaximized, setIsOutputMaximized] = useState(false)

    const runCode = async () => {
        setIsRunning(true)
        setOutput("")
        setCompileError("")
        setStatus("compiling")

        const startTime = performance.now()

        try {
            // Call our server-side API route which proxies to JDoodle
            const response = await fetch('/api/compile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    stdin: input,
                    language: 'java',
                    versionIndex: '4', // JDK 17.0.20
                })
            })

            const result = await response.json()
            const endTime = performance.now()
            setExecutionTime(endTime - startTime)

            if (result.error) {
                setCompileError(result.error)
                setStatus("error")
            } else if (result.compilationStatus === "failed" || (result.statusCode && result.statusCode !== 200)) {
                // JDoodle sometimes returns statusCode 200 even if there is a runtime error, checking output usually helps
                // But check specifically for compilation failure
                setCompileError(result.output || "Compilation/Execution failed")
                setStatus("error")
            } else {
                setOutput(result.output || "(no output)")
                setStatus("success")
            }
        } catch (error: any) {
            setCompileError(`Network Error: ${error.message}\n\nNote: This compiler uses an external API. If it's not working, the service might be temporarily unavailable.`)
            setStatus("error")
        } finally {
            setIsRunning(false)
        }
    }

    const clearCode = () => setCode("")
    const clearInput = () => setInput("")
    const clearOutput = () => {
        setOutput("")
        setCompileError("")
    }
    const toggleMaximize = () => setIsOutputMaximized(!isOutputMaximized)

    const resetCode = () => {
        setCode(DEFAULT_CODE)
        setInput("")
        setOutput("")
        setCompileError("")
        setStatus("idle")
        setExecutionTime(0)
    }

    const getStatusBadge = () => {
        switch (status) {
            case "compiling":
                return <span className="text-yellow-500">⚙️ Compiling...</span>
            case "running":
                return <span className="text-blue-500">▶️ Running...</span>
            case "success":
                return <span className="text-green-500">✅ Success</span>
            case "error":
                return <span className="text-red-500">❌ Error</span>
            default:
                return <span className="text-gray-500">⏸️ Ready</span>
        }
    }

    return (
        <div className="flex flex-col h-[85vh] gap-4">
            <div className="flex items-center justify-between bg-card p-2 rounded-lg border shadow-sm">
                <div className="flex items-center gap-4 px-2">
                    <div className="flex items-center gap-2">
                        <Coffee className="w-5 h-5 text-orange-500" />
                        <span className="font-semibold text-lg hidden sm:inline">Java Compiler</span>
                    </div>
                    <div className="text-sm">
                        {getStatusBadge()}
                    </div>
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
                        onClick={runCode}
                        disabled={isRunning}
                        className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
                    >
                        {isRunning ? (
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
                    <div className="flex flex-col gap-4 h-full min-h-0">
                        <Card className="flex flex-col overflow-hidden border-border flex-[3] shadow-md">
                            <div className="bg-muted px-4 py-2 border-b text-xs font-mono text-muted-foreground flex justify-between items-center">
                                <span>Main.java</span>
                                <div className="flex items-center gap-3">
                                    <span>JDK 17.0.20</span>
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
                                    defaultLanguage="java"
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

                        {/* Input Section */}
                        <Card className="flex flex-col overflow-hidden border-border flex-1 shadow-md">
                            <div className="bg-muted px-4 py-2 border-b text-xs font-mono text-muted-foreground flex justify-between items-center">
                                <span>Standard Input (stdin)</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearInput}
                                    title="Clear Input"
                                    className="h-6 px-2 text-xs"
                                >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Clear
                                </Button>
                            </div>
                            <div className="flex-1 p-4">
                                <Textarea
                                    placeholder="Enter input here (if your program uses Scanner, System.in, etc.)"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="w-full h-full resize-none font-mono text-sm"
                                />
                            </div>
                        </Card>
                    </div>
                )}

                {/* Output Section */}
                <div className="flex flex-col gap-4 h-full min-h-0">
                    {/* Compilation Errors */}
                    {compileError && (
                        <Card className="flex flex-col overflow-hidden border-red-500 bg-red-50 dark:bg-red-950/20 shadow-md">
                            <div className="bg-red-100 dark:bg-red-900/30 px-4 py-2 border-b border-red-300 dark:border-red-800 text-xs font-mono flex items-center gap-2">
                                <span className="text-red-600 dark:text-red-400 font-semibold">❌ Compilation Error</span>
                            </div>
                            <div className="flex-1 p-4 overflow-auto">
                                <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap font-mono">{compileError}</pre>
                            </div>
                        </Card>
                    )}

                    {/* Standard Output */}
                    <Card className="flex flex-col overflow-hidden border-border bg-[#1e1e1e] text-white flex-1 min-h-0 shadow-md">
                        <div className="bg-[#2d2d2d] px-4 py-2 border-b border-[#3e3e3e] text-xs font-mono text-gray-400 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                <span>Program Output</span>
                                {executionTime > 0 && (
                                    <span className="flex items-center gap-1 text-green-400">
                                        <Clock className="w-3 h-3" />
                                        {executionTime.toFixed(0)}ms
                                    </span>
                                )}
                            </div>
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
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearOutput}
                                    title="Clear Output"
                                    className="h-6 px-2 text-xs hover:bg-[#3e3e3e] text-gray-400 hover:text-white"
                                >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Clear
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap">
                            {output ? output : <span className="text-gray-500 italic"># program output will appear here...</span>}
                        </div>
                    </Card>

                    {/* Tips Card */}
                    <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                        <h3 className="font-semibold text-sm mb-2 text-orange-700 dark:text-orange-400">💡 Tips:</h3>
                        <ul className="text-xs space-y-1 text-orange-600 dark:text-orange-300">
                            <li>• Class name must be 'Main' (public class Main)</li>
                            <li>• Don't forget 'public static void main(String[] args)'</li>
                            <li>• Use System.out.println() for output</li>
                            <li>• Scanner or BufferedReader works with Standard Input box</li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    )
}
