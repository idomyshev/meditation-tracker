import { apiClient } from '@/services/api';
import { useEffect, useState } from 'react';

export interface ApiMeditation {
    id: string;
    name: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Meditation {
    name: string;
    id: string;
}

export const useMeditations = () => {
    const [meditations, setMeditations] = useState<Meditation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMeditations = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const apiMeditations = await apiClient.getMeditations();

            console.log('apiMeditations', apiMeditations)

            setMeditations(apiMeditations);
        } catch (err) {
            console.error('❌ Failed to load meditations:', err);
            setError('Не удалось загрузить медитации');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMeditations();
    }, []);

    const refreshMeditations = () => {
        fetchMeditations();
    };

    return {
        meditations,
        isLoading,
        error,
        refreshMeditations,
    };
};
