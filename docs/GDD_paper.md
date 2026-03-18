## Estimating the lengths of crop growth stages to define the crop coefficient

## curves using growing degree days (GDD): Application of the revised

## FAO56 guidelines

## Paula Paredes

```
a,*
```
## , Ram ́on L ́opez-Urrea

```
b
```
## , Angel ́ Martínez-Romero

```
c
```
## , Mirta Petry

```
d
```
## ,

## Maria do Rosario Cameira ́

```
a
```
## , Francisco Montoya

```
e
```
## , Maher Salman

```
f
```
## , Luis S. Pereira

```
a
```
a _LEAF_ — _Linking Landscape, Environment, Agriculture and Food Research Center, Associated Laboratory TERRA, Instituto Superior de Agronomia, Universidade de_

_Lisboa, Tapada da Ajuda, Lisbon 1349_ ‑ _017, Portugal_
b _Desertification Research Centre (CIDE), CSIC-UV-GVA, Ctra CV 315, Km 10.7, Valencia, Moncada 46113, Spain_
c _University of Castilla-La Mancha (UCLM), Technical School of Industrial Engineering, Regional Centre of Water Research (CREA) and Remote Sensing, Agronomy and_

_Irrigation, Associated Unit to CSIC by CIDE, Campus Universitario, Albacete 02071, Spain_
d _Agricultural Engineering Department, Center of Rural Sciences, Federal University of Santa Maria, Santa Maria, Rio Grande do Sul 97105-970, Brazil_
e _Instituto T_ ́ _ecnico Agron_ ́ _omico Provincial (ITAP), Parque Empresarial Campollano, 2 ª Avda. Nº 61, Albacete 02007, Spain_
f _Land and Water Division, Food and Agriculture Organization of the United Nations, Viale delle Terme di Caracalla, Rome 00153, Italy_

ARTICLE INFO

_Keywords:_
Tbase and Tupper
Cumulative GDD
Vegetable
Field and grass crops
Woody fruit crops

```
ABSTRACT
```
```
Growing Degree Days (GDD) are a fundamental tool for estimating crop growth stage lengths. Their importance
in irrigated agriculture is major since the new FAO56rev guidelines have adopted GDD to estimate the length of
the four crop growth stages of the crop coefficient curves, thus replacing the fixed time lengths. GDD are useful
for supporting crop and water management by quantifying temperature accumulation over time. They can be
used to estimate the dates of crop stages required for cropping operations and irrigation scheduling, as well as
predict such dates in real time when appropriate tools are used. This study focuses on the defining the base and
upper temperatures (Tbase and Tupper) used to estimate the start and end of the crop growth stages. These values
are crop specific and are herein tabulated for several vegetable, field, grass and woody fruit crops. Indicative
cumulative GDD values, obtained from a literature review and from own computations, are provided for each
crop growth stage of the FAO segmented crop coefficient curve, i.e. the initial, development, mid-season, and late
season stages. Examples of application demonstrate their usage graphically and show how cumulative GDD
results in different durations in different locations.
```
**1. Introduction**

The accurate estimation of crop irrigation requirements and water

use has been for several decades, and still is, a major concern for

farmers, researchers, technical irrigation personnel, water managers and

planners. Related issues are becoming increasingly important as water

scarcity is intensifying, particularly in areas marked by aridity, due to

climate variability and change. It is predicted that the imbalance be-

tween water availability and demand will increase globally as a result of

climate change, although its magnitude will vary between regions

(Tanasijevic et al., 2014; IPCC, 2022 ; Lionello et al., 2023). Therefore,

tools that allow more precise estimation of crop evapotranspiration

(ETc) and supporting the day-to-day irrigation management decision

```
making, are required (Pereira et al., 2021). At the farm level, ETc is
commonly and operationnally computed using the FAO Kc-ETo approach
(Allen et al., 1998; Pereira et al., 2025). ETc is estimated as the product
of the grass crop reference evapotranspiration (ETo), which represents
the evaporative demand of the atmosphere, and a crop coefficient (Kc),
that represents the difference effects of the main crop characteristics
that distinguish the evaporation potential of the crop under study from
the reference grass crop (Allen et al., 1998; Pereira et al., 2025). Kc
values change along the crop growth season as the crop develops, both
daily and among the crop growth stages influenced by the crop char-
acteristics such as crop height, leaf are index (LAI), and fraction of
ground cover (Allen and Pereira, 2009, Pereira et al., 2021).
The FAO56rev guidelines (Pereira et al., 2025), like the original
```
```
*Corresponding author.
E-mail address: pparedes@isa.ulisboa.pt(P. Paredes).
```
Contents lists available at ScienceDirect

# Agricultural Water Management

journal homepage: [http://www.elsevier.com/locate/agwat](http://www.elsevier.com/locate/agwat)

https://doi.org/10.1016/j.agwat.2025.
Received 28 May 2025; Received in revised form 16 August 2025; Accepted 17 August 2025

```
Agricultural Water Management 319 (2025) 109758
```
Available online 30 August 2025
0378-3774/© 2025 The Authors. Published by Elsevier B.V. This is an open access article under the CC BY-NC-ND license ( [http://creativecommons.org/licenses/by-](http://creativecommons.org/licenses/by-)

nc-nd/4.0/ ).


FAO56 (Allen et al., 1998), adopts the Kc segmented curve to represent

crop water use throughout crop growth during four sequential stages,

the initial, development, mid-season, and late season stages. The FAO Kc

curve for a given crop is designed with the Kc values for the initial (Kc

ini), mid-season (Kc mid) and end-season (Kc end) stages as described
(Allen et al., 1998; Pereira et al., 2025). Thus, precision in defining the

crop growth stages and their durations is required for an appropriate

estimation of ETc throughout the crop season. Due to the high interan-

nual variability of weather conditions affecting crop growth, and to the

adoption of diverse crop varieties, it is less advisable to use calendars

representing fixed day-time durations of crop growth stages as provided

in the original FAO56, rather than adopting calendars based on cumu-

lated temperature requirements relative to the four crop growth stages.

Appropriate tools are therefore needed to assist in determining when

each crop stage is coming to an end. The remote sensing (RS) of the

vegetation using spectral vegetation indices (VI) is highly appropriate

for the near real-time determination of the crop coefficients and

allowing the duration of growth stages to be inferred (Allen et al., 2007a;

Laipelt et al., 2021; Pˆoças et al., 2020). However, the availability of this

type of information depends on the revisit time of the satellite used as

well as on the cloudiness conditions (Doherty et al., 2022); in addition,

for operational purposes it requires expert technicians able to well

manage and interpret the images information.

For irrigation water management and irrigation scheduling, the

tabulated Kc in the FAO56rev guidelines (Pereira et al., 2025) or in

appropriate literature, desirably when adjusted to weather conditions,

are commonly used in soil water balance models (Pereira et al., 2020),

crop growth models such as AquaCrop (Raes et al., 2023; Salman et al.,

2025 ), APSIM (Keating, 2024 ), STICS (Beaudoin et al., 2023) and

WOFOST (De Wit et al., 2019), or models from the DSSAT-CSM group

(Hoogenboom et al., 2019; Khan et al., 2024). However, model tools

require calibration and parameterization, which is generally difficult

and demanding in terms of agronomic data acquisition. Therefore, there

is a need to develop easy-to-use tools that can effectively predict the

dates of crop growth stages and, thus, supporting decision making,

especially considering climate change and variability.

The linear or near-linear relationship between air temperature and

plants growth, i.e., the time required for a plant to complete a certain

physiological stage (R ́eaumur, 1735 ), has been the focus of many studies

focusing on a great number of crops and their growth stages as reviewed

in the companion article (Paredes et al., 2025). It is therefore possible to

follow and estimate crop growth under non-limiting conditions based on

temperature accumulation (McMaster and Wilhelm, 1997; Bonhomme,

2000 ). The latter is computed above the crop specific base temperature

(Tbase) and up to a ceiling or upper limit (Tupper) and is referred to as the

growing degree days (GDD) required for the completion of a given crop

stage or the season.

The main objectives of this study are, therefore, the following: 1) to

provide consolidated Tbase and Tupper values for a set of 117 crops to be

used for the estimation of the time length (L) of the FAO four crop

growth stages based on the findings of the companion article; 2) to

provide and tabulate the GDD required to complete each of the four crop

growth stages for a set of crops based on observations performed under

near-pristine conditions; and 3) discuss an example of application of the

GDD to obtain the time length of crop growth stages according to the

FAO56rev Guidelines (Pereira et al., 2025). The overall objective is to

support users of the FAO56rev Guidelines by improving and easing the

calculation and accurate use of crop coefficients in crop and water

management under climate variability and change.

**2. The GDD method: strengths and limitations**

As in case of many methods, the GDD method offers several advan-

tages that significantly improve agricultural management practices in

the day-to-day practice. In contrast to fixed-length methods that assume

constant growth rates, the GDD method considers different temperature

