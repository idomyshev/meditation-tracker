import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface Meditation {
  label: string;
  id: string;
}

interface MeditationRecord {
  count: number;
  timestamp: number;
}

interface MeditationHistory {
  [key: string]: MeditationRecord[];
}

const meditations: Meditation[] = [
  { label: 'Простирания', id: 'prostrations' },
  { label: 'Алмазный Ум', id: 'diamond-mind' },
  { label: 'Мандала', id: 'mandala' },
  { label: 'Гуру Йога', id: 'guru-yoga' },
];

export default function HistoryScreen() {
  const [history, setHistory] = useState<MeditationHistory>({});
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
          <ThemedText type="subtitle">{meditation.label}</ThemedText>
          <ThemedView style={styles.historyContainer}>
            {history[meditation.id]?.length > 0 ? (
              history[meditation.id]
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((record, index) => (
                  <ThemedView key={index} style={styles.recordContainer}>
                    <ThemedText style={styles.dateText}>
                      {formatDate(record.timestamp)}
                    </ThemedText>
                    <ThemedText style={styles.countText}>
                      {record.count} повторений
                    </ThemedText>
                  </ThemedView>
                ))
            ) : (
              <ThemedText style={styles.emptyText}>Нет записей</ThemedText>
            )}
          </ThemedView>
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
  historyContainer: {
    gap: 8,
    marginTop: 8,
  },
  recordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateText: {
    fontSize: 14,
  },
  countText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.5)',
  },
}); 