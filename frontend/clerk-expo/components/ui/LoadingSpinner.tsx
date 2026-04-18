import React from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native'
import { Colors } from '@/constants/theme'

interface Props {
  size?: 'small' | 'large'
  color?: string
  fullScreen?: boolean
}

export function LoadingSpinner({
  size = 'large',
  color = Colors.primary,
  fullScreen = false,
}: Props) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={color} />
      </View>
    )
  }
  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={color} />
    </View>
  )
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