```
conditions that affect plant growth allowing for more accurate pre-
dictions, thus contributing to improve the precision of crop management
decisions (McMaster and Wilhelm, 1997; Purcell, 2003 ). GDD is closely
related to the biological processes of plants which allow for a better
management of critical growth stages, mainly flowering (Derieux and
Bonhomme 1982a, b; Orlandi et al., 2005), fruiting or harvest timing
(Gilmore and Rogers, 1958; Black et al., 2006; Campos et al., 2010;
Elnesr et al., 2013; Yang et al., 2020; Garcia et al., 2025a,b). In addition,
it is used to predict the potential productivity of crops (e.g. Steduto et al.,
2012 ; Holzworth et al., 2018; Beaudoin et al., 2023). The use of GDD has
proven to be a useful tool in practice, allowing the timing of agricultural
interventions to be determined, leading to more efficient use of re-
sources. GDD enables precise irrigation scheduling based on actual
growth stages, so contributing to improve crop yields, efficient use of
water (Huntington and Allen, 2009; Huntington et al., 2015) and water
saving. A major advantage of using GDD to define crop growth stages is
that the cumulative GDD required to complete a given crop growth stage
is relatively constant contrarily to the number of days required to ach-
ieve the same growth due to its dependency on climate (Monteith, 1981;
Purcell, 2003 ).
GDD also provides essential insights in delineating suitable agricul-
tural regions (agro-climatic zoning, Dethier and Vittum, 1967 ) and
identifying optimal crop varieties suitable for these specific areas (Boote
et al., 1998; Kakabouki et al., 2021; Hachisuca et al., 2023), further-
more, it provides a more resilient framework for predicting crop
development and improving yield predictions under changing climate
scenarios (Saadi et al., 2015; Zhang et al., 2020; Soares et al., 2025; Belli
et al., 2025).
However, the method also presents several limitations that impact
GDD accuracy and reliability. A major limitation is the assumption of a
linear relationship between temperature and plant development rate,
which oversimplifies the non-linear responses of plants to temperature
variations (Bonhomme, 2000 ). This linearity often only applies within a
limited temperature range, and different developmental stages may
respond differently to the same temperature (Bonhomme, 2000; Nor-
mand and L ́echaudel, 2004; Pessotto et al., 2023). Furthermore, extreme
temperatures, both high and low, can cause physiological stress or
damage to plants, that may not be captured by simple GDD accumula-
tion (Rasul et al., 2011).
As discussed by several authors, one of the most pointed out limi-
tation of the use of GDD to estimate development stages is that tem-
perature is not the only variable contributing to crop development (e.g.
Wang, 1960 ; Ritchie and Nesmith, 1991 ; Bonhomme, 2000 ). Among
other variables, photoperiod and water availability highly constraints
crop development and must be taken into consideration for accurately
predicting crop development and optimizing agricultural practices.
Photoperiod regulates key processes such as flowering, seed germina-
tion, and vegetative growth. Short-day plants require longer nights to
flower, while long-day plants flower with shorter nights. Therefore, the
interaction between photoperiod and GDD is essential, namely in re-
gions with significant seasonal variations in day length (Ritchie and
Nesmith, 1991 ).
Water availability has significant impacts on crop development,
hence on the effectiveness of accumulated thermal time. Water stress
can limit the growth and development of plants, even when temperature
conditions are optimal (Bonhomme, 2000 ).
Integrating GDD with photoperiod and water availability into crop
models provides a more comprehensive understanding of crop
phenology. Such approaches are often used in crop growth modelling
such as those already quoted in the Introduction section.
The simplified GDD method has proven useful to meet practical re-
quirements, rather than its precision or theoretical accuracy for scien-
tists, crop consultants, and producers in predicting plant development
rate and growth (Wang, 1960, Domínguez et al., 2012; Garcia et al.,
2025 ).
As reviewed in the companion article (Paredes et al., 2025), there are
```

different methods for calculating GDD, with different advantages and

limitations. Nevertheless, only the simplified method is presented herein

as it is the one that served as the basis for the FAO56rev computations.

Although GDD simplifies the complex temperature response of plants

and does not consider various other environmental factors that influence

plant growth, it is widely used (Ruml et al., 2010) because it meets a

practical need. The simplified GDD method has proven useful to meet

practical requirements (Marin et al., 1995; Maynard and Hochmuth,

2007; Fresco et al., 2021) rather than its precision or theoretical

accuracy.

The straightforward method proposed in FAO56rev computes GDD

by estimating the difference between the average daily temperature and

the base temperature (Tbase). The latter is the lowest temperature (≥

0 ◦C) allowing that growth initiates. The daily temperature cannot

however exceed the upper temperature, which consists of a maximum

temperature threshold (Tupper), often called ceiling temperature, that

expresses the limit of the daily heat accumulation. GDD are, therefore,

estimated as:

_GDD_ =

```
⎧
⎨
```
⎩

```
0 , Tavg<Tbase
Tavg  Tbase, Tbase<Tavg<Tupper
Tupper  Tbase, Tavg> Tupper
```
(1)

where Tmax (◦C), Tmin (◦C) and Tavg (◦C) are, respectively, the maximum,

minimum and average air temperature, Tbase is the base temperature,

and Tupper is the upper air threshold temperature that limits crop growth.

Tavg is the average temperature between Tmax and Tmin.

Several modeling tools use this simplified approach, namely the FAO

AquaCrop model (Steduto et al., 2012) and the updated version of

SIMDualKc (Rosa et al., 2012), as well as the updated FAO56rev.

**3. Consolidated Tbase and Tupper proposed as support to**

**FAO56rev**

Based on the literature review in the companion article (Paredes

et al., 2025) provided for selecting the Tbase and Tupper values presented

in the following. Despite the high variability of the Tbase and Tupper

values available in literature (see the Supplemental Information in

Paredes et al., 2025), an approach considering the known physiological

and field characteristics of the crops, and their most common sowin-

g/initiation periods, and experts’ knowledge has allowed the selection

of their most appropriate values. Due to this approach, the selected Tbase

and Tupper values intentionally vary in a much small range than the

values shown in the reviewed literature (Paredes et al., 2025). The

selected, consolidated values are presented in Tables 1 through 3

respectively for vegetable and herbs and spice crops, field and forage

crops, and woody fruit crops.

_3.1. Vegetable crops, herbs and spices_

Vegetable crops, like other crops, can be classified as cool or warm

season crops (i.e. according to the temperature tolerance). Among those

grouped as roots, tubers, bulbs and stems, the cool season refers to

asparagus, carrot, celery, garlic, potato, onion, radish, turnip, and table

beets, while the warm season vegetable crops include cassava and yam,

also known as taro, both native from tropical and subtropical regions, as

well as sweet potatoes.

Within cool-season vegetables (Table 1 ), the Tbase values range from

2 ◦C for potatoes to 6◦C for carrots, but most crops are in the 4◦C to

4.5◦C range. Tupper values are generally around 30 ◦C to 35◦C, however

with a lower value of 24◦C for celery. The warm season crops have Tbase

values in the 10◦C to 12◦C range, and Tupper from 30 ◦C to 40◦C. Re-

sults show that the range of values for both Tbase and Tupper is quite

narrow when crops are considered as cool or warm season crops.

Leaves and flowers vegetable crops in the current study may be

considered as cold season crops, having Tbase in the range 4 ◦C to 5◦C

```
but the latter corresponds to only one crop, asparagus. The upper
threshold varies from 25 ◦C to 32◦C but the extreme values refer to only
one crop, spinach for the lower and asparagus having the higher.
Most of the fruit vegetable crops in Table 1 are warm season crops.
Their Tbase was set at 10◦C (Table 1 ) for all them, excepting tomato,
banana, and pineapple, whose Tbase are 7◦C, 14◦C, and 13◦C, respec-
tively, with the higher values for banana and pineapple, because they
are originated in tropical areas, thus susceptible to cold. Also originating
from tropical and subtropical regions, okra has a Tbase also set at 10◦C.
Differently, a lower Tbase of 3◦C was set for strawberry, behaving as a
cold season crop. The Tupper values show a relatively large difference
among all fruit vegetable crops; therefore, values were set in a wide
range, with higher values for melon and banana (38◦C and 37◦C,
respectively) and lower values for tomato and strawberry (28◦C and
30 ◦C, respectively). These results indicate that both tomato and
strawberry are susceptible to warm weather, e.g. heat waves.
The herb and spice crops show a wide range of Tbase values (Table 1 ).
Those behaving as cold season crops have Tbase values ranging from 0 ◦C
to 5◦C, with the lower value for mint, while Tupper ranges 27 ◦C to 35 ◦C,
with the lower value for parsley. The warm season crops, which include
basil, black pepper, and saffron, have a common Tbase of 10◦C, and a
```
```
Table 1
Consolidated base and upper temperature thresholds (Tbase and Tupper) required
for the computation of the growing degree days (GDD) for selected vegetable
crops.
```
```
Crop Tbase (◦C) Tupper (◦C)
```
```
Roots, tubers, bulbs and steams vegetable crops
Asparagus ( Asparagus officinalis ) 4.5 35
Carrots ( Daucus carota ) 6 30
Cassava ( Manihot esculenta ) 10 40
Celery ( Apium graveolens ) 4 24
Garlic ( Allium sativum ) 4 30
Onions ( Allium cepa ) 4.5 35
Potato ( Solanum tuberosum ) 2 30
Radish ( Raphanus sativus ) 4.5 30
Sweet potato ( Ipomoea batatas ) 12 30
Table beets ( Beta vulgaris ) 4.5 30
Turnip ( Brassica rapa ) 4 35
Yam, Taro ( Colocasia esculenta ) 10 35
Leaves and flowers vegetable crops
Artichoke ( Cynara scolymus ) 5 32
Broccoli ( Brassica oleracea var. italica) 4.5 30
Brussel sprouts ( B. oleracea cv. gemmifera) 4.5 30
Cabbage ( B. oleracea ) 4.5 30
Cauliflower ( B. oleracea cv. botrytis) 4.5 30
Lettuce ( Latuca sativa ) 4 28
Spinach ( Spinacia oleracea ) 4 25
Fruit vegetable crops
Banana ( Musa accuminata ) 14 37
Bell & Chili pepper ( Capsicum annuum ) 10 35
Cucumber ( Cucumis sativus ) 10 32
Eggplant ( Solanum melongena ) 10 35
Melon ( Cucumis melo ) 10 38
Melon, cantaloupe ( Cucumis melo ) 10 38
Okra ( Abelmoschus esculentus ) 10 35
Pineaple ( Ananas comosus ) 13 25
Pumpkin ( Cucurbita argyrosperma ) 10 32
Squash, Zucchini ( Cucurbita pepo ) 10 32
Strawberries ( Fragaria × ananassa ) 3 30
Tomato ( Solanum lycopersicum ) 7 28
Watermelon ( Citrullus lanatus ) 10 35
Herbs and spices
Basil ( Ocimum basilicum ) 10 30
Black cumin ( Nigella sativa ) 5 30
Black pepper ( Piper nigrum ) 10 40
Coriander ( Coriandrum sativum ) 4 30
Fenugreek ( Trigonella foenum-graecum ) 4 35
Lemon balm ( Melissa officinalis ) 5 35
Mint ( Mentha spicata ) 0 35
Oregano ( Origanum vulgare ) 5 30
Parsley ( Petroselinum crispum ) 4 27
Saffron ( Crocus sativus ) 10 30
```

Tupper of 30◦C to 40◦C, with the highest value for black pepper. The

source of information for herbs and spice crops was, however, reduced,

