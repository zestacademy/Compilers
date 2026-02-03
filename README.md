This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🔧 Configuration Required

This project includes multiple online compilers and features that require API credentials to function:

### 1. JDoodle API (for C and Java Compilers)

1. Visit [JDoodle Compiler API](https://www.jdoodle.com/compiler-api)
2. Sign up for a free account
3. Get your **Client ID** and **Client Secret**
4. Free tier includes: **200 credits/day** (sufficient for testing)

### 2. Google Gemini API (for Python Compiler's Explain Feature)

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 3. OAuth SSO Configuration (for User Authentication)

**🔐 Single Sign-On via ZestAcademy**

This application uses OAuth 2.0 SSO through `auth.zestacademy.tech` for secure authentication. Users authenticate once and can access all ZestAcademy platforms (zestacademy.tech, zestfolio.tech, zestcompilers.tech).

**Required Environment Variables**:
```env
NEXT_PUBLIC_AUTH_SERVER_URL=https://auth.zestacademy.tech
NEXT_PUBLIC_OAUTH_CLIENT_ID=zestcompilers
OAUTH_CLIENT_SECRET=your_oauth_client_secret
NEXT_PUBLIC_REDIRECT_URI=https://zestcompilers.tech/api/auth/callback
JWT_SECRET=your_jwt_secret_for_validation
COOKIE_SECRET=your_cookie_encryption_secret
```

**Key Features**:
- 🔒 No passwords stored or handled by this app
- 🍪 Secure HTTP-only cookies for token storage
- 🔑 Backend-only token exchange (client secrets never exposed)
- ✅ JWT validation (expiry, issuer, audience)
- 🌐 Global logout support across all platforms

📖 **Implementation Guides**:
- [SSO_IMPLEMENTATION.md](./SSO_IMPLEMENTATION.md) - Current server-side OAuth implementation
- [OAUTH_CLIENT_INTEGRATION.md](./OAUTH_CLIENT_INTEGRATION.md) - OAuth 2.0 with PKCE client integration guide

### 4. Firebase (Legacy - for Database Only)

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Go to **Project Settings** > **General**
4. Scroll down to **"Your apps"** section
5. Click on the web app icon (</>) or create a new web app
6. Copy all the configuration values (apiKey, authDomain, projectId, etc.)

**Note**: Firebase is now used only for database features. Authentication is handled via OAuth SSO (see above).

### 5. Setup Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   # JDoodle API
   JDOODLE_CLIENT_ID=your_actual_client_id
   JDOODLE_CLIENT_SECRET=your_actual_client_secret
   
   # Google Gemini API
   GEMINI_API_KEY=your_actual_gemini_api_key
   
   # OAuth SSO Configuration (REQUIRED)
   NEXT_PUBLIC_AUTH_SERVER_URL=https://auth.zestacademy.tech
   NEXT_PUBLIC_OAUTH_CLIENT_ID=zestcompilers
   OAUTH_CLIENT_SECRET=your_oauth_client_secret
   NEXT_PUBLIC_REDIRECT_URI=https://zestcompilers.tech/api/auth/callback
   JWT_SECRET=your_jwt_secret_for_validation
   COOKIE_SECRET=your_cookie_encryption_secret
   
   # Firebase Configuration (for Database only)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_actual_measurement_id
   ```

3. Restart your development server

**Note:** 
- The Python compiler will work without API keys (uses Pyodide in browser), but the "Explain" feature requires Gemini API. 
- The C and Java compilers require JDoodle API to function.
- **OAuth SSO is REQUIRED for user authentication** - see [SSO_IMPLEMENTATION.md](./SSO_IMPLEMENTATION.md) for setup details.
- Firebase is used for database features only (authentication is via OAuth SSO).
- All API calls are made server-side for security (credentials are never exposed to the browser).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
