<script lang="ts">
  import { monthLabels, monthsToStages, monthToPercent, monthWidthPercent, stageColors, type TimelineRow } from '$lib/utils/timeline';

  type Props = {
    sowingMonths?: number[];
    growthMonths?: number[];
    bloomMonths?: number[];
    harvestMonths?: number[];
    frostFreeStart?: number;
    frostFreeEnd?: number;
  };

  let {
    sowingMonths = [],
    growthMonths = [],
    bloomMonths = [],
    harvestMonths = [],
    frostFreeStart,
    frostFreeEnd,
  }: Props = $props();

  const gridLines = Array.from({ length: 12 }, (__, i) => i);

  let rows = $derived<TimelineRow[]>(
    [
      { label: 'Sowing', color: stageColors.Sowing, stages: monthsToStages(sowingMonths, 'Sowing', stageColors.Sowing) },
      { label: 'Growth', color: stageColors.Growth, stages: monthsToStages(growthMonths, 'Growth', stageColors.Growth) },
      { label: 'Bloom', color: stageColors.Bloom, stages: monthsToStages(bloomMonths, 'Bloom', stageColors.Bloom) },
      { label: 'Harvest', color: stageColors.Harvest, stages: monthsToStages(harvestMonths, 'Harvest', stageColors.Harvest) },
    ].filter((r) => r.stages.length > 0),
  );
</script>

{#if rows.length > 0}
  <div class="space-y-1">
    <!-- Month header -->
    <div class="flex">
      <div class="w-16 shrink-0"></div>
      <div class="flex flex-1">
        {#each monthLabels as label, i (i)}
          <div class="flex-1 text-center text-[10px] text-muted-foreground">{label}</div>
        {/each}
      </div>
    </div>

    <!-- Frost-free zone indicator -->
    {#if frostFreeStart && frostFreeEnd}
      <div class="flex items-center">
        <div class="w-16 shrink-0 text-[10px] text-muted-foreground">Frost-free</div>
        <div class="relative flex-1 h-3">
          <div class="absolute inset-0 rounded-sm bg-muted/50"></div>
          <div
            class="absolute top-0 h-full rounded-sm bg-sky-200/60 dark:bg-sky-800/40"
            style="left: {monthToPercent(frostFreeStart)}%; width: {monthWidthPercent(frostFreeStart, frostFreeEnd)}%;"
          ></div>
          {#each gridLines as gi (gi)}
            <div class="absolute top-0 h-full w-px bg-border/30" style="left: {(gi / 12) * 100}%"></div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Stage rows -->
    {#each rows as row (row.label)}
      <div class="flex items-center">
        <div class="w-16 shrink-0 text-xs font-medium text-muted-foreground">{row.label}</div>
        <div class="relative flex-1 h-5">
          <div class="absolute inset-0 rounded-sm bg-muted/30"></div>
          {#each gridLines as gi (gi)}
            <div class="absolute top-0 h-full w-px bg-border/30" style="left: {(gi / 12) * 100}%"></div>
          {/each}
          {#each row.stages as stage (stage.label)}
            <div
              class="absolute top-0.5 h-4 rounded-sm {stage.color} opacity-80"
              style="left: {monthToPercent(stage.startMonth)}%; width: {monthWidthPercent(stage.startMonth, stage.endMonth)}%;"
            ></div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
{/if}
