import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import Icon from './Icon';
import { Colors, Radius, Typography } from '../theme';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ChipStatus  = 'approved' | 'pending' | 'rejected' | 'draft';
export type ChipVariant = ChipStatus | 'filter' | 'info';

interface ChipProps {
  label:     string;
  variant?:  ChipVariant;
  /** For filter chips — toggles active/inactive style */
  selected?: boolean;
  onPress?:  () => void;
  /** Optional leading Lucide icon */
  icon?:     LucideIcon;
  style?:    ViewStyle;
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS: Record<ChipStatus, { bg: string; text: string; dot: string }> = {
  approved: { bg: Colors.successBg, text: Colors.successText, dot: Colors.success  },
  pending:  { bg: Colors.warningBg, text: Colors.warningText, dot: Colors.warning  },
  rejected: { bg: Colors.errorBg,   text: Colors.errorText,   dot: Colors.error    },
  draft:    { bg: Colors.neutralBg, text: Colors.neutralText,  dot: Colors.textDisabled },
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Chip — two modes, one consistent shape (Radius.sm = 10px pill).
 *
 * Status chip  → pass a ChipStatus variant. Shows a coloured dot.
 *                Read-only unless onPress is provided.
 *
 * Filter chip  → pass variant="filter" + selected prop.
 *                Toggles between primary-tinted and neutral.
 *
 * Info chip    → pass variant="info". Neutral, informational.
 */
export default function Chip({
  label,
  variant  = 'draft',
  selected = false,
  onPress,
  icon,
  style,
}: ChipProps) {
  const isFilter = variant === 'filter';
  const isInfo   = variant === 'info';
  const isStatus = !isFilter && !isInfo;

  // Resolve colours
  let bg:   string;
  let text: string;
  let dot:  string | undefined;

  if (isFilter) {
    bg   = selected ? '#EDEAFF' : Colors.neutralBg;
    text = selected ? Colors.primary : Colors.textSecondary;
  } else if (isInfo) {
    bg   = Colors.neutralBg;
    text = Colors.textSecondary;
  } else {
    const cfg = STATUS[variant as ChipStatus];
    bg   = cfg.bg;
    text = cfg.text;
    dot  = cfg.dot;
  }

  const content = (
    <>
      {/* Status dot */}
      {dot && <View style={[styles.dot, { backgroundColor: dot }]} />}

      {/* Optional icon */}
      {icon && !dot && (
        <Icon icon={icon} size={12} color={text} strokeWidth={2} />
      )}

      {/* Label */}
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </>
  );

  const chipStyle = [
    styles.chip,
    { backgroundColor: bg },
    isFilter && selected && styles.filterActive,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={chipStyle}
        onPress={onPress}
        activeOpacity={0.70}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={chipStyle}>{content}</View>;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  chip: {
    flexDirection:    'row',
    alignSelf:        'flex-start',
    alignItems:       'center',
    gap:              5,
    paddingVertical:  5,
    paddingHorizontal: 10,
    borderRadius:     Radius.sm,   // 10px — noticeably rounded but not full pill
  },
  filterActive: {
    borderWidth:  1.5,
    borderColor:  Colors.primary,
  },
  dot: {
    width:        6,
    height:       6,
    borderRadius: 3,
  },
  label: {
    fontSize:      12,
    fontWeight:    '600',
    letterSpacing: 0.1,
  },
});
