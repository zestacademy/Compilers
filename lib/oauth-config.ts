/**
 * OAuth 2.0 SSO Configuration
 * Central authentication server: auth.zestacademy.tech
 */

// Validate critical environment variables at runtime (lazy validation)
function getEnvVar(name: string, value: string | undefined, required: boolean = false): string {
    if (required && !value && process.env.NODE_ENV === 'production') {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value || '';
}

// Configuration object with lazy getters for sensitive values
export const OAUTH_CONFIG = {
    // Auth server base URL
    authServerUrl: process.env.NEXT_PUBLIC_AUTH_SERVER_URL || 'https://auth.zestacademy.tech',
    
    // Client credentials
    clientId: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || 'zestcompilers',
    
    // Lazy getter for client secret (validated at runtime, not build time)
    get clientSecret(): string {
        return getEnvVar('OAUTH_CLIENT_SECRET', process.env.OAUTH_CLIENT_SECRET, true);
    },
    
    // OAuth endpoints
    authorizationEndpoint: '/authorize',
    tokenEndpoint: '/oauth/token',
    logoutEndpoint: '/logout',
    
    // Redirect URI for this client
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || 'https://zestcompilers.tech/api/auth/callback',
    
    // OAuth parameters
    scope: 'openid profile email',
    responseType: 'code',
    
    // Lazy getter for JWT secret (validated at runtime, not build time)
    get jwtSecret(): string {
        return getEnvVar('JWT_SECRET', process.env.JWT_SECRET, true);
    },
    
    // Lazy getter for cookie secret (validated at runtime, not build time)
    get cookieSecret(): string {
        return getEnvVar('COOKIE_SECRET', process.env.COOKIE_SECRET, true);
    },
    
    cookieName: 'zest_access_token',
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    }
};

/**
 * Generate authorization URL for OAuth flow
 */
export function generateAuthUrl(state: string): string {
    const params = new URLSearchParams({
        client_id: OAUTH_CONFIG.clientId,
        redirect_uri: OAUTH_CONFIG.redirectUri,
        response_type: OAUTH_CONFIG.responseType,
        scope: OAUTH_CONFIG.scope,
        state: state,
    });
    
    return `${OAUTH_CONFIG.authServerUrl}${OAUTH_CONFIG.authorizationEndpoint}?${params.toString()}`;
}

/**
 * Generate CSRF state token
 */
export function generateState(): string {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
