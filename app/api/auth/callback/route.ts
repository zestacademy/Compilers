/**
 * OAuth Callback Endpoint
 * Handles the authorization callback from auth.zestacademy.tech
 * Exchanges authorization code for access token (backend only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { OAUTH_CONFIG } from '@/lib/oauth-config';
import { getStateFromCookies, clearStateCookie, setTokenCookie } from '@/lib/cookie-utils';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        
        // Check for authorization errors
        if (error) {
            console.error('Authorization error:', error);
            return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
        }
        
        // Validate required parameters
        if (!code || !state) {
            return NextResponse.redirect(new URL('/?error=invalid_callback', request.url));
        }
        
        // Validate CSRF state
        const cookieHeader = request.headers.get('cookie');
        const storedState = getStateFromCookies(cookieHeader);
        
        if (!storedState || storedState !== state) {
            console.error('CSRF state mismatch');
            return NextResponse.redirect(new URL('/?error=csrf_failed', request.url));
        }
        
        // Exchange authorization code for access token
        // This is done server-side to keep client_secret secure
        const tokenResponse = await fetch(`${OAUTH_CONFIG.authServerUrl}${OAUTH_CONFIG.tokenEndpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: OAUTH_CONFIG.redirectUri,
                client_id: OAUTH_CONFIG.clientId,
                client_secret: OAUTH_CONFIG.clientSecret,
            }),
        });
        
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('Token exchange failed:', errorData);
            return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
        }
        
        const tokenData = await tokenResponse.json();
        const { access_token } = tokenData;
        
        if (!access_token) {
            console.error('No access token received');
            return NextResponse.redirect(new URL('/?error=no_token', request.url));
        }
        
        // Create response with redirect to home page
        const response = NextResponse.redirect(new URL('/', request.url));
        
        // Set access token in HTTP-only cookie
        response.headers.append('Set-Cookie', setTokenCookie(access_token));
        
        // Clear state cookie
        response.headers.append('Set-Cookie', clearStateCookie());
        
        return response;
    } catch (error) {
        console.error('Error handling OAuth callback:', error);
        return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
    }
}