which increases the uncertainty of the temperature limits for these

crops.

_3.2. Field crops and grasses_

A large variety of field crops are considered (Table 2 ). The cool

season grain legumes, which include chickpea, fava bean, pea and lentil,

have a Tbase of 5◦C, but lentil that has a lower value of 2◦C. The

remaining crops are of warm season and have a Tbase ranging from 8 ◦C

to 10◦C, with the lower value for mungbean. Tupper values range from

27 ◦C to 35◦C for cool season grain legumes, with the lower value for

pea, and from 32 ◦C to 40◦C for the warm season crops, with soybean

having one of the highest upper thresholds.

Within the fibre crops (Table 2 ), cotton and sisal are warm season

crops and therefore have Tbase of 10◦C and 12.5◦C, respectively. Flax

```
(or linseed), a cool season crop, has a Tbase of 0◦C. The Tupper values are
similar for all fiber crops, close to 35◦C. Among the sugar crops
(Table 2 ), sugar beet is a cool season crop, with a low Tbase threshold of
5 ◦C and Tupper of 30◦C. Differently, the sugar cane is a warm season
crop and therefore has a higher Tbase of 10◦C and a rather high Tupper of
45 ◦C, showing its ability to adapt when facing high temperatures.
Cool season oil crops (Table 2 ) include camelina, canola, mustard,
safflower, and sesame, having Tbase ranging from 0 ◦C to 5◦C, with
camelina and canola having the lower values. Their Tupper ranges from
30 ◦C to 40◦C, with the highest value for mustard. The Tbase for warm
season oil crops is around 10 ◦C, except for sunflower with Tbase of 8◦C
and guar of 15◦C. Tupper values range from 30 ◦C to 40◦C, with the
higher value in case of guar, mustard and sesame.
The cool season cereals and pseudo cereals (barley, oats, quinoa, rye,
bread and durum wheat) have a Tbase of 0◦C to 4◦C, with the cereal
crops having a Tbase of 0 ◦C but rye that has a value of 4◦C. Their Tupper is
in a short range of 30◦C to 35◦C. Quinoa, originaire of the Andes, has
Tbase of 2◦C and a small Tupper of 25◦C. The warm season cereals have a
Tbase of 10◦C but rice that has the highest Tbase, 12◦C. Tupper values
range widely, from 30 ◦C to 40◦C, with maize having 32 ◦C and rice
35 ◦C. The pseudocereals amaranthus and teff have Tbase of 7◦C and
12 ◦C, and Tupper of 40◦C and 30◦C, respectively, showing a behaviour
distinct from cereals.
Table 2 also includes grasses and forages. The warm-season grasses
and forages include Bermuda grass, Elephant grass, Guinea grass and
Sudan grass, which have a Tbase ranging from 10 ◦C to 15◦C, while the
cool-season grasses and forages have a much smaller Tbase, ranging from
0 ◦C, as for alfalfa, to 6◦C for the Persian clover. The Tupper values are
25 – 30 ◦C for the cool season grasses, and range higher, from 30 ◦C to 40
◦C, for the warm season grasses, with the higher value for elephant and
```
```
Guinea grasses.
For vegetable, field and grass crops (Tables 1 and 2), the Tbase and
Tupper values relative to diverse crops of the same botanical family show
generally great similarity, thus evidencing a physiological coherence of
these thresholds. In addition, as expected, when crops are grouped ac-
cording to cool or warm seasons, show temperature thresholds reason-
ably consistent, often with Tbase values of 0– 5 ◦C for the cool season and
7 – 12 ◦C for the warm season. The upper limits have a wider range, with
Tupper at 25– 35 ◦C and 35– 45 ◦C for cool and warm season crops,
respectively, indicating greater uncertainty, as already noted in the
companion review paper by Paredes et al. (2025).
```
_3.3. Fruit trees, vines and shrubs_

```
The fruit tree crops (Table 3 ) have Tbase values related to the climatic
characteristics of the locations where they are grown. The Tbase values
for subtropical and tropical crops are in the range of 10– 15 ◦C, while
Tupper is around 35 ◦C for most of these crops. Woody crops with Tbase
values in the same range include grapes, citrus, and pistachios. All other
crops have Tbase values between 4 ◦C and 7 ◦C and Tupper generally be-
tween 25 ◦C and 35 ◦C. Woody fruit crops have relatively small number
of studies, which may increase the uncertainty risk of the tabulated
values.
```
**4. Examples of tabulated GDD values for the Kc curves of
FAO56rev**

```
The definition of crop growth stages proposed in FAO56rev (Pereira
et al., 2025), namely the initial, development, mid-season and late
season stages, is based on the GDD accumulation. Therefore, the GDDini
corresponds to the accumulation GDD during the initial crop growth
stage computed using Eq. 1and the Tbase and Tupper in Tables 1 – 3. The
initial stage spans from the sowing or planting date up to approximately
10 % of ground covered by the crop in the annual crops while for the
perennial crops, it spans from the time when the initiation of new leaves
occurs, or when the dormancy phase of the sprout buds ends up to 10 %
```
**Table 2**
Consolidated base (Tbase) and upper (Tupper) temperature thresholds required for

the computation of the growing degree days (GDD) for field crops and grasses.

```
Crop Tbase (◦C) Tupper (◦C)
```
```
Grain legumes
Bean ( Phaseolus vulgaris ) 10 32
Mungbean ( Vigna radiata ) 8 40
Black and green gram ( Vigna mungo ) 10 40
Chickpea (garbanzo) ( Cicer arietinum ) 5 32
Cowpea ( Vigna unguiculata ) 10 35
Fava bean ( Vicia faba ) 5 30
Groundnut (peanut) ( Arachis hypogaea ) 10 35
Lentil ( Lens culinaris ) 2 35
Pea ( Pisum sativum ) 5 27
Soybean ( Glycine max ) 10 40
Fiber crops
Cotton ( Gossypium hirsutum ) 12.5 35
Flax (Linseed) ( Linum usitatissimum ) 0 36
Sisal ( Agave sisalana ) 10 35
Sugar crops
Sugar beet ( Beta vulgaris ) 5 30
Sugar cane ( Saccharum officinarum ) 10 45
Oil crops
Camelina ( Camelina sativa ) 4 30
Canola ( Brassica napus ) 2 30
Castorbean ( Ricinus communis ) 10 30
Guar ( Cyamopsis tetragonoloba ) 15 40
Mustard ( Brassica juncea ) 5 40
Safflower ( Carthamus tinctorius ) 5 35
Sesame ( Sesamum indicum ) 10 40
Sunflower ( Helianthus annuus ) 8 30
Cereals and pseudocereals
Amaranth grain ( Amaranthus sp.) 7 40
Barley ( Hordeum vulgare ) 0 30
Maize ( Zea mays ) 10 32
Oats ( Avena sativa ) 0 30
Pearl Millet ( Pennisetum glaucum ) 10 40
Quinoa ( Chenopodium quinoa ) 2 25
Rye ( Secale cereale ) 4 35
Sorghum ( Sorghum bicolor ) 10 30
Teff ( Eragrostis tef ) 10 30
Wheat, common ( Triticum aestivum ) 0 35
Wheat, durum ( Triticum durum ) 0 35
Rice ( Oryza sativa) 12 35
Grasses
Alfalfa ( Medicago sativa ) 0 30
Bermuda ( Cynodon dactylon ) 10 30
Berseem clover ( Trifolium alexandrinum ) 4 30
Common vetch ( Vicia sativa ) 0 30
Elephant grass ( Pennisetum sp.) 15 40
Grass pastures 4 30
Guinea grass ( Panicum maximum ) 14 40
Hairy vetch ( Vicia villos a) 2 25
Italian ryegrass ( Lolium multiflorum ) 2 25
Persian clover ( Trifolium resupinatum ) 6 35
Sudan grass ( Sorghum × drummondii ) 10 35
```

ground cover. The GDDdev represents the accumulation of GDD during

the development stage, i.e., from 10 % of ground cover up to effective

full cover or maximum cover is achieved, which in some anual crops

correspond to the initiation of flowering. GDDmid corresponds to the

accumulation of temperature during the mid-season stage i.e., from full

ground cover up to the start of senescesce or maturity. The GDDlate

corresponds to the cumulative GDD during the late season stage which

corresponds to the period from start of senescence or maturity to

harvest.

The observed data for these diverse crop stages were retrieved from

multiple studies as detailed in Table 4. The selected studies were pri-

marily based on field observations, often conducted in farmers managed

fields where crops were well irrigated and properly managed, thus

avoiding water stress and other growth constraints.

Although several studies found in the literature provide for cumu-

lative GDD, namely those reviewed in the companion article (Paredes

et al., 2025), they were not used in the current study due to various

limitations:

- Inconsistent Tbase values: The Tbase used in these studies were larger
    or smaller than the tabulated values proposed in the current study
    (Tables 1, 2 and 3);
- Lack of/or inconsistent Tupper values: studies that did not account for
    threshold Tupper, and/or used threshold values different from those
    proposed;
- Non-comparable crop growth stages: The crop stages defined in
    several studies were not consistent with the FAO56 stages (i.e.,
    initial, crop development, mid-season, and late season); and
- Suboptimal growing conditions: Several of those studies were per-
    formed when the crops were subject to water stress, nutrient

```
deficiencies, salinity, or other environmental constraints that could
bias the reported GDD values.
```
```
The retrieved data from the selected studies (Table 4 ) were analysed
using Eq. 1, along with the tabulated Tbase and Tupper values (Tables 1, 2
and 3), to estimate the cumulative GDD required for each crop growth
stage. Tables 5 and 6show the cumulative GDD that define the length of
```
**Table 3**

Consolidated base (Tbase) and upper (Tupper) temperature thresholds required for

the computation of the growing degree days (GDD) for woody fruit crops.

