import React, { useEffect } from 'react'
import { StyleSheet, View, FlatList, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Spacing, FontSize } from '@/constants/theme'
import { useBranches } from '@/lib/hooks/useBranches'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ThemedText } from '@/components/themed-text'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'

export default function ManageBranches() {
    const router = useRouter()
    const { branches, loadingBranches, fetchBranches, deleteBranch } = useBranches()

    useEffect(() => {
        fetchBranches()
    }, [])

    const confirmDelete = (id: string, name: string) => {
        Alert.alert(
            "Delete Branch", 
            `Are you sure you want to delete ${name}? This will also delete ALL students in this branch.`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        await deleteBranch(id)
                        fetchBranches()
                    }
                }
            ]
        )
    }

    if (loadingBranches && !branches) return <LoadingSpinner fullScreen />

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="title">Your Branches</ThemedText>
                <Button title="New Branch" size="sm" onPress={() => router.push('/(home)/settings/branches/create')} />
            </View>

            <FlatList
                data={branches}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<EmptyState icon="🏢" title="No Branches" subtitle="Create your first branch to get started" />}
                renderItem={({ item }) => (
                    <Card style={styles.card}>
                        <View style={styles.info}>
                            <ThemedText style={styles.name}>{item.name}</ThemedText>
                            <ThemedText style={styles.location}>{item.location}, {item.city}</ThemedText>
                        </View>
                        <View style={styles.actions}>
                            <Button 
                                title="Edit" 
                                size="sm" 
                                variant="secondary" 
                                onPress={() => router.push(`/(home)/settings/branches/${item.id}/edit`)} 
                            />
                            <Button 
                                title="Del" 
                                size="sm" 
                                variant="danger" 
                                onPress={() => confirmDelete(item.id, item.name)} 
                            />
                        </View>
                    </Card>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    list: {
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    location: {
        color: Colors.textSecondary,
    },
    actions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    }
})
