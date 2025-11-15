# Task 11: Performance Optimization & Monitoring

**Status**: Not Started
**Priority**: Medium
**Estimated Effort**: 3-4 hours
**Dependencies**: Task 08 (E2E tests), Task 09 (Production deployment)

## Objective

Implement comprehensive performance optimization and monitoring to ensure Life OS delivers fast, responsive user experiences with metrics tracking, bundle optimization, and runtime performance improvements.

## Context

While Life OS is functional, we haven't optimized for:
- Bundle size and code splitting
- Image optimization
- Runtime performance
- Core Web Vitals
- Database query performance
- Animation performance
- Client-side rendering optimization

## Success Criteria

1. ✅ Core Web Vitals targets met (LCP < 2.5s, FID < 100ms, CLS < 0.1)
2. ✅ Bundle size optimized (< 200KB initial load)
3. ✅ Performance monitoring configured
4. ✅ Database queries optimized with indexes
5. ✅ Image optimization implemented
6. ✅ Code splitting configured properly
7. ✅ Runtime performance profiling tools added
8. ✅ Lighthouse score > 90 for all categories
9. ✅ Performance budget enforced in CI/CD
10. ✅ Real User Monitoring (RUM) active

## Implementation Steps

### Phase 1: Bundle Analysis & Optimization (45 mins)

1. **Install bundle analyzer**
   ```bash
   npm install -D @next/bundle-analyzer
   ```

2. **Configure bundle analyzer**
   ```javascript
   // next.config.js
   const withBundleAnalyzer = require('@next/bundle-analyzer')({
     enabled: process.env.ANALYZE === 'true',
   });

   module.exports = withBundleAnalyzer({
     // ... existing config

     // Enable SWC minification
     swcMinify: true,

     // Optimize images
     images: {
       formats: ['image/avif', 'image/webp'],
       deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
       imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
     },

     // Optimize fonts
     optimizeFonts: true,

     // Compiler optimizations
     compiler: {
       removeConsole: process.env.NODE_ENV === 'production',
     },
   });
   ```

3. **Analyze bundle**
   ```bash
   ANALYZE=true npm run build
   ```

4. **Optimize heavy dependencies**
   ```typescript
   // Before: Importing entire library
   import anime from 'animejs';

   // After: Dynamic import when needed
   const anime = await import('animejs').then(mod => mod.default);

   // Before: Importing all icons
   import * as Icons from 'lucide-react';

   // After: Import only needed icons
   import { Check, X, Plus } from 'lucide-react';
   ```

5. **Configure code splitting**
   ```typescript
   // app/dashboard/page.tsx
   import dynamic from 'next/dynamic';

   // Lazy load heavy components
   const AgentChat = dynamic(
     () => import('@/features/agents/components/AgentChat'),
     {
       loading: () => <div>Loading chat...</div>,
       ssr: false,
     }
   );

   const AnimationsDemo = dynamic(
     () => import('@/features/animations/components/Demo'),
     {
       loading: () => <div>Loading animations...</div>,
       ssr: false,
     }
   );
   ```

### Phase 2: Database Query Optimization (45 mins)

1. **Create database indexes**
   ```sql
   -- drizzle/migrations/XXXX_add_performance_indexes.sql

   -- Tasks feature indexes
   CREATE INDEX idx_tasks_user_id ON tasks(user_id);
   CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);
   CREATE INDEX idx_tasks_category ON tasks(category);
   CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed_at);

   -- Gamification indexes
   CREATE INDEX idx_achievements_user_id ON achievements(user_id);
   CREATE INDEX idx_achievements_unlocked_at ON achievements(unlocked_at);
   CREATE INDEX idx_streaks_user_id ON streaks(user_id);

   -- Conversations indexes
   CREATE INDEX idx_conversations_user_agent ON conversations(user_id, agent_type);
   CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

   -- Sessions indexes
   CREATE INDEX idx_sessions_user_id ON sessions(user_id);
   CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
   ```

