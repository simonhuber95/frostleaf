<script lang="ts">
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import { gardenStore } from '$lib/stores/garden.svelte';
  import { locationStore } from '$lib/stores/location.svelte';
  import { authStore } from '$lib/stores/auth.svelte';
  import { getPlant, type Plant } from '$lib/api/plants';
  import { getViability, type ViabilityResult } from '$lib/api/viability';
  import { getLocationClimate, type LocationClimate } from '$lib/api/location';
  import { SvelteMap } from 'svelte/reactivity';
  import GardenOverview from '$lib/components/GardenOverview.svelte';
  import GardenDiary from '$lib/components/GardenDiary.svelte';
  import GardenSettings from '$lib/components/GardenSettings.svelte';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import Leaf from '@lucide/svelte/icons/leaf';
  import BookOpen from '@lucide/svelte/icons/book-open';
  import Settings from '@lucide/svelte/icons/settings';

  let { data }: { data: { gardenId: string } } = $props();

  let garden = $derived(gardenStore.getGarden(data.gardenId));

  // Shared data
  let plantDetails = new SvelteMap<string, Plant>();
  let viabilityMap = new SvelteMap<string, ViabilityResult>();
  let climateData = $state<LocationClimate | null>(null);
  let loadingDetails = $state(false);
  let frostFreeStart = $state<string | null>(null);
  let frostFreeEnd = $state<string | null>(null);
  let serverGardenId = $state<string | null>(null);

  let activeTab = $state<'overview' | 'diary' | 'settings'>('overview');

  onMount(async () => {
    if (!garden) return;

    if (garden.plants.length > 0) {
      loadingDetails = true;
      const locationId = locationStore.current?.locationId;
      try {
        const [plantResults, viabilityReport, climate] = await Promise.all([
          Promise.all(garden.plants.map((p) => getPlant(p.plantId).catch(() => null))),
          locationId ? getViability(locationId).catch(() => null) : null,
          locationId ? getLocationClimate(locationId).catch(() => null) : null,
        ]);

        climateData = climate;

        plantDetails.clear();
        for (const plant of plantResults) {
          if (plant) plantDetails.set(plant.id, plant);
        }

        if (viabilityReport) {
          viabilityMap.clear();
          for (const v of viabilityReport.plants) {
            viabilityMap.set(v.plantId, v);
          }
          frostFreeStart = viabilityReport.lastFrostSpring;
          frostFreeEnd = viabilityReport.firstFrostAutumn;
        }
      } finally {
        loadingDetails = false;
      }
    }

    if (authStore.isAuthenticated) {
      serverGardenId = await gardenStore.ensureServerGarden(garden.id);
    }
  });
</script>

{#if garden}
  <div class="space-y-6">
    <!-- Header + Tabs -->
    <div class="grid grid-cols-3 items-center">
      <div class="flex items-center gap-3 min-w-0">
        <a href={resolve('/garden')} class="text-muted-foreground hover:text-foreground transition-colors shrink-0" title="Back to gardens">
          <ArrowLeft class="h-4 w-4" />
        </a>
        <h1 class="text-xl font-bold tracking-tight truncate">{garden.name}</h1>
      </div>
      <div class="flex justify-center">
        <div class="flex items-center gap-1 rounded-md bg-muted p-0.5">
          {#each [
            { value: 'overview', label: 'Overview', icon: Leaf },
            ...(serverGardenId ? [{ value: 'diary', label: 'Diary', icon: BookOpen }] : []),
            { value: 'settings', label: 'Settings', icon: Settings },
          ] as tab (tab.value)}
            <button
              onclick={() => (activeTab = tab.value as typeof activeTab)}
              class="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors {activeTab === tab.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'}"
            >
              <tab.icon class="h-3.5 w-3.5" />
              {tab.label}
            </button>
          {/each}
        </div>
      </div>
      <div></div>
    </div>

    <!-- Tab content -->
    {#if activeTab === 'overview'}
      <GardenOverview
        {garden}
        {plantDetails}
        {viabilityMap}
        {climateData}
        {loadingDetails}
        {frostFreeStart}
        {frostFreeEnd}
      />
    {:else if activeTab === 'diary' && serverGardenId}
      <GardenDiary
        {serverGardenId}
        plants={garden.plants}
      />
    {:else if activeTab === 'settings'}
      <GardenSettings {garden} />
    {/if}
  </div>
{:else}
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <p class="text-muted-foreground">Garden not found</p>
    <a href={resolve('/garden')} class="mt-4 text-sm text-primary hover:underline">Back to gardens</a>
  </div>
{/if}
