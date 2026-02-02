/**
 * OAuth 2.0 SSO Configuration
 * Central authentication server: auth.zestacademy.tech
 */

// Validate critical environment variables in production
function validateEnvVar(name: string, value: string | undefined): string {
    if (!value && process.env.NODE_ENV === 'production') {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value || '';
}

export const OAUTH_CONFIG = {
    // Auth server base URL
    authServerUrl: process.env.NEXT_PUBLIC_AUTH_SERVER_URL || 'https://auth.zestacademy.tech',
    
    // Client credentials
    clientId: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || 'zestcompilers',
    clientSecret: validateEnvVar('OAUTH_CLIENT_SECRET', process.env.OAUTH_CLIENT_SECRET),
    
    // OAuth endpoints
    authorizationEndpoint: '/authorize',
    tokenEndpoint: '/oauth/token',
    logoutEndpoint: '/logout',
    
    // Redirect URI for this client
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || 'https://zestcompilers.tech/api/auth/callback',
    
    // OAuth parameters
    scope: 'openid profile email',
    responseType: 'code',
    
    // JWT validation
    jwtSecret: validateEnvVar('JWT_SECRET', process.env.JWT_SECRET),
    
    // Cookie configuration
    cookieSecret: validateEnvVar('COOKIE_SECRET', process.env.COOKIE_SECRET),
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