2. **Optimize query patterns**
   ```typescript
   // src/features/tasks/optimized-queries.ts
   import { db } from '@/core/database';
   import { tasks } from './schema';
   import { eq, and, desc, sql } from 'drizzle-orm';

   export const optimizedTaskQueries = {
     // Before: N+1 query problem
     async getUserTasksSlow(userId: string) {
       const tasks = await db.select().from(tasks).where(eq(tasks.userId, userId));

       // Don't do this - makes separate query for each task
       for (const task of tasks) {
         const stats = await getTaskStats(task.id);
       }

       return tasks;
     },

     // After: Single optimized query with aggregations
     async getUserTasksFast(userId: string) {
       return db
         .select({
           id: tasks.id,
           title: tasks.title,
           completed: tasks.completedAt,
           totalTime: sql<number>`COALESCE(SUM(time_spent), 0)`,
         })
         .from(tasks)
         .where(eq(tasks.userId, userId))
         .groupBy(tasks.id, tasks.title, tasks.completedAt)
         .orderBy(desc(tasks.createdAt));
     },

     // Paginated queries for large datasets
     async getPaginatedTasks(userId: string, page = 1, limit = 20) {
       const offset = (page - 1) * limit;

       return db
         .select()
         .from(tasks)
         .where(eq(tasks.userId, userId))
         .limit(limit)
         .offset(offset)
         .orderBy(desc(tasks.createdAt));
     },

     // Use prepared statements for frequent queries
     getUserTasksPrepared: db
       .select()
       .from(tasks)
       .where(eq(tasks.userId, sql.placeholder('userId')))
       .prepare('get_user_tasks'),
   };
   ```

3. **Add query performance monitoring**
   ```typescript
   // src/core/database/monitoring.ts
   import { sql } from 'drizzle-orm';

   export const measureQuery = async <T>(
     name: string,
     query: () => Promise<T>
   ): Promise<T> => {
     const start = performance.now();
     try {
       const result = await query();
       const duration = performance.now() - start;

       if (duration > 100) {
         console.warn(`Slow query: ${name} took ${duration.toFixed(2)}ms`);
       }

       // Track in monitoring service
       trackMetric('database.query.duration', duration, { query: name });

       return result;
     } catch (error) {
       console.error(`Query failed: ${name}`, error);
       throw error;
     }
   };
   ```

### Phase 3: Image & Asset Optimization (30 mins)

1. **Optimize images with Next.js Image**
   ```typescript
   // components/OptimizedImage.tsx
   import Image from 'next/image';

   type OptimizedImageProps = {
     src: string;
     alt: string;
     width: number;
     height: number;
     priority?: boolean;
   };

   export function OptimizedImage({
     src,
     alt,
     width,
     height,
     priority = false,
   }: OptimizedImageProps) {
     return (
       <Image
         src={src}
         alt={alt}
         width={width}
         height={height}
         priority={priority}
         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
         placeholder="blur"
         blurDataURL={`data:image/svg+xml;base64,...`}
       />
     );
   }
   ```

2. **Preload critical assets**
   ```typescript
   // app/layout.tsx
   export default function RootLayout({ children }) {
     return (
       <html>
         <head>
           {/* Preload critical fonts */}
           <link
             rel="preload"
             href="/fonts/inter-var.woff2"
             as="font"
             type="font/woff2"
             crossOrigin="anonymous"
           />

           {/* Preconnect to external domains */}
           <link rel="preconnect" href="https://fonts.googleapis.com" />
           <link
             rel="preconnect"
             href="https://fonts.gstatic.com"
             crossOrigin="anonymous"
           />
         </head>
         <body>{children}</body>
       </html>
     );
   }
   ```

### Phase 4: Runtime Performance Monitoring (45 mins)

1. **Install Vercel Analytics & Speed Insights**
   ```bash
   npm install @vercel/analytics @vercel/speed-insights
   ```

2. **Configure Web Vitals tracking**
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

