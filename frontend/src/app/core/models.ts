export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface VaultItem {
  id: number;
  title: string;
  websiteUrl?: string;
  username: string;
  password?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaultPayload {
  title: string;
  websiteUrl: string;
  username: string;
  password: string;
  notes: string;
}
