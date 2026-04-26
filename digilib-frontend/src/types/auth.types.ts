export interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: 'admin' | 'librarian' | 'reader';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  username: string;
  email?: string;
  password: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
