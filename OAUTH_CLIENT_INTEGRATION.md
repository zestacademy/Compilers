# OAuth 2.0 Client Integration Guide

This guide shows you how to integrate **Zest Academy**, **Zestfolio**, and **Zest Compilers** with the Zest Auth OAuth 2.0 server.

## Overview

Your applications will use the **OAuth 2.0 Authorization Code Flow with PKCE** to authenticate users via Zest Auth.

### Registered OAuth Clients

After running `npx prisma db seed`, you'll have these OAuth clients:

| Application | Client ID | Redirect URIs | Trusted |
|------------|-----------|---------------|---------|
| **Zest Academy** | `zest_academy` | http://localhost:3001/auth/callback<br>https://zestacademy.tech/auth/callback<br>https://www.zestacademy.tech/auth/callback | ✅ Yes |
| **Zestfolio** | `zestfolio` | http://localhost:3002/auth/callback<br>https://zestfolio.zestacademy.tech/auth/callback | ✅ Yes |
| **Zest Compilers** | `zest_compilers` | http://localhost:3003/auth/callback<br>https://compilers.zestacademy.tech/auth/callback | ✅ Yes |

**Trusted = Yes** means users won't see a consent screen (seamless login experience).

---

## Quick Implementation Guide

### Step 1: Install PKCE Library (Client-Side)

```bash
npm install pkce-challenge
```

### Step 2: Create OAuth Helper

Create `lib/oauth.ts` or `utils/oauth.ts` in your client application:

```typescript
import pkceChallenge from 'pkce-challenge'

const AUTH_SERVER_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.zestacademy.tech'
const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || (() => {
  throw new Error('NEXT_PUBLIC_OAUTH_CLIENT_ID is required')
})()
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || (() => {
  throw new Error('NEXT_PUBLIC_REDIRECT_URI is required')
})()

/**
 * Generate PKCE challenge and redirect to authorization endpoint
 * 
 * This function:
 * 1. Generates a PKCE code_verifier and code_challenge
 * 2. Stores code_verifier in sessionStorage for later token exchange
 * 3. Generates and stores a random state for CSRF protection
 * 4. Redirects the user to the authorization server
 */
export async function initiateLogin() {
  // Generate PKCE challenge
  const challenge = await pkceChallenge()
  
  // Store code_verifier in sessionStorage (needed for token exchange)
  sessionStorage.setItem('pkce_code_verifier', challenge.code_verifier)
  
  // Generate random state for CSRF protection
  const state = generateRandomString(32)
  sessionStorage.setItem('oauth_state', state)
  
  // Build authorization URL
  const authUrl = new URL(`${AUTH_SERVER_URL}/api/oauth/authorize`)
  authUrl.searchParams.set('client_id', CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'openid profile email')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('code_challenge', challenge.code_challenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')
  
  // Redirect to auth server
  window.location.href = authUrl.toString()
}

/**
 * Generate random string for state parameter
 */
function generateRandomString(length: number): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}
```

### Step 3: Create Login Button

```tsx
// components/LoginButton.tsx
import { initiateLogin } from '@/lib/oauth'

export function LoginButton() {
  return (
    <button onClick={initiateLogin} className="btn-primary">
      Sign in with Zest Account
    </button>
  )
}
```

### Step 4: Create Callback Handler (Backend)

Create an API route to handle the OAuth callback and exchange the code for tokens:

#### Next.js Example (`app/api/auth/callback/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL || 'https://auth.zestacademy.tech'
const CLIENT_ID = process.env.OAUTH_CLIENT_ID
const REDIRECT_URI = process.env.REDIRECT_URI