3. **Create custom performance tracking**
   ```typescript
   // src/lib/performance.ts
   export const trackWebVitals = (metric: {
     name: string;
     value: number;
     id: string;
   }) => {
     const body = JSON.stringify({
       name: metric.name,
       value: metric.value,
       id: metric.id,
       timestamp: Date.now(),
     });

     // Send to analytics
     if (navigator.sendBeacon) {
       navigator.sendBeacon('/api/vitals', body);
     } else {
       fetch('/api/vitals', {
         body,
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         keepalive: true,
       });
     }
   };
   ```

   ```typescript
   // app/api/vitals/route.ts
   import { NextResponse } from 'next/server';

   export async function POST(req: Request) {
     const metric = await req.json();

     // Log or store metric
     console.log('Web Vital:', metric);

     // Could send to analytics service
     // await sendToAnalytics(metric);

     return NextResponse.json({ success: true });
   }
   ```

4. **Add performance observer**
   ```typescript
   // src/lib/performance-observer.ts
   export const observePerformance = () => {
     if (typeof window === 'undefined') return;

     // Long Task Observer
     const observer = new PerformanceObserver((list) => {
       for (const entry of list.getEntries()) {
         if (entry.duration > 50) {
           console.warn('Long task detected:', {
             name: entry.name,
             duration: entry.duration,
             startTime: entry.startTime,
           });
         }
       }
     });

     observer.observe({ entryTypes: ['longtask'] });

     // Layout Shift Observer
     const clsObserver = new PerformanceObserver((list) => {
       for (const entry of list.getEntries()) {
         if ('hadRecentInput' in entry && !entry.hadRecentInput) {
           console.warn('Layout shift:', entry);
         }
       }
     });

     clsObserver.observe({ entryTypes: ['layout-shift'] });
   };
   ```

### Phase 5: Animation Performance (30 mins)

1. **Optimize Anime.js animations**
   ```typescript
   // src/lib/animations/optimized.ts
   import anime from 'animejs';

   export const optimizedAnimation = {
     // Use CSS transforms for better performance
     fadeInUp: (target: string | Element) => {
       return anime({
         targets: target,
         translateY: [20, 0],
         opacity: [0, 1],
         duration: 600,
         easing: 'easeOutCubic',
         // Use will-change for better performance
         begin: (anim) => {
           const targets = anim.animatables.map(a => a.target);
           targets.forEach((el: any) => {
             el.style.willChange = 'transform, opacity';
           });
         },
         complete: (anim) => {
           const targets = anim.animatables.map(a => a.target);
           targets.forEach((el: any) => {
             el.style.willChange = 'auto';
           });
         },
       });
     },

     // Use GPU acceleration
     slide: (target: string | Element) => {
       return anime({
         targets: target,
         translateX: [-100, 0],
         opacity: [0, 1],
         duration: 500,
         easing: 'easeOutQuad',
         // Force GPU acceleration
         translateZ: 0,
       });
     },
   };
   ```

2. **Add requestAnimationFrame throttling**
   ```typescript
   // src/lib/animations/throttle.ts
   export const throttleAnimation = (callback: () => void) => {
     let ticking = false;

     return () => {
       if (!ticking) {
         window.requestAnimationFrame(() => {
           callback();
           ticking = false;
         });

         ticking = true;
       }
     };
   };
   ```

### Phase 6: Performance Budget (30 mins)

1. **Create Lighthouse CI configuration**
   ```javascript
   // lighthouserc.js
   module.exports = {
     ci: {
       collect: {
         url: ['http://localhost:3000', 'http://localhost:3000/dashboard'],
         numberOfRuns: 3,
       },
       assert: {
         assertions: {
           'categories:performance': ['error', { minScore: 0.9 }],
           'categories:accessibility': ['error', { minScore: 0.9 }],
           'categories:best-practices': ['error', { minScore: 0.9 }],
           'categories:seo': ['error', { minScore: 0.9 }],
           'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
           'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
           'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
           'total-blocking-time': ['error', { maxNumericValue: 300 }],
         },
       },
       upload: {
         target: 'temporary-public-storage',
       },
     },
   };
   ```

