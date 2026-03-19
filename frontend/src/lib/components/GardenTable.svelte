<script lang="ts">
  import { downloadCsv } from '$lib/utils/csv-export';
  import Download from '@lucide/svelte/icons/download';

  export type GardenTablePlant = {
    commonName: string;
    cropGroup: string;
    sowingMonths: string;
    daysToHarvest: number | null;
    notes: string;
    plantedDate: string | null;
  };

  type Props = {
    gardenName: string;
    plants: GardenTablePlant[];
  };

  let { gardenName, plants }: Props = $props();

  function handleExportCsv() {
    const rows = plants.map((p) => ({
      'Plant Name': p.commonName,
      'Crop Group': p.cropGroup,
      'Sowing Months': p.sowingMonths,
      'Days to Harvest': p.daysToHarvest,
      Notes: p.notes,
      'Planted Date': p.plantedDate,
    }));
    downloadCsv(`frostleaf-${gardenName.toLowerCase().replace(/\s+/g, '-')}`, rows);
  }
</script>

<div class="space-y-3">
  <div class="flex items-center justify-between">
    <h3 class="text-sm font-medium text-muted-foreground">{plants.length} plant{plants.length !== 1 ? 's' : ''}</h3>
    <button
      onclick={handleExportCsv}
      class="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-accent"
    >
      <Download class="h-3.5 w-3.5" />
      Download CSV
    </button>
  </div>

  <div class="overflow-x-auto rounded-lg border">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b bg-muted/50">
          <th class="px-3 py-2 text-left font-medium">Plant</th>
          <th class="px-3 py-2 text-left font-medium">Group</th>
          <th class="px-3 py-2 text-left font-medium">Sowing</th>
          <th class="px-3 py-2 text-left font-medium">Harvest</th>
          <th class="px-3 py-2 text-left font-medium">Notes</th>
          <th class="px-3 py-2 text-left font-medium">Planted</th>
        </tr>
      </thead>
      <tbody>
        {#each plants as plant}
          <tr class="border-b last:border-0 hover:bg-muted/30">
            <td class="px-3 py-2 font-medium">{plant.commonName}</td>
            <td class="px-3 py-2 text-muted-foreground">{plant.cropGroup}</td>
            <td class="px-3 py-2 text-muted-foreground">{plant.sowingMonths || '—'}</td>
            <td class="px-3 py-2 text-muted-foreground">{plant.daysToHarvest ?? '—'}{plant.daysToHarvest ? 'd' : ''}</td>
            <td class="px-3 py-2 text-muted-foreground max-w-48 truncate">{plant.notes || '—'}</td>
            <td class="px-3 py-2 text-muted-foreground">{plant.plantedDate || '—'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
