import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native'
import { useAuth } from '@clerk/expo'
import { useRouter } from 'expo-router'
import { Colors, FontSize, Spacing } from '@/constants/theme'
import { useApiClient } from '@/lib/ApiContext'
import { useFetch } from '@/lib/hooks/useFetch'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FontAwesome5 } from '@expo/vector-icons'
import { useBranches } from '@/lib/hooks/useBranches'
import { EmptyState } from '@/components/ui/EmptyState'

export default function Dashboard() {
    const api = useApiClient()
    const router = useRouter()
    
    // Auth & coach context
    const { data: me, execute: fetchMe } = useFetch(api.getMe)
    const { branches, loadingBranches, fetchBranches } = useBranches()
    const [refreshing, setRefreshing] = useState(false)

    const loadData = async () => {
        setRefreshing(true)
        await Promise.all([fetchMe(), fetchBranches()])
        setRefreshing(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    if (!me && !refreshing) return <LoadingSpinner fullScreen />

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={Colors.primary} />}
        >
            <View style={styles.header}>
                <Text style={styles.greeting}>Namaskaram,</Text>
                <Text style={styles.name}>{me?.name || 'Coach'}</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Your Branches</Text>
                    <Button 
                        title="New Branch" 
                        variant="ghost" 
                        size="sm" 
                        onPress={() => router.push('/(home)/settings')} 
                    />
                </View>

                {loadingBranches && !refreshing ? (
                    <LoadingSpinner />
                ) : branches?.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <EmptyState 
                            icon="🏢" 
                            title="No Branches Yet" 
                            subtitle="Create your first branch to start enrolling students." 
                        />
                    </Card>
                ) : (
                    <View style={styles.branchesList}>
                        {branches?.map(branch => (
                            <Card key={branch.id} style={styles.branchCard}>
                                <View style={styles.branchHeader}>
                                    <View>
                                        <Text style={styles.branchName}>{branch.name}</Text>
                                        <Text style={styles.branchLocation}>{branch.location}, {branch.city}</Text>
                                    </View>
                                    <Button 
                                        title="View" 
                                        size="sm"
                                        variant="outline"
                                        onPress={() => router.push(`/(home)/branches/${branch.id}`)}
                                    />
                                </View>
                            </Card>
                        ))}
                    </View>
                )}
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
    },
    header: {
        marginBottom: Spacing.xl,
    },
    greeting: {
        fontSize: FontSize.lg,
        color: Colors.textSecondary,
    },
    name: {
        fontSize: FontSize.xxxl,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginTop: Spacing.xs,
    },
    section: {
        gap: Spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    branchesList: {
        gap: Spacing.sm,
    },
    emptyCard: {
        paddingVertical: Spacing.xl,
    },
    branchCard: {
        marginBottom: Spacing.xs,
    },
    branchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    branchName: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    branchLocation: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
})