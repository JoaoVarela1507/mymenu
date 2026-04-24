import { mockUsers } from '../lib/mockAuth';
import { mockOrders } from '../lib/mockData';
import { mockMenuItems } from '../lib/mockMenu';
import type { OrderStatus } from '../types';

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



interface MenuItemData {
  restaurantId: string;
  name: string;
  description?: string;
  categoryId: string;
  prices: {
    mymenu: number;
    ifood: number;
    ubereats: number;
    rappi: number;
  };
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

// Mock storage for created users
const createdUsers: any[] = [];

// Mock storage for menu items
let menuItemsStore = [...mockMenuItems];

// Simulate async delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Mock JWT token generator
const generateMockToken = (email: string): string => {
  return `mock_token_${email}_${Date.now()}`;
};

// Service de autenticação
export const authService = {
  registerConsumer: async (data: RegisterConsumerData): Promise<ApiResponse> => {
    await delay();
    
    // Check if email already exists
    const emailExists = [...mockUsers, ...createdUsers].some(u => u.email === data.email);
    if (emailExists) {
      return {
        success: false,
        message: 'Este email já está registrado.'
      };
    }

    // Create new user
    const newUser = {
      id: String(Date.now()),
      name: data.name,
      email: data.email,
      type: 'consumer'
    };

    createdUsers.push(newUser);
    const token = generateMockToken(data.email);

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(newUser));

    return {
      success: true,
      message: 'Cadastro realizado com sucesso!',
      user: newUser,
      token
    };
  },

  registerRestaurant: async (data: RegisterRestaurantData): Promise<ApiResponse> => {
    await delay();
    
    // Check if email already exists
    const emailExists = [...mockUsers, ...createdUsers].some(u => u.email === data.email);
    if (emailExists) {
      return {
        success: false,
        message: 'Este email já está registrado.'
      };
    }

    // Validate CNPJ (simple validation)
    if (data.cnpj.length < 14) {
      return {
        success: false,
        message: 'CNPJ inválido.'
      };
    }

    // Create new restaurant user
    const newUser = {
      id: String(Date.now()),
      name: data.name,
      email: data.email,
      type: 'admin',
      restaurantId: `rest_${Date.now()}`,
      restaurantName: data.restaurantName,
      cnpj: data.cnpj,
      phone: data.phone,
      address: data.address,
      category: data.category
    };

    createdUsers.push(newUser);
    const token = generateMockToken(data.email);

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(newUser));

    return {
      success: true,
      message: 'Cadastro do restaurante realizado com sucesso!',
      user: newUser,
      token
    };
  },

  login: async (email: string, password: string): Promise<ApiResponse> => {
    await delay();
    
    // Try to find user in mock users or created users
    const allUsers = [...mockUsers, ...createdUsers];
    const user = allUsers.find(u => u.email === email);

    if (!user) {
      return {
        success: false,
        message: 'Email ou senha inválida.'
      };
    }

    // Validate password (mock validation: all passwords are '123456')
    if (password !== '123456') {
      return {
        success: false,
        message: 'Email ou senha inválida.'
      };
    }

    const token = generateMockToken(email);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return {
      success: true,
      message: 'Login realizado com sucesso!',
      user,
      token
    };
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getMe: async (token: string): Promise<ApiResponse> => {
    await delay();
    
    const userStr = localStorage.getItem('user');
    if (!userStr || !token) {
      return {
        success: false,
        message: 'Não autenticado.'
      };
    }

    try {
      const user = JSON.parse(userStr);
      return {
        success: true,
        user
      };
    } catch {
      return {
        success: false,
        message: 'Erro ao obter dados do usuário.'
      };
    }
  },

  getToken: (): string | null => localStorage.getItem('token'),
  getUser: (): any => {
    const user = localStorage.getItem('user');
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

