import { mockOrders } from '../lib/mockData';
import type { OrderStatus } from '../types';
import type { AuthUser, UserType } from '../types/auth';
import type { MenuCategory, MenuItem } from '../types/restaurant';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_STORAGE_KEY = 'mymenu_access_token';
const USER_STORAGE_KEY = 'mymenu_user';


interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: AuthUser;
}

interface RegisterConsumerData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterRestaurantData {
  restaurantName: string;
  cnpj: string;
  phone: string;
  address: string;
  category: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  documentFile?: File;
}

type MenuAllergen = NonNullable<MenuItem['allergens']>[number];

export interface MenuItemPayload {
  name: string;
  description?: string;
  ingredients?: string;
  categoryId: string;
  prices: {
    mymenu: number;
    ifood: number;
    ubereats: number;
    rappi: number;
  };
  available: boolean;
  exclusive?: 'delivery' | 'presencial';
  allergens: MenuAllergen[];
  isOffer: boolean;
  offerPrice?: number;
  imageFile?: File | null;
}

interface OrderData {
  restaurantId: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
  deliveryAddress: string;
  deliveryPhone: string;
  notes?: string;
}

interface BackendLoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  name: string;
  role: UserType;
  restaurant_id?: string | null;
}

interface BackendMenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  order: number;
}

interface BackendMenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description?: string | null;
  ingredients?: string | null;
  image_url?: string | null;
  prices: {
    mymenu?: number;
    ifood?: number;
    ubereats?: number;
    rappi?: number;
  };
  available: boolean;
  exclusive?: 'delivery' | 'presencial' | null;
  allergens?: MenuAllergen[];
  is_offer?: boolean;
  offer_price?: number | null;
}


async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || 'Erro ao processar requisição.');
  }

  return data as T;
}


async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);
  return parseResponse<T>(response);
}


function buildAuthUser(data: BackendLoginResponse): AuthUser {
  return {
    id: data.user_id,
    name: data.name,
    email: data.email,
    type: data.role,
    restaurantId: data.restaurant_id || undefined,
  };
}


function persistSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}


function clearSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}


function buildMenuFormData(data: MenuItemPayload): FormData {
  const formData = new FormData();
  formData.append('category_id', data.categoryId);
  formData.append('name', data.name);
  formData.append('description', data.description || '');
  formData.append('ingredients', data.ingredients || '');
  formData.append('price_mymenu', String(data.prices.mymenu));
  formData.append('price_ifood', String(data.prices.ifood || 0));
  formData.append('price_ubereats', String(data.prices.ubereats || 0));
  formData.append('price_rappi', String(data.prices.rappi || 0));
  formData.append('available', String(data.available));
  formData.append('exclusive', data.exclusive || '');
  formData.append('allergens', JSON.stringify(data.allergens || []));
  formData.append('is_offer', String(data.isOffer));
  formData.append('offer_price', data.isOffer ? String(data.offerPrice || 0) : '');

  if (data.imageFile) {
    formData.append('image', data.imageFile);
  }

  return formData;
}


function mapCategory(category: BackendMenuCategory): MenuCategory {
  return {
    id: category.id,
    name: category.name,
    order: category.order,
    restaurantId: category.restaurant_id,
  };
}


function mapMenuItem(item: BackendMenuItem): MenuItem {
  return {
    id: item.id,
    restaurantId: item.restaurant_id,
    categoryId: item.category_id,
    name: item.name,
    description: item.description || '',
    ingredients: item.ingredients || '',
    imageUrl: item.image_url || undefined,
    prices: {
      mymenu: item.prices?.mymenu || 0,
      ifood: item.prices?.ifood || 0,
      ubereats: item.prices?.ubereats || 0,
      rappi: item.prices?.rappi || 0,
    },
    available: item.available,
    exclusive: item.exclusive || undefined,
    allergens: item.allergens || [],
    isOffer: item.is_offer || false,
    offerPrice: item.offer_price || undefined,
  };
}


