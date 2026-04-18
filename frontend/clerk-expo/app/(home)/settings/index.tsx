import React from 'react'
import { StyleSheet, View, ScrollView } from 'react-native'
import { useAuth } from '@clerk/expo'
import { useRouter } from 'expo-router'
import { Colors, Radius, Spacing, FontSize } from '@/constants/theme'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ThemedText } from '@/components/themed-text'
import { useApiClient } from '@/lib/ApiContext'
import { useFetch } from '@/lib/hooks/useFetch'
import { FontAwesome5 } from '@expo/vector-icons'

export default function SettingsPage() {
    const { signOut } = useAuth()
    const router = useRouter()
    const api = useApiClient()
    
    const { data: me } = useFetch(api.getMe) // should already be cached/resolved from dashboard loading
    
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            
            <View style={styles.profileSection}>
                <View style={styles.avatar}>
                    <FontAwesome5 name="user-circle" size={48} color={Colors.textSecondary} />
                </View>
                <ThemedText style={styles.name}>{me?.name || 'Coach'}</ThemedText>
                <ThemedText style={styles.email}>{me?.email}</ThemedText>
            </View>

            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Dojo Management</ThemedText>
                
                <Card 
                    style={styles.menuItem} 
                    onTouchEnd={() => router.push('/(home)/settings/branches')}
                >
                    <View style={styles.menuItemLeft}>
                        <FontAwesome5 name="building" size={20} color={Colors.primary} style={styles.menuIcon} />
                        <ThemedText style={styles.menuText}>Manage Branches</ThemedText>
                    </View>
                    <FontAwesome5 name="chevron-right" size={16} color={Colors.textSecondary} />
                </Card>
            </View>

            <View style={styles.footer}>
                <Button 
                    title="Sign Out" 
                    variant="danger" 
                    onPress={() => signOut()} 
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
        gap: Spacing.xl,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    avatar: {
        marginBottom: Spacing.md,
    },
    name: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
    },
    email: {
        color: Colors.textSecondary,
        marginTop: 4,
    },
    section: {
        gap: Spacing.sm,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.xs,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.lg,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    menuIcon: {
        width: 24,
        textAlign: 'center',
    },
    menuText: {
        fontSize: FontSize.lg,
        fontWeight: '500',
    },
    footer: {
        marginTop: Spacing.xxl,
    }
})
