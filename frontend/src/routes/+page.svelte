<script lang="ts">
  import { goto } from '$app/navigation';
  import { findNearbyStations, resolveLocation, type NearbyStation } from '$lib/api/location';
  import { locationStore } from '$lib/stores/location.svelte';
  import Search from '@lucide/svelte/icons/search';
  import MapPin from '@lucide/svelte/icons/map-pin';
  import Loader from '@lucide/svelte/icons/loader';
  import Radio from '@lucide/svelte/icons/radio';

  let query = $state('');
  let locationType = $state<'address' | 'municipality' | 'coordinates'>('municipality');
  let loading = $state(false);
  let confirming = $state(false);
  let error = $state('');

  // Station picker state
  let stations = $state<NearbyStation[]>([]);
  let displayName = $state('');
  let resolvedLat = $state(0);
  let resolvedLon = $state(0);
  let selectedStationId = $state<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;

    loading = true;
    error = '';
    stations = [];
    selectedStationId = null;

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

      const result = await findNearbyStations(locationType, params);
      stations = result.stations;
      displayName = result.displayName;
      resolvedLat = result.latitude;
      resolvedLon = result.longitude;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Something went wrong';
    } finally {
      loading = false;
    }
  }

  async function handleConfirm() {
    if (!selectedStationId) return;

    confirming = true;
    error = '';

    try {
      const result = await resolveLocation(resolvedLat, resolvedLon, selectedStationId, displayName);
      locationStore.set({
        locationId: result.location.id,
        displayName: result.displayName,
        stationName: result.station.name,
        averageGdd: result.climate?.avgGdd ?? 0,
        frostFreeDays: result.climate?.avgFrostFreeDays ?? 0,
        lastFrostSpring: result.climate?.lastFrostSpring ?? null,
        firstFrostAutumn: result.climate?.firstFrostAutumn ?? null,
      });
      await goto('/plants');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Something went wrong';
    } finally {
      confirming = false;
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

  <form onsubmit={handleSearch} class="w-full max-w-lg space-y-4">
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

  <!-- Station picker -->
  {#if stations.length > 0}
    <div class="w-full max-w-lg space-y-3">
      <h2 class="text-sm font-medium text-muted-foreground">
        Select a weather station for {displayName}
      </h2>
      <div class="space-y-1.5">
        {#each stations as station (station.id)}
          <button
            type="button"
            onclick={() => (selectedStationId = station.id)}
            class="flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors
              {selectedStationId === station.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-accent/50'}"
          >
            <Radio class="h-4 w-4 shrink-0 {selectedStationId === station.id ? 'text-primary' : 'text-muted-foreground'}" />
            <div class="flex-1 min-w-0">
              <div class="font-medium">{station.name}</div>
              <div class="text-xs text-muted-foreground">
                {station.distanceKm} km away &middot; {station.latitude.toFixed(2)}°N, {station.longitude.toFixed(2)}°E
              </div>
            </div>
          </button>
        {/each}
      </div>

      <button
        type="button"
        onclick={handleConfirm}
        disabled={!selectedStationId || confirming}
        class="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {#if confirming}
          <Loader class="mr-2 inline h-4 w-4 animate-spin" />
          Loading climate data...
        {:else}
          Use this station
        {/if}
      </button>
    </div>
  {:else if !loading}
    <p class="max-w-md text-center text-sm text-muted-foreground">
      Enter your location to see which plants are viable based on local climate data and Growing Degree Days (GDD)
      analysis.
    </p>
  {/if}
</div>
