export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  active: boolean;
  createdAt: string;
  email: string;
  id: string;
  //meditations: describe later
  name: string;
  //records: describe later
  surname: string;
  updatedAt: string;
  username: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: false;
} 