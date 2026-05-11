# AlgoTutor Design System Documentation

## 1. Project Overview

**AlgoTutor** is an AI-powered algorithm learning platform built with modern web technologies. The design system emphasizes clarity, readability, and a developer-friendly aesthetic while maintaining a polished, professional appearance.

---

## 2. Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 16.2.4 |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS | v4 |
| Component System | shadcn/ui + Radix UI | - |
| Animations | tw-animate-css + Custom CSS | - |
| Dark Mode | next-themes | 0.4.6 |
| Data Fetching | SWR | 2.4.1 |
| Icons | Lucide React | 1.8.0 |
| Fonts | Geist Sans + Geist Mono | - |

---

## 3. Color System

### 3.1 Design Principles
- **OKLCH Color Space**: Uses perceptually uniform OKLCH colors for consistent luminance and chroma across the spectrum
- **CSS Variables**: All colors defined as CSS custom properties for easy theming
- **Dual Theme Support**: Full light and dark mode with inverted color schemes

### 3.2 Primary Color Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| Primary | `oklch(0.55 0.2 250)` | `oklch(0.7 0.18 195)` | Main actions, CTAs, links |
| Primary Foreground | `oklch(0.98 0 0)` | `oklch(0.11 0.015 260)` | Text on primary |
| Secondary | `oklch(0.96 0.005 260)` | `oklch(0.2 0.015 260)` | Secondary actions |
| Muted | `oklch(0.95 0.005 260)` | `oklch(0.2 0.01 260)` | Backgrounds, cards |
| Accent | `oklch(0.94 0.01 260)` | `oklch(0.22 0.015 260)` | Highlights, hover states |

### 3.3 Difficulty Colors

Used for problem difficulty indicators (LeetCode-style):

| Level | Light Mode | Dark Mode |
|-------|-----------|-----------|
| Easy | `oklch(0.65 0.2 145)` | `oklch(0.72 0.18 145)` |
| Medium | `oklch(0.7 0.18 85)` | `oklch(0.75 0.16 80)` |
| Hard | `oklch(0.6 0.22 25)` | `oklch(0.65 0.2 25)` |

### 3.4 Chart Colors

Five distinct colors for data visualization:

```css
--chart-1: oklch(0.6 0.18 180);  /* Cyan/Teal */
--chart-2: oklch(0.55 0.2 250);  /* Blue (matches primary) */
--chart-3: oklch(0.5 0.15 30);   /* Orange */
--chart-4: oklch(0.45 0.12 280); /* Purple */
--chart-5: oklch(0.55 0.15 340); /* Pink/Magenta */
```

### 3.5 Semantic Colors

| Token | Purpose |
|-------|---------|
| `--destructive` | Error states, delete actions (`oklch(0.6 0.25 25)`) |
| `--border` | Borders and dividers |
| `--ring` | Focus rings for accessibility |
| `--input` | Input field backgrounds |

---

## 4. Typography

### 4.1 Font Stack

| Font | Variable | Usage |
|------|----------|-------|
| Geist Sans | `--font-geist-sans` | Body text, UI elements |
| Geist Mono | `--font-geist-mono` | Code blocks, technical content |
| Heading | `--font-heading` | Uses sans variable |

### 4.2 Type Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 5xl-7xl (3.75rem-5rem) | Bold (700) | 1.05 |
| H2 | 4xl-5xl (2.25rem-3rem) | Bold (700) | Tight |
| H3 | lg-lg (1.125rem-1.25rem) | Semibold (600) | Snug |
| Body | Base (1rem) | Normal | Relaxed |
| Small | sm (0.875rem) | Normal | Relaxed |
| Code | xs (0.75rem) | Mono | Relaxes |

### 4.3 Text Utilities

```css
.text-gradient {
  background: linear-gradient(135deg, var(--primary) 0%, var(--chart-3) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 5. Component System

### 5.1 Architecture Pattern

The project uses **compound component pattern** combined with **data-slot attributes**:

```tsx
// Example: Card compound component
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### 5.2 Component Slots

Each component uses `data-slot` attributes for CSS targeting:

```tsx
<div data-slot="card" data-size="default">
<div data-slot="card-header" />
<div data-slot="card-content" />
```

### 5.3 Variant System

Components use **Class Variance Authority (CVA)** for variant management:

```tsx
const buttonVariants = cva(
  "group/button inline-flex items-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border-border bg-background hover:bg-muted",
        ghost: "hover:bg-muted",
        destructive: "bg-destructive/10 text-destructive",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-2.5",
        sm: "h-7 px-2.5 text-[0.8rem]",
        lg: "h-9 px-2.5",
        icon: "size-8",
      },
    },
  }
);
```

