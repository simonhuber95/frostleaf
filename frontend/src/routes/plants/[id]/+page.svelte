<script lang="ts">
  import type { Plant } from '$lib/api/plants';
  import { locationStore } from '$lib/stores/location.svelte';
  import { gardenStore } from '$lib/stores/garden.svelte';
  import TemperatureScale from '$lib/components/TemperatureScale.svelte';
  import PlantTimeline from '$lib/components/PlantTimeline.svelte';
  import Leaf from '@lucide/svelte/icons/leaf';
  import Sun from '@lucide/svelte/icons/sun';
  import Calendar from '@lucide/svelte/icons/calendar';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import Plus from '@lucide/svelte/icons/plus';
  import Check from '@lucide/svelte/icons/check';

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

  let backHref = '/plants';
  let backLabel = 'Back to plants';

  // Add to garden
  let showGardenPicker = $state(false);
  let addedToGarden = $state<string | null>(null);

  function addToGarden(gardenId: string) {
    const added = gardenStore.addPlant(gardenId, plant.id, plant.commonName);
    if (added) {
      addedToGarden = gardenId;
      showGardenPicker = false;
      setTimeout(() => (addedToGarden = null), 2000);
    }
  }
</script>

<div class="space-y-8">
  <a href={backHref} class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
    <ArrowLeft class="h-4 w-4" />
    {backLabel}
  </a>

  <div class="flex gap-6">
    {#if plant.imageUrl}
      <img src={plant.imageUrl} alt={plant.commonName} class="h-32 w-32 rounded-lg object-cover shadow-md" />
    {:else}
      <div class="flex h-32 w-32 items-center justify-center rounded-lg bg-muted shadow-md">
        <Leaf class="h-10 w-10 text-muted-foreground" />
      </div>
    {/if}
    <div>
      <h1 class="text-3xl font-bold tracking-tight">{plant.commonName}</h1>
      <p class="mt-1 text-lg text-muted-foreground italic">{plant.scientificName}</p>
      <div class="mt-2 flex flex-wrap gap-2">
        <span class="rounded-md bg-primary/10 px-2.5 py-0.5 text-sm text-primary font-medium">{plant.family}</span>
        <span class="rounded-md bg-secondary px-2.5 py-0.5 text-sm">{plant.cropGroup}</span>
        {#if plant.source !== 'seed'}
          <span class="rounded-md bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{plant.source}</span>
        {/if}
      </div>
      <!-- Add to garden -->
      {#if gardenStore.gardens.length > 0}
        <div class="mt-3 relative">
          {#if addedToGarden}
            <span class="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <Check class="h-4 w-4" />
              Added to garden
            </span>
          {:else}
            <button
              onclick={() => (showGardenPicker = !showGardenPicker)}
              class="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20"
            >
              <Plus class="h-3.5 w-3.5" />
              Add to Garden
            </button>
          {/if}
          {#if showGardenPicker}
            <div class="absolute top-full left-0 mt-1 z-10 rounded-md border bg-card shadow-md py-1 min-w-48">
              {#each gardenStore.gardens as g (g.id)}
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
      {/if}
    </div>
  </div>

  {#if plantProps}
    <!-- Growing Info + Temperature side by side -->
    <div class="grid gap-6 sm:grid-cols-2">
      <div class="rounded-lg border bg-card p-5 space-y-3">
        <h2 class="text-lg font-semibold">Growing Info</h2>
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
        {#if plantProps.soilPreferences.length > 0}
          <div class="text-sm">
            <strong>Soil:</strong> {plantProps.soilPreferences.join(', ')}
          </div>
        {/if}
        {#if plantProps.edibleParts.length > 0}
          <div class="text-sm">
            <strong>Edible parts:</strong> {plantProps.edibleParts.join(', ')}
          </div>
        {/if}
      </div>

      {#if hasThermal}
        <div class="rounded-lg border bg-card p-5">
          <h2 class="mb-4 text-lg font-semibold">Temperature Range</h2>
          <TemperatureScale minTemperature={plantProps.minTemperature} baseTemperature={plantProps.baseTemperature} maxTemperature={plantProps.maxTemperature} />
          {#if plantProps.gddRequired}
            <div class="mt-3 text-sm text-muted-foreground">
              <span class="font-medium text-foreground">GDD required:</span> {plantProps.gddRequired}°C-days
              {#if plantProps.thermalSource}
                <span class="ml-2 text-xs">(source: {plantProps.thermalSource}{#if plantProps.thermalConfidence}, {plantProps.thermalConfidence} confidence{/if})</span>
              {/if}
            </div>
          {/if}
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