2. **Add performance tests**
   ```bash
   npm install -D @lhci/cli
   ```

   ```json
   {
     "scripts": {
       "lighthouse": "lhci autorun",
       "perf:test": "npm run build && npm run lighthouse"
     }
   }
   ```

3. **Create GitHub Action for performance**
   ```yaml
   # .github/workflows/performance.yml
   name: Performance Tests

   on:
     pull_request:
       branches: [main, prod]

   jobs:
     lighthouse:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4

         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '20'

         - name: Install dependencies
           run: npm ci

         - name: Build application
           run: npm run build

         - name: Run Lighthouse CI
           run: |
             npm install -g @lhci/cli
             lhci autorun

         - name: Comment PR with results
           uses: treosh/lighthouse-ci-action@v9
           with:
             uploadArtifacts: true
   ```

### Phase 7: Caching Strategy (30 mins)

1. **Configure Next.js caching**
   ```typescript
   // app/api/tasks/route.ts
   export const revalidate = 60; // Revalidate every 60 seconds

   export async function GET() {
     const tasks = await db.select().from(tasks);

     return NextResponse.json(tasks, {
       headers: {
         'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
       },
     });
   }
   ```

2. **Implement client-side caching**
   ```typescript
   // src/lib/cache.ts
   class ClientCache {
     private cache = new Map<string, { data: any; timestamp: number }>();
     private ttl = 60000; // 1 minute

     set(key: string, data: any) {
       this.cache.set(key, {
         data,
         timestamp: Date.now(),
       });
     }

     get(key: string) {
       const entry = this.cache.get(key);

       if (!entry) return null;

       if (Date.now() - entry.timestamp > this.ttl) {
         this.cache.delete(key);
         return null;
       }

       return entry.data;
     }

     clear() {
       this.cache.clear();
     }
   }

   export const cache = new ClientCache();
   ```

## Performance Checklist

### Build Time
- [ ] Bundle size < 200KB (gzipped)
- [ ] No duplicate dependencies
- [ ] Code splitting configured
- [ ] Tree shaking working
- [ ] Source maps optimized for production

### Runtime
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] TTI < 3.5s
- [ ] No memory leaks

### Database
- [ ] All queries indexed
- [ ] No N+1 queries
- [ ] Connection pooling configured
- [ ] Query execution < 100ms

### Assets
- [ ] Images optimized (WebP/AVIF)
- [ ] Fonts preloaded
- [ ] Critical CSS inlined
- [ ] Non-critical JS deferred

## Monitoring Dashboards

1. **Vercel Analytics**
   - Real User Monitoring
   - Core Web Vitals
   - Audience insights

2. **Lighthouse CI**
   - Performance score trends
   - Regression detection
   - Budget enforcement

3. **Custom Dashboard**
   - Database query performance
   - API response times
   - Error rates
   - User engagement metrics

## Scripts to Add

```json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build",
    "lighthouse": "lhci autorun",
    "perf:test": "npm run build && npm run lighthouse",
    "perf:profile": "next build --profile"
  }
}
```

## Deliverables

1. ✅ Bundle size optimized
2. ✅ Database indexes created
3. ✅ Performance monitoring active
4. ✅ Lighthouse CI configured
5. ✅ Core Web Vitals tracked
6. ✅ Performance budget enforced
7. ✅ Animation performance optimized
8. ✅ Caching strategy implemented

## Validation Steps

1. Run `npm run analyze` - review bundle composition
2. Run `npm run lighthouse` - check all scores > 90
3. Test app with Chrome DevTools Performance tab
4. Check Vercel Analytics dashboard
5. Verify database query times < 100ms
6. Test on slow 3G network (Chrome DevTools)
7. Check for memory leaks (Chrome DevTools Memory)

## Notes

- Monitor real user data, not just lab data
- Focus on p75 metrics, not just averages
- Set up alerts for performance regressions
- Review performance monthly
- Balance optimization with maintainability
