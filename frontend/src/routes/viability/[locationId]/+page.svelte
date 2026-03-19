<script lang="ts">
  import type { ViabilityReport, ViabilityResult } from '$lib/api/viability';
  import Leaf from '@lucide/svelte/icons/leaf';
  import Snowflake from '@lucide/svelte/icons/snowflake';
  import Thermometer from '@lucide/svelte/icons/thermometer';
  import Calendar from '@lucide/svelte/icons/calendar';

  let { data }: { data: { report: ViabilityReport } } = $props();
  let report = $derived(data.report);

  let filter = $state<'all' | 'viable' | 'marginal'>('all');
  let cropFilter = $state('');

  let filteredPlants = $derived(() => {
    let plants: ViabilityResult[] = report.plants;

    if (filter === 'viable') plants = plants.filter((p: ViabilityResult) => p.isViable);
    if (filter === 'marginal') plants = plants.filter((p: ViabilityResult) => !p.isViable && p.viabilityScore >= 0.4);

    if (cropFilter) plants = plants.filter((p: ViabilityResult) => p.cropGroup === cropFilter);

    return plants;
  });

  let cropGroups = $derived([...new Set(report.plants.map((p: ViabilityResult) => p.cropGroup))].sort());
  let viableCount = $derived(report.plants.filter((p: ViabilityResult) => p.isViable).length);
</script>

<div class="space-y-8">
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Viability Report</h1>
    <p class="mt-1 text-muted-foreground">Station: {report.stationName}</p>
  </div>

  <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
    <div class="rounded-lg border p-4">
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <Thermometer class="h-4 w-4" />
        Avg GDD
      </div>
      <p class="mt-1 text-2xl font-semibold">{report.averageGdd}</p>
    </div>
    <div class="rounded-lg border p-4">
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar class="h-4 w-4" />
        Frost-free
      </div>
      <p class="mt-1 text-2xl font-semibold">{report.frostFreeDays}d</p>
    </div>
    <div class="rounded-lg border p-4">
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <Snowflake class="h-4 w-4" />
        Last frost
      </div>
      <p class="mt-1 text-2xl font-semibold">{report.lastFrostSpring ?? '—'}</p>
    </div>
    <div class="rounded-lg border p-4">
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <Leaf class="h-4 w-4" />
        Viable
      </div>
      <p class="mt-1 text-2xl font-semibold">{viableCount} / {report.plants.length}</p>
    </div>
  </div>

  <div class="flex flex-wrap gap-2">
    <button
      class="rounded-md px-3 py-1.5 text-sm transition-colors {filter === 'all'
        ? 'bg-primary text-primary-foreground'
        : 'bg-secondary text-secondary-foreground hover:bg-accent'}"
      onclick={() => (filter = 'all')}
    >
      All ({report.plants.length})
    </button>
    <button
      class="rounded-md px-3 py-1.5 text-sm transition-colors {filter === 'viable'
        ? 'bg-primary text-primary-foreground'
        : 'bg-secondary text-secondary-foreground hover:bg-accent'}"
      onclick={() => (filter = 'viable')}
    >
      Viable ({viableCount})
    </button>
    <button
      class="rounded-md px-3 py-1.5 text-sm transition-colors {filter === 'marginal'
        ? 'bg-primary text-primary-foreground'
        : 'bg-secondary text-secondary-foreground hover:bg-accent'}"
      onclick={() => (filter = 'marginal')}
    >
      Marginal
    </button>

    <select
      bind:value={cropFilter}
      class="rounded-md border bg-background px-3 py-1.5 text-sm"
    >
      <option value="">All crops</option>
      {#each cropGroups as group}
        <option value={group}>{group}</option>
      {/each}
    </select>
  </div>

  <div class="grid gap-3">
    {#each filteredPlants() as plant}
      <a
        href="/plants/{plant.plantId}"
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
            class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold {plant.isViable
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : plant.viabilityScore >= 0.4
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}"
          >
            {Math.round(plant.viabilityScore * 100)}
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>