### 5.4 Core UI Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `Button` | Actions, CTAs | 5 variants, 6 sizes, icon support |
| `Card` | Content containers | Size variants, compound slots |
| `Badge` | Labels, tags | Variant styling |
| `Input` | Form fields | Consistent with design system |
| `Dialog` | Modals | Radix-based, accessible |
| `Tabs` | Content switching | Keyboard navigable |
| `Accordion` | Collapsible sections | Smooth animations |
| `Skeleton` | Loading states | Pulse animation |

---

## 6. Layout & Spacing

### 6.1 Container

```css
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

### 6.2 Section Spacing

| Section | Vertical Padding |
|---------|-----------------|
| Default sections | `py-24 lg:py-32` |
| Compact sections | `py-16 lg:py-24` |
| Hero | `py-24 lg:py-32` |

### 6.3 Component Spacing

| Element | Padding |
|---------|---------|
| Card padding | `p-5` to `p-6` |
| Card content | `px-4` |
| Card footer | `p-4` with `bg-muted/50` |
| Button | `px-2.5`, `gap-1.5` |

### 6.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | 0.5rem | Base radius |
| `--radius-sm` | `calc(var(--radius) * 0.6)` | Small elements |
| `--radius-md` | `calc(var(--radius) * 0.8)` | Medium elements |
| `--radius-lg` | `var(--radius)` | Large elements |
| `--radius-xl` | `calc(var(--radius) * 1.4)` | Cards, modals |

---

## 7. Animation & Motion

### 7.1 Animation Utilities

```css
/* Floating animations */
.float-slow   { animation: float-slow 8s ease-in-out infinite; }
.float-medium { animation: float-medium 6s ease-in-out infinite; }
.float-fast   { animation: float-fast 4s ease-in-out infinite; }

