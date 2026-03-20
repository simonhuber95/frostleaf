<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import { gardenStore } from '$lib/stores/garden.svelte';
  import { locationStore } from '$lib/stores/location.svelte';
  import { getPlant, type Plant } from '$lib/api/plants';
  import { getViability, type ViabilityResult } from '$lib/api/viability';
  import { getLocationClimate, type LocationClimate } from '$lib/api/location';
  import { listDiaryEntries, addDiaryEntry, deleteDiaryEntry, type DiaryEntry } from '$lib/api/gardens';
  import { authStore } from '$lib/stores/auth.svelte';
  import TemperatureChart from '$lib/components/TemperatureChart.svelte';
  import GardenTimeline from '$lib/components/GardenTimeline.svelte';
  import GardenTable, { type GardenTablePlant } from '$lib/components/GardenTable.svelte';
  import type { GardenTimelinePlant } from '$lib/components/GardenTimeline.svelte';
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';
  import type { SowingChoice, LocalGardenPlant } from '@frostleaf/shared';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import Pencil from '@lucide/svelte/icons/pencil';
  import Check from '@lucide/svelte/icons/check';
  import X from '@lucide/svelte/icons/x';
  import Plus from '@lucide/svelte/icons/plus';
  import Leaf from '@lucide/svelte/icons/leaf';
  import Download from '@lucide/svelte/icons/download';
  import Upload from '@lucide/svelte/icons/upload';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import BookOpen from '@lucide/svelte/icons/book-open';
  import CalendarRange from '@lucide/svelte/icons/calendar-range';
  import Table from '@lucide/svelte/icons/table';

  let { data }: { data: { gardenId: string } } = $props();

  let garden = $derived(gardenStore.getGarden(data.gardenId));

  // Plant details for timeline/table
  let plantDetails = new SvelteMap<string, Plant>();
  let viabilityMap = new SvelteMap<string, ViabilityResult>();
  let climateData = $state<LocationClimate | null>(null);
  let loadingDetails = $state(false);

  // View mode
  let viewMode = $state<'timeline' | 'table'>('timeline');

  // Group by mode
  let groupBy = $state<'viability' | 'crop_group' | 'soil' | 'sowing' | 'light'>('viability');
  let collapsedGroups = new SvelteSet<string>();

  function toggleGroup(label: string) {
    if (collapsedGroups.has(label)) collapsedGroups.delete(label);
    else collapsedGroups.add(label);
  }

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

      plantDetails.clear();
      for (const plant of plantResults) {
        if (plant) plantDetails.set(plant.id, plant);
      }

      if (viabilityReport) {
        viabilityMap.clear();
        for (const v of viabilityReport.plants) {
          viabilityMap.set(v.plantId, v);
        }
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
          sowingChoice: effectiveSowingChoice(gp),
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
        sowingMethod: props?.sowingMethod ?? null,
        sowingMonths: props?.growthMonths?.slice(0, 2).join(', ') ?? '',
        daysToHarvest: props?.daysToHarvest ?? null,
        notes: gp.notes,
        plantedDate: gp.plantedDate,
      };
    }) ?? [],
  );

  /** Resolve effective sowing choice: user pick > default from plant data */
  function effectiveSowingChoice(plant: LocalGardenPlant): SowingChoice | null {
    if (plant.sowingChoice) return plant.sowingChoice;
    const method = plantDetails.get(plant.plantId)?.properties?.sowingMethod ?? null;
    if (method === 'indoor' || method === 'both') return 'indoor';
    if (method === 'direct') return 'direct';
    return null;
  }

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


  // Plant grouping
  type PlantGroup = { label: string; plants: LocalGardenPlant[] };

  function groupByViability(): PlantGroup[] {
    const sorted = [...(garden?.plants ?? [])].sort((a, b) =>
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

  function groupByCropGroup(): PlantGroup[] {
    const buckets = new SvelteMap<string, LocalGardenPlant[]>();
    for (const p of garden?.plants ?? []) {
      const group = plantDetails.get(p.plantId)?.cropGroup ?? 'unknown';
      const label = group.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      if (!buckets.has(label)) buckets.set(label, []);
      buckets.get(label)!.push(p);
    }
    return [...buckets.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, plants]) => ({ label: `${label} (${plants.length})`, plants }));
  }

  function groupBySoil(): PlantGroup[] {
    const buckets = new SvelteMap<string, LocalGardenPlant[]>();
    for (const p of garden?.plants ?? []) {
      const prefs = plantDetails.get(p.plantId)?.properties?.soilPreferences ?? [];
      const key = prefs.length > 0 ? prefs[0] : 'unknown';
      const label = key.replace(/\b\w/g, (c) => c.toUpperCase());
      if (!buckets.has(label)) buckets.set(label, []);
      buckets.get(label)!.push(p);
    }
    return [...buckets.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([label, plants]) => ({ label: `${label} (${plants.length})`, plants }));
  }

  function groupBySowing(): PlantGroup[] {
    const buckets = new SvelteMap<string, LocalGardenPlant[]>();
    const labels: Record<string, string> = { indoor: 'Indoor', direct: 'Direct', both: 'Indoor or Direct' };
    for (const p of garden?.plants ?? []) {
      const method = plantDetails.get(p.plantId)?.properties?.sowingMethod ?? 'unknown';
      const label = labels[method] ?? 'Unknown';
      if (!buckets.has(label)) buckets.set(label, []);
      buckets.get(label)!.push(p);
    }
    return [...buckets.entries()]
      .map(([label, plants]) => ({ label: `${label} (${plants.length})`, plants }));
  }

  function groupByLight(): PlantGroup[] {
    const buckets = new SvelteMap<string, LocalGardenPlant[]>();
    const labels: Record<string, string> = { full_sun: 'Full Sun', partial_shade: 'Partial Shade', full_shade: 'Full Shade' };
    for (const p of garden?.plants ?? []) {
      const light = plantDetails.get(p.plantId)?.properties?.lightRequirement ?? 'unknown';
      const label = labels[light] ?? 'Unknown';
      if (!buckets.has(label)) buckets.set(label, []);
      buckets.get(label)!.push(p);
    }
    return [...buckets.entries()]
      .map(([label, plants]) => ({ label: `${label} (${plants.length})`, plants }));
  }

  let plantGroups = $derived<PlantGroup[]>(
    groupBy === 'viability' ? groupByViability()
    : groupBy === 'crop_group' ? groupByCropGroup()
    : groupBy === 'soil' ? groupBySoil()
    : groupBy === 'sowing' ? groupBySowing()
    : groupByLight()
  );

  // Diary state
  let diaryEntries = $state<DiaryEntry[]>([]);
  let diaryOpen = $state(false);
  let diaryContent = $state('');
  let diaryPlantIds = $state<string[]>([]);
  let diaryLoading = $state(false);

  let serverGardenId = $state<string | null>(null);

  async function loadDiary() {
    if (!serverGardenId) return;
    try {
      diaryEntries = await listDiaryEntries(serverGardenId);
    } catch {
      // diary not available
    }
  }

  async function handleAddDiaryEntry() {
    if (!serverGardenId || !diaryContent.trim()) return;
    diaryLoading = true;
    try {
      await addDiaryEntry(serverGardenId, diaryContent.trim(), diaryPlantIds);
      diaryContent = '';
      diaryPlantIds = [];
      await loadDiary();
    } finally {
      diaryLoading = false;
    }
  }

  async function handleDeleteDiaryEntry(entryId: string) {
    if (!serverGardenId) return;
    await deleteDiaryEntry(serverGardenId, entryId);
    await loadDiary();
  }

  // Ensure garden exists on server + load diary on mount
  onMount(async () => {
    if (!garden || !authStore.isAuthenticated) return;
    serverGardenId = await gardenStore.ensureServerGarden(garden.id);
    if (serverGardenId) await loadDiary();
  });

  // Delete garden
  let confirmDelete = $state(false);

  function handleDelete() {
    if (!garden) return;
    gardenStore.deleteGarden(garden.id);
    goto(resolve('/garden'));
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
      goto(resolve('/garden'));
    } catch {
      alert('Could not read file');
    }
  }