```
Crop Tbase (◦C) Tupper (◦C)
```
```
Mediterranean climate fruit trees and vines
Olive ( Olea europaea ) 7 35
Wine and table grapes ( Vitis vinifera ) 10 35
Citrus ( Citrus sp.) 13 30
Warm temperate trees and shrubs
Avocado ( Persea americana ) 6 33
Loquat ( Eriobotrya japonica) 4 42
Temperate climate trees
Pomme fruit trees
Apple ( Malus domestica ) 4 35
Pear ( Pyrus communis ) 4 35
Stone fruit trees
Apricot ( Prunus armeniaca ) 7 25
Cherry ( Prunus avium ) 4.5 30
Peach and nectarine ( Prunus persica ) 7 35
Plum ( P. domestica and P. salicina ) 4.5 25
Nut fruit trees
Almond ( Prunus dulcis ) 4.5 35
Pistachio ( Pistacia vera ) 9 35
Walnut ( Juglans regia ) 4.5 30
Other temperate vines and shrubs
Kiwifruit ( Actinidia deliciosa ) 6 30
Hop ( Humulus lupulus ) 5 30
Berries ( Vaccinium sp.) 6 30
Sub–tropical and tropical orchards and plantations
Passionfruit (Passiflora edulis) 10 35
Pomegranate ( Punica granatum ) 10 35
Sub–tropical and tropical evergreen orchards and plantations
Coffee ( Coffea arabica ) 10 32
Guava ( Psidium guajava ) 12 35
Lychee ( Litchi chinensis ) 10 30
Mango ( Mangifera indica ) 12 32
Papaya ( Carica papaya ) 15 35
Palm plantations
Date palm ( Phoenix dactylifera ) 10 35
Oil palm ( Elaeis guineensis ) 15 40
```
```
Table 4
Selected studies used to develop the tabulated GDD for the four FAO crop growth
stages.
```
```
Crop References
```
```
Roots, tubers, bulbs
vegetable crops
```
### ​

```
Carrots ( Daucus carota ) Chaterl ́an et al. (2011), Carvalho et al. (2014)and
L ́ellis et al. (2017)
Garlic ( Allium sativum ) Cort ́es et al. (2003), Chaterl ́an et al. (2011);
Domínguez et al. (2012, 2017)and Martínez-L ́opez
et al. (2022a)
Onions ( Allium cepa ) L ́opez-Urrea et al. (2009), Chaterl ́an et al. (2011),
Domínguez et al. (2012)and Ferreira et al. (2022)
Potato ( Solanum tuberosum ) Paredes et al. (2018), Martínez-Romero et al. (2019),
Montoya et al. (2019), L ́opez-Urrea et al. (2021)and
Ferreira et al. (2022)
Leaves and flowers
vegetable crops
```
### ​

```
Broccoli ( Brassica oleracea
cv. italica)
```
```
L ́opez-Urrea et al. (2009)and Ferreira et al. (2022)
```
```
Lettuce ( Lactuca sativa ) French et al. (2024)
Fruit vegetable crops ​
Bell pepper ( Capsicum
annuum )
```
```
Chaterl ́an et al. (2011)and Allen et al. (2020)
```
```
Green bean ( Phaseolus
vulgaris )
```
```
Jadoski et al. (2000), Carlesso et al. (2007)and
Oliveira et al. (2011)
Melon ( Cucumis melo ) Leite et al. (2015)and Ferreira et al. (2022)
Tomato ( Solanum
lycopersicum )
```
```
Ferreira et al. (2022)
```
```
Grain legumes ​
Pea, fresh ( Pisum sativum ) Paredes et al. (2017)and Ferreira et al. (2022)
Soybean ( Glycine max ) Wei et al. (2015), Gim ́enez et al. (2017), Petry et al.
(2024a)
Fiber crops ​
Cotton ( Gossypium
hirsutum )
```
```
Allen et al. (2007b), Сholpankulov et al. (2008), Allen
et al. (2020)
Oil crops ​
Canola ( Brassica napus ) S ́anchez et al. (2014), L ́opez-Urrea et al. (2020)
Sunflower ( Helianthus
annuus )
```
```
L ́opez-Urrea et al. (2014), Miao et al. (2016), Ferreira
et al. (2022)
Cereals ​
Barley ( Hordeum vulgare ) Pereira et al. (2015), Gonz ́alez-Piqueras et al. (2019),
L ́opez-Urrea et al. (2020), Pardo et al. (2022)and
Martínez-L ́opez et al., (2022b)
Maize, grain ( Zea mays ) Allen et al. (2007b), Domínguez et al. (2012), Martins
et al. (2013), Paredes et al. (2014), Gonz ́alez et al.
(2015), Miao et al. (2016), Gim ́enez et al. (2016),
Allen et al. (2020), Ferreira et al. (2022)
Maize, silage ( Zea mays ) Cameira et al. (2003), Allen et al. (2007b), Allen et al.
(2020)and Ferreira et al. (2022)
Maize, sweet ( Zea mays ) Allen et al. (2007b)and Allen et al. (2020)
Oats ( Avena sativa ) Martínez-L ́opez et al. (2022a)
Wheat, Winter ( Triticum
aestivum )
```
```
Zhao et al. (2013), Zhang et al. (2013), Allen et al.
(2007b)and Allen et al. (2020)
Wheat, Spring ( Triticum
aestivum )
```
```
Allen et al. (2007b), L ́opez-Urrea et al. (2009), Miao
et al. (2016)and Allen et al. (2020)
Rice ( Oryza sativa) Ferreira et al. (2022)and Petry et al. (2024b)
Fruit trees and vines ​
Olive ( Olea europaea ) G ́omez-del-Campo (2013), Paço et al. (2014)and
Ramos et al. (2023)
Citrus (Oranges,
clementines, mandarin)
```
```
Ramos et al. (2023)
```
```
Pomegranate ( Punica
granatum )
```
```
Ramos et al. (2023)
```
```
Wine grapes ( Vitis vinifera ) L ́opez-Urrea et al. (2012)
Almond ( Prunus dulcis ) S ́anchez et al. (2021), Montoya et al. (2022),
Mir ́as-Avalos et al. (2023)and Ramos et al. (2023)
Pistachio ( Pistacia vera ) Memmi et al. (2016)
```

## Cumulative GDD required by vegetable and field crops to complete each crop growth stage and the total crop season derived from field observations under non-stressed

and well-managed conditions.

```
Crop Type of season Initial Develop. Mid-season Harvest Total GDD
(◦C)
GDDini (◦C) GDDdev(◦C) GDDmid(◦C) GDDlate(◦C)
```
Cumulative GDD required by fruit trees and vines to complete each crop growth stage and the total crop season derived from field observations under non-stressed and

well-managed conditions.

```
Crop Type of season Initial Develop. Mid-season Harvest Total GDD
(◦C)
```
- Table
   - Carrots ( Daucus carota ) Common Roots, tubers and bulbs vegetable crops
   - Garlic ( Allium sativum ) Short season
      - Long season
   - Onions ( Allium cepa ) Common
   - Potato ( Solanum tuberosum ) Short season
      - Long season
   - Broccoli ( Brassica oleracea cv. italica) Short season Leaves and flowers vegetable crops
      - Long season
   - Lettuce ( Lactuca sativa ) Short season
      - Long season
   - Bell pepper ( Capsicum annuum ) Common Fruit vegetable crops
   - Melon ( Cucumis melo ) Short season
      - Long season
   - Tomato ( Solanum lycopersicum ) Industry
      - Market
   - Bean, seed ( Phaseolus vulgaris ) Short season Grain legumes
      - Long season
   - Pea, fresh ( Pisum sativum ) Industry
      - Market
   - Soybean ( Glycine max ) Short season
      - Long season
   - Cotton ( Gossypium hirsutum ) Short season Fiber crop
      - Long season
   - Canola ( Brassica napus ) Short season Oil crops
      - Long season
   - Sunflower ( Helianthus annuus ) Short season
      - Long season
   - Barley ( Hordeum vulgare ) Short season Cereals
      - Long season
   - Maize, grain ( Zea mays ) Short season
      - Long season
   - Maize, silage ( Zea mays ) Short season
      - Long season
   - Maize, sweet ( Zea mays ) Short season
      - Long season
   - Oats ( Avena sativa ) Common
   - Wheat, Winter ( Triticum aestivum ) Short season
      - Long season
   - Wheat, Spring ( Triticum aestivum ) Short season
      - Long season
   - Rice ( Oryza sativa) Short season
      - Long season
   - Sorghum ( Sorghum bicolor ) Short season
      - Long season
- Table
   - Olive ( Olea europaea ) Early maturation GDDini (◦C) GDDdev(◦C) GDDmid(◦C) GDDlate(◦C)
         - Late maturation
   - Wine grapes ( Vitis vinifera ) Early maturation
         - Late maturation
   - Citrus (Orange, clementine, mandarin) Common
   - Pomegranate ( Punica granatum ) Common
   - Almond ( Prunus dulcis ) Early maturation
         - Late maturation
   - Pistachio ( Pistacia vera ) Common


the FAO56 crop growth stages (Allen et al., 1998; Pereira et al., 2025)

and of the full crop season for various annual and perennial crops. The

tabulated GDD values could be considered as indicative standards, but as

various crops have different cultivars with different cumulative GDD

values, it is advisable to perform field observations to substantiate the

choices of the tabulated GDD values. These cumulative GDD values

(Tables 5 and 6) provide a reliable reference for defining the length of

the four FAO crop growth stages and can be used as a guide for agro-

nomic planning, crop modeling, and irrigation scheduling.

Further research is required to further consolidate the values pre-

sented in Tables 5 and 6namely extending the data sets of field obser-

vations thus, allowing for further validation.

**5. Examples of Kc curves estimated with GDD**

Examples illustrating the differences in the duration of the FAO

crop growth stages as a function of sowing dates and weather conditions

are presented in Figs. 1 and 2. The standard Kc values tabulated in

Pereira et al. (2021, 2025)were used in both figures. Fig. 1shows an

example of the use of GDD to estimate the dates of the FAO crop growth

stages for short-season beans (Table 4 ) when sown at different dates and

under contrasting weather conditions at the same location in Santa

Maria, southern Brazil. Shifting the sowing date leads to a reduction in

the total duration of the bean cycle as temperature tends to increase. The

length of the different growth stages also changes.

Fig. 2shows the different durations of the Kc curves when beans are

grown in different regions, using the same year (2019) for comparison.

In Hetao, Inner Mongolia (China), Coruche (Portugal) and Almeria

(southern Spain), beans are sown from late March to early May, so 15

April was used for the estimates. In the case of Inner Mongolia, the

