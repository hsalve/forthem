import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import Icon from './Icon';
import { Colors, Radius, Shadows, Spacing, Typography } from '../theme';

// ── Props ─────────────────────────────────────────────────────────────────────

interface QuickActionProps {
  /** Lucide icon — preferred */
  icon?:        LucideIcon;
  /** Emoji fallback for screens not yet migrated to icons */
  emoji?:       string;
  label:        string;
  /** Optional subtitle line below the label */
  sub?:         string;
  onPress:      () => void;
  /** Background tint for the icon circle */
  accentColor?: string;
  /** Icon stroke colour — defaults to matching the accent */
  iconColor?:   string;
  style?:       ViewStyle;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * QuickAction — large tappable tile for Home screen action grids.
 *
 * Designed for 30-second parent tasks: one tap, one clear label.
 * Accepts either a Lucide `icon` (preferred) or legacy `emoji`.
 */
export default function QuickAction({
  icon,
  emoji,
  label,
  sub,
  onPress,
  accentColor = '#EDE9FE',
  iconColor   = Colors.primary,
  style,
}: QuickActionProps) {
  return (
    <TouchableOpacity
      style={[styles.tile, style]}
      onPress={onPress}
      activeOpacity={0.70}
    >
      {/* Icon / emoji in tinted circle */}
      <View style={[styles.iconCircle, { backgroundColor: accentColor }]}>
        {icon ? (
          <Icon icon={icon} size="md" color={iconColor} strokeWidth={1.75} />
        ) : (
          <Text style={styles.emoji}>{emoji}</Text>
        )}
      </View>

      {/* Label */}
      <Text style={styles.label} numberOfLines={2}>{label}</Text>

      {/* Subtitle */}
      {sub && (
        <Text style={styles.sub} numberOfLines={2}>{sub}</Text>
      )}
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tile: {
    flex:            1,
    backgroundColor: Colors.card,
    borderRadius:    Radius.lg,         // 20px
    padding:         Spacing.md,
    minHeight:       110,
    ...Shadows.card,
  },
  iconCircle: {
    width:         44,
    height:        44,
    borderRadius:  Radius.sm,           // 10px
    alignItems:    'center',
    justifyContent:'center',
    marginBottom:  Spacing.sm,
  },
  emoji: {
    fontSize: 22,
  },
  label: {
    fontSize:   13,
    fontWeight: '700',
    color:      Colors.textPrimary,
    lineHeight: 18,
    marginBottom: 3,
  },
  sub: {
    fontSize:   11,
    fontWeight: '500',
    color:      Colors.textSecondary,
    lineHeight: 15,
  },
});
