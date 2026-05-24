import { mockOrders } from '../lib/mockData';
import { mockMenuItems } from '../lib/mockMenu';
import type { OrderStatus } from '../types';
import { apiRegister, apiRegisterRestaurant, getToken } from './authService';

// Types
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: any;
}

interface RegisterConsumerData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterRestaurantData {
  // Restaurante
  restaurantName: string;
  cnpj: string;
  restaurantPhone: string;
  category: string;
  address: string;
  city: string;
  state: string;
  cep: string;
  description: string;
  // Admin
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}



interface MenuItemData {
  restaurantId: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  image?: string;
  available?: boolean;
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

// Mock storage for menu items
let menuItemsStore = [...mockMenuItems];

// Simulate async delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Service de autenticação
export const authService = {
  registerConsumer: async (data: RegisterConsumerData): Promise<ApiResponse> => {
    const result = await apiRegister({ name: data.name, email: data.email, password: data.password, role: 'consumer' });
    return { success: result.success, message: result.message };
  },

  registerRestaurant: async (data: RegisterRestaurantData): Promise<ApiResponse> => {
    const cnpjDigits = data.cnpj.replace(/\D/g, '');
    if (cnpjDigits.length !== 14) return { success: false, message: 'CNPJ deve ter 14 dígitos.' };
    const result = await apiRegisterRestaurant({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      restaurantName: data.restaurantName,
      cnpj: cnpjDigits,
      restaurantPhone: data.restaurantPhone.replace(/\D/g, ''),
      category: data.category,
      address: data.address,
      city: data.city,
      state: data.state,
      cep: data.cep.replace(/\D/g, ''),
      description: data.description,
    });
    return { success: result.success, message: result.message };
  },

  logout: (): void => {
    localStorage.removeItem('mymenu_token');
    localStorage.removeItem('mymenu_user');
  },

  getToken: (): string | null => getToken(),
  getUser: (): any => {
    const user = localStorage.getItem('mymenu_user');
    return user ? JSON.parse(user) : null;
  }
};

// Service de menu
export const menuService = {
  getMenuItems: async (restaurantId: string): Promise<ApiResponse> => {
    await delay();
    
    const items = menuItemsStore.filter(item => item.restaurantId === restaurantId);
    return {
      success: true,
      data: items
    };
  },

  getMenuItem: async (itemId: string): Promise<ApiResponse> => {
    await delay();
    
    const item = menuItemsStore.find(item => item.id === itemId);
    if (!item) {
      return {
        success: false,
        message: 'Item de menu não encontrado.'
      };
    }

    return {
      success: true,
      data: item
    };
  },

  createMenuItem: async (data: MenuItemData, token: string): Promise<ApiResponse> => {
    await delay();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autenticado.'
      };
    }

    const newItem = {
      id: `menu_${Date.now()}`,
      ...data,
      available: data.available !== false
    };

    menuItemsStore.push(newItem);

    return {
      success: true,
      message: 'Item adicionado ao menu com sucesso!',
      data: newItem
    };
  },

  updateMenuItem: async (itemId: string, data: Partial<MenuItemData>, token: string): Promise<ApiResponse> => {
    await delay();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autenticado.'
      };
    }

    const itemIndex = menuItemsStore.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return {
        success: false,
        message: 'Item de menu não encontrado.'
      };
    }

    menuItemsStore[itemIndex] = { ...menuItemsStore[itemIndex], ...data };

    return {
      success: true,
      message: 'Item atualizado com sucesso!',
      data: menuItemsStore[itemIndex]
    };
  },

  deleteMenuItem: async (itemId: string, token: string): Promise<ApiResponse> => {
    await delay();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autenticado.'
      };
    }

    const itemIndex = menuItemsStore.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return {
        success: false,
        message: 'Item de menu não encontrado.'
      };
    }

    menuItemsStore.splice(itemIndex, 1);

    return {
      success: true,
      message: 'Item removido com sucesso!'
    };
  }
};

// Service de pedidos
export const orderService = {
  createOrder: async (data: OrderData, token: string): Promise<ApiResponse> => {
    await delay();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autenticado.'
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
      isUrgent: false
    };

    return {
      success: true,
      message: 'Pedido criado com sucesso!',
      data: newOrder
    };
  },

  getConsumerOrders: async (token: string): Promise<ApiResponse> => {
    await delay();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autenticado.'
      };
    }

    return {
      success: true,
      data: mockOrders
    };
  },

  getRestaurantOrders: async (token: string): Promise<ApiResponse> => {
    await delay();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autenticado.'
      };
    }

    return {
      success: true,
      data: mockOrders
    };
  },

  getOrder: async (orderId: string, token: string): Promise<ApiResponse> => {
    await delay();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autenticado.'
      };
    }

    const order = mockOrders.find(o => o.id === orderId);
    if (!order) {
      return {
        success: false,
        message: 'Pedido não encontrado.'
      };
    }

    return {
      success: true,
      data: order
    };
  },

  updateOrderStatus: async (orderId: string, status: string, token: string): Promise<ApiResponse> => {
    await delay();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autenticado.'
      };
    }

    const order = mockOrders.find(o => o.id === orderId);
    if (!order) {
      return {
        success: false,
        message: 'Pedido não encontrado.'
      };
    }

    order.status = status as OrderStatus;

    return {
      success: true,
      message: 'Status do pedido atualizado!',
      data: order
    };
  },

  cancelOrder: async (orderId: string, token: string): Promise<ApiResponse> => {
    await delay();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autenticado.'
      };
    }

    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      return {
        success: false,
        message: 'Pedido não encontrado.'
      };
    }

    mockOrders.splice(orderIndex, 1);

    return {
      success: true,
      message: 'Pedido cancelado com sucesso!'
    };
  }
};

