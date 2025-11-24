# Login & Signup

Prompts used to implement the authentication flow.

## Initial Prompt
> You are designing and building a premium Apple-inspired SaaS web application for creating and responding to conversational forms (Typeform-like).
>
> This prompt defines the design system, future flow, and the project architecture — but in this round you must only build the Authentication experience (Login + Signup) with real authentication, nothing else. I have attached a reference photo of how I would like the auth page to be - as a reference.
>
> **GLOBAL DESIGN LANGUAGE**
> Apply consistently across all generated screens:
> *   **Aesthetic**: Liquid-glass panels (frosted translucency, soft blur), light calm gradients, neutral palette (white / off-white / soft gray / pastel hints), smooth radiuses, generous spacing, subtle shadows.
> *   **Motion**: Gentle fade/slide micro animations, soft easing curves, no harsh transitions.
> *   **Typography & Icons**: SF Pro–inspired font, thin minimalist icons, elegant hierarchy.
>
> **PRODUCT FLOW CONTEXT (Not to be built now)**
> For future rounds only:
> *   Authentication → Home
> *   Home → Form Builder
> *   Builder → Logic Editor
> *   Builder → Preview
> *   Builder → Share Settings
> *   Respondent Flow
> *   Dashboard → Response Detail
> *   Settings / Profile
> Do not implement any of this yet. Only authentication.
>
> **PROJECT STRUCTURE (Feature-Based Architecture)**
> Use a clean, scalable structure:
>
> ```text
> src/
> ├─ app/
> │   ├─ router.tsx
> │   ├─ providers.tsx
> │   └─ index.ts
> ├─ features/
> │   ├─ auth/
> │   │   ├─ api/
> │   │   │   └─ authApi.ts
> │   │   ├─ components/
> │   │   │   ├─ AuthCard.tsx
> │   │   │   ├─ LoginForm.tsx
> │   │   │   └─ SignupForm.tsx
> │   │   ├─ hooks/
> │   │   │   └─ useAuth.ts
> │   │   ├─ pages/
> │   │   │   ├─ LoginPage.tsx
> │   │   │   └─ SignupPage.tsx
> │   │   └─ index.ts
> │   └─ (Future features will be added here)
> ├─ shared/
> │   ├─ ui/
> │   │   ├─ GlassCard.tsx
> │   │   ├─ Button.tsx
> │   │   ├─ TextInput.tsx
> │   │   ├─ SocialButton.tsx
> │   │   └─ index.ts
> │   ├─ hooks/
> │   │   └─ useMediaQuery.ts
> │   ├─ utils/
> │   │   └─ clsx.ts
> │   └─ constants/
> │       └─ routes.ts
> ├─ styles/
> │   ├─ globals.css
> │   └─ theme.css
> └─ main.tsx
> ```
>
> **Folder Rules (Concise and Precise)**
> *   **features/*/api/**: All network calls for that feature (login, signup, session). Pure functions only. No UI.
> *   **features/*/components/**: Feature-specific UI components. Not shared globally. Minimal business logic.
> *   **features/*/hooks/**: Hooks specific to the feature (e.g. useAuth). May consume that feature’s API. No UI.
> *   **features/*/pages/**: Route-level pages. Assembles components and hooks. No deep business logic.
> *   **shared/ui/**: Reusable, purely visual components (Button, GlassCard, etc.). No feature-specific logic.
> *   **shared/hooks/**: Generic hooks for the entire app. Must not depend on feature-specific logic.
> *   **shared/utils/**: Small pure utilities (formatters, class merging, etc.).
>
> **AUTH SCREENS (Build These Only)**
> *   **Layout**: Centered frosted-glass auth panel (~420px width), blurred gradient background, minimal top-center branding, smooth subtle animations, mobile-first and responsive.
> *   **Forms**: Email + password inputs, real form validation, “Continue with Google” / “Continue with Apple” (pill buttons), primary CTA with soft shadow, link between login/signup.
> *   **Interactions**: Input focus glow, panel fade-in, button hover elevation, error messages fade gently.
> *   **Routing**: `/login`, `/signup`, `/` → redirect to `/login` unless authenticated.
> *   **Authentication**: Real authentication. Login, signup, logout, persisted session. Redirect authenticated users appropriately.
>
> **ROUND 1 RULES (IMPORTANT)**
> Implement only: Auth pages, Auth components, Auth routing, Auth API + hooks, Shared UI primitives, Global styling, layout, theme, animation setup.
> Do not implement anything related to: Projects, Builder, Logic, Dashboard, Respondent UI, Settings, Any CRUD except auth, Any navigation beyond auth.
> Stop after the full authentication flow is complete.

## Refinements
- **Knowledge Entry**: Based on my initial prompt, please generate a concise yet detailed knowledge entry, including the overall goal of the project, the design language and visual guidelines, our project architecture (feature-based—be detailed here), and any other aspects you consider important. Make it a lot more concise. Don't include next steps or the current state.
