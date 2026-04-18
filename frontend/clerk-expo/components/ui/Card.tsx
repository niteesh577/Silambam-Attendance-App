import React from 'react'
import { StyleSheet, View, type ViewProps } from 'react-native'
import { Colors, Radius, Spacing } from '@/constants/theme'

interface Props extends ViewProps {
  padded?: boolean
}

export function Card({ style, padded = true, children, ...rest }: Props) {
  return (
    <View style={[styles.card, padded && styles.padded, style]} {...rest}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  padded: {
    padding: Spacing.md,
  },
})
