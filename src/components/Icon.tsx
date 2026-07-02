import React from 'react';
import { LucideIcon, LucideProps } from 'lucide-react-native';
import { Colors } from '../theme';

// ── Size scale ────────────────────────────────────────────────────────────────

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const SIZE_MAP: Record<IconSize, number> = {
  xs:  12,
  sm:  16,
  md:  20,
  lg:  24,
  xl:  32,
  xxl: 40,
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface IconProps {
  /** Any icon from lucide-react-native, e.g. `import { Home } from 'lucide-react-native'` */
  icon: LucideIcon;
  /** Named size token or exact pixel value */
  size?: IconSize | number;
  /** Stroke color — defaults to textPrimary */
  color?: string;
  /** Line weight — 1.5 is the ForThem standard. Use 2 for bold, 1.25 for light. */
  strokeWidth?: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Icon — single source of truth for all iconography in ForThem.
 *
 * Always import icons from lucide-react-native and pass them through this
 * component. Never use raw LucideIcon or emoji for UI chrome.
 *
 * Usage:
 *   import { ArrowRight } from 'lucide-react-native';
 *   <Icon icon={ArrowRight} size="md" color={Colors.primary} />
 */
export default function Icon({
  icon: IconComponent,
  size    = 'md',
  color   = Colors.textPrimary,
  strokeWidth = 1.5,
}: IconProps) {
  const px = typeof size === 'number' ? size : SIZE_MAP[size];
  return (
    <IconComponent
      size={px}
      color={color}
      strokeWidth={strokeWidth}
    />
  );
}

// ── Convenience sizes ─────────────────────────────────────────────────────────

export const ICON_SIZE = SIZE_MAP;
