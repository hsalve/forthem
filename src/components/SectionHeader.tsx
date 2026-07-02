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
import { Colors, Typography, Layout, Spacing } from '../theme';

// ── Props ─────────────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title:      string;
  /** Right-side text link, e.g. "See all" */
  action?:    string;
  onAction?:  () => void;
  /** Optional leading icon next to title */
  icon?:      LucideIcon;
  style?:     ViewStyle;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * SectionHeader — identical layout on every screen.
 *
 * Spacing contract (from DESIGN_SYSTEM.md):
 *   marginTop  → always Layout.sectionSpacing (32) from the content above
 *   marginBottom → always Layout.sectionLabelMb (10) above the first card
 *
 * Callers set marginTop via the `style` prop when needed.
 * SectionHeader itself enforces marginBottom so cards are consistently spaced.
 */
export default function SectionHeader({
  title,
  action,
  onAction,
  icon,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      {/* Left: optional icon + title */}
      <View style={styles.left}>
        {icon && (
          <Icon
            icon={icon}
            size="sm"
            color={Colors.textSecondary}
            strokeWidth={1.75}
          />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Right: optional action */}
      {action && (
        <TouchableOpacity
          onPress={onAction}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.action}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    // Fixed bottom spacing — callers control top spacing via style prop
    marginBottom:   Layout.sectionLabelMb,
  },
  left: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
  },
  title: {
    // h3 inline so it stays in sync with typography changes
    fontSize:      20,
    fontWeight:    '600',
    color:         Colors.textPrimary,
    letterSpacing: -0.2,
    lineHeight:    26,
  },
  action: {
    fontSize:      13,
    fontWeight:    '600',
    color:         Colors.primary,
    letterSpacing: 0.1,
  },
});
