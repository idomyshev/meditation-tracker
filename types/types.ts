import { User } from "./auth";

export interface Meditation {
  id: string;
  name: string;
  records: MeditationRecord[];
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string
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