async function authenticateAndStore(email: string, password: string): Promise<ApiResponse> {
  // Verificar se é uma conta de teste (modo demo)
  const testAccounts = [
    { email: 'admin@restaurante.com', password: '123456', name: 'Admin Restaurante', role: 'admin' as const },
    { email: 'consumidor@email.com', password: '123456', name: 'Consumidor Teste', role: 'consumer' as const },
  ];
  
  const testAccount = testAccounts.find(acc => acc.email === email && acc.password === password);
  if (testAccount) {
    // Login com conta de teste (mock)
    const user: AuthUser = {
      id: `test-${testAccount.role}`,
      name: testAccount.name,
      email: testAccount.email,
      type: testAccount.role,
      restaurantId: testAccount.role === 'admin' ? 'test-restaurant-1' : undefined,
    };
    
    persistSession('mock-token-' + testAccount.role, user);
    
    return {
      success: true,
      message: 'Login realizado com sucesso (modo demo)!',
      token: 'mock-token-' + testAccount.role,
      user,
    };
  }
  
  // Tentar login no backend real
  try {
    const data = await request<BackendLoginResponse>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const user = buildAuthUser(data);
    persistSession(data.access_token, user);

    return {
      success: true,
      message: 'Login realizado com sucesso!',
      token: data.access_token,
      user,
    };
  } catch (error) {
    // Se falhar conexão com backend, retorna erro
    throw error;
  }
}


export const authService = {
  registerConsumer: async (data: RegisterConsumerData): Promise<ApiResponse> => {
    await request('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'consumer',
      }),
    });

    return authenticateAndStore(data.email, data.password);
  },

  registerRestaurant: async (data: RegisterRestaurantData): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('restaurant_name', data.restaurantName);
    formData.append('cnpj', data.cnpj);
    formData.append('phone', data.phone);
    formData.append('address', data.address);
    formData.append('category', data.category);
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);

    if (data.documentFile) {
      formData.append('document_file', data.documentFile);
    }

    await request('/auth/register-restaurant', {
      method: 'POST',
      body: formData,
    });

    return authenticateAndStore(data.email, data.password);
  },

  login: async (email: string, password: string): Promise<ApiResponse> => {
    return authenticateAndStore(email, password);
  },

  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const data = await request<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    return {
      success: data.success,
      message: data.message,
    };
  },

  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse> => {
    const data = await request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, new_password: newPassword }),
    });

    return {
      success: data.success,
      message: data.message,
    };
  },

  logout: (): void => {
    clearSession();
  },

  getToken: (): string | null => localStorage.getItem(TOKEN_STORAGE_KEY),

  getUser: (): AuthUser | null => {
    const user = localStorage.getItem(USER_STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  },
};