</script>

{#if garden}
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <a href={resolve('/garden')} class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
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
      href="{resolve('/plants')}?addToGarden={garden.id}"
      class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      <Plus class="h-4 w-4" />
      Add Plants
    </a>

    <!-- Plant list -->
    {#snippet plantCard(plant: typeof garden.plants[0])}
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
        <!-- Sowing method control -->
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
      <!-- Group by selector -->
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

    <!-- Diary -->
    {#if authStore.isAuthenticated}
      <div class="rounded-lg border bg-card p-5 space-y-4">
        <button
          onclick={() => (diaryOpen = !diaryOpen)}
          class="flex items-center gap-2 text-lg font-semibold hover:opacity-80 transition-opacity w-full text-left"
        >
          <ChevronRight class="h-4 w-4 transition-transform {diaryOpen ? 'rotate-90' : ''}" />
          <BookOpen class="h-4 w-4" />
          Garden Diary
          {#if diaryEntries.length > 0}
            <span class="text-sm font-normal text-muted-foreground">({diaryEntries.length})</span>
          {/if}
        </button>

        {#if diaryOpen}
          <!-- Add entry form -->
          <form onsubmit={(e) => { e.preventDefault(); handleAddDiaryEntry(); }} class="space-y-3">
            <textarea
              bind:value={diaryContent}
              placeholder="What's happening in the garden today?"
              rows={2}
              class="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            ></textarea>

            <!-- Plant tag selector -->
            {#if garden.plants.length > 0}
              <div class="flex flex-wrap gap-1.5">
                {#each garden.plants as gp (gp.plantId)}
                  {@const selected = diaryPlantIds.includes(gp.plantId)}
                  <button
                    type="button"
                    onclick={() => {
                      if (selected) diaryPlantIds = diaryPlantIds.filter((id) => id !== gp.plantId);
                      else diaryPlantIds = [...diaryPlantIds, gp.plantId];
                    }}
                    class="rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors {selected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'}"
                  >
                    {gp.commonName}
                  </button>
                {/each}
              </div>
            {/if}

            <button
              type="submit"
              disabled={diaryLoading || !diaryContent.trim()}
              class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {diaryLoading ? 'Adding...' : 'Add Entry'}
            </button>
          </form>

          <!-- Entry list -->
          {#if diaryEntries.length > 0}
            <div class="space-y-3 border-t pt-3">
              {#each diaryEntries as entry (entry.id)}
                <div class="group relative rounded-md border p-3 space-y-1.5">
                  <div class="flex items-center gap-2 text-xs text-muted-foreground">
                    <time>{new Date(entry.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</time>
                    {#if entry.updatedAt !== entry.createdAt}
                      <span>(edited)</span>
                    {/if}
                  </div>
                  <p class="text-sm whitespace-pre-wrap">{entry.content}</p>
                  {#if entry.plantTags.length > 0}
                    <div class="flex flex-wrap gap-1">
                      {#each entry.plantTags as tag (tag.plantId)}
                        <span class="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{tag.commonName}</span>
                      {/each}
                    </div>
                  {/if}
                  <button
                    onclick={() => handleDeleteDiaryEntry(entry.id)}
                    class="absolute top-2 right-2 rounded-md p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                    title="Delete entry"
                  >
                    <X class="h-3.5 w-3.5" />
                  </button>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-sm text-muted-foreground">No diary entries yet. Start documenting your garden journey!</p>
          {/if}
        {/if}
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
    <a href={resolve('/garden')} class="mt-4 text-sm text-primary hover:underline">Back to gardens</a>
  </div>
{/if}
