<script lang="ts">
  import { goto } from '$app/navigation';
  import { untrack } from 'svelte';
  import { authStore } from '$lib/stores/auth.svelte';
  import { gardenStore } from '$lib/stores/garden.svelte';
  import Loader from '@lucide/svelte/icons/loader';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  // Redirect if already authenticated
  $effect(() => {
    if (authStore.isAuthenticated) {
      untrack(() => goto('/garden'));
    }
  });

  async function handleSubmit() {
    if (!email.trim() || !password) return;
    loading = true;
    error = '';

    try {
      await authStore.signIn(email.trim(), password);
      await gardenStore.loadFromServer();
      await goto('/garden');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Sign in failed';
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex flex-col items-center justify-center pt-16">
  <div class="w-full max-w-sm space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold tracking-tight">Sign In</h1>
      <p class="mt-1 text-sm text-muted-foreground">Sign in to save your gardens</p>
    </div>

    <form onsubmit={handleSubmit} class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium mb-1">Email</label>
        <input
          id="email"
          bind:value={email}
          type="email"
          required
          class="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={loading}
        />
      </div>
      <div>
        <label for="password" class="block text-sm font-medium mb-1">Password</label>
        <input
          id="password"
          bind:value={password}
          type="password"
          required
          minlength="8"
          class="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={loading}
        />
      </div>

      {#if error}
        <p class="text-sm text-destructive">{error}</p>
      {/if}

      <button
        type="submit"
        class="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        disabled={loading}
      >
        {#if loading}
          <Loader class="mx-auto h-4 w-4 animate-spin" />
        {:else}
          Sign In
        {/if}
      </button>
    </form>

    <p class="text-center text-sm text-muted-foreground">
      Don't have an account?
      <a href="/auth/signup" class="text-primary hover:underline">Sign up</a>
    </p>
  </div>
</div>
