import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Text, Switch, FlatList, Alert, ScrollView, Platform, TouchableOpacity } from 'react-native'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Colors, Radius, Spacing, FontSize } from '@/constants/theme'
import { useBranches } from '@/lib/hooks/useBranches'
import { useStudents } from '@/lib/hooks/useStudents'
import { useAttendance } from '@/lib/hooks/useAttendance'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { AttendanceRecord } from '@/lib/types'
import { ThemedText } from '@/components/themed-text'
import { BeltBadge } from '@/components/ui/Badge'
import { FontAwesome5 } from '@expo/vector-icons'

const BELT_ORDER: Record<string, number> = {
    'white': 1,
    'yellow': 2,
    'orange': 3,
    'green': 4,
    'blue': 5,
    'red': 6,
    'brown': 7,
}

export default function AttendanceMarking() {
    const { branches, fetchBranches, loadingBranches } = useBranches()
    const { students, fetchStudents, loadingStudents } = useStudents()
    const { bulkMark, submitting, fetchRecords } = useAttendance()
    
    const [selectedBranch, setSelectedBranch] = useState('')
    const [sessionDate, setSessionDate] = useState(new Date().toLocaleDateString('en-CA')) 
    const [showPicker, setShowPicker] = useState(false)
    
    // local state: studentId -> is_present
    const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({})

    useEffect(() => {
        fetchBranches().then(data => {
            if (data && data.length > 0) setSelectedBranch(data[0].id)
        })
    }, [])

    useEffect(() => {
        if (!selectedBranch) return

        async function load() {
            const [studentData, attData] = await Promise.all([
                fetchStudents({ branch_id: selectedBranch, limit: 100 }),
                fetchRecords({ branch_id: selectedBranch, date: sessionDate })
            ])

            const initialMap: Record<string, boolean> = {}
            
            // Initialize all as present by default when loaded
            studentData?.forEach(s => {
                initialMap[s.id] = true
            })
            
            // Override with whatever was previously saved for this date
            attData?.forEach((record: AttendanceRecord) => {
                initialMap[record.student_id] = record.status === 'present'
            })
            
            setAttendanceMap(initialMap)
        }
        
        load()
    }, [selectedBranch, sessionDate])

    const addDays = (days: number) => {
        const d = new Date(sessionDate)
        d.setDate(d.getDate() + days)
        
        // Prevent strictly future dates (don't exceed today)
        const today = new Date().toLocaleDateString('en-CA')
        const newDate = d.toLocaleDateString('en-CA')
        if (newDate > today) return;

        setSessionDate(newDate)
    }

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false)
        }
        if (selectedDate) {
            setSessionDate(selectedDate.toLocaleDateString('en-CA'))
        }
    }

    const isToday = sessionDate === new Date().toLocaleDateString('en-CA')

    const sortedStudents = React.useMemo(() => {
        if (!students) return []
        return [...students].sort((a, b) => {
            const rankA = BELT_ORDER[a.belt] || 99
            const rankB = BELT_ORDER[b.belt] || 99
            if (rankA !== rankB) return rankA - rankB
            return a.name.localeCompare(b.name)
        })
    }, [students])

    const handleToggle = (studentId: string, isPresent: boolean) => {
        setAttendanceMap(prev => ({ ...prev, [studentId]: isPresent }))
    }

    const handleSubmit = async () => {
        if (!selectedBranch) return

        const records: AttendanceRecord[] = Object.entries(attendanceMap).map(([student_id, is_present]) => ({
            student_id,
            status: is_present ? 'present' : 'absent'
        }))

        try {
            await bulkMark({
                branch_id: selectedBranch,
                session_date: sessionDate,
                records
            })
            Alert.alert("Success", "Attendance saved successfully!")
        } catch (e: any) {
            Alert.alert("Error", "Failed to save attendance.")
        }
    }

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.dateControlContainer}>
                <ThemedText style={styles.sectionLabel}>Date</ThemedText>
                <View style={styles.datePicker}>
                    <FontAwesome5 name="chevron-left" size={16} color={Colors.primary} onPress={() => addDays(-1)} style={styles.iconButton} />
                    
                    {Platform.OS === 'android' ? (
                        <TouchableOpacity onPress={() => setShowPicker(true)} style={{ paddingHorizontal: Spacing.sm }}>
                            <ThemedText style={styles.dateText}>{sessionDate}</ThemedText>
                        </TouchableOpacity>
                    ) : (
                        <DateTimePicker
                            style={{ maxWidth: 120 }}
                            value={new Date(sessionDate)}
                            mode="date"
                            display="compact"
                            onChange={onDateChange}
                            maximumDate={new Date()}
                        />
                    )}

                    {showPicker && Platform.OS === 'android' && (
                        <DateTimePicker
                            value={new Date(sessionDate)}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                            maximumDate={new Date()}
                        />
                    )}

                    <FontAwesome5 
                        name="chevron-right" 
                        size={16} 
                        color={isToday ? Colors.border : Colors.primary} 
                        onPress={() => !isToday && addDays(1)} 
                        style={styles.iconButton} 
                    />
                </View>
            </View>
            
            <View style={styles.formGroup}>
                <ThemedText style={styles.sectionLabel}>Branch</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                    {branches?.map(b => (
                        <Button 
                            key={b.id} 
                            title={b.name} 
                            size="sm"
                            variant={selectedBranch === b.id ? 'primary' : 'secondary'}
                            onPress={() => setSelectedBranch(b.id)}
                            style={{ marginRight: Spacing.sm }}
                        />
                    ))}
                </ScrollView>
            </View>

            <View style={styles.actionRow}>
                <ThemedText style={styles.countText}>
                    {students?.length || 0} Students 
                </ThemedText>
                <View style={styles.toggleAll}>
                    <Button 
                        title="All Absent" 
                        variant="ghost" 
                        size="sm" 
                        onPress={() => {
                            const map: Record<string, boolean> = {}
                            students?.forEach(s => map[s.id] = false)
                            setAttendanceMap(map)
                        }} 
                    />
                </View>
            </View>
        </View>
    )

    if (loadingBranches) return <LoadingSpinner fullScreen />

    return (
        <View style={styles.container}>
            <FlatList
                data={sortedStudents}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={renderHeader}
                renderItem={({ item: student }) => (
                    <Card style={[styles.studentRow, !attendanceMap[student.id] && styles.studentRowAbsent]}>
                        <View style={styles.studentInfo}>
                            <ThemedText style={styles.studentName} numberOfLines={1}>{student.name}</ThemedText>
                            <BeltBadge belt={student.belt} size="sm" />
                        </View>
                        <Switch
                            value={attendanceMap[student.id] ?? false}
                            onValueChange={(val) => handleToggle(student.id, val)}
                            trackColor={{ false: Colors.error, true: Colors.success }}
                            thumbColor={Colors.textPrimary}
                        />
                    </Card>
                )}
                ListEmptyComponent={
                    loadingStudents ? <LoadingSpinner /> : <ThemedText style={styles.empty}>No active students found in this branch.</ThemedText>
                }
            />

            <View style={styles.footer}>
                <Button 
                    title={`Save Attendance (${Object.values(attendanceMap).filter(Boolean).length} Present)`} 
                    onPress={handleSubmit} 
                    loading={submitting} 
                    fullWidth 
                    disabled={!students?.length}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    listContent: {
        padding: Spacing.lg,
        paddingBottom: 100, // accommodate footer
    },
    header: {
        marginBottom: Spacing.lg,
        gap: Spacing.md,
    },
    formGroup: {
        gap: Spacing.xs,
    },
    sectionLabel: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.textSecondary,
    },
    dateControlContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        marginBottom: Spacing.xs,
    },
    datePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    dateText: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        minWidth: 100,
        textAlign: 'center',
    },
    iconButton: {
        padding: Spacing.sm,
    },
    chipRow: {
        flexDirection: 'row',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingBottom: Spacing.sm,
    },
    countText: {
        color: Colors.textSecondary,
    },
    toggleAll: {
        flexDirection: 'row',
    },
    studentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
    },
    studentRowAbsent: {
        borderColor: Colors.error,
        opacity: 0.8,
    },
    studentInfo: {
        flex: 1,
        flexDirection: 'row',
        gap: Spacing.sm,
        alignItems: 'center',
    },
    studentName: {
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    empty: {
        textAlign: 'center',
        color: Colors.textMuted,
        marginTop: Spacing.xl,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.lg,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    }
})
