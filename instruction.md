# Project Structure and Pages

## Pages/Routes
- `/` - Landing page (app/page.tsx)
- `/signin` - Sign In page (app/signin/page.tsx)
- `/signup` - Sign Up page (app/signup/page.tsx)
- `/admin` - Admin Dashboard (app/admin/page.tsx) [Protected - requires ADMIN role]
- `/security-manager` - Security Manager Dashboard (app/security-manager/page.tsx) [Protected - requires SECURITY_MANAGER role]
- `/department-manager` - Department Manager Dashboard (app/department-manager/page.tsx) [Protected - requires DEPARTMENT_MANAGER role]
- `/user-dashboard` - User Dashboard (app/user-dashboard/page.tsx) [Protected - requires USER role]
- `/assessment` - Assessment page (app/assessment/page.tsx)

## Dummy Accounts for Testing
The application includes pre-seeded user accounts for testing different roles:

| Role | Email | Password | Name | Department |
|------|-------|----------|------|------------|
| Admin | admin@example.com | Admin123! | مشرف النظام | إدارة النظام |
| Security Manager | security@example.com | Security123! | مدير الأمن | الأمن السيبراني |
| Department Manager | department@example.com | Department123! | مدير القسم | تكنولوجيا المعلومات |
| Regular User | user@example.com | User123! | مستخدم عادي | الموارد البشرية |

You can use these accounts to test the role-based access control and different dashboard views.

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

## Authentication System
The application includes a complete authentication system with:

- User registration and login
- Password hashing with bcryptjs
- Role-based access control
- Protected routes
- Authentication state management with React Context

### Authentication Files
- `lib/auth.ts` - Authentication utility functions
- `lib/auth-context.tsx` - Authentication context provider
- `lib/protected-route.tsx` - Higher-order component for route protection
- `app/api/auth/signup/route.ts` - API route for user registration
- `app/api/auth/login/route.ts` - API route for user authentication
- `middleware.ts` - Middleware for route protection

## Database
The application uses SQLite with Prisma ORM for data persistence:

- `prisma/schema.prisma` - Database schema
- `prisma/dev.db` - SQLite database file
- `prisma/seed.js` - Database seeding script

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
