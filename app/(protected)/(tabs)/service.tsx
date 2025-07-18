import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { clearAllData, logStoredData } from '@/utils/debug';

export default function ServiceScreen() {
  const [isClearing, setIsClearing] = useState(false);
  const { logout, user } = useAuth();

  const clearStorage = async () => {
    Alert.alert(
      'Очистка данных',
      'Вы уверены, что хотите очистить все данные приложения? Это действие нельзя отменить.',
      [
        {
          text: 'Отмена',
          style: 'cancel'
        },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: async () => {
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
              
              Alert.alert('Успех', 'Все данные успешно очищены');
            } catch (error) {
              console.error('Ошибка при очистке данных:', error);
              Alert.alert('Ошибка', 'Не удалось очистить данные. Пожалуйста, попробуйте еще раз.');
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти из системы?',
      [
        {
          text: 'Отмена',
          style: 'cancel'
        },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Ошибка при выходе:', error);
            }
          }
        }
      ]
    );
  };

  const handleDebugClear = async () => {
    Alert.alert(
      'Отладка',
      'Очистить все данные приложения?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Успех', 'Все данные очищены');
          }
        }
      ]
    );
  };

  const handleDebugLog = async () => {
    const data = await logStoredData();
    Alert.alert('Отладка', `Найдено ${Object.keys(data).length} записей в хранилище`);
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
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderColor: '#FF3B30',
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