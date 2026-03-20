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
  };

  type Props = {
    plants: GardenTimelinePlant[];
    frostFreeStart?: string | null; // MM-DD
    frostFreeEnd?: string | null;   // MM-DD
  };

  let { plants, frostFreeStart, frostFreeEnd }: Props = $props();

  const boundaries = monthBoundaryPercents();

  let frostBar = $derived(
    frostFreeStart && frostFreeEnd
      ? {
          left: doyToPercent(dateToDoy(frostFreeStart)),
          width: doyWidthPercent(dateToDoy(frostFreeStart), dateToDoy(frostFreeEnd)),
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

      // Sowing phase
      stages.push(makeStage('Sowing', t.sowingStart, t.sowingEnd, stageColors.Sowing));

      // Growth phase
      stages.push(makeStage('Growth', t.growthStart, t.growthEnd, stageColors.Growth));

      // Harvest phase
      stages.push(makeStage('Harvest', t.harvestStart, t.harvestEnd, stageColors.Harvest));

      return { commonName: p.commonName, stages };
    }),
  );

  const legendItems = [
    { label: 'Sowing', color: stageColors.Sowing },
    { label: 'Growth', color: stageColors.Growth },
    { label: 'Harvest', color: stageColors.Harvest },
  ];
</script>

{#if rows.length > 0}
  <div class="space-y-1">
    <!-- Month header -->
    <div class="flex">
      <div class="w-32 shrink-0"></div>
      <div class="relative flex-1 h-4">
        {#each monthLabels as label, i}
          <div
            class="absolute text-[10px] text-muted-foreground"
            style="left: {boundaries[i]}%; width: {(i < 11 ? boundaries[i + 1] : 100) - boundaries[i]}%;"
          >
            <span class="block text-center">{label}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Frost-free zone indicator -->
    {#if frostBar}
      <div class="flex items-center">
        <div class="w-32 shrink-0 text-[10px] text-muted-foreground truncate">Frost-free</div>
        <div class="relative flex-1 h-3">
          <div class="absolute inset-0 rounded-sm bg-muted/50"></div>
          <div
            class="absolute top-0 h-full rounded-sm bg-sky-200/60 dark:bg-sky-800/40"
            style="left: {frostBar.left}%; width: {frostBar.width}%;"
            title="Frost-free: {frostFreeStart ? formatDate(frostFreeStart) : ''} – {frostFreeEnd ? formatDate(frostFreeEnd) : ''}"
          ></div>
          {#each boundaries as pct}
            <div class="absolute top-0 h-full w-px bg-border/30" style="left: {pct}%"></div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Plant rows -->
    {#each rows as row}
      <div class="flex items-center">
        <div class="w-32 shrink-0 text-xs font-medium text-foreground truncate pr-2" title={row.commonName}>
          {row.commonName}
        </div>
        <div class="relative flex-1 h-6">
          <div class="absolute inset-0 rounded-sm bg-muted/30"></div>
          {#each boundaries as pct}
            <div class="absolute top-0 h-full w-px bg-border/30" style="left: {pct}%"></div>
          {/each}
          {#each row.stages as stage}
            <div
              class="absolute top-1 h-4 rounded-sm {stage.color} opacity-80"
              style="left: {doyToPercent(stage.startDoy)}%; width: {doyWidthPercent(stage.startDoy, stage.endDoy)}%;"
              title={stage.tooltip}
            ></div>
          {/each}
        </div>
      </div>
    {/each}

    <!-- Legend -->
    <div class="flex gap-4 pt-2">
      <div class="w-32 shrink-0"></div>
      {#each legendItems as item}
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
