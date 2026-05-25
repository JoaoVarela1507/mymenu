import {
  collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  query, where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Restaurant, MenuItem, MenuCategory } from '../types/restaurant';
import type { Promotion } from '../types';

export interface RestaurantTable {
  id: string;
  restaurantId: string;
  code: string;
  name: string;
  active: boolean;
}

export interface TableOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface TableOrder {
  id: string;
  restaurantId: string;
  restaurantName: string;
  tableId: string;
  tableCode: string;
  tableName: string;
  userId: string;
  items: TableOrderItem[];
  total: number;
  status: 'pending' | 'aceito' | 'preparing' | 'delivered' | 'finalizado' | 'cancelled';
  createdAt: string;
}

export interface Reservation {
  id: string;
  restaurantId: string;
  restaurantName: string;
  userId: string;
  userName: string;
  day: string;
  time: string;
  people: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  denyReason?: string;
}

// ── Utilitário ────────────────────────────────────────────
function toSlug(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ── Restaurantes ──────────────────────────────────────────

export async function getRestaurants(): Promise<Restaurant[]> {
  const snap = await getDocs(collection(db, 'userRestaurant'));
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      slug: toSlug(data.restaurantName ?? d.id),
      name: data.restaurantName ?? '',
      logo: data.logo ?? '🍽️',
      plan: data.plan ?? 'basico',
      rating: data.rating ?? 0,
      category: data.category ?? '',
      distance: data.distance ?? 0,
      isOpen: data.isOpen ?? true,
      deliveryTime: data.deliveryTime ?? '30-45 min',
      minOrder: data.minOrder ?? 0,
      headerColor: data.headerColor ?? '#C92924',
      address: data.address ?? '',
      city: data.city ?? '',
      state: data.state ?? '',
      description: data.description ?? '',
      openTime: data.openTime ?? '',
      closeTime: data.closeTime ?? '',
    } as Restaurant;
  });
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const all = await getRestaurants();
  return all.find(r => r.slug === slug) ?? null;
}

export async function getRestaurantByOwnerId(uid: string): Promise<any | null> {
  const snap = await getDoc(doc(db, 'userRestaurant', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    slug: toSlug(data.restaurantName ?? snap.id),
    ...data,
  };
}

export async function updateRestaurantAppearance(uid: string, data: {
  logo?: string;
  headerColor?: string;
  isOpen?: boolean;
  openTime?: string;
  closeTime?: string;
  deliveryTime?: string;
  minOrder?: number;
  description?: string;
}): Promise<void> {
  await updateDoc(doc(db, 'userRestaurant', uid), data);
}

// ── Avaliações ────────────────────────────────────────────

export async function getRatingData(restaurantId: string): Promise<{ average: number; count: number }> {
  const snap = await getDoc(doc(db, 'ratings', restaurantId));
  if (!snap.exists()) return { average: 0, count: 0 };
  const data = snap.data();
  return { average: data.average ?? 0, count: data.count ?? 0 };
}

export async function getUserRating(restaurantId: string, userId: string): Promise<number | null> {
  const snap = await getDoc(doc(db, 'ratings', restaurantId));
  if (!snap.exists()) return null;
  const val = snap.data()[userId];
  return typeof val === 'number' ? val : null;
}

export async function submitRating(restaurantId: string, userId: string, rating: number): Promise<{ average: number; count: number }> {
  const ref = doc(db, 'ratings', restaurantId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const oldRating: number | undefined = data[userId];
  const oldCount: number = data.count ?? 0;
  const oldTotal: number = data.total ?? 0;

  const newCount = oldRating !== undefined ? oldCount : oldCount + 1;
  const newTotal = oldRating !== undefined ? oldTotal - oldRating + rating : oldTotal + rating;
  const newAverage = newCount > 0 ? Math.round((newTotal / newCount) * 10) / 10 : 0;

  await setDoc(ref, { ...data, count: newCount, total: newTotal, average: newAverage, [userId]: rating });
  try { await updateDoc(doc(db, 'userRestaurant', restaurantId), { rating: newAverage }); } catch (_) {}
  return { average: newAverage, count: newCount };
}

// ── Categorias ────────────────────────────────────────────

export async function getCategories(restaurantId: string): Promise<MenuCategory[]> {
  const q = query(collection(db, 'menuCategories'), where('restaurantId', '==', restaurantId));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as MenuCategory))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function saveCategory(restaurantId: string, category: MenuCategory): Promise<string> {
  if (category.id && !category.id.startsWith('temp_')) {
    await updateDoc(doc(db, 'menuCategories', category.id), {
      name: category.name,
      order: category.order,
      restaurantId,
    });
    return category.id;
  }
  const ref = await addDoc(collection(db, 'menuCategories'), {
    name: category.name,
    order: category.order,
    restaurantId,
  });
  return ref.id;
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'menuCategories', id));
}

