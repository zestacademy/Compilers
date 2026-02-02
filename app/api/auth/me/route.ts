/**
 * Current User Endpoint
 * Returns user information from validated JWT token
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies } from '@/lib/cookie-utils';
import { validateJWT } from '@/lib/jwt-utils';

export async function GET(request: NextRequest) {
    try {
        // Get token from cookies
        const cookieHeader = request.headers.get('cookie');
        const token = getTokenFromCookies(cookieHeader);
        
        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }
        
        // Validate JWT token
        const validation = validateJWT(token);
        
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error || 'Invalid token' },
                { status: 401 }
            );
        }
        
        // Return user information
        const user = {
            id: validation.payload!.sub,
            email: validation.payload!.email,
            name: validation.payload!.name,
            picture: validation.payload!.picture,
        };
        
        return NextResponse.json({ user });
    } catch (error) {
        console.error('Error getting current user:', error);
        return NextResponse.json(
            { error: 'Failed to get user information' },
            { status: 500 }
        );
    }
}
