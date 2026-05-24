import type { Order } from '../types';

export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: '#001',
    tableNumber: 4,
    status: 'novo',
    items: [
      { name: 'Pizza Margherita', quantity: 2, price: 35.90 },
      { name: 'Refrigerante 2L', quantity: 1, price: 12.00 },
    ],
    total: 83.80,
    createdAt: '18:30',
    estimatedTime: 25,
    isUrgent: false,
  },
  {
    id: '2',
    orderNumber: '#002',
    tableNumber: 7,
    status: 'aceito',
    items: [
      { name: 'Hambúrguer Artesanal', quantity: 1, price: 28.90 },
      { name: 'Batata Frita', quantity: 1, price: 15.00 },
    ],
    total: 43.90,
    createdAt: '18:25',
    estimatedTime: 15,
    isUrgent: true,
  },
  {
    id: '3',
    orderNumber: '#003',
    tableNumber: 2,
    status: 'preparo',
    items: [
      { name: 'Salada Caesar', quantity: 1, price: 22.90 },
      { name: 'Suco Natural', quantity: 2, price: 8.00 },
    ],
    total: 38.90,
    createdAt: '18:20',
    estimatedTime: 10,
    isUrgent: false,
  },
  {
    id: '4',
    orderNumber: '#004',
    tableNumber: 10,
    status: 'pronto',
    items: [
      { name: 'Lasanha Bolonhesa', quantity: 1, price: 32.90 },
    ],
    total: 32.90,
    createdAt: '18:15',
    isUrgent: false,
  },
  {
    id: '5',
    orderNumber: '#005',
    tableNumber: 1,
    status: 'novo',
    items: [
      { name: 'Poke Bowl', quantity: 2, price: 35.00 },
      { name: 'Água com Gás', quantity: 2, price: 5.00 },
    ],
    total: 80.00,
    createdAt: '18:32',
    estimatedTime: 20,
    isUrgent: true,
  },
];
