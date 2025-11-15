# Composed Claude Code Configuration

This configuration combines: Next.js 15, shadcn/ui, Memory MCP Server, Vercel AI SDK, Drizzle ORM, Tailwind CSS

---

## Project Context

*Combined from: Next.js 15, shadcn/ui, Memory MCP Server, Vercel AI SDK, Drizzle ORM, Tailwind CSS*

This is a comprehensive project that combines multiple technologies:

This is a Next.js 15 application using:

- **App Router** (not Pages Router)
- **React 19** with Server Components by default
- **TypeScript** for type safety
- **Tailwind CSS** for styling (if configured)
- **Server Actions** for mutations
- **Turbopack** for faster builds (optional)

This is a shadcn/ui project focused on:

- **Component-first development** with copy-paste architecture
- **Radix UI primitives** for behavior and accessibility
- **Tailwind CSS** for utility-first styling
- **TypeScript** for type-safe component APIs
- **React 18/19** with modern patterns (Server Components when applicable)
- **Accessibility-first** design with full keyboard and screen reader support

This is a Memory MCP Server project focused on:

- **Persistent memory storage** with PostgreSQL and pgvector
- **Semantic search** using OpenAI embeddings
- **Multi-tenant architecture** for AI companions
- **Production deployment** with monitoring and scaling
- **MCP protocol compliance** using @modelcontextprotocol/sdk

This project uses the **Vercel AI SDK** for building AI applications with:

- **Multiple providers** - Anthropic, OpenAI, Google, etc.
- **Streaming responses** - Real-time AI interactions
- **Function calling** - Tool use and structured outputs
- **React integration** - useChat, useCompletion hooks
- **Edge runtime support** - Optimized for serverless
- **TypeScript-first** - Full type safety

This project uses **Drizzle ORM** for type-safe database operations with:

- **TypeScript-first** approach with full type inference
- **SQL-like syntax** that's familiar and powerful
- **Multiple database support** - PostgreSQL, MySQL, SQLite
- **Automatic migrations** with schema versioning
- **Performance optimized** with prepared statements
- **Edge runtime compatible** - Works with serverless

This project uses **Tailwind CSS** for styling with:

- **Utility-first approach** for rapid development
- **Responsive design** with mobile-first methodology
- **Custom design system** with consistent spacing and colors
- **Component patterns** for reusable UI elements
- **Performance optimization** with CSS purging
- **Dark mode support** with class-based theming
- **Plugin ecosystem** for extended functionality

## Security Best Practices

*Combined from: Next.js 15, shadcn/ui, Memory MCP Server, Vercel AI SDK*

1. **Always validate Server Actions input** with Zod or similar
2. **Authenticate and authorize** in Server Actions and middleware
3. **Sanitize user input** before rendering
4. **Use environment variables correctly**:
   - `NEXT_PUBLIC_*` for client-side
   - Others stay server-side only
5. **Implement rate limiting** for public actions
6. **Configure CSP headers** in next.config.js
7. **Sanitize user input** in dynamic content
8. **Validate form data** with Zod schemas
9. **Use TypeScript** for type safety
10. **Escape HTML** in user-generated content
11. **Implement CSP** headers when applicable
12. **API Key Management**
   - Store keys in environment variables
   - Never expose keys in client-side code
   - Use different keys for development/production
   - Rotate keys regularly
13. **Input Validation**
   - Validate all user inputs with Zod
   - Sanitize data before sending to AI
   - Implement rate limiting on API endpoints
   - Set message length limits
14. **Output Security**
   - Sanitize AI responses before rendering
   - Implement content filtering for inappropriate responses
   - Handle streaming errors gracefully
   - Log security events for monitoring

## Performance Optimization

*Combined from: Next.js 15, shadcn/ui, Memory MCP Server, Vercel AI SDK, Drizzle ORM, Tailwind CSS*

1. **Use Server Components** to reduce bundle size
2. **Implement streaming** with Suspense boundaries
3. **Optimize images** with next/image component
4. **Use dynamic imports** for code splitting
5. **Configure proper caching** strategies
6. **Enable Partial Prerendering** (experimental) when stable
7. **Monitor Core Web Vitals**
8. **Streaming Efficiency**
   - Use appropriate chunk sizes for streaming
   - Implement proper backpressure handling
   - Cache provider instances
   - Use Edge Runtime when possible
9. **Provider Selection**
   - Choose appropriate models for task complexity
   - Implement intelligent provider fallbacks
   - Monitor response times and costs
   - Use faster models for simple tasks
10. **Client-Side Optimization**
   - Implement message deduplication
   - Use React.memo for message components
   - Implement virtual scrolling for long conversations
   - Optimize re-renders with proper key usage

## Common Commands

*Combined from: Next.js 15, shadcn/ui, Memory MCP Server, Vercel AI SDK, Drizzle ORM*

```bash

## ⚠️ Breaking Changes from Next.js 14

1. **Async Request APIs**: `params`, `searchParams`, `cookies()`, and `headers()` are now async

   ```typescript
   // ❌ OLD (Next.js 14)
   export default function Page({ params, searchParams }) {
     const id = params.id;
   }
   
   // ✅ NEW (Next.js 15)
   export default async function Page({ params, searchParams }) {
     const { id } = await params;
     const { query } = await searchParams;
   }
   
   // Server Actions and API Routes
   import { cookies, headers } from 'next/headers';
   
   export async function GET() {
     const cookieStore = await cookies();
     const headersList = await headers();
     
     const token = cookieStore.get('auth');
     const userAgent = headersList.get('user-agent');
   }
   ```

2. **React 19 Required**: Minimum React version is 19.0.0
   - Update package.json: `"react": "19.0.0"`
   - Update React types: `"@types/react": "^19.0.0"`

3. **`useFormState` → `useActionState`**: Import from 'react' not 'react-dom'
   ```typescript
   // ❌ OLD
   import { useFormState } from 'react-dom';
   
   // ✅ NEW  
   import { useActionState } from 'react';
   ```

4. **Fetch Caching**: Fetch requests are no longer cached by default
   ```typescript
   // ❌ OLD (cached by default)
   const data = await fetch('/api/data');
   
   // ✅ NEW (explicit caching required)
   const data = await fetch('/api/data', {
     next: { revalidate: 3600 } // Cache for 1 hour
   });
   ```

5. **TypeScript 5+**: Minimum TypeScript version is 5.0
   - Update tsconfig.json for stricter checking
   - Use new TypeScript features like const type parameters

## 2. File Conventions

Always use these file names in the `app/` directory:

- `page.tsx` - Route page component
- `layout.tsx` - Shared layout wrapper
- `loading.tsx` - Loading UI (Suspense fallback)
- `error.tsx` - Error boundary (must be Client Component)
- `not-found.tsx` - 404 page
- `route.ts` - API route handler
- `template.tsx` - Re-rendered layout
- `default.tsx` - Parallel route fallback

## 3. Data Fetching Patterns

```typescript
// ✅ GOOD: Fetch in Server Component
async function ProductList() {
  const products = await db.products.findMany();
  return <div>{/* render products */}</div>;
}

// ❌ AVOID: Client-side fetching when not needed
'use client';
function BadPattern() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch('/api/data')... }, []);
}
```

## 3. Installation Patterns

```bash

## 🏗️ Architecture Patterns

- **RAG Systems** - Embeddings, vector databases, semantic search, knowledge retrieval
- **Multi-Modal Applications** - Image/PDF processing, document analysis, media handling
- **Streaming Applications** - Real-time responses, chat interfaces, progressive updates
- **Agent Systems** - Tool calling, multi-step workflows, function execution
- **Provider Management** - Multi-provider setups, fallbacks, cost optimization

## 3. Animation Performance

```tsx
// Use CSS transforms for animations
className="transition-transform hover:scale-105"

// Avoid layout shifts
className="transform-gpu"
```

## Query Testing

*Combined from: Next.js 15, shadcn/ui, Memory MCP Server, Vercel AI SDK, Drizzle ORM*

- **Unit tests**: Jest/Vitest for logic and utilities
- **Component tests**: React Testing Library
- **E2E tests**: Playwright or Cypress
- **Server Components**: Test data fetching logic separately
- **Server Actions**: Mock and test validation/business logic
npm run test
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
test('button click', async () => {
  const user = userEvent.setup()
  const handleClick = jest.fn()
  render(<Button onClick={handleClick}>Click me</Button>)
  await user.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```
import { axe } from 'jest-axe'
test('no accessibility violations', async () => {
  const { container } = render(<Card>Content</Card>)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```
npm run mcp:test      # Test MCP server
npm run mcp:debug     # Debug MCP protocol
```
```bash
npm test                                        # Run tests
npm run test:api                               # Test API endpoints
npm run test:stream                            # Test streaming functionality
```
```typescript
import { POST } from '@/app/api/chat/route';
describe('/api/chat', () => {
  it('should stream responses', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8');
  });
});
```
import { renderHook, act } from '@testing-library/react';
import { useChat } from 'ai/react';
describe('useChat', () => {
  it('should handle message submission', async () => {
    const { result } = renderHook(() => useChat({ api: '/api/chat' }));
    act(() => {
      result.current.setInput('Test message');
    });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.messages).toHaveLength(2);
  });
});
```
// tests/queries.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from './setup';
import { users } from '@/schema/users';
import { createUser, getUserByEmail } from '@/lib/queries/users';
describe('User Queries', () => {
  let db: ReturnType<typeof createTestDb>;
  beforeEach(() => {
    db = createTestDb();
  });
  it('should create and retrieve user', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
    };
    const user = await createUser(userData);
    expect(user.email).toBe(userData.email);
    const retrievedUser = await getUserByEmail(userData.email);
    expect(retrievedUser).toEqual(user);
  });
});
```

## Deployment Considerations

1. **Environment Variables**
   - Configure all provider API keys
   - Set appropriate CORS headers
   - Configure rate limiting
   - Set up monitoring and alerting

2. **Edge Runtime**
   - Use Edge Runtime for better performance
   - Implement proper error boundaries
   - Handle cold starts gracefully
   - Monitor execution time limits

3. **Scaling Considerations**
   - Implement proper caching strategies
   - Use connection pooling for databases
   - Monitor API usage and costs
   - Set up automatic scaling rules

## Debugging Tips

1. **Check Radix UI data attributes** for component state
2. **Use React DevTools** to inspect component props
3. **Verify Tailwind classes** are being applied
4. **Check CSS variable values** in browser DevTools
5. **Test keyboard navigation** manually
6. **Validate ARIA attributes** with accessibility tools

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com)
- [Headless UI](https://headlessui.com)
- [Heroicons](https://heroicons.com)
- [Tailwind Play](https://play.tailwindcss.com)
- [Tailwind Community](https://github.com/tailwindlabs/tailwindcss/discussions)

Remember: **Utility-first, mobile-first, performance-first. Embrace constraints, compose with utilities, and maintain consistency!**

# shadcn/ui Development Assistant

*Combined from: Next.js 15, shadcn/ui, Memory MCP Server, Drizzle ORM, Tailwind CSS*

You are an expert Next.js 15 developer with deep knowledge of the App Router, React Server Components, and modern web development best practices.
You are an expert shadcn/ui developer with deep knowledge of React component architecture, Tailwind CSS, Radix UI primitives, and modern web accessibility standards. You specialize in building beautiful, accessible, and performant UI components following shadcn/ui patterns and conventions.
You are an expert in building production MCP (Model Context Protocol) servers with memory persistence, vector search capabilities, and AI companion systems. You have deep expertise in PostgreSQL, pgvector, Drizzle ORM, and the MCP SDK.
You are an expert in Drizzle ORM with deep knowledge of schema management, migrations, type safety, and modern database development patterns.
You are an expert in Tailwind CSS with deep knowledge of utility-first styling, responsive design, component patterns, and modern CSS architecture.

## 1. Server Components First

- **Default to Server Components** - Only use Client Components when you need interactivity
- **Data fetching on the server** - Direct database access, no API routes needed for SSR
- **Zero client-side JavaScript** for static content
- **Async components** are supported and encouraged

## 4. Caching Strategy

- Use `fetch()` with Next.js extensions for HTTP caching
- Configure with `{ next: { revalidate: 3600, tags: ['products'] } }`
- Use `revalidatePath()` and `revalidateTag()` for on-demand updates
- Consider `unstable_cache()` for expensive computations

## Development

*Combined from: Next.js 15, shadcn/ui, Memory MCP Server, Vercel AI SDK*

```bash
npm run dev          # Start dev server with hot reload
npm run dev:turbo    # Start with Turbopack (faster)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```
npm run dev           # Start development server
npm run build         # Build for production
npm run test          # Run tests
npm run lint          # Lint code
npm install ai @ai-sdk/openai @ai-sdk/anthropic  # Install core packages
```

## Code Generation

```bash
npx create-next-app@latest  # Create new app
npx @next/codemod@latest    # Run codemods for upgrades
```

## Project Structure

```text
app/
├── (auth)/          # Route group (doesn't affect URL)
├── api/             # API routes
│   └── route.ts     # Handler for /api
├── products/
│   ├── [id]/        # Dynamic route
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   └── page.tsx
├── layout.tsx       # Root layout
├── page.tsx         # Home page
└── globals.css      # Global styles
```

## Server Action with Form

```typescript
// actions.ts
'use server';
export async function createItem(prevState: any, formData: FormData) {
  // Validate, mutate, revalidate
  const validated = schema.parse(Object.fromEntries(formData));
  await db.items.create({ data: validated });
  revalidatePath('/items');
}

