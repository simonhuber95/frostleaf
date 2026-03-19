<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolveLocation } from '$lib/api/location';
  import { locationStore } from '$lib/stores/location.svelte';
  import Search from '@lucide/svelte/icons/search';
  import MapPin from '@lucide/svelte/icons/map-pin';
  import Loader from '@lucide/svelte/icons/loader';

  let query = $state('');
  let locationType = $state<'address' | 'municipality' | 'coordinates'>('municipality');
  let loading = $state(false);
  let error = $state('');

  async function handleSubmit() {
    if (!query.trim()) return;

    loading = true;
    error = '';

    try {
      let params: Record<string, string | number>;

      if (locationType === 'coordinates') {
        const parts = query.split(',').map((s) => parseFloat(s.trim()));
        if (parts.length !== 2 || parts.some(isNaN)) {
          error = 'Enter coordinates as "latitude, longitude" (e.g. 59.91, 10.75)';
          loading = false;
          return;
        }
        params = { latitude: parts[0], longitude: parts[1] };
      } else {
        params = { query: query.trim() };
      }

      const result = await resolveLocation(locationType, params);
      // Set partial location state — viability page will fill in the rest
      locationStore.set({
        locationId: result.location.id,
        displayName: result.displayName,
        stationName: result.station.name,
        averageGdd: 0,
        frostFreeDays: 0,
        lastFrostSpring: null,
        firstFrostAutumn: null,
      });
      await goto('/plants');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Something went wrong';
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex flex-col items-center justify-center gap-8 pt-24">
  <div class="text-center">
    <h1 class="text-5xl font-bold tracking-tight">Frostleaf</h1>
    <p class="mt-3 text-lg text-muted-foreground">
      Find out which plants thrive in your Norwegian garden
    </p>
  </div>

  <form onsubmit={handleSubmit} class="w-full max-w-lg space-y-4">
    <div class="flex gap-2">
      <button
        type="button"
        class="rounded-md px-3 py-1.5 text-sm transition-colors {locationType === 'municipality'
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-accent'}"
        onclick={() => (locationType = 'municipality')}
      >
        <MapPin class="mr-1 inline h-3.5 w-3.5" />
        Municipality
      </button>
      <button
        type="button"
        class="rounded-md px-3 py-1.5 text-sm transition-colors {locationType === 'address'
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-accent'}"
        onclick={() => (locationType = 'address')}
      >
        Address
      </button>
      <button
        type="button"
        class="rounded-md px-3 py-1.5 text-sm transition-colors {locationType === 'coordinates'
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-accent'}"
        onclick={() => (locationType = 'coordinates')}
      >
        Coordinates
      </button>
    </div>

    <div class="flex gap-2">
      <input
        bind:value={query}
        type="text"
        placeholder={locationType === 'coordinates'
          ? '59.91, 10.75'
          : locationType === 'municipality'
            ? 'e.g. Oslo, Bergen, Trondheim'
            : 'e.g. Karl Johans gate 1'}
        class="flex-1 rounded-md border border-input bg-background px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        disabled={loading}
      />
      <button
        type="submit"
        class="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        disabled={loading || !query.trim()}
      >
        {#if loading}
          <Loader class="h-4 w-4 animate-spin" />
        {:else}
          <Search class="h-4 w-4" />
        {/if}
      </button>
    </div>

    {#if error}
      <p class="text-sm text-destructive">{error}</p>
    {/if}
  </form>

  <p class="max-w-md text-center text-sm text-muted-foreground">
    Enter your location to see which plants are viable based on local climate data and Growing Degree Days (GDD)
    analysis.
  </p>
</div>
