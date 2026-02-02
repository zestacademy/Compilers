/**
 * Cookie Utilities for Secure Token Storage
 * HTTP-only cookies to prevent XSS attacks
 */

import { OAUTH_CONFIG } from './oauth-config';

/**
 * Simple cookie serializer
 */
function serializeCookie(name: string, value: string, options: any): string {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    if (options.maxAge) {
        cookie += `; Max-Age=${options.maxAge}`;
    }
    if (options.path) {
        cookie += `; Path=${options.path}`;
    }
    if (options.httpOnly) {
        cookie += '; HttpOnly';
    }
    if (options.secure) {
        cookie += '; Secure';
    }
    if (options.sameSite) {
        cookie += `; SameSite=${options.sameSite}`;
    }
    
    return cookie;
}

/**
 * Simple cookie parser
 */
function parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    
    cookieHeader.split(';').forEach(cookie => {
        const [name, ...rest] = cookie.trim().split('=');
        if (name) {
            cookies[decodeURIComponent(name)] = decodeURIComponent(rest.join('='));
        }
    });
    
    return cookies;
}

/**
 * Set access token in HTTP-only cookie
 */
export function setTokenCookie(token: string): string {
    return serializeCookie(OAUTH_CONFIG.cookieName, token, {
        ...OAUTH_CONFIG.cookieOptions,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}

/**
 * Clear access token cookie (for logout)
 */
export function clearTokenCookie(): string {
    return serializeCookie(OAUTH_CONFIG.cookieName, '', {
        ...OAUTH_CONFIG.cookieOptions,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
        path: '/',
    });
}

/**
 * Get token from cookies
 */
export function getTokenFromCookies(cookieHeader: string | null): string | null {
    if (!cookieHeader) {
        return null;
    }
    
    const cookies = parseCookies(cookieHeader);
    return cookies[OAUTH_CONFIG.cookieName] || null;
}

/**
 * Set state cookie for CSRF protection
 */
export function setStateCookie(state: string): string {
    return serializeCookie('oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600, // 10 minutes
        path: '/',
    });
}

/**
 * Get and validate state from cookies
 */
export function getStateFromCookies(cookieHeader: string | null): string | null {
    if (!cookieHeader) {
        return null;
    }
    
    const cookies = parseCookies(cookieHeader);
    return cookies['oauth_state'] || null;
}

/**
 * Clear state cookie after validation
 */
export function clearStateCookie(): string {
    return serializeCookie('oauth_state', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
        path: '/',
    });
}