// ── Itens do Cardápio ─────────────────────────────────────

export async function getMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const q = query(collection(db, 'menuItems'), where('restaurantId', '==', restaurantId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem));
}

export async function getAllOfferItems(): Promise<MenuItem[]> {
  const q = query(collection(db, 'menuItems'), where('isOffer', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem));
}

export async function saveMenuItem(restaurantId: string, item: MenuItem): Promise<string> {
  const { id, ...rest } = item;
  const data = { ...rest, restaurantId };
  if (id && !id.startsWith('temp_')) {
    await updateDoc(doc(db, 'menuItems', id), data);
    return id;
  }
  const ref = await addDoc(collection(db, 'menuItems'), data);
  return ref.id;
}

export async function deleteMenuItem(id: string): Promise<void> {
  await deleteDoc(doc(db, 'menuItems', id));
}

// ── Promoções ─────────────────────────────────────────────

export async function getPromotions(restaurantId: string): Promise<Promotion[]> {
  const q = query(collection(db, 'promotions'), where('restaurantId', '==', restaurantId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Promotion));
}

export async function getAllPromotions(): Promise<Promotion[]> {
  const q = query(collection(db, 'promotions'), where('active', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Promotion));
}

export async function savePromotion(restaurantId: string, promo: Promotion): Promise<string> {
  const { id, ...rest } = promo;
  const data = { ...rest, restaurantId };
  if (id && !id.startsWith('temp_')) {
    await updateDoc(doc(db, 'promotions', id), data);
    return id;
  }
  const ref = await addDoc(collection(db, 'promotions'), data);
  return ref.id;
}

export async function deletePromotion(id: string): Promise<void> {
  await deleteDoc(doc(db, 'promotions', id));
}

// ── Mesas ─────────────────────────────────────────────────

export async function getRestaurantTables(restaurantId: string): Promise<RestaurantTable[]> {
  const q = query(collection(db, 'tables'), where('restaurantId', '==', restaurantId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as RestaurantTable));
}

export async function saveTable(restaurantId: string, table: Partial<RestaurantTable> & { id?: string }): Promise<string> {
  const data = { restaurantId, code: table.code, name: table.name, active: table.active ?? true };
  if (table.id && !table.id.startsWith('temp_')) {
    await updateDoc(doc(db, 'tables', table.id), data);
    return table.id;
  }
  const ref = await addDoc(collection(db, 'tables'), data);
  return ref.id;
}

export async function deleteTable(id: string): Promise<void> {
  await deleteDoc(doc(db, 'tables', id));
}

export async function getTableByCode(restaurantId: string, code: string): Promise<RestaurantTable | null> {
  const q = query(
    collection(db, 'tables'),
    where('restaurantId', '==', restaurantId),
    where('code', '==', code.toUpperCase()),
    where('active', '==', true),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as RestaurantTable;
}

export async function getDiamondRestaurants(): Promise<Restaurant[]> {
  const snap = await getDocs(query(collection(db, 'userRestaurant'), where('plan', '==', 'diamante')));
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      slug: toSlug(data.restaurantName ?? d.id),
      name: data.restaurantName ?? '',
      logo: data.logo ?? '🍽️',
      plan: 'diamante',
      rating: data.rating ?? 0,
      category: data.category ?? '',
      distance: data.distance ?? 0,
      isOpen: data.isOpen ?? true,
      deliveryTime: data.deliveryTime ?? '',
      minOrder: data.minOrder ?? 0,
      headerColor: data.headerColor ?? '#C92924',
      city: data.city ?? '',
    } as Restaurant;
  });
}

// ── Pedidos na Mesa ────────────────────────────────────────

export async function submitTableOrder(order: Omit<TableOrder, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'tableOrders'), order);
  return ref.id;
}

export async function getUserTableOrders(userId: string): Promise<TableOrder[]> {
  const q = query(collection(db, 'tableOrders'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TableOrder));
}

export async function getRestaurantTableOrders(restaurantId: string): Promise<TableOrder[]> {
  const q = query(collection(db, 'tableOrders'), where('restaurantId', '==', restaurantId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TableOrder));
}

export async function updateTableOrderStatus(id: string, status: TableOrder['status']): Promise<void> {
  await updateDoc(doc(db, 'tableOrders', id), { status });
}

// ── Reservas ──────────────────────────────────────────────

export async function submitReservation(reservation: Omit<Reservation, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'reservations'), reservation);
  return ref.id;
}

export async function getUserReservations(userId: string): Promise<Reservation[]> {
  const q = query(collection(db, 'reservations'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Reservation))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getRestaurantReservations(restaurantId: string): Promise<Reservation[]> {
  const q = query(collection(db, 'reservations'), where('restaurantId', '==', restaurantId));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Reservation))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
