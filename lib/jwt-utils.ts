/**
 * JWT Validation Utilities
 * Validates JWT tokens from auth.zestacademy.tech
 */

import { OAUTH_CONFIG } from './oauth-config';

export interface JWTPayload {
    sub: string; // User ID
    email: string;
    name?: string;
    picture?: string;
    iss: string; // Issuer
    aud: string; // Audience
    exp: number; // Expiration timestamp
    iat: number; // Issued at timestamp
}

/**
 * Decode JWT without verification (for inspection only)
 */
export function decodeJWT(token: string): JWTPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        
        const payload = parts[1];
        const decoded = JSON.parse(
            Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
        );
        
        return decoded as JWTPayload;
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

/**
 * Validate JWT token
 * Checks: signature (placeholder), expiry, issuer, and audience
 */
export function validateJWT(token: string): { valid: boolean; payload?: JWTPayload; error?: string } {
    try {
        // Decode the token
        const payload = decodeJWT(token);
        
        if (!payload) {
            return { valid: false, error: 'Invalid token format' };
        }
        
        // Validate expiration
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            return { valid: false, error: 'Token expired' };
        }
        
        // Validate issuer
        const expectedIssuer = OAUTH_CONFIG.authServerUrl;
        if (payload.iss !== expectedIssuer) {
            return { valid: false, error: 'Invalid issuer' };
        }
        
        // Validate audience
        const expectedAudience = OAUTH_CONFIG.clientId;
        if (payload.aud !== expectedAudience) {
            return { valid: false, error: 'Invalid audience' };
        }
        
        // TODO: Validate signature using public key from auth server
        // This would typically involve fetching the JWKS from auth server
        // and verifying the signature using the appropriate algorithm
        
        return { valid: true, payload };
    } catch (error) {
        console.error('Error validating JWT:', error);
        return { valid: false, error: 'Validation error' };
    }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) {
        return true;
    }
    
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
}
