export type UserRole = 'staff' | 'admin' | 'consumer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  restaurantId: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  allowedRoles: UserRole[];
  requiresAuth?: boolean;
  submenu?: { id: string; label: string; path: string }[];
}
