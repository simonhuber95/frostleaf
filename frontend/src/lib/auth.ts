import { createAuthClient } from 'better-auth/svelte';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const authClient = createAuthClient({
  baseURL: API_BASE,
});
