<script lang="ts">
  import { resolve } from '$app/paths';
  import { gardenStore } from '$lib/stores/garden.svelte';
  import GardenTimeline from './GardenTimeline.svelte';
  import GardenTable, { type GardenTablePlant } from './GardenTable.svelte';
  import type { GardenTimelinePlant } from './GardenTimeline.svelte';
  import TemperatureChart from './TemperatureChart.svelte';
  import type { Plant } from '$lib/api/plants';
  import type { ViabilityResult } from '$lib/api/viability';
  import type { LocationClimate } from '$lib/api/location';
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';
  import type { SowingChoice, LocalGardenPlant, LocalGarden } from '@frostleaf/shared';
  import Leaf from '@lucide/svelte/icons/leaf';
  import Plus from '@lucide/svelte/icons/plus';
  import X from '@lucide/svelte/icons/x';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import CalendarRange from '@lucide/svelte/icons/calendar-range';
  import Table from '@lucide/svelte/icons/table';

  type Props = {
    garden: LocalGarden;
    plantDetails: SvelteMap<string, Plant>;
    viabilityMap: SvelteMap<string, ViabilityResult>;
    climateData: LocationClimate | null;
    loadingDetails: boolean;
    frostFreeStart: string | null;
    frostFreeEnd: string | null;
  };

  let { garden, plantDetails, viabilityMap, climateData, loadingDetails, frostFreeStart, frostFreeEnd }: Props = $props();

  // View mode
  let viewMode = $state<'timeline' | 'table'>('timeline');

  // Group by mode
  let groupBy = $state<'viability' | 'crop_group' | 'soil' | 'sowing' | 'light'>('viability');
  let collapsedGroups = new SvelteSet<string>();

  function toggleGroup(label: string) {
    if (collapsedGroups.has(label)) collapsedGroups.delete(label);
    else collapsedGroups.add(label);
  }

  function effectiveSowingChoice(plant: LocalGardenPlant): SowingChoice | null {
    if (plant.sowingChoice) return plant.sowingChoice;
    const method = plantDetails.get(plant.plantId)?.properties?.sowingMethod ?? null;
    if (method === 'indoor' || method === 'both') return 'indoor';
    if (method === 'direct') return 'direct';
    return null;
  }

  let timelinePlants = $derived<GardenTimelinePlant[]>(
    garden.plants
      .map((gp) => {
        const viability = viabilityMap.get(gp.plantId);
        if (!viability?.timeline) return null;
        return {
          plantId: gp.plantId,
          commonName: gp.commonName,
          timeline: viability.timeline,
          sowingChoice: effectiveSowingChoice(gp),
        };
      })
      .filter((p): p is GardenTimelinePlant => p !== null),
  );

  let tablePlants = $derived<GardenTablePlant[]>(
    garden.plants.map((gp) => {
      const detail = plantDetails.get(gp.plantId);
      const props = detail?.properties;
      return {
        commonName: gp.commonName,
        cropGroup: detail?.cropGroup ?? '',
        sowingMethod: props?.sowingMethod ?? null,
        sowingMonths: props?.growthMonths?.slice(0, 2).join(', ') ?? '',
        daysToHarvest: props?.daysToHarvest ?? null,
        notes: gp.notes,
        plantedDate: gp.plantedDate,
      };
    }),
  );

  // Plant grouping
  type PlantGroup = { label: string; plants: LocalGardenPlant[] };

  function groupByViability(): PlantGroup[] {
    const sorted = [...garden.plants].sort((a, b) =>
      (viabilityMap.get(b.plantId)?.viabilityScore ?? -1) - (viabilityMap.get(a.plantId)?.viabilityScore ?? -1)
    );
    const viable = sorted.filter((p) => (viabilityMap.get(p.plantId)?.viabilityScore ?? 0) >= 0.6);
    const maybe = sorted.filter((p) => { const s = viabilityMap.get(p.plantId)?.viabilityScore ?? 0; return s >= 0.25 && s < 0.6; });
    const unviable = sorted.filter((p) => (viabilityMap.get(p.plantId)?.viabilityScore ?? 0) < 0.25);
    const groups: PlantGroup[] = [];
    if (viable.length) groups.push({ label: `Viable (${viable.length})`, plants: viable });
    if (maybe.length) groups.push({ label: `Maybe viable (${maybe.length})`, plants: maybe });
    if (unviable.length) groups.push({ label: `Not viable (${unviable.length})`, plants: unviable });
    return groups;
  }

  function groupByProp(keyFn: (p: LocalGardenPlant) => string): PlantGroup[] {
    const buckets = new SvelteMap<string, LocalGardenPlant[]>();
    for (const p of garden.plants) {
      const label = keyFn(p);
      if (!buckets.has(label)) buckets.set(label, []);
      buckets.get(label)!.push(p);
    }
    return [...buckets.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([label, plants]) => ({ label: `${label} (${plants.length})`, plants }));
  }

  let plantGroups = $derived<PlantGroup[]>(
    groupBy === 'viability' ? groupByViability()
    : groupBy === 'crop_group' ? groupByProp((p) => {
        const g = plantDetails.get(p.plantId)?.cropGroup ?? 'unknown';
        return g.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      })
    : groupBy === 'soil' ? groupByProp((p) => {
        const prefs = plantDetails.get(p.plantId)?.properties?.soilPreferences ?? [];
        const key = prefs.length > 0 ? prefs[0] : 'unknown';
        return key.replace(/\b\w/g, (c) => c.toUpperCase());
      })
    : groupBy === 'sowing' ? groupByProp((p) => {
        const labels: Record<string, string> = { indoor: 'Indoor', direct: 'Direct', both: 'Indoor or Direct' };
        return labels[plantDetails.get(p.plantId)?.properties?.sowingMethod ?? 'unknown'] ?? 'Unknown';
      })
    : groupByProp((p) => {
        const labels: Record<string, string> = { full_sun: 'Full Sun', partial_shade: 'Partial Shade', full_shade: 'Full Shade' };
        return labels[plantDetails.get(p.plantId)?.properties?.lightRequirement ?? 'unknown'] ?? 'Unknown';
      })
  );

