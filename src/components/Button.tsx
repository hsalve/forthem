import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import Icon from './Icon';
import { Colors, Radius, Layout, Typography } from '../theme';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label:       string;
  onPress:     () => void;
  variant?:    ButtonVariant;
  size?:       ButtonSize;
  loading?:    boolean;
  disabled?:   boolean;
  fullWidth?:  boolean;
  /** Optional Lucide icon shown left of the label */
  iconLeft?:   LucideIcon;
  /** Optional Lucide icon shown right of the label */
  iconRight?:  LucideIcon;
  style?:      ViewStyle;
  textStyle?:  TextStyle;
}

// ── Size tokens ───────────────────────────────────────────────────────────────

const SIZE: Record<ButtonSize, { height: number; px: number; fontSize: number; iconSize: number }> = {
  sm: { height: 38, px: 16, fontSize: 13, iconSize: 14 },
  md: { height: 48, px: 20, fontSize: 14, iconSize: 16 },
  lg: { height: Layout.buttonHeight, px: 24, fontSize: 15, iconSize: 18 },
};

// ── Variant tokens ────────────────────────────────────────────────────────────

const VARIANT_BG: Record<ButtonVariant, string> = {
  primary:   Colors.primary,
  secondary: 'transparent',
  ghost:     'transparent',
  danger:    Colors.errorBg,
};

const VARIANT_BORDER: Record<ButtonVariant, string | undefined> = {
  primary:   undefined,
  secondary: Colors.primary,
  ghost:     undefined,
  danger:    Colors.error,
};

const VARIANT_TEXT: Record<ButtonVariant, string> = {
  primary:   Colors.textInverse,
  secondary: Colors.primary,
  ghost:     Colors.textSecondary,
  danger:    Colors.errorText,
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Button — one consistent component for all tappable actions.
 *
 * Variants:
 *  primary   → purple fill, white text.   One per screen.
 *  secondary → purple outline.            Supporting actions.
 *  ghost     → no border.                 Cancel / tertiary.
 *  danger    → red tint.                  Destructive actions.
 *
 * All buttons use Radius.md (14px). Icon-only buttons are not supported —
 * use TouchableOpacity + Icon directly for icon-only controls.
 */
export default function Button({
  label,
  onPress,
  variant   = 'primary',
  size      = 'lg',
  loading   = false,
  disabled  = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  style,
  textStyle,
}: ButtonProps) {
  const s          = SIZE[size];
  const isDisabled = disabled || loading;
  const textColor  = VARIANT_TEXT[variant];
  const borderColor = VARIANT_BORDER[variant];

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          height:           s.height,
          paddingHorizontal: s.px,
          backgroundColor:  VARIANT_BG[variant],
          borderColor:      borderColor,
          borderWidth:      borderColor ? 1.5 : 0,
        },
        fullWidth  && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.72}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.textInverse : Colors.primary}
          size="small"
        />
      ) : (
        <View style={styles.inner}>
          {iconLeft && (
            <Icon
              icon={iconLeft}
              size={s.iconSize}
              color={textColor}
              strokeWidth={2}
            />
          )}
          <Text
            style={[
              styles.label,
              { fontSize: s.fontSize, color: textColor },
              textStyle,
            ]}
          >
            {label}
          </Text>
          {iconRight && (
            <Icon
              icon={iconRight}
              size={s.iconSize}
              color={textColor}
              strokeWidth={2}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    borderRadius:     Radius.md,    // 14px — consistent across all sizes
    alignItems:       'center',
    justifyContent:   'center',
    minWidth:         Layout.minTapTarget,
  },
  fullWidth: {
    width: '100%',
  },
  inner: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            8,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  disabled: {
    opacity: 0.40,
  },
});