export async function POST(request: NextRequest) {
  try {
    // Get data from client
    const body = await request.json()
    const { code, state, codeVerifier } = body
    
    // Validate required parameters
    if (!code || !state || !codeVerifier) {
      return NextResponse.json(
        { error: 'missing_params' },
        { status: 400 }
      )
    }
    
    // Exchange authorization code for tokens with PKCE
    const tokenResponse = await fetch(`${AUTH_SERVER_URL}/api/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    })
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Token exchange failed:', errorData)
      return NextResponse.json(
        { error: 'token_exchange_failed' },
        { status: 401 }
      )
    }
    
    const tokens = await tokenResponse.json()
    
    // Get user info
    const userInfoResponse = await fetch(`${AUTH_SERVER_URL}/api/oauth/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })
    
    if (!userInfoResponse.ok) {
      return NextResponse.json(
        { error: 'userinfo_failed' },
        { status: 401 }
      )
    }
    
    const user = await userInfoResponse.json()
    
    // Create response with success status
    const response = NextResponse.json({
      success: true,
      user,
    })
    
    // Store tokens in httpOnly cookies (server-side only)
    response.cookies.set('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in || 3600, // 1 hour default
      path: '/',
    })
    
    if (tokens.refresh_token) {
      response.cookies.set('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      })
    }
    
    // Store user info (can be non-httpOnly if needed for client-side access)
    response.cookies.set('user', JSON.stringify(user), {
      httpOnly: false, // Accessible to JavaScript for UI display
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in || 3600,
      path: '/',
    })
    
    return response
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json(
      { error: 'server_error' },
      { status: 500 }
    )
  }
}
```

### Step 5: Create Callback Page (Frontend)

Since the OAuth flow needs to pass the PKCE verifier from the client to the server, create a client component:

#### Next.js Example (`app/auth/callback/page.tsx`)

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    if (error) {
      router.push(`/login?error=${error}`)
      return
    }
    
    if (!code || !state) {
      router.push('/login?error=missing_params')
      return
    }
    
    // Verify state
    const savedState = sessionStorage.getItem('oauth_state')
    if (state !== savedState) {
      router.push('/login?error=invalid_state')
      return
    }
    
    // Get code_verifier
    const codeVerifier = sessionStorage.getItem('pkce_code_verifier')
    if (!codeVerifier) {
      router.push('/login?error=missing_verifier')
      return
    }
    
    // Send to backend API with code_verifier
    fetch('/api/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        state,
        codeVerifier, // PKCE code verifier from sessionStorage
      }),
      credentials: 'include', // Include cookies - ensures httpOnly cookies are sent and received
    })
      .then(async (res) => {
        if (res.ok) {
          // Tokens are now stored in httpOnly cookies by the server
          // No need to handle them client-side
          
          // Clean up PKCE data
          sessionStorage.removeItem('pkce_code_verifier')
          sessionStorage.removeItem('oauth_state')
          
          // Redirect to dashboard
          router.push('/dashboard')
        } else {
          const error = await res.json()
          router.push(`/login?error=${error.error || 'auth_failed'}`)
        }
      })
      .catch(() => {
        router.push('/login?error=network_error')
      })
  }, [router, searchParams])
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Completing authentication...</p>
      </div>
    </div>
  )
}
```

### Step 6: Environment Variables

Create `.env.local` in each client application:

#### For Zest Academy:
```env
# OAuth Configuration
NEXT_PUBLIC_AUTH_URL=https://auth.zestacademy.tech
NEXT_PUBLIC_OAUTH_CLIENT_ID=zest_academy
NEXT_PUBLIC_REDIRECT_URI=https://zestacademy.tech/auth/callback

# Server-side only (not prefixed with NEXT_PUBLIC_)
AUTH_SERVER_URL=https://auth.zestacademy.tech
OAUTH_CLIENT_ID=zest_academy
REDIRECT_URI=https://zestacademy.tech/auth/callback
```

#### For Zestfolio:
```env
NEXT_PUBLIC_AUTH_URL=https://auth.zestacademy.tech
NEXT_PUBLIC_OAUTH_CLIENT_ID=zestfolio
NEXT_PUBLIC_REDIRECT_URI=https://zestfolio.zestacademy.tech/auth/callback

AUTH_SERVER_URL=https://auth.zestacademy.tech
OAUTH_CLIENT_ID=zestfolio
REDIRECT_URI=https://zestfolio.zestacademy.tech/auth/callback
```

#### For Zest Compilers:
```env
NEXT_PUBLIC_AUTH_URL=https://auth.zestacademy.tech
NEXT_PUBLIC_OAUTH_CLIENT_ID=zest_compilers
NEXT_PUBLIC_REDIRECT_URI=https://compilers.zestacademy.tech/auth/callback

AUTH_SERVER_URL=https://auth.zestacademy.tech
OAUTH_CLIENT_ID=zest_compilers
REDIRECT_URI=https://compilers.zestacademy.tech/auth/callback
```

---

## Token Management

### Accessing Protected Resources

Since tokens are stored in httpOnly cookies, they are automatically sent with requests. Your API routes can access them server-side:

