export type OrderStatus = 'novo' | 'aceito' | 'preparo' | 'pronto' | 'finalizado' | 'cancelado';
export type OrderSource = 'ifood' | 'ubereats' | 'rappi';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  source: OrderSource;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  customerName: string;
  createdAt: string;
  estimatedTime?: number; // em minutos
  isUrgent?: boolean;
}
