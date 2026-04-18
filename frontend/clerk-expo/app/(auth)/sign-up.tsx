import React from 'react'
import { StyleSheet, TextInput, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { useAuth, useSignUp } from '@clerk/expo'
import { type Href, Link, useRouter } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme'

export default function SignUpPage() {
    const { signUp, errors, fetchStatus } = useSignUp()
    const { isSignedIn } = useAuth()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [code, setCode] = React.useState('')

    const handleSubmit = async () => {
        const { error } = await signUp.password({ emailAddress, password })
        if (error) {
            console.error(error)
            return
        }
        await signUp.verifications.sendEmailCode()
    }

    const handleVerify = async () => {
        await signUp.verifications.verifyEmailCode({ code })
        if (signUp.status === 'complete') {
            await signUp.finalize({
                navigate: ({ session, decorateUrl }) => {
                    if (session?.currentTask) return
                    const url = decorateUrl('/')
                    if (url.startsWith('http')) window.location.href = url
                    else router.push(url as Href)
                },
            })
        }
    }

    if (signUp.status === 'complete' || isSignedIn) return null
    const isFetching = fetchStatus === 'fetching'

    if (
        signUp.status === 'missing_requirements' &&
        signUp.unverifiedFields.includes('email_address') &&
        signUp.missingFields.length === 0
    ) {
        return (
            <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.header}>
                        <ThemedText type="title" style={styles.title}>Verify Account</ThemedText>
                        <ThemedText style={styles.subtitle}>Enter the verification code sent to your email</ThemedText>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>Verification Code</ThemedText>
                            <TextInput
                                style={styles.input}
                                value={code}
                                placeholder="123456"
                                placeholderTextColor={Colors.textMuted}
                                onChangeText={setCode}
                                keyboardType="numeric"
                            />
                            {errors.fields.code && (
                                <ThemedText style={styles.error}>{errors.fields.code.message}</ThemedText>
                            )}
                        </View>

                        <Button title="Verify" onPress={handleVerify} loading={isFetching} disabled={!code} fullWidth style={styles.mainBtn} />
                        <Button title="I need a new code" variant="ghost" onPress={() => signUp.verifications.sendEmailCode()} fullWidth style={styles.altBtn} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
                    <ThemedText style={styles.subtitle}>Join Silambam Dojo</ThemedText>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Email Address</ThemedText>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            value={emailAddress}
                            placeholder="coach@example.com"
                            placeholderTextColor={Colors.textMuted}
                            onChangeText={setEmailAddress}
                            keyboardType="email-address"
                        />
                        {errors.fields.emailAddress && (
                            <ThemedText style={styles.error}>{errors.fields.emailAddress.message}</ThemedText>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Password</ThemedText>
                        <TextInput
                            style={styles.input}
                            value={password}
                            placeholder="••••••••"
                            placeholderTextColor={Colors.textMuted}
                            secureTextEntry={true}
                            onChangeText={setPassword}
                        />
                        {errors.fields.password && (
                            <ThemedText style={styles.error}>{errors.fields.password.message}</ThemedText>
                        )}
                    </View>

                    <Button
                        title="Sign Up"
                        onPress={handleSubmit}
                        loading={isFetching}
                        disabled={!emailAddress || !password}
                        fullWidth
                        style={styles.mainBtn}
                    />

                    <View style={styles.footerInfo}>
                        <ThemedText style={styles.footerText}>Already have an account? </ThemedText>
                        <Link href="/(auth)/sign-in">
                            <ThemedText type="link" style={{ color: Colors.primary }}>Sign in</ThemedText>
                        </Link>
                    </View>

                    {/* Required for sign-up flows. Clerk's bot sign-up protection is enabled by default */}
                    <View nativeID="clerk-captcha" />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: Colors.background,
        padding: Spacing.xl,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    title: {
        fontSize: FontSize.xxxl,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
    },
    form: {
        gap: Spacing.lg,
    },
    inputGroup: {
        gap: Spacing.xs,
    },
    label: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontWeight: '500',
        marginLeft: 4,
    },
    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        borderRadius: Radius.md,
        padding: Spacing.md,
        color: Colors.textPrimary,
        fontSize: FontSize.md,
    },
    error: {
        color: Colors.error,
        fontSize: FontSize.xs,
        marginLeft: 4,
        marginTop: 2,
    },
    mainBtn: {
        marginTop: Spacing.sm,
    },
    altBtn: {
        marginTop: -Spacing.sm,
    },
    footerInfo: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
    footerText: {
        color: Colors.textSecondary,
    },
})