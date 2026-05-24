export type OrderStatus = 'novo' | 'aceito' | 'preparo' | 'pronto' | 'finalizado' | 'cancelado';
export type PromotionDay = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';

export interface Promotion {
  id: string;
  restaurantId: string;
  title: string;
  condition: string;
  days: PromotionDay[];
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: number;
  tableName?: string;
  tableCode?: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string;
  estimatedTime?: number;
  isUrgent?: boolean;
}
