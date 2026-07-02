// ── 8-point grid ──────────────────────────────────────────────────────────────
// Every value is a multiple of 8 (or 4 for fine-tuning).
export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
  xxxl:64,
} as const;

// ── Border radii ──────────────────────────────────────────────────────────────
// Increased across the board for a premium, rounded feel.
export const Radius = {
  xs:   6,   // inline badges, tiny elements
  sm:   10,  // chips, tags, small buttons (was 8)
  md:   14,  // inputs, secondary buttons (was 12)
  lg:   20,  // cards — the primary surface radius (was 16)
  xl:   28,  // modals, bottom sheets (was 24)
  full: 999, // pills, avatars, FABs
} as const;

// ── Shadows ───────────────────────────────────────────────────────────────────
// Softer, blue-tinted shadows — no pure black.
export const Shadows = {
  // Subtle lift for cards — barely there
  card: {
    shadowColor:  '#3B3F8C',
    shadowOpacity: 0.06,
    shadowRadius:  16,
    shadowOffset:  { width: 0, height: 2 },
    elevation: 2,
  },
  // Moderate lift for floating elements
  float: {
    shadowColor:  '#3B3F8C',
    shadowOpacity: 0.10,
    shadowRadius:  20,
    shadowOffset:  { width: 0, height: 4 },
    elevation: 4,
  },
  // Strong lift for modals / FABs
  modal: {
    shadowColor:  '#3B3F8C',
    shadowOpacity: 0.14,
    shadowRadius:  32,
    shadowOffset:  { width: 0, height: 8 },
    elevation: 8,
  },
} as const;

// ── Fixed layout constants ─────────────────────────────────────────────────────
// Named values so every screen uses identical measurements.
export const Layout = {
  // Screen
  screenPaddingH: 24,   // horizontal padding on every screen
  screenPaddingB: 40,   // bottom buffer on scrollable screens (increased)

  // Cards
  cardPadding:    20,   // internal card padding
  cardGap:        12,   // vertical gap between cards

  // Sections
  sectionSpacing: 32,   // marginTop before every SectionHeader
  sectionLabelMb: 10,   // marginBottom below every SectionHeader

  // Interaction
  minTapTarget:   48,   // minimum tappable width & height
  buttonHeight:   52,   // primary & secondary buttons
  inputHeight:    52,   // text inputs
} as const;
