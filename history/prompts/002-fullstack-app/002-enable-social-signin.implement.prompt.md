---
id: "002"
title: "Enable Social SignIn"
stage: "implement"
date: "2026-01-18"
surface: "agent"
model: "gemini-2.0-flash-exp"
feature: "auth"
branch: "main"
user: "user"
command: "enable social signin"
labels:
  - "auth"
  - "better-auth"
  - "social-login"
  - "frontend"
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "frontend/src/lib/auth.ts"
  - "frontend/src/app/(auth)/sign-in/page.tsx"
tests: []
prompt: "i have placed the google and github cllient id and secret enable the social signin options"
response: "Enabled Google and GitHub social providers in `auth.ts` and connected the sign-in buttons in `sign-in/page.tsx`."
---

# Prompt History Record

## User Request
i have placed the google and github cllient id and secret enable the social signin options

## Implementation Details
1.  **Modified `frontend/src/lib/auth.ts`**: Uncommented and enabled `google` and `github` providers in the `better-auth` configuration, mapping them to the standard environment variables (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`).
2.  **Modified `frontend/src/app/(auth)/sign-in/page.tsx`**:
    *   Added `handleSocialSignIn` function using `authClient.signIn.social`.
    *   Connected the GitHub and Google buttons to trigger this function.
    *   Added error handling and loading states to the buttons.

## Verification
-   The code changes rely on the environment variables being correctly set in `.env.local` as confirmed by the user.
-   The sign-in buttons now execute the social login flow instead of being static.
