<script lang="ts">
  import { listDiaryEntries, addDiaryEntry, deleteDiaryEntry, type DiaryEntry } from '$lib/api/gardens';
  import type { LocalGardenPlant } from '@frostleaf/shared';
  import { onMount } from 'svelte';
  import X from '@lucide/svelte/icons/x';

  type Props = {
    serverGardenId: string;
    plants: LocalGardenPlant[];
  };

  let { serverGardenId, plants }: Props = $props();

  let entries = $state<DiaryEntry[]>([]);
  let content = $state('');
  let selectedPlantIds = $state<string[]>([]);
  let loading = $state(false);

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

  onMount(loadEntries);
</script>

<div class="space-y-5">
  <!-- Add entry form -->
  <form onsubmit={(e) => { e.preventDefault(); handleAdd(); }} class="space-y-3">
    <textarea
      bind:value={content}
      placeholder="What's happening in the garden today?"
      rows={3}
      class="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
    ></textarea>

    <!-- Plant tag selector -->
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
      class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
    >
      {loading ? 'Adding...' : 'Add Entry'}
    </button>
  </form>

  <!-- Entry list -->
  {#if entries.length > 0}
    <div class="space-y-3">
      {#each entries as entry (entry.id)}
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
            onclick={() => handleDelete(entry.id)}
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
</div>
