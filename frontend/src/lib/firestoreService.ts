import { collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { Restaurant, MenuItem, MenuCategory } from '../types/restaurant';

// ── Restaurantes ──────────────────────────────────────────

export async function getRestaurants(): Promise<Restaurant[]> {
  const snap = await getDocs(collection(db, 'userRestaurant'));
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      slug: data.restaurantName?.toLowerCase().replace(/\s+/g, '-') ?? d.id,
      name: data.restaurantName ?? '',
      logo: data.logo ?? '🍽️',
      plan: data.plan ?? 'basico',
      rating: data.rating ?? 0,
      category: data.category ?? '',
      distance: data.distance ?? 0,
      isOpen: data.isOpen ?? true,
      deliveryTime: data.deliveryTime ?? '30-45 min',
      minOrder: data.minOrder ?? 0,
      headerColor: data.headerColor ?? '#660000',
      address: data.address,
      city: data.city,
      state: data.state,
    } as Restaurant;
  });
}

export async function getRestaurantByOwnerId(uid: string): Promise<any | null> {
  const snap = await getDoc(doc(db, 'userRestaurant', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ── Categorias ────────────────────────────────────────────

export async function getCategories(restaurantId: string): Promise<MenuCategory[]> {
  const q = query(
    collection(db, 'menuCategories'),
    where('restaurantId', '==', restaurantId),
    orderBy('order')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuCategory));
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
  const q = query(
    collection(db, 'menuItems'),
    where('restaurantId', '==', restaurantId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem));
}

export async function saveMenuItem(restaurantId: string, item: MenuItem): Promise<string> {
  const data = { ...item, restaurantId };
  if (item.id && !item.id.startsWith('temp_')) {
    await updateDoc(doc(db, 'menuItems', item.id), data);
    return item.id;
  }
  delete (data as any).id;
  const ref = await addDoc(collection(db, 'menuItems'), data);
  return ref.id;
}

export async function deleteMenuItem(id: string): Promise<void> {
  await deleteDoc(doc(db, 'menuItems', id));
}
