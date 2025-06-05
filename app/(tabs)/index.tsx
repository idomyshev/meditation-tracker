import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Meditation {
  label: string;
  id: string;
}

interface MeditationCount {
  [key: string]: number;
}

const meditations: Meditation[] = [
  { label: 'Простирания', id: 'prostrations' },
  { label: 'Алмазный Ум', id: 'diamond-mind' },
  { label: 'Мандала', id: 'mandala' },
  { label: 'Гуру Йога', id: 'guru-yoga' },
];

export default function HomeScreen() {
  const [counts, setCounts] = useState<MeditationCount>({});

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const savedCounts = await AsyncStorage.getItem('meditationCounts');
      if (savedCounts) {
        setCounts(JSON.parse(savedCounts));
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  };

  const incrementCount = async (meditationId: string, increment: number) => {
    try {
      const newCounts = {
        ...counts,
        [meditationId]: (counts[meditationId] || 0) + increment,
      };
      setCounts(newCounts);
      await AsyncStorage.setItem('meditationCounts', JSON.stringify(newCounts));
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
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

      {meditations.map((meditation) => (
        <ThemedView key={meditation.id} style={styles.meditationContainer}>
          <ThemedText type="subtitle">{meditation.label}</ThemedText>
          <ThemedText>Текущее количество: {counts[meditation.id] || 0}</ThemedText>
          <ThemedView style={styles.buttonContainer}>
            <Pressable
              style={styles.button}
              onPress={() => incrementCount(meditation.id, 27)}>
              <ThemedText>+27</ThemedText>
            </Pressable>
            <Pressable
              style={styles.button}
              onPress={() => incrementCount(meditation.id, 54)}>
              <ThemedText>+54</ThemedText>
            </Pressable>
            <Pressable
              style={styles.button}
              onPress={() => incrementCount(meditation.id, 108)}>
              <ThemedText>+108</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      ))}
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
});
