import type { MenuItem } from '../types/user';

export const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: 'Início',
    icon: '🏠',
    path: '/',
    allowedRoles: ['consumer'],
  },
  {
    id: 'favorites',
    label: 'Favoritos',
    icon: '❤️',
    path: '/favoritos',
    allowedRoles: ['consumer'],
  },
  {
    id: 'offers',
    label: 'Ofertas',
    icon: '🎁',
    path: '/ofertas',
    allowedRoles: ['consumer'],
  },
  {
    id: 'history',
    label: 'Histórico',
    icon: '⏱️',
    path: '/historico',
    allowedRoles: ['consumer'],
  },
  {
    id: 'ratings',
    label: 'Top Avaliações',
    icon: '⭐',
    path: '/top-avaliadas',
    allowedRoles: ['consumer'],
  },
  {
    id: 'profile',
    label: 'Meu Perfil',
    icon: '👤',
    path: '/perfil',
    allowedRoles: ['consumer'],
  },
  // SEPARADOR VISUAL
  {
    id: 'separator',
    label: '—',
    icon: '—',
    path: '#',
    allowedRoles: [],
  },
  // ADMIN MENU
  {
    id: 'dashboard',
    label: 'Visão Geral',
    icon: '📊',
    path: '/admin/dashboard',
    allowedRoles: ['admin'],
  },
  {
    id: 'menu',
    label: 'Cardápio',
    icon: '📋',
    path: '/admin/menu',
    allowedRoles: ['admin'],
  },
  {
    id: 'orders',
    label: 'Pedidos',
    icon: '📦',
    path: '/admin/orders',
    allowedRoles: ['admin', 'staff'],
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: '📈',
    path: '/admin/reports',
    allowedRoles: ['admin'],
  },
  {
    id: 'plans',
    label: 'Planos',
    icon: '💳',
    path: '/admin/plans',
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
  {
    id: 'admin-profile',
    label: 'Perfil',
    icon: '👤',
    path: '/admin/profile',
    allowedRoles: ['admin', 'staff'],
  },
];
