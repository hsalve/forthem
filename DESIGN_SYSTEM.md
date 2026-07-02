# ForThem — Design System

> Calm. Premium. Fast. Built for parents with no time to spare.
> Inspired by: Apple Calendar, Airbnb, Revolut, Headspace, Notion.

---

## Brand Personality

| Trait | What it means in the UI |
|---|---|
| **Calm** | Lots of whitespace, no aggressive colors, no clutter |
| **Premium** | Consistent spacing, quality typography, subtle shadows |
| **Modern** | Rounded corners, clean cards, flat iconography |
| **Friendly** | Warm tones, approachable language, emoji used sparingly |
| **Fast** | Large tap targets, minimal steps, instant feedback |

---

## Color Tokens

Use these names in code — never hardcode hex values in components.

```ts
// src/constants/colors.ts  ← create this file in Phase 2
export const Colors = {
  primary:         '#6C63FF',  // Main actions, active tabs, CTAs
  secondary:       '#A78BFA',  // Secondary buttons, highlights, tags
  success:         '#6FCF97',  // Confirmed swaps, paid expenses, approvals
  warning:         '#F2C94C',  // Pending items, upcoming deadlines
  error:           '#EB5757',  // Rejections, overdue, destructive actions

  background:      '#F8F9FC',  // App background — every screen
  card:            '#FFFFFF',  // All cards, modals, bottom sheets
  border:          '#E5E7EB',  // Dividers, input borders, separators

  textPrimary:     '#1F2937',  // Headings, labels, primary content
  textSecondary:   '#6B7280',  // Subtitles, hints, metadata
  textDisabled:    '#D1D5DB',  // Inactive states
  textInverse:     '#FFFFFF',  // Text on colored backgrounds

  tabActive:       '#6C63FF',
  tabInactive:     '#9CA3AF',
};
```

### Color Usage Rules
- `primary` is for **one** element per screen — the main CTA.
- `secondary` is for supporting actions and status chips.
- `background` is the screen background. Never white.
- `card` is always white — cards float on the background.
- Never use `error` red for anything other than actual errors.

---

## Typography

```ts
// src/constants/typography.ts  ← create this file in Phase 2
export const Typography = {
  // Headings
  h1: { fontSize: 28, fontWeight: '800', color: '#1F2937', letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  h3: { fontSize: 18, fontWeight: '600', color: '#1F2937' },

  // Body
  body:     { fontSize: 15, fontWeight: '400', color: '#1F2937', lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  small:    { fontSize: 13, fontWeight: '400', color: '#6B7280' },
  tiny:     { fontSize: 11, fontWeight: '400', color: '#9CA3AF' },

  // Labels
  label:    { fontSize: 12, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  caption:  { fontSize: 13, fontWeight: '500', color: '#6B7280' },
};
```

### Typography Rules
- Max **2 font sizes** visible on any screen at once.
- Headings are never centered unless it's an empty state.
- Use `fontWeight: '800'` only for screen titles.

---

## Spacing

Based on an **8pt grid**. Use multiples of 8 (or 4 for fine-tuning).

```ts
export const Spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
};
```

### Spacing Rules
- Screen horizontal padding: always `24`.
- Between cards: always `12`.
- Inside a card (padding): always `20`.
- Bottom of scrollable screens: `32` (safe area buffer).

---

## Border Radius

```ts
export const Radius = {
  sm:   8,   // Chips, tags, small buttons
  md:   12,  // Inputs, secondary buttons
  lg:   16,  // Cards — the default
  xl:   24,  // Bottom sheets, large modals
  full: 999, // Pills, avatars, FABs
};
```

All cards use `Radius.lg` (16). No exceptions.

---

## Shadows

```ts
export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,  // Android
  },
  modal: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
};
```

---

## Component Patterns

### Cards
- Background: `#FFFFFF`
- Border radius: `16`
- Padding: `20`
- Shadow: `Shadows.card`
- Never use a border on cards — shadow provides definition.

```
┌──────────────────────────────┐
│  🔄  Swap Request            │  ← emoji + bold title
│      Friday → Saturday       │  ← subtitle in textSecondary
│                    [Approve] │  ← primary action right-aligned
└──────────────────────────────┘
```

### Buttons

| Variant | Use case | Style |
|---|---|---|
| Primary | Main CTA per screen | `background: primary`, white text, radius 12, height 52 |
| Secondary | Supporting action | `background: transparent`, `border: primary`, primary text |
| Ghost | Destructive / cancel | No border, `color: error` or `textSecondary` |
| Chip | Filter / tag / status | Small pill, `background: secondary + 20% opacity` |

- Minimum tap target: **48 × 48pt** — no smaller.
- Primary button always full-width at the bottom of a form.

### Inputs
- Height: `52`
- Border: `1px solid #E5E7EB`
- Border radius: `12`
- Focus border: `primary`
- Background: `#FFFFFF`
- Font size: `15`
- Always show a label above — never rely on placeholder alone.

### Status Chips

```
● Approved   → background: #6FCF97 20%,  text: #27AE60
● Pending    → background: #F2C94C 20%,  text: #B7881A
● Rejected   → background: #EB5757 20%,  text: #C0392B
● Draft      → background: #E5E7EB,       text: #6B7280
```

### Empty States
- Centered vertically and horizontally.
- Large emoji (48px) at top.
- h3 title + body description.
- One primary action button below.
- Never show a blank white screen.

### Loading States
- Use skeleton loaders that match the shape of the real content.
- Never show a spinner in the middle of a content area.
- Skeleton color: `#F3F4F6` animated to `#E5E7EB`.

---

## Navigation

### Bottom Tab Bar
- 5 tabs max.
- Active: `primary` color + emoji at full opacity.
- Inactive: `tabInactive` + emoji at 50% opacity.
- No tab labels — emoji icons only (keeps it compact).
- Tab bar background: `#FFFFFF` with top border `#E5E7EB`.

### Screen Headers
- Most screens: **no default React Navigation header**.
- Build custom headers inside `SafeAreaView` to control spacing.
- Back buttons: left-aligned chevron, `primary` color.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use large, tappable cards | Use small list rows |
| Use emoji for visual anchors | Overuse emoji (max 1–2 per screen) |
| Pre-fill smart defaults | Make the user type everything |
| Show one CTA per screen | Show 3 buttons of equal weight |
| Use `#F8F9FC` as background | Use plain white as background |
| Confirm destructive actions | Delete without a confirmation |
| Animate state transitions | Use jarring instant switches |
| Keep modals to 3 fields max | Put entire forms in modals |
