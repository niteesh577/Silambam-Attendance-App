// import React from 'react'
// import { StyleSheet, TextInput, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
// import { ThemedText } from '@/components/themed-text'
// import { useSignIn } from '@clerk/expo'
// import { type Href, Link, useRouter } from 'expo-router'
// import { Button } from '@/components/ui/Button'
// import { Colors, FontSize, Radius, Spacing } from '@/constants/theme'

// export default function SignInPage() {
//     const { signIn, errors, fetchStatus } = useSignIn()
//     const router = useRouter()

//     const [emailAddress, setEmailAddress] = React.useState('')
//     const [password, setPassword] = React.useState('')
//     const [code, setCode] = React.useState('')

//     const handleSubmit = async () => {
//         const { error } = await signIn.password({ emailAddress, password })
//         if (error) {
//             console.error(error)
//             return
//         }

//         console.log(signIn.status)

//         if (signIn.status === 'complete') {
//             await signIn.finalize({
//                 navigate: ({ session, decorateUrl }) => {
//                     if (session?.currentTask) return
//                     const url = decorateUrl('/')
//                     if (url.startsWith('http')) window.location.href = url
//                     else router.push(url as Href)
//                 },
//             })
//         } else if (signIn.status === 'needs_client_trust') {
//             const emailCodeFactor = signIn.supportedSecondFactors.find((f) => f.strategy === 'email_code')
//             if (emailCodeFactor) await signIn.mfa.sendEmailCode()
//         }
//     }

//     const handleVerify = async () => {
//         await signIn.mfa.verifyEmailCode({ code })
//         if (signIn.status === 'complete') {
//             await signIn.finalize({
//                 navigate: ({ session, decorateUrl }) => {
//                     if (session?.currentTask) return
//                     const url = decorateUrl('/')
//                     if (url.startsWith('http')) window.location.href = url
//                     else router.push(url as Href)
//                 },
//             })
//         }
//     }

//     const isFetching = fetchStatus === 'fetching'

//     if (signIn.status === 'needs_client_trust') {
//         return (
//             <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//                 <ScrollView contentContainerStyle={styles.container}>
//                     <View style={styles.header}>
//                         <ThemedText type="title" style={styles.title}>Verify Account</ThemedText>
//                         <ThemedText style={styles.subtitle}>Enter the code sent to your email.</ThemedText>
//                     </View>

//                     <View style={styles.form}>
//                         <View style={styles.inputGroup}>
//                             <ThemedText style={styles.label}>Verification Code</ThemedText>
//                             <TextInput
//                                 style={styles.input}
//                                 value={code}
//                                 placeholder="123456"
//                                 placeholderTextColor={Colors.textMuted}
//                                 onChangeText={setCode}
//                                 keyboardType="numeric"
//                             />
//                             {errors.fields.code && (
//                                 <ThemedText style={styles.error}>{errors.fields.code.message}</ThemedText>
//                             )}
//                         </View>

//                         <Button
//                             title="Verify"
//                             onPress={handleVerify}
//                             loading={isFetching}
//                             disabled={!code}
//                             fullWidth
//                             style={styles.mainBtn}
//                         />

//                         <Button title="I need a new code" variant="ghost" onPress={() => signIn.mfa.sendEmailCode()} fullWidth style={styles.altBtn} />
//                         <Button title="Start over" variant="ghost" onPress={() => signIn.reset()} fullWidth />
//                     </View>
//                 </ScrollView>
//             </KeyboardAvoidingView>
//         )
//     }

//     return (
//         <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//             <ScrollView contentContainerStyle={styles.container}>
//                 <View style={styles.header}>
//                     <ThemedText type="title" style={styles.title}>Silambam Dojo</ThemedText>
//                     <ThemedText style={styles.subtitle}>Sign in to your coach account</ThemedText>
//                 </View>

//                 <View style={styles.form}>
//                     <View style={styles.inputGroup}>
//                         <ThemedText style={styles.label}>Email Address</ThemedText>
//                         <TextInput
//                             style={styles.input}
//                             autoCapitalize="none"
//                             value={emailAddress}
//                             placeholder="coach@example.com"
//                             placeholderTextColor={Colors.textMuted}
//                             onChangeText={setEmailAddress}
//                             keyboardType="email-address"
//                         />
//                         {errors.fields.identifier && (
//                             <ThemedText style={styles.error}>{errors.fields.identifier.message}</ThemedText>
//                         )}
//                     </View>

//                     <View style={styles.inputGroup}>
//                         <ThemedText style={styles.label}>Password</ThemedText>
//                         <TextInput
//                             style={styles.input}
//                             value={password}
//                             placeholder="••••••••"
//                             placeholderTextColor={Colors.textMuted}
//                             secureTextEntry={true}
//                             onChangeText={setPassword}
//                         />
//                         {errors.fields.password && (
//                             <ThemedText style={styles.error}>{errors.fields.password.message}</ThemedText>
//                         )}
//                     </View>

