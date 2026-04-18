import React from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import { Card } from './Card'
import { BeltBadge, FeeBadge, StatusBadge } from './Badge'
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme'
import type { Student } from '@/lib/types'

interface Props {
  student: Student
  onPress?: () => void
}

export function StudentListCard({ student, onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card style={[styles.card, pressed && styles.pressed, !student.is_active && styles.inactive]}>
          <View style={styles.header}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {student.name}
              </Text>
              {!student.is_active && (
                <StatusBadge label="Inactive" color={Colors.border} />
              )}
            </View>
            <BeltBadge belt={student.belt} size="sm" />
          </View>
          
          <View style={styles.details}>
            <Text style={styles.detailText}>Age: {student.age}</Text>
            <Text style={styles.detailText}>•</Text>
            <Text style={styles.detailText}>Parent: {student.parent_name}</Text>
          </View>

          <View style={styles.footer}>
            <FeeBadge status={student.fee_status} />
            <Text style={styles.phone}>{student.phone}</Text>
          </View>
        </Card>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  inactive: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  detailText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phone: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
})