// form.tsx
'use client';
import { useActionState } from 'react';
export function Form() {
  const [state, formAction] = useActionState(createItem, {});
  return <form action={formAction}>...</form>;
}
```

## Optimistic Updates

```typescript
'use client';
import { useOptimistic } from 'react';
export function OptimisticList({ items, addItem }) {
  const [optimisticItems, addOptimisticItem] = useOptimistic(
    items,
    (state, newItem) => [...state, newItem]
  );
  // Use optimisticItems for immediate UI update
}
```

## Memory Integration

This CLAUDE.md follows Claude Code memory management patterns:

- **Project memory** - Shared Vercel AI SDK best practices with team
- **Integration patterns** - Works with Next.js 15 and React 19
- **Tool compatibility** - Optimized for Claude Code development workflows
- **Auto-discovery** - Loaded when working with AI SDK files
- **Expert guidance** - Comprehensive knowledge from official documentation

## Available Commands

*Combined from: shadcn/ui, Vercel AI SDK, Drizzle ORM, Tailwind CSS*

Project-specific slash commands for shadcn/ui development:
- `/shadcn-add [component]` - Add shadcn/ui component to project
- `/shadcn-theme [variant]` - Update theme configuration
- `/shadcn-custom [name]` - Create custom component following patterns
- `/shadcn-compose [components]` - Compose complex component from primitives
- `/shadcn-test [component]` - Generate accessibility and unit tests
Project-specific slash commands for AI SDK development:
- `/ai-chat-setup [basic|advanced|multimodal|rag|agent]` - Complete chat interface setup
- `/ai-streaming-setup [text|object|chat|completion]` - Streaming implementation
- `/ai-tools-setup [simple|database|api|multimodal|agent]` - Tool and function calling
- `/ai-provider-setup [single|multi|fallback] [provider]` - Provider configuration
- `/ai-rag-setup [basic|advanced|conversational|agentic]` - RAG system setup
Use these project-specific slash commands:
- `/drizzle-schema [table-name]` - Generate type-safe schema
- `/drizzle-migrate [action]` - Handle migrations  
- `/drizzle-query [type]` - Create optimized queries
- `/drizzle-seed [table]` - Generate seed data
Project-specific slash commands for Tailwind development:
- `/tw-component [name]` - Generate component with utility classes
- `/tw-responsive [breakpoints]` - Create responsive design patterns
- `/tw-theme [section]` - Update tailwind.config.js theme
- `/tw-plugin [name]` - Add and configure Tailwind plugin
- `/tw-optimize` - Analyze and optimize CSS bundle size

## Core Technologies

- **React 18/19** - Component framework
- **TypeScript** - Type-safe development
- **Tailwind CSS v3.4+** - Utility-first styling
- **Radix UI** - Unstyled, accessible primitives
- **Class Variance Authority (CVA)** - Component variants
- **tailwind-merge** - Intelligent class merging
- **clsx** - Conditional classes
- **Lucide React** - Icon system

## Framework Support

- **Next.js 13-15** (App Router preferred)
- **Vite** with React
- **Remix** with React Router
- **Astro** with React integration
- **Laravel** with Inertia.js
- **TanStack Router/Start**
- **React Router**

## 1. Copy-Paste Architecture

- **No npm package** - Components are copied into your project
- **Full ownership** - The code is yours to modify
- **Direct customization** - Edit components directly
- **No abstraction layers** - See exactly what's happening

## 2. Component Anatomy

Every component follows this structure:

```tsx
// Root component with forwardRef
const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"
    return (
      <Comp
        ref={ref}
        className={cn(componentVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Component.displayName = "Component"

// Sub-components for composition
const ComponentTrigger = React.forwardRef<...>()
const ComponentContent = React.forwardRef<...>()
const ComponentItem = React.forwardRef<...>()

// Export all parts
export { Component, ComponentTrigger, ComponentContent, ComponentItem }
```

# CLI installation (recommended)

npx shadcn@latest init
npx shadcn@latest add [component]

# 3. Update imports

```

## 4. File Structure

```text
components/
└── ui/
    ├── accordion.tsx
    ├── alert-dialog.tsx
    ├── alert.tsx
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── form.tsx
    ├── input.tsx
    ├── label.tsx
    ├── select.tsx
    └── ...
lib/
└── utils.ts        # cn() helper function
```

## 1. Variant System with CVA

```tsx
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## 2. Polymorphic Components with asChild

```tsx
import { Slot } from "@radix-ui/react-slot"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp ref={ref} className={cn(...)} {...props} />
  }
)
```

## 3. Controlled/Uncontrolled Pattern

```tsx
// Controlled
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>...</SelectTrigger>
  <SelectContent>...</SelectContent>
</Select>

// Uncontrolled
<Select defaultValue="apple">
  <SelectTrigger>...</SelectTrigger>
  <SelectContent>...</SelectContent>
</Select>
```

## 4. Form Integration with React Hook Form

```tsx
<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input placeholder="email@example.com" {...field} />
        </FormControl>
        <FormDescription>
          Enter your email address
        </FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

## CSS Variables Structure

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark theme variables ... */
  }
}
```

## Color Convention

- Each color has a **base** and **foreground** variant
- Base: Background color
- Foreground: Text color on that background
- Ensures proper contrast automatically

## 1. ARIA Attributes

```tsx
// Proper ARIA labeling
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>
        Description for screen readers
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

## 2. Keyboard Navigation

All components support:
- **Tab/Shift+Tab** - Focus navigation
- **Enter/Space** - Activation
- **Escape** - Close/cancel
- **Arrow keys** - List navigation
- **Home/End** - Boundary navigation

## 3. Focus Management

```tsx
// Visible focus indicators
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

// Focus trap in modals
<FocusTrap>
  <DialogContent>...</DialogContent>
</FocusTrap>
```

## 1. Tables with TanStack Table

```tsx
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
})

<Table>
  <TableHeader>
    {table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <TableHead key={header.id}>
            {flexRender(header.column.columnDef.header, header.getContext())}
          </TableHead>
        ))}
      </TableRow>
    ))}
  </TableHeader>
  <TableBody>
    {table.getRowModel().rows.map((row) => (
      <TableRow key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## 2. Charts with Recharts

```tsx
<ChartContainer config={chartConfig}>
  <AreaChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <ChartTooltip />
    <Area
      type="monotone"
      dataKey="value"
      stroke="hsl(var(--chart-1))"
      fill="hsl(var(--chart-1))"
    />
  </AreaChart>
</ChartContainer>
```

# Initialize shadcn/ui

npx shadcn@latest init

# Add components

npx shadcn@latest add button card dialog form

# Add all components

npx shadcn@latest add --all

# Update components

npx shadcn@latest add button --overwrite

# Build custom registry

npx shadcn@latest build
```

## Component Development

```bash

# Development server

npm run dev

# Type checking

npm run type-check

# Linting

npm run lint

# Build

npm run build
```

## 1. Bundle Size

- Only import what you use
- Components are tree-shakeable
- No runtime overhead from library

## 2. Code Splitting

```tsx
// Lazy load heavy components
const HeavyChart = lazy(() => import('@/components/ui/chart'))

<Suspense fallback={<Skeleton />}>
  <HeavyChart />
</Suspense>
```

## Form Controls

- Input, Textarea, Select, Checkbox, RadioGroup, Switch
- Slider, DatePicker, Form, Label

## Overlays

- Dialog, AlertDialog, Sheet, Popover
- DropdownMenu, ContextMenu, Tooltip, HoverCard

## Navigation

- NavigationMenu, Tabs, Breadcrumb
- Pagination, Sidebar

## Data Display

- Table, DataTable, Card, Badge
- Avatar, Chart, Progress

## Layout

- Accordion, Collapsible, ResizablePanels
- ScrollArea, Separator, AspectRatio

## Feedback

- Alert, Toast (Sonner), Skeleton
- Progress, Loading states

## MCP Configuration

To use this server with Claude Code:

```bash

# Add local MCP server

claude mcp add memory-server -- npx memory-mcp-server

# Add with environment variables

claude mcp add memory-server --env DATABASE_URL=your_db_url --env OPENAI_API_KEY=your_key -- npx memory-mcp-server

# Check server status

claude mcp list
```

## Available MCP Tools

When connected, provides these tools to Claude Code:

- `memory.create` - Store new memory with vector embedding
- `memory.search` - Semantic search through stored memories  
- `memory.update` - Update existing memory content
- `memory.delete` - Remove memories by ID
- `memory.list` - List memories for user/companion
- `memory.consolidate` - Merge similar memories

## Database & ORM

- **Drizzle ORM v0.44.4** - Type-safe database access
- **pgvector v0.8.0** - Vector similarity search
- **@neondatabase/serverless** - Serverless PostgreSQL client

## Vector Search

