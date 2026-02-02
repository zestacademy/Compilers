/**
 * OAuth Logout Endpoint
 * Clears local tokens and optionally performs global logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { OAUTH_CONFIG } from '@/lib/oauth-config';
import { clearTokenCookie, getTokenFromCookies } from '@/lib/cookie-utils';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const globalLogout = searchParams.get('global') === 'true';
        
        // Get token from cookies
        const cookieHeader = request.headers.get('cookie');
        const token = getTokenFromCookies(cookieHeader);
        
        // Clear local token cookie
        const response = NextResponse.redirect(new URL('/', request.url));
        response.headers.append('Set-Cookie', clearTokenCookie());
        
        // If global logout is requested and we have a token, call auth server logout
        if (globalLogout && token) {
            try {
                // Call auth server logout endpoint
                // This will invalidate the session on the auth server
                await fetch(`${OAUTH_CONFIG.authServerUrl}${OAUTH_CONFIG.logoutEndpoint}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            } catch (error) {
                console.error('Error during global logout:', error);
                // Continue with local logout even if global logout fails
            }
        }
        
        return response;
    } catch (error) {
        console.error('Error during logout:', error);
        // Still try to clear the cookie
        const response = NextResponse.redirect(new URL('/', request.url));
        response.headers.append('Set-Cookie', clearTokenCookie());
        return response;
    }
}

export async function POST(request: NextRequest) {
    // Support POST method as well
    return GET(request);
}
