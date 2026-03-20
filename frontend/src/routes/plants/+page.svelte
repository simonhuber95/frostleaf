<script lang="ts">
  import { untrack, onMount } from 'svelte';
  import { page } from '$app/stores';
  import { resolve } from '$app/paths';
  import { searchPlants, type Plant } from '$lib/api/plants';
  import { getViability, type ViabilityReport, type ViabilityResult } from '$lib/api/viability';
  import { locationStore } from '$lib/stores/location.svelte';
  import { gardenStore } from '$lib/stores/garden.svelte';
  import Search from '@lucide/svelte/icons/search';
  import Leaf from '@lucide/svelte/icons/leaf';
  import Snowflake from '@lucide/svelte/icons/snowflake';
  import Thermometer from '@lucide/svelte/icons/thermometer';
  import Calendar from '@lucide/svelte/icons/calendar';
  import Loader from '@lucide/svelte/icons/loader';
  import Plus from '@lucide/svelte/icons/plus';
  import Check from '@lucide/svelte/icons/check';
  import X from '@lucide/svelte/icons/x';
  import Sun from '@lucide/svelte/icons/sun';

  // Search state
  let query = $state('');
  let includeExternal = $state(false);
  let searchResults = $state<Plant[]>([]);
  let loading = $state(false);
  let searched = $state(false);

  // Viability state
  let report = $state<ViabilityReport | null>(null);
  let viabilityLoading = $state(false);
  let viabilityFilter = $state<'all' | 'viable' | 'maybe' | 'unviable'>('all');
  let cropFilter = $state('');

  let hasLocation = $derived(!!locationStore.current);

  // Viability-derived data
  let viabilityMap = $derived<Map<string, ViabilityResult>>(
    report ? new Map(report.plants.map((p) => [p.plantId, p])) : new Map(),
  );
  let viabilityPlants = $derived(report?.plants ?? []);
  let cropGroups = $derived([...new Set(viabilityPlants.map((p) => p.cropGroup))].sort());
  let cropFiltered = $derived(cropFilter ? viabilityPlants.filter((p) => p.cropGroup === cropFilter) : viabilityPlants);
  let allCount = $derived(cropFiltered.length);
  let viableCount = $derived(cropFiltered.filter((p) => p.viabilityScore >= 0.6).length);
  let maybeCount = $derived(cropFiltered.filter((p) => p.viabilityScore >= 0.25 && p.viabilityScore < 0.6).length);
  let unviableCount = $derived(cropFiltered.filter((p) => p.viabilityScore < 0.25).length);

  let filteredViabilityPlants = $derived(() => {
    let plants = viabilityPlants;
    if (viabilityFilter === 'viable') plants = plants.filter((p) => p.viabilityScore >= 0.6);
    if (viabilityFilter === 'maybe') plants = plants.filter((p) => p.viabilityScore >= 0.25 && p.viabilityScore < 0.6);
    if (viabilityFilter === 'unviable') plants = plants.filter((p) => p.viabilityScore < 0.25);
    if (cropFilter) plants = plants.filter((p) => p.cropGroup === cropFilter);
    return plants;
  });

  // Fetch viability when location is available
  onMount(async () => {
    const locationId = locationStore.current?.locationId;
    if (!locationId) return;

    viabilityLoading = true;
    try {
      const r = await getViability(locationId);
      report = r;
      // Update store with full climate data
      untrack(() => {
        const current = locationStore.current;
        if (!current) return;
        locationStore.set({
          ...current,
          stationName: r.stationName,
          averageGdd: r.averageGdd,
          frostFreeDays: r.frostFreeDays,
          lastFrostSpring: r.lastFrostSpring,
          firstFrostAutumn: r.firstFrostAutumn,
        });
      });
    } finally {
      viabilityLoading = false;
    }
  });

  async function handleSearch() {
    if (!query.trim()) return;
    loading = true;
    try {
      searchResults = await searchPlants(query, includeExternal);
      searched = true;
    } finally {
      loading = false;
    }
  }

  // Show search results or viability plants
  let showingSearch = $derived(searched && searchResults.length > 0);

  // Add to garden mode
  let addToGardenId = $derived($page.url.searchParams.get('addToGarden'));
  let addToGarden = $derived(addToGardenId ? gardenStore.getGarden(addToGardenId) : null);
  let gardenPlantIds = $derived(new Set(addToGarden?.plants.map((p) => p.plantId) ?? []));

  function handleAddToGarden(plantId: string, commonName: string) {
    if (!addToGardenId) return;
    gardenStore.addPlant(addToGardenId, plantId, commonName);
  }
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Plants</h1>
    <p class="mt-1 text-muted-foreground">
      {#if hasLocation}
        Plant viability for {locationStore.current?.displayName}
      {:else}
        Browse and search our plant database
      {/if}
    </p>
  </div>

  <!-- Add to garden banner -->
  {#if addToGarden}
    <div class="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3">
      <p class="text-sm">
        <strong>Adding to:</strong> {addToGarden.name} &middot; Click plants to add them
      </p>
      <a
        href={resolve('/garden/[id]', { id: addToGardenId! })}
        class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Done ({addToGarden.plants.length} plants)
      </a>
    </div>
  {/if}

  <!-- Climate stats banner (only with location) -->
  {#if report}
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <div class="rounded-lg border bg-card p-3">
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <Thermometer class="h-3.5 w-3.5" />
          Avg GDD
        </div>
        <p class="mt-1 text-xl font-semibold">{report.averageGdd}</p>
      </div>
      <div class="rounded-lg border bg-card p-3">
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar class="h-3.5 w-3.5" />
          Frost-free
        </div>
        <p class="mt-1 text-xl font-semibold">{report.frostFreeDays}d</p>
      </div>
      <div class="rounded-lg border bg-card p-3">
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <Snowflake class="h-3.5 w-3.5" />
          Last frost
        </div>
        <p class="mt-1 text-xl font-semibold">{report.lastFrostSpring ?? '—'}</p>
      </div>
      <div class="rounded-lg border bg-card p-3">
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <Sun class="h-3.5 w-3.5" />
          Peak daylight
        </div>
        <p class="mt-1 text-xl font-semibold">{report.peakDaylightHours}h</p>
      </div>
      <div class="rounded-lg border bg-card p-3">
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <Leaf class="h-3.5 w-3.5" />
          Viable
        </div>
        <p class="mt-1 text-xl font-semibold">{viableCount} / {viabilityPlants.length}</p>
      </div>
    </div>
  {:else if viabilityLoading}
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader class="h-4 w-4 animate-spin" />
      Loading viability data...
    </div>
  {/if}

  <!-- Search bar -->
  <form onsubmit={handleSearch} class="flex gap-2">
    <input
      bind:value={query}
      type="text"
      placeholder="Search by name, scientific name, or family..."
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
  </form>

  <div class="flex flex-wrap items-center gap-2">
    <label class="flex items-center gap-2 text-sm text-muted-foreground">
      <input type="checkbox" bind:checked={includeExternal} class="rounded" />
      Include online results (Trefle)
    </label>

    {#if showingSearch}
      <button
        onclick={() => { searched = false; searchResults = []; query = ''; }}
        class="ml-auto rounded-md px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Clear search
      </button>
    {/if}
  </div>

  <!-- Viability filters (only when showing viability, not search) -->
  {#if report && !showingSearch}
    <div class="flex flex-wrap gap-2">
      <button
        class="rounded-md px-3 py-1.5 text-sm transition-colors {viabilityFilter === 'all'
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-accent'}"
        onclick={() => (viabilityFilter = 'all')}
      >
        All ({allCount})
      </button>
      <button
        class="rounded-md px-3 py-1.5 text-sm transition-colors {viabilityFilter === 'viable'
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-accent'}"
        onclick={() => (viabilityFilter = 'viable')}
      >
        Viable ({viableCount})
      </button>
      <button
        class="rounded-md px-3 py-1.5 text-sm transition-colors {viabilityFilter === 'maybe'
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-accent'}"
        onclick={() => (viabilityFilter = 'maybe')}
      >
        Maybe viable ({maybeCount})
      </button>
      <button
        class="rounded-md px-3 py-1.5 text-sm transition-colors {viabilityFilter === 'unviable'
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-accent'}"
        onclick={() => (viabilityFilter = 'unviable')}
      >
        Not viable ({unviableCount})
      </button>

      <select
        bind:value={cropFilter}
        class="rounded-md border bg-background px-3 py-1.5 text-sm"
      >
        <option value="">All crops</option>
        {#each cropGroups as group (group)}
          <option value={group}>{group.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
        {/each}
      </select>
    </div>
  {/if}

  <!-- Plant list -->
  {#if showingSearch}
    <!-- Search results -->
    {#if searchResults.length === 0}
      <p class="text-center text-muted-foreground py-8">No plants found for "{query}"</p>
    {/if}
    <div class="grid gap-3">
      {#each searchResults as plant (plant.id)}
        {@const viability = viabilityMap.get(plant.id)}
        <a
          href={resolve('/plants/[id]', { id: plant.id })}
          class="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
        >
          <div class="flex items-center gap-4">
            {#if plant.imageUrl}
              <img src={plant.imageUrl} alt={plant.commonName} class="h-12 w-12 rounded-md object-cover" />
            {:else}
              <div class="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                <Leaf class="h-5 w-5 text-muted-foreground" />
              </div>
            {/if}
            <div>
              <p class="font-medium">{plant.commonName}</p>
              <p class="text-sm text-muted-foreground">{plant.scientificName} — {plant.family}</p>
            </div>
          </div>
          <div class="flex items-center gap-4 text-right">
            <div class="text-sm text-muted-foreground">
              <p>{plant.cropGroup}</p>
              {#if plant.source === 'trefle'}
                <p class="text-xs">from Trefle</p>
              {/if}
            </div>
            {#if viability}
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold {viability.viabilityScore >= 0.6
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : viability.viabilityScore >= 0.25
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}"
              >
                {Math.round(viability.viabilityScore * 100)}
              </div>
            {/if}
            {#if addToGarden}
              {#if gardenPlantIds.has(plant.id)}
                <button
                  onclick={(e) => { e.preventDefault(); gardenStore.removePlant(addToGardenId!, plant.id); }}
                  class="rounded-md p-2 text-green-600 dark:text-green-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Remove from garden"
                >
                  <Check class="h-5 w-5" />
                </button>
              {:else}
                <button
                  onclick={(e) => { e.preventDefault(); handleAddToGarden(plant.id, plant.commonName); }}
                  class="rounded-md bg-primary/10 p-2 text-primary hover:bg-primary/20"
                  title="Add to garden"
                >
                  <Plus class="h-4 w-4" />
                </button>
              {/if}
            {/if}
          </div>
        </a>
      {/each}
    </div>
  {:else if report}
    <!-- Viability plant list -->
    <div class="grid gap-3">
      {#each filteredViabilityPlants() as plant (plant.plantId)}
        <a
          href={resolve('/plants/[id]', { id: plant.plantId })}
          class="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
        >
          <div class="flex items-center gap-4">
            {#if plant.imageUrl}
              <img src={plant.imageUrl} alt={plant.commonName} class="h-12 w-12 rounded-md object-cover" />
            {:else}
              <div class="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                <Leaf class="h-5 w-5 text-muted-foreground" />
              </div>
            {/if}
            <div>
              <div class="flex items-center gap-1.5">
                <p class="font-medium">{plant.commonName}</p>
                {#if plant.photoperiodWarnings?.length > 0}
                  {@const topWarning = plant.photoperiodWarnings[0]}
                  <span
                    class="{topWarning.severity === 'warning' ? 'text-amber-500' : 'text-blue-400'}"
                    title={topWarning.message}
                  >
                    <Sun class="h-3.5 w-3.5" />
                  </span>
                {/if}
              </div>
              <p class="text-sm text-muted-foreground">{plant.scientificName}</p>
            </div>
          </div>
          <div class="flex items-center gap-4 text-right">
            <div class="text-sm">
              {#if plant.requiredGdd}
                <p class="text-muted-foreground">GDD: {plant.requiredGdd}</p>
              {/if}
              <p class="text-xs text-muted-foreground">{plant.cropGroup}</p>
            </div>
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold {plant.viabilityScore >= 0.6
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : plant.viabilityScore >= 0.25
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}"
            >
              {Math.round(plant.viabilityScore * 100)}
            </div>
            {#if addToGarden}
              {#if gardenPlantIds.has(plant.plantId)}
                <button
                  onclick={(e) => { e.preventDefault(); gardenStore.removePlant(addToGardenId!, plant.plantId); }}
                  class="group/rm cursor-pointer rounded-md p-2 text-green-600 dark:text-green-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Remove from garden"
                >
                  <Check class="h-5 w-5 group-hover/rm:hidden" />
                  <X class="h-5 w-5 hidden group-hover/rm:block" />
                </button>
              {:else}
                <button
                  onclick={(e) => { e.preventDefault(); handleAddToGarden(plant.plantId, plant.commonName); }}
                  class="rounded-md bg-primary/10 p-2 text-primary hover:bg-primary/20"
                  title="Add to garden"
                >
                  <Plus class="h-4 w-4" />
                </button>
              {/if}
            {/if}
          </div>
        </a>
      {/each}
    </div>
  {:else if !viabilityLoading}
    <p class="text-center text-muted-foreground py-8">Search for plants above{#if !hasLocation}, or set a location to see viability data{/if}</p>
  {/if}
</div>