```
average temperature during April up to mid-May was 14.6◦C leading to
an average accumulation of 4.6◦C per day, but with 3 days without
accumulation of temperature as Tmean < Tbase, thus extending Lini to 32
days, while in the locations of Portugal and Spain Lini was 24 and 21 days
respectively, with an average Tmean of 16.4◦C 17.3◦C. The behavior of
Lmid was quite different, as in Inner Mongolia it lasted for 27 days, while
in Portugal Lini lasted 37 days and in Spain 29 days. These differences are
related to the Tmean values, as in Inner Mongolia the average Tmean was
27 ◦C, while in Portugal it was 18.3◦C and in Spain 22.3◦C.
Few differences were observed during the late season stage with Llate
of 15, 14 and 12 days respectively for Inner Mongolia, Portugal, and
Spain, has the average Tmean was 22.8◦C, 22.1◦C and 26.0◦C. The re-
sults in Fig. 2show that the stage duration depends on the temperature
conditions and, therefore, needs to be estimated locally.
```
**6. Conclusions and recommendations**

```
This article underlines the central role of GDD in supporting
decision-making in irrigated agriculture, particularly in estimating the
FAO56 crop growth stages. By accurately defining these stages, GDD
enables the optimization of water and crop management practices,
thereby improving resource efficiency and agricultural productivity.
The article provides a comprehensive analysis of the principles of
GDD calculation and identifies its strengths and limitations. One of the
most frequently highlighted limitations is that GDD does not consider
key environmental factors, such as photoperiod, nutrients and water
availability, which have a significant impact on crop growth. Therefore,
to achieve greater accuracy in predicting crop growth stages, more
advanced modelling tools need to be used. These tools should integrate
additional physiological and environmental variables to provide a more
accurate and dynamic representation of crop growth beyond
temperature-based accumulation alone.
The current study assumes that the simple average method offers
adequate precision for practical applications, namely for defining crop
growth stages, as proposed in FAO56rev. A key aspect is the need to
carefully define the base and upper temperature thresholds, as these
values are critical for accurate calculation of GDD and for ensuring
reliable predictions of crop phenology. The indicative consolidated Tbase
and Tupper values are available for a wide range of crops and may be used
for different stages of plant growth providing for valuable reference data
for both researchers and practitioners, namely to support crop and water
management strategies under climate variability and change. These
consolidated values serve as guidance for improving crop growth fore-
casts, refining irrigation and agronomic management, and enhancing
the application of FAO56-based methods. However, when crop varieties
are much different their variability is a source of inaccuracy.
```
**Fig. 1.** Crop coefficient segmented curve for beans in Santa Maria, Rio Grande
do Sul, Brazil when a) sown by 15 September (blue) and 15 October (red) in the

same year, and b) sown by 30 September in the climate conditions of two

seasons 2016/2017 ( **- -** ) and 2024/2025 (–) (Lini – length of initial stage; Ldev –
length of the growth stage; Lmid – length of the mid-season stage; Llate – length

of the late season stage; LTOTAL – length of the total crop cycle).

```
Fig. 2. Crop coefficient segmented curve for beans sown by 15 April of the
same year (2019) in Hetao, Inner Mongolia, China ( ), Coruche, central
Portugal ( ) and Almeria, southern Spain ( ) (LTOTAL – length of the total
crop cycle).
```

The current study highlights the need for further research to improve

the application of GDD in agriculture. It is recommended that users

actively monitor and record the dates of crop growth stages to estimate

GDD and validate the approach under their specific growing conditions

for many crops that do not yet have accurate Tbase and Tupper and hence

adequate GDD. Such developments can improve the accuracy of

phenological predictions from Tbase and Tupper conservative values and

ensure that GDD-based models are consistent considering local envi-

ronmental and management factors.

In addition, the use of technological advances, such as remote

sensing and machine learning, offers new opportunities to improve the

monitoring and prediction of crop growth stages. New research tools can

improve the efficiency and accuracy of real-time agricultural manage-

ment, thus enabling farmers and managers to make more informed de-

cisions and better adapt to changing climatic conditions.

The set of tabulated GDD values provided for the FAO56 crop growth

stages should be used under non-limiting water and light conditions and

in the absence of pests and diseases that prevent full crop growth rates.

Therefore, these values can be considered as guidelines, but need to be

validated for different crop varieties and cultivars to ensure their

applicability in different agricultural contexts. The Tbase and Tupper

values now tabulated, combined with the simple average method to

compute GDD, provide a valuable tool to support the implementation of

the FAO56 segmented curve, facilitating accurate crop growth pre-

dictions, and improved irrigation scheduling.

**CRediT authorship contribution statement**

**Paula Paredes:** Writing – review & editing, Writing – original draft,

Visualization, Validation, Methodology, Formal analysis, Data curation,

Conceptualization. **Ram** ́ **on Lopez-Urrea:** ́ Writing – review & editing,

Formal analysis, Data curation. **Angel** ́ **Martínez-Romero:** Writing –

review & editing, Formal analysis, Data curation. **Mirta Petry:** Writing –

review & editing, Visualization, Formal analysis, Data curation. **Maria**

**do Ros** ́ **ario Cameira:** Writing – review & editing, Formal analysis, Data

curation. **Francisco Montoya:** Writing – review & editing, Formal

analysis, Data curation. **Maher Salman:** Writing – review & editing,

Formal analysis, Data curation. **Pereira Luis Santos:** Writing – review &

editing, Writing – original draft, Supervision, Formal analysis, Data

curation.

**Declaration of Competing Interest**

The authors declare that they have no known competing financial

interests or personal relationships that could have appeared to influence

the work reported in this paper.

**Acknowledgements**

The support of the FCT – Fundaç ̃ao para a Ciˆencia e a Tecnologia, I.

P., under the projects UIDB/04129/2020 of LEAF-Linking Landscape,

Environment, Agriculture and Food, Research Unit, LA/P/0092/2020 of

Associate Laboratory TERRA, and WaterQB “Integrated web-based

platform for supporting irrigation management aiming at coping with