- **OpenAI Embeddings** - text-embedding-3-small model
- **HNSW Indexes** - High-performance similarity search
- **Hybrid Search** - Combining vector and keyword search

## Memory System Design

```typescript
// Memory schema with vector embeddings
export const memories = pgTable('memories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  companionId: text('companion_id').notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }),
  metadata: jsonb('metadata'),
  importance: real('importance').default(0.5),
  lastAccessed: timestamp('last_accessed'),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
  embeddingIdx: index().using('hnsw', t.embedding.op('vector_cosine_ops')),
  userCompanionIdx: index().on(t.userId, t.companionId),
}));
```

## MCP Server Implementation

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'memory-server',
  version: '1.0.0',
}, {
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Implementation
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

## 1. Vector Search Optimization

```typescript
// Efficient similarity search with pgvector
const similar = await db
  .select()
  .from(memories)
  .where(
    and(
      eq(memories.userId, userId),
      sql`${memories.embedding} <=> ${embedding} < 0.5`
    )
  )
  .orderBy(sql`${memories.embedding} <=> ${embedding}`)
  .limit(10);
```

## 2. Memory Lifecycle Management

- **Consolidation**: Merge similar memories periodically
- **Decay**: Reduce importance over time without access
- **Archival**: Move old memories to cold storage
- **Deduplication**: Prevent duplicate memory storage

## 3. Multi-tenant Isolation

```typescript
// Row-level security for tenant isolation
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON memories
  FOR ALL
  USING (user_id = current_setting('app.user_id')::text);
```

## 4. Error Handling

```typescript
// Comprehensive error handling
try {
  const result = await operation();
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
} catch (error) {
  if (error instanceof ZodError) {
    return { error: { code: 'INVALID_PARAMS', message: error.message } };
  }
  logger.error('Operation failed', { error, context });
  return { error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } };
}
```

## Database Indexing

```sql
-- HNSW index for vector search
CREATE INDEX memories_embedding_idx ON memories 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- B-tree indexes for filtering
CREATE INDEX memories_user_companion_idx ON memories(user_id, companion_id);
CREATE INDEX memories_created_at_idx ON memories(created_at DESC);
```

## Connection Pooling

```typescript
// lib/db-pool.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const poolConnection = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle(poolConnection);
```

## Caching Strategy

- **Embedding Cache**: Cache frequently used embeddings
- **Query Cache**: Cache common search results
- **Connection Cache**: Reuse database connections

## Input Validation

```typescript
// Zod schemas for all inputs
const CreateMemorySchema = z.object({
  content: z.string().min(1).max(10000),
  metadata: z.record(z.unknown()).optional(),
  importance: z.number().min(0).max(1).optional(),
});

// Validate before processing
const validated = CreateMemorySchema.parse(input);
```

## Authentication & Authorization

```typescript
// JWT-based authentication
const token = request.headers.authorization?.split(' ')[1];
const payload = jwt.verify(token, process.env.JWT_SECRET);

// Role-based access control
if (!payload.roles.includes('memory:write')) {
  throw new ForbiddenError('Insufficient permissions');
}
```

## Data Encryption

- Encrypt sensitive memory content at rest
- Use TLS for all connections
- Implement field-level encryption for PII

## Unit Tests

```typescript
// Test memory operations
describe('MemoryService', () => {
  it('should create memory with embedding', async () => {
    const memory = await service.create({
      content: 'Test memory',
      userId: 'test-user',
    });
    expect(memory.embedding).toBeDefined();
    expect(memory.embedding.length).toBe(1536);
  });
});
```

## Integration Tests

```typescript
// Test MCP server
describe('MCP Server', () => {
  it('should handle memory.create tool', async () => {
    const response = await server.handleRequest({
      method: 'tools/call',
      params: {
        name: 'memory.create',
        arguments: { content: 'Test' },
      },
    });
    expect(response.content[0].type).toBe('text');
  });
});
```

## Docker Setup

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
OPENAI_API_KEY=sk-...
MCP_SERVER_PORT=3000
NODE_ENV=production
LOG_LEVEL=info
```

## Structured Logging

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
});
```

## Metrics Collection

```typescript
// Prometheus metrics
import { register, Counter, Histogram } from 'prom-client';

const memoryCreated = new Counter({
  name: 'memory_created_total',
  help: 'Total number of memories created',
});

const searchDuration = new Histogram({
  name: 'memory_search_duration_seconds',
  help: 'Duration of memory search operations',
});
```

# Database

npm run db:migrate    # Run migrations
npm run db:push       # Push schema changes
npm run db:studio     # Open Drizzle Studio

# Vercel AI SDK Development Expert 🤖

You are a comprehensive Vercel AI SDK expert with deep expertise in streaming, function calling, RAG systems, multi-modal applications, agent development, provider management, and production deployment.

## Specialized Agents

Expert AI agents available for specific tasks:

- **RAG Developer** - Building retrieval-augmented generation systems
- **Multi-Modal Expert** - Image, PDF, and media processing applications
- **Streaming Expert** - Real-time streaming implementations and chat interfaces
- **Tool Integration Specialist** - Function calling, agents, and external integrations
- **Provider Configuration Expert** - Multi-provider setups and optimization

## 1. Provider Management

- **Multi-provider architecture** with intelligent fallbacks
- **Cost optimization** through model selection and usage tracking
- **Provider-specific features** (thinking, search, computer use)
- **Secure credential management** and environment handling

## 2. Streaming First

- **Real-time responses** with `streamText` and `streamObject`
- **Progressive UI updates** with React hooks
- **Error recovery** and stream interruption handling
- **Performance optimization** for production deployment

## 3. Tool Integration

- **Comprehensive tool definitions** with Zod validation
- **Multi-step agent workflows** with stopping conditions
- **External API integrations** with retry and error handling
- **Security and rate limiting** for production environments

## 4. Quality Assurance

- **Comprehensive testing** for all AI components
- **Error handling** with graceful degradation
- **Performance monitoring** and usage analytics
- **Security best practices** throughout development

## Basic Streaming Setup

```typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4'),
    messages,
  });

  return result.toDataStreamResponse();
}
```

## React Chat Interface

```typescript
// components/chat.tsx
'use client';
import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}
      
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
```

## Function Calling with Tools

```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';

const result = await generateObject({
  model: anthropic('claude-3-sonnet-20240229'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a recipe for chocolate cookies.',
});
```

## Multi-Provider Setup

```typescript
// lib/ai-providers.ts
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

export const providers = {
  anthropic: {
    fast: anthropic('claude-3-haiku-20240307'),
    balanced: anthropic('claude-3-sonnet-20240229'),
    powerful: anthropic('claude-3-opus-20240229'),
  },
  openai: {
    fast: openai('gpt-3.5-turbo'),
    balanced: openai('gpt-4'),
    powerful: openai('gpt-4-turbo'),
  },
  google: {
    fast: google('gemini-pro'),
    powerful: google('gemini-pro'),
  },
};
```

## Building

```bash
npm run build                                  # Production build
npm run type-check                            # TypeScript validation
```

## Environment Setup

Create `.env.local` with your API keys:

```env

# Provider API Keys

OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...

# Optional: Default provider

AI_PROVIDER=anthropic
AI_MODEL=claude-3-sonnet-20240229
```

## Stream Error Recovery

```typescript
import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, error, reload, isLoading } = useChat({
    onError: (error) => {
      console.error('Chat error:', error);
      // Implement retry logic or user notification
    },
  });

  if (error) {
    return (
      <div>
        <p>Something went wrong: {error.message}</p>
        <button onClick={() => reload()}>Try again</button>
      </div>
    );
  }
}
```

## Provider Fallback

```typescript
async function generateWithFallback(prompt: string) {
  const providers = [
    () => generateText({ model: anthropic('claude-3-sonnet-20240229'), prompt }),
    () => generateText({ model: openai('gpt-4'), prompt }),
    () => generateText({ model: google('gemini-pro'), prompt }),
  ];

  for (const provider of providers) {
    try {
      return await provider();
    } catch (error) {
      console.warn('Provider failed, trying next:', error);
    }
  }

  throw new Error('All providers failed');
}
```

## Streaming Interruption

```typescript
// Handle aborted requests properly
export async function POST(req: Request) {
  const controller = new AbortController();
  
  req.signal.addEventListener('abort', () => {
    controller.abort();
  });
  
  const result = await streamText({
    model: anthropic('claude-3-sonnet-20240229'),
    messages,
    abortSignal: controller.signal,
  });
  
  return result.toDataStreamResponse();
}
```

## Type Safety

```typescript
// Define message types
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Use proper typing for tools
const weatherTool = tool({
  description: 'Get weather information',
  parameters: z.object({
    location: z.string().describe('The city name'),
    unit: z.enum(['celsius', 'fahrenheit']).optional(),
  }),
  execute: async ({ location, unit = 'celsius' }) => {
    // Implementation
  },
});
```

## Development Lifecycle

This configuration includes comprehensive hooks for:

- **Automatic formatting** of TypeScript/JavaScript files
- **API route validation** and security checks
- **Dependency management** and installation notifications
- **Development reminders** for streaming and error handling
- **Session completion** checklists for quality assurance

## 1. Basic Chat Setup

```bash
/ai-chat-setup basic
```

## 2. Streaming Implementation

```bash
/ai-streaming-setup chat
```

## 4. Provider Configuration

```bash
/ai-provider-setup multi anthropic
```

## 5. RAG System

```bash
/ai-rag-setup basic
```

## Best Practices Summary

- ✅ **Always implement streaming** for better user experience
- ✅ **Use proper error handling** with retry mechanisms
- ✅ **Validate all inputs** with Zod schemas
- ✅ **Implement provider fallbacks** for reliability
- ✅ **Add comprehensive testing** for production readiness
- ✅ **Monitor usage and costs** for optimization
- ✅ **Secure API keys** and implement rate limiting
- ✅ **Document APIs** and provide usage examples

Remember: **Build robust, streaming-first AI applications with comprehensive error handling, security, and monitoring!** 🚀

## 1. Schema Definition

- **Define schemas declaratively** using Drizzle's schema builders
- **Use proper types** for each column with validation
- **Establish relationships** with foreign keys and references
- **Index strategically** for query performance
- **Version schemas** with proper migration patterns

## 2. Type Safety

- **Full TypeScript inference** from schema to queries
- **Compile-time validation** of SQL operations
- **IntelliSense support** for table columns and relations
- **Runtime validation** with Drizzle's built-in validators
- **Type-safe joins** and complex queries

## 3. Migration Management

- **Generate migrations** automatically from schema changes
- **Version control migrations** with proper naming
- **Run migrations safely** in development and production
- **Rollback support** for schema changes
- **Seed data management** for consistent environments

## PostgreSQL with Neon

```typescript
// lib/db.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';

neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
```

## SQLite for Local Development

```typescript
// lib/db.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

const sqlite = new Database('./dev.db');
export const db = drizzle(sqlite);
```

## MySQL with PlanetScale

```typescript
// lib/db.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = mysql.createPool({
  uri: process.env.DATABASE_URL,
});

export const db = drizzle(connection);
```

## User Management Schema

```typescript
// schema/users.ts
import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

## Content with Relations

```typescript
// schema/posts.ts
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  slug: text('slug').notNull().unique(),
  published: boolean('published').default(false),
  authorId: integer('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

## E-commerce Schema

```typescript
// schema/ecommerce.ts
import { pgTable, serial, text, integer, decimal, timestamp } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').default(0),
  sku: text('sku').notNull().unique(),
  categoryId: integer('category_id').references(() => categories.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  status: text('status', { enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id),
  productId: integer('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
});
```

## Basic CRUD Operations

```typescript
// lib/queries/users.ts
import { db } from '@/lib/db';
import { users } from '@/schema/users';
import { eq, desc, count } from 'drizzle-orm';

// Create user
export async function createUser(userData: NewUser) {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
}

// Get user by ID
export async function getUserById(id: number) {
  const user = await db.select().from(users).where(eq(users.id, id));
  return user[0];
}

// Get user by email
export async function getUserByEmail(email: string) {
  const user = await db.select().from(users).where(eq(users.email, email));
  return user[0];
}

// Update user
export async function updateUser(id: number, userData: Partial<NewUser>) {
  const [user] = await db
    .update(users)
    .set(userData)
    .where(eq(users.id, id))
    .returning();
  return user;
}

// Delete user
export async function deleteUser(id: number) {
  await db.delete(users).where(eq(users.id, id));
}

// Get paginated users
export async function getPaginatedUsers(page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  
  const [userList, totalCount] = await Promise.all([
    db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.createdAt)),
    db.select({ count: count() }).from(users),
  ]);
  
  return {
    users: userList,
    total: totalCount[0].count,
    page,
    totalPages: Math.ceil(totalCount[0].count / limit),
  };
}
```

## Complex Relations

```typescript
// lib/queries/posts.ts
import { db } from '@/lib/db';
import { posts, users } from '@/schema';
import { eq, desc, and, ilike } from 'drizzle-orm';

// Get posts with authors
export async function getPostsWithAuthors() {
  return await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      published: posts.published,
      createdAt: posts.createdAt,
      author: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));
}

// Search posts
export async function searchPosts(query: string) {
  return await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.published, true),
        ilike(posts.title, `%${query}%`)
      )
    )
    .orderBy(desc(posts.createdAt));
}

// Get user's posts
export async function getUserPosts(userId: number) {
  return await db
    .select()
    .from(posts)
    .where(eq(posts.authorId, userId))
    .orderBy(desc(posts.createdAt));
}
```

## Advanced Queries

```typescript
// lib/queries/analytics.ts
import { db } from '@/lib/db';
import { orders, orderItems, products, users } from '@/schema';
import { sum, count, avg, desc, gte } from 'drizzle-orm';

// Sales analytics
export async function getSalesAnalytics(startDate: Date, endDate: Date) {
  return await db
    .select({
      totalRevenue: sum(orders.total),
      totalOrders: count(orders.id),
      averageOrderValue: avg(orders.total),
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate)
      )
    );
}

// Top selling products
export async function getTopSellingProducts(limit = 10) {
  return await db
    .select({
      productId: products.id,
      productName: products.name,
      totalSold: sum(orderItems.quantity),
      revenue: sum(orderItems.price),
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .groupBy(products.id, products.name)
    .orderBy(desc(sum(orderItems.quantity)))
    .limit(limit);
}
```

## Drizzle Config

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema/*',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
```

# Generate migration

npx drizzle-kit generate:pg

# Run migrations

npx drizzle-kit push:pg

# Introspect existing database

npx drizzle-kit introspect:pg

# View migration status

npx drizzle-kit up:pg

# Studio (database browser)

npx drizzle-kit studio
```

## Migration Scripts

```typescript
// scripts/migrate.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function runMigrations() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('Migrations completed!');
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('Migration failed!', err);
  process.exit(1);
});
```

## Seed Data

```typescript
// scripts/seed.ts
import { db } from '@/lib/db';
import { users, posts, categories } from '@/schema';

async function seedDatabase() {
  console.log('Seeding database...');
  
  // Create users
  const userIds = await db.insert(users).values([
    { email: 'admin@example.com', name: 'Admin User' },
    { email: 'user@example.com', name: 'Regular User' },
  ]).returning({ id: users.id });
  
  // Create categories
  const categoryIds = await db.insert(categories).values([
    { name: 'Technology', slug: 'technology' },
    { name: 'Design', slug: 'design' },
  ]).returning({ id: categories.id });
  
  // Create posts
  await db.insert(posts).values([
    {
      title: 'Getting Started with Drizzle',
      content: 'Learn how to use Drizzle ORM...',
      slug: 'getting-started-drizzle',
      authorId: userIds[0].id,
      published: true,
    },
    {
      title: 'Database Design Best Practices',
      content: 'Tips for designing scalable databases...',
      slug: 'database-design-best-practices',
      authorId: userIds[1].id,
      published: true,
    },
  ]);
  
  console.log('Seeding completed!');
}

seedDatabase().catch(console.error);
```

## Prepared Statements

```typescript
// lib/prepared-statements.ts
import { db } from '@/lib/db';
import { users } from '@/schema/users';
import { eq } from 'drizzle-orm';

// Prepare frequently used queries
export const getUserByIdPrepared = db
  .select()
  .from(users)
  .where(eq(users.id, placeholder('id')))
  .prepare();

export const getUserByEmailPrepared = db
  .select()
  .from(users)
  .where(eq(users.email, placeholder('email')))
  .prepare();

// Usage
const user = await getUserByIdPrepared.execute({ id: 123 });
```

## Indexes and Constraints

```typescript
// schema/optimized.ts
import { pgTable, serial, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id').notNull(),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Create indexes for better query performance
  slugIdx: uniqueIndex('posts_slug_idx').on(table.slug),
  authorIdx: index('posts_author_idx').on(table.authorId),
  publishedIdx: index('posts_published_idx').on(table.published),
  createdAtIdx: index('posts_created_at_idx').on(table.createdAt),
}));
```

## Test Database Setup

```typescript
// tests/setup.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

export function createTestDb() {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite);
  
  // Run migrations
  migrate(db, { migrationsFolder: 'drizzle' });
  
  return db;
}
```

## Environment Configuration

```env

# Database URLs for different environments

DATABASE_URL=postgresql://username:password@localhost:5432/myapp_development
DATABASE_URL_TEST=postgresql://username:password@localhost:5432/myapp_test
DATABASE_URL_PRODUCTION=postgresql://username:password@host:5432/myapp_production

# For Neon (serverless PostgreSQL)

DATABASE_URL=postgresql://username:password@ep-cool-darkness-123456.us-east-1.aws.neon.tech/neondb?sslmode=require

# For PlanetScale (serverless MySQL)

DATABASE_URL=mysql://username:password@host.connect.psdb.cloud/database?sslmode=require

# For local SQLite

DATABASE_URL=file:./dev.db
```

## Repository Pattern

```typescript
// lib/repositories/user-repository.ts
import { db } from '@/lib/db';
import { users, User, NewUser } from '@/schema/users';
import { eq } from 'drizzle-orm';

export class UserRepository {
  async create(userData: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  async findById(id: number): Promise<User | undefined> {
    const user = await db.select().from(users).where(eq(users.id, id));
    return user[0];
  }
  
  async findByEmail(email: string): Promise<User | undefined> {
    const user = await db.select().from(users).where(eq(users.email, email));
    return user[0];
  }
  
  async update(id: number, userData: Partial<NewUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  async delete(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}

export const userRepository = new UserRepository();
```

## Transaction Handling

```typescript
// lib/services/order-service.ts
import { db } from '@/lib/db';
import { orders, orderItems, products } from '@/schema';
import { eq, sql } from 'drizzle-orm';

export async function createOrderWithItems(
  orderData: NewOrder,
  items: Array<{ productId: number; quantity: number }>
) {
  return await db.transaction(async (tx) => {
    // Create order
    const [order] = await tx.insert(orders).values(orderData).returning();
    
    // Create order items and update product stock
    for (const item of items) {
      // Get product price
      const product = await tx
        .select({ price: products.price, stock: products.stock })
        .from(products)
        .where(eq(products.id, item.productId));
      
      if (product[0].stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
      
      // Create order item
      await tx.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: product[0].price,
      });
      
      // Update product stock
      await tx
        .update(products)
        .set({
          stock: sql`${products.stock} - ${item.quantity}`,
        })
        .where(eq(products.id, item.productId));
    }
    
    return order;
  });
}
```

## 1. Utility-First Methodology

- **Use utility classes** for styling instead of custom CSS
- **Compose complex components** from simple utilities
- **Maintain consistency** with predefined design tokens
- **Optimize for performance** with automatic CSS purging
- **Embrace constraints** of the design system

## 2. Responsive Design

- **Mobile-first approach** with `sm:`, `md:`, `lg:`, `xl:`, `2xl:` breakpoints
- **Consistent breakpoint usage** across the application
- **Responsive typography** and spacing
- **Flexible grid systems** with CSS Grid and Flexbox
- **Responsive images** and media handling

## 3. Design System Integration

- **Custom color palettes** defined in configuration
- **Consistent spacing scale** using rem units
- **Typography hierarchy** with font sizes and line heights
- **Shadow and border radius** system for depth
- **Animation and transition** utilities for micro-interactions

## Basic Tailwind Config

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom configuration here
    },
  },
  plugins: [],
}
```

## Design System Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
  ],
}
```

## Advanced Configuration with CSS Variables

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
}
```

## Layout Components

```jsx
// Responsive Container
function Container({ children, className = "" }) {
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

// Responsive Grid
function Grid({ children, cols = 1, className = "" }) {
  const colsMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };
  
  return (
    <div className={`grid gap-6 ${colsMap[cols]} ${className}`}>
      {children}
    </div>
  );
}

// Responsive Stack
function Stack({ children, spacing = 'md', className = "" }) {
  const spacingMap = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  };
  
  return (
    <div className={`flex flex-col ${spacingMap[spacing]} ${className}`}>
      {children}
    </div>
  );
}
```

## Interactive Components

```jsx
// Animated Button
function Button({ children, variant = 'primary', size = 'md', className = "", ...props }) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 focus-visible:ring-gray-500',
    ghost: 'hover:bg-gray-100 focus-visible:ring-gray-500',
  };
  
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-11 px-6 text-lg',
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Card Component
function Card({ children, className = "", hover = false }) {
  return (
    <div className={`
      rounded-lg border border-gray-200 bg-white p-6 shadow-sm
      ${hover ? 'transition-shadow hover:shadow-md' : ''}
      dark:border-gray-800 dark:bg-gray-900
      ${className}
    `}>
      {children}
    </div>
  );
}
```

## Form Components

```jsx
// Input Field
function Input({ label, error, className = "", ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`
          block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
          placeholder-gray-400 shadow-sm transition-colors
          focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500
          disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
          dark:border-gray-600 dark:bg-gray-800 dark:text-white
          dark:placeholder-gray-500 dark:focus:border-brand-400
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

// Select Field
function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <select
        className={`
          block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
          shadow-sm transition-colors focus:border-brand-500 focus:outline-none
          focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed
          disabled:bg-gray-50 disabled:text-gray-500
          dark:border-gray-600 dark:bg-gray-800 dark:text-white
          dark:focus:border-brand-400
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
```

## Mobile-First Approach

```jsx
// Responsive Navigation
function Navigation() {
  return (
    <nav className="
      flex flex-col space-y-4
      md:flex-row md:items-center md:space-x-6 md:space-y-0
    ">
      <a href="/" className="
        text-gray-700 hover:text-brand-600
        md:text-sm
        lg:text-base
      ">
        Home
      </a>
      <a href="/about" className="
        text-gray-700 hover:text-brand-600
        md:text-sm
        lg:text-base
      ">
        About
      </a>
    </nav>
  );
}

// Responsive Hero Section
function Hero() {
  return (
    <section className="
      px-4 py-12 text-center
      sm:px-6 sm:py-16
      md:py-20
      lg:px-8 lg:py-24
      xl:py-32
    ">
      <h1 className="
        text-3xl font-bold tracking-tight text-gray-900
        sm:text-4xl
        md:text-5xl
        lg:text-6xl
        xl:text-7xl
      ">
        Welcome to Our Site
      </h1>
      <p className="
        mt-4 text-lg text-gray-600
        sm:mt-6 sm:text-xl
        lg:mt-8 lg:text-2xl
      ">
        Building amazing experiences with Tailwind CSS
      </p>
    </section>
  );
}
```

## Container Queries

```jsx
// Using container queries for component-level responsiveness
function ProductCard() {
  return (
    <div className="@container">
      <div className="
        flex flex-col space-y-4
        @md:flex-row @md:space-x-4 @md:space-y-0
        @lg:space-x-6
      ">
        <img className="
          h-48 w-full object-cover
          @md:h-32 @md:w-32
          @lg:h-40 @lg:w-40
        " />
        <div className="flex-1">
          <h3 className="
            text-lg font-semibold
            @lg:text-xl
          ">
            Product Name
          </h3>
        </div>
      </div>
    </div>
  );
}
```

## CSS Variables Approach

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
  }
}
```

## Theme Toggle Component

```jsx
// Theme toggle with smooth transitions
function ThemeToggle() {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };
  
  return (
    <button
      onClick={toggleTheme}
      className="
        rounded-lg p-2 transition-colors duration-200
        hover:bg-gray-100 dark:hover:bg-gray-800
        focus:outline-none focus:ring-2 focus:ring-brand-500
      "
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <MoonIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <SunIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      )}
    </button>
  );
}
```

## Content Configuration

```javascript
// Optimized content paths for better purging
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    // Include node_modules if using component libraries
    './node_modules/@my-ui-lib/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    // Keep dynamic classes that might be missed by purging
    {
      pattern: /bg-(red|green|blue)-(100|500|900)/,
      variants: ['hover', 'focus'],
    },
  ],
}
```

## Custom Utilities

```css
/* Custom utilities for common patterns */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .animation-delay-200 {
    animation-delay: 200ms;
  }
  
  .animation-delay-400 {
    animation-delay: 400ms;
  }
  
  .mask-gradient-to-r {
    mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
  }
}
```

## Component Layer

```css
@layer components {
  .btn {
    @apply inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50;
  }
  
  .btn-primary {
    @apply bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500;
  }
  
  .card {
    @apply rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900;
  }
  
  .input {
    @apply block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white;
  }
}
```

## Custom Animations

```javascript
// Advanced animations in Tailwind config
module.exports = {
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-x': 'bounceX 1s infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        bounceX: {
          '0%, 100%': { transform: 'translateX(-25%)' },
          '50%': { transform: 'translateX(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
}
```

## Staggered Animations

```jsx
// Staggered animation component
function StaggeredList({ items }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`
            animate-fade-in-up opacity-0
            animation-delay-${index * 100}
          `}
          style={{ animationFillMode: 'forwards' }}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
```

## Truncated Text

```jsx
// Text truncation with tooltips
function TruncatedText({ text, maxLength = 100 }) {
  const truncated = text.length > maxLength;
  const displayText = truncated ? `${text.slice(0, maxLength)}...` : text;
  
  return (
    <span 
      className={`${truncated ? 'cursor-help' : ''}`}
      title={truncated ? text : undefined}
    >
      {displayText}
    </span>
  );
}

// CSS-only truncation
function CSSLimTruncate() {
  return (
    <p className="truncate">This text will be truncated if it's too long</p>
    // Or for multiple lines:
    <p className="line-clamp-3">
      This text will be clamped to 3 lines and show ellipsis
    </p>
  );
}
```

## Aspect Ratio Containers

```jsx
// Responsive aspect ratio containers
function AspectRatioImage({ src, alt, ratio = 'aspect-video' }) {
  return (
    <div className={`relative overflow-hidden rounded-lg ${ratio}`}>
      <img 
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

// Custom aspect ratios
function CustomAspectRatio() {
  return (
    <div className="aspect-[4/3]">
      {/* Content with 4:3 aspect ratio */}
    </div>
  );
}
```

## Focus Management

```jsx
// Accessible focus styles
function FocusExample() {
  return (
    <div className="space-y-4">
      <button className="
        rounded-md bg-brand-600 px-4 py-2 text-white
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
        focus-visible:ring-2 focus-visible:ring-brand-500
      ">
        Accessible Button
      </button>
      
      <input className="
        rounded-md border border-gray-300 px-3 py-2
        focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500
        invalid:border-red-500 invalid:focus:border-red-500 invalid:focus:ring-red-500
      " />
    </div>
  );
}
```

## Typography Plugin

```javascript
// @tailwindcss/typography configuration
module.exports = {
  plugins: [
    require('@tailwindcss/typography')({
      className: 'prose',
    }),
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: 'inherit',
              textDecoration: 'none',
              fontWeight: '500',
            },
            'a:hover': {
              color: '#0ea5e9',
            },
          },
        },
      },
    },
  },
}
```

## Forms Plugin

```javascript
// @tailwindcss/forms configuration
module.exports = {
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class', // or 'base'
    }),
  ],
}
```


---

## Configuration Metadata

### Included Configurations

- **Next.js 15** v15.0.0: Next.js 15 with App Router, React 19, and Server Components
- **shadcn/ui** v0.8.0: Beautiful, accessible components with Radix UI and Tailwind CSS
- **Memory MCP Server** v1.0.0: MCP server with memory persistence and vector search capabilities
- **Vercel AI SDK** v1.0.0: Streaming AI applications with function calling and multi-provider support
- **Drizzle ORM** v1.0.0: Type-safe database operations with schema management and migrations
- **Tailwind CSS** v3.4.0: Utility-first CSS framework for rapid UI development

### Dependencies

#### Required Engines

- **node**: >=18.17.0, >=18.0.0

#### Peer Dependencies

These packages should be installed in your project:

- **next**: >=15.0.0
- **react**: >=19.0.0 or >=18.0.0
- **react-dom**: >=19.0.0 or >=18.0.0
- **typescript**: >=5.0.0
- **tailwindcss**: >=3.4.0
- **@modelcontextprotocol/sdk**: >=1.0.0
- **drizzle-orm**: >=0.40.0
- **ai**: >=3.0.0
- **drizzle-kit**: >=0.28.0
- **postcss**: >=8.0.0
- **autoprefixer**: >=10.0.0


## Memory Bank System

This project uses a structured memory bank system with specialized context files. Always check these files for relevant information before starting work:

### Core Context Files

* **CLAUDE-activeContext.md** - Current session state, goals, and progress (if exists)
* **CLAUDE-patterns.md** - Established code patterns and conventions (if exists)
* **CLAUDE-decisions.md** - Architecture decisions and rationale (if exists)
* **CLAUDE-troubleshooting.md** - Common issues and proven solutions (if exists)
* **CLAUDE-config-variables.md** - Configuration variables reference (if exists)
* **CLAUDE-temp.md** - Temporary scratch pad (only read when referenced)

**Important:** Always reference the active context file first to understand what's currently being worked on and maintain session continuity.

## Development Philosophy

**TEST-DRIVEN DEVELOPMENT IS NON-NEGOTIABLE.** Every single line of production code must be written in response to a failing test. No exceptions. This is not a suggestion or a preference - it is the fundamental practice that enables all other principles in this document.

I follow Test-Driven Development (TDD) with a strong emphasis on behavior-driven testing and functional programming principles. All work should be done in small, incremental changes that maintain a working state throughout development.

## Quick Reference

**Key Principles:**

- Write tests first (TDD)
- Test behavior, not implementation
- No `any` types or type assertions
- Immutable data only
- Small, pure functions
- TypeScript strict mode always
- Use real schemas/types in tests, never redefine them

**Preferred Tools:**

- **Language**: TypeScript (strict mode)
- **Testing**: Jest/Vitest + React Testing Library
- **State Management**: Prefer immutable patterns

## Testing Principles

### Behavior-Driven Testing

- **No "unit tests"** - this term is not helpful. Tests should verify expected behavior, treating implementation as a black box
- Test through the public API exclusively - internals should be invisible to tests
- No 1:1 mapping between test files and implementation files
- Tests that examine internal implementation details are wasteful and should be avoided
- **Coverage targets**: 100% coverage should be expected at all times, but these tests must ALWAYS be based on business behaviour, not implementation details
- Tests must document expected business behaviour

### Testing Tools

- **Jest** or **Vitest** for testing frameworks
- **React Testing Library** for React components
- **MSW (Mock Service Worker)** for API mocking when needed
- All test code must follow the same TypeScript strict mode rules as production code

### Test Organization

```
src/
  features/
    payment/
      payment-processor.ts
      payment-validator.ts
      payment-processor.test.ts // The validator is an implementation detail. Validation is fully covered, but by testing the expected business behaviour, treating the validation code itself as an implementation detail
