import { MeditationHistory, MeditationRecord } from '@/types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api';

interface CreateRecordRequest {
    meditationId: string;
    value: number;
}

class SyncService {
    private syncInProgress: boolean = false;

    // Добавляем запись о медитации
    async addMeditationRecord(meditationId: string, count: number, userId: string): Promise<MeditationRecord> {
        try {
            // 1. Создаем локальную запись
            const record: MeditationRecord = {
                id: this.generateUUID(),
                count,
                timestamp: Date.now(),
                synced: false,
            };

            // 2. Сохраняем локально
            const history = await this.getLocalHistory();
            const newHistory = {
                ...history,
                [meditationId]: [...(history[meditationId] || []), record],
            };
            await this.saveLocalHistory(newHistory);

            // 3. Пытаемся синхронизировать с сервером
            await this.syncRecordToServer(record, meditationId, userId);

            return record;
        } catch (error) {
            console.error('Error adding meditation record:', error);
            throw error;
        }
    }

    // Синхронизируем запись с сервером
    private async syncRecordToServer(record: MeditationRecord, meditationId: string, userId: string) {
        try {
            // Создаем запрос для API
            const request: CreateRecordRequest = {
                meditationId,
                value: record.count, // API ожидает value
            };

            // Отправляем на сервер
            const response = await apiClient.createMeditationRecord(request);

            // Помечаем как синхронизированную
            record.synced = true;
            record.serverId = response.data.id;

            // Обновляем локальное хранилище
            await this.updateLocalRecord(meditationId, record);

            console.log('✅ Record synced successfully:', record.id);
        } catch (error) {
            console.error('❌ Failed to sync record:', error);
            // Запись остается помеченной как несинхронизированная
            // При следующем запуске приложения можно попытаться синхронизировать снова
        }
    }

    // Обновляем запись в локальном хранилище
    private async updateLocalRecord(meditationId: string, updatedRecord: MeditationRecord) {
        const history = await this.getLocalHistory();
        const meditationRecords = history[meditationId];

        if (meditationRecords) {
            const recordIndex = meditationRecords.findIndex(r => r.id === updatedRecord.id);
            if (recordIndex !== -1) {
                meditationRecords[recordIndex] = updatedRecord;
                await this.saveLocalHistory(history);
            }
        }
    }

    // Синхронизируем все несинхронизированные записи
    async syncAllPendingRecords(userId: string) {
        if (this.syncInProgress) return;

        this.syncInProgress = true;
        console.log('🔄 Starting sync of all pending records...');

        try {
            const history = await this.getLocalHistory();
            const pendingRecords: { record: MeditationRecord; meditationId: string }[] = [];

            // Собираем все несинхронизированные записи
            Object.entries(history).forEach(([meditationId, records]) => {
                records.forEach(record => {
                    if (!record.synced) {
                        pendingRecords.push({ record, meditationId });
                    }
                });
            });

            console.log(`Found ${pendingRecords.length} pending records to sync`);

            // Синхронизируем каждую запись
            for (const { record, meditationId } of pendingRecords) {
                await this.syncRecordToServer(record, meditationId, userId);
                // Небольшая задержка между запросами
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            console.log('✅ All pending records synced');
        } catch (error) {
            console.error('❌ Sync failed:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    // Получаем историю из локального хранилища
    private async getLocalHistory(): Promise<MeditationHistory> {
        try {
            const savedHistory = await AsyncStorage.getItem('meditationHistory');
            return savedHistory ? JSON.parse(savedHistory) : {};
        } catch (error) {
            console.error('Failed to get local history:', error);
            return {};
        }
    }

    // Сохраняем историю в локальное хранилище
    private async saveLocalHistory(history: MeditationHistory) {
        try {
            await AsyncStorage.setItem('meditationHistory', JSON.stringify(history));
        } catch (error) {
            console.error('Failed to save local history:', error);
        }
    }

    // Генерируем UUID
    private generateUUID(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Получаем статус синхронизации
    async getSyncStatus() {
        const history = await this.getLocalHistory();
        let pendingCount = 0;

        Object.values(history).forEach(records => {
            records.forEach(record => {
                if (!record.synced) pendingCount++;
            });
        });

        return {
            totalRecords: Object.values(history).flat().length,
            pendingRecords: pendingCount,
            syncedRecords: Object.values(history).flat().filter(r => r.synced).length,
        };
    }
}

export const syncService = new SyncService();
