import { TextStyle } from 'react-native';
import { Colors } from './colors';

// ── Type scale ────────────────────────────────────────────────────────────────
// Built on a modular scale with a clear 4-level heading hierarchy.
// Line heights are 1.25× for headings, 1.5× for body.
export const Typography: Record<string, TextStyle> = {

  // ── Headings ─────────────────────────────────────────────────────────────

  // Screen titles — only one per screen
  h1: {
    fontSize:      32,
    fontWeight:    '800',
    color:         Colors.textPrimary,
    letterSpacing: -0.8,
    lineHeight:    40,
  },

  // Card / section titles
  h2: {
    fontSize:      26,
    fontWeight:    '700',
    color:         Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight:    32,
  },

  // Sub-section headings
  h3: {
    fontSize:      20,
    fontWeight:    '600',
    color:         Colors.textPrimary,
    letterSpacing: -0.2,
    lineHeight:    26,
  },

  // In-card titles, list item headings
  h4: {
    fontSize:      17,
    fontWeight:    '600',
    color:         Colors.textPrimary,
    lineHeight:    22,
  },

  // ── Body ─────────────────────────────────────────────────────────────────

  body: {
    fontSize:   15,
    fontWeight: '400',
    color:      Colors.textPrimary,
    lineHeight: 22,
  },

  bodyBold: {
    fontSize:   15,
    fontWeight: '600',
    color:      Colors.textPrimary,
    lineHeight: 22,
  },

  // ── Supporting ───────────────────────────────────────────────────────────

  small: {
    fontSize:   13,
    fontWeight: '400',
    color:      Colors.textSecondary,
    lineHeight: 18,
  },

  smallBold: {
    fontSize:   13,
    fontWeight: '600',
    color:      Colors.textSecondary,
    lineHeight: 18,
  },

  tiny: {
    fontSize:   11,
    fontWeight: '500',
    color:      Colors.tabInactive,
    lineHeight: 15,
  },

  // ── Functional ───────────────────────────────────────────────────────────

  // Section header labels — ALL CAPS, tracked out
  label: {
    fontSize:      11,
    fontWeight:    '700',
    color:         Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    lineHeight:    15,
  },

  // Form field labels
  caption: {
    fontSize:   12,
    fontWeight: '600',
    color:      Colors.textSecondary,
    lineHeight: 16,
  },

  // Large financial / countdown numbers
  numericLg: {
    fontSize:      48,
    fontWeight:    '800',
    color:         Colors.textPrimary,
    letterSpacing: -1.5,
    lineHeight:    56,
  },

  numericMd: {
    fontSize:      32,
    fontWeight:    '800',
    color:         Colors.textPrimary,
    letterSpacing: -0.8,
    lineHeight:    38,
  },

  numericSm: {
    fontSize:      20,
    fontWeight:    '700',
    color:         Colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight:    24,
  },

  // Tab bar (no label text, but kept for reference)
  tab: {
    fontSize:   10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
};
