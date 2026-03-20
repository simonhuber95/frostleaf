<script lang="ts">
  import type { PlantTimeline } from '$lib/api/viability';
  import {
    monthLabels, stageColors, dateToDoy, doyToPercent, doyWidthPercent,
    monthBoundaryPercents, formatDate, type DayStage,
  } from '$lib/utils/timeline';

  export type GardenTimelinePlant = {
    plantId: string;
    commonName: string;
    timeline: PlantTimeline;
    sowingChoice: 'indoor' | 'direct' | null;
  };

  type Props = {
    plants: GardenTimelinePlant[];
    frostFreeStart?: string | null; // MM-DD
    frostFreeEnd?: string | null;   // MM-DD
  };

  let { plants, frostFreeStart, frostFreeEnd }: Props = $props();

  const boundaries = monthBoundaryPercents();

  let frostBars = $derived(
    frostFreeStart && frostFreeEnd
      ? {
          spring: { left: 0, width: doyToPercent(dateToDoy(frostFreeStart)) },
          autumn: { left: doyToPercent(dateToDoy(frostFreeEnd)), width: 100 - doyToPercent(dateToDoy(frostFreeEnd)) },
        }
      : null,
  );

  type PlantRow = {
    commonName: string;
    stages: DayStage[];
  };

  function makeStage(label: string, startDate: string, endDate: string, color: string): DayStage {
    return {
      label,
      startDoy: dateToDoy(startDate),
      endDoy: dateToDoy(endDate),
      color,
      tooltip: `${label}: ${formatDate(startDate)} – ${formatDate(endDate)}`,
    };
  }

  let rows = $derived<PlantRow[]>(
    plants.map((p) => {
      const t = p.timeline;
      const stages: DayStage[] = [];
      const choice = p.sowingChoice;

      // Sowing phase based on user's choice — dates are non-overlapping from backend
      if (choice === 'indoor' && t.indoorSowStart && t.indoorSowEnd && t.transplantDate) {
        stages.push(makeStage('Indoor Sow', t.indoorSowStart, t.indoorSowEnd, stageColors['Indoor Sow']));
      } else if (choice === 'direct' && t.directSowStart && t.directSowEnd) {
        stages.push(makeStage('Direct Sow', t.directSowStart, t.directSowEnd, stageColors['Direct Sow']));
      }

      // Growth — starts at transplant for indoor, at temp threshold for direct
      const growthStart = (choice === 'indoor' && t.transplantDate) ? t.transplantDate : t.growthStart;
      stages.push(makeStage('Growth', growthStart, t.growthEnd, stageColors.Growth));

      // Harvest phase
      stages.push(makeStage('Harvest', t.harvestStart, t.harvestEnd, stageColors.Harvest));

      return { commonName: p.commonName, stages };
    }).sort((a, b) => {
      const aGrowth = a.stages.find((s) => s.label === 'Growth');
      const bGrowth = b.stages.find((s) => s.label === 'Growth');
      return (aGrowth?.startDoy ?? 999) - (bGrowth?.startDoy ?? 999);
    }),
  );

  // Only show legend items that appear in at least one row
  let activeLegendLabels = $derived(new Set(rows.flatMap((r) => r.stages.map((s) => s.label))));

  const allLegendItems = [
    { label: 'Indoor Sow', color: stageColors['Indoor Sow'] },
    { label: 'Direct Sow', color: stageColors['Direct Sow'] },
    { label: 'Sowing', color: stageColors.Sowing },
    { label: 'Growth', color: stageColors.Growth },
    { label: 'Harvest', color: stageColors.Harvest },
  ];

  let legendItems = $derived(allLegendItems.filter((item) => activeLegendLabels.has(item.label)));
</script>

{#if rows.length > 0}
  <div class="space-y-1">
    <!-- Month header -->
    <div class="flex">
      <div class="w-32 shrink-0"></div>
      <div class="relative flex-1 h-4">
        {#each monthLabels as label, i (i)}
          <div
            class="absolute text-[10px] text-muted-foreground"
            style="left: {boundaries[i]}%; width: {(i < 11 ? boundaries[i + 1] : 100) - boundaries[i]}%;"
          >
            <span class="block text-center">{label}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Frost zone indicator -->
    {#if frostBars}
      <div class="flex items-center">
        <div class="w-32 shrink-0 text-[10px] text-muted-foreground truncate">Frost risk</div>
        <div class="relative flex-1 h-3">
          <div class="absolute inset-0 rounded-sm bg-muted/30"></div>
          <div
            class="absolute top-0 h-full rounded-r-sm bg-blue-300/40 dark:bg-blue-700/30"
            style="left: {frostBars.spring.left}%; width: {frostBars.spring.width}%;"
            title="Spring frost until {frostFreeStart ? formatDate(frostFreeStart) : ''}"
          ></div>
          <div
            class="absolute top-0 h-full rounded-l-sm bg-blue-300/40 dark:bg-blue-700/30"
            style="left: {frostBars.autumn.left}%; width: {frostBars.autumn.width}%;"
            title="Autumn frost from {frostFreeEnd ? formatDate(frostFreeEnd) : ''}"
          ></div>
          {#each boundaries as pct, bi (bi)}
            <div class="absolute top-0 h-full w-px bg-border/30" style="left: {pct}%"></div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Plant rows -->
    {#each rows as row (row.commonName)}
      <div class="flex items-center">
        <div class="w-32 shrink-0 text-xs font-medium text-foreground truncate pr-2" title={row.commonName}>
          {row.commonName}
        </div>
        <div class="relative flex-1 h-6">
          <div class="absolute inset-0 rounded-sm bg-muted/30"></div>
          {#each boundaries as pct, bi (bi)}
            <div class="absolute top-0 h-full w-px bg-border/30" style="left: {pct}%"></div>
          {/each}
          {#each row.stages as stage (stage.label)}
            <div
              class="absolute top-1 h-4 rounded-sm {stage.color} opacity-80"
              style="left: {doyToPercent(stage.startDoy)}%; width: {Math.max(doyWidthPercent(stage.startDoy, stage.endDoy), 0.4)}%;"
              title={stage.tooltip}
            ></div>
          {/each}
        </div>
      </div>
    {/each}

    <!-- Legend -->
    <div class="flex gap-4 pt-2">
      <div class="w-32 shrink-0"></div>
      {#each legendItems as item (item.label)}
        <div class="flex items-center gap-1.5">
          <div class="h-3 w-3 rounded-sm {item.color} opacity-80"></div>
          <span class="text-[10px] text-muted-foreground">{item.label}</span>
        </div>
      {/each}
    </div>
  </div>
{:else}
  <p class="text-sm text-muted-foreground">No timeline data available. Add plants with growing calendar info to see the timeline.</p>
{/if}