climate variability and changes” project (2022.04553.PTDC, https://

doi.org/https://doi.org/10.54499/2022.04553.PTDC) is acknowl-

edged. The study was also funded through an agreement between FAO

and the Instituto Superior de Agronomia, Universidade de Lisboa. RLU

and FM are also grateful for the support from the Education, Culture and

Sports Council (JCCM, Spain) (Projects SBPLY/21/180501/000070)

and the Agencia Estatal de Investigacion with ́ FEDER (Project

PID2021–123305OB-C31), and NextGenerationEU (Project

TED2021–130405B-I00) co-financing.

_Compliance with ethical standards_

None.

**Data availability**

Data will be made available on request.

**References**

```
Allen, R.G., Pereira, L.S., 2009. Estimating crop coefficients from fraction of ground
cover and height. Irrig. Sci. 28, 17–34. https://doi.org/10.1007/s00271-009-0182-z.
Allen, R.G., Pereira, L.S., Raes, D., Smith, M., 1998. Crop Evapotranspiration. Guidelines
for Computing Crop Water Requirements. FAO Irrig. and Drain. Paper 56, FAO,
Rome, 300 pp.
Allen, R.G., Robison, C.W., Wright, J.L., 2007b. Updated procedures for calculating state-
wide consumptive use in idaho. In: Clemmens, A.J., Anderson, S.S. (Eds.), The Role
of Irrigation and Drainage in a Sustainable Future. USCID Fourth Int Conf Irrig Drain,
Sacramento, CA, pp. 189– 212.
Allen, R.G., Robison, C.W., Huntington, J., Wright, J.L., Kilic, A., 2020. Applying the
FAO-56 Dual Kc method for irrigation water requirements over large areas of the
Western U.S. Trans ASABE 63, 2059-2081. https://doi.org/10.13031/trans.13933.
Allen, R.G., Tasumi, M., Morse, A., Trezza, R., Wright, J.L., Bastiaanssen, W., Kramber,
W., Lorite, I., Robison, C.W., 2007a. Satellite-based energy balance for mapping
evapotranspiration with internalized calibration (METRIC)—Applications. J. Irrig.
Drain. Eng. 133 (4), 395–406. doi:10.1061/(ASCE)0733-9437(2007)133:4(395).
Beaudoin, N., Lecharpentier, P., Ripoche-Wachter, D., Strullu, L., Mary, B., L ́eonard, J.,
Launay, M., Justes, ́E., 2023. STICS Soil-Crop model: conceptual framework,
equations and uses. Editions ́ Quae 519. https://doi.org/10.35690/978-2-7592-3679-
4.
Belli, L., Davoli, L., Oddi, G., Preite, L., Galaverni, M., Ganino, T., Ferrari, G., 2025.
Smart agriculture dataset in a tomato cultivation under different irrigation regimes.
Data Brief. 60, 111521. https://doi.org/10.1016/j.dib.2025.111521.
Black, A.D., Moot, D.J., Lucas, R.J., 2006. Development and growth characteristics of
caucasian and White clover seedlings, compared with perennial ryegrass. Grass
Forage Sci. 61, 442–453. https://doi.org/10.1111/j.1365-2494.2006.00553.x.
Bonhomme, R., 2000. Bases and limits to using ‘degree. day’units. Eur. J. Agron. 13 (1),
1 – 10. https://doi.org/10.1016/S1161-0301(00)00058-7.
Boote, K.J., Jones, J.W., Hoogenboom, G., Pickering, N.B., 1998. In: Tsuji, G.Y.,
Hoogenboom, G., Thornton, P.K. (Eds.), The CROPGRO model for grain legumes. In.
Understanding Options for Agricultural Production, pp. 99– 128.
Cameira, M.R., Fernando, R.M., Pereira, L.S., 2003. Monitoring water and NO3-N in
irrigated maize fields in the sorraia watershed, Portugal. Agr. Water Manag. 60 (3),
199 – 216. https://doi.org/10.1016/S0378-3774(02)00175-0.
Campos, I., Neale, C.M.U., Calera, A., Balbontín, C., Gonz ́alez-Piqueras, J., 2010.
Assessing satellite-based basal crop coefficients for irrigated grapes ( vitis vinifera L.).
Agr. Water Manag. 98, 45–54. https://doi.org/10.1016/j.agwat.2010.07.011.
Carlesso, R., Jadoski, S.O., Maggi, M.F., Petry, M., Wolshick, D., 2007. Efeito da lˆamina
de irrigaç ̃ao na senescˆencia foliar do feijoeiro. Irriga 12 (4), 557–568. https://doi.
org/10.15809/irriga.2007v12n4p557-568.
Carvalho, D.F., Domínguez, A., Neto, D.O., Tarjuelo, J.M., Martínez-Romero, A., 2014.
Combination of sowing date with deficit irrigation for improving the profitability of
carrot in a tropical environment (Brazil). Sci. Hortic. 179, 112–121. https://doi.org/
10.1016/j.scienta.2014.09.024.
Chaterl ́an, Y., Le ́on, M., Duarte, C., Lopez, ́ T., Paredes, P., Pereira, L.S., 2011.
Determination of crop coefficients for horticultural crops in Cuba through field
experiments and water balance simulation. Acta Hortic. 889, 475 – 482. https://doi.
org/10.17660/ActaHortic.2011.889.60.
Сholpankulov, E.D., Inchenkova, O.P., Paredes, P., Pereira, L.S., 2008. Cotton irrigation
scheduling in Central Asia: model calibration and validation with consideration of
groundwater contribution. Irrig. Drain. 57, 516–532. https://doi.org/10.1002/
ird.390.
Cort ́es, C.F., de Santa Olalla, F.M., Lopez-Urrea, ́ R., 2003. Production of garlic ( allium
sativum L.) under controlled deficit irrigation in a semi-arid climate. Agr. Water
Manag. 59 (2), 155–167. https://doi.org/10.1016/S0378-3774(02)00125-7.
De Wit, A., Boogaard, H., Fumagalli, D., Janssen, S., Knapen, R., van Kraalingen, D.,
Supit, I., van der Wijngaart, R., van Diepen, K., 2019. 25 years of the WOFOST
cropping systems model. Agr. Syst. 168, 154 – 167. https://doi.org/10.1016/j.
agsy.2018.06.018.
Derieux, M., Bonhomme, R., 1982a. Heat unit requirements for maize hybrids in Europe:
results of the european FAO sub-network. I: sowing–silking period. Maydica XXVII
59 – 77.
Derieux, M., Bonhomme, R., 1982b. Heat unit requirements for maize hybrids in Europe:
results of the european FAO sub-network. II: period from silking to maturity.
Maydica XXVII 79 – 96.
Dethier, B.E., Vittum, M.T., 1967. Growing Degree Days in New York State, 1017. New
York State College of Agriculture, Ithaca, NY, Bull, p. 50.
Doherty, C.T., Johnson, L.F., Volk, J., Mauter, M.S., Bambach, N., McElrone, A.J.,
Alfieri, J.G., Hipps, L.E., Prueger, J.H., Castro, S.J., Alsina, M.M., 2022. Effects of
meteorological and land surface modeling uncertainty on errors in winegrape ET
calculated with SIMS. Irrig. Sci. 40, 515–530. https://doi.org/10.1007/s00271-022-
00808-9.
```

Domínguez, A., Jim ́enez, M., Tarjuelo, J.M., de Juan, J.A., Martínez-Romero, A., Leite, K.
N., 2012. Simulation of onion crop behavior under optimized regulated deficit
irrigation using MOPECO model in a semi-arid environment. Agr. Water Manag. 113,
64 – 75. https://doi.org/10.1016/j.agwat.2012.06.019.
Domínguez, A., Martínez-Navarro, A., L ́opez-Mata, E., Tarjuelo, J.M., Martínez-
Romero, A., 2017. Real farm management depending on the available volume of
irrigation water (part I): financial analysis. Agr. Water Manag. 192, 71 – 84. https://
doi.org/10.1016/j.agwat.2017.06.022.
Elnesr, M.N., Alazba, A.A., Alsadon, A.A., 2013. An arithmetic method to determine the
most suitable planting dates for vegetables. Comput. Electron Agr. 90, 131–143.
https://doi.org/10.1016/j.compag.2012.09.010.
Ferreira, A., Rolim, J., Paredes, P., Cameira, M.R., 2022. Assessing spatio-temporal
dynamics of deep percolation using crop evapotranspiration derived from earth
observations through google earth engine. Water 14, 2324. https://doi.org/
10.3390/w14152324.
French, A.N., Sanchez, C.A., Hunsaker, D.J., Anderson, R.G., Saber, M.N., Wisniewski, E.
H., 2024. Lettuce evapotranspiration and crop coefficients using eddy covariance
and remote sensing observations. Irrig. Sci. 42, 1245–1272. https://doi.org/
10.1007/s00271-024-00921-x.
Fresco, N., Bennett, A., Bieniek, P., Rosner, C., 2021. Climate change, farming, and
gardening in Alaska: cultivating opportunities. Sustainability 13 (22), 12713.
https://doi.org/10.3390/su132212713.
Garcia, D., Rolim, J., Cameira, M.R., Belaud, G., Dalezios, N.R., Karoutsos, G., Santos, J.
A., Paredes, P., 2025a. Assessing seasonal forecast performance to predict crop
irrigation requirements to support water management decision-making in the
Mediterranean region. Agric. Water Manag. 313, 109467. https://doi.org/10.1016/
j.agwat.2025.109467.
Garcia, D., Silva, N., Rolim, J., Ferreira, A., Santos, J.A., Cameira, M.R., Paredes, P.,

2025. Prediction of crops cycle with seasonal forecasts to support decision-making.
Agronomy 15, 1291. https://doi.org/10.3390/agronomy15061291.
Gilmore Jr., E.C., Rogers, J.S., 1958. Heat units for measuring maturity in corn. Agron. J.
50, 611–615. https://doi.org/10.2134/agronj1958.00021962005000100014x.
Gim ́enez, L., García-Petillo, M., Paredes, P., Pereira, L.S., 2016. Predicting maize
transpiration, water use and productivity for developing improved supplemental
irrigation schedules in Western Uruguay to cope with climate variability. Water 8,
309. https://doi.org/10.3390/w8070309.
Gim ́enez, L., Paredes, P., Pereira, L.S., 2017. Water use and yield of soybean under
various irrigation regimes and severe water stress. Application of AquaCrop and
SIMDualKc models. Water 9, 393. https://doi.org/10.3390/w9060393.
G ́omez-del-Campo, M., 2013. Summer deficit irrigation in a hedgerow olive orchard cv.
Arbequina: relationship between soil and tree water status, and growth and yield
components. Span. J. Agr. Res. 11 (2), 547–557. https://doi.org/10.5424/sjar/
2013112-3360.
Gonz ́alez, M.G., Ramos, T.B., Carlesso, R., Paredes, P., Petry, M.T., Martins, J.D.,
Aires, N.P., Pereira, L.S., 2015. Modelling soil water dynamics of full and deficit drip
irrigated maize cultivated under a rain shelter. Biosyst. Eng. 132, 1 – 18. https://doi.
org/10.1016/j.biosystemseng.2015.02.001.
Gonz ́alez-Piqueras, J., Jara, F., L ́opez, H., Villodre, J., Hern ́andez, D., Calera, A., L ́opez-
Urrea, R., S ́anchez, J.M., 2019. Determining crop phenology for different varieties of
barley and wheat on intensive plots using proximal remote sensing. Proc. SPIE
11149 Remote Sens Agr. Ecosyst. Hydrol. XXI 111490H 140 – 152. https://doi.org/
10.1117/12.2533091.
Hachisuca, A.M.M., Abdala, M.C., de Souza, E.G., Rodrigues, M., Ganascini, D., Bazzi, C.
L., 2023. Growing degree-hours and degree-days in two management zones for each
phenological stage of wheat ( _triticum aestivum_ L.). Int. J. Biometeorol. 67 (7),
1169 – 1183.
Holzworth, D., Huth, N.I., Fainges, J., Brown, H., Zurcher, E., Cichota, R., Verrall, S.,
Herrmann, N.I., Zheng, B., Snow, V., 2018. APSIM next generation: overcoming
challenges in modernising a farming systems model. Environ. Model. Softw. 103,
43 – 51. https://doi.org/10.1016/j.envsoft.2018.02.002.
Hoogenboom, G., Porter, C.H., Boote, K.J., Shelia, V., Wilkens, P.W., Singh, U., White, J.
W., Asseng, S., Lizaso, J.I., Moreno, L.P., Pavan, W., 2019. The DSSAT crop modeling
ecosystem. In: Boote, K. (Ed.), Advances in Crop Modelling for a Sustainable
Agriculture. Burleigh Dodds Science Publishing, pp. 173–216. https://doi.org/
10.19103/AS.2019.0061.10.
Huntington, J.L., Allen, R.G., 2009. Evapotranspiration and net irrigation water
requirements for nevada. In: Proc. World Environmental and Water Resources
Congress. Great Rivers, ASCE, pp. 4172–4186. https://doi.org/10.1061/41036(342)
420.
Huntington, J.L., Gangopadhyay, S., Spears, M., Allen, R.G., King, D., Morton, C.,
Harrison, A., McEvoy, D., Joros, A., Pruitt, T., 2015. West-wide climate risk
assessments: irrigation demand and reservoir evaporation projections. Technical
memorandum no. 86-68210-2014-01. US Bureau of Reclamation, Denver, CO,
p. 215. https://doi.org/10.13140/RG.2.1.1209.8647.
IPCC, 2022. In: P ̈ortner, H.-O., Roberts, D.C., Tignor, M., Poloczanska, E.S., et al. (Eds.),
Climate Change 2022: Impacts, Adaptation, and Vulnerability. Contribution of
Working Group II to the Sixth Assessment Report of the Intergovernmental Panel on
Climate Change. Cambridge University Press, Cambridge, UK and New York, USA,
p. 3056. https://doi.org/10.1017/9781009325844.
Jadoski, S.O., Carlesso, R., Petry, M.T., Woischick, D., Cervo, L., 2000. Populaç ̃ao de
plantas e espaçamento entre linhas do feijoeiro irrigado. I: comportamento
morfologico ́ das plantas. Ciˆencia Rural 30, 559–565. https://doi.org/10.1590/
S0103-84782000000400001.
Kakabouki, I., Tataridas, A., Mavroeidis, A., Kousta, A., Roussis, I., Katsenios, N.,
Efthimiadou, A., Papastylianou, P., 2021. Introduction of alternative crops in the

```
Mediterranean to satisfy EU Green deal goals. A review. Agron. Sustain. Dev. 41, 71.
https://doi.org/10.1007/s13593-021-00725-9.
Keating, B.A., 2024. APSIM’s origins and the forces shaping its first 30 years of evolution:
a review and reflections. Agron. Sustain. Dev. 44 (3), 24. https://doi.org/10.1007/
s13593-024-00959-3.
Khan, M.S., Hoogenboom, G., Gillani, S.M., Shah, A.S., Khan, I., 2024. Effects of planting
date and genotype on potato growth and yield determination in a Sub-Tropical
continental growing environment. Potato Res. https://doi.org/10.1007/s11540-024-
09833-x.
Laipelt, L., Kayser, R.H.B., Fleischmann, A.S., Ruhoff, A., Bastiaanssen, W., Erickson, T.
A., Melton, F., 2021. Long-term monitoring of evapotranspiration using the SEBAL
algorithm and google earth engine cloud computing. ISPRS J. Photo Remote Sens.
178, 81 – 96. https://doi.org/10.1016/j.isprsjprs.2021.05.018.
Leite, K.N., Cabello, M.J., Valnir Junior, M., Tarjuelo, J.M., Domínguez, A., 2015.
Modelling sustainable salt water management under deficit irrigation conditions for
melon in Spain and Brazil. J. Sci. Food Agr. 95 (11), 2307 – 2318. https://doi.org/
10.1002/jsfa.6951.
L ́ellis, B.C., Carvalho, D.F., Martínez-Romero, A., Tarjuelo, J.M., Domínguez, A., 2017.
Effective management of irrigation water for carrot under constant and optimized
regulated deficit irrigation in Brazil. Agr. Water Manag. 192, 294 – 305. https://doi.
org/10.1016/j.agwat.2017.07.018.
Lionello, P., Giorgi, F., Rohling, E., Seager, R., 2023. Chapter 3 - Mediterranean climate:
past, present and future. In. In: Schroeder, K., Chiggiato, J. (Eds.), Oceanography of
the Mediterranean Sea. Elsevier, pp. 41–91. https://doi.org/10.1016/B978-0-12-
823692-5.00011-X.
L ́opez-Urrea, R., de Santa Olalla, F.M., Montoro, A., L ́opez-Fuster, P., 2009. Single and
dual crop coefficients and water requirements for onion ( allium cepa L.) under
semiarid conditions. Agr. Water Manag. 96 (6), 1031–1036. https://doi.org/
10.1016/j.agwat.2009.02.004.
L ́opez-Urrea, R., Domínguez, A., Pardo, J.J., Montoya, F., García-Vila, M., Martínez-
Romero, A., 2020. Parameterization and comparison of the AquaCrop and MOPECO
models for a high-yielding barley cultivar under different irrigation levels. Agr.
Water Manag. 230, 105931. https://doi.org/10.1016/j.agwat.2019.10593.
L ́opez-Urrea, R., Montoro, A., Trout, T.J., 2014. Consumptive water use and crop
coefficients of irrigated sunflower. Irrig. Sci. 32, 99–109. https://doi.org/10.1007/
s00271-013-0418-9.
L ́opez-Urrea, R., Montoro, A., Ma ̃nas, F., L ́opez-Fuster, P., Fereres, E., 2012.
Evapotranspiration and crop coefficients from lysimeter measurements of mature
tempranillo wine grapes. Agr. Water Manag 112, 13 – 20. https://doi.org/10.1016/j.
agwat.2012.05.009.
L ́opez-Urrea, R., Pardo, J.J., Sim ́on, L., Martínez-Romero, ́A., Montoya, F., Tarjuelo, J.M.,
Domínguez, A., 2021. Assessing a removable mini-lysimeter for monitoring crop
evapotranspiration using a well-established large weighing lysimeter: a case study
for barley and potato. Agronomy 11 (10), 2067. https://doi.org/10.3390/
agronomy11102067.
Marin, S.L.D., Gomes, J.A., Salgado, J.S., Martins, D.S., Fullin, E.A., 1995.
Recomendaç ̃oes para a Cultura do Mamoeiro dos Grupos Solo e Formosa no Estado
do Espírito Santo. Circular T ́ecnica, 3. 4ª.ed. EMBRAPA, Vit ́oria, 57 p. (In
Portuguease).
Martínez-L ́opez, J.A., Lopez-Urrea, ́ R., Martínez-Romero, A., Pardo, ́ J.J., Montoya, F.,
Domínguez, A., 2022a. Improving the sustainability and profitability of oat and
garlic crops in a Mediterranean agro-ecosystem under water-scarce conditions.
Agronomy 12 (8), 1950. https://doi.org/10.3390/agronomy12081950.
Martínez-L ́opez, J.A., Lopez-Urrea, ́ R., Martínez-Romero, A., Pardo, ́ J.J., Montero, J.,
Domínguez, A., 2022b. Sustainable production of barley in a water-scarce
mediterranean agroecosystem. Agronomy 12 (6), 1358. https://doi.org/10.3390/
agronomy12061358.
Martínez-Romero, A., Domínguez, A., Landeras, G., 2019. Regulated deficit irrigation
strategies for different potato cultivars under continental Mediterranean-Atlantic
conditions. Agr. Water Manag. 216, 164 – 176. https://doi.org/10.1016/j.
agwat.2019.01.030.
Martins, J.D., Rodrigues, G.C., Paredes, P., Carlesso, R., Oliveira, Z.B., Knies, A.E.,
Petry, M.T., Pereira, L.S., 2013. Dual crop coefficients for maize in Southern Brazil:
model testing for sprinkler and drip irrigation and mulched soil. Biosyst. Eng. 115,
291 – 310. https://doi.org/10.1016/j.biosystemseng.2013.03.016.
Maynard, D.N., Hochmuth, G.J., 2007. Knott’s handbook for vegetable growers. Fifth
edition. John Wiley, Sons, p. 238.
McMaster, G.S., Wilhelm, W.W., 1997. Growing degree-days: one equation, two
interpretations. Agr. Meteor. 87, 291–300. https://doi.org/10.1016/S0168-
(97)00027-0.
Memmi, H., Gij ́on, M.C., Couceiro, J.F., P ́erez-L ́opez, D., 2016. Water stress thresholds
for regulated deficit irrigation in pistachio trees: rootstock influence and effects on
yield quality. Agr. Water Manag. 164, 58 – 72. https://doi.org/10.1016/j.
agwat.2015.08.006.
Miao, Q., Rosa, R.D., Shi, H., Paredes, P., Zhu, L., Dai, J., Gonçalves, J.M., Pereira, L.S.,
```
2016. Modeling water use, transpiration and soil evaporation of spring wheat–maize
and spring wheat–sunflower relay intercropping using the dual crop coefficient
approach. Agr. Water Manag. 165, 211 – 229. https://doi.org/10.1016/j.
agwat.2015.10.024.
Mir ́as-Avalos, J.M., Gonzalez-Dugo, V., García-Tejero, I.F., L ́opez-Urrea, R.,
Intrigliolo, D.S., Egea, G., 2023. Quantitative analysis of almond yield response to
irrigation regimes in Mediterranean Spain. Agr. Water Manag. 279, 108208. https://
doi.org/10.1016/j.agwat.2023.108208.
Monteith, J.L., 1981. Climatic variation and the growth of crops. Q J. R. Meteor Soc. 107
(454), 749 – 774. https://doi.org/10.1002/qj.49710745402.


Montoya, F., Camargo, D., C ́orcoles, J.I., Domínguez, A., Ortega, J.F., 2019. Analysis of
deficit irrigation strategies by using SUBSTOR-Potato model in a semi-arid area.
J. Agr. Sci. 157 (7-8), 578 – 591. https://doi.org/10.1017/S002185961900090X.
Montoya, F., S ́anchez, J.M., Gonz ́alez-Piqueras, J., Lopez-Urrea, ́ R., 2022. Is the
subsurface drip the most sustainable irrigation system for almond orchards in water-
scarce areas? Agronomy 12 (8), 1778. https://doi.org/10.3390/
agronomy12081778.
Normand, F., L ́echaudel, M., 2004. Toward a better interpretation and use of thermal
time models. Acta Hortic. (707), 159 – 165. https://doi.org/10.17660/
ActaHortic.2006.707.19.
Oliveira, Z.B., Carlesso, R., Knies, A.E., Martins, J.D., François, T., Petry, M.T., 2011.
Extraç ̃ao de ́agua do solo pelo feijoeiro cultivado com diferentes espaçamentos,
entrelinhas e quantidades de resíduos vegetais na superfície do solo. Irriga 16 (4),
403 – 412. https://doi.org/10.15809/irriga.2011v16n4p403 (In Portuguese).
Orlandi, F., Vazquez, L.M., Ruga, L., Bonofiglio, T., Fornaciari, M., Garcia-Mozo, H.,
Dominguez, E., Romano, B., Galan, C., 2005. Bioclimatic requirements for olive
flowering in two Mediterranean regions located at the same latitude (Andalucía,
Spain, and Sicily, Italy). Ann. Agric. Environ. Med. 12, 47– 52.
Paço, T.A., Pˆoças, I., Cunha, M., Silvestre, J.C., Santos, F.L., Paredes, P., Pereira, L.S.,

2014. Evapotranspiration and crop coefficients for a super intensive olive orchard.
An application of SIMDualKc and METRIC models using ground and satellite
observations. J. Hydrol. 519, 2067 – 2080. https://doi.org/10.1016/j.
jhydrol.2014.09.075.
Pardo, J.J., Domínguez, A., L ́ellis, B.C., Montoya, F., Tarjuelo, J.M., Martínez-
Romero, A., 2022. Effect of the optimized regulated deficit irrigation methodology
on quality, profitability and sustainability of barley in water scarce areas. Agr. Water
Manag. 266, 107573. https://doi.org/10.1016/j.agwat.2022.107573.
Paredes, P., D’Agostino, D., Assif, M., Todorovic, M., Pereira, L.S., 2018. Assessing potato
transpiration, yield and water productivity under various water regimes and
planting dates using the FAO dual kc approach. Agr. Water Manag. 195, 11 – 24.
https://doi.org/10.1016/j.agwat.2017.09.011.
Paredes, P., L ́opez-Urrea, R., Martínez-Romero, A., Petry, ́ M., Cameira, M.R.,
Montoya, F., Almeida, W., Salman, M., Pereira, L.S., 2025. Base and upper
temperature thresholds to support the calculation of growing degree days aiming at
their use with the FAO56rev crop coefficients curve: A review. Agr. Water Manag.
319, 109755. https://doi.org/10.1016/j.agwat.2025.109755.
Paredes, P., Pereira, L.S., Rodrigues, G.C., Botelho, N., Torres, M.O., 2017. Using the FAO
dual crop coefficient approach to model water use and productivity of processing pea
( _pisum sativum_ L.) as influenced by irrigation strategies. In: Agr Water Manage, 189,
pp. 5–18. https://doi.org/10.1016/j.agwat.2017.04.010.
Paredes, P., Rodrigues, G.C., Alves, I., Pereira, L.S., 2014. Partitioning
evapotranspiration, yield prediction and economic returns of maize under various
irrigation management strategies. Agr. Water Manag. 135, 27 – 39. https://doi.org/
10.1016/j.agwat.2013.12.010.
Pereira, L.S., Allen, R.G., Paredes, P., L ́opez-Urrea, R., Raes, D., Smith, M., Kilic, A.,
Salman, M., 2025. Crop Evapotranspiration. Guidelines for Computing Crop Water
Requirements. FAO Irrig Drain Paper 56rev, FAO, Rome (in Press).
Pereira, L.S., Paredes, P., Jovanovic, N., 2020. Soil water balance models for determining
crop water and irrigation requirements and irrigation scheduling focusing on the
FAO56 method and the dual kc approach. Agr. Water Manag. 241, 106357. https://
doi.org/10.1016/j.agwat.2020.106357.
Pereira, L.S., Paredes, P., Melton, F., Johnson, L., Mota, M., Wang, T., 2021. Prediction of
crop coefficients from fraction of ground cover and height. Practical application to
vegetable, field and fruit crops with focus on parameterization. Agr. Water Manag.
252, 106663. https://doi.org/10.1016/j.agwat.2020.106663.
Pereira, L.S., Paredes, P., Rodrigues, G.C., Neves, M., 2015. Modeling malt barley water
use and evapotranspiration partitioning in two contrasting rainfall years. Assessing
AquaCrop and SIMDualKc models. Agr. Water Manag. 159, 239 – 254. https://doi.
org/10.1016/j.agwat.2015.06.006.
Pessotto, M.V., Roberts, T.L., Bertucci, M., Santos, C.D., Ross, J., Savin, M., 2023.
Determining cardinal temperatures for eight cover crop species. Agrosystems Geosci.
Environ. 6 (3). https://doi.org/10.1002/agg2.20393.
Petry, M.T., Magalh ̃aes, T.F., Paredes, P., Martins, J.D., Ferrazza, C.M., Hünemeier, G.A.,
Pereira, L.S., 2024a. Water use and crop coefficients of soybean cultivars of diverse
maturity groups and assessment of related water management strategies. Irrig. Sci.
42, 1–16. https://doi.org/10.1007/s00271-023-00871-w.
Petry, M.T., Tonetto, F., Martins, J.D., Slim, J.E., Werle, R., Gonçalves, A.F., Paredes, P.,
Pereira, L.S., 2024b. Evapotranspiration and crop coefficients of sprinkler irrigated
aerobic rice in Southern Brazil using the SIMDualKc water balance model. Irrig. Sci.
https://doi.org/10.1007/s00271-024-00917-7.
Pˆoças, I., Calera, A., Campos, I., Cunha, M., 2020. Remote sensing for estimating and
mapping single and basal crop coefficientes: a review on spectral vegetation indices
approaches. Agr. Water Manag. 233, 106081. https://doi.org/10.1016/j.
agwat.2020.106081.

```
Purcell, L.C., 2003. Comparison of thermal units derived from daily and hourly
temperatures. In: Crop Sci, 43, pp. 1874–1879. https://doi.org/10.2135/
cropsci2003.1874.
Raes, D., Fereres, E., Vila, M.G., Curnel, Y., Knoden, D., Çelik, S.K., Ucar, Y., Türk, M.,
Wellens, J., 2023. Simulation of alfalfa yield with AquaCrop. Agr. Water Manag.
284, 108341. https://doi.org/10.1016/j.agwat.2023.108341.
Ramos, T.B., Darouich, H., Oliveira, A.R., Farzamian, M., Monteiro, T., Castanheira, N.,
Paz, A., Gonçalves, M.C., Pereira, L.S., 2023. Water use and soil water balance of
Mediterranean tree crops assessed with the SIMDualKc model in orchards of
Southern Portugal. Agr. Water Manag. 279, 108209. https://doi.org/10.1016/j.
agwat.2023.108209.
Rasul, G., Chaudhry, Q.Z., Mahmood, A., Hyder, K.W., 2011. Effect of temperature rise
on crop growth and productivity. In: Pak J Meteorol, 8, pp. 53– 62.
R ́eaumur, R., 1735. Observations du thermom`etre faites pendant l’ann ́ee MDCCXXXV
compar ́ees `a celles qui ont ́et ́e faites sous la ligne `a l’Isle-de-France, `a alger et en
quelquesunes de nos isles de l’Am ́erique. M ́emoires De. l’Acad. ́emie R. Des. Sci.
545 – 576.
Ritchie, J.T., Nesmith, D.S., 1991. Temperature and crop growth. J.Hanks J.T.Ritchie
(Eds) Model. Plant Soil Syst. 31, 5–29. https://doi.org/10.2134/agronmonogr31.c2.
Rosa, R.D., Paredes, P., Rodrigues, G.C., Alves, I., Allen, R.G., Pereira, L.S., 2012.
Implementing the dual crop coefficient approach in interactive software. 1.
background and computational strategy. Agr. Water Manag. 103, 8 – 24. https://doi.
org/10.1016/j.agwat.2011.10.013.
Ruml, M., Vukovi ́c, A., Milatovi ́c, D., 2010. Evaluation of different methods for
determining growing degree-day thresholds in apricot cultivars. Int. J. Biometeorol.
54, 411–422. https://doi.org/10.1007/s00484-009-0292-6.
Saadi, S., Todorovic, M., Tanasijevic, L., Pereira, L.S., Pizzigalli, C., Lionello, P., 2015.
Climate change and Mediterranean agriculture: impacts on winter wheat and tomato
crop evapotranspiration, irrigation requirements and yield. Agric. Water Manag.
147, 103 – 115. https://doi.org/10.1016/j.agwat.2014.05.008.
Salman, M., Garcia Vila, M., Fereres, E., Raes, D., Steduto, P., Heng, L., De Lannoy, G.,
Wellens, J., Foster, T., Busschaert, L., Bechtold, M., 2025. AquaCrop on the ground:
model applications for sustainable agricultural water management. FAO Water
Report nº 48. FAO, p. 78. https://doi.org/10.4060/cd4207en.
S ́anchez, J.M., L ́opez-Urrea, R., Rubio, E., Gonz ́alez-Piqueras, J., Caselles, V., 2014.
Assessing crop coefficients of sunflower and canola using two-source energy balance
and thermal radiometry. Agr. Water Manag. 137, 23 – 29. https://doi.org/10.1016/j.
agwat.2014.02.002.
S ́anchez, J.M., Sim ́on, L., Gonz ́alez-Piqueras, J., Montoya, F., L ́opez-Urrea, R., 2021.
Monitoring crop evapotranspiration and transpiration / evaporation partitioning in a
drip-irrigated young almond orchard applying a two-source surface energy balance
model. Water 13 (15), 2073. https://doi.org/10.3390/w13152073.
Soares, D., Paredes, P., Paço, T.A., Rolim, J., 2025. Projected bioclimatic changes in
Portugal: assessing maize future suitability. Agronomy 15, 592. https://doi.org/
10.3390/agronomy15030592.
Steduto, P., Hsiao, T.C., Fereres, E., Raes, D., 2012. Crop Yield Response to Water. FAO
Irrig Drain Paper No. 66. FAO, Rome, 500p.
Tanasijevic, L., Todorovic, M., Pizzigalli, C., Lionello, P., Pereira, L.S., 2014. Impacts of
climate change on olive crop evapotranspiration and irrigation requirements in the
Mediterranean region. Agr. Water Manag. 144, 54 – 68. https://doi.org/10.1016/j.
agwat.2014.05.019.
Wang, J.Y., 1960. A critique of the heat unit approach to plant response studies. Ecology
41, 785–789. https://doi.org/10.2307/1931815.
Wei, Z., Paredes, P., Liu, Y., Chi, W.W., Pereira, L.S., 2015. Modelling transpiration, soil
evaporation and yield prediction of soybean in north China plain. Agr. Water Manag.
147, 43 – 53. https://doi.org/10.1016/j.agwat.2014.05.004.
Yang, C., Fraga, H., van Ieperen, W., Santos, J.A., 2020. Assessing the impacts of recent-
past climatic constraints on potential wheat yield and adaptation options under
Mediterranean climate in Southern Portugal. Agric. Sys 182, 102844. https://doi.
org/10.1016/j.agsy.2020.102844.
Zhang, B., Liu, Y., Xu, D., Zhao, N., Lei, B., Rosa, R.D., Paredes, P., Paço, T.A., Pereira, L.
S., 2013. The dual crop coefficient approach to estimate and partitioning
evapotranspiration of the winter wheat - summer maize crop sequence in north
China plain. Irrig. Sci. 31, 1303–1316. https://doi.org/10.1007/s00271-013-0405-
1.
Zhang, Y., Lu, P., Ren, T., Lu, J., Wang, L., 2020. Dynamics of growth and nitrogen
capture in winter oilseed rape hybrid and line cultivars under contrasting n supply.
Agronomy 10 (8), 1183. https://doi.org/10.3390/agronomy10081183.
Zhao, N., Liu, Y., Cai, J., Paredes, P., Rosa, R.D., Pereira, L.S., 2013. Dual crop coefficient
modelling applied to the winter wheat - summer maize crop sequence in north China
plain: basal crop coefficients and soil evaporation component. Agr. Water Manag.
117, 93 – 105. https://doi.org/10.1016/j.agwat.2012.11.008.
```