#### Protected API Route Example (`app/api/user/profile/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Access token is automatically available in cookies
  const accessToken = request.cookies.get('access_token')?.value
  
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // Use token to fetch user data from auth server or validate it
  try {
    const response = await fetch(`${AUTH_SERVER_URL}/api/oauth/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    const user = await response.json()
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
```

#### Client-Side Usage

```typescript
// Client simply calls the API - cookies are sent automatically
async function getUserProfile() {
  const response = await fetch('/api/user/profile', {
    credentials: 'include', // Important: includes cookies
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch profile')
  }
  
  return response.json()
}
```

### Token Refresh

When the access token expires, implement automatic refresh on the backend:

#### Refresh Token API Route (`app/api/auth/refresh/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'

const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL || 'https://auth.zestacademy.tech'
const CLIENT_ID = process.env.OAUTH_CLIENT_ID

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token' },
        { status: 401 }
      )
    }
    
    // Exchange refresh token for new access token
    const response = await fetch(`${AUTH_SERVER_URL}/api/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
      }),
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Token refresh failed' },
        { status: 401 }
      )
    }
    
    const tokens = await response.json()
    
    // Create response and set new tokens
    const result = NextResponse.json({ success: true })
    
    result.cookies.set('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in || 3600,
      path: '/',
    })
    
    // Update refresh token if a new one is provided
    if (tokens.refresh_token) {
      result.cookies.set('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      })
    }
    
    return result
  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
```

#### Client-Side Refresh

```typescript
async function refreshAccessToken() {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  })
  
  if (!response.ok) {
    // Refresh failed, redirect to login
    window.location.href = '/login'
    throw new Error('Token refresh failed')
  }
  
  return response.json()
}
```

### Logout

To log out, call a server-side logout endpoint that properly clears httpOnly cookies:

#### Create Logout API Route (`app/api/auth/logout/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'

const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL || 'https://auth.zestacademy.tech'
const CLIENT_ID = process.env.OAUTH_CLIENT_ID

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from httpOnly cookie
    const refreshToken = request.cookies.get('refresh_token')?.value
    
    if (refreshToken) {
      // Revoke refresh token on auth server
      try {
        await fetch(`${AUTH_SERVER_URL}/api/oauth/revoke`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: refreshToken,
            token_type_hint: 'refresh_token',
            client_id: CLIENT_ID,
          }),
        })
      } catch (error) {
        console.error('Failed to revoke token:', error)
        // Continue with local logout even if revocation fails
      }
    }
    
    // Create response
    const response = NextResponse.json({ success: true })
    
    // Clear all auth cookies by setting Max-Age=0
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    
    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    
    response.cookies.set('user', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'logout_failed' },
      { status: 500 }
    )
  }
}
```

#### Client-Side Logout

```typescript
/**
 * Logout by calling server-side endpoint
 */
async function logout() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // Important: includes cookies
    })
    
    if (response.ok) {
      // Redirect to login page
      window.location.href = '/login'
    } else {
      console.error('Logout failed')
      // Still redirect to clear client-side state
      window.location.href = '/login'
    }
  } catch (error) {
    console.error('Logout error:', error)
    window.location.href = '/login'
  }
}
```

---

## Testing the Integration

### 1. Run the Seed Script

First, ensure your OAuth clients are registered:

```bash
cd zest.auth
npx prisma db seed
```

### 2. Test Locally

Start your auth server:
```bash
cd zest.auth
npm run dev  # Runs on http://localhost:3000
```

Start your client app (e.g., Zest Academy):
```bash
cd zest-academy
npm run dev  # Runs on http://localhost:3001
```

### 3. Test the Flow

1. Navigate to your app (http://localhost:3001)
2. Click "Sign in with Zest Account"
3. You should be redirected to `http://localhost:3000/api/oauth/authorize`
4. If not logged in, you'll be redirected to the login page
5. After login, you'll be redirected back to your app at `/auth/callback`
6. Your app exchanges the code for tokens
7. User is authenticated and redirected to dashboard

---

## Common Issues & Solutions

### Issue: "Invalid client_id"
**Solution**: Ensure you've run `npx prisma db seed` and the client_id matches exactly.

### Issue: "Redirect URI mismatch"
**Solution**: Check that your REDIRECT_URI in `.env` matches exactly what's registered in the database.

### Issue: "Missing PKCE verifier"
**Solution**: Ensure `sessionStorage` is working and the verifier is being stored before redirecting to the auth server.

### Issue: Infinite redirect loop
**Solution**: Make sure your callback handler properly clears the OAuth state and doesn't trigger another login.

---

## Security Checklist

- ✅ Use PKCE (code_challenge + code_verifier)
- ✅ Validate state parameter (CSRF protection)
- ✅ Store tokens in httpOnly cookies (XSS protection)
- ✅ Use HTTPS in production
- ✅ Implement token refresh logic
- ✅ Handle token expiration gracefully
- ✅ Never expose tokens in URLs or localStorage
- ✅ Implement proper logout with token revocation


Happy coding! 🚀
