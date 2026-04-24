export type RestaurantPlan = 'diamante' | 'ouro' | 'prata' | 'basico';
export type Platform = 'mymenu' | 'ifood' | 'ubereats' | 'rappi';

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
  headerColor?: string; // Cor personalizável do header (hex)
}

export interface MenuCategory {
  id: string;
  name: string;
  order: number;
  restaurantId?: string; // Se undefined, é global; se definido, é específico do restaurante
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  ingredients?: string;
  image?: string;
  categoryId: string;
  prices: {
    mymenu?: number;
    ifood?: number;
    ubereats?: number;
    rappi?: number;
  };
  exclusive?: 'delivery' | 'presencial';
  available: boolean;
  allergens?: ('gluten' | 'dairy' | 'eggs' | 'nuts' | 'soy' | 'fish' | 'shellfish')[];
  isOffer?: boolean;
  offerPrice?: number;
}

export interface PriceComparison {
  platform: Platform;
  price: number;
  isCheapest: boolean;
  available: boolean;
}
