# ForThem — Project Rules

> These rules apply to every line of code, every screen, every component.
> When in doubt: make it faster, simpler, and calmer.

---

## Who We're Building For

A parent who has **less than 30 seconds** to complete a task.
They are in the middle of school drop-off, a work meeting, or bedtime.
They cannot afford confusion. They cannot afford extra taps.

---

## Product Principles

### 1. Reduce Taps
Every interaction should be completable in **3 taps or fewer**.
If it takes more, redesign the flow.

### 2. Reduce Typing
Use pickers, toggles, chips, and pre-filled options wherever possible.
Typing is a last resort — never the default.

### 3. Reduce Scrolling
The most important action on every screen must be **visible without scrolling**.
Long lists must be paginated or filtered, never dumped.

### 4. One Primary Action Per Screen
Every screen has one clear purpose.
One CTA. One job. One outcome.

### 5. Speed Over Completeness
Show data fast. Use skeleton loaders, not blank screens.
Optimistic UI updates — reflect changes immediately, sync in background.

---

## Engineering Rules

### General
- TypeScript strict mode always. No `any`.
- No inline styles on components that will be reused.
- All styles via `StyleSheet.create()`.
- Use `DESIGN_SYSTEM.md` tokens — never hardcode colors or font sizes.

### Components
- Every reusable UI element lives in `src/components/`.
- Props must be typed with explicit TypeScript interfaces.
- Components must be single-responsibility.
- Avoid prop drilling deeper than 2 levels — use context or lift state.

### Navigation
- Navigation lives only in `src/navigation/`.
- Screens never import other screens.
- Pass only primitive params through navigation (IDs, not objects).

### Supabase
- All Supabase calls live in `src/services/` — never directly in screens.
- Always handle loading, success, and error states.
- Never expose the Supabase client outside of `src/lib/supabase.ts`.

### State
- Local UI state: `useState`.
- Shared/server state: introduce React Query or Zustand in Phase 3.
- Never store sensitive data in AsyncStorage beyond what Supabase auth needs.

### File Naming
```
src/components/     → PascalCase.tsx       (e.g. SwapCard.tsx)
src/screens/        → PascalCase.tsx       (e.g. HomeScreen.tsx)
src/services/       → camelCase.ts         (e.g. swapService.ts)
src/hooks/          → use + PascalCase.ts  (e.g. useSwaps.ts)
src/types/          → camelCase.ts         (e.g. swap.ts)
src/lib/            → camelCase.ts         (e.g. supabase.ts)
```

### What NOT to Do
- Do not rewrite working screens to add a feature.
- Do not add a library without checking if native RN or an existing dep solves it.
- Do not commit `.env`.
- Do not add console.log to production code.
- Do not build Phase N+2 while Phase N is incomplete.

---

## Phase Discipline

Each phase is confirmed complete before the next begins.
Scope creep is not added mid-phase — it goes on the backlog.

| Phase | Focus |
|---|---|
| 1 | Project foundation, navigation, placeholder screens |
| 2 | Google Auth via Supabase |
| 3 | Custody calendar with real data |
| 4 | Swap request flow |
| 5 | Shared expenses |
| 6 | Document storage |
