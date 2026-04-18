import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors, FontSize, Spacing } from '@/constants/theme'
import { useApiClient } from '@/lib/ApiContext'
import { useFetch } from '@/lib/hooks/useFetch'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BeltBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'

export default function BranchDetail() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const api = useApiClient()
    const router = useRouter()
    
    const { data: branch, execute: fetchBranch, loading: loadingBranch } = useFetch(api.getBranch)
    const { data: summary, execute: fetchSummary, loading: loadingSummary } = useFetch(api.getBranchSummary)
    
    const [refreshing, setRefreshing] = useState(false)
    // Track whether the first load has been attempted so we don't flash "Not Found"
    const [initialized, setInitialized] = useState(false)

    const loadData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        try {
            await Promise.all([fetchBranch(id), fetchSummary(id)])
        } finally {
            setRefreshing(false)
            setInitialized(true)
        }
    }

    useEffect(() => {
        if (!id || id === 'undefined') return
        loadData()
    }, [id])

    const loading = (loadingBranch || loadingSummary) && !refreshing

    // Show spinner until the first fetch completes
    if (!initialized || loading) return <LoadingSpinner fullScreen />
    // Only show "not found" after we've actually tried fetching
    if (!branch) return <EmptyState icon="🏢" title="Branch Not Found" subtitle="Could not load branch details" />

    // Safely parse belt distribution
    const belts = summary?.belt_distribution || {}
    const hasBelts = Object.keys(belts).length > 0

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={Colors.primary} />}
        >
            <View style={styles.header}>
                <Text style={styles.branchName}>{branch?.name}</Text>
                <Text style={styles.branchLocation}>{branch?.location}, {branch?.city}</Text>
            </View>

            <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                    <Text style={styles.statLabel}>Total Students</Text>
                    <Text style={styles.statValue}>{summary?.total_students ?? 0}</Text>
                </Card>
                <Card style={styles.statCard}>
                    <Text style={styles.statLabel}>Active</Text>
                    <Text style={styles.statValue}>{summary?.active_students ?? 0}</Text>
                </Card>
                <Card style={styles.statCard}>
                    <Text style={styles.statLabel}>Present Today</Text>
                    <Text style={[styles.statValue, { color: Colors.success }]}>
                        {summary?.attendance_today ?? 0}
                    </Text>
                </Card>
            </View>

            <Card style={styles.beltCard}>
                <Text style={styles.sectionTitle}>Belt Distribution</Text>
                {hasBelts ? (
                    <View style={styles.beltGrid}>
                        {Object.entries(belts).map(([belt, count]) => (
                            <View key={belt} style={styles.beltRow}>
                                <BeltBadge belt={belt} />
                                <Text style={styles.beltCount}>{count as React.ReactNode}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.emptyText}>No active students with belts recorded.</Text>
                )}
            </Card>

            <View style={styles.actions}>
                <Button 
                    title="Mark Attendance" 
                    onPress={() => router.push(`/(home)/attendance?branch_id=${id}`)}
                    fullWidth 
                />
                <Button 
                    title="View Students" 
                    variant="secondary"
                    onPress={() => router.push(`/(home)/students?branch_id=${id}`)}
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
        marginBottom: Spacing.sm,
    },
    branchName: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    branchLocation: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
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
        textAlign: 'center',
    },
    statValue: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    beltCard: {
        gap: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    beltGrid: {
        gap: Spacing.sm,
    },
    beltRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    beltCount: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontStyle: 'italic',
    },
    actions: {
        gap: Spacing.md,
        marginTop: Spacing.md,
    },
})
