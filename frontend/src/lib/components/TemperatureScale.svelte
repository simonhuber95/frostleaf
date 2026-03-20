<script lang="ts">
  type Props = {
    baseTemperature: number | null;
    maxTemperature: number | null;
    minTemperature?: number | null;
    scaleMin?: number;
    scaleMax?: number;
  };

  let { baseTemperature = null, maxTemperature = null, minTemperature = null, scaleMin = -5, scaleMax = 45 }: Props = $props();

  const range = $derived(scaleMax - scaleMin);

  function toPercent(temp: number): number {
    return Math.max(0, Math.min(100, ((temp - scaleMin) / range) * 100));
  }

  let survivalStart = $derived(minTemperature != null ? toPercent(minTemperature) : null);
  let growthStart = $derived(baseTemperature != null ? toPercent(baseTemperature) : null);
  let growthEnd = $derived(maxTemperature != null ? toPercent(maxTemperature) : null);

  const gradientStops = 'linear-gradient(to right, #3b82f6, #06b6d4, #22c55e, #eab308, #ef4444)';

  let ticks = $derived(
    Array.from({ length: Math.floor((scaleMax - scaleMin) / 10) + 1 }, (_, i) => scaleMin + i * 10),
  );
</script>

<div class="space-y-2">
  <div class="relative h-4">
    <div class="absolute inset-x-0 h-4 rounded-full opacity-30" style="background: {gradientStops}"></div>

    <!-- Survival zone: min → base (faded) -->
    {#if survivalStart != null && growthStart != null && survivalStart < growthStart}
      <div
        class="absolute h-4 rounded-l-full bg-blue-400/30 border border-blue-400/40"
        style="left: {survivalStart}%; width: {growthStart - survivalStart}%;"
      ></div>
    {/if}

    <!-- Growth zone: base → max (bright) -->
    {#if growthStart != null && growthEnd != null}
      <div
        class="absolute h-4 rounded-r-full border-2 border-green-600/50"
        style="left: {growthStart}%; width: {growthEnd - growthStart}%; background: {gradientStops}; background-size: {100 / ((growthEnd - growthStart) / 100)}% 100%; background-position: {growthStart}% 0;"
      >
        <div class="absolute inset-0 rounded-full bg-green-500/20"></div>
      </div>
    {/if}
  </div>

  <div class="relative h-5">
    {#each ticks as tick (tick)}
      <div class="absolute flex flex-col items-center" style="left: {toPercent(tick)}%; transform: translateX(-50%);">
        <div class="h-1.5 w-px bg-muted-foreground/40"></div>
        <span class="text-[9px] text-muted-foreground">{tick}°</span>
      </div>
    {/each}
  </div>

  <div class="flex gap-4 text-xs text-muted-foreground">
    {#if minTemperature != null}
      <span><span class="font-medium text-blue-400">Min:</span> {minTemperature}°C</span>
    {/if}
    {#if baseTemperature != null}
      <span><span class="font-medium text-emerald-600">Base:</span> {baseTemperature}°C</span>
    {/if}
    {#if maxTemperature != null}
      <span><span class="font-medium text-red-500">Max:</span> {maxTemperature}°C</span>
    {/if}
  </div>
</div>
