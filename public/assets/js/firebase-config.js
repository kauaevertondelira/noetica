// Firebase client identifiers are public configuration, not server secrets.
// Environment overrides allow this application to use another Firebase project.
const env = import.meta.env || {};
export const cloudEnabled = env.VITE_FIREBASE_ENABLED !== 'false';
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyCRJkM7PxWIAY5H7lAKevQI-lLp8TnW6Jw',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'noetica-ia.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'noetica-ia',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'noetica-ia.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '651014885815',
  appId: env.VITE_FIREBASE_APP_ID || '1:651014885815:web:aca6c1d6fa9b6fde81d832',
};

let servicesPromise;
export function getServices() {
  if (!cloudEnabled) return Promise.reject(new Error('As contas estão desativadas neste ambiente. Continue com o acesso livre.'));
  if (!servicesPromise) servicesPromise = import('./firebase-services.js').then(module => module.services(firebaseConfig)).catch(error => { servicesPromise = null; throw error; });
  return servicesPromise;
}
