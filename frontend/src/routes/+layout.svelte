<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  import '../app.css';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Frostleaf</title>
</svelte:head>

<div class="min-h-screen flex flex-col">
  <header class="border-b">
    <nav class="container mx-auto flex h-14 items-center justify-between px-4">
      <a href="/" class="text-lg font-semibold tracking-tight">Frostleaf</a>
      <div class="flex gap-4 text-sm text-muted-foreground">
        <a href="/plants" class="hover:text-foreground transition-colors">Plants</a>
      </div>
    </nav>
  </header>

  <main class="container mx-auto flex-1 px-4 py-8">
    {@render children()}
  </main>

  <footer class="border-t py-4">
    <div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
      Frostleaf — Scientific garden planning for Norway
    </div>
  </footer>
</div>
