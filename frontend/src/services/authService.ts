import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { AuthUser } from '../types/auth';

export async function apiLogin(email: string, password: string): Promise<AuthUser | null | 'choose_profile'> {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return await getFirestoreUser(user);
  } catch {
    return null;
  }
}

const PROFILE_KEY = 'mymenu_active_profile';

export async function apiLoginWithProfile(email: string, password: string, profile: 'consumer' | 'admin'): Promise<AuthUser | null> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists()) return null;
      const data = snap.data();
      localStorage.setItem(PROFILE_KEY, profile);
      return { id: user.uid, name: data.name, email: data.email, type: profile };
    }
    const snap = await getDoc(doc(db, 'users', currentUser.uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    localStorage.setItem(PROFILE_KEY, profile);
    return { id: currentUser.uid, name: data.name, email: data.email, type: profile };
  } catch {
    return null;
  }
}

export async function checkAvailableProfiles(uid: string): Promise<('consumer' | 'admin')[]> {
  const profiles: ('consumer' | 'admin')[] = ['consumer'];
  const restSnap = await getDoc(doc(db, 'userRestaurant', uid));
  if (restSnap.exists()) profiles.push('admin');
  return profiles;
}

export async function apiRegister(payload: {
  name: string;
  email: string;
  password: string;
  role: 'consumer' | 'admin';
}): Promise<{ success: boolean; message: string }> {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, payload.email, payload.password);

    await setDoc(doc(db, 'users', user.uid), {
      name: payload.name,
      email: payload.email,
      role: payload.role,
      createdAt: new Date().toISOString(),
    });

    return { success: true, message: 'Cadastro realizado com sucesso!' };
  } catch (err: any) {
    const msg = firebaseErrorMessage(err.code);
    return { success: false, message: msg };
  }
}

export async function apiRegisterRestaurant(payload: {
  name: string;
  email: string;
  password: string;
  phone: string;
  restaurantName: string;
  cnpj: string;
  restaurantPhone: string;
  category: string;
  address: string;
  city: string;
  state: string;
  cep: string;
  description: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('http://localhost:8000/restaurant/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
        restaurant_name: payload.restaurantName,
        cnpj: payload.cnpj,
        restaurant_phone: payload.restaurantPhone,
        category: payload.category,
        address: payload.address,
        city: payload.city,
        state: payload.state,
        cep: payload.cep,
        description: payload.description,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[Register] Backend erro:', data);
      return { success: false, message: data.detail ?? 'Erro ao criar conta.' };
    }

    return { success: true, message: data.message };
  } catch (err: any) {
    console.error('[Register] Erro de rede:', err);
    return { success: false, message: 'Erro de conexão com o servidor.' };
  }
}

export async function loginWithGoogle(): Promise<AuthUser | null | 'choose_profile'> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const snap = await getDoc(doc(db, 'users', user.uid));
    if (!snap.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName ?? 'Usuário',
        email: user.email,
        role: 'consumer',
        createdAt: new Date().toISOString(),
      });
    }

    const profiles = await checkAvailableProfiles(user.uid);
    if (profiles.length > 1) {
      return 'choose_profile';
    }

    return await getFirestoreUser(user);
  } catch {
    return null;
  }
}

export async function handleGoogleRedirect(): Promise<AuthUser | null> {
  return null;
}

export async function apiLogout(): Promise<void> {
  localStorage.removeItem(PROFILE_KEY);
  await signOut(auth);
}

export function onAuthChanged(callback: (user: AuthUser | null) => void) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) return callback(null);
    let user = await getFirestoreUser(firebaseUser);
    if (!user && firebaseUser.providerData.some(p => p.providerId === 'google.com')) {
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name: firebaseUser.displayName ?? 'Usuário',
          email: firebaseUser.email,
          role: 'consumer',
          createdAt: new Date().toISOString(),
        });
        user = await getFirestoreUser(firebaseUser);
      } catch {}
    }
    callback(user);
  });
}

async function getFirestoreUser(firebaseUser: FirebaseUser): Promise<AuthUser | null> {
  const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  const saved = localStorage.getItem(PROFILE_KEY) as 'consumer' | 'admin' | null;
  const profiles = await checkAvailableProfiles(firebaseUser.uid);
  const type: 'consumer' | 'admin' = saved && profiles.includes(saved) ? saved : data.role;
  return {
    id: firebaseUser.uid,
    name: data.name,
    email: data.email,
    type,
  };
}

function firebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use': return 'Este email já possui uma conta. Use um email diferente para o cadastro do restaurante.';
    case 'auth/invalid-email': return 'Email inválido.';
    case 'auth/weak-password': return 'Senha muito fraca. Use pelo menos 6 caracteres.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Email ou senha inválidos.';
    default: return 'Erro ao autenticar. Tente novamente.';
  }
}

export function getToken(): string | null {
  return localStorage.getItem('mymenu_token');
}
