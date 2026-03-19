<script lang="ts">
  type Stage = {
    label: string;
    startMonth: number;
    endMonth: number;
    color: string;
  };

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

  const monthLabels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  function monthsToStages(months: number[], label: string, color: string): Stage[] {
    if (!months.length) return [];

    const sorted = [...months].sort((a, b) => a - b);
    const stages: Stage[] = [];
    let start = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] !== prev + 1) {
        stages.push({ label, startMonth: start, endMonth: prev, color });
        start = sorted[i];
      }
      prev = sorted[i];
    }
    stages.push({ label, startMonth: start, endMonth: prev, color });
    return stages;
  }

  type TimelineRow = { label: string; color: string; stages: Stage[] };

  let rows = $derived<TimelineRow[]>(
    [
      { label: 'Sowing', color: 'bg-amber-500', stages: monthsToStages(sowingMonths, 'Sowing', 'bg-amber-500') },
      { label: 'Growth', color: 'bg-emerald-500', stages: monthsToStages(growthMonths, 'Growth', 'bg-emerald-500') },
      { label: 'Bloom', color: 'bg-pink-400', stages: monthsToStages(bloomMonths, 'Bloom', 'bg-pink-400') },
      { label: 'Harvest', color: 'bg-orange-500', stages: monthsToStages(harvestMonths, 'Harvest', 'bg-orange-500') },
    ].filter((r) => r.stages.length > 0),
  );

  function monthToPercent(month: number): number {
    return ((month - 1) / 12) * 100;
  }

  function monthWidthPercent(start: number, end: number): number {
    return ((end - start + 1) / 12) * 100;
  }
</script>

{#if rows.length > 0}
  <div class="space-y-1">
    <!-- Month header -->
    <div class="flex">
      <div class="w-16 shrink-0"></div>
      <div class="flex flex-1">
        {#each monthLabels as label}
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
          <!-- Grid lines -->
          {#each Array(12) as _, i}
            <div class="absolute top-0 h-full w-px bg-border/30" style="left: {(i / 12) * 100}%"></div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Stage rows -->
    {#each rows as row}
      <div class="flex items-center">
        <div class="w-16 shrink-0 text-xs font-medium text-muted-foreground">{row.label}</div>
        <div class="relative flex-1 h-5">
          <div class="absolute inset-0 rounded-sm bg-muted/30"></div>
          <!-- Grid lines -->
          {#each Array(12) as _, i}
            <div class="absolute top-0 h-full w-px bg-border/30" style="left: {(i / 12) * 100}%"></div>
          {/each}
          <!-- Stage bars -->
          {#each row.stages as stage}
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
