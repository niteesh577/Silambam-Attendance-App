import React, { useEffect, useState } from 'react'
import { StyleSheet, ScrollView, View, Alert, TextInput } from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme'
import { useStudents } from '@/lib/hooks/useStudents'
import { Button } from '@/components/ui/Button'
import { ThemedText } from '@/components/themed-text'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card } from '@/components/ui/Card'
import { useApiClient } from '@/lib/ApiContext'

export default function EditStudent() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    const api = useApiClient()
    
    // We can use useStudents just for the fetch logic or useApiClient directly.
    const { student, loadingStudent, fetchStudent } = useStudents()
    
    const [saving, setSaving] = useState(false)
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        parent_name: '',
        phone: '',
        age: '',
        dob: '',
        address: '',
        blood_group: '',
        emis_no: '',
        aadhaar_no: '',
        ident_mark_1: '',
        ident_mark_2: '',
    })

    useEffect(() => {
        if (id && id !== 'undefined') {
            fetchStudent(id)
        }
    }, [id])

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name || '',
                parent_name: student.parent_name || '',
                phone: student.phone || '',
                age: student.age ? String(student.age) : '',
                dob: student.dob || '',
                address: student.address || '',
                blood_group: student.blood_group || '',
                emis_no: student.emis_no || '',
                aadhaar_no: student.aadhaar_no || '',
                ident_mark_1: student.ident_mark_1 || '',
                ident_mark_2: student.ident_mark_2 || '',
            })
        }
    }, [student])

    const handleSave = async () => {
        if (!id) return
        
        try {
            setSaving(true)
            await api.updateStudent(id, {
                ...formData,
                age: formData.age ? parseInt(formData.age, 10) : undefined,
                // Treat empty string fields as undefined/null for backend
                dob: formData.dob || undefined,
                address: formData.address || undefined,
                blood_group: formData.blood_group || undefined,
                emis_no: formData.emis_no || undefined,
                aadhaar_no: formData.aadhaar_no || undefined,
                ident_mark_1: formData.ident_mark_1 || undefined,
                ident_mark_2: formData.ident_mark_2 || undefined,
            })
            Alert.alert("Success", "Student updated successfully")
            router.back()
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update student")
        } finally {
            setSaving(false)
        }
    }

    if (loadingStudent) return <LoadingSpinner fullScreen />

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ title: 'Edit Student' }} />
            
            <Card style={styles.card}>
                <ThemedText style={styles.sectionTitle}>Basic Info</ThemedText>
                
                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Full Name</ThemedText>
                    <TextInput 
                        style={styles.input} 
                        value={formData.name} 
                        onChangeText={(t) => setFormData(p => ({...p, name: t}))} 
                        placeholder="John Doe"
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <ThemedText style={styles.label}>Age</ThemedText>
                        <TextInput 
                            style={styles.input} 
                            value={formData.age} 
                            keyboardType="number-pad"
                            onChangeText={(t) => setFormData(p => ({...p, age: t}))} 
                            placeholder="15"
                        />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <ThemedText style={styles.label}>Blood Group</ThemedText>
                        <TextInput 
                            style={styles.input} 
                            value={formData.blood_group} 
                            onChangeText={(t) => setFormData(p => ({...p, blood_group: t}))} 
                            placeholder="O+"
                        />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Parent/Guardian Name</ThemedText>
                    <TextInput 
                        style={styles.input} 
                        value={formData.parent_name} 
                        onChangeText={(t) => setFormData(p => ({...p, parent_name: t}))} 
                    />
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Phone Number</ThemedText>
                    <TextInput 
                        style={styles.input} 
                        value={formData.phone} 
                        keyboardType="phone-pad"
                        onChangeText={(t) => setFormData(p => ({...p, phone: t}))} 
                    />
                </View>
            </Card>

            <Card style={styles.card}>
                <ThemedText style={styles.sectionTitle}>Biodata (Optional)</ThemedText>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Date of Birth</ThemedText>
                    <TextInput 
                        style={styles.input} 
                        value={formData.dob} 
                        onChangeText={(t) => setFormData(p => ({...p, dob: t}))} 
                        placeholder="YYYY-MM-DD"
                    />
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Address</ThemedText>
                    <TextInput 
                        style={[styles.input, { height: 80 }]} 
                        value={formData.address} 
                        onChangeText={(t) => setFormData(p => ({...p, address: t}))} 
                        multiline
                        placeholder="Full residential address"
                    />
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>EMIS Number</ThemedText>
                    <TextInput 
                        style={styles.input} 
                        value={formData.emis_no} 
                        onChangeText={(t) => setFormData(p => ({...p, emis_no: t}))} 
                        placeholder="Educational Management Info System No."
                    />
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Aadhaar Number</ThemedText>
                    <TextInput 
                        style={styles.input} 
                        value={formData.aadhaar_no} 
                        keyboardType="number-pad"
                        onChangeText={(t) => setFormData(p => ({...p, aadhaar_no: t}))} 
                        placeholder="12-digit Aadhaar"
                    />
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Identification Mark 1</ThemedText>
                    <TextInput 
                        style={styles.input} 
                        value={formData.ident_mark_1} 
                        onChangeText={(t) => setFormData(p => ({...p, ident_mark_1: t}))} 
                        placeholder="e.g. A mole on the right cheek"
                    />
                </View>

                <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Identification Mark 2</ThemedText>
                    <TextInput 
                        style={styles.input} 
                        value={formData.ident_mark_2} 
                        onChangeText={(t) => setFormData(p => ({...p, ident_mark_2: t}))} 
                    />
                </View>
            </Card>

            <Button 
                title="Save Changes" 
                onPress={handleSave} 
                loading={saving} 
                fullWidth 
                style={{ marginTop: Spacing.md }}
            />
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
        paddingBottom: 40,
    },
    card: {
        gap: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
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
        fontWeight: '500',
        color: Colors.textSecondary,
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
})
