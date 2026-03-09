export type UserRole = 'staff' | 'admin';

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
  submenu?: { id: string; label: string; path: string }[];
}
