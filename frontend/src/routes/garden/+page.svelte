<script lang="ts">
  import { gardenStore } from '$lib/stores/garden.svelte';
  import { locationStore } from '$lib/stores/location.svelte';
  import Plus from '@lucide/svelte/icons/plus';
  import Sprout from '@lucide/svelte/icons/sprout';
  import Leaf from '@lucide/svelte/icons/leaf';
  import MapPin from '@lucide/svelte/icons/map-pin';

  let showForm = $state(false);
  let gardenName = $state('');
  let error = $state('');

  function handleCreate() {
    const name = gardenName.trim();
    if (!name) {
      error = 'Give your garden a name';
      return;
    }

    const loc = locationStore.current;
    if (!loc) {
      error = 'Set a location first (go to the home page)';
      return;
    }

    gardenStore.createGarden(name, loc.locationId, 0, 0);
    gardenName = '';
    showForm = false;
    error = '';
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">My Gardens</h1>
      <p class="mt-1 text-muted-foreground">Manage your virtual gardens</p>
    </div>
    <button
      onclick={() => (showForm = !showForm)}
      class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      <Plus class="h-4 w-4" />
      New Garden
    </button>
  </div>

  <!-- Create form -->
  {#if showForm}
    <form onsubmit={handleCreate} class="rounded-lg border bg-card p-5 space-y-4">
      <h2 class="text-lg font-semibold">Create a new garden</h2>
      <div>
        <label for="garden-name" class="block text-sm font-medium mb-1">Garden name</label>
        <input
          id="garden-name"
          bind:value={gardenName}
          type="text"
          placeholder="e.g. Backyard veggie patch"
          class="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      {#if locationStore.current}
        <p class="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin class="h-3.5 w-3.5" />
          Location: {locationStore.current.displayName}
        </p>
      {:else}
        <p class="text-sm text-destructive">No location set. Go to the home page to set one first.</p>
      {/if}
      {#if error}
        <p class="text-sm text-destructive">{error}</p>
      {/if}
      <div class="flex gap-2">
        <button
          type="submit"
          class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Create
        </button>
        <button
          type="button"
          onclick={() => { showForm = false; error = ''; }}
          class="rounded-md bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  {/if}

  <!-- Garden list -->
  {#if gardenStore.gardens.length > 0}
    <div class="grid gap-3">
      {#each gardenStore.gardens as garden (garden.id)}
        <a
          href="/garden/{garden.id}"
          class="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
        >
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
              <Sprout class="h-6 w-6 text-primary" />
            </div>
            <div>
              <p class="font-medium">{garden.name}</p>
              <p class="text-sm text-muted-foreground">
                {garden.plants.length} plant{garden.plants.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div class="text-sm text-muted-foreground">
            {new Date(garden.createdAt).toLocaleDateString()}
          </div>
        </a>
      {/each}
    </div>
  {:else if !showForm}
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <Leaf class="h-12 w-12 text-muted-foreground/50" />
      <h2 class="mt-4 text-lg font-semibold">No gardens yet</h2>
      <p class="mt-1 text-sm text-muted-foreground">Create your first garden to start planning what to grow.</p>
      <button
        onclick={() => (showForm = true)}
        class="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <Plus class="h-4 w-4" />
        Create Garden
      </button>
    </div>
  {/if}
</div>