//                     <Button
//                         title="Sign In"
//                         onPress={handleSubmit}
//                         loading={isFetching}
//                         disabled={!emailAddress || !password}
//                         fullWidth
//                         style={styles.mainBtn}
//                     />

//                     <View style={styles.footerInfo}>
//                         <ThemedText style={styles.footerText}>Don't have an account? </ThemedText>
//                         <Link href="/(auth)/sign-up">
//                             <ThemedText type="link" style={{ color: Colors.primary }}>Sign up</ThemedText>
//                         </Link>
//                     </View>
//                 </View>
//             </ScrollView>
//         </KeyboardAvoidingView>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//         flexGrow: 1,
//         backgroundColor: Colors.background,
//         padding: Spacing.xl,
//         justifyContent: 'center',
//     },
//     header: {
//         alignItems: 'center',
//         marginBottom: Spacing.xxl,
//     },
//     title: {
//         fontSize: FontSize.xxxl,
//         fontWeight: 'bold',
//         color: Colors.textPrimary,
//         marginBottom: Spacing.xs,
//     },
//     subtitle: {
//         fontSize: FontSize.md,
//         color: Colors.textSecondary,
//     },
//     form: {
//         gap: Spacing.lg,
//     },
//     inputGroup: {
//         gap: Spacing.xs,
//     },
//     label: {
//         fontSize: FontSize.sm,
//         color: Colors.textSecondary,
//         fontWeight: '500',
//         marginLeft: 4,
//     },
//     input: {
//         backgroundColor: Colors.surface,
//         borderWidth: 1,
//         borderColor: Colors.borderLight,
//         borderRadius: Radius.md,
//         padding: Spacing.md,
//         color: Colors.textPrimary,
//         fontSize: FontSize.md,
//     },
//     error: {
//         color: Colors.error,
//         fontSize: FontSize.xs,
//         marginLeft: 4,
//         marginTop: 2,
//     },
//     mainBtn: {
//         marginTop: Spacing.sm,
//     },
//     altBtn: {
//         marginTop: -Spacing.sm,
//     },
//     footerInfo: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginTop: Spacing.lg,
//     },
//     footerText: {
//         color: Colors.textSecondary,
//     },
// })


import React from 'react'
import { StyleSheet, TextInput, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { useSignIn } from '@clerk/expo'
import { type Href, Link, useRouter } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme'

export default function SignInPage() {
    const { signIn, errors, fetchStatus } = useSignIn()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [code, setCode] = React.useState('')

    const isFetching = fetchStatus === 'fetching'

    const handleSubmit = async () => {
        const { error } = await signIn.password({ emailAddress, password })

        if (error) {
            console.error(error)
            return
        }

        if (signIn.status === 'complete') {
            await signIn.finalize({
                navigate: ({ decorateUrl }) => {
                    router.replace(decorateUrl('/') as Href)
                },
            })
        } else if (signIn.status === 'needs_second_factor') {
            const factor = signIn.supportedSecondFactors?.find(
                (f: any) => f.strategy === 'email_code'
            )

            if (factor) {
                await signIn.mfa.sendEmailCode()
            }
        }
    }

    const handleVerify = async () => {
        const { error } = await signIn.mfa.verifyEmailCode({ code })

        if (error) {
            console.error(error)
            return
        }

        if (signIn.status === 'complete') {
            await signIn.finalize({
                navigate: ({ decorateUrl }) => {
                    router.replace(decorateUrl('/') as Href)
                },
            })
        }
    }

    // MFA UI
    if (signIn.status === 'needs_second_factor') {
        return (
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.header}>
                        <ThemedText type="title" style={styles.title}>Verify Account</ThemedText>
                        <ThemedText style={styles.subtitle}>Enter the code sent to your email.</ThemedText>
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

                        <Button
                            title="Verify"
                            onPress={handleVerify}
                            loading={isFetching}
                            disabled={!code}
                            fullWidth
                            style={styles.mainBtn}
                        />

                        <Button
                            title="Resend Code"
                            variant="ghost"
                            onPress={() => signIn.mfa.sendEmailCode()}
                            fullWidth
                            style={styles.altBtn}
                        />

                        <Button
                            title="Start Over"
                            variant="ghost"
                            onPress={() => signIn.reset()}
                            fullWidth
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }

    // Normal UI
    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>Silambam Dojo</ThemedText>
                    <ThemedText style={styles.subtitle}>Sign in to your coach account</ThemedText>
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
                        {errors.fields.identifier && (
                            <ThemedText style={styles.error}>{errors.fields.identifier.message}</ThemedText>
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
                        title="Sign In"
                        onPress={handleSubmit}
                        loading={isFetching}
                        disabled={!emailAddress || !password}
                        fullWidth
                        style={styles.mainBtn}
                    />

                    <View style={styles.footerInfo}>
                        <ThemedText style={styles.footerText}>Don't have an account? </ThemedText>
                        <Link href="/(auth)/sign-up">
                            <ThemedText type="link" style={{ color: Colors.primary }}>Sign up</ThemedText>
                        </Link>
                    </View>
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