```

### Test Data Pattern

Use factory functions with optional overrides for test data:

```typescript
const getMockPaymentPostPaymentRequest = (
  overrides?: Partial<PostPaymentsRequestV3>
): PostPaymentsRequestV3 => {
  return {
    CardAccountId: "1234567890123456",
    Amount: 100,
    Source: "Web",
    AccountStatus: "Normal",
    LastName: "Doe",
    DateOfBirth: "1980-01-01",
    PayingCardDetails: {
      Cvv: "123",
      Token: "token",
    },
    AddressDetails: getMockAddressDetails(),
    Brand: "Visa",
    ...overrides,
  };
};

const getMockAddressDetails = (
  overrides?: Partial<AddressDetails>
): AddressDetails => {
  return {
    HouseNumber: "123",
    HouseName: "Test House",
    AddressLine1: "Test Address Line 1",
    AddressLine2: "Test Address Line 2",
    City: "Test City",
    ...overrides,
  };
};
```

Key principles:

- Always return complete objects with sensible defaults
- Accept optional `Partial<T>` overrides
- Build incrementally - extract nested object factories as needed
- Compose factories for complex objects
- Consider using a test data builder pattern for very complex objects

## TypeScript Guidelines

### Strict Mode Requirements

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

- **No `any`** - ever. Use `unknown` if type is truly unknown
- **No type assertions** (`as SomeType`) unless absolutely necessary with clear justification
- **No `@ts-ignore`** or `@ts-expect-error` without explicit explanation
- These rules apply to test code as well as production code

### Type Definitions

- **Prefer `type` over `interface`** in all cases
- Use explicit typing where it aids clarity, but leverage inference where appropriate
- Utilize utility types effectively (`Pick`, `Omit`, `Partial`, `Required`, etc.)
- Create domain-specific types (e.g., `UserId`, `PaymentId`) for type safety
- Use Zod or any other [Standard Schema](https://standardschema.dev/) compliant schema library to create types, by creating schemas first

```typescript
// Good
type UserId = string & { readonly brand: unique symbol };
type PaymentAmount = number & { readonly brand: unique symbol };

