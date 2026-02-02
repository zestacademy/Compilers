/**
 * OAuth Login Endpoint
 * Redirects users to auth.zestacademy.tech for authentication
 */

import { NextResponse } from 'next/server';
import { generateAuthUrl, generateState } from '@/lib/oauth-config';
import { setStateCookie } from '@/lib/cookie-utils';

export async function GET() {
    try {
        // Generate CSRF state token
        const state = generateState();
        
        // Generate authorization URL
        const authUrl = generateAuthUrl(state);
        
        // Create response with redirect
        const response = NextResponse.redirect(authUrl);
        
        // Set state cookie for CSRF protection
        response.headers.append('Set-Cookie', setStateCookie(state));
        
        return response;
    } catch (error) {
        console.error('Error initiating OAuth flow:', error);
        return NextResponse.json(
            { error: 'Failed to initiate authentication' },
            { status: 500 }
        );
    }
}
