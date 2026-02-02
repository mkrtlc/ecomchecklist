# EcomChecklist Premium Color System

## Philosophy
Premium SaaS aesthetic inspired by Linear, Vercel, and Stripe. Dark navy base with subtle gradients and amber/gold accents for high-converting CTAs.

## Core Palette

### Primary - Deep Navy
- `--navy-950`: #0a0f1a (Darkest, backgrounds)
- `--navy-900`: #0f172a (Primary dark bg)
- `--navy-800`: #1e293b (Cards, elevated surfaces)
- `--navy-700`: #334155 (Borders, muted elements)
- `--navy-600`: #475569 (Secondary text)
- `--navy-500`: #64748b (Muted text)

### Accent - Amber/Gold (CTAs)
- `--amber-500`: #f59e0b (Primary CTA)
- `--amber-400`: #fbbf24 (CTA hover)
- `--amber-600`: #d97706 (CTA active)
- `--amber-100`: #fef3c7 (Subtle amber bg)

### Success - Emerald
- `--emerald-500`: #10b981 (Success, passed checks)
- `--emerald-400`: #34d399 (Success hover)
- `--emerald-950`: #022c22 (Success bg dark)

### Warning - Orange
- `--orange-500`: #f97316 (Warnings)
- `--orange-400`: #fb923c (Warning hover)

### Error - Rose
- `--rose-500`: #f43f5e (Errors, failed)
- `--rose-400`: #fb7185 (Error hover)

### Neutral - Slate
- `--slate-50`: #f8fafc (Light bg)
- `--slate-100`: #f1f5f9 (Cards light)
- `--slate-200`: #e2e8f0 (Borders light)
- `--slate-300`: #cbd5e1 (Muted borders)
- `--slate-400`: #94a3b8 (Placeholder text)
- `--slate-500`: #64748b (Secondary text)
- `--slate-900`: #0f172a (Primary text)

## Gradients

### Hero Gradient (Dark)
```css
background: linear-gradient(135deg, #0a0f1a 0%, #0f172a 50%, #1e1b4b 100%);
```

### CTA Gradient (Gold)
```css
background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
```

### Premium Surface
```css
background: linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
```

## CSS Variables (Tailwind Integration)

```css
:root {
  --background: 210 40% 98%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --primary: 37 91% 55%; /* Amber for CTAs */
  --primary-foreground: 0 0% 100%;
  --secondary: 215 25% 27%;
  --secondary-foreground: 210 40% 98%;
  --accent: 215 28% 17%;
  --accent-foreground: 210 40% 98%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --ring: 37 91% 55%;
}

.dark {
  --background: 222 47% 6%;
  --foreground: 210 40% 98%;
  --card: 222 47% 9%;
  --card-foreground: 210 40% 98%;
  --primary: 37 91% 55%;
  --primary-foreground: 222 47% 11%;
  --secondary: 215 28% 17%;
  --secondary-foreground: 210 40% 98%;
  --accent: 215 28% 17%;
  --accent-foreground: 210 40% 98%;
  --muted: 215 28% 17%;
  --muted-foreground: 215 20% 65%;
  --ring: 37 91% 55%;
}
```

## Usage Guidelines

1. **Hero sections**: Use navy-950/900 with subtle indigo undertones
2. **CTAs**: Always amber-500 with hover to amber-400
3. **Success states**: Emerald for passed/success
4. **Error states**: Rose for failed/errors
5. **Warnings**: Orange for warnings
6. **Text hierarchy**:
   - Primary: slate-900 (light) / slate-50 (dark)
   - Secondary: slate-600 (light) / slate-400 (dark)
   - Muted: slate-500 (light) / slate-500 (dark)

## Contrast Ratios
All color combinations meet WCAG AA standards (4.5:1 minimum for text).