// Avoid
type UserId = string;
type PaymentAmount = number;
```

#### Schema-First Development with Zod

Always define your schemas first, then derive types from them:

```typescript
import { z } from "zod";

// Define schemas first - these provide runtime validation
const AddressDetailsSchema = z.object({
  houseNumber: z.string(),
  houseName: z.string().optional(),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  postcode: z.string().regex(/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i),
});

const PayingCardDetailsSchema = z.object({
  cvv: z.string().regex(/^\d{3,4}$/),
  token: z.string().min(1),
});

const PostPaymentsRequestV3Schema = z.object({
  cardAccountId: z.string().length(16),
  amount: z.number().positive(),
  source: z.enum(["Web", "Mobile", "API"]),
  accountStatus: z.enum(["Normal", "Restricted", "Closed"]),
  lastName: z.string().min(1),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  payingCardDetails: PayingCardDetailsSchema,
  addressDetails: AddressDetailsSchema,
  brand: z.enum(["Visa", "Mastercard", "Amex"]),
});

// Derive types from schemas
type AddressDetails = z.infer<typeof AddressDetailsSchema>;
type PayingCardDetails = z.infer<typeof PayingCardDetailsSchema>;
type PostPaymentsRequestV3 = z.infer<typeof PostPaymentsRequestV3Schema>;

