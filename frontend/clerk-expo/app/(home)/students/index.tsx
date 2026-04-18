import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, TextInput, RefreshControl } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Colors, Radius, Spacing } from '@/constants/theme'
import { useStudents } from '@/lib/hooks/useStudents'
import { StudentListCard } from '@/components/ui/StudentListCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { FontAwesome5 } from '@expo/vector-icons'
import type { Student } from '@/lib/types'

export default function StudentsDirectory() {
    const { branch_id } = useLocalSearchParams<{ branch_id?: string }>()
    const router = useRouter()
    const { students, fetchStudents, loadingStudents } = useStudents()
    
    const [search, setSearch] = useState('')
    const [refreshing, setRefreshing] = useState(false)

    const loadStudents = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        await fetchStudents({ 
            branch_id: branch_id || undefined, 
            search: search || undefined,
            limit: 100 // Default page size for now
        })
        if (isRefresh) setRefreshing(false)
    }

    // Effect for initial load and search debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            loadStudents()
        }, 300)
        return () => clearTimeout(timer)
    }, [search, branch_id])

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.searchContainer}>
                <FontAwesome5 name="search" size={16} color={Colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name, parent, or phone..."
                    placeholderTextColor={Colors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 && (
                    <FontAwesome5 
                        name="times-circle" 
                        size={16} 
                        color={Colors.textSecondary} 
                        style={styles.clearIcon} 
                        onPress={() => setSearch('')}
                    />
                )}
            </View>
            <Button 
                title="Add Student" 
                size="sm"
                onPress={() => router.push('/(home)/students/create')} 
            />
        </View>
    )

    if (loadingStudents && !refreshing && !students) return <LoadingSpinner fullScreen />

    return (
        <View style={styles.container}>
            <FlatList
                data={students}
                keyExtractor={(item: Student) => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={renderHeader}
                renderItem={({ item }) => (
                    <StudentListCard 
                        student={item} 
                        onPress={() => router.push(`/(home)/students/${item.id}`)}
                    />
                )}
                ListEmptyComponent={
                    <EmptyState 
                        icon="🥋" 
                        title="No students found" 
                        subtitle={search ? "Try adjusting your search" : "Get started by adding a student"} 
                    />
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => loadStudents(true)} tintColor={Colors.primary} />
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    listContent: {
        padding: Spacing.md,
        paddingBottom: Spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.md,
        paddingHorizontal: Spacing.sm,
    },
    searchIcon: {
        marginRight: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: Colors.textPrimary,
    },
    clearIcon: {
        padding: Spacing.xs,
    },
})
