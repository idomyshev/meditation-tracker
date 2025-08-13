export interface Meditation {
  label: string;
  id: string;
}

export interface MeditationRecord {
  id: string;
  count: number;
  timestamp: number;
  deleted?: boolean;
  synced?: boolean; // Флаг синхронизации
  serverId?: string; // ID на сервере
}

export interface MeditationHistory {
  [key: string]: MeditationRecord[];
}