// Use schemas at runtime boundaries
export const parsePaymentRequest = (data: unknown): PostPaymentsRequestV3 => {
  return PostPaymentsRequestV3Schema.parse(data);
};

// Example of schema composition for complex domains
const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const CustomerSchema = BaseEntitySchema.extend({
  email: z.string().email(),
  tier: z.enum(["standard", "premium", "enterprise"]),
  creditLimit: z.number().positive(),
});

type Customer = z.infer<typeof CustomerSchema>;
```

#### Schema Usage in Tests

**CRITICAL**: Tests must use real schemas and types from the main project, not redefine their own.

```typescript
// ❌ WRONG - Defining schemas in test files
const ProjectSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  ownerId: z.string().nullable(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// ✅ CORRECT - Import schemas from the shared schema package
import { ProjectSchema, type Project } from "@your-org/schemas";
```

**Why this matters:**

- **Type Safety**: Ensures tests use the same types as production code
- **Consistency**: Changes to schemas automatically propagate to tests
- **Maintainability**: Single source of truth for data structures
- **Prevents Drift**: Tests can't accidentally diverge from real schemas

**Implementation:**

- All domain schemas should be exported from a shared schema package or module
- Test files should import schemas from the shared location
- If a schema isn't exported yet, add it to the exports rather than duplicating it
- Mock data factories should use the real types derived from real schemas

```typescript
// ✅ CORRECT - Test factories using real schemas
import { ProjectSchema, type Project } from "@your-org/schemas";

const getMockProject = (overrides?: Partial<Project>): Project => {
  const baseProject = {
    id: "proj_123",
    workspaceId: "ws_456",
    ownerId: "user_789",
    name: "Test Project",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const projectData = { ...baseProject, ...overrides };

  // Validate against real schema to catch type mismatches
  return ProjectSchema.parse(projectData);
};
```

## Code Style

### Functional Programming

I follow a "functional light" approach:

- **No data mutation** - work with immutable data structures
- **Pure functions** wherever possible
- **Composition** as the primary mechanism for code reuse
- Avoid heavy FP abstractions (no need for complex monads or pipe/compose patterns) unless there is a clear advantage to using them
- Use array methods (`map`, `filter`, `reduce`) over imperative loops

#### Examples of Functional Patterns

```typescript
// Good - Pure function with immutable updates
const applyDiscount = (order: Order, discountPercent: number): Order => {
  return {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      price: item.price * (1 - discountPercent / 100),
    })),
    totalPrice: order.items.reduce(
      (sum, item) => sum + item.price * (1 - discountPercent / 100),
      0
    ),
  };
};

// Good - Composition over complex logic
const processOrder = (order: Order): ProcessedOrder => {
  return pipe(
    order,
    validateOrder,
    applyPromotions,
    calculateTax,
    assignWarehouse
  );
};

// When heavy FP abstractions ARE appropriate:
// - Complex async flows that benefit from Task/IO types
// - Error handling chains that benefit from Result/Either types
// Example with Result type for complex error handling:
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

const chainPaymentOperations = (
  payment: Payment
): Result<Receipt, PaymentError> => {
  return pipe(
    validatePayment(payment),
    chain(authorizePayment),
    chain(capturePayment),
    map(generateReceipt)
  );
};
```

### Code Structure

- **No nested if/else statements** - use early returns, guard clauses, or composition
- **Avoid deep nesting** in general (max 2 levels)
- Keep functions small and focused on a single responsibility
- Prefer flat, readable code over clever abstractions

### Naming Conventions

- **Functions**: `camelCase`, verb-based (e.g., `calculateTotal`, `validatePayment`)
- **Types**: `PascalCase` (e.g., `PaymentRequest`, `UserProfile`)
- **Constants**: `UPPER_SNAKE_CASE` for true constants, `camelCase` for configuration
- **Files**: `kebab-case.ts` for all TypeScript files
- **Test files**: `*.test.ts` or `*.spec.ts`

### No Comments in Code

Code should be self-documenting through clear naming and structure. Comments indicate that the code itself is not clear enough.

```typescript
// Avoid: Comments explaining what the code does
const calculateDiscount = (price: number, customer: Customer): number => {
  // Check if customer is premium
  if (customer.tier === "premium") {
    // Apply 20% discount for premium customers
    return price * 0.8;
  }
  // Regular customers get 10% discount
  return price * 0.9;
};

// Good: Self-documenting code with clear names
const PREMIUM_DISCOUNT_MULTIPLIER = 0.8;
const STANDARD_DISCOUNT_MULTIPLIER = 0.9;

const isPremiumCustomer = (customer: Customer): boolean => {
  return customer.tier === "premium";
};

const calculateDiscount = (price: number, customer: Customer): number => {
  const discountMultiplier = isPremiumCustomer(customer)
    ? PREMIUM_DISCOUNT_MULTIPLIER
    : STANDARD_DISCOUNT_MULTIPLIER;

  return price * discountMultiplier;
};

// Avoid: Complex logic with comments
const processPayment = (payment: Payment): ProcessedPayment => {
  // First validate the payment
  if (!validatePayment(payment)) {
    throw new Error("Invalid payment");
  }

  // Check if we need to apply 3D secure
  if (payment.amount > 100 && payment.card.type === "credit") {
    // Apply 3D secure for credit cards over £100
    const securePayment = apply3DSecure(payment);
    // Process the secure payment
    return executePayment(securePayment);
  }

  // Process the payment
  return executePayment(payment);
};

// Good: Extract to well-named functions
const requires3DSecure = (payment: Payment): boolean => {
  const SECURE_PAYMENT_THRESHOLD = 100;
  return (
    payment.amount > SECURE_PAYMENT_THRESHOLD && payment.card.type === "credit"
  );
};

const processPayment = (payment: Payment): ProcessedPayment => {
  if (!validatePayment(payment)) {
    throw new PaymentValidationError("Invalid payment");
  }

  const securedPayment = requires3DSecure(payment)
    ? apply3DSecure(payment)
    : payment;

  return executePayment(securedPayment);
};
```

**Exception**: JSDoc comments for public APIs are acceptable when generating documentation, but the code should still be self-explanatory without them.

### Prefer Options Objects

Use options objects for function parameters as the default pattern. Only use positional parameters when there's a clear, compelling reason (e.g., single-parameter pure functions, well-established conventions like `map(item => item.value)`).

```typescript
// Avoid: Multiple positional parameters
const createPayment = (
  amount: number,
  currency: string,
  cardId: string,
  customerId: string,
  description?: string,
  metadata?: Record<string, unknown>,
  idempotencyKey?: string
): Payment => {
  // implementation
};

// Calling it is unclear
const payment = createPayment(
  100,
  "GBP",
  "card_123",
  "cust_456",
  undefined,
  { orderId: "order_789" },
  "key_123"
);

// Good: Options object with clear property names
type CreatePaymentOptions = {
  amount: number;
  currency: string;
  cardId: string;
  customerId: string;
  description?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
};

const createPayment = (options: CreatePaymentOptions): Payment => {
  const {
    amount,
    currency,
    cardId,
    customerId,
    description,
    metadata,
    idempotencyKey,
  } = options;

  // implementation
};

// Clear and readable at call site
const payment = createPayment({
  amount: 100,
  currency: "GBP",
  cardId: "card_123",
  customerId: "cust_456",
  metadata: { orderId: "order_789" },
  idempotencyKey: "key_123",
});

// Avoid: Boolean flags as parameters
const fetchCustomers = (
  includeInactive: boolean,
  includePending: boolean,
  includeDeleted: boolean,
  sortByDate: boolean
): Customer[] => {
  // implementation
};

// Confusing at call site
const customers = fetchCustomers(true, false, false, true);

// Good: Options object with clear intent
type FetchCustomersOptions = {
  includeInactive?: boolean;
  includePending?: boolean;
  includeDeleted?: boolean;
  sortBy?: "date" | "name" | "value";
};

const fetchCustomers = (options: FetchCustomersOptions = {}): Customer[] => {
  const {
    includeInactive = false,
    includePending = false,
    includeDeleted = false,
    sortBy = "name",
  } = options;

  // implementation
};

// Self-documenting at call site
const customers = fetchCustomers({
  includeInactive: true,
  sortBy: "date",
});

// Good: Configuration objects for complex operations
type ProcessOrderOptions = {
  order: Order;
  shipping: {
    method: "standard" | "express" | "overnight";
    address: Address;
  };
  payment: {
    method: PaymentMethod;
    saveForFuture?: boolean;
  };
  promotions?: {
    codes?: string[];
    autoApply?: boolean;
  };
};

const processOrder = (options: ProcessOrderOptions): ProcessedOrder => {
  const { order, shipping, payment, promotions = {} } = options;

  // Clear access to nested options
  const orderWithPromotions = promotions.autoApply
    ? applyAvailablePromotions(order)
    : order;

  return executeOrder({
    ...orderWithPromotions,
    shippingMethod: shipping.method,
    paymentMethod: payment.method,
  });
};

// Acceptable: Single parameter for simple transforms
const double = (n: number): number => n * 2;
const getName = (user: User): string => user.name;

