import type { AuthUser } from '../types/auth';

export const mockUsers: AuthUser[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'admin@restaurante.com',
    type: 'admin',
    restaurantId: '1',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'consumidor@email.com',
    type: 'consumer',
  },
];

export const mockLogin = (email: string, password: string): AuthUser | null => {
  // Senha mockada: 123456 para todos
  if (password !== '123456') return null;
  
  return mockUsers.find(u => u.email === email) || null;
};
