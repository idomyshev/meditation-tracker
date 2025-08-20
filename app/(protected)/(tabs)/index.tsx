import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { showInfoAlert } from '@/components/UniversalAlert';
import { useAuth } from '@/contexts/AuthContext';
import { getTotalCount } from '@/helpers/helpers';
import { useMeditations } from '@/hooks/useMeditations';
import { syncService } from '@/services/syncService';
import { MeditationHistory } from '@/types/types';

export default function HomeScreen() {
  const [history, setHistory] = useState<MeditationHistory>({});
  const { user } = useAuth();
  const { meditations, isLoading: meditationsLoading, error: meditationsError, refreshMeditations } = useMeditations();

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('meditationHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const addMeditationRecord = async (meditationId: string, count: number) => {
    console.log('🔍 Debug user state:', { user, userId: user?.id });

    if (!user?.id) {
      showInfoAlert('Ошибка', 'Пользователь не авторизован');
      return;
    }

    try {
      // Используем сервис синхронизации
      const newRecord = await syncService.addMeditationRecord(meditationId, count, user.id);

      // Обновляем локальное состояние
      const newHistory = {
        ...history,
        [meditationId]: [...(history[meditationId] || []), newRecord],
      };
      setHistory(newHistory);

    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
      showInfoAlert('Ошибка', 'Не удалось сохранить запись. Попробуйте еще раз.');
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Счетчик медитаций!</ThemedText>
      </ThemedView>

      {meditationsLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Загрузка медитаций...</ThemedText>
        </ThemedView>
      ) : meditationsError ? (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{meditationsError}</ThemedText>
          <Pressable style={styles.retryButton} onPress={refreshMeditations}>
            <ThemedText style={styles.retryButtonText}>Повторить</ThemedText>
          </Pressable>
        </ThemedView>
      ) : (
        meditations.map((meditation) => (
          <ThemedView key={meditation.id} style={styles.meditationContainer}>
            <ThemedText type="subtitle">{meditation.name}</ThemedText>
            <ThemedText>Всего выполнено: {getTotalCount(history, meditation.id)}</ThemedText>
            <ThemedView style={styles.buttonContainer}>
              <Pressable
                style={styles.button}
                onPress={() => addMeditationRecord(meditation.id, 27)}>
                <ThemedText>+27</ThemedText>
              </Pressable>
              <Pressable
                style={styles.button}
                onPress={() => addMeditationRecord(meditation.id, 54)}>
                <ThemedText>+54</ThemedText>
              </Pressable>
              <Pressable
                style={styles.button}
                onPress={() => addMeditationRecord(meditation.id, 108)}>
                <ThemedText>+108</ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        ))
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  meditationContainer: {
    gap: 8,
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#A1CEDC',
    alignItems: 'center',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#A1CEDC',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
  },
});
