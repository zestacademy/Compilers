# Single Sign-On (SSO) Implementation Guide

## Overview

This application now uses **OAuth 2.0 Single Sign-On (SSO)** via `auth.zestacademy.tech` for authentication. Users authenticate once with their ZestAcademy account and can access all integrated platforms:

- zestacademy.tech
- zestfolio.tech  
- zestcompilers.tech

## Architecture

### OAuth 2.0 Authorization Code Flow

```
1. User clicks "Login with ZestAcademy" 
   → Browser redirects to auth.zestacademy.tech/authorize

2. User authenticates on auth server (if not already logged in)
   → Auth server redirects back with authorization code

3. Backend exchanges code for access token (server-to-server)
   → Token stored in HTTP-only cookie

4. Client uses token to access user info
   → Token validated on each request
```

## Configuration

### Environment Variables

Add these to your `.env.local`:

```env
# OAuth SSO Configuration
NEXT_PUBLIC_AUTH_SERVER_URL=https://auth.zestacademy.tech
NEXT_PUBLIC_OAUTH_CLIENT_ID=zestcompilers
OAUTH_CLIENT_SECRET=your_oauth_client_secret
NEXT_PUBLIC_REDIRECT_URI=https://zestcompilers.tech/api/auth/callback
JWT_SECRET=your_jwt_secret_for_validation
COOKIE_SECRET=your_cookie_encryption_secret
```

### OAuth Registration

Register your client application with the auth server:

1. **Client ID**: `zestcompilers`
2. **Redirect URI**: `https://zestcompilers.tech/api/auth/callback`
3. **Allowed Scopes**: `openid profile email`
4. **Response Types**: `code`
5. **Grant Types**: `authorization_code`

## API Endpoints

### `/api/auth/login` (GET)

Initiates OAuth flow by redirecting to auth server.

**Flow**:
1. Generates CSRF state token
2. Stores state in HTTP-only cookie
3. Redirects to `auth.zestacademy.tech/authorize`

**Parameters sent to auth server**:
- `client_id`: Your application identifier
- `redirect_uri`: Where to send user after auth
- `response_type`: `code` (authorization code flow)
- `scope`: `openid profile email`
- `state`: CSRF protection token

### `/api/auth/callback` (GET)

Handles OAuth callback from auth server.

**Query Parameters**:
- `code`: Authorization code (exchange for token)
- `state`: CSRF state token (must match cookie)
- `error`: Error code if authentication failed

**Flow**:
1. Validates CSRF state token
2. Exchanges authorization code for access token (backend only)
3. Stores access token in HTTP-only cookie
4. Redirects to home page

**Security**:
- Client secret never exposed to browser
- Token exchange happens server-side only
- CSRF protection via state validation

### `/api/auth/me` (GET)

Returns current user information from JWT.

**Response**:
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://..."
  }
}
```

**Errors**:
- `401`: Not authenticated or invalid token

### `/api/auth/logout` (GET/POST)

Logs out user and clears session.

**Query Parameters**:
- `global`: Set to `true` for global logout across all platforms

**Flow**:
1. Clears local HTTP-only cookie
2. If `global=true`, calls auth server logout endpoint
3. Redirects to home page

## Security Implementation

### ✅ Requirements Met

1. **No Passwords Stored or Transmitted**
   - Users authenticate only on `auth.zestacademy.tech`
   - This app never handles passwords

2. **No JWTs in localStorage**
   - All tokens stored in HTTP-only cookies
   - Cookies not accessible via JavaScript

3. **Backend-Only Token Exchange**
   - Authorization code exchanged server-side
   - Client secret never exposed to browser

4. **Token Expiration Enforced**
   - JWT expiry (`exp`) validated on each request
   - Expired tokens rejected automatically

5. **Issuer & Audience Validation**
   - `iss` (issuer) must be `auth.zestacademy.tech`
   - `aud` (audience) must match client ID

### Cookie Configuration

```typescript
{
  httpOnly: true,        // Not accessible via JavaScript
  secure: true,          // HTTPS only in production
  sameSite: 'lax',       // CSRF protection
  maxAge: 604800,        // 7 days
  path: '/'
}
```

### CSRF Protection

- State parameter generated for each login attempt
- Stored in HTTP-only cookie
- Validated on callback
- Prevents unauthorized redirects

## Client Integration

### Login Button

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

<Link href="/api/auth/login">
  <Button>Login with ZestAcademy</Button>
</Link>
```

