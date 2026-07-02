import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Colors, Radius, Shadows, Layout } from '../theme';

// ── Props ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children:   React.ReactNode;
  onPress?:   () => void;
  style?:     ViewStyle;
  /** Remove internal padding — for cards whose content bleeds to edges (images, lists) */
  noPadding?: boolean;
  /** Elevate shadow for featured / hero cards */
  elevated?:  boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Card — the primary surface in ForThem.
 *
 * Design decisions:
 *  - Radius 20 (Radius.lg) — noticeably rounded, feels premium
 *  - Soft blue-tinted shadow — never pure black
 *  - No border — shadow provides definition
 *  - Tappable variant wraps in TouchableOpacity; static variant uses View
 */
export default function Card({
  children,
  onPress,
  style,
  noPadding = false,
  elevated  = false,
}: CardProps) {
  const cardStyle: ViewStyle[] = [
    styles.card,
    elevated && styles.elevated,
    noPadding && styles.noPadding,
    style as ViewStyle,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.70}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius:    Radius.lg,       // 20px
    padding:         Layout.cardPadding,
    ...Shadows.card,
  },
  elevated: {
    ...Shadows.float,
  },
  noPadding: {
    padding: 0,
  },
});
