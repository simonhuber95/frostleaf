import { authClient } from '$lib/auth';

type User = {
  id: string;
  name: string;
  email: string;
};

let user = $state<User | null>(null);
let loading = $state(true);

export const authStore = {
  get user() {
    return user;
  },
  get isAuthenticated() {
    return !!user;
  },
  get loading() {
    return loading;
  },

  async init() {
    if (typeof window === 'undefined') return;
    loading = true;
    try {
      const session = await authClient.getSession();
      user = session.data?.user ?? null;
    } catch {
      user = null;
    } finally {
      loading = false;
    }
  },

  async signUp(name: string, email: string, password: string) {
    const result = await authClient.signUp.email({ name, email, password });
    if (result.error) throw new Error(result.error.message ?? 'Sign up failed');
    user = result.data?.user ?? null;
  },

  async signIn(email: string, password: string) {
    const result = await authClient.signIn.email({ email, password });
    if (result.error) throw new Error(result.error.message ?? 'Sign in failed');
    user = result.data?.user ?? null;
  },

  async signOut() {
    await authClient.signOut();
    user = null;
  },
};