### User Profile Component

The `UserProfile` component automatically:
1. Fetches current user from `/api/auth/me`
2. Displays user avatar and info
3. Provides logout button

```tsx
import { UserProfile } from '@/components/layout/UserProfile'

<UserProfile />
```

### Protected API Routes

To protect an API route:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies } from '@/lib/cookie-utils'
import { validateJWT } from '@/lib/jwt-utils'

export async function GET(request: NextRequest) {
  const token = getTokenFromCookies(request.headers.get('cookie'))
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const validation = validateJWT(token)
  if (!validation.valid) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
  
  // Access user info: validation.payload.sub, .email, etc.
  // ... your protected route logic
}
```

## User Experience

### Login Flow

1. User visits zestcompilers.tech
2. Clicks "Login with ZestAcademy"
3. Redirected to auth.zestacademy.tech
4. Enters credentials (if not already logged in)
5. Grants consent (first time only)
6. Redirected back to zestcompilers.tech (logged in)

### Logout Flow

**Local Logout**:
- Clears session for this app only
- User still logged in on other platforms

**Global Logout**:
- Clears session on auth server
- User logged out from all platforms

## Testing

### Local Development

For local testing, you can use mock auth server or update redirect URIs:

```env
NEXT_PUBLIC_AUTH_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

### Test Checklist

- [ ] Login redirects to auth server correctly
- [ ] After auth, user redirected back with code
- [ ] Token stored in HTTP-only cookie
- [ ] User info displayed in profile
- [ ] Protected routes require authentication
- [ ] Logout clears cookie
- [ ] Global logout invalidates session on auth server
- [ ] Token expiration handled gracefully
- [ ] CSRF state validation works

## Troubleshooting

### "CSRF state mismatch"

**Cause**: State cookie not persisting or tampered with

**Solutions**:
- Check cookie settings (domain, secure, sameSite)
- Ensure cookies enabled in browser
- Verify domain matches redirect URI

### "Token exchange failed"

**Cause**: Invalid client credentials or authorization code

**Solutions**:
- Verify `OAUTH_CLIENT_SECRET` is correct
- Check authorization code hasn't expired (usually 10 min)
- Ensure redirect URI matches exactly

### "Invalid issuer" or "Invalid audience"

**Cause**: JWT validation failing

**Solutions**:
- Verify `NEXT_PUBLIC_AUTH_SERVER_URL` matches JWT `iss` claim
- Ensure `NEXT_PUBLIC_OAUTH_CLIENT_ID` matches JWT `aud` claim

### User not persisting after refresh

**Cause**: Cookie not being sent or token expired

**Solutions**:
- Check cookie domain and path settings
- Verify token hasn't expired
- Ensure HTTP-only cookie flag not preventing legitimate access

## Migration from Firebase Auth

If migrating from Firebase Authentication:

1. Users will need to re-authenticate using SSO
2. Old Firebase tokens will be invalid
3. Update any code referencing Firebase auth:
   - `auth.currentUser` → `/api/auth/me`
   - `signInWithPopup()` → `/api/auth/login`
   - `signOut()` → `/api/auth/logout`

## Support

For auth server issues or OAuth client registration:
- Contact: auth-support@zestacademy.tech
- Documentation: https://docs.zestacademy.tech/sso

## Security Considerations

### Best Practices

✅ **Implemented**:
- HTTP-only cookies for token storage
- CSRF protection via state parameter
- Server-side token exchange
- JWT validation (expiry, issuer, audience)
- Secure cookie flags in production
- No client secrets in frontend code

⚠️ **Additional Recommendations**:
- Implement token refresh mechanism
- Add rate limiting to auth endpoints
- Monitor for suspicious login patterns
- Regular security audits
- Keep dependencies updated

### Compliance

This implementation follows:
- OAuth 2.0 RFC 6749
- OpenID Connect Core 1.0
- OWASP Authentication Guidelines
- GDPR data protection requirements