export const menuService = {
  getCategories: async (token: string): Promise<ApiResponse<MenuCategory[]>> => {
    const data = await request<BackendMenuCategory[]>('/menu/categories', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: true,
      data: data.map(mapCategory),
    };
  },

  createCategory: async (
    payload: Pick<MenuCategory, 'name' | 'order'>,
    token: string,
  ): Promise<ApiResponse<MenuCategory>> => {
    const data = await request<BackendMenuCategory>('/menu/categories', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      message: 'Categoria criada com sucesso!',
      data: mapCategory(data),
    };
  },

  updateCategory: async (
    categoryId: string,
    payload: Pick<MenuCategory, 'name' | 'order'>,
    token: string,
  ): Promise<ApiResponse<MenuCategory>> => {
    const data = await request<BackendMenuCategory>(`/menu/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      message: 'Categoria atualizada com sucesso!',
      data: mapCategory(data),
    };
  },

  deleteCategory: async (categoryId: string, token: string): Promise<ApiResponse> => {
    const data = await request<{ success: boolean; message: string }>(`/menu/categories/${categoryId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: data.success,
      message: data.message,
    };
  },

  getMenuItems: async (token: string): Promise<ApiResponse<MenuItem[]>> => {
    const data = await request<BackendMenuItem[]>('/menu/items', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: true,
      data: data.map(mapMenuItem),
    };
  },

  getMenuItem: async (itemId: string, token: string): Promise<ApiResponse<MenuItem>> => {
    const data = await request<BackendMenuItem>(`/menu/items/${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: true,
      data: mapMenuItem(data),
    };
  },

  createMenuItem: async (payload: MenuItemPayload, token: string): Promise<ApiResponse<MenuItem>> => {
    const data = await request<BackendMenuItem>('/menu/items', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: buildMenuFormData(payload),
    });

    return {
      success: true,
      message: 'Item adicionado ao menu com sucesso!',
      data: mapMenuItem(data),
    };
  },

  updateMenuItem: async (
    itemId: string,
    payload: MenuItemPayload,
    token: string,
  ): Promise<ApiResponse<MenuItem>> => {
    const data = await request<BackendMenuItem>(`/menu/items/${itemId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: buildMenuFormData(payload),
    });

    return {
      success: true,
      message: 'Item atualizado com sucesso!',
      data: mapMenuItem(data),
    };
  },

  deleteMenuItem: async (itemId: string, token: string): Promise<ApiResponse> => {
    const data = await request<{ success: boolean; message: string }>(`/menu/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: data.success,
      message: data.message,
    };
  },
};


export const orderService = {
  createOrder: async (data: OrderData, token: string): Promise<ApiResponse> => {
    if (!token) {
      return {
        success: false,
        message: 'Não autenticado.',
      };
    }

    const newOrder = {
      id: `order_${Date.now()}`,
      orderNumber: `#${Date.now().toString().slice(-4)}`,
      ...data,
      status: 'novo',
      total: 0,
      customerName: authService.getUser()?.name || 'Cliente',
      createdAt: new Date().toLocaleTimeString('pt-BR'),
      estimatedTime: 30,
      isUrgent: false,
    };

    return {
      success: true,
      message: 'Pedido criado com sucesso!',
      data: newOrder,
    };
  },

  getConsumerOrders: async (token: string): Promise<ApiResponse> => {
    if (!token) {
      return {
        success: false,
        message: 'Não autenticado.',
      };
    }

    return {
      success: true,
      data: mockOrders,
    };
  },

  getRestaurantOrders: async (token: string): Promise<ApiResponse> => {
    if (!token) {
      return {
        success: false,
        message: 'Não autenticado.',
      };
    }

    return {
      success: true,
      data: mockOrders,
    };
  },

  getOrder: async (orderId: string, token: string): Promise<ApiResponse> => {
    if (!token) {
      return {
        success: false,
        message: 'Não autenticado.',
      };
    }

    const order = mockOrders.find(o => o.id === orderId);
    if (!order) {
      return {
        success: false,
        message: 'Pedido não encontrado.',
      };
    }

    return {
      success: true,
      data: order,
    };
  },

  updateOrderStatus: async (orderId: string, status: string, token: string): Promise<ApiResponse> => {
    if (!token) {
      return {
        success: false,
        message: 'Não autenticado.',
      };
    }

    const order = mockOrders.find(o => o.id === orderId);
    if (!order) {
      return {
        success: false,
        message: 'Pedido não encontrado.',
      };
    }

    order.status = status as OrderStatus;

    return {
      success: true,
      message: 'Status do pedido atualizado!',
      data: order,
    };
  },

  cancelOrder: async (orderId: string, token: string): Promise<ApiResponse> => {
    if (!token) {
      return {
        success: false,
        message: 'Não autenticado.',
      };
    }

    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      return {
        success: false,
        message: 'Pedido não encontrado.',
      };
    }

    mockOrders.splice(orderIndex, 1);

    return {
      success: true,
      message: 'Pedido cancelado com sucesso!',
    };
  },
};
