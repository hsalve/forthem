export const Colors = {
  // ── Brand ────────────────────────────────────────────────────────────────
  primary:    '#6C63FF',
  secondary:  '#A78BFA',

  // ── Semantic ──────────────────────────────────────────────────────────────
  success:    '#6FCF97',
  warning:    '#F2C94C',
  error:      '#EB5757',

  // ── Surfaces ──────────────────────────────────────────────────────────────
  background: '#F8F9FC',
  card:       '#FFFFFF',
  border:     '#E9ECF5',     // updated — softer blue-tinted border

  // ── Text ──────────────────────────────────────────────────────────────────
  textPrimary:   '#1F2937',
  textSecondary: '#6B7280',
  textDisabled:  '#C4C9D4',  // slightly warmer than before
  textInverse:   '#FFFFFF',

  // ── Navigation ────────────────────────────────────────────────────────────
  tabActive:   '#6C63FF',
  tabInactive: '#B0B7C3',

  // ── Status chip fills (flat, no runtime opacity) ──────────────────────────
  successBg:   '#EBF9F1',
  warningBg:   '#FEF8E7',
  errorBg:     '#FEF0F0',
  neutralBg:   '#F0F1F5',

  // ── Status chip text ──────────────────────────────────────────────────────
  successText: '#1E9A5E',
  warningText: '#A07716',
  errorText:   '#C0392B',
  neutralText: '#6B7280',

  // ── Skeleton loader ───────────────────────────────────────────────────────
  skeletonBase:  '#F0F1F5',
  skeletonShine: '#E4E7EF',
} as const;

export type ColorKey = keyof typeof Colors;
