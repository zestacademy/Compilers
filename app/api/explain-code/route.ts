import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini
// Ensure you have GEMINI_API_KEY in your .env.local file
const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
    try {
        if (!apiKey) {
            console.warn("GEMINI_API_KEY is not set");
            return NextResponse.json(
                { error: "Server configuration error: API key missing" },
                { status: 500 }
            );
        }

        const body = await req.json();
        let { code } = body;

        if (!code || typeof code !== 'string') {
            return NextResponse.json({ error: "No valid code provided" }, { status: 400 });
        }

        // Preprocessing
        // 1. Trim whitespace
        code = code.trim();
        // 2. Remove empty lines (optional, but requested)
        // Actually, preserving structure is often good for context, but let's compress multiple newlines
        code = code.replace(/\n\s*\n/g, '\n');

        // 3. Enforce size limits (e.g., 2000 characters to prevent huge token usage)
        if (code.length > 5000) {
            return NextResponse.json({ error: "Code too long (>5000 chars)" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Using alias 'gemini-flash-latest' which points to the latest stable Flash model (e.g., 1.5 Flash).
        // This is often more stable and has better quotas than the preview versions.
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
      You are a specialized Python code tutor. Your task is to explain the provided Python code to a beginner.
      Break the code into logical blocks and explain each block.

      Rules:
      1. Analyze the logic of the code.
      2. Group related lines into a "block" (e.g., imports, a function definition, a loop, a print statement).
      3. For each block, provide:
         - The exact code snippet.
         - A title.
         - A simple explanation (1-2 sentences).
         - A key Python concept involved.
      4. If the code is just comments or empty, return an empty blocks array.
      5. Output MUST be valid JSON.
      6. Also generate a Mermaid.js flowchart syntax string representing the code's execution flow.
         - Start with "graph TD".
         - Use shapes: 
           - id([Label]) for Start/End (Stadium shape).
           - id[Label] for Process steps.
           - id{Label} for Decisions (if/while).
         - CRITICAL: Labels must NOT contain parentheses "()", brackets "[]", braces "{}", or quotes. 
         - Remove parameters from function names in labels (e.g., use "Define fib" instead of "Define fib(n)").
         - Keep labels extremely alphanumeric and simple.
      
      Input Code:
      ---
      ${code}
      ---

      Output JSON Schema (Strictly follow this):
      {
        "language": "python",
        "mermaid_code": "graph TD\n...",
        "blocks": [
          {
            "title": "block title",
            "code": "code snippet",
            "explanation": "simple text",
            "concept": "concept name"
          }
        ]
      }
    `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const response = result.response;
        let text = response.text();

        // Cleaning just in case, though responseMimeType should handle it
        if (text.startsWith("```json")) {
            text = text.replace(/```json/g, "").replace(/```/g, "");
        }

        const jsonResponse = JSON.parse(text);

        // Validate structure roughly
        if (!jsonResponse.blocks || !Array.isArray(jsonResponse.blocks)) {
            throw new Error("Invalid response structure from LLM");
        }

        return NextResponse.json(jsonResponse);

    } catch (error: any) {
        console.error("Explanation generation failed:", error);

        let errorMessage = error.message || "Failed to generate explanation";
        let status = 500;

        if (errorMessage.includes("429") || errorMessage.includes("Too Many Requests") || errorMessage.includes("Quota exceeded")) {
            errorMessage = "High traffic: The AI model is currently busy. Please try again in a minute.";
            status = 429;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: status }
        );
    }
}
