<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { gardenStore } from '$lib/stores/garden.svelte';
  import { locationStore } from '$lib/stores/location.svelte';
  import { deleteGarden as deleteServerGarden } from '$lib/api/gardens';
  import type { LocalGarden } from '@frostleaf/shared';
  import Pencil from '@lucide/svelte/icons/pencil';
  import Download from '@lucide/svelte/icons/download';
  import Upload from '@lucide/svelte/icons/upload';
  import Trash2 from '@lucide/svelte/icons/trash-2';

  type Props = {
    garden: LocalGarden;
  };

  let { garden }: Props = $props();

  // Rename
  let editingName = $state(false);
  let editNameValue = $state('');

  function startEditName() {
    editNameValue = garden.name;
    editingName = true;
  }

  function saveName() {
    if (!editNameValue.trim()) return;
    gardenStore.updateGarden(garden.id, { name: editNameValue.trim() });
    editingName = false;
  }

  // Export
  function handleExport() {
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

  // Delete
  let confirmDelete = $state(false);

  async function handleDelete() {
    // Delete from server (ignore errors — may not exist on server)
    try { await deleteServerGarden(garden.id); } catch { /* local-only garden */ }
    gardenStore.deleteGarden(garden.id);
    goto(resolve('/garden'));
  }
</script>

<div class="space-y-6 max-w-lg">
  <!-- Rename -->
  <div class="rounded-lg border bg-card p-5 space-y-3">
    <h2 class="text-sm font-semibold">Garden Name</h2>
    {#if editingName}
      <div class="flex items-center gap-2">
        <input
          bind:value={editNameValue}
          type="text"
          class="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          onkeydown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') editingName = false; }}
        />
        <button onclick={saveName} class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90">Save</button>
        <button onclick={() => (editingName = false)} class="rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-accent">Cancel</button>
      </div>
    {:else}
      <div class="flex items-center gap-3">
        <span class="text-sm">{garden.name}</span>
        <button onclick={startEditName} class="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-accent">
          <Pencil class="h-3.5 w-3.5" />
          Rename
        </button>
      </div>
    {/if}
  </div>

  <!-- Export / Import -->
  <div class="rounded-lg border bg-card p-5 space-y-3">
    <h2 class="text-sm font-semibold">Import & Export</h2>
    <p class="text-xs text-muted-foreground">Export your garden as JSON or import from a previously exported file.</p>
    <div class="flex items-center gap-2">
      <button
        onclick={handleExport}
        class="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-accent"
      >
        <Download class="h-3.5 w-3.5" />
        Export JSON
      </button>
      <input type="file" accept=".json" class="hidden" bind:this={fileInput} onchange={handleImport} />
      <button
        onclick={() => fileInput?.click()}
        class="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-accent"
      >
        <Upload class="h-3.5 w-3.5" />
        Import JSON
      </button>
    </div>
  </div>

  <!-- Info -->
  <div class="rounded-lg border bg-card p-5 space-y-2">
    <h2 class="text-sm font-semibold">Details</h2>
    <div class="text-sm text-muted-foreground space-y-1">
      <p>Created: {new Date(garden.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p>Plants: {garden.plants.length}</p>
    </div>
  </div>

  <!-- Danger zone -->
  <div class="rounded-lg border border-destructive/20 p-5 space-y-3">
    <h2 class="text-sm font-semibold text-destructive">Danger Zone</h2>
    {#if confirmDelete}
      <div class="flex items-center gap-2">
        <p class="text-sm">Are you sure? This cannot be undone.</p>
        <button onclick={handleDelete} class="rounded-md bg-destructive px-3 py-1.5 text-sm text-destructive-foreground hover:bg-destructive/90">Delete</button>
        <button onclick={() => (confirmDelete = false)} class="rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-accent">Cancel</button>
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
