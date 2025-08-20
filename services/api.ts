import { Meditation } from '@/types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:4001';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };
    console.log('🔐 Auth headers:', headers);
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();

    console.log('🌐 Making request:', {
      url,
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.parse(options.body as string) : undefined,
    });

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', {
        status: response.status,
        statusText: response.statusText,
        url,
        error: errorText,
      });
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API Response:', data);
    return data;
  }

  async login(credentials: { email: string; password: string }) {
    console.log('🔑 Login attempt:', { email: credentials.email });
    return this.request<{ access_token: string; refresh_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async refreshToken(refreshToken: string) {
    console.log('🔄 Refreshing token');
    return this.request<{ access_token: string; refresh_token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async logout() {
    console.log('🚪 Logout attempt');
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    console.log('👤 Getting user profile');
    return this.request<{ userId: string; email: string; name?: string }>('/auth/profile');
  }

  async getMeditations() {
    console.log('🧘 Getting meditations from API');
    return this.request<Meditation[]>('/meditations');
  }

  async createMeditationRecord(data: { userId: string; meditationId: string; value: number }) {
    console.log('📝 Creating meditation record:', data);
    return this.request<{ id: string }>('/records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL); 