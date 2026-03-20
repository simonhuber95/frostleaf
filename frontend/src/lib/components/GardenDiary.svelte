<script lang="ts">
  import { listDiaryEntries, addDiaryEntry, deleteDiaryEntry, type DiaryEntry } from '$lib/api/gardens';
  import type { LocalGardenPlant } from '@frostleaf/shared';
  import { onMount } from 'svelte';
  import X from '@lucide/svelte/icons/x';
  import Plus from '@lucide/svelte/icons/plus';
  import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';

  type Props = {
    serverGardenId: string;
    plants: LocalGardenPlant[];
  };

  let { serverGardenId, plants }: Props = $props();

  let entries = $state<DiaryEntry[]>([]);
  let content = $state('');
  let selectedPlantIds = $state<string[]>([]);
  let loading = $state(false);

  // Sorting & filtering
  let sortOrder = $state<'newest' | 'oldest'>('newest');
  let filterPlantId = $state<string | null>(null);

  let filteredEntries = $derived(() => {
    let result = entries;
    if (filterPlantId) {
      result = result.filter((e) => e.plantTags.some((t) => t.plantId === filterPlantId));
    }
    if (sortOrder === 'oldest') {
      return [...result].reverse();
    }
    return result;
  });

  // All plants that appear in any diary entry (for filter dropdown)
  let taggedPlants = $derived(() => {
    const seen: Record<string, string> = {};
    for (const e of entries) {
      for (const t of e.plantTags) {
        seen[t.plantId] = t.commonName;
      }
    }
    return Object.entries(seen).map(([id, name]) => ({ plantId: id, commonName: name })).sort((a, b) => a.commonName.localeCompare(b.commonName));
  });

  async function loadEntries() {
    try {
      entries = await listDiaryEntries(serverGardenId);
    } catch {
      // diary not available
    }
  }

  async function handleAdd() {
    if (!content.trim()) return;
    loading = true;
    try {
      await addDiaryEntry(serverGardenId, content.trim(), selectedPlantIds);
      content = '';
      selectedPlantIds = [];
      await loadEntries();
    } finally {
      loading = false;
    }
  }

  async function handleDelete(entryId: string) {
    await deleteDiaryEntry(serverGardenId, entryId);
    await loadEntries();
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  onMount(loadEntries);
</script>

<div class="space-y-5 max-w-2xl mx-auto">
  <!-- Add entry form -->
  <form onsubmit={(e) => { e.preventDefault(); handleAdd(); }} class="rounded-lg border bg-card p-4 space-y-3">
    <textarea
      bind:value={content}
      placeholder="What's happening in the garden today?"
      rows={2}
      class="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
    ></textarea>

    {#if plants.length > 0}
      <div>
        <p class="text-xs text-muted-foreground mb-1.5">Tag plants</p>
        <div class="flex flex-wrap gap-1.5">
          {#each plants as gp (gp.plantId)}
            {@const selected = selectedPlantIds.includes(gp.plantId)}
            <button
              type="button"
              onclick={() => {
                if (selected) selectedPlantIds = selectedPlantIds.filter((id) => id !== gp.plantId);
                else selectedPlantIds = [...selectedPlantIds, gp.plantId];
              }}
              class="rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors {selected
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'}"
            >
              {gp.commonName}
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <button
      type="submit"
      disabled={loading || !content.trim()}
      class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
    >
      <Plus class="h-4 w-4" />
      {loading ? 'Adding...' : 'Add Entry'}
    </button>
  </form>

  <!-- Filters & sort -->
  {#if entries.length > 0}
    <div class="flex items-center gap-3 flex-wrap">
      <button
        onclick={() => (sortOrder = sortOrder === 'newest' ? 'oldest' : 'newest')}
        class="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowUpDown class="h-3 w-3" />
        {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
      </button>

      {#if taggedPlants().length > 0}
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-xs text-muted-foreground">Filter:</span>
          <button
            onclick={() => (filterPlantId = null)}
            class="rounded-full px-2 py-0.5 text-xs font-medium transition-colors {filterPlantId === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'}"
          >
            All
          </button>
          {#each taggedPlants() as tp (tp.plantId)}
            <button
              onclick={() => (filterPlantId = filterPlantId === tp.plantId ? null : tp.plantId)}
              class="rounded-full px-2 py-0.5 text-xs font-medium transition-colors {filterPlantId === tp.plantId
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'}"
            >
              {tp.commonName}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Timeline entries -->
  {#if filteredEntries().length > 0}
    <div class="relative pl-6 border-l-2 border-border space-y-0">
      {#each filteredEntries() as entry (entry.id)}
        <div class="group relative pb-6 last:pb-0">
          <!-- Timeline dot -->
          <div class="absolute -left-6.25 top-0 h-3 w-3 rounded-full border-2 border-border bg-background"></div>

          <!-- Date label -->
          <div class="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <time class="font-medium">{formatDate(entry.createdAt)}</time>
            <span>{formatTime(entry.createdAt)}</span>
            {#if entry.updatedAt !== entry.createdAt}
              <span class="italic">(edited)</span>
            {/if}
          </div>

          <!-- Content -->
          <div class="group/entry relative rounded-md border bg-card p-3 space-y-1.5">
            <p class="text-sm whitespace-pre-wrap">{entry.content}</p>
            {#if entry.plantTags.length > 0}
              <div class="flex flex-wrap gap-1">
                {#each entry.plantTags as tag (tag.plantId)}
                  <button
                    onclick={() => (filterPlantId = filterPlantId === tag.plantId ? null : tag.plantId)}
                    class="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    {tag.commonName}
                  </button>
                {/each}
              </div>
            {/if}
            <button
              onclick={() => handleDelete(entry.id)}
              class="absolute top-2 right-2 rounded-md p-1 text-muted-foreground opacity-0 group-hover/entry:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
              title="Delete entry"
            >
              <X class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {:else if entries.length > 0}
    <p class="text-sm text-muted-foreground">No entries match this filter.</p>
  {:else}
    <p class="text-sm text-muted-foreground">No diary entries yet. Start documenting your garden journey!</p>
  {/if}
</div>
