import React, { useEffect, useState } from 'react'
import { StyleSheet, View, ScrollView, RefreshControl, Alert, TextInput } from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { Colors, Radius, Spacing, FontSize, FontWeight } from '@/constants/theme'
import { FontAwesome5 } from '@expo/vector-icons'
import { useStudents } from '@/lib/hooks/useStudents'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BeltBadge, FeeBadge, StatusBadge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ThemedText } from '@/components/themed-text'
import { EmptyState } from '@/components/ui/EmptyState'

export default function StudentDetail() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    
    const { 
        student, loadingStudent, fetchStudent, 
        summary, loadingSummary, fetchSummary,
        promoteStudent, promoting,
        updateFeeStatus, updatingFee,
        updateNotes, updatingNotes,
        deleteStudent, deleting
    } = useStudents()
    
    const [refreshing, setRefreshing] = useState(false)
    const [isEditingNotes, setIsEditingNotes] = useState(false)
    const [draftNotes, setDraftNotes] = useState('')
    const [initialized, setInitialized] = useState(false)

    const loadData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        try {
            await Promise.all([fetchStudent(id), fetchSummary(id)])
        } finally {
            setRefreshing(false)
            setInitialized(true)
        }
    }

    useEffect(() => {
        if (!id || id === 'undefined') return
        loadData()
    }, [id])

    useEffect(() => {
        if (student && !isEditingNotes) {
            setDraftNotes(student.notes || '')
        }
    }, [student, isEditingNotes])

    const handlePromote = () => {
        if (student?.belt === 'brown') {
            Alert.alert('Cannot Promote', 'Student is already at the highest belt (brown).')
            return
        }
        Alert.alert('Confirm Promotion', `Promote ${student?.name} to the next belt?`, [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Promote', 
                style: 'default',
                onPress: async () => {
                    await promoteStudent(id)
                    loadData()
                }
            }
        ])
    }

    const toggleFeeStatus = async () => {
        const newStatus = student?.fee_status === 'paid' ? 'unpaid' : 'paid'
        await updateFeeStatus(id, newStatus)
        fetchStudent(id) // Refresh local
    }

    const saveNotes = async () => {
        await updateNotes(id, draftNotes)
        setIsEditingNotes(false)
        fetchStudent(id)
    }

    const confirmDeactivate = () => {
        Alert.alert('Deactivate Student', 'Are you sure you want to soft-delete this student? Their historical attendance will remain.', [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Deactivate', 
                style: 'destructive',
                onPress: async () => {
                    await deleteStudent(id)
                    router.back()
                }
            }
        ])
    }

    if (!initialized || (loadingStudent || loadingSummary) && !refreshing) return <LoadingSpinner fullScreen />
    if (!student) return <EmptyState icon="👤" title="Student Not Found" subtitle="Could not load student details" />

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={Colors.primary} />}
        >
            <Stack.Screen options={{ 
                title: student?.name || 'Student Profile',
                headerRight: () => (
                    <FontAwesome5 
                        name="edit" 
                        size={20} 
                        color={Colors.primary} 
                        onPress={() => router.push(`/(home)/students/edit?id=${id}`)} 
                        style={{ marginRight: Spacing.sm }} 
                    />
                )
            }} />
            
            <View style={styles.header}>
                <View style={styles.nameRow}>
                    <ThemedText type="title">{student?.name}</ThemedText>
                    {!student?.is_active && <StatusBadge label="Inactive" color={Colors.border} />}
                </View>
                <ThemedText style={styles.subtitle}>Joined {student?.joined_date}</ThemedText>
            </View>

            {/* Attendance Highlight */}
            <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                    <ThemedText style={styles.statLabel}>Attendance</ThemedText>
                    <ThemedText style={styles.statValue}>{summary?.percentage ?? 0}%</ThemedText>
                </Card>
                <Card style={styles.statCard}>
                    <ThemedText style={styles.statLabel}>Present</ThemedText>
                    <ThemedText style={styles.statValue}>{summary?.present_count ?? 0}</ThemedText>
                </Card>
                <Card style={styles.statCard}>
                    <ThemedText style={styles.statLabel}>Absent</ThemedText>
                    <ThemedText style={[styles.statValue, { color: Colors.error }]}>{summary?.absent_count ?? 0}</ThemedText>
                </Card>
            </View>

            {/* Profile Info */}
            <Card style={styles.card}>
                <View style={styles.sectionHeader}>
                    <ThemedText type="subtitle">Profile Information</ThemedText>
                </View>
                <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Age</ThemedText>
                    <ThemedText style={styles.infoValue}>{student?.age}</ThemedText>
                </View>
                <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: Colors.border }]}>
                    <ThemedText style={styles.infoLabel}>Blood Group</ThemedText>
                    <ThemedText style={styles.infoValue}>{student?.blood_group || '-'}</ThemedText>
                </View>
                <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: Colors.border }]}>
                    <ThemedText style={styles.infoLabel}>Parent</ThemedText>
                    <ThemedText style={styles.infoValue}>{student?.parent_name}</ThemedText>
                </View>
                <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: Colors.border }]}>
                    <ThemedText style={styles.infoLabel}>Phone</ThemedText>
                    <ThemedText style={styles.infoValue}>{student?.phone}</ThemedText>
                </View>
                {student?.address ? (
                    <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: 'column', alignItems: 'flex-start', gap: 4 }]}>
                        <ThemedText style={styles.infoLabel}>Address</ThemedText>
                        <ThemedText style={styles.infoValue}>{student.address}</ThemedText>
                    </View>
                ) : null}
            </Card>

            {/* Biodata Info */}
            <Card style={styles.card}>
                <View style={styles.sectionHeader}>
                    <ThemedText type="subtitle">Biodata</ThemedText>
                </View>
                <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Date of Birth</ThemedText>
                    <ThemedText style={styles.infoValue}>{student?.dob || 'Not provided'}</ThemedText>
                </View>
                <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: Colors.border }]}>
                    <ThemedText style={styles.infoLabel}>EMIS No</ThemedText>
                    <ThemedText style={styles.infoValue}>{student?.emis_no || 'Not provided'}</ThemedText>
                </View>
                <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: Colors.border }]}>
                    <ThemedText style={styles.infoLabel}>Aadhaar No</ThemedText>
                    <ThemedText style={styles.infoValue}>{student?.aadhaar_no || 'Not provided'}</ThemedText>
                </View>
                {student?.ident_mark_1 ? (
                    <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: 'column', alignItems: 'flex-start', gap: 4 }]}>
                        <ThemedText style={styles.infoLabel}>Identification Mark 1</ThemedText>
                        <ThemedText style={styles.infoValue}>{student.ident_mark_1}</ThemedText>
                    </View>
                ) : null}
                {student?.ident_mark_2 ? (
                    <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: 'column', alignItems: 'flex-start', gap: 4 }]}>
                        <ThemedText style={styles.infoLabel}>Identification Mark 2</ThemedText>
                        <ThemedText style={styles.infoValue}>{student.ident_mark_2}</ThemedText>
                    </View>
                ) : null}
            </Card>

            {/* Operations */}
            <Card style={styles.card}>
                <View style={styles.sectionHeader}>
                    <ThemedText type="subtitle">Status & Operations</ThemedText>
                </View>
                
                <View style={styles.opRow}>
                    <View style={styles.opInfo}>
                        <ThemedText style={styles.infoLabel}>Current Belt</ThemedText>
                        <View style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                            {student?.belt && <BeltBadge belt={student.belt} />}
                        </View>
                    </View>
                    <Button 
                        title="Promote" 
                        size="sm" 
                        onPress={handlePromote} 
                        loading={promoting} 
                        disabled={student?.belt === 'brown' || !student?.is_active}
                    />
                </View>

                <View style={[styles.opRow, { borderTopWidth: 1, borderTopColor: Colors.border }]}>
                    <View style={styles.opInfo}>
                        <ThemedText style={styles.infoLabel}>Fee Status</ThemedText>
                        <View style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                            {student?.fee_status && <FeeBadge status={student.fee_status} />}
                        </View>
                    </View>
                    <Button 
                        title={student?.fee_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                        variant={student?.fee_status === 'paid' ? 'secondary' : 'primary'}
                        size="sm" 
                        onPress={toggleFeeStatus} 
                        loading={updatingFee} 
                    />
                </View>
            </Card>

            {/* Notes */}
            <Card style={styles.card}>
                <View style={[styles.sectionHeader, { marginBottom: Spacing.sm }]}>
                    <ThemedText type="subtitle">Coach Notes</ThemedText>
                    {!isEditingNotes ? (
                        <Button title="Edit" size="sm" variant="ghost" onPress={() => setIsEditingNotes(true)} />
                    ) : (
                        <Button title="Save" size="sm" variant="primary" onPress={saveNotes} loading={updatingNotes} />
                    )}
                </View>
                {isEditingNotes ? (
                    <TextInput
                        style={styles.notesInput}
                        multiline
                        value={draftNotes}
                        onChangeText={setDraftNotes}
                        placeholder="Add notes about performance, injuries, etc."
                        placeholderTextColor={Colors.textMuted}
                        autoFocus
                    />
                ) : (
                    <ThemedText style={student?.notes ? styles.infoValue : styles.infoLabel}>
                        {student?.notes || 'No notes added.'}
                    </ThemedText>
                )}
            </Card>

            {/* Danger Zone */}
            <View style={styles.footer}>
                <Button 
                    title="Deactivate Student" 
                    variant="danger" 
                    onPress={confirmDeactivate} 
                    loading={deleting} 
                    disabled={!student?.is_active}
                    fullWidth 
                />
            </View>
        </ScrollView>
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
    header: {
        marginBottom: Spacing.xs,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    subtitle: {
        color: Colors.textSecondary,
        marginTop: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: Spacing.lg,
    },
    statLabel: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    statValue: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    card: {
        gap: 0,
        padding: 0, // override default padding for flush rows
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
    },
    infoLabel: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
    },
    infoValue: {
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    opRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
    },
    opInfo: {
        flex: 1,
    },
    notesInput: {
        backgroundColor: Colors.background,
        color: Colors.textPrimary,
        padding: Spacing.md,
        minHeight: 100,
        textAlignVertical: 'top',
        fontSize: FontSize.md,
    },
    footer: {
        marginTop: Spacing.sm,
        marginBottom: Spacing.xxl,
    }
})
