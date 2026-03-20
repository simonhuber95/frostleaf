<script lang="ts">
  import { page } from '$app/stores';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import type { Plant } from '$lib/api/plants';
  import { getViability, type ViabilityResult } from '$lib/api/viability';
  import { locationStore } from '$lib/stores/location.svelte';
  import { gardenStore } from '$lib/stores/garden.svelte';
  import TemperatureScale from '$lib/components/TemperatureScale.svelte';
  import PlantTimeline from '$lib/components/PlantTimeline.svelte';
  import Leaf from '@lucide/svelte/icons/leaf';
  import Sun from '@lucide/svelte/icons/sun';
  import Calendar from '@lucide/svelte/icons/calendar';
  import Thermometer from '@lucide/svelte/icons/thermometer';
  import Sprout from '@lucide/svelte/icons/sprout';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import Plus from '@lucide/svelte/icons/plus';

  let { data }: { data: { plant: Plant } } = $props();
  let plant: Plant = $derived(data.plant);
  let plantProps = $derived(plant.properties);

  function monthNamesToNumbers(names: string[]): number[] {
    const map: Record<string, number> = {
      january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
      july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    };
    return names.map((n) => map[n.toLowerCase()]).filter((n) => n != null);
  }

  // Use last frost date from location store, or fall back to May estimate
  let sowingStartMonth = $derived(locationStore.lastFrostMonth ?? 5);

  function estimateGrowthMonths(daysToHarvest: number): number[] {
    const monthsNeeded = Math.ceil(daysToHarvest / 30);
    return Array.from({ length: monthsNeeded }, (_, i) => sowingStartMonth + i).filter((m) => m <= 12);
  }

  let timelineGrowthMonths = $derived(
    plantProps?.growthMonths.length
      ? monthNamesToNumbers(plantProps.growthMonths)
      : plantProps?.daysToHarvest
        ? estimateGrowthMonths(plantProps.daysToHarvest)
        : [],
  );

  let timelineBloomMonths = $derived(plantProps?.bloomMonths.length ? monthNamesToNumbers(plantProps.bloomMonths) : []);

  let hasTimeline = $derived(timelineGrowthMonths.length > 0 || timelineBloomMonths.length > 0);
  let hasThermal = $derived(plantProps?.baseTemperature != null || plantProps?.maxTemperature != null);

  // Viability for this plant at current location
  let viability = $state<ViabilityResult | null>(null);

  onMount(async () => {
    const locationId = locationStore.current?.locationId;
    if (!locationId) return;
    const report = await getViability(locationId).catch(() => null);
    if (report) {
      viability = report.plants.find((p) => p.plantId === plant.id) ?? null;
    }
  });

  let fromGardenId = $derived($page.url.searchParams.get('from'));
  let fromGarden = $derived(fromGardenId ? gardenStore.getGarden(fromGardenId) : null);
  let backHref = $derived(fromGarden && fromGardenId ? resolve('/garden/[id]', { id: fromGardenId }) : resolve('/plants'));
  let backLabel = $derived(fromGarden ? `Back to ${fromGarden.name}` : 'Back to plants');

  // Add to garden
  let showGardenPicker = $state(false);
  let gardensWithPlant = $derived(gardenStore.gardens.filter((g) => g.plants.some((p) => p.plantId === plant.id)));
  let gardensWithoutPlant = $derived(gardenStore.gardens.filter((g) => !g.plants.some((p) => p.plantId === plant.id)));
  let inAllGardens = $derived(gardenStore.gardens.length > 0 && gardensWithoutPlant.length === 0);

  function addToGarden(gardenId: string) {
    gardenStore.addPlant(gardenId, plant.id, plant.commonName);
    showGardenPicker = false;
  }
</script>

