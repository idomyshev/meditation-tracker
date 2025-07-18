import { useAuth } from '@/contexts/AuthContext';
import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

export default function ProtectedLayout() {
    const { isAuthenticated, isLoading } = useAuth();

    // Если не аутентифицирован и загрузка завершена - редиректим на логин
    if (!isAuthenticated && !isLoading) {
        return <Redirect href="/auth/login" />;
    }

    // Если идет загрузка - можно показать загрузочный экран
    if (isLoading) {
        return <View style={{ flex: 1 }} />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
        </Stack>
    );
} 