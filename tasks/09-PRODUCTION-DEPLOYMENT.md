# Task 09: Production Deployment Setup

**Status**: Not Started
**Priority**: High
**Estimated Effort**: 2-3 hours
**Dependencies**: Task 08 (E2E tests to validate deployment)

## Objective

Configure production-ready deployment infrastructure for Life OS on Vercel with PostgreSQL database, environment management, monitoring, and CI/CD automation.

## Context

Currently, Life OS runs in development mode with SQLite. For production deployment, we need:
- PostgreSQL database (production-ready persistence)
- Environment variable management
- Vercel deployment configuration
- Database migrations in CI/CD
- Health checks and monitoring
- Error tracking
- Performance monitoring

## Success Criteria

1. ✅ Vercel project configured and connected to Git
2. ✅ PostgreSQL database provisioned (Neon/Supabase)
3. ✅ Environment variables configured securely
4. ✅ Database migrations run automatically on deploy
5. ✅ Production build succeeds without errors
6. ✅ Health check endpoint implemented
7. ✅ Error tracking configured (Sentry)
8. ✅ Performance monitoring enabled
9. ✅ Preview deployments for PRs
10. ✅ Production deployment successful

## Implementation Steps

### Phase 1: Database Setup (30 mins)

1. **Choose database provider**
   - Option 1: Neon (serverless PostgreSQL)
   - Option 2: Supabase (PostgreSQL + auth + storage)
   - Option 3: Vercel Postgres

2. **Provision database**
   ```bash
   # Using Neon CLI
   npx neonctl projects create life-os-prod
   npx neonctl connection-string --database-name life_os
   ```

3. **Update Drizzle config for production**
   ```typescript
   // drizzle.config.ts
   import type { Config } from 'drizzle-kit';

   const isDevelopment = process.env.NODE_ENV === 'development';

   export default {
     schema: './src/features/**/schema.ts',
     out: './drizzle',
     driver: 'pg',
     dbCredentials: {
       connectionString: isDevelopment
         ? process.env.DATABASE_URL_DEV || 'file:./dev.db'
         : process.env.DATABASE_URL!,
     },
     verbose: true,
     strict: true,
   } satisfies Config;
   ```

4. **Update database client**
   ```typescript
   // src/core/database/client.ts
   import { drizzle } from 'drizzle-orm/neon-http';
   import { neon } from '@neondatabase/serverless';

   const sql = neon(process.env.DATABASE_URL!);
   export const db = drizzle(sql);
   ```

5. **Install production database packages**
   ```bash
   npm install @neondatabase/serverless
   npm install -D pg @types/pg
   ```

### Phase 2: Environment Configuration (20 mins)

1. **Create environment files**
   ```bash
   # .env.local (development)
   DATABASE_URL=file:./dev.db
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=dev-secret-change-in-production
   NODE_ENV=development

   # .env.production (template - do not commit)
   DATABASE_URL=postgresql://user:pass@host/db
   NEXTAUTH_URL=https://life-os.vercel.app
   NEXTAUTH_SECRET=<generate-strong-secret>
   NODE_ENV=production
   SENTRY_DSN=<your-sentry-dsn>
   ```

2. **Create environment validation**
   ```typescript
   // src/lib/env.ts
   import { z } from 'zod';

   const envSchema = z.object({
     DATABASE_URL: z.string().min(1),
     NEXTAUTH_URL: z.string().url(),
     NEXTAUTH_SECRET: z.string().min(32),
     NODE_ENV: z.enum(['development', 'test', 'production']),
     SENTRY_DSN: z.string().optional(),
   });

   export const env = envSchema.parse(process.env);
   ```

3. **Update next.config.js**
   ```javascript
   // next.config.js
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     reactStrictMode: true,
     poweredByHeader: false,

     env: {
       NEXTAUTH_URL: process.env.NEXTAUTH_URL,
     },

     // Security headers
     async headers() {
       return [
         {
           source: '/:path*',
           headers: [
             {
               key: 'X-DNS-Prefetch-Control',
               value: 'on',
             },
             {
               key: 'Strict-Transport-Security',
               value: 'max-age=63072000; includeSubDomains; preload',
             },
             {
               key: 'X-Frame-Options',
               value: 'SAMEORIGIN',
             },
             {
               key: 'X-Content-Type-Options',
               value: 'nosniff',
             },
             {
               key: 'X-XSS-Protection',
               value: '1; mode=block',
             },
             {
               key: 'Referrer-Policy',
               value: 'origin-when-cross-origin',
             },
           ],
         },
       ];
     },
   };

   module.exports = nextConfig;
   ```

