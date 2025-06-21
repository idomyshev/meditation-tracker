import { MeditationHistory } from "@/types/types";

  export const getTotalCount = (history: MeditationHistory, meditationId: string) => {
    return (history[meditationId] || []).filter(record => !record.deleted).reduce((sum, record) => sum + record.count, 0);
  };