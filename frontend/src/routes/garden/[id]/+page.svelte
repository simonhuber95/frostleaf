<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import { gardenStore } from '$lib/stores/garden.svelte';
  import { locationStore } from '$lib/stores/location.svelte';
  import { getPlant, type Plant } from '$lib/api/plants';
  import { getViability, type ViabilityResult } from '$lib/api/viability';
  import { getLocationClimate, type LocationClimate } from '$lib/api/location';
  import TemperatureChart from '$lib/components/TemperatureChart.svelte';
  import GardenTimeline from '$lib/components/GardenTimeline.svelte';
  import GardenTable, { type GardenTablePlant } from '$lib/components/GardenTable.svelte';
  import type { GardenTimelinePlant } from '$lib/components/GardenTimeline.svelte';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import Pencil from '@lucide/svelte/icons/pencil';
  import Check from '@lucide/svelte/icons/check';
  import X from '@lucide/svelte/icons/x';
  import Plus from '@lucide/svelte/icons/plus';
  import Leaf from '@lucide/svelte/icons/leaf';
  import Download from '@lucide/svelte/icons/download';
  import Upload from '@lucide/svelte/icons/upload';
  import CalendarRange from '@lucide/svelte/icons/calendar-range';
  import Table from '@lucide/svelte/icons/table';

  let { data }: { data: { gardenId: string } } = $props();

  let garden = $derived(gardenStore.getGarden(data.gardenId));

  // Plant details for timeline/table
  let plantDetails = $state<Map<string, Plant>>(new Map());
  let viabilityMap = $state<Map<string, ViabilityResult>>(new Map());
  let climateData = $state<LocationClimate | null>(null);
  let loadingDetails = $state(false);

  // View mode
  let viewMode = $state<'timeline' | 'table'>('timeline');

  // Fetch plant details + viability + climate data
  onMount(async () => {
    if (!garden || garden.plants.length === 0) return;
    loadingDetails = true;
    const locationId = locationStore.current?.locationId;
    try {
      const [plantResults, viabilityReport, climate] = await Promise.all([
        Promise.all(garden.plants.map((p) => getPlant(p.plantId).catch(() => null))),
        locationId ? getViability(locationId).catch(() => null) : null,
        locationId ? getLocationClimate(locationId).catch(() => null) : null,
      ]);

      climateData = climate;

      const pMap = new Map<string, Plant>();
      for (const plant of plantResults) {
        if (plant) pMap.set(plant.id, plant);
      }
      plantDetails = pMap;

      if (viabilityReport) {
        const vMap = new Map<string, ViabilityResult>();
        for (const v of viabilityReport.plants) {
          vMap.set(v.plantId, v);
        }
        viabilityMap = vMap;
        viabilityFrostStart = viabilityReport.lastFrostSpring;
        viabilityFrostEnd = viabilityReport.firstFrostAutumn;
      }
    } finally {
      loadingDetails = false;
    }
  });

  // Viability report frost dates (MM-DD averaged across years)
  let viabilityFrostStart = $state<string | null>(null);
  let viabilityFrostEnd = $state<string | null>(null);

  let timelinePlants = $derived<GardenTimelinePlant[]>(
    garden?.plants
      .map((gp) => {
        const viability = viabilityMap.get(gp.plantId);
        if (!viability?.timeline) return null;

        return {
          plantId: gp.plantId,
          commonName: gp.commonName,
          timeline: viability.timeline,
        };
      })
      .filter((p): p is GardenTimelinePlant => p !== null) ?? [],
  );

  let tablePlants = $derived<GardenTablePlant[]>(
    garden?.plants.map((gp) => {
      const detail = plantDetails.get(gp.plantId);
      const props = detail?.properties;
      return {
        commonName: gp.commonName,
        cropGroup: detail?.cropGroup ?? '',
        sowingMonths: props?.growthMonths?.slice(0, 2).join(', ') ?? '',
        daysToHarvest: props?.daysToHarvest ?? null,
        notes: gp.notes,
        plantedDate: gp.plantedDate,
      };
    }) ?? [],
  );

  // Editing garden name
  let editingName = $state(false);
  let editNameValue = $state('');

  function startEditName() {
    if (!garden) return;
    editNameValue = garden.name;
    editingName = true;
  }

  function saveName() {
    if (!garden || !editNameValue.trim()) return;
    gardenStore.updateGarden(garden.id, { name: editNameValue.trim() });
    editingName = false;
  }


  // Plant bins by viability
  let sortedPlants = $derived(
    [...(garden?.plants ?? [])].sort((a, b) =>
      (viabilityMap.get(b.plantId)?.viabilityScore ?? -1) - (viabilityMap.get(a.plantId)?.viabilityScore ?? -1)
    ),
  );
  let viablePlants = $derived(sortedPlants.filter((p) => (viabilityMap.get(p.plantId)?.viabilityScore ?? 0) >= 0.6));
  let maybePlants = $derived(sortedPlants.filter((p) => { const s = viabilityMap.get(p.plantId)?.viabilityScore ?? 0; return s >= 0.25 && s < 0.6; }));
  let unviablePlants = $derived(sortedPlants.filter((p) => (viabilityMap.get(p.plantId)?.viabilityScore ?? 0) < 0.25));

  // Delete garden
  let confirmDelete = $state(false);

  function handleDelete() {
    if (!garden) return;
    gardenStore.deleteGarden(garden.id);
    goto('/garden');
  }

  // Export
  function handleExport() {
    if (!garden) return;
    const exportData = {
      version: 1 as const,
      name: garden.name,
      location: { latitude: garden.latitude, longitude: garden.longitude },
      plants: garden.plants.map((p) => ({
        plantId: p.plantId,
        commonName: p.commonName,
        plantedDate: p.plantedDate,
        notes: p.notes,
      })),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `frostleaf-${garden.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import
  let fileInput = $state<HTMLInputElement | null>(null);

  async function handleImport(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.version !== 1 || !data.name || !data.plants) {
        alert('Invalid garden file format');
        return;
      }
      gardenStore.importGarden({
        id: '',
        name: data.name,
        locationId: locationStore.current?.locationId ?? '',
        latitude: data.location?.latitude ?? 0,
        longitude: data.location?.longitude ?? 0,
        plants: data.plants,
        createdAt: new Date().toISOString(),
      });
      goto('/garden');
    } catch {
      alert('Could not read file');
    }
  }
</script>

{#if garden}
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <a href="/garden" class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft class="h-4 w-4" />
        Back to gardens
      </a>
      <div class="flex items-center gap-2">
        <button
          onclick={handleExport}
          class="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-accent"
          title="Export as JSON"
        >
          <Download class="h-3.5 w-3.5" />
          Export
        </button>
        <input type="file" accept=".json" class="hidden" bind:this={fileInput} onchange={handleImport} />
        <button
          onclick={() => fileInput?.click()}
          class="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-accent"
          title="Import from JSON"
        >
          <Upload class="h-3.5 w-3.5" />
          Import
        </button>
      </div>
    </div>

    <!-- Garden header -->
    <div>
      {#if editingName}
        <div class="flex items-center gap-2">
          <input
            bind:value={editNameValue}
            type="text"
            class="text-3xl font-bold tracking-tight bg-transparent border-b-2 border-primary outline-none"
            onkeydown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') editingName = false; }}
          />
          <button onclick={saveName} class="text-primary hover:text-primary/80"><Check class="h-5 w-5" /></button>
          <button onclick={() => (editingName = false)} class="text-muted-foreground hover:text-foreground"><X class="h-5 w-5" /></button>
        </div>
      {:else}
        <div class="flex items-center gap-2">
          <h1 class="text-3xl font-bold tracking-tight">{garden.name}</h1>
          <button onclick={startEditName} class="text-muted-foreground hover:text-foreground"><Pencil class="h-4 w-4" /></button>
        </div>
      {/if}
      <p class="mt-1 text-sm text-muted-foreground">
        {garden.plants.length} plant{garden.plants.length !== 1 ? 's' : ''}
        &middot; Created {new Date(garden.createdAt).toLocaleDateString()}
      </p>
    </div>

    <!-- Add plant CTA -->
    <a
      href="/plants?addToGarden={garden.id}"
      class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      <Plus class="h-4 w-4" />
      Add Plants
    </a>

    <!-- Plant list -->
    {#snippet plantCard(plant: typeof garden.plants[0])}
      {@const detail = plantDetails.get(plant.plantId)}
      {@const viability = viabilityMap.get(plant.plantId)}
      <a
        href={resolve('/plants/[id]', { id: plant.plantId }) + `?from=${garden.id}`}
        class="group relative flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
      >
        {#if viability}
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold {viability.viabilityScore >= 0.6
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : viability.viabilityScore >= 0.25
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}"
          >
            {Math.round(viability.viabilityScore * 100)}
          </div>
        {:else}
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Leaf class="h-4 w-4 text-primary" />
          </div>
        {/if}
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">{plant.commonName}</p>
          <p class="truncate text-xs text-muted-foreground">
            {detail?.scientificName ?? ''}{detail ? ' · ' + detail.cropGroup.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : ''}
          </p>
          {#if viability?.requiredGdd}
            <p class="text-xs text-muted-foreground">GDD: {viability.requiredGdd}</p>
          {/if}
        </div>
        <button
          onclick={(e) => { e.preventDefault(); gardenStore.removePlant(garden.id, plant.plantId); }}
          class="absolute top-1.5 right-1.5 rounded-md p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
          title="Remove plant"
        >
          <X class="h-3.5 w-3.5" />
        </button>
      </a>
    {/snippet}

    {#if garden.plants.length > 0}
      <div class="space-y-6">
        {#if viablePlants.length > 0}
          <div>
            <h3 class="mb-2 text-sm font-medium text-green-700 dark:text-green-400">Viable ({viablePlants.length})</h3>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {#each viablePlants as plant (plant.plantId)}
                {@render plantCard(plant)}
              {/each}
            </div>
          </div>
        {/if}

        {#if maybePlants.length > 0}
          <div>
            <h3 class="mb-2 text-sm font-medium text-yellow-700 dark:text-yellow-400">Maybe viable ({maybePlants.length})</h3>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {#each maybePlants as plant (plant.plantId)}
                {@render plantCard(plant)}
              {/each}
            </div>
          </div>
        {/if}

        {#if unviablePlants.length > 0}
          <div>
            <h3 class="mb-2 text-sm font-medium text-red-700 dark:text-red-400">Not viable ({unviablePlants.length})</h3>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {#each unviablePlants as plant (plant.plantId)}
                {@render plantCard(plant)}
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <div class="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <Leaf class="h-10 w-10 text-muted-foreground/50" />
        <p class="mt-3 text-sm text-muted-foreground">No plants added yet</p>
        <a
          href="/plants?addToGarden={garden.id}"
          class="mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus class="h-4 w-4" />
          Browse Plants
        </a>
      </div>
    {/if}

    <!-- Timeline / Table views -->
    {#if garden.plants.length > 0}
      <div class="rounded-lg border bg-card p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Planting Timeline</h2>
          <div class="flex items-center gap-1 rounded-md bg-muted p-0.5">
            <button
              onclick={() => (viewMode = 'timeline')}
              class="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors {viewMode === 'timeline'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'}"
            >
              <CalendarRange class="h-3.5 w-3.5" />
              Timeline
            </button>
            <button
              onclick={() => (viewMode = 'table')}
              class="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors {viewMode === 'table'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'}"
            >
              <Table class="h-3.5 w-3.5" />
              Table
            </button>
          </div>
        </div>

        {#if loadingDetails}
          <p class="text-sm text-muted-foreground">Loading plant data...</p>
        {:else if viewMode === 'timeline'}
          <GardenTimeline
            plants={timelinePlants}
            frostFreeStart={viabilityFrostStart}
            frostFreeEnd={viabilityFrostEnd}
          />
        {:else}
          <GardenTable gardenName={garden.name} plants={tablePlants} />
        {/if}
      </div>
    {/if}

    <!-- Temperature chart -->
    {#if climateData}
      <div class="rounded-lg border bg-card p-5">
        <h2 class="mb-3 text-lg font-semibold">Temperature</h2>
        <TemperatureChart
          dailyAverages={climateData.dailyAverages}
          lastFrostSpring={climateData.lastFrostSpring}
          firstFrostAutumn={climateData.firstFrostAutumn}
        />
      </div>
    {/if}

    <!-- Danger zone -->
    <div class="rounded-lg border border-destructive/20 p-5 space-y-3">
      <h2 class="text-sm font-semibold text-destructive">Danger Zone</h2>
      {#if confirmDelete}
        <div class="flex items-center gap-2">
          <p class="text-sm">Are you sure? This cannot be undone.</p>
          <button
            onclick={handleDelete}
            class="rounded-md bg-destructive px-3 py-1.5 text-sm text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </button>
          <button
            onclick={() => (confirmDelete = false)}
            class="rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-accent"
          >
            Cancel
          </button>
        </div>
      {:else}
        <button
          onclick={() => (confirmDelete = true)}
          class="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/20"
        >
          <Trash2 class="h-3.5 w-3.5" />
          Delete garden
        </button>
      {/if}
    </div>
  </div>
{:else}
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <p class="text-muted-foreground">Garden not found</p>
    <a href="/garden" class="mt-4 text-sm text-primary hover:underline">Back to gardens</a>
  </div>
{/if}