<div class="space-y-8">
  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- backHref already uses resolve() -->
  <a href={backHref} class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
    <ArrowLeft class="h-4 w-4" />
    {backLabel}
  </a>

  <div class="flex items-start justify-between gap-6">
    <div class="flex gap-6 min-w-0">
      {#if plant.imageUrl}
        <img src={plant.imageUrl} alt={plant.commonName} class="h-32 w-32 rounded-lg object-cover shadow-md shrink-0" />
      {:else}
        <div class="flex h-32 w-32 items-center justify-center rounded-lg bg-muted shadow-md shrink-0">
          <Leaf class="h-10 w-10 text-muted-foreground" />
        </div>
      {/if}
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{plant.commonName}</h1>
        <p class="mt-1 text-lg text-muted-foreground italic">{plant.scientificName}</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <span class="rounded-md bg-primary/10 px-2.5 py-0.5 text-sm text-primary font-medium">{plant.family}</span>
          <span class="rounded-md bg-primary/10 px-2.5 py-0.5 text-sm text-primary font-medium">{plant.cropGroup}</span>
          {#if plant.source !== 'seed'}
            <span class="rounded-md bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{plant.source}</span>
          {/if}
        </div>
      </div>
    </div>
    <!-- Garden actions -->
    {#if gardenStore.gardens.length > 0}
      <div class="flex flex-col items-end gap-2 shrink-0">
        <div class="relative">
          <button
            onclick={() => { if (!inAllGardens) showGardenPicker = !showGardenPicker; }}
            disabled={inAllGardens}
            class="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary/10"
          >
            <Plus class="h-3.5 w-3.5" />
            Add to Garden
          </button>
          {#if showGardenPicker}
            <div class="absolute top-full right-0 mt-1 z-10 rounded-md border bg-card shadow-md py-1 min-w-48">
              {#each gardensWithoutPlant as g (g.id)}
                <button
                  onclick={() => addToGarden(g.id)}
                  class="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  {g.name}
                  <span class="text-muted-foreground">({g.plants.length} plants)</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
        {#if gardensWithPlant.length > 0}
          <div class="flex items-center gap-2 flex-wrap justify-end">
            {#each gardensWithPlant as g (g.id)}
              <a
                href={resolve('/garden/[id]', { id: g.id })}
                class="inline-flex items-center rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                {g.name}
              </a>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  {#if plantProps}
    <!-- Growing Info + Temperature side by side -->
    <div class="grid gap-6 sm:grid-cols-2 items-start">
      <div class="rounded-lg border bg-card p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Growing Info</h2>
          {#if viability}
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold {viability.viabilityScore >= 0.6
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : viability.viabilityScore >= 0.25
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}"
              title="Viability score at {locationStore.current?.displayName}"
            >
              {Math.round(viability.viabilityScore * 100)}
            </div>
          {/if}
        </div>
        {#if plantProps.daysToHarvest}
          <div class="flex items-center gap-3">
            <Calendar class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm"><strong>Days to harvest:</strong> {plantProps.daysToHarvest}</span>
          </div>
        {/if}
        {#if plantProps.lightRequirement}
          <div class="flex items-center gap-3">
            <Sun class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm"><strong>Light:</strong> {plantProps.lightRequirement.replace('_', ' ')}</span>
          </div>
        {/if}
        {#if plantProps.duration}
          <div class="flex items-center gap-3">
            <Leaf class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm"><strong>Duration:</strong> {plantProps.duration}</span>
          </div>
        {/if}
        {#if plantProps.gddRequired}
          <div class="flex items-center gap-3">
            <Thermometer class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm"><strong>GDD required:</strong> {plantProps.gddRequired}°C-days{#if viability} <span class="text-muted-foreground">({viability.locationGdd} available)</span>{/if}</span>
          </div>
        {/if}
        {#if plantProps.soilPreferences.length > 0}
          <div class="flex items-center gap-3">
            <Sprout class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm"><strong>Soil:</strong> {plantProps.soilPreferences.join(', ')}</span>
          </div>
        {/if}
        {#if plantProps.edibleParts.length > 0}
          <div class="text-sm">
            <strong>Edible parts:</strong> {plantProps.edibleParts.join(', ')}
          </div>
        {/if}
        {#if viability && viability.photoperiodWarnings.length > 0}
          {#each viability.photoperiodWarnings as warning (warning.type)}
            <div class="flex items-start gap-3 rounded-md p-3 {warning.severity === 'warning'
              ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800'
              : 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'}">
              <Sun class="h-4 w-4 mt-0.5 shrink-0 {warning.severity === 'warning' ? 'text-amber-500' : 'text-blue-400'}" />
              <p class="text-sm {warning.severity === 'warning' ? 'text-amber-800 dark:text-amber-200' : 'text-blue-800 dark:text-blue-200'}">{warning.message}</p>
            </div>
          {/each}
        {/if}
      </div>

      {#if hasThermal}
        <div class="rounded-lg border bg-card p-5">
          <h2 class="mb-4 text-lg font-semibold">Temperature Range</h2>
          <TemperatureScale minTemperature={plantProps.minTemperature} baseTemperature={plantProps.baseTemperature} maxTemperature={plantProps.maxTemperature} />
        </div>
      {/if}
    </div>

    <!-- Plant Timeline -->
    {#if hasTimeline}
      <div class="rounded-lg border bg-card p-5">
        <h2 class="mb-4 text-lg font-semibold">Growing Calendar</h2>
        <PlantTimeline
          growthMonths={timelineGrowthMonths}
          bloomMonths={timelineBloomMonths}
          frostFreeStart={locationStore.lastFrostMonth ?? undefined}
          frostFreeEnd={locationStore.firstFrostMonth ?? undefined}
        />
        {#if locationStore.current}
          <p class="mt-2 text-xs text-muted-foreground">
            Based on climate data for {locationStore.current.displayName} (last frost: {locationStore.current.lastFrostSpring ?? 'unknown'}, first autumn frost: {locationStore.current.firstFrostAutumn ?? 'unknown'})
          </p>
        {:else if !plantProps.growthMonths.length && plantProps.daysToHarvest}
          <p class="mt-2 text-xs text-muted-foreground">Estimated from {plantProps.daysToHarvest} days to harvest. Set a location for accurate frost dates.</p>
        {/if}
      </div>
    {/if}

    <!-- Description + Sowing -->
    {#if plantProps.description || plantProps.sowingInfo}
      <div class="grid gap-6 sm:grid-cols-2">
        {#if plantProps.description}
          <div class="rounded-lg border bg-card p-5">
            <h2 class="text-lg font-semibold">Description</h2>
            <p class="mt-2 text-sm text-muted-foreground">{plantProps.description}</p>
          </div>
        {/if}
        {#if plantProps.sowingInfo}
          <div class="rounded-lg border bg-card p-5">
            <h2 class="text-lg font-semibold">Sowing</h2>
            <p class="mt-2 text-sm text-muted-foreground">{plantProps.sowingInfo}</p>
          </div>
        {/if}
      </div>
    {/if}
  {:else}
    <p class="text-muted-foreground">No detailed properties available for this plant.</p>
  {/if}
</div>
