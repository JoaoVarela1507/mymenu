import type { MenuItem } from '../types/user';

export const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: 'Restaurantes',
    icon: '🍽️',
    path: '/',
    allowedRoles: ['staff', 'admin', 'consumer'],
  },
  {
    id: 'nearby',
    label: 'Próximos',
    icon: '📍',
    path: '/proximos',
    allowedRoles: ['consumer', 'admin'],
  },
  {
    id: 'favorites',
    label: 'Favoritos',
    icon: '❤️',
    path: '/favoritos',
    allowedRoles: ['consumer', 'admin'],
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    path: '/admin/dashboard',
    allowedRoles: ['admin'],
  },
  {
    id: 'orders',
    label: 'Pedidos',
    icon: '📦',
    path: '/admin/orders',
    allowedRoles: ['staff', 'admin'],
  },
  {
    id: 'menu',
    label: 'Cardápio',
    icon: '📋',
    path: '/admin/menu',
    allowedRoles: ['admin'],
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: '📈',
    path: '/admin/reports',
    allowedRoles: ['admin'],
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: '⚙️',
    path: '/admin/settings',
    allowedRoles: ['admin'],
    submenu: [
      { id: 'settings-geral', label: 'Geral', path: '/admin/settings/geral' },
      { id: 'settings-equipe', label: 'Equipe', path: '/admin/settings/equipe' },
      { id: 'settings-integracoes', label: 'Integrações', path: '/admin/settings/integracoes' },
    ],
  },
];
