export interface Meditation {
  label: string;
  id: string;
}

export interface MeditationRecord {
  id: string;
  count: number;
  timestamp: number;
}

export interface MeditationHistory {
  [key: string]: MeditationRecord[];
}