import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { code, stdin, language, versionIndex } = await request.json();

        // Get credentials from server-side environment variables
        const clientId = process.env.JDOODLE_CLIENT_ID;
        const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            return NextResponse.json(
                { error: 'Compiler API credentials are not configured. Please contact the administrator.' },
                { status: 500 }
            );
        }

        // Make request to JDoodle API from server-side
        const response = await fetch('https://api.jdoodle.com/v1/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                clientId,
                clientSecret,
                script: code,
                stdin: stdin || '',
                language,
                versionIndex,
            }),
        });

        const result = await response.json();

        // Return the result to the client
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Compilation API error:', error);
        return NextResponse.json(
            { error: `Server error: ${error.message}` },
            { status: 500 }
        );
    }
}