</script>

<!-- Plant list -->
{#snippet plantCard(plant: LocalGardenPlant)}
  {@const detail = plantDetails.get(plant.plantId)}
  {@const viability = viabilityMap.get(plant.plantId)}
  {@const method = detail?.properties?.sowingMethod ?? null}
  {@const choice = effectiveSowingChoice(plant)}
  <div class="group relative rounded-lg border transition-colors hover:bg-accent">
    <a
      href="{resolve('/plants/[id]', { id: plant.plantId })}?from={garden.id}"
      class="flex items-center gap-2.5 p-2.5 pb-1"
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
    </a>
    {#if method}
      <div class="px-2.5 pb-2 pt-0.5 pl-11.5">
        {#if method === 'both'}
          <div class="inline-flex items-center rounded-md bg-muted p-0.5 text-[11px]">
            <button
              onclick={() => gardenStore.updatePlant(garden.id, plant.plantId, { sowingChoice: 'indoor' })}
              class="rounded px-2 py-0.5 font-medium transition-colors {choice === 'indoor'
                ? 'bg-violet-500 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'}"
            >
              Indoor
            </button>
            <button
              onclick={() => gardenStore.updatePlant(garden.id, plant.plantId, { sowingChoice: 'direct' })}
              class="rounded px-2 py-0.5 font-medium transition-colors {choice === 'direct'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'}"
            >
              Direct
            </button>
          </div>
        {:else if method === 'indoor'}
          <span class="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">Indoor start</span>
        {:else}
          <span class="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Direct sow</span>
        {/if}
      </div>
    {/if}
    <button
      onclick={() => gardenStore.removePlant(garden.id, plant.plantId)}
      class="absolute top-1.5 right-1.5 rounded-md p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
      title="Remove plant"
    >
      <X class="h-3.5 w-3.5" />
    </button>
  </div>
{/snippet}

{#if garden.plants.length > 0}
  <div class="flex items-center gap-2">
    <span class="text-xs text-muted-foreground">Group by</span>
    <div class="inline-flex items-center rounded-md bg-muted p-0.5 text-xs">
      {#each [
        { value: 'viability', label: 'Viability' },
        { value: 'crop_group', label: 'Crop' },
        { value: 'soil', label: 'Soil' },
        { value: 'light', label: 'Light' },
        { value: 'sowing', label: 'Sowing' },
      ] as opt (opt.value)}
        <button
          onclick={() => { groupBy = opt.value as typeof groupBy; collapsedGroups.clear(); }}
          class="rounded px-2.5 py-1 font-medium transition-colors {groupBy === opt.value
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'}"
        >
          {opt.label}
        </button>
      {/each}
    </div>
  </div>

  <div class="space-y-4">
    {#each plantGroups as group (group.label)}
      {@const collapsed = collapsedGroups.has(group.label)}
      <div>
        <button
          onclick={() => toggleGroup(group.label)}
          class="flex items-center gap-1.5 mb-2 text-sm font-medium text-foreground hover:opacity-80 transition-opacity"
        >
          <ChevronRight class="h-3.5 w-3.5 transition-transform {collapsed ? '' : 'rotate-90'}" />
          {group.label}
        </button>
        {#if !collapsed}
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {#each group.plants as plant (plant.plantId)}
              {@render plantCard(plant)}
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
{:else}
  <div class="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
    <Leaf class="h-10 w-10 text-muted-foreground/50" />
    <p class="mt-3 text-sm text-muted-foreground">No plants added yet</p>
    <a
      href="{resolve('/plants')}?addToGarden={garden.id}"
      class="mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      <Plus class="h-4 w-4" />
      Browse Plants
    </a>
  </div>
{/if}

<!-- Timeline / Table -->
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
        frostFreeStart={frostFreeStart}
        frostFreeEnd={frostFreeEnd}
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

