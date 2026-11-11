import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Ensure Firebase is safely initialized once
let app: any = null;
let authInstance: any = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  authInstance = getAuth(app);
} catch (err) {
  console.warn('Firebase initialization warning:', err);
}

export const auth = authInstance;

export const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
];

const provider = new GoogleAuthProvider();
for (const scope of SCOPES) {
  provider.addScope(scope);
}
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;
// Cache the access token strictly in-memory (never in localStorage)
let cachedAccessToken: string | null = null;

declare global {
  interface Window {
    google?: any;
  }
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!auth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Direct Google Identity Services (GIS) token client fallback
 * Works cleanly even when Firebase authDomain or iframe popups are restricted
 */
const signInWithGIS = (clientId: string): Promise<{ user: User; accessToken: string }> => {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services belum dimuat oleh peramban.'));
      return;
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: async (resp: any) => {
          if (resp.error) {
            reject(new Error(resp.error_description || resp.error || 'Otentikasi GIS dibatalkan.'));
            return;
          }
          if (resp.access_token) {
            cachedAccessToken = resp.access_token;
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${resp.access_token}` },
              });
              const info = await res.json();
              const gisUser: any = {
                uid: info.sub || 'gis-user',
                displayName: info.name || 'Pengguna Google',
                email: info.email || 'user@gmail.com',
                photoURL: info.picture || null,
              };
              resolve({ user: gisUser, accessToken: resp.access_token });
            } catch {
              const fallbackUser: any = {
                uid: 'gis-user',
                displayName: 'Pengguna Google',
                email: 'user@gmail.com',
                photoURL: null,
              };
              resolve({ user: fallbackUser, accessToken: resp.access_token });
            }
          } else {
            reject(new Error('Tidak ada token akses yang diterima.'));
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Unified Google Sign-in:
 * 1. Tries standard Firebase Auth signInWithPopup
 * 2. Falls back to Google Identity Services Token Client if iframe/domain restrictions occur
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  isSigningIn = true;

  // Attempt 1: Standard Firebase Auth
  if (auth) {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        return { user: result.user, accessToken: cachedAccessToken };
      }
    } catch (firebaseErr: any) {
      console.warn('Firebase signInWithPopup failed, attempting GIS fallback:', firebaseErr);

      // Attempt 2: GIS fallback if OAuth Client ID is available
      const clientId = (firebaseConfig as any).oAuthClientId;
      if (clientId && window.google?.accounts?.oauth2) {
        try {
          const gisResult = await signInWithGIS(clientId);
          return gisResult;
        } catch (gisErr: any) {
          console.error('GIS sign-in also failed:', gisErr);
          throw new Error(
            getFriendlyAuthErrorMessage(firebaseErr) || getFriendlyAuthErrorMessage(gisErr)
          );
        }
      }

      throw firebaseErr;
    } finally {
      isSigningIn = false;
    }
  }

  // Attempt 3: GIS directly if Firebase Auth instance was null
  const clientId = (firebaseConfig as any).oAuthClientId;
  if (clientId && window.google?.accounts?.oauth2) {
    try {
      return await signInWithGIS(clientId);
    } catch (gisErr: any) {
      throw gisErr;
    } finally {
      isSigningIn = false;
    }
  }

  isSigningIn = false;
  throw new Error('Konfigurasi otentikasi Google belum siap.');
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
  }
  cachedAccessToken = null;
};

export function getFriendlyAuthErrorMessage(error: any): string {
  const code = error?.code || '';
  const msg = error?.message || '';

  if (code === 'auth/popup-blocked') {
    return 'Popup Google Sign-In diblokir oleh peramban. Silakan izinkan popup di pengaturan peramban Anda (cek ikon di bilah alamat/URL) atau klik tombol "Buka di Tab Baru".';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Jendela masuk Google ditutup sebelum selesai. Silakan klik tombol Masuk kembali.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Domain iframe pratinjau ini dibatasi oleh kebijakan Google OAuth. Silakan klik "Buka di Tab Baru" di atas atau gunakan "Mode Demo" untuk langsung membuka aplikasi.';
  }
  if (code === 'auth/cancelled-popup-request') {
    return 'Proses otentikasi sebelumnya dibatalkan. Silakan coba kembali.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Koneksi internet bermasalah. Mohon periksa koneksi internet Anda.';
  }
  return msg || 'Gagal masuk dengan akun Google.';
}
