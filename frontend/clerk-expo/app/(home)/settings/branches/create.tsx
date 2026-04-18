import React, { useState } from 'react'
import { StyleSheet, View, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Radius, Spacing, FontSize } from '@/constants/theme'
import { useBranches } from '@/lib/hooks/useBranches'
import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/Button'

export default function CreateBranch() {
    const router = useRouter()
    const { createBranch, creating } = useBranches()
    
    const [name, setName] = useState('')
    const [location, setLocation] = useState('')
    const [city, setCity] = useState('')

    const handleSubmit = async () => {
        if (!name || !location || !city) {
            Alert.alert("Missing Fields", "Please fill in all fields.")
            return
        }
        try {
            await createBranch({ name, location, city })
            router.back() // Go back to the list
        } catch (e: any) {
            Alert.alert("Error Creating", e.message || "Failed to create branch")
        }
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.container}>
                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Branch Name *</ThemedText>
                    <TextInput 
                        style={styles.input} 
                        value={name} 
                        onChangeText={setName} 
                        placeholder="e.g. Downtown Dojo" 
                        placeholderTextColor={Colors.textMuted} 
                        autoFocus
                    />
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Area / Location *</ThemedText>
                    <TextInput 
                        style={styles.input} 
                        value={location} 
                        onChangeText={setLocation} 
                        placeholder="e.g. Annanagar" 
                        placeholderTextColor={Colors.textMuted} 
                    />
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>City *</ThemedText>
                    <TextInput 
                        style={styles.input} 
                        value={city} 
                        onChangeText={setCity} 
                        placeholder="e.g. Chennai" 
                        placeholderTextColor={Colors.textMuted} 
                    />
                </View>

                <Button 
                    title="Create Branch" 
                    onPress={handleSubmit} 
                    loading={creating} 
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
