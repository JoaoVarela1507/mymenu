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

export async function apiLogin(email: string, password: string): Promise<AuthUser | null> {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return await getFirestoreUser(user);
  } catch {
    return null;
  }
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

export async function loginWithGoogle(): Promise<AuthUser | null> {
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

    return await getFirestoreUser(user);
  } catch {
    return null;
  }
}

export async function handleGoogleRedirect(): Promise<AuthUser | null> {
  return null;
}

export async function apiLogout(): Promise<void> {
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
  return {
    id: firebaseUser.uid,
    name: data.name,
    email: data.email,
    type: data.role,
  };
}

function firebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use': return 'Este email já está cadastrado.';
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
