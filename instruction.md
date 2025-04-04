# Project Structure and Pages

## Pages/Routes
- `/` - Landing page (app/page.tsx)
- `/signin` - Sign In page (app/signin/page.tsx)
- `/signup` - Sign Up page (app/signup/page.tsx)
- `/dashboard` - Dashboard page (app/dashboard/page.tsx) [Protected - requires authentication]
- `/assessment` - Assessment page (app/assessment/page.tsx)

## Components
### Base Components
- `components/button.tsx`
- `components/card.tsx`
- `components/input.tsx`

### UI Components
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/input.tsx`
- `components/ui/select.tsx`

## Core Files
### App Configuration
- `app/layout.tsx` - Root layout component
- `app/globals.css` - Global styles
- `app/favicon.ico` - Site favicon

### Configuration Files
- `next.config.mjs` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tailwind.config.ts` - Tailwind CSS TypeScript configuration
- `tsconfig.json` - TypeScript configuration
- `postcss.config.mjs` - PostCSS configuration
- `.eslintrc.json` - ESLint configuration
- `package.json` - Project dependencies and scripts

### Utility Files
- `lib/utils.ts` - Utility functions

### Assets
- `app/fonts/GeistMonoVF.woff` - Geist Mono Variable Font
- `app/fonts/GeistVF.woff` - Geist Variable Font