/* Reveal animation */
.reveal-up {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.reveal-up.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Ticker/Marquee */
.animate-ticker {
  animation: ticker 28s linear infinite;
}
```

### 7.2 Keyframes

```css
@keyframes float-slow {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33%       { transform: translateY(-12px) rotate(1deg); }
  66%       { transform: translateY(-6px) rotate(-1deg); }
}

@keyframes float-medium {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%       { transform: translateY(-10px) rotate(-2deg); }
}

@keyframes float-fast {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  25%       { transform: translateY(-8px) translateX(4px); }
  75%       { transform: translateY(-4px) translateX(-4px); }
}
```

### 7.3 Transition Utilities

| Utility | Duration | Usage |
|---------|----------|-------|
| `transition-all` | Default | Hover states |
| `duration-300` | 300ms | Card hover |
| `duration-500` | 500ms | Reveal animations |

### 7.4 Micro-interactions

```css
/* Glow effect on buttons */
.glow-border {
  box-shadow: 0 0 0 1px var(--ring), 0 0 20px -5px var(--ring);
}

/* Hover lift effect */
hover:-translate-y-1 hover:shadow-md
```

---

## 8. Visual Effects

### 8.1 Background Patterns

```css
/* Dot grid pattern */
.bg-dotgrid {
  background-image: radial-gradient(circle, var(--muted-foreground) 1px, transparent 1px);
  background-size: 28px 28px;
}
```

### 8.2 Gradient Orbs

```css
.orb-primary {
  filter: blur(80px);
  pointer-events: none;
}
```

### 8.3 Code Block Styling

```css
.code-border {
  border: 1px solid oklch(100% 0 0 / 0.1);
  background: linear-gradient(135deg,
    oklch(0.15 0.015 260) 0%,
    oklch(0.18 0.02 260) 100%
  );
}
```

### 8.4 Avatar Gradients

```tsx
const AVATAR_GRADIENTS = [
  "from-primary to-[oklch(0.65_0.15_340)]",
  "from-[oklch(0.7_0.18_85)] to-[oklch(0.65_0.15_340)]",
  "from-[oklch(0.6_0.18_180)] to-primary",
  "from-[oklch(0.65_0.15_340)] to-[oklch(0.7_0.18_250)]",
];
```

### 8.5 Roadmap Color Tokens

```tsx
const ROADMAP_GRADIENTS = [
  "[oklch(0.65_0.2_145)]",  // Green
  "[oklch(0.7_0.18_250)]",  // Blue
  "[oklch(0.6_0.18_180)]",  // Cyan
  "[oklch(0.7_0.18_85)]",   // Yellow
  "[oklch(0.65_0.15_340)]", // Pink
  "[oklch(0.6_0.18_25)]",   // Red
  "[oklch(0.7_0.18_195)]",  // Teal
  "[oklch(0.55_0.15_280)]", // Purple
];
```

---

## 9. Dark Mode Implementation

### 9.1 Provider Setup

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
  storageKey="theme"
>
  {children}
</ThemeProvider>
```

### 9.2 Theme Structure

| Token | Light | Dark |
|-------|-------|------|
| Background | `oklch(0.98 0 0)` | `oklch(0.11 0.015 260)` |
| Foreground | `oklch(0.15 0.015 260)` | `oklch(0.95 0 0)` |
| Card | `oklch(1 0 0)` | `oklch(0.15 0.015 260)` |
| Border | `oklch(0.9 0.01 260)` | `oklch(1 0 0 / 12%)` |

---

## 10. Icon System

### 10.1 Icon Library
- **Primary**: Lucide React
- **Usage**: Dynamic icon rendering via icon map

```tsx
import { getIcon } from "@/lib/lucide-icons";

// Usage
const Icon = getIcon(feature.iconKey);
<Icon className="size-6" />
```

### 10.2 Icon Sizing

| Context | Size |
|---------|------|
| Default | 4 (16px) |
| Small | 3.5 (14px) |
| Large | 5 (20px) |
| Button icon | 3.5-4 |
| Feature icon | 6 (24px) |
| Card icon | 5-6 |

---

## 11. Responsive Design

### 11.1 Breakpoints

| Breakpoint | Prefix | Min Width |
|------------|--------|-----------|
| Small | sm | 640px |
| Medium | md | 768px |
| Large | lg | 1024px |
| XL | xl | 1280px |
| 2XL | 2xl | 1536px |

### 11.2 Grid Layouts

| Section | Grid |
|---------|------|
| Features | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |
| Testimonials | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` |
| Roadmaps | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (horizontal scroll on mobile) |

### 11.3 Container Queries

```css
@container/card-header /* For responsive card headers */
```

---

## 12. Accessibility

### 12.1 Focus States

```css
/* Focus visible ring */
focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50

/* Dark mode variant */
dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40
```

### 12.2 ARIA Attributes

- `aria-invalid` for form validation
- `aria-expanded` for expandable elements
- `aria-label` for icon buttons
- `aria-hidden` for decorative elements

### 12.3 Motion Safety

```tsx
disableTransitionOnChange // In theme provider
```

---

## 13. Data Fetching & Loading States

### 13.1 SWR Integration

```tsx
<SWRConfig>
  {children}
</SWRConfig>
```

### 13.2 Loading Patterns

```tsx
const { data, isLoading, error } = useLandingData<Type>("/endpoint");

// Skeleton loading
{isLoading ? (
  <Skeleton className="h-6 w-16" />
) : (
  <ActualContent />
)}
```

---

## 14. Code Syntax Highlighting

### 14.1 Color Scheme

Custom syntax colors for code blocks:

| Token Type | Color |
|------------|-------|
| Keywords | `oklch(0.55 0.15 250)` |
| Functions | `oklch(0.7 0.18 195)` |
| Variables | `oklch(0.6 0.12 280)` |
| Numbers | `oklch(0.8 0.1 30)` |
| Strings | `oklch(0.65 0.15 340)` |
| Punctuation | `oklch(0.9 0 0)` |

---

## 15. Best Practices

### 15.1 Component Guidelines

1. **Always use `cn()` utility** for merging classes
2. **Use `data-slot` attributes** for styling compound components
3. **Export both component and variants** for flexibility
4. **Handle loading states** with Skeleton components
5. **Handle error states** with graceful fallbacks

### 15.2 Naming Conventions

```tsx
// Component file: kebab-case
hero-section.tsx
features-section.tsx

// Component function: PascalCase
export function HeroSection() {}
export function FeaturesSection() {}

// CSS variables: kebab-case
--primary-foreground
--card-foreground
```

### 15.3 File Structure

```
components/
├── ui/           # Reusable UI components (Button, Card, etc.)
├── landing/      # Landing page sections
├── layout/       # Layout components (Navbar, Footer, Sidebar)
├── problems/     # Problem-solving components
└── providers/   # Context providers (SWR, Theme)
```

---

## 16. Summary

The AlgoTutor design system is characterized by:

- **Modern Color Science**: OKLCH color space for perceptually uniform colors
- **Developer-Centric**: Code-focused aesthetics with syntax highlighting
- **Performance-First**: Lightweight animations, optimized CSS
- **Accessible**: ARIA attributes, focus states, motion safety
- **Themeable**: Full dark mode support with system preference detection
- **Component-Based**: Compound components with data-slot styling
- **Responsive**: Mobile-first with thoughtful breakpoints
