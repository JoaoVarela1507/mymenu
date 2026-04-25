export type SubscriptionPlan = 'prata' | 'ouro' | 'diamante';
export type PaymentMethod = 'pix' | 'boleto';

export interface PlanRule {
  id: SubscriptionPlan;
  label: string;
  icon: string;
  monthlyPrice: number;
  maxRestaurants: number;
  maxProducts: number;
  advancedReports: boolean;
  coupons: boolean;
  multiUsers: boolean;
  dashboardComplete: boolean;
  featuredBoost: 'medio' | 'alto' | 'maximo';
  support: 'comum' | 'prioritario' | 'vip';
}

export const PLAN_RULES: Record<SubscriptionPlan, PlanRule> = {
  prata: {
    id: 'prata',
    label: 'Prata',
    icon: '🥈',
    monthlyPrice: 29.9,
    maxRestaurants: 1,
    maxProducts: 50,
    advancedReports: false,
    coupons: false,
    multiUsers: false,
    dashboardComplete: false,
    featuredBoost: 'medio',
    support: 'comum',
  },
  ouro: {
    id: 'ouro',
    label: 'Ouro',
    icon: '🥇',
    monthlyPrice: 49.9,
    maxRestaurants: 2,
    maxProducts: 200,
    advancedReports: true,
    coupons: true,
    multiUsers: false,
    dashboardComplete: true,
    featuredBoost: 'alto',
    support: 'prioritario',
  },
  diamante: {
    id: 'diamante',
    label: 'Diamante',
    icon: '💎',
    monthlyPrice: 79.9,
    maxRestaurants: Number.POSITIVE_INFINITY,
    maxProducts: Number.POSITIVE_INFINITY,
    advancedReports: true,
    coupons: true,
    multiUsers: true,
    dashboardComplete: true,
    featuredBoost: 'maximo',
    support: 'vip',
  },
};

const PLAN_STORAGE_KEY = 'mymenu_subscription_plan';
const PAYMENT_STORAGE_KEY = 'mymenu_subscription_payment_method';

export function getCurrentPlan(): SubscriptionPlan {
  const stored = localStorage.getItem(PLAN_STORAGE_KEY) as SubscriptionPlan | null;
  if (!stored) return 'prata';
  return stored in PLAN_RULES ? stored : 'prata';
}

export function setCurrentPlan(plan: SubscriptionPlan) {
  localStorage.setItem(PLAN_STORAGE_KEY, plan);
}

export function getCurrentPaymentMethod(): PaymentMethod {
  const stored = localStorage.getItem(PAYMENT_STORAGE_KEY) as PaymentMethod | null;
  if (!stored) return 'pix';
  return stored === 'pix' || stored === 'boleto' ? stored : 'pix';
}

export function setCurrentPaymentMethod(method: PaymentMethod) {
  localStorage.setItem(PAYMENT_STORAGE_KEY, method);
}

export function getPlanRule(plan?: SubscriptionPlan): PlanRule {
  const resolvedPlan = plan || getCurrentPlan();
  return PLAN_RULES[resolvedPlan];
}

export function canAddRestaurant(currentCount: number, plan?: SubscriptionPlan): boolean {
  const rule = getPlanRule(plan);
  return currentCount < rule.maxRestaurants;
}

export function canAddProduct(currentCount: number, plan?: SubscriptionPlan): boolean {
  const rule = getPlanRule(plan);
  return currentCount < rule.maxProducts;
}

export function planLimitLabel(limit: number): string {
  if (!Number.isFinite(limit)) return 'Ilimitado';
  return `${limit}`;
}
