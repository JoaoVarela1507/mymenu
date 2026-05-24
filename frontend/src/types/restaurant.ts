export type RestaurantPlan = 'diamante' | 'ouro' | 'prata' | 'basico';

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  logo: string;
  plan: RestaurantPlan;
  rating: number;
  category: string;
  distance: number;
  isOpen: boolean;
  deliveryTime: string;
  minOrder: number;
  headerColor?: string;
  address?: string;
  city?: string;
  state?: string;
  description?: string;
  openTime?: string;
  closeTime?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  order: number;
  restaurantId?: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  ingredients?: string;
  image?: string;
  categoryId: string;
  price: number;
  exclusive?: 'delivery' | 'presencial';
  available: boolean;
  allergens?: ('gluten' | 'dairy' | 'eggs' | 'nuts' | 'soy' | 'fish' | 'shellfish')[];
  isOffer?: boolean;
  offerPrice?: number;
}
