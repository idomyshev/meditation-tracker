import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';


import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { showConfirmAlert, showInfoAlert } from '@/components/UniversalAlert';
import { getTotalCount } from '@/helpers/helpers';
import { useMeditations } from '@/hooks/useMeditations';
import { MeditationRecord } from '@/types/types';

interface MeditationHistory {
  [key: string]: MeditationRecord[];
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<MeditationHistory>({});
  const { meditations, isLoading: meditationsLoading, error: meditationsError, refreshMeditations } = useMeditations();
  console.log('История1:', history);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('meditationHistory');
      console.log('Загруженная история:', savedHistory);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  };

  const handleClickDeleteRecord = (meditationId: string, recordId: string) => {
    const record = history[meditationId].find(record => record.id === recordId);

    if (!record) {
      showInfoAlert('Ошибка', 'Запись не найдена');
      return;
    }

    const meditation = meditations.find(meditation => meditation.id === meditationId);
    if (!meditation) {
      showInfoAlert('Ошибка', 'Медитация не найдена');
      return;
    }

    showConfirmAlert(
      'Удалить запись',
      `Вы уверены, что хотите удалить ${record.count} повторений медитации ${meditation.name}?`,
      () => deleteRecord(meditationId, recordId)
    );
  };

  const deleteRecord = async (meditationId: string, recordId: string) => {
    try {
      const newHistory = {
        ...history,
        [meditationId]: history[meditationId].map(record =>
          record.id === recordId
            ? { ...record, deleted: true }
            : record
        )
      };
      setHistory(newHistory);
      await AsyncStorage.setItem('meditationHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Ошибка при удалении записи:', error);
      showInfoAlert('Ошибка', 'Не удалось удалить запись');
    }
  };

  const handleClickRestoreRecord = (meditationId: string, recordId: string) => {
    const record = history[meditationId].find(record => record.id === recordId);

    if (!record) {
      showInfoAlert('Ошибка', 'Запись не найдена');
      return;
    }

    const meditation = meditations.find(meditation => meditation.id === meditationId);
    if (!meditation) {
      showInfoAlert('Ошибка', 'Медитация не найдена');
      return;
    }

    showConfirmAlert(
      'Восстановить запись',
      `Вы уверены, что хотите восстановить ${record.count} повторений медитации ${meditation.name}?`,
      () => restoreRecord(meditationId, recordId)
    );
  };

  const restoreRecord = async (meditationId: string, recordId: string) => {
    try {
      const newHistory = {
        ...history,
        [meditationId]: history[meditationId].map(record =>
          record.id === recordId
            ? { ...record, deleted: false }
            : record
        )
      };
      setHistory(newHistory);
      await AsyncStorage.setItem('meditationHistory', JSON.stringify(newHistory));
      showInfoAlert('Успешно', 'Запись восстановлена');
    } catch (error) {
      console.error('Ошибка при восстановлении записи:', error);
      showInfoAlert('Ошибка', 'Не удалось восстановить запись');
    }
  };



  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="clock.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">История медитаций</ThemedText>
      </ThemedView>

      {meditations.map((meditation) => (
        <ThemedView key={meditation.id} style={styles.meditationContainer}>
          <ThemedView style={styles.meditationHeader}>
            <ThemedText type="subtitle">{meditation.name}</ThemedText>
            <ThemedText style={styles.totalCount}>
              Всего: {getTotalCount(history, meditation.id)}
            </ThemedText>
          </ThemedView>
          <ScrollView style={styles.historyScrollView}>
            <ThemedView style={styles.historyContainer}>
              {history[meditation.id]?.length > 0 ? (
                history[meditation.id]
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((record, index) => (
                    <ThemedView key={index} style={styles.recordContainer}>
                      <ThemedView style={styles.recordInfo}>
                        <ThemedText style={record.deleted ? styles.textBlured : styles.countText}>
                          {formatDate(record.timestamp)}
                        </ThemedText>
                        <ThemedText style={record.deleted ? styles.textBlured : styles.countText}>
                          {record.count} повторений
                        </ThemedText>
                      </ThemedView>
                      <Pressable
                        style={styles.deleteButton}
                        onPress={record.deleted ?
                          () => handleClickRestoreRecord(meditation.id, record.id)
                          :
                          () => handleClickDeleteRecord(meditation.id, record.id)
                        }
                      >
                        {record.deleted ?
                          <MaterialIcons name="restore-from-trash" size={22} color="#999" />
                          :
                          <MaterialIcons name="delete-outline" size={22} color="red" />}
                      </Pressable>
                    </ThemedView>
                  ))
              ) : (
                <ThemedText style={styles.emptyText}>Нет записей</ThemedText>
              )}
            </ThemedView>
          </ScrollView>
        </ThemedView>
      ))}
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
  meditationContainer: {
    gap: 8,
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyScrollView: {
    maxHeight: 200,
  },
  historyContainer: {
    gap: 8,
  },
  recordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  recordInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
  },
  countText: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  meditationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  textBlured: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#999',
  }
}); 