// Acceptable: Well-established patterns
const numbers = [1, 2, 3];
const doubled = numbers.map((n) => n * 2);
const users = fetchUsers();
const names = users.map((user) => user.name);
```

**Guidelines for options objects:**

- Default to options objects unless there's a specific reason not to
- Always use for functions with optional parameters
- Destructure options at the start of the function for clarity
- Provide sensible defaults using destructuring
- Keep related options grouped (e.g., all shipping options together)
- Consider breaking very large options objects into nested groups

**When positional parameters are acceptable:**

- Single-parameter pure functions
- Well-established functional patterns (map, filter, reduce callbacks)
- Mathematical operations where order is conventional

## Development Workflow

### TDD Process - THE FUNDAMENTAL PRACTICE

**CRITICAL**: TDD is not optional. Every feature, every bug fix, every change MUST follow this process:

Follow Red-Green-Refactor strictly:

1. **Red**: Write a failing test for the desired behavior. NO PRODUCTION CODE until you have a failing test.
2. **Green**: Write the MINIMUM code to make the test pass. Resist the urge to write more than needed.
3. **Refactor**: Assess the code for improvement opportunities. If refactoring would add value, clean up the code while keeping tests green. If the code is already clean and expressive, move on.

**Common TDD Violations to Avoid:**

- Writing production code without a failing test first
- Writing multiple tests before making the first one pass
- Writing more production code than needed to pass the current test
- Skipping the refactor assessment step when code could be improved
- Adding functionality "while you're there" without a test driving it

**Remember**: If you're typing production code and there isn't a failing test demanding that code, you're not doing TDD.

#### TDD Example Workflow

```typescript
// Step 1: Red - Start with the simplest behavior
describe("Order processing", () => {
  it("should calculate total with shipping cost", () => {
    const order = createOrder({
      items: [{ price: 30, quantity: 1 }],
      shippingCost: 5.99,
    });

    const processed = processOrder(order);

    expect(processed.total).toBe(35.99);
    expect(processed.shippingCost).toBe(5.99);
  });
});

// Step 2: Green - Minimal implementation
const processOrder = (order: Order): ProcessedOrder => {
  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return {
    ...order,
    shippingCost: order.shippingCost,
    total: itemsTotal + order.shippingCost,
  };
};

// Step 3: Red - Add test for free shipping behavior
describe("Order processing", () => {
  it("should calculate total with shipping cost", () => {
    // ... existing test
  });

  it("should apply free shipping for orders over £50", () => {
    const order = createOrder({
      items: [{ price: 60, quantity: 1 }],
      shippingCost: 5.99,
    });

    const processed = processOrder(order);

    expect(processed.shippingCost).toBe(0);
    expect(processed.total).toBe(60);
  });
});

// Step 4: Green - NOW we can add the conditional because both paths are tested
const processOrder = (order: Order): ProcessedOrder => {
  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shippingCost = itemsTotal > 50 ? 0 : order.shippingCost;

  return {
    ...order,
    shippingCost,
    total: itemsTotal + shippingCost,
  };
};

// Step 5: Add edge case tests to ensure 100% behavior coverage
describe("Order processing", () => {
  // ... existing tests

  it("should charge shipping for orders exactly at £50", () => {
    const order = createOrder({
      items: [{ price: 50, quantity: 1 }],
      shippingCost: 5.99,
    });

    const processed = processOrder(order);

    expect(processed.shippingCost).toBe(5.99);
    expect(processed.total).toBe(55.99);
  });
});

// Step 6: Refactor - Extract constants and improve readability
const FREE_SHIPPING_THRESHOLD = 50;

const calculateItemsTotal = (items: OrderItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const qualifiesForFreeShipping = (itemsTotal: number): boolean => {
  return itemsTotal > FREE_SHIPPING_THRESHOLD;
};

const processOrder = (order: Order): ProcessedOrder => {
  const itemsTotal = calculateItemsTotal(order.items);
  const shippingCost = qualifiesForFreeShipping(itemsTotal)
    ? 0
    : order.shippingCost;

  return {
    ...order,
    shippingCost,
    total: itemsTotal + shippingCost,
  };
};
```

### Refactoring - The Critical Third Step

Evaluating refactoring opportunities is not optional - it's the third step in the TDD cycle. After achieving a green state and committing your work, you MUST assess whether the code can be improved. However, only refactor if there's clear value - if the code is already clean and expresses intent well, move on to the next test.

#### What is Refactoring?

Refactoring means changing the internal structure of code without changing its external behavior. The public API remains unchanged, all tests continue to pass, but the code becomes cleaner, more maintainable, or more efficient. Remember: only refactor when it genuinely improves the code - not all code needs refactoring.

#### When to Refactor

- **Always assess after green**: Once tests pass, before moving to the next test, evaluate if refactoring would add value
- **When you see duplication**: But understand what duplication really means (see DRY below)
- **When names could be clearer**: Variable names, function names, or type names that don't clearly express intent
- **When structure could be simpler**: Complex conditional logic, deeply nested code, or long functions
- **When patterns emerge**: After implementing several similar features, useful abstractions may become apparent

**Remember**: Not all code needs refactoring. If the code is already clean, expressive, and well-structured, commit and move on. Refactoring should improve the code - don't change things just for the sake of change.

#### Refactoring Guidelines

##### 1. Commit Before Refactoring

Always commit your working code before starting any refactoring. This gives you a safe point to return to:

```bash
git add .
git commit -m "feat: add payment validation"
# Now safe to refactor
```

##### 2. Look for Useful Abstractions Based on Semantic Meaning

Create abstractions only when code shares the same semantic meaning and purpose. Don't abstract based on structural similarity alone - **duplicate code is far cheaper than the wrong abstraction**.

```typescript
// Similar structure, DIFFERENT semantic meaning - DO NOT ABSTRACT
const validatePaymentAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 10000;
};

const validateTransferAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 10000;
};

// These might have the same structure today, but they represent different
// business concepts that will likely evolve independently.
// Payment limits might change based on fraud rules.
// Transfer limits might change based on account type.
// Abstracting them couples unrelated business rules.

// Similar structure, SAME semantic meaning - SAFE TO ABSTRACT
const formatUserDisplayName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

const formatCustomerDisplayName = (
  firstName: string,
  lastName: string
): string => {
  return `${firstName} ${lastName}`.trim();
};

const formatEmployeeDisplayName = (
  firstName: string,
  lastName: string
): string => {
  return `${firstName} ${lastName}`.trim();
};

// These all represent the same concept: "how we format a person's name for display"
// They share semantic meaning, not just structure
const formatPersonDisplayName = (
  firstName: string,
  lastName: string
): string => {
  return `${firstName} ${lastName}`.trim();
};

// Replace all call sites throughout the codebase:
// Before:
// const userLabel = formatUserDisplayName(user.firstName, user.lastName);
// const customerName = formatCustomerDisplayName(customer.firstName, customer.lastName);
// const employeeTag = formatEmployeeDisplayName(employee.firstName, employee.lastName);

// After:
// const userLabel = formatPersonDisplayName(user.firstName, user.lastName);
// const customerName = formatPersonDisplayName(customer.firstName, customer.lastName);
// const employeeTag = formatPersonDisplayName(employee.firstName, employee.lastName);

// Then remove the original functions as they're no longer needed
```

**Questions to ask before abstracting:**

- Do these code blocks represent the same concept or different concepts that happen to look similar?
- If the business rules for one change, should the others change too?
- Would a developer reading this abstraction understand why these things are grouped together?
- Am I abstracting based on what the code IS (structure) or what it MEANS (semantics)?

**Remember**: It's much easier to create an abstraction later when the semantic relationship becomes clear than to undo a bad abstraction that couples unrelated concepts.

##### 3. Understanding DRY - It's About Knowledge, Not Code

DRY (Don't Repeat Yourself) is about not duplicating **knowledge** in the system, not about eliminating all code that looks similar.

```typescript
// This is NOT a DRY violation - different knowledge despite similar code
const validateUserAge = (age: number): boolean => {
  return age >= 18 && age <= 100;
};

const validateProductRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5;
};

const validateYearsOfExperience = (years: number): boolean => {
  return years >= 0 && years <= 50;
};

// These functions have similar structure (checking numeric ranges), but they
// represent completely different business rules:
// - User age has legal requirements (18+) and practical limits (100)
// - Product ratings follow a 1-5 star system
// - Years of experience starts at 0 with a reasonable upper bound
// Abstracting them would couple unrelated business concepts and make future
// changes harder. What if ratings change to 1-10? What if legal age changes?

// Another example of code that looks similar but represents different knowledge:
const formatUserDisplayName = (user: User): string => {
  return `${user.firstName} ${user.lastName}`.trim();
};

const formatAddressLine = (address: Address): string => {
  return `${address.street} ${address.number}`.trim();
};

const formatCreditCardLabel = (card: CreditCard): string => {
  return `${card.type} ${card.lastFourDigits}`.trim();
};

// Despite the pattern "combine two strings with space and trim", these represent
// different domain concepts with different future evolution paths

// This IS a DRY violation - same knowledge in multiple places
class Order {
  calculateTotal(): number {
    const itemsTotal = this.items.reduce((sum, item) => sum + item.price, 0);
    const shippingCost = itemsTotal > 50 ? 0 : 5.99; // Knowledge duplicated!
    return itemsTotal + shippingCost;
  }
}

class OrderSummary {
  getShippingCost(itemsTotal: number): number {
    return itemsTotal > 50 ? 0 : 5.99; // Same knowledge!
  }
}

class ShippingCalculator {
  calculate(orderAmount: number): number {
    if (orderAmount > 50) return 0; // Same knowledge again!
    return 5.99;
  }
}

// Refactored - knowledge in one place
const FREE_SHIPPING_THRESHOLD = 50;
const STANDARD_SHIPPING_COST = 5.99;

const calculateShippingCost = (itemsTotal: number): number => {
  return itemsTotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
};

// Now all classes use the single source of truth
class Order {
  calculateTotal(): number {
    const itemsTotal = this.items.reduce((sum, item) => sum + item.price, 0);
    return itemsTotal + calculateShippingCost(itemsTotal);
  }
}
```

##### 4. Maintain External APIs During Refactoring

Refactoring must never break existing consumers of your code:

```typescript
// Original implementation
export const processPayment = (payment: Payment): ProcessedPayment => {
  // Complex logic all in one function
  if (payment.amount <= 0) {
    throw new Error("Invalid amount");
  }

  if (payment.amount > 10000) {
    throw new Error("Amount too large");
  }

  // ... 50 more lines of validation and processing

  return result;
};

// Refactored - external API unchanged, internals improved
export const processPayment = (payment: Payment): ProcessedPayment => {
  validatePaymentAmount(payment.amount);
  validatePaymentMethod(payment.method);

  const authorizedPayment = authorizePayment(payment);
  const capturedPayment = capturePayment(authorizedPayment);

  return generateReceipt(capturedPayment);
};

// New internal functions - not exported
const validatePaymentAmount = (amount: number): void => {
  if (amount <= 0) {
    throw new Error("Invalid amount");
  }

  if (amount > 10000) {
    throw new Error("Amount too large");
  }
};

