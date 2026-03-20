<script lang="ts">
  import type { DailyClimateAverage } from '$lib/api/location';
  import { doyToPercent, dateToDoy } from '$lib/utils/timeline';

  type Props = {
    dailyAverages: DailyClimateAverage[];
    lastFrostSpring?: string | null;
    firstFrostAutumn?: string | null;
  };

  let { dailyAverages, lastFrostSpring = null, firstFrostAutumn = null }: Props = $props();

  // SVG uses viewBox 0-1000 wide, 0-height tall. X maps to DOY via doyToPercent.
  const vw = 1000;
  const vh = 200;
  const yPad = 5;
  const chartH = vh - yPad * 2;

  let tempMin = $derived(Math.floor(Math.min(...dailyAverages.map((d) => d.avgMin)) / 5) * 5);
  let tempMax = $derived(Math.ceil(Math.max(...dailyAverages.map((d) => d.avgMax)) / 5) * 5);
  let tempRange = $derived(tempMax - tempMin);

  function xFromDoy(doy: number): number {
    return (doyToPercent(doy) / 100) * vw;
  }

  function yFromTemp(temp: number): number {
    return yPad + chartH - ((temp - tempMin) / tempRange) * chartH;
  }

  function toPath(field: 'avgMin' | 'avgMax' | 'avgMean'): string {
    return dailyAverages.map((d, i) =>
      `${i === 0 ? 'M' : 'L'}${xFromDoy(d.dayOfYear).toFixed(1)},${yFromTemp(d[field]).toFixed(1)}`
    ).join('');
  }

  let areaPath = $derived(() => {
    const top = dailyAverages.map((d) =>
      `${xFromDoy(d.dayOfYear).toFixed(1)},${yFromTemp(d.avgMax).toFixed(1)}`
    ).join(' L');
    const bottom = [...dailyAverages].reverse().map((d) =>
      `${xFromDoy(d.dayOfYear).toFixed(1)},${yFromTemp(d.avgMin).toFixed(1)}`
    ).join(' L');
    return `M${top} L${bottom} Z`;
  });

  let meanPath = $derived(toPath('avgMean'));

  // Frost-free zone
  let frostStartX = $derived(lastFrostSpring ? xFromDoy(dateToDoy(lastFrostSpring)) : null);
  let frostEndX = $derived(firstFrostAutumn ? xFromDoy(dateToDoy(firstFrostAutumn)) : null);

  // Zero line
  let zeroY = $derived(yFromTemp(0));
  let zeroVisible = $derived(tempMin < 0 && tempMax > 0);

  // Y-axis ticks
  let yTicks = $derived(() => {
    const ticks: number[] = [];
    const step = tempRange <= 30 ? 5 : 10;
    for (let t = tempMin; t <= tempMax; t += step) {
      ticks.push(t);
    }
    return ticks;
  });

  // Month boundaries as x positions
  const monthStartDoy = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
</script>

<div class="flex items-stretch">
  <!-- Y-axis labels (aligned with w-32 in timeline) -->
  <div class="w-32 shrink-0 flex flex-col justify-between py-1 pr-1 text-right">
    {#each yTicks() as tick (tick)}
      <span class="text-[10px] text-muted-foreground leading-none">{tick}°</span>
    {/each}
  </div>

  <!-- Chart area (flex-1, same as timeline bar area) -->
  <div class="relative flex-1">
    <svg viewBox="0 0 {vw} {vh}" class="w-full h-full" preserveAspectRatio="none" style="min-height: 120px;">
      <!-- Frost risk zones -->
      {#if frostStartX != null && frostEndX != null}
        <rect
          x={0} y={0}
          width={frostStartX} height={vh}
          class="fill-blue-300/20 dark:fill-blue-700/15"
        />
        <rect
          x={frostEndX} y={0}
          width={vw - frostEndX} height={vh}
          class="fill-blue-300/20 dark:fill-blue-700/15"
        />
      {/if}

      <!-- Zero line -->
      {#if zeroVisible}
        <line
          x1={0} y1={zeroY} x2={vw} y2={zeroY}
          class="stroke-blue-400/50" stroke-dasharray="8 5" stroke-width="1" vector-effect="non-scaling-stroke"
        />
      {/if}

      <!-- Month grid lines -->
      {#each monthStartDoy as doy, i (i)}
        <line
          x1={xFromDoy(doy)} y1={0} x2={xFromDoy(doy)} y2={vh}
          class="stroke-border/20" stroke-width="1" vector-effect="non-scaling-stroke"
        />
      {/each}

      <!-- Min-Max range area -->
      <path d={areaPath()} class="fill-emerald-500/15 dark:fill-emerald-400/10" />

      <!-- Mean line -->
      <path d={meanPath} fill="none" class="stroke-emerald-600 dark:stroke-emerald-400" stroke-width="1.5" vector-effect="non-scaling-stroke" />
    </svg>
  </div>
</div>

<!-- Legend -->
<div class="flex items-center gap-4 mt-1 ml-32 text-[10px] text-muted-foreground">
  <span class="flex items-center gap-1">
    <span class="inline-block w-4 h-0.5 bg-emerald-600 dark:bg-emerald-400"></span> Avg mean
  </span>
  <span class="flex items-center gap-1">
    <span class="inline-block w-4 h-2.5 rounded-sm bg-emerald-500/15 dark:bg-emerald-400/10 border border-emerald-500/30"></span> Min–Max
  </span>
  {#if frostStartX != null}
    <span class="flex items-center gap-1">
      <span class="inline-block w-4 h-2.5 rounded-sm bg-blue-300/20 dark:bg-blue-700/15 border border-blue-300/40"></span> Frost risk
    </span>
  {/if}
</div>