### Phase 3: Vercel Configuration (30 mins)

1. **Create vercel.json**
   ```json
   {
     "buildCommand": "npm run build",
     "devCommand": "npm run dev",
     "installCommand": "npm ci",
     "framework": "nextjs",
     "regions": ["iad1"],
     "env": {
       "DATABASE_URL": "@database_url",
       "NEXTAUTH_SECRET": "@nextauth_secret"
     },
     "build": {
       "env": {
         "DATABASE_URL": "@database_url"
       }
     },
     "crons": [
       {
         "path": "/api/cron/cleanup",
         "schedule": "0 0 * * *"
       }
     ]
   }
   ```

2. **Install Vercel CLI**
   ```bash
   npm install -D vercel
   ```

3. **Link to Vercel project**
   ```bash
   npx vercel link
   npx vercel env pull .env.local
   ```

4. **Configure environment variables in Vercel**
   ```bash
   # Set via CLI
   vercel env add DATABASE_URL production
   vercel env add NEXTAUTH_SECRET production
   vercel env add NEXTAUTH_URL production
   vercel env add SENTRY_DSN production

   # Or via Vercel Dashboard
   # Project Settings > Environment Variables
   ```

### Phase 4: Database Migrations (30 mins)

1. **Create migration script**
   ```typescript
   // scripts/migrate-production.ts
   import { drizzle } from 'drizzle-orm/neon-http';
   import { migrate } from 'drizzle-orm/neon-http/migrator';
   import { neon } from '@neondatabase/serverless';

   async function runMigrations() {
     if (!process.env.DATABASE_URL) {
       throw new Error('DATABASE_URL is not set');
     }

     console.log('🔄 Running migrations...');

     const sql = neon(process.env.DATABASE_URL);
     const db = drizzle(sql);

     await migrate(db, { migrationsFolder: './drizzle' });

     console.log('✅ Migrations completed successfully');
   }

   runMigrations()
     .then(() => process.exit(0))
     .catch((error) => {
       console.error('❌ Migration failed:', error);
       process.exit(1);
     });
   ```

2. **Add migration to build process**
   ```json
   {
     "scripts": {
       "build": "npm run db:migrate && next build",
       "db:migrate": "tsx scripts/migrate-production.ts",
       "db:generate": "drizzle-kit generate:pg",
       "db:push": "drizzle-kit push:pg"
     }
   }
   ```

