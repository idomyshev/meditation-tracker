import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { apiClient } from '@/services/api';
import { AuthState, LoginCredentials } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const saveTokens = async (accessToken: string, refreshToken: string) => {
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
  };

  const clearTokens = async () => {
    console.log('🧹 Clearing all tokens...');
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('meditationHistory');
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('🚀 Starting login process');
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiClient.login(credentials);
      const { accessToken, refreshToken } = response.data;
      
      console.log('✅ Login successful, saving tokens');
      await saveTokens(accessToken, refreshToken);
      
      console.log('👤 Getting user profile');
      const profileResponse = await apiClient.getProfile();
      const user = profileResponse.data;
      
      console.log('✅ Auth state updated:', { user: user.email, isAuthenticated: true });
      setState({
        user,
        tokens: { accessToken, refreshToken },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('❌ Login failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Starting logout process');
      await apiClient.logout();
    } catch (error) {
      console.error('❌ Logout API error:', error);
    } finally {
      console.log('🧹 Clearing local tokens');
      await clearTokens();
      setState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const refreshAuth = async () => {
    try {
      console.log('🔄 Starting token refresh');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await apiClient.refreshToken(refreshToken);
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      console.log('✅ Token refresh successful');
      await saveTokens(accessToken, newRefreshToken);
      
      const profileResponse = await apiClient.getProfile();
      const user = profileResponse.data;
      
      setState({
        user,
        tokens: { accessToken, refreshToken: newRefreshToken },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      await clearTokens();
      setState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 Initializing authentication...');
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        console.log(' Stored tokens:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken 
        });
        
        if (accessToken && refreshToken) {
          console.log('🔄 Attempting to refresh authentication...');
          await refreshAuth();
        } else {
          console.log('❌ No valid tokens found, user not authenticated');
          setState(prev => ({ 
            ...prev, 
            isAuthenticated: false,  // ← явно устанавливаем false
            isLoading: false 
          }));
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        // Clear invalid tokens
        await clearTokens();
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}; 