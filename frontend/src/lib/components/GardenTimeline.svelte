<script lang="ts">
  import { monthLabels, monthsToStages, monthToPercent, monthWidthPercent, stageColors, type Stage } from '$lib/utils/timeline';

  export type GardenTimelinePlant = {
    plantId: string;
    commonName: string;
    sowingMonths: number[];
    growthMonths: number[];
    bloomMonths: number[];
    harvestMonths: number[];
  };

  type Props = {
    plants: GardenTimelinePlant[];
    frostFreeStart?: number;
    frostFreeEnd?: number;
  };

  let { plants, frostFreeStart, frostFreeEnd }: Props = $props();

  type PlantRow = {
    plantId: string;
    commonName: string;
    stages: Stage[];
  };

  let rows = $derived<PlantRow[]>(
    plants.map((p) => ({
      plantId: p.plantId,
      commonName: p.commonName,
      stages: [
        ...monthsToStages(p.sowingMonths, 'Sowing', stageColors.Sowing),
        ...monthsToStages(p.growthMonths, 'Growth', stageColors.Growth),
        ...monthsToStages(p.bloomMonths, 'Bloom', stageColors.Bloom),
        ...monthsToStages(p.harvestMonths, 'Harvest', stageColors.Harvest),
      ],
    })),
  );

  const legendItems = [
    { label: 'Sowing', color: stageColors.Sowing },
    { label: 'Growth', color: stageColors.Growth },
    { label: 'Bloom', color: stageColors.Bloom },
    { label: 'Harvest', color: stageColors.Harvest },
  ];
</script>

{#if rows.length > 0}
  <div class="space-y-1">
    <!-- Month header -->
    <div class="flex">
      <div class="w-32 shrink-0"></div>
      <div class="flex flex-1">
        {#each monthLabels as label}
          <div class="flex-1 text-center text-[10px] text-muted-foreground">{label}</div>
        {/each}
      </div>
    </div>

    <!-- Frost-free zone indicator -->
    {#if frostFreeStart && frostFreeEnd}
      <div class="flex items-center">
        <div class="w-32 shrink-0 text-[10px] text-muted-foreground truncate">Frost-free</div>
        <div class="relative flex-1 h-3">
          <div class="absolute inset-0 rounded-sm bg-muted/50"></div>
          <div
            class="absolute top-0 h-full rounded-sm bg-sky-200/60 dark:bg-sky-800/40"
            style="left: {monthToPercent(frostFreeStart)}%; width: {monthWidthPercent(frostFreeStart, frostFreeEnd)}%;"
          ></div>
          {#each Array(12) as _, i}
            <div class="absolute top-0 h-full w-px bg-border/30" style="left: {(i / 12) * 100}%"></div>
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
          {#each Array(12) as _, i}
            <div class="absolute top-0 h-full w-px bg-border/30" style="left: {(i / 12) * 100}%"></div>
          {/each}
          {#each row.stages as stage}
            <div
              class="absolute top-1 h-4 rounded-sm {stage.color} opacity-80"
              style="left: {monthToPercent(stage.startMonth)}%; width: {monthWidthPercent(stage.startMonth, stage.endMonth)}%;"
              title="{stage.label}: month {stage.startMonth}–{stage.endMonth}"
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
