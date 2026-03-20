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

  let zoneStart = $derived(baseTemperature != null ? toPercent(baseTemperature) : null);
  let zoneEnd = $derived(maxTemperature != null ? toPercent(maxTemperature) : null);

  const gradientStops = 'linear-gradient(to right, #3b82f6, #06b6d4, #22c55e, #eab308, #ef4444)';

  let ticks = $derived(
    Array.from({ length: Math.floor((scaleMax - scaleMin) / 10) + 1 }, (_, i) => scaleMin + i * 10),
  );
</script>

<div class="space-y-2">
  <div class="relative h-10">
    <div class="absolute inset-x-0 top-3 h-4 rounded-full opacity-30" style="background: {gradientStops}"></div>

    {#if zoneStart != null && zoneEnd != null}
      <div
        class="absolute top-3 h-4 rounded-full border-2 border-green-600/50"
        style="left: {zoneStart}%; width: {zoneEnd - zoneStart}%; background: {gradientStops}; background-size: {100 / ((zoneEnd - zoneStart) / 100)}% 100%; background-position: {zoneStart}% 0;"
      >
        <div class="absolute inset-0 rounded-full bg-green-500/20"></div>
      </div>
    {/if}

    {#if minTemperature != null}
      <div class="absolute top-0 flex flex-col items-center" style="left: {toPercent(minTemperature)}%; transform: translateX(-50%);">
        <div class="text-[10px] font-semibold text-blue-500">Min</div>
        <div class="h-7 w-0.5 bg-blue-500"></div>
      </div>
    {/if}

    {#if baseTemperature != null}
      <div class="absolute top-0 flex flex-col items-center" style="left: {toPercent(baseTemperature)}%; transform: translateX(-50%);">
        <div class="text-[10px] font-semibold text-emerald-600">Base</div>
        <div class="h-7 w-0.5 bg-emerald-600"></div>
      </div>
    {/if}

    {#if maxTemperature != null}
      <div class="absolute top-0 flex flex-col items-center" style="left: {toPercent(maxTemperature)}%; transform: translateX(-50%);">
        <div class="text-[10px] font-semibold text-red-500">Max</div>
        <div class="h-7 w-0.5 bg-red-500"></div>
      </div>
    {/if}
  </div>

  <div class="relative h-5">
    {#each ticks as tick}
      <div class="absolute flex flex-col items-center" style="left: {toPercent(tick)}%; transform: translateX(-50%);">
        <div class="h-1.5 w-px bg-muted-foreground/40"></div>
        <span class="text-[9px] text-muted-foreground">{tick}°</span>
      </div>
    {/each}
  </div>

  <div class="flex gap-4 text-xs text-muted-foreground">
    {#if minTemperature != null}
      <span><span class="font-medium text-blue-500">Min Temperature:</span> {minTemperature}°C</span>
    {/if}
    {#if baseTemperature != null}
      <span><span class="font-medium text-emerald-600">Base Temperature:</span> {baseTemperature}°C</span>
    {/if}
    {#if maxTemperature != null}
      <span><span class="font-medium text-red-500">Max Temperature:</span> {maxTemperature}°C</span>
    {/if}
  </div>
</div>
