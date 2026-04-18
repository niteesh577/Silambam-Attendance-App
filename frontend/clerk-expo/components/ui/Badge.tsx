import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import {
  BeltColors,
  BeltTextColors,
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
} from '@/constants/theme'

// ─── Belt Badge ───────────────────────────────────────────────────────────────
interface BeltBadgeProps {
  belt: string
  size?: 'sm' | 'md'
}

export function BeltBadge({ belt, size = 'md' }: BeltBadgeProps) {
  const bg   = BeltColors[belt]   ?? Colors.border
  const text = BeltTextColors[belt] ?? Colors.textPrimary
  const label = belt.charAt(0).toUpperCase() + belt.slice(1)

  return (
    <View style={[beltStyles.badge, { backgroundColor: bg }, size === 'sm' && beltStyles.sm]}>
      <Text style={[beltStyles.text, { color: text }, size === 'sm' && beltStyles.textSm]}>
        {label}
      </Text>
    </View>
  )
}

const beltStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  sm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textTransform: 'capitalize',
  },
  textSm: {
    fontSize: FontSize.xs,
  },
})

// ─── Fee Badge ────────────────────────────────────────────────────────────────
interface FeeBadgeProps {
  status: 'paid' | 'unpaid'
}

export function FeeBadge({ status }: FeeBadgeProps) {
  const isPaid = status === 'paid'
  return (
    <View style={[feeStyles.badge, isPaid ? feeStyles.paid : feeStyles.unpaid]}>
      <Text style={[feeStyles.text, isPaid ? feeStyles.textPaid : feeStyles.textUnpaid]}>
        {isPaid ? 'Paid' : 'Unpaid'}
      </Text>
    </View>
  )
}

const feeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  paid:   { backgroundColor: '#1B4D2E' },
  unpaid: { backgroundColor: '#4D1B1B' },
  text:   { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  textPaid:   { color: Colors.success },
  textUnpaid: { color: Colors.error },
})

// ─── Status Badge (generic) ───────────────────────────────────────────────────
interface StatusBadgeProps {
  label: string
  color: string
  textColor?: string
}

export function StatusBadge({ label, color, textColor = '#FFF' }: StatusBadgeProps) {
  return (
    <View style={[statusStyles.badge, { backgroundColor: color }]}>
      <Text style={[statusStyles.text, { color: textColor }]}>{label}</Text>
    </View>
  )
}

const statusStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
})
