export type UserType = 'consumer' | 'admin' | 'staff';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  type: UserType;
  restaurantId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
