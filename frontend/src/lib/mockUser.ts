import type { User } from '../types/user';

export const mockUser: User = {
  id: '1',
  name: 'João Silva',
  email: 'joao@restaurante.com',
  role: 'admin', // Mude para 'staff' para testar permissões
  restaurantId: 'rest-1',
};