3. **Create GitHub Actions workflow**
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to Production

   on:
     push:
       branches: [prod]

   jobs:
     deploy:
       runs-on: ubuntu-latest

       steps:
         - uses: actions/checkout@v4

         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'

         - name: Install dependencies
           run: npm ci

         - name: Run tests
           run: npm test

         - name: Run E2E tests
           run: npm run test:e2e

         - name: Deploy to Vercel
           uses: amondnet/vercel-action@v25
           with:
             vercel-token: ${{ secrets.VERCEL_TOKEN }}
             vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
             vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
             vercel-args: '--prod'
   ```

### Phase 5: Health Checks & Monitoring (30 mins)

1. **Create health check endpoint**
   ```typescript
   // app/api/health/route.ts
   import { NextResponse } from 'next/server';
   import { db } from '@/core/database';

   export async function GET() {
     try {
       // Check database connection
       await db.execute('SELECT 1');

       return NextResponse.json({
         status: 'healthy',
         timestamp: new Date().toISOString(),
         database: 'connected',
         environment: process.env.NODE_ENV,
       });
     } catch (error) {
       return NextResponse.json(
         {
           status: 'unhealthy',
           timestamp: new Date().toISOString(),
           database: 'disconnected',
           error: error instanceof Error ? error.message : 'Unknown error',
         },
         { status: 503 }
       );
     }
   }
   ```

2. **Install Sentry**
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

3. **Configure Sentry**
   ```typescript
   // sentry.client.config.ts
   import * as Sentry from '@sentry/nextjs';

   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     tracesSampleRate: 1.0,
     debug: false,
     environment: process.env.NODE_ENV,
     integrations: [
       new Sentry.BrowserTracing(),
       new Sentry.Replay(),
     ],
     replaysSessionSampleRate: 0.1,
     replaysOnErrorSampleRate: 1.0,
   });
   ```

   ```typescript
   // sentry.server.config.ts
   import * as Sentry from '@sentry/nextjs';

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     tracesSampleRate: 1.0,
     debug: false,
     environment: process.env.NODE_ENV,
   });
   ```

4. **Add performance monitoring**
   ```typescript
   // app/layout.tsx
   import { Analytics } from '@vercel/analytics/react';
   import { SpeedInsights } from '@vercel/speed-insights/next';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
           <SpeedInsights />
         </body>
       </html>
     );
   }
   ```

### Phase 6: Cron Jobs & Cleanup (20 mins)

1. **Create cleanup cron job**
   ```typescript
   // app/api/cron/cleanup/route.ts
   import { NextResponse } from 'next/server';
   import { db } from '@/core/database';

   export async function GET(request: Request) {
     // Verify cron secret
     const authHeader = request.headers.get('authorization');
     if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
       return new NextResponse('Unauthorized', { status: 401 });
     }

     try {
       // Clean up old sessions
       await db.execute(`
         DELETE FROM sessions
         WHERE expires_at < NOW() - INTERVAL '7 days'
       `);

       // Clean up deleted tasks
       await db.execute(`
         DELETE FROM tasks
         WHERE deleted_at IS NOT NULL
         AND deleted_at < NOW() - INTERVAL '30 days'
       `);

       return NextResponse.json({
         success: true,
         timestamp: new Date().toISOString(),
       });
     } catch (error) {
       return NextResponse.json(
         { error: 'Cleanup failed' },
         { status: 500 }
       );
     }
   }
   ```

## Testing Strategy

### Pre-Deployment Checklist

```bash
# 1. Build locally
npm run build
npm start

# 2. Test production build
npm run build && npm start
# Visit http://localhost:3000 and test all features

# 3. Run all tests
npm test
npm run test:e2e

# 4. Check type safety
npm run type-check

# 5. Check for security issues
npm audit

# 6. Verify environment variables
node -e "console.log(require('./src/lib/env').env)"
```

### Post-Deployment Validation

```bash
# 1. Check health endpoint
curl https://life-os.vercel.app/api/health

# 2. Test login flow
# Visit https://life-os.vercel.app/auth/login

# 3. Check Sentry for errors
# Visit Sentry dashboard

# 4. Monitor Vercel analytics
# Visit Vercel dashboard

# 5. Run smoke tests
npm run test:e2e:smoke
```

## Rollback Strategy

1. **Instant rollback via Vercel dashboard**
   - Deployments > Previous deployment > Promote to Production

2. **Git revert**
   ```bash
   git revert <commit-hash>
   git push origin prod
   ```

3. **Database rollback**
   ```bash
   # Run down migration
   npm run db:rollback
   ```

## Scripts to Add

```json
{
  "scripts": {
    "deploy:preview": "vercel",
    "deploy:prod": "vercel --prod",
    "db:migrate:prod": "tsx scripts/migrate-production.ts",
    "health:check": "curl $NEXTAUTH_URL/api/health",
    "vercel:env": "vercel env pull",
    "vercel:link": "vercel link"
  }
}
```

## Security Checklist

- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Environment variables stored securely
- [ ] Security headers configured
- [ ] Database credentials rotated
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Drizzle ORM)
- [ ] XSS prevention (React escaping)
- [ ] CSRF protection (NextAuth)

## Deliverables

1. ✅ Vercel project configured
2. ✅ Production database provisioned
3. ✅ Environment variables set
4. ✅ CI/CD pipeline working
5. ✅ Health check endpoint
6. ✅ Error tracking configured
7. ✅ Performance monitoring enabled
8. ✅ Deployment documentation

## Validation Steps

1. Visit production URL - app loads without errors
2. Test user registration and login
3. Create and complete tasks
4. Check gamification features work
5. Verify animations play smoothly
6. Check Sentry for any errors
7. Verify database migrations applied
8. Test preview deployments on PRs

## Notes

- Keep production and preview environments separate
- Monitor costs (database, Vercel, Sentry)
- Set up alerts for critical errors
- Document runbook for common issues
- Plan for database backups
