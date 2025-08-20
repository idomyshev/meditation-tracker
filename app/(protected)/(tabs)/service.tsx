import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { showConfirmAlert, showInfoAlert } from '@/components/UniversalAlert';
import { useAuth } from '@/contexts/AuthContext';
import { useMeditations } from '@/hooks/useMeditations';
import { syncService } from '@/services/syncService';
import { clearAllData, logStoredData } from '@/utils/debug';

export default function ServiceScreen() {
  const [isClearing, setIsClearing] = useState(false);
  const { logout, user } = useAuth();
  const { refreshMeditations } = useMeditations();

  const clearStorage = async () => {
    showConfirmAlert(
      'Очистка данных',
      'Вы уверены, что хотите очистить все данные приложения? Это действие нельзя отменить.',
      async () => {
        try {
          setIsClearing(true);

          // Очищаем конкретный ключ
          await AsyncStorage.removeItem('meditationHistory');

          // Для надежности также используем clear()
          await AsyncStorage.clear();

          // Проверяем, что данные действительно удалены
          const remainingData = await AsyncStorage.getItem('meditationHistory');
          if (remainingData) {
            throw new Error('Данные не были полностью очищены');
          }

          showInfoAlert('Успех', 'Все данные успешно очищены');
        } catch (error) {
          console.error('Ошибка при очистке данных:', error);
          showInfoAlert('Ошибка', 'Не удалось очистить данные. Пожалуйста, попробуйте еще раз.');
        } finally {
          setIsClearing(false);
        }
      }
    );
  };

  const handleLogout = async () => {
    showConfirmAlert(
      'Выход',
      'Вы уверены, что хотите выйти из системы?',
      async () => {
        try {
          await logout();
        } catch (error) {
          console.error('Ошибка при выходе:', error);
        }
      }
    );
  };

  const handleDebugClear = async () => {
    showConfirmAlert(
      'Отладка',
      'Очистить все данные приложения?',
      async () => {
        await clearAllData();
        showInfoAlert('Успех', 'Все данные очищены');
      }
    );
  };

  const handleDebugLog = async () => {
    const data = await logStoredData();
    showInfoAlert('Отладка', `Найдено ${Object.keys(data).length} записей в хранилище`);
  };

  const handleForceSync = async () => {
    if (!user?.id) {
      showInfoAlert('Ошибка', 'Пользователь не авторизован');
      return;
    }

    try {
      showInfoAlert('Синхронизация', 'Начинаем синхронизацию...');
      await syncService.syncAllPendingRecords(user.id);

      const status = await syncService.getSyncStatus();
      showInfoAlert(
        'Синхронизация завершена',
        `Всего записей: ${status.totalRecords}\nСинхронизировано: ${status.syncedRecords}\nОжидают: ${status.pendingRecords}`
      );
    } catch (error) {
      console.error('Sync error:', error);
      showInfoAlert('Ошибка', 'Не удалось выполнить синхронизацию');
    }
  };

  const handleRefreshMeditations = async () => {
    try {
      showInfoAlert('Обновление', 'Начинаем обновление медитаций...');
      refreshMeditations();
      showInfoAlert('Обновление завершено', 'Медитации успешно обновлены.');
    } catch (error) {
      console.error('Refresh error:', error);
      showInfoAlert('Ошибка', 'Не удалось обновить медитации.');
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="wrench.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Сервис</ThemedText>
      </ThemedView>

      <ThemedView style={styles.container}>
        {user && (
          <ThemedView style={styles.userInfo}>
            <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
          </ThemedView>
        )}

        <Pressable
          style={[styles.button, styles.syncButton]}
          onPress={handleForceSync}>
          <IconSymbol
            size={24}
            name="arrow.clockwise"
            color="#007AFF"
            style={styles.buttonIcon}
          />
          <ThemedText style={styles.buttonText}>Синхронизировать</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.button, styles.refreshButton]}
          onPress={handleRefreshMeditations}>
          <IconSymbol
            size={24}
            name="arrow.clockwise.circle"
            color="#34C759"
            style={styles.buttonIcon}
          />
          <ThemedText style={styles.buttonText}>Обновить медитации</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.button, isClearing && styles.buttonDisabled]}
          onPress={clearStorage}
          disabled={isClearing}>
          <IconSymbol
            size={24}
            name="trash.fill"
            color="#FF3B30"
            style={styles.buttonIcon}
          />
          <ThemedText style={styles.buttonText}>
            {isClearing ? 'Очистка...' : 'Очистить все данные'}
          </ThemedText>
        </Pressable>

        <Pressable
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}>
          <IconSymbol
            size={24}
            name="rectangle.portrait.and.arrow.right"
            color="#FF3B30"
            style={styles.buttonIcon}
          />
          <ThemedText style={styles.buttonText}>Выйти из системы</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.button, styles.debugButton]}
          onPress={handleDebugLog}>
          <ThemedText style={styles.buttonText}>Показать данные</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.button, styles.debugButton]}
          onPress={handleDebugClear}>
          <ThemedText style={styles.buttonText}>Очистить все (отладка)</ThemedText>
        </Pressable>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  container: {
    gap: 16,
    padding: 16,
  },
  userInfo: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: '#000',
  },
  syncButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderColor: '#007AFF',
  },
  refreshButton: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderColor: '#34C759',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderColor: '#000',
  },
}); 