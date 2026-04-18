import { Stack } from 'expo-router'
import { Colors, Fonts } from '@/constants/theme'

export default function StudentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: { fontFamily: Fonts.sans, fontWeight: 'bold' },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Students' }} />
    </Stack>
  )
}
