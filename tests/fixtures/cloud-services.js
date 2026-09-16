// Test-only Firebase facade. Never imported by the application bundle.
let observer;
let currentUser = null;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const auth = { authStateReady: async () => {} };
const remote = new Map();
window.__cloudWrites = [];

export function services() {
  return {
    auth, db: {},
    authSDK: {
      onAuthStateChanged(_auth, callback) { observer = callback; queueMicrotask(() => callback(currentUser)); },
      async signInWithEmailAndPassword(_auth, email) {
        if (window.__authError) throw { code: window.__authError };
        currentUser = { uid: 'test-account', email, displayName: 'Pessoa de teste' };
        queueMicrotask(() => observer?.(currentUser));
        return { user: currentUser };
      },
      async createUserWithEmailAndPassword(_auth, email) { return this.signInWithEmailAndPassword(_auth, email); },
      async updateProfile(user, data) { Object.assign(user, data); },
      async signOut() { currentUser = null; observer?.(null); },
      async sendPasswordResetEmail() {},
      GoogleAuthProvider: class {},
      async signInWithPopup() { return this.signInWithEmailAndPassword(auth, 'test@example.com'); },
    },
    firestore: {
      doc(_db, ...parts) { return parts.join('/'); },
      collection(_db, ...parts) { return parts.join('/'); },
      query(value) { return value; }, orderBy() {}, limit() {}, serverTimestamp() { return Date.now(); },
      async getDoc(path) {
        await wait(window.__profileDelay || 20);
        if (window.__profileError) throw { code: 'permission-denied' };
        const data = remote.get(path);
        return { exists: () => Boolean(data), data: () => data };
      },
      async setDoc(path, data) {
        if (window.__writeError) throw { code: 'permission-denied' };
        window.__cloudWrites.push({ path, data: structuredClone(data) });
        remote.set(path, structuredClone(data));
      },
      async getDocs() { return { docs: [], empty: true }; },
      async addDoc(path, data) { remote.set(path + '/new-post', data); return { id: 'new-post' }; },
      async deleteDoc(path) { remote.delete(path); },
    },
  };
}
