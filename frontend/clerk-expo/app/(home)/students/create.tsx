import React, { useEffect, useState } from 'react'
import { StyleSheet, View, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/Button'
import { Colors, Radius, Spacing, FontSize } from '@/constants/theme'
import { useStudents } from '@/lib/hooks/useStudents'
import { useBranches } from '@/lib/hooks/useBranches'
import type { BeltColor, FeeStatus, StudentCreate } from '@/lib/types'
import { BeltBadge } from '@/components/ui/Badge'

export default function CreateStudent() {
    const router = useRouter()
    const { createStudent, creating } = useStudents()
    const { branches, fetchBranches } = useBranches()
    
    // Form state
    const [branchId, setBranchId] = useState('')
    const [name, setName] = useState('')
    const [age, setAge] = useState('')
    const [parentName, setParentName] = useState('')
    const [phone, setPhone] = useState('')
    const [belt, setBelt] = useState<BeltColor>('white')
    const [feeStatus, setFeeStatus] = useState<FeeStatus>('unpaid')
    const [joinedDate, setJoinedDate] = useState(new Date().toISOString().split('T')[0])

    useEffect(() => {
        fetchBranches().then(data => {
            if (data && data.length > 0 && !branchId) {
                setBranchId(data[0].id)
            }
        })
    }, [])

    const handleSubmit = async () => {
        if (!branchId || !name || !age || !parentName || !phone) {
            Alert.alert("Missing Fields", "Please fill in all required fields.")
            return
        }

        const data: StudentCreate = {
            branch_id: branchId,
            name,
            age: parseInt(age, 10),
            parent_name: parentName,
            phone,
            belt,
            fee_status: feeStatus,
            joined_date: joinedDate,
        }

        try {
            await createStudent(data)
            router.back()
        } catch (e: any) {
            Alert.alert("Error Creating", e.message || "Failed to create student")
        }
    }

    if (!branches?.length) {
        return (
            <View style={styles.container}>
                <ThemedText style={{ textAlign: 'center', padding: Spacing.xl }}>
                    You need to create a branch first before adding students.
                </ThemedText>
                <Button title="Go Back" variant="ghost" onPress={() => router.back()} />
            </View>
        )
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Branch *</ThemedText>
                    {/* Basic implementation: Render buttons for branch selection since Expo standard library lacks a native dropdown */}
                    <View style={styles.chipRow}>
                        {branches.map(b => (
                            <Button 
                                key={b.id} 
                                title={b.name} 
                                size="sm"
                                variant={branchId === b.id ? 'primary' : 'secondary'}
                                onPress={() => setBranchId(b.id)}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Student Name *</ThemedText>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={Colors.textMuted} />
                </View>

                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <ThemedText style={styles.label}>Age *</ThemedText>
                        <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholder="Age" placeholderTextColor={Colors.textMuted} />
                    </View>
                    <View style={[styles.formGroup, { flex: 2 }]}>
                        <ThemedText style={styles.label}>Joined Date *</ThemedText>
                        <TextInput style={styles.input} value={joinedDate} onChangeText={setJoinedDate} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textMuted} />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Parent Name *</ThemedText>
                    <TextInput style={styles.input} value={parentName} onChangeText={setParentName} placeholder="Parent's Name" placeholderTextColor={Colors.textMuted} />
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Phone Number *</ThemedText>
                    <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Phone" placeholderTextColor={Colors.textMuted} />
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Starting Belt</ThemedText>
                    <View style={styles.chipRow}>
                        {['white', 'yellow', 'orange', 'green'].map(b => (
                            <View key={b} style={[belt === b && styles.selectedChipWrap, { borderRadius: Radius.full }]}>
                                <Button 
                                    title={b} 
                                    size="sm"
                                    variant="ghost"
                                    onPress={() => setBelt(b as BeltColor)}
                                    style={{ backgroundColor: belt === b ? Colors.surfaceHigh : Colors.surface, borderWidth: 1, borderColor: belt === b ? Colors.primary : Colors.border, borderRadius: Radius.full }}
                                />
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Initial Fee Status</ThemedText>
                    <View style={styles.chipRow}>
                        <Button title="Paid" size="sm" variant={feeStatus === 'paid' ? 'primary' : 'secondary'} onPress={() => setFeeStatus('paid')} style={{ flex: 1 }} />
                        <Button title="Unpaid" size="sm" variant={feeStatus === 'unpaid' ? 'danger' : 'secondary'} onPress={() => setFeeStatus('unpaid')} style={{ flex: 1 }} />
                    </View>
                </View>

                <View style={styles.footer}>
                    <Button title="Enroll Student" onPress={handleSubmit} loading={creating} fullWidth />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: Spacing.lg,
        gap: Spacing.lg,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    formGroup: {
        gap: Spacing.xs,
    },
    label: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.md,
        padding: Spacing.md,
        color: Colors.textPrimary,
        fontSize: FontSize.md,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    selectedChipWrap: {
        borderWidth: 2,
        borderColor: Colors.primary,
        margin: -2,
    },
    footer: {
        marginTop: Spacing.md,
        marginBottom: Spacing.xxl,
    }
})
