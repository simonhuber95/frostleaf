<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { gardenStore } from '$lib/stores/garden.svelte';
  import { locationStore } from '$lib/stores/location.svelte';
  import { getPlant, type Plant } from '$lib/api/plants';
  import { getViability, type ViabilityResult } from '$lib/api/viability';
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
  let loadingDetails = $state(false);

  // View mode
  let viewMode = $state<'timeline' | 'table'>('timeline');

  // Fetch plant details + viability data for timeline/table
  onMount(async () => {
    if (!garden || garden.plants.length === 0) return;
    loadingDetails = true;
    try {
      // Fetch plant details and viability in parallel
      const [plantResults, viabilityReport] = await Promise.all([
        Promise.all(garden.plants.map((p) => getPlant(p.plantId).catch(() => null))),
        locationStore.current?.locationId
          ? getViability(locationStore.current.locationId).catch(() => null)
          : null,
      ]);

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

  // Editing plant notes
  let editingPlantId = $state<string | null>(null);
  let editNotesValue = $state('');

  function startEditNotes(plantId: string, currentNotes: string) {
    editingPlantId = plantId;
    editNotesValue = currentNotes;
  }

  function saveNotes() {
    if (!garden || !editingPlantId) return;
    gardenStore.updatePlant(garden.id, editingPlantId, { notes: editNotesValue });
    editingPlantId = null;
  }

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
    {#if garden.plants.length > 0}
      <div class="grid gap-3">
        {#each garden.plants as plant (plant.id)}
          <div class="flex items-start justify-between rounded-lg border p-4">
            <div class="flex items-start gap-4 flex-1 min-w-0">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Leaf class="h-5 w-5 text-primary" />
              </div>
              <div class="flex-1 min-w-0">
                <a href="/plants/{plant.plantId}" class="font-medium hover:underline">{plant.commonName}</a>
                {#if editingPlantId === plant.plantId}
                  <div class="mt-1 flex items-center gap-2">
                    <input
                      bind:value={editNotesValue}
                      type="text"
                      placeholder="Add a note..."
                      class="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                      onkeydown={(e) => { if (e.key === 'Enter') saveNotes(); if (e.key === 'Escape') editingPlantId = null; }}
                    />
                    <button onclick={saveNotes} class="text-primary"><Check class="h-4 w-4" /></button>
                    <button onclick={() => (editingPlantId = null)} class="text-muted-foreground"><X class="h-4 w-4" /></button>
                  </div>
                {:else}
                  <button
                    onclick={() => startEditNotes(plant.plantId, plant.notes)}
                    class="mt-0.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {plant.notes || 'Add note...'}
                  </button>
                {/if}
              </div>
            </div>
            <button
              onclick={() => gardenStore.removePlant(garden.id, plant.plantId)}
              class="ml-2 shrink-0 text-muted-foreground hover:text-destructive transition-colors"
              title="Remove plant"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        {/each}
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