// Tests continue to pass without modification because external API unchanged
```

##### 5. Verify and Commit After Refactoring

**CRITICAL**: After every refactoring:

1. Run all tests - they must pass without modification
2. Run static analysis (linting, type checking) - must pass
3. Commit the refactoring separately from feature changes

```bash
# After refactoring
bun test          # All tests must pass
bun run lint      # All linting must pass (if lint script exists)
bun run typecheck # TypeScript must be happy (if typecheck script exists)

# Only then commit
git add .
git commit -m "refactor: extract payment validation helpers"
```

#### Refactoring Checklist

Before considering refactoring complete, verify:

- [ ] The refactoring actually improves the code (if not, don't refactor)
- [ ] All tests still pass without modification
- [ ] All static analysis tools pass (linting, type checking)
- [ ] No new public APIs were added (only internal ones)
- [ ] Code is more readable than before
- [ ] Any duplication removed was duplication of knowledge, not just code
- [ ] No speculative abstractions were created
- [ ] The refactoring is committed separately from feature changes

#### Example Refactoring Session

```typescript
// After getting tests green with minimal implementation:
describe("Order processing", () => {
  it("calculates total with items and shipping", () => {
    const order = { items: [{ price: 30 }, { price: 20 }], shipping: 5 };
    expect(calculateOrderTotal(order)).toBe(55);
  });

  it("applies free shipping over £50", () => {
    const order = { items: [{ price: 30 }, { price: 25 }], shipping: 5 };
    expect(calculateOrderTotal(order)).toBe(55);
  });
});

// Green implementation (minimal):
const calculateOrderTotal = (order: Order): number => {
  const itemsTotal = order.items.reduce((sum, item) => sum + item.price, 0);
  const shipping = itemsTotal > 50 ? 0 : order.shipping;
  return itemsTotal + shipping;
};

// Commit the working version
// git commit -m "feat: implement order total calculation with free shipping"

// Assess refactoring opportunities:
// - The variable names could be clearer
// - The free shipping threshold is a magic number
// - The calculation logic could be extracted for clarity
// These improvements would add value, so proceed with refactoring:

const FREE_SHIPPING_THRESHOLD = 50;

const calculateItemsTotal = (items: OrderItem[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

const calculateShipping = (
  baseShipping: number,
  itemsTotal: number
): number => {
  return itemsTotal > FREE_SHIPPING_THRESHOLD ? 0 : baseShipping;
};

const calculateOrderTotal = (order: Order): number => {
  const itemsTotal = calculateItemsTotal(order.items);
  const shipping = calculateShipping(order.shipping, itemsTotal);
  return itemsTotal + shipping;
};

// Run tests - they still pass!
// Run linting - all clean!
// Run type checking - no errors!

// Now commit the refactoring
// git commit -m "refactor: extract order total calculation helpers"
```

##### Example: When NOT to Refactor

```typescript
// After getting this test green:
describe("Discount calculation", () => {
  it("should apply 10% discount", () => {
    const originalPrice = 100;
    const discountedPrice = applyDiscount(originalPrice, 0.1);
    expect(discountedPrice).toBe(90);
  });
});

// Green implementation:
const applyDiscount = (price: number, discountRate: number): number => {
  return price * (1 - discountRate);
};

// Assess refactoring opportunities:
// - Code is already simple and clear
// - Function name clearly expresses intent
// - Implementation is a straightforward calculation
// - No magic numbers or unclear logic
// Conclusion: No refactoring needed. This is fine as-is.

// Commit and move to the next test
// git commit -m "feat: add discount calculation"
```

### Commit Guidelines

- Each commit should represent a complete, working change
- Use conventional commits format:
  ```
  feat: add payment validation
  fix: correct date formatting in payment processor
  refactor: extract payment validation logic
  test: add edge cases for payment validation
  ```
- Include test changes with feature changes in the same commit

### Pull Request Standards

- Every PR must have all tests passing
- All linting and quality checks must pass
- Work in small increments that maintain a working state
- PRs should be focused on a single feature or fix
- Include description of the behavior change, not implementation details

## Working with Claude

### Expectations

When working with my code:

1. **ALWAYS FOLLOW TDD** - No production code without a failing test. This is not negotiable.
2. **Think deeply** before making any edits
3. **Understand the full context** of the code and requirements
4. **Ask clarifying questions** when requirements are ambiguous
5. **Think from first principles** - don't make assumptions
6. **Assess refactoring after every green** - Look for opportunities to improve code structure, but only refactor if it adds value
7. **Keep project docs current** - update them whenever you introduce meaningful changes

### Code Changes

When suggesting or making changes:

- **Start with a failing test** - always. No exceptions.
- After making tests pass, always assess refactoring opportunities (but only refactor if it adds value)
- After refactoring, verify all tests and static analysis pass, then commit
- Respect the existing patterns and conventions
- Maintain test coverage for all behavior changes
- Keep changes small and incremental
- Ensure all TypeScript strict mode requirements are met
- Provide rationale for significant design decisions

**If you find yourself writing production code without a failing test, STOP immediately and write the test first.**

### Communication

- Be explicit about trade-offs in different approaches
- Explain the reasoning behind significant design decisions
- Flag any deviations from these guidelines with justification
- Suggest improvements that align with these principles
- When unsure, ask for clarification rather than assuming

## Example Patterns

### Error Handling

Use Result types or early returns:

```typescript
// Good - Result type pattern
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

const processPayment = (
  payment: Payment
): Result<ProcessedPayment, PaymentError> => {
  if (!isValidPayment(payment)) {
    return { success: false, error: new PaymentError("Invalid payment") };
  }

  if (!hasSufficientFunds(payment)) {
    return { success: false, error: new PaymentError("Insufficient funds") };
  }

  return { success: true, data: executePayment(payment) };
};

// Also good - early returns with exceptions
const processPayment = (payment: Payment): ProcessedPayment => {
  if (!isValidPayment(payment)) {
    throw new PaymentError("Invalid payment");
  }

  if (!hasSufficientFunds(payment)) {
    throw new PaymentError("Insufficient funds");
  }

  return executePayment(payment);
};
```

### Testing Behavior

```typescript
// Good - tests behavior through public API
describe("PaymentProcessor", () => {
  it("should decline payment when insufficient funds", () => {
    const payment = getMockPaymentPostPaymentRequest({ Amount: 1000 });
    const account = getMockAccount({ Balance: 500 });

    const result = processPayment(payment, account);

    expect(result.success).toBe(false);
    expect(result.error.message).toBe("Insufficient funds");
  });

  it("should process valid payment successfully", () => {
    const payment = getMockPaymentPostPaymentRequest({ Amount: 100 });
    const account = getMockAccount({ Balance: 500 });

    const result = processPayment(payment, account);

    expect(result.success).toBe(true);
    expect(result.data.remainingBalance).toBe(400);
  });
});

// Avoid - testing implementation details
describe("PaymentProcessor", () => {
  it("should call checkBalance method", () => {
    // This tests implementation, not behavior
  });
});
```

#### Achieving 100% Coverage Through Business Behavior

Example showing how validation code gets 100% coverage without testing it directly:

```typescript
// payment-validator.ts (implementation detail)
export const validatePaymentAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 10000;
};

export const validateCardDetails = (card: PayingCardDetails): boolean => {
  return /^\d{3,4}$/.test(card.cvv) && card.token.length > 0;
};

// payment-processor.ts (public API)
export const processPayment = (
  request: PaymentRequest
): Result<Payment, PaymentError> => {
  // Validation is used internally but not exposed
  if (!validatePaymentAmount(request.amount)) {
    return { success: false, error: new PaymentError("Invalid amount") };
  }

  if (!validateCardDetails(request.payingCardDetails)) {
    return { success: false, error: new PaymentError("Invalid card details") };
  }

  // Process payment...
  return { success: true, data: executedPayment };
};

// payment-processor.test.ts
describe("Payment processing", () => {
  // These tests achieve 100% coverage of validation code
  // without directly testing the validator functions

  it("should reject payments with negative amounts", () => {
    const payment = getMockPaymentPostPaymentRequest({ amount: -100 });
    const result = processPayment(payment);

    expect(result.success).toBe(false);
    expect(result.error.message).toBe("Invalid amount");
  });

  it("should reject payments exceeding maximum amount", () => {
    const payment = getMockPaymentPostPaymentRequest({ amount: 10001 });
    const result = processPayment(payment);

    expect(result.success).toBe(false);
    expect(result.error.message).toBe("Invalid amount");
  });

  it("should reject payments with invalid CVV format", () => {
    const payment = getMockPaymentPostPaymentRequest({
      payingCardDetails: { cvv: "12", token: "valid-token" },
    });
    const result = processPayment(payment);

    expect(result.success).toBe(false);
    expect(result.error.message).toBe("Invalid card details");
  });

  it("should process valid payments successfully", () => {
    const payment = getMockPaymentPostPaymentRequest({
      amount: 100,
      payingCardDetails: { cvv: "123", token: "valid-token" },
    });
    const result = processPayment(payment);

    expect(result.success).toBe(true);
    expect(result.data.status).toBe("completed");
  });
});
```

### React Component Testing

```typescript
// Good - testing user-visible behavior
describe("PaymentForm", () => {
  it("should show error when submitting invalid amount", async () => {
    render(<PaymentForm />);

    const amountInput = screen.getByLabelText("Amount");
    const submitButton = screen.getByRole("button", { name: "Submit Payment" });

    await userEvent.type(amountInput, "-100");
    await userEvent.click(submitButton);

    expect(screen.getByText("Amount must be positive")).toBeInTheDocument();
  });
});
```

## Common Patterns to Avoid

### Anti-patterns

```typescript
// Avoid: Mutation
const addItem = (items: Item[], newItem: Item) => {
  items.push(newItem); // Mutates array
  return items;
};

// Prefer: Immutable update
const addItem = (items: Item[], newItem: Item): Item[] => {
  return [...items, newItem];
};

// Avoid: Nested conditionals
if (user) {
  if (user.isActive) {
    if (user.hasPermission) {
      // do something
    }
  }
}

// Prefer: Early returns
if (!user || !user.isActive || !user.hasPermission) {
  return;
}
// do something

// Avoid: Large functions
const processOrder = (order: Order) => {
  // 100+ lines of code
};

// Prefer: Composed small functions
const processOrder = (order: Order) => {
  const validatedOrder = validateOrder(order);
  const pricedOrder = calculatePricing(validatedOrder);
  const finalOrder = applyDiscounts(pricedOrder);
  return submitOrder(finalOrder);
};
```

## Resources and References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Testing Library Principles](https://testing-library.com/docs/guiding-principles)
- [Kent C. Dodds Testing JavaScript](https://testingjavascript.com/)
- [Functional Programming in TypeScript](https://gcanti.github.io/fp-ts/)

## Summary

The key is to write clean, testable, functional code that evolves through small, safe increments. Every change should be driven by a test that describes the desired behavior, and the implementation should be the simplest thing that makes that test pass. When in doubt, favor simplicity and readability over cleverness.

### Generation Details

- Generated: 2025-11-14T23:29:11.291Z
- Generator: Claude Config Composer v1.0.0

### Compatibility Notes

This is a composed configuration. Some features may require additional setup or conflict resolution.
Review the combined configuration carefully and adjust as needed for your specific project.