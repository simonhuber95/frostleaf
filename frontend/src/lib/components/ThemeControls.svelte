<script lang="ts">
  import { theme } from '$lib/stores/theme.svelte';
  import Sun from '@lucide/svelte/icons/sun';
  import Moon from '@lucide/svelte/icons/moon';
</script>

<button
  onclick={() => theme.toggleMode()}
  class="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
  aria-label="Toggle theme"
>
  {#if theme.mode === 'light'}
    <Sun class="h-4 w-4" />
  {:else}
    <Moon class="h-4 w-4" />
  {/if}
</button>
