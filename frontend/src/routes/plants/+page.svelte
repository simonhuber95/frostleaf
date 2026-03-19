<script lang="ts">
  import { searchPlants, type Plant } from '$lib/api/plants';
  import Search from '@lucide/svelte/icons/search';
  import Leaf from '@lucide/svelte/icons/leaf';
  import Loader from '@lucide/svelte/icons/loader';

  let query = $state('');
  let includeExternal = $state(false);
  let plants = $state<Plant[]>([]);
  let loading = $state(false);
  let searched = $state(false);

  async function handleSearch() {
    if (!query.trim()) return;

    loading = true;
    try {
      plants = await searchPlants(query, includeExternal);
      searched = true;
    } finally {
      loading = false;
    }
  }
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Plant Catalog</h1>
    <p class="mt-1 text-muted-foreground">Search our database of plants with thermal data</p>
  </div>

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

  <label class="flex items-center gap-2 text-sm text-muted-foreground">
    <input type="checkbox" bind:checked={includeExternal} class="rounded" />
    Include online results (Trefle)
  </label>

  {#if searched && plants.length === 0}
    <p class="text-center text-muted-foreground py-8">No plants found for "{query}"</p>
  {/if}

  <div class="grid gap-3">
    {#each plants as plant}
      <a
        href="/plants/{plant.id}"
        class="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
      >
        {#if plant.imageUrl}
          <img src={plant.imageUrl} alt={plant.commonName} class="h-12 w-12 rounded-md object-cover" />
        {:else}
          <div class="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
            <Leaf class="h-5 w-5 text-muted-foreground" />
          </div>
        {/if}
        <div class="flex-1">
          <p class="font-medium">{plant.commonName}</p>
          <p class="text-sm text-muted-foreground">{plant.scientificName} — {plant.family}</p>
        </div>
        <div class="text-right text-sm text-muted-foreground">
          <p>{plant.cropGroup}</p>
          {#if plant.source === 'trefle'}
            <p class="text-xs">from Trefle</p>
          {/if}
        </div>
      </a>
    {/each}
  </div>
</div>
