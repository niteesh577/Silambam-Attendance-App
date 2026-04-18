import { Stack } from 'expo-router'
import { Colors, Fonts } from '@/constants/theme'

export default function AttendanceLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: { fontFamily: Fonts.sans, fontWeight: 'bold' },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Attendance' }} />
    </Stack>
  )
}
