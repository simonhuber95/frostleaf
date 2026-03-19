<script lang="ts">
  import type { Plant } from '$lib/api/plants';
  import Leaf from '@lucide/svelte/icons/leaf';
  import Thermometer from '@lucide/svelte/icons/thermometer';
  import Sun from '@lucide/svelte/icons/sun';
  import Calendar from '@lucide/svelte/icons/calendar';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';

  let { data }: { data: { plant: Plant } } = $props();
  let plant: Plant = $derived(data.plant);
  let plantProps = $derived(plant.properties);
</script>

<div class="space-y-8">
  <a href="/plants" class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
    <ArrowLeft class="h-4 w-4" />
    Back to catalog
  </a>

  <div class="flex gap-6">
    {#if plant.imageUrl}
      <img src={plant.imageUrl} alt={plant.commonName} class="h-32 w-32 rounded-lg object-cover" />
    {:else}
      <div class="flex h-32 w-32 items-center justify-center rounded-lg bg-muted">
        <Leaf class="h-10 w-10 text-muted-foreground" />
      </div>
    {/if}
    <div>
      <h1 class="text-3xl font-bold tracking-tight">{plant.commonName}</h1>
      <p class="mt-1 text-lg text-muted-foreground italic">{plant.scientificName}</p>
      <div class="mt-2 flex gap-2">
        <span class="rounded-md bg-secondary px-2.5 py-0.5 text-sm">{plant.family}</span>
        <span class="rounded-md bg-secondary px-2.5 py-0.5 text-sm">{plant.cropGroup}</span>
        {#if plant.source !== 'seed'}
          <span class="rounded-md bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{plant.source}</span>
        {/if}
      </div>
    </div>
  </div>

  {#if plantProps}
    <div class="grid gap-6 sm:grid-cols-2">
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">Growing Info</h2>
        <div class="space-y-3">
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
              <strong>Soil:</strong>
              {plantProps.soilPreferences.join(', ')}
            </div>
          {/if}
          {#if plantProps.edibleParts.length > 0}
            <div class="text-sm">
              <strong>Edible parts:</strong>
              {plantProps.edibleParts.join(', ')}
            </div>
          {/if}
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-lg font-semibold">Thermal Properties</h2>
        <div class="space-y-3">
          {#if plantProps.tBase != null}
            <div class="flex items-center gap-3">
              <Thermometer class="h-4 w-4 text-muted-foreground" />
              <span class="text-sm"><strong>Base temp (T<sub>base</sub>):</strong> {plantProps.tBase}°C</span>
            </div>
          {/if}
          {#if plantProps.tUpper != null}
            <div class="flex items-center gap-3">
              <Thermometer class="h-4 w-4 text-muted-foreground" />
              <span class="text-sm"><strong>Upper temp (T<sub>upper</sub>):</strong> {plantProps.tUpper}°C</span>
            </div>
          {/if}
          {#if plantProps.gddRequired}
            <div class="text-sm">
              <strong>GDD required:</strong> {plantProps.gddRequired}°C
            </div>
          {/if}
          {#if plantProps.thermalSource}
            <div class="text-sm text-muted-foreground">
              Source: {plantProps.thermalSource}
              {#if plantProps.thermalConfidence}
                (confidence: {plantProps.thermalConfidence})
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>

    {#if plantProps.description}
      <div>
        <h2 class="text-lg font-semibold">Description</h2>
        <p class="mt-2 text-sm text-muted-foreground">{plantProps.description}</p>
      </div>
    {/if}

    {#if plantProps.sowingInfo}
      <div>
        <h2 class="text-lg font-semibold">Sowing</h2>
        <p class="mt-2 text-sm text-muted-foreground">{plantProps.sowingInfo}</p>
      </div>
    {/if}

    {#if plantProps.bloomMonths.length > 0}
      <div class="text-sm">
        <strong>Bloom months:</strong> {plantProps.bloomMonths.join(', ')}
      </div>
    {/if}

    {#if plantProps.growthMonths.length > 0}
      <div class="text-sm">
        <strong>Growth months:</strong> {plantProps.growthMonths.join(', ')}
      </div>
    {/if}
  {:else}
    <p class="text-muted-foreground">No detailed properties available for this plant.</p>
  {/if}
</div>
