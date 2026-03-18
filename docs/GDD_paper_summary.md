# GDD Paper Summary — Key Findings for Frostleaf

**Source:** Paredes et al. (2025). "Estimating the lengths of crop growth stages to define the crop coefficient curves using growing degree days (GDD)." _Agricultural Water Management_ 319, 109758.

## Core GDD Method

The simplified GDD formula (adopted by FAO56rev):

```
GDD = 0                        if Tavg < Tbase
GDD = Tavg - Tbase             if Tbase < Tavg < Tupper
GDD = Tupper - Tbase           if Tavg > Tupper
```

Where `Tavg = (Tmax + Tmin) / 2`

- **Tbase**: Minimum temperature (≥0°C) for growth to occur. Crop-specific.
- **Tupper**: Ceiling temperature — daily heat accumulation is capped here.
- **Cumulative GDD**: Sum of daily GDD over a period. A crop needs X cumulative GDD to complete its growth cycle.

## Key Takeaways for Frostleaf

### 1. Temperature Thresholds Are Consistent Within Groups

- **Cool-season crops**: Tbase 0–6°C, Tupper 24–35°C
- **Warm-season crops**: Tbase 7–15°C, Tupper 28–45°C
- Crops in the same botanical family tend to share similar thresholds

### 2. Tbase/Tupper Data Is Well-Established

The paper provides consolidated Tbase and Tupper for **117 crops** across three tables:
- **Table 1**: Vegetables, herbs, and spices (45 crops)
- **Table 2**: Field crops and grasses (44 crops)
- **Table 3**: Woody fruit crops, vines, and shrubs (28 crops)

These values are the most relevant for Frostleaf — they feed directly into our GDD calculations.

### 3. Cumulative GDD Per Growth Stage (Tables 5 & 6)

The paper provides cumulative GDD for four FAO growth stages:
- **GDDini**: Initial stage (sowing/planting → 10% ground cover)
- **GDDdev**: Development stage (10% cover → full cover / flowering)
- **GDDmid**: Mid-season (full cover → start of senescence)
- **GDDlate**: Late season (senescence → harvest)
- **Total GDD**: Sum of all stages = full crop cycle requirement

**Note**: The numeric GDD stage data was lost in PDF conversion. The total GDD per crop is the most important value for Frostleaf's viability calculation. We can source these from the companion paper or agricultural databases.

### 4. Limitations to Acknowledge

- GDD assumes a linear temperature-growth relationship (simplification)
- Does **not** account for: photoperiod, water stress, soil conditions, nutrients
- Extreme heat/cold can cause damage not captured by GDD
- Different cultivars of the same crop may have different GDD requirements
- Values are "indicative standards" — field validation is recommended

### 5. Relevance for Norway / High-Latitude Gardens

- Short growing seasons mean total accumulated GDD is the primary constraint
- Cool-season crops (low Tbase) will accumulate GDD even on cooler days
- Warm-season crops (high Tbase, e.g., 10°C) may not accumulate GDD on many Norwegian days
- Frost dates (last spring / first autumn) define the viable accumulation window
- Photoperiod effects are significant at high latitudes but not modeled by GDD alone

## Data Extracted

### Thermal Thresholds (Tables 1–3): Tbase and Tupper per crop

- `data/seed/thermal_thresholds_vegetables.csv` — Table 1: 42 vegetables, herbs, spices
- `data/seed/thermal_thresholds_field_crops.csv` — Table 2: 46 field crops and grasses
- `data/seed/thermal_thresholds_woody_fruits.csv` — Table 3: 26 woody fruit trees, vines, shrubs

### Cumulative GDD Per Growth Stage (Tables 5–6): GDD required per FAO crop stage

- `data/seed/gdd_stages_crops.csv` — Table 5: 44 entries (vegetables + field crops, short/long season variants)
- `data/seed/gdd_stages_fruit_trees.csv` — Table 6: 9 entries (fruit trees and vines)

Columns: `gdd_ini` (initial), `gdd_dev` (development), `gdd_mid` (mid-season), `gdd_late` (harvest), `gdd_total` (full cycle)
