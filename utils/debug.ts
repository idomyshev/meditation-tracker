import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAllData = async () => {
  console.log('🧹 Clearing all application data...');
  await AsyncStorage.clear();
  console.log('✅ All data cleared');
};

export const logStoredData = async () => {
  console.log('📱 Checking stored data...');
  const keys = await AsyncStorage.getAllKeys();
  const data: Record<string, any> = {};
  
  for (const key of keys) {
    const value = await AsyncStorage.getItem(key);
    data[key] = value;
  }
  
  console.log('📦 Stored data:', data); 
  return data;
}; 