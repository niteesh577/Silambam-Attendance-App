import React, { useEffect, useState } from 'react'
import { StyleSheet, View, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useRouter, useLocalSearchParams, Stack } from 'expo-router'
import { Colors, Radius, Spacing, FontSize } from '@/constants/theme'
import { useBranches } from '@/lib/hooks/useBranches'
import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function EditBranch() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    const { branch, fetchBranch, loadingBranch, updateBranch, updating } = useBranches()
    
    const [name, setName] = useState('')
    const [location, setLocation] = useState('')
    const [city, setCity] = useState('')

    useEffect(() => {
        fetchBranch(id).then(data => {
            if (data) {
                setName(data.name)
                setLocation(data.location)
                setCity(data.city)
            }
        })
    }, [id])

    const handleSubmit = async () => {
        if (!name || !location || !city) {
            Alert.alert("Missing Fields", "Please fill in all fields.")
            return
        }
        try {
            await updateBranch(id, { name, location, city })
            Alert.alert("Success", "Branch updated.")
            router.back() 
        } catch (e: any) {
            Alert.alert("Error Updating", e.message || "Failed to update branch")
        }
    }

    if (loadingBranch && !branch) return <LoadingSpinner fullScreen />

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Stack.Screen options={{ title: 'Edit Branch' }} />
            <View style={styles.container}>
                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Branch Name *</ThemedText>
                    <TextInput 
                        style={styles.input} 
                        value={name} 
                        onChangeText={setName} 
                        placeholderTextColor={Colors.textMuted} 
                    />
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Area / Location *</ThemedText>
                    <TextInput 
                        style={styles.input} 
                        value={location} 
                        onChangeText={setLocation} 
                        placeholderTextColor={Colors.textMuted} 
                    />
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>City *</ThemedText>
                    <TextInput 
                        style={styles.input} 
                        value={city} 
                        onChangeText={setCity} 
                        placeholderTextColor={Colors.textMuted} 
                    />
                </View>

                <Button 
                    title="Save Changes" 
                    onPress={handleSubmit} 
                    loading={updating} 
                    style={styles.submitBtn} 
                />
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: Spacing.lg,
        gap: Spacing.lg,
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
    submitBtn: {
        marginTop: Spacing.md,
    }
})
