<script lang="ts">
  import { onMount } from 'svelte';
  import favicon from '$lib/assets/favicon.svg';
  import { theme } from '$lib/stores/theme.svelte';
  import { locationStore } from '$lib/stores/location.svelte';
  import { gardenStore } from '$lib/stores/garden.svelte';
  import { authStore } from '$lib/stores/auth.svelte';
  import ThemeControls from '$lib/components/ThemeControls.svelte';
  import MapPin from '@lucide/svelte/icons/map-pin';
  import X from '@lucide/svelte/icons/x';
  import User from '@lucide/svelte/icons/user';
  import LogOut from '@lucide/svelte/icons/log-out';
  import '../app.css';

  let { children } = $props();

  onMount(() => {
    theme.init();
    locationStore.init();
    gardenStore.init();
    authStore.init();
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Frostleaf</title>
</svelte:head>

<div class="min-h-screen flex flex-col">
  <header class="border-b bg-card/50 backdrop-blur-sm">
    <nav class="container mx-auto flex h-14 items-center justify-between px-4">
      <div class="flex items-center gap-6">
        <a href="/" class="text-lg font-semibold tracking-tight text-primary">Frostleaf</a>
        <div class="flex gap-4 text-sm text-muted-foreground">
          <a href="/plants" class="hover:text-foreground transition-colors">Plants</a>
          <a href="/garden" class="hover:text-foreground transition-colors">My Garden</a>
        </div>
      </div>
      <div class="flex items-center gap-4">
        {#if locationStore.current}
          <div class="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1 text-sm">
            <MapPin class="h-3.5 w-3.5 text-primary" />
            <a href="/plants" class="font-medium text-primary hover:underline">
              {locationStore.current.displayName}
            </a>
            <button onclick={() => locationStore.clear()} class="ml-1 text-muted-foreground hover:text-foreground" aria-label="Clear location">
              <X class="h-3 w-3" />
            </button>
          </div>
        {/if}
        {#if authStore.isAuthenticated}
          <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User class="h-3.5 w-3.5" />
            <span>{authStore.user?.name}</span>
            <button
              onclick={() => authStore.signOut()}
              class="ml-1 text-muted-foreground hover:text-foreground"
              title="Sign out"
            >
              <LogOut class="h-3.5 w-3.5" />
            </button>
          </div>
        {:else if !authStore.loading}
          <a href="/auth/login" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</a>
        {/if}
        <ThemeControls />
      </div>
    </nav>
  </header>

  <main class="container mx-auto flex-1 px-4 py-8">
    {@render children()}
  </main>

  <footer class="border-t py-4 bg-card/30">
    <div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
      Frostleaf — Scientific garden planning for Norway
    </div>
  </footer>
</div>
