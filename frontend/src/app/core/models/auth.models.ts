// src/app/core/models/auth.models.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: string;
  expiresAt: string;
}

export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}
