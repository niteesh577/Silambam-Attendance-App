import { useAuth } from '@clerk/expo'
import { Redirect, Tabs } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'
import { Colors, Fonts } from '@/constants/theme'

export default function HomeTabsLayout() {
    const { isSignedIn, isLoaded } = useAuth()

    if (!isLoaded) {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center' }}>
                <ActivityIndicator color={Colors.primary} size="large" />
            </View>
        )
    }

    if (!isSignedIn) {
        return <Redirect href="/(auth)/sign-in" />
    }

    return (
        <Tabs
            screenOptions={{
                headerStyle: {
                    backgroundColor: Colors.surface,
                    borderBottomColor: Colors.border,
                    borderBottomWidth: 1,
                },
                headerTintColor: Colors.textPrimary,
                headerTitleStyle: {
                    fontFamily: Fonts.sans,
                    fontWeight: 'bold',
                },
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopColor: Colors.border,
                    borderTopWidth: 1,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textSecondary,
                tabBarLabelStyle: {
                    fontFamily: Fonts.sans,
                    fontSize: 12,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={20} color={color} />,
                }}
            />
            <Tabs.Screen
                name="students"
                options={{
                    title: 'Students',
                    headerShown: false, // Students flow will have its own stack header
                    tabBarIcon: ({ color }) => <FontAwesome5 name="user-friends" size={20} color={color} />,
                }}
            />
            <Tabs.Screen
                name="attendance"
                options={{
                    title: 'Attendance',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <FontAwesome5 name="clipboard-check" size={20} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <FontAwesome5 name="cog" size={20} color={color} />,
                }}
            />
        </Tabs>
    )
}