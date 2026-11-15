// Muyuy · campo.js: lo que pide el reto «Field Shift» y que faltaba en la vista del agricultor.
//  1. Tendencias de 1981 a hoy (Theil-Sen y Mann-Kendall) con la lluvia, el balance de agua, las heladas y el calor;
//     más satélites sin cuenta (Grace/GRACE-FO, GEDI y Modis LST), contraste NASA Power ↔ ERA5 y la lluvia hecha sonido.
//  2. Lo que limita al agricultor: cultivos que no puede sembrar y si necesita forraje (cambian el orden de las rotaciones).
//  3. Calendario de la chacra: meses sin cultivo, meses en que cada cultivo es más vulnerable y oportunidades.
//  4. Comparador de estrategias (la de hoy + 3): nutrientes, erosión, materia orgánica, plagas, agua, forraje y mercado;
//     y una ficha por estrategia: por qué se sugirió, evidencia, beneficios, lagunas de información y riesgos.
//  5. «¿Y si…?»: deslizadores de lluvia, temperatura y precio que vuelven a correr el motor con esas rotaciones.
//  6. Cómo leer los datos: términos, satélite frente a medición en tierra, armonización, incertidumbre y lo que Muyuy no sabe.
// Ideas tomadas de los anteproyectos de Space Apps Moquegua 2026 (docs/12): tendencias con Theil-Sen y Mann-Kendall y la
// incertidumbre visible (WasteGuard AI), cada cifra contrastada con una segunda fuente (Los Causas Espaciales), la
// sonificación y la vibración (Ayni Orbital), el simulador de sequía y precios (Automatic) y los gráficos del clima (Santa Ana).
"use strict";

// ---------------------------------------------------------------- textos (es, en; qu, lo demás cae al español)
Object.assign(I18N.es, {
  tdT: "📈 Su clima desde 1981", tdS: "Una línea por campaña (agosto a julio). La línea punteada es la tendencia.",
  tdLluvia: "Lluvia de la campaña", tdBal: "¿Alcanza la lluvia? (lluvia menos lo que secan el sol y el viento)", tdHel: "Noches con helada (bajo 0 °C)",
  tdTmin: "Temperatura mínima media", tdCalor: "Mes más caluroso",
  tdProm: "promedio {v}", tdUlt: "última campaña {a}: {v} ({d} frente al promedio)",
  tdSube: "sube {v} por década", tdBaja: "baja {v} por década", tdClara: "tendencia clara", tdNoClara: "sin tendencia clara",
  tdNota: "«Tendencia clara» quiere decir que el cambio se repite año tras año: es poco probable que sea casualidad.",
  tdEscuchar: "🎵 Escuchar 45 años de lluvia", tdParar: "⏹ Parar", tdEscS: "Cada nota es una campaña: más aguda, más lluvia. Un golpe grave (y vibración) marca las más secas.",
  tdMas: "🛰️ Más satélites de la NASA para su chacra (con internet)",
  grT: "💧 Agua guardada en la región (Grace y Grace-FO)", grBtn: "Ver 20 años de Grace",
  grS: "Agua de toda la región (suelo, acuíferos, lagos y nieve) frente al promedio 2004-2009, en centímetros. Cada punto es de 300 km de lado: no es su pozo, es la reserva de la cuenca.",
  grRes: "Tendencia: {t} por década ({c}). Último dato: {u} cm ({f}).", grBaja: "la reserva de agua de la región baja", grSube: "la reserva de agua de la región sube",
  gedT: "🌳 Biomasa sobre el suelo (GEDI)", gedBtn: "Ver GEDI", gedRes: "{v} toneladas por hectárea de biomasa alrededor de su chacra (GEDI, láser de la Estación Espacial, 1 km, 2019-2023).",
  gedNo: "GEDI no tiene datos en este punto (solo mide entre 52° norte y sur y no en todos los kilómetros).",
  lstT: "🌡️ Temperatura de la superficie de día (Modis)", lstBtn: "Ver Modis LST", lstRes: "{v} °C en la superficie del suelo a las 10:30 de la mañana (promedio de {n} días sin nubes, hasta el {f}). El aire suele estar varios grados más fresco.",
  lstNo: "Las nubes taparon su chacra los últimos 16 días: Modis no la pudo ver.",
  ecoNota: "Ecostress (temperatura y estrés de las plantas a 70 m) pide una cuenta de NASA Earthdata y no tiene capa abierta: Muyuy usa Modis LST (1 km) en su lugar.",
  cmpT: "⚖️ Contraste de fuentes: lluvia de la última campaña", cmpBtn: "Comparar NASA Power con ERA5",
  cmpRes: "Campaña {a}: NASA Power {p} mm (corregido por Muyuy: {pc} mm) · ERA5 (Copernicus, vía Open-Meteo) {e} mm.",
  cmpOk: "✔ Las dos fuentes coinciden (diferencia {d} %).", cmpMal: "⚠ Las fuentes no coinciden (diferencia {d} %): compare con la estación de Senamhi más cercana o con lo que recuerda la comunidad antes de decidir.",
  satErr: "No se pudo leer el satélite (sin internet o el servicio no respondió). Intente de nuevo.", cargandoSat: "Leyendo el satélite…",
  rsT: "🧰 Lo que limita su chacra", rsS: "Muyuy solo le propone lo que usted puede hacer.",
  rsExcl: "🚫 Cultivos que no puede sembrar (sin semilla, herramientas o comprador)", rsExclS: "Toque un cultivo para quitarlo o volver a ponerlo.",
  rsForraje: "🐄 ¿Necesita pasto o forraje para sus animales?", rsNo: "No", rsSi: "Sí, me importa",
  rsAgua: "💧 Riego: {r} (se cambia en el paso 1).", rsSinRiego: "solo lluvia", rsConRiego: "tiene riego",
  rsQuitados: "Quitó: {c}.", rsTodos: "No puede quitar todos los cultivos.",
  caT: "🗓️ El calendario de su chacra", caS: "Tres campañas, de agosto a julio.",
  caLluvia: "Lluvia", caEt: "Lo que secan el sol y el viento", caHel: "Noches de helada", caMm: "mm por mes",
  caVacia: "chacra vacía", caDesc: "descanso", caVuln: "mes delicado",
  caVulnHel: "❄️ {c}: en {m} hay {n} noches de helada, cuando la planta es más delicada.",
  caVulnSeco: "☀️ {c}: en {m} llueve {p} mm y la planta pide {e} mm, cuando es más delicada.",
  caVulnExc: "💧 {c}: en {m} llueven {p} mm; el exceso de agua puede pudrir la raíz o la cosecha.",
  caVaciaTxt: "🍂 De {a} a {b}: chacra vacía ({n} meses).",
  caOpVerde: "💡 En esos meses llueven {p} mm: un abono verde corto ({c}) cubriría la tierra y dejaría nitrógeno.",
  caOpRastrojo: "💡 En esos meses llueve poco ({p} mm): deje el rastrojo encima para proteger la tierra y guardar humedad.",
  caNada: "✔ La chacra casi nunca queda vacía.",
  caSinMotor: "El calendario necesita el clima diario de este lugar (solo está en los lugares del Perú).",
  esT: "⚖️ Lo que siembra hoy frente a 3 posibilidades", esS: "Lea fila por fila: el ✓ verde marca la mejor de cada fila.",
  esHoy: "Hoy", esOpc: "Opción {i}", esCrit: "¿Qué se compara?",
  cAnios: "✅ Años en que le iría bien", cSeco: "☀️ En años secos", cNino: "🌧️ En años El Niño", cAgua: "💧 Agua que piden los cultivos", cNut: "🧪 Nitrógeno (sin contar el abono)",
  cMo: "🟫 Materia orgánica", cEro: "⛰️ Tierra que se lleva la lluvia", cPlaga: "🐛 Ciclo de plagas", cForr: "🐄 Forraje para animales", cIng: "💰 Ingreso por hectárea al año", cHel: "❄️ Daño por helada",
  vDeDiez: "{n} de 10", vMm: "{v} mm ({p} mm de lluvia)", vNmas: "deja +{v} kg", vNmenos: "saca {v} kg", vMoSube: "sube {v} %", vMoBaja: "baja {v} %", vMoIgual: "se mantiene",
  vEro: "{v} t/ha", vEroOk: "{v} t/ha · tolerable", vPlagaOk: "corta el ciclo", vPlagaMal: "repite {f}", vForrAlto: "mucho", vForrMedio: "algo", vForrBajo: "poco",
  vIng: "S/ {v}", vIngMal: "podría perder S/ {v}", vHelSi: "en {n} cultivo(s)", vHelNo: "no",
  esFicha: "📋 Cada posibilidad, explicada",
  fPorque: "🎯 Por qué aparece", fEvid: "🔬 Evidencia", fBen: "🌱 Qué gana", fLag: "❓ Datos que faltan", fRies: "⚠️ Qué revisar con la comunidad o un técnico",
  fpHoy: "Es lo que siembra hoy: sirve para comparar.",
  fpRank: "Con sus prioridades del paso 2 sale n.° {r} de {n} probadas.",
  fpDest: "Destaca en: {k}.", fpVsHoy: "Frente a hoy: {d}.",
  kAgua: "agua", kIngreso: "ingreso", kSuelo: "suelo", kRiesgo: "no perder",
  feClima: "Probada con el clima diario de NASA Power de {a} a {b} ({n} campañas, ventanas de 3 años seguidos), corregido a {z} m de altura.",
  feRes: "Funcionó {r} de cada 10 veces; en años El Niño {ni} de 10; en años secos {s} de 10. La peor campaña fue {p}.",
  feMet: "Agua: cuánta pide cada cultivo, día por día, frente a la lluvia. Suelo: mapa mundial de suelos. Tierra que se lleva la lluvia: calculada con la pendiente de su chacra ({pe} %).",
  bN: "🫘 {c}: fija nitrógeno del aire; el cultivo siguiente necesita menos abono.",
  bCob: "☘️ {c}: cubre bien la tierra; entra más agua y se pierde menos tierra.",
  bRaiz: "🌳 {c}: raíz profunda; abre el suelo y deja entrar el agua.",
  bSeq: "🌵 {c}: aguanta mejor la sequía.",
  bFam: "🐛 No repite familia: las plagas del suelo no encuentran comida dos campañas seguidas.",
  bDesc: "🍂 Una campaña de descanso: la tierra recupera materia orgánica.",
  bMas: "📈 Frente a lo de hoy: {d}.", bForr: "🐄 Da pasto, paja o rastrojo para los animales.",
  lConf: "La tabla de {c} se armó con datos aproximados (confianza baja): validar con el INIA o una agencia agraria.",
  lPrecio: "Los precios son promedios del Midagri y los costos, del INEI; no son los de su feria: pregunte cuánto pagan hoy por {c}.",
  lSuelo: "El suelo sale de un mapa mundial: un análisis de suelo de su chacra lo haría más preciso.",
  lClima: "La lluvia sale de una celda de unos 50 km corregida por altura; en quebradas y laderas puede ser distinta. Falta calibrarla con estaciones de Senamhi.",
  lPlagas: "Muyuy no conoce las plagas de su zona: solo sabe que repetir la familia las favorece.",
  lNuevo: "Usted no ha sembrado antes {c}: no hay experiencia propia en su chacra.",
  lAsoc: "{c} se calcula de forma simple (dos cultivos en el mismo surco): la competencia por agua y luz puede ser distinta.",
  rAle: "{t}", rPeor: "En la peor campaña ({p}) no habría cubierto los costos." ,
  rSemilla: "¿Hay semilla buena de {c} en su zona?", rMercado: "¿Quién compra {c} y a cuánto?",
  rHelada: "¿En qué fecha siembran {c} los mayores para escapar de la helada?", rDecide: "Nada especial que revisar: usted decide.",
  siT: "🎚️ ¿Y si cambia el clima o el precio?", siS: "Mueva las barras. Es un ensayo con los mismos 45 años, no un pronóstico.",
  siLluvia: "🌧️ ¿Y si llueve más o menos?", siTemp: "🌡️ ¿Y si hace más calor?", siPrecio: "💰 ¿Y si el precio sube o baja?", siIgual: "igual", siReset: "↺ Volver a los datos reales",
  siCol: "Posibilidad", siFun: "Años en que le iría bien", siIng: "Ingreso por año", siMejor: "Aguanta mejor: {c}.", siCalc: "Calculando…",
  siNota: "Con más calor, las plantas piden más agua (unos 3 % más por grado). El precio solo cambia la venta; los costos quedan igual.",
  leT: "📚 Información extra", leS: "Para consultar cuando quiera; para decidir bastan los 6 pasos. Toque un tema o búsquelo.",
  leSat: "🛰️ Los datos de la NASA que usa Muyuy", leTer: "📖 Palabras que usa Muyuy", leTerTec: "Términos técnicos", leSvt: "📡 Satélite o medición en tierra", leArm: "🧩 Cómo se juntan datos de distinto tamaño", leInc: "🎲 Incertidumbre: cuánto confiar",
  leCult: "🌱 Cultivos que cuidan el suelo", leJuicio: "🧑‍🌾 Cuándo manda su criterio",
  thDato: "Dato", thMide: "Qué mide", thRes: "Tamaño del píxel", thUso: "Para qué lo usa Muyuy",
  tN: "Fijan nitrógeno", tCob: "Cubren la tierra", tRaiz: "Raíz profunda", tSeq: "Aguantan la sequía", tAqui: "En su zona: {c}.", tNinguno: "ninguno en la tabla de su zona",
});
Object.assign(I18N.en, {
  tdT: "📈 Your climate since 1981", tdS: "One line per season (August to July). The dotted line is the trend.",
  tdLluvia: "Season rainfall", tdBal: "Is the rain enough? (rain minus what sun and wind dry out)", tdHel: "Frost nights (below 0 °C)", tdTmin: "Mean minimum temperature", tdCalor: "Hottest month",
  tdProm: "average {v}", tdUlt: "last season {a}: {v} ({d} vs. the average)",
  tdSube: "up {v} per decade", tdBaja: "down {v} per decade", tdClara: "clear trend", tdNoClara: "no clear trend",
  tdNota: "“Clear trend” means the change repeats year after year: it is unlikely to be chance.",
  tdEscuchar: "🎵 Listen to 45 years of rain", tdParar: "⏹ Stop", tdEscS: "Each note is a season: higher pitch, more rain. A low thump (and vibration) marks the driest.",
  tdMas: "🛰️ More NASA satellites for your farm (needs internet)",
  grT: "💧 Water stored in the region (Grace and Grace-FO)", grBtn: "Show 20 years of Grace",
  grS: "Water of the whole region (soil, aquifers, lakes and snow) vs. the 2004-2009 average, in centimetres. Each point is 300 km wide: it is not your well, it is the basin's reserve.",
  grRes: "Trend: {t} per decade ({c}). Latest value: {u} cm ({f}).", grBaja: "the region's water reserve is falling", grSube: "the region's water reserve is rising",
  gedT: "🌳 Aboveground biomass (GEDI)", gedBtn: "Show GEDI", gedRes: "{v} tonnes per hectare of biomass around your farm (GEDI, Space Station lidar, 1 km, 2019-2023).",
  gedNo: "GEDI has no data at this point (it only measures between 52° N and S, and not every kilometre).",
  lstT: "🌡️ Daytime land surface temperature (Modis)", lstBtn: "Show Modis LST", lstRes: "{v} °C at the soil surface at 10:30 am (average of {n} cloud-free days, up to {f}). The air is usually several degrees cooler.",
  lstNo: "Clouds covered your farm for the last 16 days: Modis could not see it.",
  ecoNota: "Ecostress (plant temperature and stress at 70 m) needs a NASA Earthdata account and has no open layer: Muyuy uses Modis LST (1 km) instead.",
  cmpT: "⚖️ Cross-checking sources: last season's rainfall", cmpBtn: "Compare NASA Power with ERA5",
  cmpRes: "Season {a}: NASA Power {p} mm (corrected by Muyuy: {pc} mm) · ERA5 (Copernicus, via Open-Meteo) {e} mm.",
  cmpOk: "✔ Both sources agree (difference {d} %).", cmpMal: "⚠ The sources disagree (difference {d} %): check against the nearest Senamhi station or the community's memory before deciding.",
  satErr: "Could not read the satellite (no internet or the service did not answer). Try again.", cargandoSat: "Reading the satellite…",
  rsT: "🧰 What limits your farm", rsS: "Muyuy only suggests what you can actually do.",
  rsExcl: "🚫 Crops you cannot grow (no seed, tools or buyer)", rsExclS: "Tap a crop to remove it or put it back.",
  rsForraje: "🐄 Do you need pasture or fodder for your animals?", rsNo: "No", rsSi: "Yes, it matters",
  rsAgua: "💧 Irrigation: {r} (change it in step 1).", rsSinRiego: "rain only", rsConRiego: "has irrigation",
  rsQuitados: "Removed: {c}.", rsTodos: "You cannot remove every crop.",
  caT: "🗓️ Your farm's calendar", caS: "Three seasons, August to July.",
  caLluvia: "Rain", caEt: "What sun and wind dry out", caHel: "Frost nights", caMm: "mm per month",
  caVacia: "empty field", caDesc: "fallow", caVuln: "sensitive month",
  caVulnHel: "❄️ {c}: in {m} there are {n} frost nights, when the plant is most sensitive.",
  caVulnSeco: "☀️ {c}: in {m} it rains {p} mm and the plant needs {e} mm, when it is most sensitive.",
  caVulnExc: "💧 {c}: in {m} it rains {p} mm; excess water can rot roots or harvest.",
  caVaciaTxt: "🍂 From {a} to {b}: empty field ({n} months).",
  caOpVerde: "💡 {p} mm of rain fall in those months: a short green manure ({c}) would cover the soil and leave nitrogen.",
  caOpRastrojo: "💡 Little rain in those months ({p} mm): leave the residue on top to protect the soil and keep moisture.",
  caNada: "✔ The field is almost never empty.",
  caSinMotor: "The calendar needs this place's daily climate (only available for places in Peru).",
  esT: "⚖️ What you grow today vs. 3 possibilities", esS: "Read row by row: the green ✓ marks the best of each row.",
  esHoy: "Today", esOpc: "Option {i}", esCrit: "What is compared?",
  cAnios: "✅ Years it works", cSeco: "☀️ In dry years", cNino: "🌧️ In El Niño years", cAgua: "💧 Water the crops need", cNut: "🧪 Nitrogen (without manure)",
  cMo: "🟫 Organic matter", cEro: "⛰️ Soil washed away", cPlaga: "🐛 Pest cycle", cForr: "🐄 Fodder for animals", cIng: "💰 Income per hectare per year", cHel: "❄️ Frost damage",
  vDeDiez: "{n} of 10", vMm: "{v} mm ({p} mm of rain)", vNmas: "adds +{v} kg", vNmenos: "removes {v} kg", vMoSube: "up {v} %", vMoBaja: "down {v} %", vMoIgual: "stays the same",
  vEro: "{v} t/ha", vEroOk: "{v} t/ha · tolerable", vPlagaOk: "breaks the cycle", vPlagaMal: "repeats {f}", vForrAlto: "a lot", vForrMedio: "some", vForrBajo: "little",
  vIng: "S/ {v}", vIngMal: "could lose S/ {v}", vHelSi: "in {n} crop(s)", vHelNo: "no",
  esFicha: "📋 Each possibility, explained",
  fPorque: "🎯 Why it appears", fEvid: "🔬 Evidence", fBen: "🌱 What you gain", fLag: "❓ Missing data", fRies: "⚠️ What to check with the community or an agent",
  fpHoy: "This is what you grow today: it is the baseline.",
  fpRank: "With your step 2 priorities it ranks #{r} of {n} tested.",
  fpDest: "Stands out in: {k}.", fpVsHoy: "Compared with today: {d}.",
  kAgua: "water", kIngreso: "income", kSuelo: "soil", kRiesgo: "not losing",
  feClima: "Tested with NASA Power daily weather from {a} to {b} ({n} seasons, 3-year windows), corrected to {z} m elevation.",
  feRes: "It worked {r} out of 10 times; in El Niño years {ni} of 10; in dry years {s} of 10. The worst season was {p}.",
  feMet: "Water: how much each crop needs, day by day, against the rain. Soil: world soil map. Soil washed away: calculated with your farm's slope ({pe} %).",
  bN: "🫘 {c}: fixes nitrogen from the air; the next crop needs less fertilizer.",
  bCob: "☘️ {c}: covers the soil well; more water soaks in and less soil is lost.",
  bRaiz: "🌳 {c}: deep roots; opens the soil and lets water in.",
  bSeq: "🌵 {c}: copes better with drought.",
  bFam: "🐛 Never repeats a family: soil pests find no food two seasons in a row.",
  bDesc: "🍂 One fallow season: the soil recovers organic matter.",
  bMas: "📈 Compared with today: {d}.", bForr: "🐄 Gives pasture, straw or stubble for animals.",
  lConf: "The data for {c} are approximate (low confidence): validate with INIA or a local agricultural agency.",
  lPrecio: "Prices are Midagri averages and costs come from INEI; they are not your market's: ask what {c} sells for today.",
  lSuelo: "Soil comes from a world map: a soil test from your field would make it more accurate.",
  lClima: "Rain comes from a ~50 km cell corrected for elevation; in valleys and slopes it can differ. It still needs calibration with Senamhi stations.",
  lPlagas: "Muyuy does not know your local pests: it only knows that repeating a family favours them.",
  lNuevo: "You have not grown {c} before: there is no first-hand experience on your farm.",
  lAsoc: "{c} is modelled simply (two crops in the same row): competition for water and light may differ.",
  rAle: "{t}", rPeor: "In the worst season ({p}) it would not have covered costs.",
  rSemilla: "Is there good {c} seed in your area?", rMercado: "Who buys {c} and for how much?",
  rHelada: "When do elders sow {c} to escape frost?", rDecide: "Nothing special to check: you decide.",
  siT: "🎚️ What if the climate or prices change?", siS: "Move the sliders. It is a test with the same 45 years, not a forecast.",
  siLluvia: "🌧️ What if it rains more or less?", siTemp: "🌡️ What if it gets hotter?", siPrecio: "💰 What if prices go up or down?", siIgual: "same", siReset: "↺ Back to the real data",
  siCol: "Possibility", siFun: "Years it would go well", siIng: "Income per year", siMejor: "Copes best: {c}.", siCalc: "Calculating…",
  siNota: "With more heat, plants need more water (about 3 % more per degree). Price only changes sales; costs stay the same.",
  leT: "📚 Extra information", leS: "To look up whenever you like; the 6 steps are enough to decide. Tap a topic or search for it.",
  leSat: "🛰️ The NASA data Muyuy uses", leTer: "📖 Words Muyuy uses", leTerTec: "Technical terms", leSvt: "📡 Satellite or ground measurement", leArm: "🧩 How data of different sizes are combined", leInc: "🎲 Uncertainty: how much to trust",
  leCult: "🌱 Crops that care for the soil", leJuicio: "🧑‍🌾 When your judgment rules",
  thDato: "Data", thMide: "What it measures", thRes: "Pixel size", thUso: "What Muyuy uses it for",
  tN: "Fix nitrogen", tCob: "Cover the soil", tRaiz: "Deep roots", tSeq: "Drought tolerant", tAqui: "In your area: {c}.", tNinguno: "none in your area's table",
});
Object.assign(I18N.qu, {
  tdT: "📈 1981 watamanta chakraykiq pachan imayna tikrakurqan", tdLluvia: "Tarpuy watapi para", tdHel: "Qasa tutakuna", rsT: "🧰 Chakraykiq sasachakuynin",
  caT: "🗓️ Chakraykiq killa yupanan", caVacia: "ch'usaq chakra", caDesc: "samay", esT: "⚖️ Muyuykunata tupachiy, qampatapas", esHoy: "Kunan", esOpc: "{i} kaq",
  siT: "🎚️ ¿Sichus…? Huk pachawan, huk chaniwan", leT: "📚 Willakuykunata imayna ñawinchana", rsNo: "Manam", rsSi: "Arí",
  fPorque: "🎯 ¿Imaraykutaq?", fEvid: "🔬 ¿Ima willakuy sayanchan?", fBen: "🌱 ¿Ima allinkunata qun?", fLag: "❓ ¿Maypi willakuy pisin?", fRies: "⚠️ Ayllu masiykiwan qhawanapaq",
});

Object.assign(I18N.es, {
  verFicha: "📋 Por qué aparece y su opinión ↓",
  cAguaS: "💧 ¿Alcanza la lluvia?", vAguaOk: "alcanza", vAguaFalta: "faltan {v} mm al año",
  cTierra: "🌱 ¿Cómo deja la tierra?", vTierraMuy: "🌱🌱 la cuida mucho", vTierraBien: "🌱 la cuida", vTierraIgual: "➖ igual", vTierraMal: "⚠️ la cansa",
  esTec: "📊 Más detalles", esTecS: "Nitrógeno: lo que deja el rastrojo menos lo que se lleva la cosecha, sin abono, en 3 campañas. Tierra que se lleva la lluvia: más de 11 t por hectárea al año ya es mucho. Agua: lo que piden los cultivos frente a la lluvia de esos meses.",
  esFichaS: "Toque una para ver por qué aparece, qué revisar y darnos su opinión.",
  fvMasAnios: "funciona más años ({a} de 10, hoy {b})", fvMenosAnios: "funciona menos años ({a} de 10, hoy {b})",
  resPierde: "Lo que pierde: {t}", resSeguro: "Qué tan seguro: {n}. {x}", resSegBaja: "Hay pocos datos de estos cultivos aquí: pruébela primero en un pedazo.",
  resSegMedia: "Converse con un técnico o con un vecino que ya la siembre.",
  resDescanso: "Tiene una campaña de descanso: con estos precios y este clima, dejar descansar la tierra le rinde más que sembrar otra vez, y la tierra se recupera. Si no puede dejarla sin sembrar, elija 0 en «¿Cuántas campañas puede dejar la tierra sin cosecha?» (paso 2).",
  resPerennes: "Muyuy compara la chacra de pan llevar (maíz, frijol, yuca…). El cacao, el café y el plátano todavía no entran en el cálculo.",
  fvMasIng: "podría ganar S/ {v} más al año", fvMenosIng: "podría ganar S/ {v} menos al año", fvTierraMas: "cuida más la tierra", fvTierraMenos: "cuida menos la tierra",
  fTec: "📊 De dónde salen estos datos y qué falta saber", esDesliza: "👉 Deslice la tabla para ver todas.",
});
Object.assign(I18N.en, {
  verFicha: "📋 Why it appears and your opinion ↓",
  cAguaS: "💧 Is the rain enough?", vAguaOk: "enough", vAguaFalta: "{v} mm short per year",
  cTierra: "🌱 How does it leave the soil?", vTierraMuy: "🌱🌱 cares for it a lot", vTierraBien: "🌱 cares for it", vTierraIgual: "➖ same", vTierraMal: "⚠️ wears it out",
  esTec: "📊 More details", esTecS: "Nitrogen: what crop residues leave minus what the harvest takes, without manure, over 3 seasons. Soil washed away: more than 11 t per hectare a year is already a lot. Water: what the crops need against the rain in those months.",
  esFichaS: "Tap one to see why it appears, what to check and give us your opinion.",
  fvMasAnios: "works more years ({a} of 10, today {b})", fvMenosAnios: "works fewer years ({a} of 10, today {b})",
  resPierde: "What you lose: {t}", resSeguro: "How certain: {n}. {x}", resSegBaja: "There is little data on these crops here: try it first on a small plot.",
  resSegMedia: "Talk it over with a technician or a neighbour who already grows it.",
  resDescanso: "It has a fallow season: with these prices and this climate, letting the land rest pays more than sowing again, and the soil recovers. If you cannot leave it unsown, choose 0 in «Seasons without harvest allowed» (step 2).",
  resPerennes: "Muyuy compares the food plot (maize, bean, cassava…). Cocoa, coffee and plantain are not in the calculation yet.",
  fvMasIng: "could earn S/ {v} more per year", fvMenosIng: "could earn S/ {v} less per year", fvTierraMas: "cares more for the soil", fvTierraMenos: "cares less for the soil",
  fTec: "📊 Where these data come from and what is still unknown", esDesliza: "👉 Swipe the table to see them all.",
});
Object.assign(I18N.qu, { fTec: "📊 Kay willakuykuna maymanta hamun, imataq manaraq yachakun", cTierra: "🌱 ¿Allpata imayna saqin?", vTierraBien: "🌱 allinta qhawan", vTierraIgual: "➖ kikin", vTierraMal: "⚠️ sayk'uchin", cAguaS: "💧 ¿Para aypanchu?" });

Object.assign(I18N.es, {
  tdGraf: "📊 Ver los gráficos año por año", tdMas: "🛰️ Más satélites de la NASA y contraste de fuentes",
  rz_p_sube: "🌧️ Desde {a} llueve más: unos {v} mm más por campaña.", rz_p_baja: "🌧️ Desde {a} llueve menos: unos {v} mm menos por campaña.", rz_p_igual: "🌧️ La lluvia no cambió de forma clara desde {a}: hay años buenos y malos, sin una tendencia.",
  rz_h0_sube: "❄️ Hay más heladas que antes: unas {v} noches más al año que en {a}.", rz_h0_baja: "❄️ Hay menos heladas que antes: unas {v} noches menos al año que en {a}.", rz_h0_igual: "❄️ Las heladas no cambiaron de forma clara desde {a}.",
  rz_tmx_sube: "🌡️ Los meses más calurosos son {v} °C más calientes que en {a}.", rz_tmx_baja: "🌡️ Los meses más calurosos son {v} °C más frescos que en {a}.",
  rz_tn_sube: "🌙 Las noches son {v} °C más templadas que en {a}.", rz_tn_baja: "🌙 Las noches son {v} °C más frías que en {a}.",
  hz_seco: "👉 Qué hacer: Muyuy cuenta los 45 años por igual, pero su chacra se está volviendo más seca. En el paso 4 toque «{s}» y prefiera la rotación que también aguanta esos años.",
  hz_ultSeca: "👉 Qué hacer: la última campaña fue seca. En el paso 4 toque «{s}» y prefiera la rotación que también aguanta esos años.",
  hz_calor: "👉 Qué hacer: Muyuy cuenta los 45 años por igual, pero su chacra se está calentando. En el paso 4 toque «{f}» y prefiera la rotación que sigue aguantando con más calor.",
  hz_helada: "👉 Qué hacer: hay más heladas que antes, y Muyuy cuenta los años antiguos igual que los recientes. En el paso 4 elija con margen: la rotación que falla menos, no la que apenas pasa.",
  hz_igual: "👉 Su clima no cambió de forma clara: los 45 años sirven por igual para comparar las rotaciones del paso 4.",
  hz_ir: "Ir al paso 4 →",
  rz_ult_normal: "📅 La última campaña ({a}) tuvo una lluvia normal.", rz_ult_mas: "📅 La última campaña ({a}) llovió {v} % más de lo normal.", rz_ult_menos: "📅 La última campaña ({a}) llovió {v} % menos de lo normal.",
  caComo: "Cada cuadrito es un mes. Color: el cultivo · rayado: chacra vacía · verde claro: descanso · ⚠: mes delicado.",
});
Object.assign(I18N.en, {
  tdGraf: "📊 See the year-by-year charts", tdMas: "🛰️ More NASA satellites and source cross-check",
  rz_p_sube: "🌧️ Since {a} it rains more: about {v} mm more per season.", rz_p_baja: "🌧️ Since {a} it rains less: about {v} mm less per season.", rz_p_igual: "🌧️ Rainfall has not changed clearly since {a}: there are good and bad years, with no trend.",
  rz_h0_sube: "❄️ There are more frosts than before: about {v} more nights a year than in {a}.", rz_h0_baja: "❄️ There are fewer frosts than before: about {v} fewer nights a year than in {a}.", rz_h0_igual: "❄️ Frosts have not changed clearly since {a}.",
  rz_tmx_sube: "🌡️ The hottest months are {v} °C warmer than in {a}.", rz_tmx_baja: "🌡️ The hottest months are {v} °C cooler than in {a}.",
  rz_tn_sube: "🌙 Nights are {v} °C milder than in {a}.", rz_tn_baja: "🌙 Nights are {v} °C colder than in {a}.",
  hz_seco: "👉 What to do: Muyuy counts all 45 years equally, but your farm is getting drier. In step 4 tap «{s}» and prefer the rotation that also holds up in those years.",
  hz_ultSeca: "👉 What to do: last season was dry. In step 4 tap «{s}» and prefer the rotation that also holds up in those years.",
  hz_calor: "👉 What to do: Muyuy counts all 45 years equally, but your farm is getting warmer. In step 4 tap «{f}» and prefer the rotation that still holds up with more heat.",
  hz_helada: "👉 What to do: there are more frosts than before, and Muyuy counts old years the same as recent ones. In step 4 choose with a margin: the rotation that fails least, not the one that barely passes.",
  hz_igual: "👉 Your climate has not changed clearly: all 45 years are equally useful to compare the rotations in step 4.",
  hz_ir: "Go to step 4 →",
  rz_ult_normal: "📅 Last season ({a}) had normal rainfall.", rz_ult_mas: "📅 Last season ({a}) had {v} % more rain than normal.", rz_ult_menos: "📅 Last season ({a}) had {v} % less rain than normal.",
  caComo: "Each small square is a month. Colour: the crop · striped: empty field · light green: fallow · ⚠: sensitive month.",
});

// ---------------------------------------------------------------- utilidades
// lo que limita (agua, equipos, mercado) y «Aquí manda su criterio» (paso 4)
Object.assign(I18N.es, { leMenu: "📚 Información extra", ieClima: "📈 Su clima año por año", ieTec: "📊 Detalles técnicos de las rotaciones",
  ieTecVacio: "Aparecen cuando Muyuy termina de calcular las rotaciones de su chacra.", ieVolver: "‹ Temas", ieN: "{n} secciones",
  ieG_clima: "Su chacra y su clima", ieD_clima: "Sus números, los años pasados y los satélites.",
    ieG_rot: "Rotar y cuidar el suelo", ieD_rot: "Qué es rotar y qué cultivos ayudan a su tierra.", });
Object.assign(I18N.en, { leMenu: "📚 Extra information", ieClima: "📈 Your climate year by year", ieTec: "📊 Technical details of the rotations",
  ieTecVacio: "They appear when Muyuy finishes calculating the rotations for your farm.", ieVolver: "‹ Topics", ieN: "{n} sections",
  ieG_clima: "Your farm and climate", ieD_clima: "Your numbers, past years and the satellites.",
    ieG_rot: "Rotating and soil care", ieD_rot: "What rotating is and which crops help your land.", });
Object.assign(I18N.qu, { leMenu: "📚 Willakuykunata imayna ñawinchana" });
Object.assign(I18N.es, {
  rsAguaQ: "💧 ¿Cuánta agua de riego tiene?", rsAguaS: "Cambia cuáles rotaciones aguantan: Muyuy vuelve a probarlas con esa agua.", rsAguaCalc: "Probando las rotaciones con esa agua…", rsAguaListo: "Listo: rotaciones probadas con esa agua.", rsAguaSin: "Sin el motor de la app no se puede volver a calcular aquí.",
  rsEquipoQ: "🚜 ¿Con qué trabaja la tierra?", rsEq_nose: "No sabe / prefiero no decir", rsEq_mano: "A mano (chaquitaclla, lampa, pico)", rsEq_yunta: "Con yunta (bueyes, caballo)", rsEq_tractor: "Con tractor (propio o alquilado)",
  rsEquipoS: "No cambia el cálculo: Muyuy le avisa qué revisar en cada posibilidad.",
  rsMercQ: "🛒 ¿Para qué siembra?", rsMe_nose: "Un poco de todo", rsMe_casa: "Sobre todo para comer en casa", rsMe_feria: "Para vender en la feria del pueblo", rsMe_comprador: "Para un comprador grande (acopio, contrato, exportación)",
  rsMercS: "Para comer en casa, «vender más» pesa menos; con un comprador grande, pesa más.",
  eqMano: "Trabajando a mano: ¿le alcanzan los brazos de la familia (o el ayni) para sembrar y cosechar {c} a tiempo?",
  eqYunta: "Con yunta: ¿puede preparar la tierra a tiempo para {c}? ¿Hay pasto para los animales esa campaña?",
  eqTractor: "Con tractor: ¿lo consigue justo cuando lo necesita para {c}? ¿Cuánto cuesta la hora?",
  eqPend: "Su chacra tiene {p} % de pendiente: el tractor puede no entrar; la yunta o el trabajo a mano cuidan más la tierra.",
  meCasa: "Para comer en casa: ¿a su familia le gustan estos cultivos ({c})? ¿Sabe cómo prepararlos o guardarlos?",
  meFeria: "¿En la feria del pueblo compran {c}? ¿Cuánto pagan en la cosecha, cuando todos venden?",
  meComp: "¿El comprador le asegura el precio de {c} antes de sembrar? ¿Pide una variedad o una calidad especial?",
  scT: "🧑‍🌾 Aquí manda su criterio", scS: "Muyuy probó 45 años de clima, pero no ve su chacra como usted. En estos casos su experiencia y la de su comunidad valen más que los datos:",
  scHelada: "<b>Heladas:</b> el satélite mide una zona de unos 50 km. Usted sabe en qué hondonadas y laderas cae la helada y en qué fechas siembran los mayores.",
  scLluvia: "<b>Lluvia en su quebrada o ladera:</b> puede ser distinta a la de la zona. Si usted ve otra cosa, confíe en lo que ve.",
  scRiegoSi: "<b>Su agua de riego:</b> cuánta le toca de verdad en su turno y en los años secos.",
  scRiegoNo: "<b>Agua que los datos no ven:</b> un ojo de agua, una qocha o un pozo cambian lo que puede sembrar.",
  scConf: "<b>Datos aproximados:</b> lo que Muyuy sabe de {c} es aproximado. Vale más lo que usted ha visto.",
  scNuevo: "<b>Cultivos nuevos para usted:</b> nunca sembró {c} en esta chacra. Pruébelos primero en un pedazo (paso 5).",
  scPrecio: "<b>Precios:</b> Muyuy usa precios de referencia. Usted sabe cuánto pagan en su feria (póngalos en el paso 2).",
  scPlaga: "<b>Plagas y enfermedades de su zona:</b> Muyuy no las conoce. Pregunte a sus vecinos y al técnico.",
  scComun: "<b>Acuerdos de la comunidad:</b> si la comunidad decide qué sectores descansan o se siembran (laymi, muyuy), eso manda.",
  scEquipo: "<b>Su trabajo y sus herramientas:</b> cuéntele a Muyuy con qué trabaja la tierra (paso 2) para que le avise qué revisar.",
  scMerc: "<b>Lo que quiere su familia:</b> si siembra para comer o para vender, dígalo en el paso 2.",
  scPie: "Usted decide. Muyuy solo muestra patrones y posibilidades.",
  guLimita: "Lo que limita la chacra",
});
Object.assign(I18N.en, {
  rsAguaQ: "💧 How much irrigation water do you have?", rsAguaS: "It changes which rotations hold up: Muyuy tests them again with that water.", rsAguaCalc: "Testing the rotations with that water…", rsAguaListo: "Done: rotations tested with that water.", rsAguaSin: "Without the app engine it cannot be recalculated here.",
  rsEquipoQ: "🚜 What do you work the land with?", rsEq_nose: "Don't know / rather not say", rsEq_mano: "By hand (foot plough, spade, pick)", rsEq_yunta: "With oxen or a horse", rsEq_tractor: "With a tractor (own or rented)",
  rsEquipoS: "It does not change the calculation: Muyuy tells you what to check in each option.",
  rsMercQ: "🛒 What do you grow for?", rsMe_nose: "A bit of everything", rsMe_casa: "Mostly to eat at home", rsMe_feria: "To sell at the village market", rsMe_comprador: "For a large buyer (collector, contract, export)",
  rsMercS: "To eat at home, \"sell more\" counts less; with a large buyer, it counts more.",
  eqMano: "Working by hand: does your family (or ayni) have enough hands to sow and harvest {c} on time?",
  eqYunta: "With oxen: can you prepare the land in time for {c}? Is there pasture for the animals that season?",
  eqTractor: "With a tractor: can you get it exactly when you need it for {c}? How much is an hour?",
  eqPend: "Your field has a {p} % slope: a tractor may not get in; oxen or hand work protect the soil better.",
  meCasa: "To eat at home: does your family like these crops ({c})? Do you know how to cook or store them?",
  meFeria: "Do people buy {c} at the village market? How much do they pay at harvest, when everyone sells?",
  meComp: "Does the buyer guarantee the price of {c} before sowing? Do they ask for a special variety or quality?",
  scT: "🧑‍🌾 Here your judgment rules", scS: "Muyuy tested 45 years of climate, but it does not see your field the way you do. In these cases your experience and your community's are worth more than the data:",
  scHelada: "<b>Frost:</b> the satellite measures an area about 50 km wide. You know which hollows and slopes get frost and when the elders sow.",
  scLluvia: "<b>Rain in your valley or slope:</b> it can differ from the area. If you see something else, trust what you see.",
  scRiegoSi: "<b>Your irrigation water:</b> how much you really get in your turn and in dry years.",
  scRiegoNo: "<b>Water the data cannot see:</b> a spring, a pond (qocha) or a well change what you can grow.",
  scConf: "<b>Approximate data:</b> what Muyuy knows about {c} is approximate. What you have seen is worth more.",
  scNuevo: "<b>Crops new to you:</b> you have never grown {c} in this field. Try them first on a small plot (step 5).",
  scPrecio: "<b>Prices:</b> Muyuy uses reference prices. You know what your market pays (enter them in step 2).",
  scPlaga: "<b>Local pests and diseases:</b> Muyuy does not know them. Ask your neighbours and the extension agent.",
  scComun: "<b>Community agreements:</b> if the community decides which sectors rest or are sown (laymi, muyuy), that rules.",
  scEquipo: "<b>Your labour and tools:</b> tell Muyuy what you work the land with (step 2) so it can tell you what to check.",
  scMerc: "<b>What your family wants:</b> whether you grow to eat or to sell, say it in step 2.",
  scPie: "You decide. Muyuy only shows patterns and possibilities.",
  guLimita: "What limits the field",
});
Object.assign(I18N.qu, {
  rsAguaQ: "💧 ¿Hayk'a qarpay yakuyuqtaq kanki?", rsAguaS: "Muyuyqa chay yakuwan muyuykunata hukmanta qhawan.", rsAguaCalc: "Chay yakuwan muyuykunata qhawachkani…", rsAguaListo: "Ñam: chay yakuwan qhawasqa.", rsAguaSin: "Kaypiqa manam hukmanta yupayta atikunchu.",
  rsEquipoQ: "🚜 ¿Imawantaq allpata llamk'anki?", rsEq_nose: "Mana yachanichu", rsEq_mano: "Makillawan (chakitaklla, lampa)", rsEq_yunta: "Yuntawan (wakakuna, kawallu)", rsEq_tractor: "Tractorwan",
  rsEquipoS: "Manam yupayta tikranchu: sapa muyuypi imata qhawanaykita willasunki.",
  rsMercQ: "🛒 ¿Imapaqtaq tarpunki?", rsMe_nose: "Tukuy imapaq", rsMe_casa: "Wasipi mikhunapaq", rsMe_feria: "Llaqta qhatupi vendenapaq", rsMe_comprador: "Hatun rantiqpaq (contrato)",
  rsMercS: "Wasipi mikhunapaqqa «aswan vendey» pisita llasan; hatun rantiqwanqa aswanta.",
  eqMano: "Makillawan: ¿ayllu makiykikuna (aynipas) aypanchu {c} tarpunapaq, pallanapaq?",
  eqYunta: "Yuntawan: ¿pachallanpichu allpata wakichinki {c}-paq? ¿Uywakunapaq q'achu kanchu?",
  eqTractor: "Tractorwan: ¿{c} munaqtin tarinkichu? ¿Hayk'ataq sapa hora?",
  eqPend: "Chakraykiqa {p} % qhatayuq: tractorqa manapaschá yaykunqa; yunta, makipas allpata aswan waqaychan.",
  meCasa: "Wasipi mikhunapaq: ¿ayllaykiman {c} gustanchu? ¿Yachankichu waqaychayta?",
  meFeria: "¿Llaqta qhatupi {c}-ta rantinkuchu? ¿Hayk'ata pallay pachapi qunku?",
  meComp: "¿Rantiq {c}-pa chaninta manaraq tarpuspa qunchu?",
  scT: "🧑‍🌾 Kaypi yuyayniyki kamachin", scS: "Muyuyqa 45 wata pachata qhawan, ichaqa manam chakraykita qan hina rikunchu. Kaykunapiqa yachayniyki, ayllupa yachayninpas aswan chaniyuq:",
  scHelada: "<b>Qasa:</b> satelitiqa 50 km hina suyuta tupun. Qanmi yachanki maykunapi qasa urmamun, hayk'aq machulakuna tarpunku.",
  scLluvia: "<b>Wayq'oykipi para:</b> hukniraq kanman. Huk imata rikuspaqa, rikusqaykiman hap'ikuy.",
  scRiegoSi: "<b>Qarpay yakuyki:</b> mit'aykipi, ch'aki watakunapipas hayk'a chayasunki.",
  scRiegoNo: "<b>Mana rikusqa yaku:</b> pukyu, qocha, pozo ima tarpunaykita tikran.",
  scConf: "<b>Yaqalla willakuy:</b> {c}-manta Muyuypa yachasqanqa yaqallam. Rikusqayki aswan chaniyuq.",
  scNuevo: "<b>Musuq rurukuna:</b> manaraq {c} kay chakrapi tarpurqankichu. Huk pedazollapi ñawpaqta pruebay (5 kaq).",
  scPrecio: "<b>Chanikuna:</b> Muyuyqa yaqa chanikunata hap'in. Qanmi yachanki qhatuykipi hayk'ata qunku (2 kaqpi churay).",
  scPlaga: "<b>Llaqtaykipa plagankuna, unquyninkuna:</b> Muyuyqa manam riqsinchu. Wasimasiykikunata, técnicota tapuy.",
  scComun: "<b>Ayllupa rimanakuyninkuna:</b> ayllu laymikunata akllaptinqa, chaymi kamachin.",
  scEquipo: "<b>Llamk'ayniyki, equipoykikuna:</b> 2 kaqpi willay imawan allpata llamk'asqaykita.",
  scMerc: "<b>Ayllaykipa munasqan:</b> mikhunapaq utaq vendenapaq tarpusqaykita 2 kaqpi willay.",
  scPie: "Qanmi akllanki. Muyuyqa kutipaqkunata, atikuykunatalla rikuchin.",
  guLimita: "Chakrata imakuna hark'an",
});

const CAMPO = (() => {
  const K_EXCL = "muyuy-excluidos", K_FORR = "muyuy-forraje", K_EQUIP = "muyuy-equipo", K_MERC = "muyuy-mercado", K_BASE = "muyuy-base";
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
                  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
  const h = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const fmt = (v, d = 0) => (v == null || !isFinite(v) ? "—" : Number(v).toLocaleString(LOCALE[LANG], { maximumFractionDigits: d, minimumFractionDigits: d }).replace(/^-/, "−"));
  const sgn = (v, d = 0) => (v > 0 ? "+" : v < 0 ? "−" : "±") + fmt(Math.abs(v), d);
  const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const mesesAgo = () => Array.from({ length: 12 }, (_, i) => MES()[(7 + i) % 12]); // agosto → julio

  const conMotor = () => !!(D && D.motor && window.MOTOR && MOTOR.tiene(D.sitio));
  let climaCache = { id: null, c: null };
  const clima = () => {
    if (!conMotor()) return null;
    if (climaCache.id !== D.sitio) climaCache = { id: D.sitio, c: MOTOR.clima(D.sitio) };
    return climaCache.c;
  };
  const tabla = () => (conMotor() ? MOTOR.tabla(D.sitio) : null);
  const lugar = () => {
    const s = (typeof SITES_LIST !== "undefined" && SITES_LIST.find((x) => x.id === D.sitio)) || {};
    const c = clima();
    const lat = s.lat ?? (c && c.lat), lon = s.lon ?? (c && c.lon);
    return lat != null && lon != null ? [lat, lon] : null;
  };

  // ---------------------------------------------------------------- rasgos de cada cultivo (de la tabla del motor)
  function rasgos(cid) {
    const c = (tabla() || {})[cid], g = (D.cultivos[cid] || {}).grupo;
    if (!c) return { n: g === "leguminosa", cob: ["cobertura", "descanso"].includes(g), raiz: false, seq: false, forr: 0 };
    const desc = c.grupo === "descanso";
    const forr = /avena|vicia|alfalfa|sorgo|forraj/.test(cid) ? 2
      : desc || ["cereal", "asociacion"].includes(c.grupo) || /caupi|mani|zarandaja|frijol|haba|arveja|camote|maiz/.test(cid) ? 1 : 0;
    return { n: c.familia === "Fabaceae" || c.n_aporte_residual >= 30, cob: !desc && (c.grupo === "cobertura" || c.factor_c_rusle <= 0.2),
             raiz: !desc && c.raiz_m >= 1.0, seq: !desc && c.ky > 0 && (c.ky <= 0.9 || c.p_agotamiento >= 0.6), forr, desc };
  }
  const conRasgo = (k) => Object.keys(D.cultivos).filter((cid) => D.cultivos[cid].factible !== false && rasgos(cid)[k]);

  // agua que pide un cultivo en su ciclo (mm) y lluvia de esos meses, con la ET0 media de cada mes del lugar
  function aguaCultivo(cid) {
    const c = (tabla() || {})[cid], cl = clima();
    if (!c || !cl || c.grupo === "descanso") return null;
    const fFin = Math.max(0, 1 - c.f_ini - c.f_des - c.f_med);
    const kc = c.kc_ini * c.f_ini + (c.kc_ini + c.kc_med) / 2 * c.f_des + c.kc_med * c.f_med + (c.kc_med + c.kc_fin) / 2 * fFin;
    let et = 0, p = 0, dia = 0, m = c.siembra_mes - 1, d0 = 15;
    while (dia < c.ciclo_dias) {
      const dm = Math.min(DIAS_MES[m] - (dia ? 0 : d0 - 1), c.ciclo_dias - dia);
      et += cl.meses[m].e / DIAS_MES[m] * dm; p += cl.meses[m].p / DIAS_MES[m] * dm;
      dia += dm; m = (m + 1) % 12;
    }
    return { etc: kc * et, p };
  }

  // ---------------------------------------------------------------- estadística de tendencias
  function theilSen(xs, ys) {
    const s = [];
    for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) if (xs[j] !== xs[i]) s.push((ys[j] - ys[i]) / (xs[j] - xs[i]));
    s.sort((a, b) => a - b);
    const m = s.length;
    return m ? (m % 2 ? s[(m - 1) / 2] : (s[m / 2 - 1] + s[m / 2]) / 2) : 0;
  }
  function erf(x) { // Abramowitz y Stegun 7.1.26
    const t = 1 / (1 + 0.3275911 * Math.abs(x));
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return x >= 0 ? y : -y;
  }
  function mannKendall(ys) {
    const n = ys.length;
    let S = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) S += Math.sign(ys[j] - ys[i]);
    const v = n * (n - 1) * (2 * n + 5) / 18, z = S === 0 ? 0 : (S - Math.sign(S)) / Math.sqrt(v);
    return 2 * (1 - 0.5 * (1 + erf(Math.abs(z) / Math.SQRT2)));
  }
  function spark(ys, slope, xs, cls = "") {
    const W = 220, H = 48, P = 3, lo = Math.min(...ys), hi = Math.max(...ys), sp = hi - lo || 1;
    const X = (i) => P + i / (ys.length - 1) * (W - 2 * P), Y = (v) => H - P - (v - lo) / sp * (H - 2 * P);
    const pts = ys.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
    const xm = xs.reduce((a, b) => a + b, 0) / xs.length, ym = [...ys].sort((a, b) => a - b)[Math.floor(ys.length / 2)];
    const y0 = ym + slope * (xs[0] - xm), y1 = ym + slope * (xs[xs.length - 1] - xm);
    return `<svg class="spark ${cls}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <polyline points="${pts}" class="sp-l"/><line x1="${X(0)}" y1="${Y(y0).toFixed(1)}" x2="${X(ys.length - 1)}" y2="${Y(y1).toFixed(1)}" class="sp-t"/>
      <circle cx="${X(ys.length - 1).toFixed(1)}" cy="${Y(ys[ys.length - 1]).toFixed(1)}" r="3" class="sp-d"/></svg>`;
  }

  // ---------------------------------------------------------------- 1. tendencias (paso 1)
  let sonando = null;
  function renderTendencias() {
    const box = $("#tendencias");
    if (!box) return;
    const cl = clima();
    if (!cl || cl.camp.length < 10) { box.hidden = true; return; }
    box.hidden = false;
    const xs = cl.camp.map((c) => c.anio);
    const series = [
      ["p", "tdLluvia", " mm", 0, "lluvia"], ["b", "tdBal", " mm", 0, "bal"], ["h0", "tdHel", "", 0, "hel"],
      ["tn", "tdTmin", " °C", 1, "frio"], ["tmx", "tdCalor", " °C", 1, "calor"],
    ].filter(([k]) => cl.camp.every((c) => c[k] != null) && !(k === "h0" && cl.camp.every((c) => c.h0 === 0)));
    const resumen = [], cambia = {};
    const cards = series.map(([k, lab, u, d, cls]) => {
      const ys = cl.camp.map((c) => c[k]), sl = theilSen(xs, ys), p = mannKendall(ys);
      const cambio = sl * (xs[xs.length - 1] - xs[0]); // cuánto cambió en todo el periodo
      cambia[k] = p < 0.05 ? Math.sign(cambio) : 0; // tendencia clara: +1 sube, -1 baja, 0 no
      if (p < 0.05 && ["p", "h0", "tmx", "tn"].includes(k)) resumen.push(tr("rz_" + k + (cambio > 0 ? "_sube" : "_baja"), { v: fmt(Math.abs(cambio), d), a: xs[0] }));
      else if (k === "p" || (k === "h0" && cl.camp.some((c) => c.h0 > 5))) resumen.push(tr("rz_" + k + "_igual", { a: xs[0] }));
      const prom = ys.reduce((a, b) => a + b, 0) / ys.length, ult = ys[ys.length - 1];
      const dec = sl * 10, clara = p < 0.05 && Math.abs(dec) > 1e-9;
      const tend = Math.abs(dec) < (d ? 0.05 : 0.5) ? tr("tdNoClara") : tr(dec > 0 ? "tdSube" : "tdBaja", { v: fmt(Math.abs(dec), d) + u });
      const rel = k === "p" && prom ? `${sgn((ult - prom) / prom * 100)} %` : sgn(ult - prom, d) + u;
      return `<article class="td-card ${cls}">
        <h4>${tr(lab)}</h4>
        ${spark(ys, sl, xs, cls)}
        <p class="td-v"><b>${tr("tdProm", { v: fmt(prom, d) + u })}</b></p>
        <p class="td-t ${clara ? "clara" : ""}">${tend}${clara ? ` · <span class="chip-c">${tr("tdClara")}</span>` : ` · <span class="chip-n">${tr("tdNoClara").split(" (")[0]}</span>`}</p>
        <p class="td-u">${tr("tdUlt", { a: `${xs[xs.length - 1]}/${String(xs[xs.length - 1] + 1).slice(-2)}`, v: fmt(ult, d) + u, d: rel })}</p></article>`;
    }).join("");
    const ult = cl.camp[cl.camp.length - 1], promP = cl.camp.reduce((a, c) => a + c.p, 0) / cl.camp.length, rel = (ult.p - promP) / promP * 100;
    resumen.push(tr(Math.abs(rel) < 10 ? "rz_ult_normal" : rel > 0 ? "rz_ult_mas" : "rz_ult_menos", { a: `${ult.anio}/${String(ult.anio + 1).slice(-2)}`, v: fmt(Math.abs(rel)) }));
    // qué hacer con esto en el paso 4: el motor cuenta los 45 años por igual, así que si el clima cambia se mira el escenario
    // que se parece a lo que viene (años secos o 2050); sin cambio claro, los 45 años sirven tal cual
    const hacer = cambia.p < 0 ? ["hz_seco", "seco"] : rel < -10 ? ["hz_ultSeca", "seco"]
      : cambia.tmx > 0 || cambia.tn > 0 ? ["hz_calor", "f245"] : cambia.h0 > 0 ? ["hz_helada", "todos"] : ["hz_igual", null];
    resumen.push(`<span>${tr(hacer[0], { s: tr("esc_seco"), f: tr("esc_f245") })}</span>` +
      (hacer[1] ? ` <button type="button" class="btn-sec td-ir" data-esc="${hacer[1]}">${tr("hz_ir")}</button>` : ""));
    box.innerHTML = `<h3 class="ctx-h">${tr("tdT")} ${FACIL.voz(null, "#tendencias .td-res")} ${FACIL.que("tend")}</h3>
      <ul class="td-res">${resumen.map((x) => `<li>${x}</li>`).join("")}</ul>
      <div class="td-son"><button type="button" class="btn-sec" id="tdSon">${tr("tdEscuchar")}</button><span class="td-son-y" id="tdSonY" aria-live="polite"></span><p class="small">${tr("tdEscS")}</p></div>
      <details class="td-graf"><summary>${tr("tdGraf")}</summary><p class="hint">${tr("tdS")}</p>
      <div class="td-grid">${cards}</div><p class="small">${tr("tdNota")}</p></details>
      <details class="td-mas"><summary>${tr("tdMas")}</summary>
        <div class="sat-grid">
          ${satBloque("gr", "grT", "grBtn", "grS")}
          ${satBloque("lst", "lstT", "lstBtn", "ecoNota")}
          ${satBloque("ged", "gedT", "gedBtn", "")}
          ${satBloque("cmp", "cmpT", "cmpBtn", "")}
        </div></details>`;
    // los satélites extra (Grace, Modis LST, GEDI, ERA5) van a «Cómo leer los datos» (menú Más), no en la vista del agricultor
    const mas = $(".td-mas", box), dest = $("#leerSats");
    if (mas && dest) { mas.open = false; dest.replaceChildren(mas); }
    // los gráficos año por año y la lluvia hecha sonido son de consulta: van a «Información extra»
    const leClima = $("#leClimaBody"), graf = $(".td-graf", box), son = $(".td-son", box);
    if (leClima && graf && son) { graf.open = true; leClima.replaceChildren(son, graf); }
    $("#tdSon").onclick = () => sonar(cl);
    const ir = $(".td-ir", box);
    if (ir) ir.onclick = () => { // al paso 4, con el escenario marcado
      showStep(STEPS.indexOf("rotaciones"));
      const b = $(`#escenarios button[data-esc="${ir.dataset.esc}"]`);
      if (b && !b.classList.contains("on")) b.click();
    };
    $("#sat-gr").onclick = () => grace();
    $("#sat-lst").onclick = () => lst();
    $("#sat-ged").onclick = () => gedi();
    $("#sat-cmp").onclick = () => contraste(cl);
  }
  const satBloque = (id, t, b, s) => `<div class="sat-b" id="satb-${id}"><h4>${tr(t)}</h4>${s ? `<p class="small">${tr(s)}</p>` : ""}
    <button type="button" class="btn-sec" id="sat-${id}">${tr(b)}</button><div class="sat-out" id="sato-${id}" aria-live="polite"></div></div>`;
  const satEspera = (id) => { $("#sato-" + id).innerHTML = `<p class="ah-msg"><span class="ah-spin" aria-hidden="true"></span> ${tr("cargandoSat")}</p>`; };
  const satError = (id) => { $("#sato-" + id).innerHTML = `<p class="ah-msg">${tr("satErr")}</p>`; };

  // lluvia hecha sonido (Ayni Orbital): una nota por campaña, golpe grave y vibración en las más secas; volumen limitado
  function sonar(cl) {
    const btn = $("#tdSon");
    if (sonando) { sonando.stop(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ac = new AC(), out = ac.createGain(), lim = ac.createDynamicsCompressor();
    out.gain.value = 0.25; out.connect(lim); lim.connect(ac.destination);
    const ps = cl.camp.map((c) => c.p), lo = Math.min(...ps), hi = Math.max(...ps);
    const seco = [...cl.camp.map((c) => c.b)].sort((a, b) => a - b)[Math.floor(cl.camp.length * 0.15)];
    const penta = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
    let i = 0, timer = null;
    const stop = () => { clearTimeout(timer); try { ac.close(); } catch {} sonando = null; btn.textContent = tr("tdEscuchar"); $("#tdSonY").textContent = ""; };
    sonando = { stop };
    btn.textContent = tr("tdParar");
    const paso = () => {
      if (i >= cl.camp.length) { stop(); return; }
      const c = cl.camp[i], t = ac.currentTime;
      const st = penta[Math.round((c.p - lo) / (hi - lo || 1) * (penta.length - 1))];
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = "sine"; o.frequency.value = 220 * 2 ** (st / 12);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.26);
      if (c.b <= seco) {
        const o2 = ac.createOscillator(), g2 = ac.createGain();
        o2.type = "triangle"; o2.frequency.value = 70;
        g2.gain.setValueAtTime(0.6, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o2.connect(g2); g2.connect(out); o2.start(t); o2.stop(t + 0.32);
        if (navigator.vibrate) navigator.vibrate(150);
      }
      $("#tdSonY").textContent = `${c.anio}/${String(c.anio + 1).slice(-2)} · ${fmt(c.p)} mm${c.b <= seco ? " ☀️" : ""}`;
      i++; timer = setTimeout(paso, 280);
    };
    paso();
  }

  // valor de un píxel de NASA GIBS con su tabla de colores (satelite.js: gibsTesela y gibsTabla)
  async function gibsPunto(capa, tabla, fecha, tms, nivel, grados, [lat, lon]) {
    const [t, cm] = await Promise.all([gibsTesela(capa, fecha, tms, nivel, grados, lat, lon), gibsTabla(tabla)]);
    const d = t.cx.getImageData(t.px, t.py, 1, 1).data;
    const v = d[3] === 0 ? null : cm.get(`${d[0]},${d[1]},${d[2]}`) || null;
    return { v: v ? (v[1] > 1e8 ? v[0] : v[0] < -1e8 ? v[1] : (v[0] + v[1]) / 2) : null, fecha: t.fecha };
  }
  async function grace() {
    const pt = lugar();
    if (!pt) return;
    satEspera("gr");
    try {
      const fechas = [];
      for (let y = 2003; y <= 2022; y++) fechas.push(`${y}-0${y === 2022 ? 6 : 7}-01`);
      const rs = await Promise.all(fechas.map((f) => gibsPunto("GRACE_Tellus_Liquid_Water_Equivalent_Thickness_Mascon_CRI",
        "GRACE_Tellus_Liquid_Water_Equivalent_Thickness_Mascon_CRI", f, "2km", 5, 9, pt).catch(() => null)));
      const vistos = new Set(), pts = [];
      for (const r of rs) if (r && r.v != null && !vistos.has(r.fecha)) { vistos.add(r.fecha); pts.push([+r.fecha.slice(0, 4) + (+r.fecha.slice(5, 7) - 1) / 12, r.v, r.fecha]); }
      if (pts.length < 6) throw new Error("pocos");
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), sl = theilSen(xs, ys), p = mannKendall(ys);
      const ult = pts[pts.length - 1];
      $("#sato-gr").innerHTML = spark(ys, sl, xs, "bal") +
        `<p>${tr("grRes", { t: sgn(sl * 10, 1) + " cm", c: (p < 0.05 ? tr(sl < 0 ? "grBaja" : "grSube") + " · " + tr("tdClara") : tr("tdNoClara")), u: fmt(ult[1], 1), f: ult[2].slice(0, 7) })}</p>`;
    } catch { satError("gr"); }
  }
  async function lst() {
    const pt = lugar();
    if (!pt) return;
    satEspera("lst");
    try {
      const fin = new Date(Date.now() - 2 * 864e5), vals = [];
      let ultima = null;
      const ds = Array.from({ length: 16 }, (_, k) => { const d = new Date(fin); d.setDate(d.getDate() - k); return d.toISOString().slice(0, 10); });
      const rs = await Promise.all(ds.map((f) => gibsPunto("MODIS_Terra_Land_Surface_Temp_Day", "MODIS_Land_Surface_Temp", f, "1km", 6, 4.5, pt).catch(() => null)));
      rs.forEach((r, k) => { if (r && r.v != null && r.v > 200) { vals.push(r.v - 273.15); if (!ultima) ultima = ds[k]; } });
      $("#sato-lst").innerHTML = vals.length
        ? `<p class="sat-num">${fmt(vals.reduce((a, b) => a + b, 0) / vals.length, 1)} °C</p><p>${tr("lstRes", { v: fmt(vals.reduce((a, b) => a + b, 0) / vals.length, 1), n: vals.length, f: ultima })}</p>`
        : `<p>${tr("lstNo")}</p>`;
    } catch { satError("lst"); }
  }
  async function gedi() {
    const pt = lugar();
    if (!pt) return;
    satEspera("ged");
    try {
      const r = await gibsPunto("GEDI_ISS_L4B_Aboveground_Biomass_Density_Mean_201904-202303", "GEDI_MU_Color_Index", "2019-04-18", "1km", 6, 4.5, pt);
      $("#sato-ged").innerHTML = r.v == null ? `<p>${tr("gedNo")}</p>` : `<p class="sat-num">${fmt(r.v, 0)} t/ha</p><p>${tr("gedRes", { v: fmt(r.v, 0) })}</p>`;
    } catch { satError("ged"); }
  }
  // contraste (Los Causas Espaciales): la última campaña completa, NASA Power (original y corregido) frente a ERA5
  async function contraste(cl) {
    const pt = lugar();
    if (!pt) return;
    satEspera("cmp");
    try {
      const c = cl.camp[cl.camp.length - 1], a = c.anio;
      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${pt[0].toFixed(3)}&longitude=${pt[1].toFixed(3)}&start_date=${a}-08-01&end_date=${a + 1}-07-31&daily=precipitation_sum&timezone=UTC`;
      const j = await (await fetch(url)).json();
      const e = (j.daily && j.daily.precipitation_sum || []).reduce((s, x) => s + (x || 0), 0);
      if (!e) throw new Error("sin ERA5");
      const pf = (D.contexto.clima && D.contexto.clima.precip_factor) || 1, pOrig = c.p / pf;
      const dif = Math.round(Math.abs(c.p - e) / e * 100);
      $("#sato-cmp").innerHTML = `<p>${tr("cmpRes", { a: `${a}/${String(a + 1).slice(-2)}`, p: fmt(pOrig), pc: fmt(c.p), e: fmt(e) })}</p>
        <p class="${dif <= 25 ? "ok-t" : "warn-t"}">${tr(dif <= 25 ? "cmpOk" : "cmpMal", { d: dif })}</p>`;
    } catch { satError("cmp"); }
  }

  // ---------------------------------------------------------------- 2. lo que limita la chacra (paso 2)
  const regionKey = () => D.region || (D.andina ? "sierra" : "costa");
  // cultivos que casi no se siembran en la región, según el Midagri (recomendación de Aponte): salen apagados, y el
  // agricultor los puede volver a poner si él sí los siembra
  let REG = null;
  const K_INCL = "muyuy-incluidos";
  function cargarRegion() {
    if (REG || typeof gzJson !== "function") return;
    gzJson("data/cultivos_region.json.gz").then((r) => { REG = r; renderRestric(); cambio(); }).catch(() => {});
  }
  const depDe = () => { const L = typeof SITES_LIST !== "undefined" ? SITES_LIST : [], s = L.find((x) => x.id === D.sitio) || L.find((x) => x.id === D.vecino); return (s && s.dep) || null; };
  const depNombre = () => (REG && REG.nombres[depDe()]) || depDe() || "";
  function noRegion(c) {
    const dep = depDe(), h = REG && REG.ha[c];
    return !!(h && dep && h[dep] != null && h[dep] < REG.umbral_ha);
  }
  const incluidos = () => new Set(store.get(K_INCL, {})[D.sitio] || []);
  const excluidosRegion = () => new Set(Object.keys(D.cultivos).filter((c) => noRegion(c) && !incluidos().has(c)));
  const excluidos = () => new Set([...(store.get(K_EXCL, {})[regionKey()] || []).filter((c) => D.cultivos[c]), ...excluidosRegion()]);
  const forraje = () => store.get(K_FORR, false) === true;
  const cultivoFijo = () => { const c = store.get(K_BASE, {})[regionKey()]; return c && D.cultivos[c] && D.cultivos[c].factible !== false ? c : null; }; // el que no quiere dejar
  // con qué trabaja la tierra (no cambia el cálculo: avisa qué revisar) y para qué siembra (pesa más o menos «vender más»)
  const EQUIPOS = ["nose", "mano", "yunta", "tractor"], MERCADOS = ["nose", "casa", "feria", "comprador"];
  const equipo = () => (EQUIPOS.includes(store.get(K_EQUIP, "nose")) ? store.get(K_EQUIP, "nose") : "nose");
  const mercado = () => (MERCADOS.includes(store.get(K_MERC, "nose")) ? store.get(K_MERC, "nose") : "nose");
  const PESO_MERC = { nose: 1, casa: 0.5, feria: 1.2, comprador: 1.6 };
  const pesoIngreso = () => PESO_MERC[mercado()] || 1;
  // si la familia siembra para comer (o en la sierra, cuando no lo dijo), una de las 3 opciones conserva su cultivo
  // principal: sin papa, la familia andina no come todo el año aunque otra rotación gane más
  function cultivoBase() {
    if (cultivoFijo()) return cultivoFijo();
    const act = D.perfil && D.perfil.rotacion_actual, m = mercado();
    if (!act || !(m === "casa" || (m === "nose" && (D.andina || D.region === "sierra")))) return null;
    const cuenta = {};
    act.split("|").forEach((c) => { const g = (D.cultivos[c] || {}).grupo; if (g && !["descanso", "cobertura"].includes(g)) cuenta[c] = (cuenta[c] || 0) + 1; });
    return Object.keys(cuenta).sort((a, b) => cuenta[b] - cuenta[a])[0] || null;
  }
  function conservarBase(lista) {
    const act = D.perfil && D.perfil.rotacion_actual, base = cultivoBase();
    if (!base) return lista;
    const tiene = (seq) => seq.split("|").includes(base), otras = lista.filter(([s]) => s !== act);
    if (otras.length < 3 || otras.slice(0, 3).some(([s]) => tiene(s))) return lista;
    const k = lista.findIndex(([s]) => s !== act && tiene(s));
    if (k < 0) return lista;
    const fila = lista[k], sin = lista.filter((_, i) => i !== k);
    sin.splice(sin.indexOf(otras[2]), 0, fila); // entra como 3.ª opción
    return sin;
  }
  const riegoIdx = () => { const mm = (D.perfil && D.perfil.riego_mm) || 0; return RIEGOS.reduce((a, b, i) => (Math.abs(b - mm) < Math.abs(RIEGOS[a] - mm) ? i : a), 0); };
  const elegir = (id, keys, cur, pre) => `<select id="${id}">${keys.map((k) => `<option value="${k}"${k === cur ? " selected" : ""}>${tr(pre + k)}</option>`).join("")}</select>`;
  // descanso y cultivos asociados: están en la página y app.js los lee; aquí solo se muestra la respuesta
  function fijasEnFila() {
    const caja = $("#restricFijos"), sel = (id) => { const x = $(id); return x.options[x.selectedIndex].text; };
    if (!caja) return;
    $("#vDesc").textContent = sel("#maxDesc");
    $("#vAsoc").textContent = sel("#asoc");
    caja.onchange = (e) => { fijasEnFila(); const d = e.target.closest(".rs-fil"); if (d) d.open = false; };
  }
  function renderRestric() {
    const box = $("#restric");
    if (!box || !D) return;
    const ex = excluidos();
    const ids = Object.keys(D.cultivos).filter((c) => D.cultivos[c].grupo !== "descanso" && D.cultivos[c].factible !== false);
    // cada pregunta en una fila con su respuesta a la vista: se abre solo la que quiere cambiar
    const abiertas = new Set($$(".rs-fil[open]", box).map((d) => d.dataset.k));
    const fila = (k, q, v, cuerpo) => `<details class="rs-fil" data-k="${k}"${abiertas.has(k) ? " open" : ""}><summary><span>${q}</span><b>${v}</b></summary><div class="rs-cuerpo">${cuerpo}</div></details>`;
    const conLista = (q, lista, nota = "") => `<label class="inline">${lista.replace("<select ", `<select aria-label="${h(q.replace(/<[^>]+>/g, ""))}" `)}</label>${nota}`; // la pregunta ya está arriba: no se repite
    const fijo = cultivoFijo(), dicho = D.perfil && D.perfil.entrevista;
    box.innerHTML = `<h3 class="ctx-h">${tr("rsT")}</h3>` + // sin subtítulo: el paso 1 queda corto
      fila("excl", tr("rsExcl"), ex.size ? h([...ex].map(cname).join(", ")) : tr("rsExclTodos"), `<p class="small">${tr("rsExclS")}</p>
        <div class="rs-chips">${ids.map((c) => `<button type="button" class="rs-chip ${ex.has(c) ? "off" : ""} ${noRegion(c) ? "reg" : ""}" data-c="${c}" aria-pressed="${!ex.has(c)}">${cico(c, "mini")} ${h(cname(c))}</button>`).join("")}</div>
        ${ids.some(noRegion) ? `<p class="small rs-reg">${tr("rsRegNota", { d: h(depNombre()), c: ids.filter(noRegion).map(cname).join(", ") })}</p>` : ""}`) +
      fila("base", tr("rsBaseQ"), fijo ? h(cname(fijo)) : tr("rsBaseNo"), conLista(tr("rsBaseQ"), `<select id="rsBase"><option value="">${tr("rsBaseNo")}</option>${ids.map((c) => `<option value="${c}"${c === fijo ? " selected" : ""}>${h(cname(c))}</option>`).join("")}</select>`)) +
      fila("forr", tr("rsForraje"), tr(forraje() ? "rsSi" : "rsNo"), conLista(tr("rsForraje"), `<select id="rsForr"><option value="no">${tr("rsNo")}</option><option value="si"${forraje() ? " selected" : ""}>${tr("rsSi")}</option></select>`)) +
      fila("equipo", tr("rsEquipoQ"), tr("rsEq_" + equipo()), conLista(tr("rsEquipoQ"), elegir("rsEquipo", EQUIPOS, equipo(), "rsEq_"))) +
      fila("merc", tr("rsMercQ"), tr("rsMe_" + mercado()), conLista(tr("rsMercQ"), elegir("rsMerc", MERCADOS, mercado(), "rsMe_"))) +
      (typeof CRITERIO !== "undefined" ? CRITERIO.preciosHtml() : "");
    // al elegir, la fila se cierra y muestra la respuesta nueva
    box.onchange = (e) => {
      const d = e.target.closest(".rs-fil");
      if (!d || e.target.tagName !== "SELECT") return;
      $("summary b", d).textContent = e.target.options[e.target.selectedIndex].text;
      d.open = false;
    };
    fijasEnFila();
    if (typeof CRITERIO !== "undefined") CRITERIO.enlazarPrecios(box);
    $$(".rs-chip", box).forEach((b) => (b.onclick = () => {
      if (noRegion(b.dataset.c)) { // de la lista del Midagri: se enciende o apaga solo para esta chacra
        const inc = store.get(K_INCL, {}), set = new Set(inc[D.sitio] || []);
        set.has(b.dataset.c) ? set.delete(b.dataset.c) : set.add(b.dataset.c);
        inc[D.sitio] = [...set]; store.set(K_INCL, inc);
        renderRestric(); cambio(); return;
      }
      const all = store.get(K_EXCL, {}), cur = excluidos(), c = b.dataset.c;
      if (cur.has(c)) cur.delete(c);
      else { if (cur.size >= ids.length - 1) { toast(tr("rsTodos")); return; } cur.add(c); }
      all[regionKey()] = [...cur]; store.set(K_EXCL, all);
      renderRestric(); cambio();
    }));
    $("#rsBase").onchange = (e) => { const all = store.get(K_BASE, {}); all[regionKey()] = e.target.value; store.set(K_BASE, all); cambio(); };
    $("#rsForr").onchange = (e) => { store.set(K_FORR, e.target.value === "si"); cambio(); };
    $("#rsEquipo").onchange = (e) => { store.set(K_EQUIP, e.target.value); cambio(); };
    $("#rsMerc").onchange = (e) => { store.set(K_MERC, e.target.value); cambio(); };
    const mas = $("#restricMas"); // cultivos que no puede sembrar, con qué trabaja la tierra y precios: en «Afinar (opcional)»
    if (mas) {
      mas.innerHTML = "";
      [".rs-fil[data-k=excl]", ".rs-fil[data-k=equipo]", ".pr-f"].forEach((q) => { const d = $(q, box); if (d) mas.appendChild(d); });
      mas.onchange = box.onchange;
    }
    // el agua sí cambia el cálculo: el motor vuelve a probar todas las rotaciones con esa agua (app.js: cambiarRiego)
    if ($("#rsAgua")) $("#rsAgua").onchange = async (e) => {
      const sel = e.target, msg = $("#rsAguaMsg");
      sel.disabled = true; msg.textContent = tr("rsAguaCalc");
      const ok = typeof cambiarRiego === "function" ? await cambiarRiego(+sel.value) : false;
      toast(tr(ok ? "rsAguaListo" : "rsAguaSin"));
      if (!ok) renderRestric();
    };
  }
  // el chip ya se ve marcado; el nuevo orden se calcula en el siguiente cuadro, para que el toque responda al instante
  function cambio() { if (typeof renderTop === "function") requestAnimationFrame(() => setTimeout(() => { lastTop = ""; renderTop(true).then(() => renderCustom()); }, 0)); }
  // filtro y empuje para ranked() en app.js
  function filtrar(rows) {
    const ex = excluidos(), no = typeof CRITERIO !== "undefined" ? CRITERIO.descartadas() : new Set(); // «No en mi chacra» (criterio.js)
    const fijo = cultivoFijo();
    if (!ex.size && !no.size && !fijo) return rows;
    const r = rows.filter(([seq]) => !no.has(seq) && !seq.split("|").some((c) => ex.has(c)));
    const conFijo = fijo ? r.filter(([seq]) => seq.split("|").includes(fijo)) : r;
    return conFijo.length ? conFijo : r.length ? r : rows;
  }
  const forrajeDe = (seq) => seq.split("|").reduce((s, c) => s + rasgos(c).forr, 0) / 6; // 0 a 1
  const extra = (seq) => (forraje() ? 15 * forrajeDe(seq) : 0);

  // ---------------------------------------------------------------- 3. calendario de la chacra (paso 3)
  let calSel = null;
  function estrategias() {
    const r = ranked().slice(0, 3), act = D.perfil && D.perfil.rotacion_actual;
    const out = [];
    if (act && D.rotaciones[act]) out.push({ seq: act, v: D.rotaciones[act], hoy: true, nombre: tr("esHoy") });
    let i = 1;
    for (const [seq, v] of r) { if (seq === act) continue; out.push({ seq, v, nombre: tr("esOpc", { i: i++ }) }); }
    return out.slice(0, 4);
  }
  function ocupacion(seq) {
    const T = tabla(), cel = Array(36).fill(null);
    seq.split("|").forEach((cid, k) => {
      const c = T[cid];
      if (!c) return;
      if (c.grupo === "descanso") { for (let m = 0; m < 12; m++) if (!cel[12 * k + m]) cel[12 * k + m] = { cid, desc: true }; return; }
      const ini = 12 * k + ((c.siembra_mes - 8 + 12) % 12);
      const dur = c.cosecha ? ((c.cosecha - c.siembra_mes + 12) % 12) + 1 : Math.max(1, Math.round(c.ciclo_dias / 30.4)); // de la siembra al mes de cosecha
      for (let j = 0; j < dur && ini + j < 36; j++) {
        const f = (j + 0.5) / dur;
        cel[ini + j] = { cid, j, sens: f >= c.fase_sens_ini && f <= c.fase_sens_fin, ini: j === 0, fin: j === dur - 1 };
      }
    });
    return cel;
  }
  function renderCalendario() {
    const box = $("#calendario");
    if (!box || !D) return;
    const cl = clima(), T = tabla();
    if (!cl || !T) { box.innerHTML = `<h3 class="hoy-h">${tr("caT")}</h3><p class="hint">${tr("caSinMotor")}</p>`; return; }
    const est = estrategias();
    if (!est.length) { box.innerHTML = ""; return; }
    if (!est.some((e) => e.seq === calSel)) calSel = est[0].seq;
    const seq = calSel, cel = ocupacion(seq), ms = mesesAgo();
    const mesDe = (i) => (7 + i) % 12; // índice 0 = agosto
    // clima de 12 meses (agosto a julio): lluvia en barras, ET0 en línea y heladas en puntos
    const W = 360, H = 110, bw = W / 12, maxv = Math.max(...cl.meses.map((m) => Math.max(m.p, m.e)), 1);
    const bars = ms.map((_, i) => { const m = cl.meses[mesDe(i)], hgt = m.p / maxv * (H - 30);
      return `<rect x="${(i * bw + 4).toFixed(1)}" y="${(H - 18 - hgt).toFixed(1)}" width="${(bw - 8).toFixed(1)}" height="${hgt.toFixed(1)}" class="ca-p"><title>${ms[i]}: ${fmt(m.p)} mm</title></rect>`; }).join("");
    const et = ms.map((_, i) => `${(i * bw + bw / 2).toFixed(1)},${(H - 18 - cl.meses[mesDe(i)].e / maxv * (H - 30)).toFixed(1)}`).join(" ");
    const hel = ms.map((_, i) => { const n = cl.meses[mesDe(i)].h0; return n >= 1 ? `<text x="${(i * bw + bw / 2).toFixed(1)}" y="11" text-anchor="middle" class="ca-h">❄${n >= 10 ? Math.round(n) : fmt(n, 0)}</text>` : ""; }).join("");
    const lbl = ms.map((m, i) => `<text x="${(i * bw + bw / 2).toFixed(1)}" y="${H - 4}" text-anchor="middle" class="ca-m">${m}</text>`).join("");
    const grafico = `<svg class="ca-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${tr("caLluvia")} / ${tr("caEt")}">${bars}<polyline points="${et}" class="ca-e"/>${hel}${lbl}</svg>
      <p class="legend ca-leg"><span class="lg"><span class="sq ca-sq-p"></span> ${tr("caLluvia")} (${tr("caMm")})</span> <span class="lg"><span class="ln ca-ln-e"></span> ${tr("caEt")}</span> <span class="lg">❄ ${tr("caHel")}</span></p>`;
    // tres campañas, mes a mes
    const filas = [0, 1, 2].map((k) => `<div class="ca-fila"><span class="ca-k" title="${tr("caCamp", { n: k + 1 })}">${k + 1}</span>${ms.map((m, i) => {
      const x = cel[12 * k + i], c = x && D.cultivos[x.cid];
      if (!x) return `<span class="ca-c vacia" title="${m}: ${tr("caVacia")}"></span>`;
      if (x.desc) return `<span class="ca-c desc" title="${m}: ${tr("caDesc")}"></span>`;
      const mm = cl.meses[mesDe(i)], cc = T[x.cid];
      const peligro = x.sens && ((cc.helada_umbral_c > -50 && mm.h0 >= 3) || mm.p < 0.6 * mm.e * cc.kc_med || ((cc.sens_exceso || 0) > 0 && mm.p > 1.6 * mm.e && mm.p > 150));
      return `<span class="ca-c ${peligro ? "vuln" : ""} ${esClaro(c.color) ? "claro" : ""}" style="background:${c.color}" title="${m}: ${h(cname(x.cid))}${peligro ? " · " + tr("caVuln") : ""}">${x.ini ? cico(x.cid, "ca-i") : peligro ? "⚠" : ""}</span>`;
    }).join("")}</div>`).join("");
    // mensajes: meses delicados, chacra vacía y oportunidades
    const notas = [], delicados = [];
    const vistos = new Set();
    for (let i = 0; i < 36; i++) {
      const x = cel[i];
      if (!x || x.desc || !x.sens) continue;
      const cc = T[x.cid], mm = cl.meses[mesDe(i % 12)], nom = cname(x.cid), mesN = ms[i % 12];
      let key = null, t = null;
      if (cc.helada_umbral_c > -50 && mm.h0 >= 3) { key = "h" + x.cid; t = tr("caVulnHel", { c: nom, m: mesN, n: fmt(mm.h0) }); }
      else if (mm.p < 0.6 * mm.e * cc.kc_med) { key = "s" + x.cid; t = tr("caVulnSeco", { c: nom, m: mesN, p: fmt(mm.p), e: fmt(mm.e * cc.kc_med) }); }
      else if ((cc.sens_exceso || 0) > 0 && mm.p > 1.6 * mm.e && mm.p > 150) { key = "x" + x.cid; t = tr("caVulnExc", { c: nom, m: mesN, p: fmt(mm.p) }); }
      if (key && !vistos.has(key)) { vistos.add(key); notas.push(t); delicados.push(`${mesN} (${nom})`); }
    }
    const huecos = [];
    for (let i = 0; i < 36;) { if (cel[i]) { i++; continue; } let j = i; while (j < 36 && !cel[j]) j++; if (j - i >= 2) huecos.push([i, j - 1]); i = j; }
    const verdes = Object.keys(D.cultivos).filter((c) => { const t = T[c]; return t && D.cultivos[c].factible !== false && (t.grupo === "cobertura" || t.familia === "Fabaceae" || /vicia/.test(c)) && t.ciclo_dias <= 160; });
    // una sola línea para los meses vacíos y un solo consejo: el del hueco más largo
    const opps = [];
    if (huecos.length) {
      const total = huecos.reduce((t, [a, b]) => t + b - a + 1, 0);
      const [a, b] = huecos.reduce((m, x) => (x[1] - x[0] > m[1] - m[0] ? x : m));
      const n = b - a + 1, mesesH = Array.from({ length: n }, (_, k) => mesDe((a + k) % 12));
      const p = mesesH.reduce((s, m) => s + cl.meses[m].p, 0), e = mesesH.reduce((s, m) => s + cl.meses[m].e, 0);
      const helado = mesesH.some((m) => cl.meses[m].h3 >= 8);
      opps.push(tr("caVaciaTot", { n: total }));
      opps.push(n >= 3 && p >= 0.45 * e && !helado && verdes.length
        ? tr("caOpVerde", { p: fmt(p), c: verdes.slice(0, 3).map(cname).join(", ") })
        : tr("caOpRastrojo", { p: fmt(p) }));
    } else opps.push(tr("caNada"));
    const conclusion = !delicados.length ? tr("caConcl0") : tr(delicados.length === 1 ? "caConcl1" : "caConclN", { x: delicados.join(", ") });
    box.innerHTML = `<h3 class="hoy-h">${tr("caT")} ${FACIL.voz(null, "#calendario .ca-notas")}</h3>
      <div class="ca-tabs" role="tablist">${est.map((e) => `<button type="button" role="tab" aria-selected="${e.seq === seq}" class="${e.seq === seq ? "on" : ""}" data-s="${e.seq}">${h(e.nombre)}</button>`).join("")}</div>
      <p class="ca-rot">${seq.split("|").map((c) => `${cico(c, "mini")} ${h(cname(c))}`).join(" → ")}</p>
      <p class="ca-concl">${conclusion}</p>
      <ul class="ca-notas">${[...new Set([...notas, ...opps])].map((t) => `<li>${t}</li>`).join("")}</ul>
      <p class="hoy-s">${tr("caS")}</p><p class="small ca-como">${tr("caComo")}</p>
      <div class="ca-wrap">${grafico}
        <div class="ca-grid"><div class="ca-fila ca-head"><span class="ca-k">${tr("caCampH")}</span>${ms.map((m) => `<span class="ca-mh" title="${m}"><span class="m3">${m}</span><span class="m1" aria-hidden="true">${m.charAt(0).toUpperCase()}</span></span>`).join("")}</div>${filas}</div>
        <p class="legend ca-leg"><span class="lg"><span class="sq ca-sq-v"></span> ${tr("caVacia")} ${FACIL.que("vacia")}</span> <span class="lg"><span class="sq ca-sq-d"></span> ${tr("caDesc")}</span> <span class="lg">⚠ ${tr("caVuln")} ${FACIL.que("delicado")}</span></p></div>`;
    $$(".ca-tabs button", box).forEach((b) => (b.onclick = () => { calSel = b.dataset.s; renderCalendario(); }));
  }

  // ---------------------------------------------------------------- 4. comparador de estrategias y fichas (paso 4)
  function metricas(seq, v) {
    const T = tabla(), s = seq.split("|"), act = D.perfil && D.perfil.cultivo_anterior;
    let nBal = null, agua = null;
    if (T && s.every((c) => T[c])) {
      nBal = s.reduce((a, c) => a + (T[c].n_aporte_residual || 0) - (T[c].grupo === "descanso" ? 0 : T[c].n_extraccion_suelo || 0), 0);
      const ws = s.map(aguaCultivo).filter(Boolean);
      agua = ws.length ? { etc: ws.reduce((a, w) => a + w.etc, 0) / 3, p: ws.reduce((a, w) => a + w.p, 0) / 3 } : { etc: 0, p: 0 };
    }
    const fam = (c) => (T && T[c] ? T[c].familia : (D.cultivos[c] || {}).familia);
    const full = (act && D.cultivos[act] ? [act] : []).concat(s);
    const rep = [...new Set(full.filter((c, j) => j && fam(c) === fam(full[j - 1]) && fam(c) !== "Descanso").map(fam))];
    const ale = v[F.ale].map((i) => (D.textos.es || [])[i] || "");
    const mo = v[F.soc], ero = v[F.ero] / 3;
    // «la tierra»: nitrógeno, materia orgánica y erosión juntos, en una sola palabra para el agricultor
    const tierra = (nBal == null ? 0 : nBal > 0 ? 1 : nBal < -100 ? -1 : 0) + (mo > 0.5 ? 1 : mo < -3 ? -1 : 0) + (ero <= 5 ? 1 : ero > 11 ? -1 : 0);
    const ing = typeof CRITERIO !== "undefined" ? CRITERIO.ingreso(seq, v[F.ing]) : v[F.ing]; // con los precios de su feria
    return { rob: ten(fracOf(v)), seco: ten(v[F.seco]), nino: ten(v[F.nino]), agua, nBal, mo, ero, rep, tierra,
             forr: forrajeDe(seq), ing, hel: ale.filter((a) => /helada/i.test(a)).length };
  }
  const FAMN = { es: { Solanaceae: "papa", Poaceae: "cereales", Fabaceae: "leguminosas", Amaranthaceae: "quinua", Oxalidaceae: "oca", Basellaceae: "olluco",
    Tropaeolaceae: "mashua", Convolvulaceae: "camote", Euphorbiaceae: "yuca", Malvaceae: "algodón", Amaryllidaceae: "cebolla" },
    en: { Solanaceae: "potato family", Poaceae: "cereals", Fabaceae: "legumes", Amaranthaceae: "quinoa family", Oxalidaceae: "oca", Basellaceae: "olluco",
    Tropaeolaceae: "mashua", Convolvulaceae: "sweet potato", Euphorbiaceae: "cassava", Malvaceae: "cotton", Amaryllidaceae: "onion" } };
  const famNom = (f) => ((FAMN[LANG] || FAMN.es)[f] || f);
  const puntos = (n) => `<span class="dots" aria-hidden="true">${"●".repeat(n)}<i>${"●".repeat(10 - n)}</i></span>`;

  function renderEstrategias(est = estrategias()) {
    const box = $("#estrategias");
    if (!box || !D) return;
    if (est.length < 2) { box.innerHTML = ""; return; }
    const M = est.map((e) => metricas(e.seq, e.v));
    // [etiqueta, valor (texto), número para comparar, ¿más es mejor?]
    // primero lo que entiende cualquier agricultor; lo técnico va en «Ver más detalles»
    const simples = [
      ["cAnios", (m) => `${puntos(m.rob)}<b>${tr("vDeDiez", { n: m.rob })}</b>`, (m) => m.rob, 1],
      ["cSeco", (m) => tr("vDeDiez", { n: m.seco }), (m) => m.seco, 1],
      M[0].agua ? ["cAguaS", (m) => (m.agua.etc <= m.agua.p * 1.05 ? tr("vAguaOk") : tr("vAguaFalta", { v: fmt(m.agua.etc - m.agua.p) })), (m) => -(m.agua.etc - m.agua.p), 1, (m) => m.agua.etc <= m.agua.p * 1.05] : null,
      ["cTierra", (m) => tr(m.tierra >= 2 ? "vTierraMuy" : m.tierra >= 1 ? "vTierraBien" : m.tierra <= -1 ? "vTierraMal" : "vTierraIgual"), (m) => m.tierra, 1, (m) => m.tierra >= 1],
      ["cPlaga", (m) => (m.rep.length ? tr("vPlagaMal", { f: m.rep.map(famNom).join(", ") }) : tr("vPlagaOk")), (m) => -m.rep.length, 1],
      ["cForr", (m) => tr(m.forr >= 0.67 ? "vForrAlto" : m.forr >= 0.34 ? "vForrMedio" : "vForrBajo"), (m) => (m.forr >= 0.67 ? 2 : m.forr >= 0.34 ? 1 : 0), 1],
      ["cIng", (m) => (m.ing < 0 ? `<span class="pierde">${tr("vIngMal", { v: fmt(-m.ing) })}</span>` : tr("vIng", { v: fmt(m.ing) })), (m) => Math.round(m.ing), 1, (m) => m.ing > 0],
    ].filter(Boolean);
    const tecnicas = [
      ["cNino", (m) => tr("vDeDiez", { n: m.nino }), (m) => m.nino, 1],
      M[0].agua ? ["cAgua", (m) => tr("vMm", { v: fmt(m.agua.etc), p: fmt(m.agua.p) }), (m) => m.agua.etc, -1] : null,
      M[0].nBal != null ? ["cNut", (m) => (m.nBal >= 0 ? tr("vNmas", { v: fmt(m.nBal) }) : tr("vNmenos", { v: fmt(-m.nBal) })), (m) => m.nBal, 1] : null,
      ["cMo", (m) => (Math.abs(m.mo) < 0.5 ? tr("vMoIgual") : tr(m.mo > 0 ? "vMoSube" : "vMoBaja", { v: fmt(Math.abs(m.mo), 1) })), (m) => m.mo, 1],
      ["cEro", (m) => tr(m.ero <= 11 ? "vEroOk" : "vEro", { v: fmt(m.ero, 1) }), (m) => m.ero, -1],
      ["cHel", (m) => (m.hel ? tr("vHelSi", { n: m.hel }) : tr("vHelNo")), (m) => -m.hel, 1],
    ].filter(Boolean);
    const cabeza = `<thead><tr><th scope="col">${tr("esCrit")}</th>${est.map((e) => `<th scope="col" class="${e.hoy ? "hoy" : ""}">
      <span class="es-n">${h(e.nombre)}</span><span class="es-seq">${e.seq.split("|").map((c) => cico(c, "mini")).join("")}</span><span class="es-nom">${e.seq.split("|").map((c) => h(cname(c))).join(" → ")}</span></th>`).join("")}</tr></thead>`;
    const cuerpo = (filas) => filas.map((f) => {
      const vals = M.map((m) => f[2](m)), best = f[3] > 0 ? Math.max(...vals) : Math.min(...vals), igual = vals.every((x) => x === vals[0]);
      // el ✓ solo marca algo bueno: «la cansa» o «pierde» no llevan ✓ aunque sean lo mejor de la fila
      const q = { cAnios: "anios", cSeco: "seco", cAguaS: "agua", cTierra: "tierra", cPlaga: "plaga", cForr: "forr", cIng: "ing" }[f[0]];
      return `<tr><th scope="row">${tr(f[0])}${q ? " " + FACIL.que(q) : ""}</th>${M.map((m) => { const ok = !igual && f[2](m) === best && (!f[4] || f[4](m));
        return `<td class="${ok ? "best" : ""}">${ok ? '<span class="tick" aria-hidden="true">✓</span>' : ""}${f[1](m)}</td>`; }).join("")}</tr>`; }).join("");
    const extra = typeof CRITERIO !== "undefined" ? CRITERIO.filas(est, M) : "";
    const colHoy = est.findIndex((e) => e.hoy) + 1, cols = est.map((e, i) => i + 1).filter((c) => c !== colHoy);
    const conOps = colHoy > 0 && cols.length > 1;
    const tablaHtml = `${conOps ? `<div class="es-ops" role="tablist">${cols.map((c) => `<button type="button" role="tab" data-c="${c}">${h(est[c - 1].nombre)}</button>`).join("")}</div>` : `<p class="es-desliza">${tr("esDesliza")}</p>`}<div class="es-wrap${conOps ? " es-una" : ""}"><table class="es-t">${cabeza}<tbody>${cuerpo(simples)}${extra}</tbody></table></div>
      <details class="es-tec"><summary>${tr("esTec")}</summary><div class="es-wrap"><table class="es-t">${cabeza}<tbody>${cuerpo(tecnicas)}</tbody></table></div>
        <p class="small">${tr("esTecS")}</p></details>`;
    const fichas = est.map((e, i) => ficha(e, M[i], M[0], est[0].hoy)).join("");
    const cx1 = D.contexto || {}, an1 = D.anios || [], sf = D.suelo_fuente === "openlandmap" ? "OpenLandMap" : "SoilGrids";
    const comun = [tr("feClima", { a: an1[0] || 1981, b: (an1[an1.length - 1] || 2025) + 1, n: an1.length || 45, z: fmt(cx1.altura) }),
      tr("lPrecio", { c: tr("esTodos") }), tr("lSuelo", { s: sf }), tr("lClima"), tr("lPlagas"), !(D.perfil && D.perfil.entrevista) && tr("mjEnt")].filter(Boolean);
    box.innerHTML = `<h3 class="section-sub">${tr("esT")}</h3><p class="hint">${tr("esS")}</p>${tablaHtml}
      <h4 class="es-fh">${tr("esFicha")}</h4><p class="small">${tr("esFichaS")}</p>
      <details class="es-comun"><summary>${tr("esComunT")}</summary><ul>${comun.map((x) => `<li>${x}</li>`).join("")}</ul></details>
      <div class="es-fichas">${fichas}</div>
      ${typeof CRITERIO !== "undefined" ? CRITERIO.pie() : ""}`;
    if (typeof CRITERIO !== "undefined") CRITERIO.enlazar(box);
    const tec = $(".es-tec", box); // los detalles técnicos están en la Vista técnica → Comparar
    if (tec) tec.remove();
    if (conOps) {
      if (!cols.includes(esCol)) esCol = cols[0];
      const pinta = () => {
        $$(".es-ops button", box).forEach((b) => { const on = +b.dataset.c === esCol; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
        // con una regla y no celda por celda: la fila «Entre cuánto podría estar» llega después del primer dibujo (analisis.js)
        let css = document.getElementById("esColsCss");
        if (!css) { css = document.createElement("style"); css.id = "esColsCss"; document.head.appendChild(css); }
        css.textContent = `@media (max-width: 640px) { #estrategias .es-una tr > *:not(:nth-child(1)):not(:nth-child(${colHoy + 1})):not(:nth-child(${esCol + 1})) { display: none; } }`;
      };
      $$(".es-ops button", box).forEach((b) => (b.onclick = () => { esCol = +b.dataset.c; pinta(); }));
      pinta();
    }
  }


  // ---------------------------------------------------------------- «Lo más importante» (facil.js): un solo mensaje arriba
  let esCol = 0; // la opción que se compara con la de hoy en el celular
  function renderResumen(est) {
    const box = $("#resumen");
    if (!box || !D) return;
    if (!est.length) { box.innerHTML = ""; return; }
    const M = est.map((e) => metricas(e.seq, e.v));
    const hoyI = est.findIndex((e) => e.hoy), opI = est.findIndex((e) => !e.hoy);
    const nom = (e) => e.seq.split("|").map(cname).join(" → ");
    const lineas = [];
    let avisoBase = "";
    if (hoyI >= 0) lineas.push(["🧑‍🌾", tr("resHoy", { r: h(nom(est[hoyI])), n: M[hoyI].rob })]);
    const op = opI >= 0 ? est[opI] : null, mo = opI >= 0 ? M[opI] : null;
    const r0 = ranked()[0];
    if (hoyI >= 0 && r0 && r0[0] === est[hoyI].seq) lineas.push(["✅", tr("resIgual")]);
    else if (op) {
      // «la que más se ajusta» no se puede decir de una opción que funciona menos años que la de hoy
      lineas.push(["🌱", tr(hoyI >= 0 && mo.rob < M[hoyI].rob ? "resOpMenos" : "resOp", { r: h(nom(op)), n: mo.rob })]);
      const gana = [], pierde = [];
      if (hoyI >= 0) {
        const mh = M[hoyI], nivel = (t) => (t >= 2 ? 2 : t >= 1 ? 1 : t <= -1 ? -1 : 0); // las mismas etiquetas de «¿Cómo deja la tierra?»
        if (mo.rob > mh.rob) gana.push(tr("fvMasAnios", { a: mo.rob, b: mh.rob }));
        else if (mo.rob < mh.rob) pierde.push(tr("fvMenosAnios", { a: mo.rob, b: mh.rob }));
        const ref = typeof CRITERIO !== "undefined" && CRITERIO.usaPrecios(op.seq).length ? "" : " " + tr("resRef"); // la ganancia no es un hecho: depende del precio
        if (Math.round(mo.ing) > Math.round(mh.ing) + 50) gana.push(tr("fvMasIng", { v: fmt(mo.ing - mh.ing) }) + ref);
        else if (Math.round(mo.ing) + 50 < Math.round(mh.ing)) pierde.push(tr("fvMenosIng", { v: fmt(mh.ing - mo.ing) }) + ref);
        if (nivel(mo.tierra) > nivel(mh.tierra)) gana.push(tr("fvTierraMas"));
        else if (nivel(mo.tierra) < nivel(mh.tierra)) pierde.push(tr("fvTierraMenos"));
      }
      // primero qué tan seguro es; después lo que se podría ganar
      const seg = typeof CRITERIO !== "undefined" ? CRITERIO.seguridad(op, mo).n : "alta";
      if (seg !== "alta") lineas.push(["🎯", tr("resSeguro", { n: tr("seg" + seg[0].toUpperCase() + seg.slice(1)), x: tr(seg === "baja" ? "resSegBaja" : "resSegMedia") }), seg === "baja"]);
      if (gana.length) lineas.push(["📈", tr("resGana", { t: gana.slice(0, 2).join(" · ") })]);
      // antes solo se decía lo que se gana: una opción que funciona menos años que la de hoy tiene que decirlo
      if (pierde.length) lineas.push(["📉", tr("resPierde", { t: pierde.join(" · ") })]);
      // la familia que come de su papa descarta una opción sin papa: se le dice cuál sí la lleva
      const base = cultivoBase(), opciones = est.filter((e) => !e.hoy), lleva = (e) => e.seq.split("|").includes(base);
      const cNom = base ? h(cname(base).toLowerCase()) : "";
      if (base && !lleva(op) && ranked().some(([q]) => q.split("|").includes(base))) {
        const k = opciones.findIndex(lleva);
        avisoBase = `<div class="res-base"><p>🍽️ ${k > 0 ? tr("resBase", { c: cNom, k: k + 1 }) : tr("resBaseSin", { c: cNom })}</p><button type="button" class="btn-sec" data-c="${base}">${tr("resBaseVer", { c: cNom })}</button></div>`;
      } else if (cultivoFijo() && lleva(op)) {
        avisoBase = `<div class="res-base ok"><p>🍽️ ${tr("resBaseSolo", { c: cNom })}</p><button type="button" class="btn-sec" data-c="">${tr("resBaseTodas")}</button></div>`;
      }
      // un año de descanso sin explicar parecía un año sin comer
      if (op.seq.split("|").some((c) => (D.cultivos[c] || {}).grupo === "descanso")) lineas.push(["🍂", tr("resDescanso")]);
      const dichas = String((D.perfil && D.perfil.rotacion_actual) || "").split("|");
      const nuevos = [...new Set(op.seq.split("|"))].filter((c) => (D.cultivos[c] || {}).grupo !== "descanso" && !dichas.includes(c));
      const rev = nuevos.length ? tr("rSemilla", { c: nuevos.map(cname).join(", ") })
        : typeof CRITERIO !== "undefined" && CRITERIO.seguridad(op, mo).n === "baja" ? tr("mjPedazo") : null;
      if (rev) lineas.push(["⚠️", tr("resRev", { t: rev })]);
    }
    if (D.region === "selva") lineas.push(["🌳", tr("resPerennes")]); // el cacao y el café todavía no entran en el cálculo
    lineas.push(["🤝", tr("resDecide")]);
    // en selva llegaba a 10 líneas: a la vista queda lo que decide; una seguridad baja no se esconde
    const plegada = ([i, , fija]) => ["🎯", "🍂", "⚠️"].includes(i) && !fija;
    const filas = (xs) => xs.map(([i, t]) => `<li><span class="res-i" aria-hidden="true">${i}</span><span>${t}</span></li>`).join("");
    const mas = lineas.filter(plegada);
    // la tarjeta de cada opción ya dice cuántos años, cuánto gana y qué tan seguro: aquí solo el aviso de papa
    revLinea = (lineas.find(([i]) => i === "⚠️") || [])[1] || "";
    box.innerHTML = `${avisoBase}<div class="res-oculto" hidden><ul class="res-l">${filas(lineas.filter((l) => !plegada(l)))}</ul>
      <details class="ah-more res-mas"><summary>${tr("resMasT")}</summary><ul class="res-l">${filas(mas)}</ul></details></div>`;
    box.hidden = !avisoBase;
    const bBase = $(".res-base button", box);
    if (bBase) bBase.onclick = () => { // usa el mismo filtro que «¿Hay un cultivo que no quiere dejar?» (paso 2)
      const all = store.get(K_BASE, {}); all[regionKey()] = bBase.dataset.c; store.set(K_BASE, all);
      renderRestric(); cambio();
    };
  }
  let revLinea = "";
  // la fila de 3 datos de cada tarjeta: cuánto gana, la tierra y qué tan seguro (lo de «Lo más importante», sin repetir)
  function datosCard(seq, v) {
    if (!D) return "";
    const m = metricas(seq, v), act = D.perfil && D.perfil.rotacion_actual, va = act && act !== seq && D.rotaciones[act];
    const mh = va ? metricas(act, va) : null, xs = [];
    if (mh && Math.abs(m.ing - mh.ing) > 50) xs.push(["💰", tr(m.ing > mh.ing ? "cdMas" : "cdMenos", { v: fmt(Math.abs(m.ing - mh.ing)) }), m.ing > mh.ing ? "ok" : "mal"]);
    else xs.push(["💰", m.ing < 0 ? tr("vIngMal", { v: fmt(-m.ing) }) : tr("vIng", { v: fmt(m.ing) }), m.ing < 0 ? "mal" : ""]);
    xs.push(["🌱", tr(m.tierra >= 2 ? "cdT2" : m.tierra >= 1 ? "cdT1" : m.tierra <= -1 ? "cdTm" : "cdT0"), m.tierra >= 1 ? "ok" : m.tierra <= -1 ? "mal" : ""]);
    if (typeof CRITERIO !== "undefined") { const n = CRITERIO.seguridad({ seq, hoy: seq === act }, m).n; xs.push(["🎯", tr("cdSeg", { n: tr("seg" + n[0].toUpperCase() + n.slice(1)) }), n === "baja" ? "mal" : n === "alta" ? "ok" : ""]); }
    const hoyT = mh ? `<p class="cd-hoy">${tr("cdHoy", { n: mh.rob })}</p>` : "";
    return `${hoyT}<ul class="cd-l">${xs.map(([i, t, c]) => `<li class="${c}"><span aria-hidden="true">${i}</span><span>${t}</span></li>`).join("")}</ul>`;
  }

  // la ficha en el orden en que conversa un agricultor: por qué → qué gana → qué revisar → qué tan seguro → su opinión;
  // la evidencia y los datos que faltan van al final, plegados, para el técnico
  function ficha(e, m, mHoy, hayHoy) {
    const s = e.seq.split("|"), v = e.v, T = tabla() || {};
    const uniq = [...new Set(s)].filter((c) => (D.cultivos[c] || {}).grupo !== "descanso");
    const li = (xs) => `<ul>${xs.map((x) => `<li>${x}</li>`).join("")}</ul>`;
    // 1. por qué
    const por = [];
    if (e.hoy) por.push(tr("fpHoy"));
    else {
      const dest = [["agua", F.agua], ["ingreso", F.ingreso], ["suelo", F.suelo], ["riesgo", F.riesgo]].filter(([, k]) => v[k] >= 70)
        .map(([n]) => tr("k" + n[0].toUpperCase() + n.slice(1)));
      if (dest.length) por.push(tr("fpDest", { k: dest.join(", ") }));
      if (hayHoy) {
        const d = [];
        if (m.rob !== mHoy.rob) d.push(tr(m.rob > mHoy.rob ? "fvMasAnios" : "fvMenosAnios", { a: m.rob, b: mHoy.rob }));
        if (Math.round(m.ing) !== Math.round(mHoy.ing)) d.push(tr(m.ing > mHoy.ing ? "fvMasIng" : "fvMenosIng", { v: fmt(Math.abs(m.ing - mHoy.ing)) }));
        if (m.tierra !== mHoy.tierra) d.push(tr(m.tierra > mHoy.tierra ? "fvTierraMas" : "fvTierraMenos"));
      }
      const r = ranked(), pos = r.findIndex(([q]) => q === e.seq);
      if (pos >= 0) por.push(tr("fpRank", { r: pos + 1, n: fmt(r.length) }));
    }
    // 2. beneficios
    const ben = [];
    const pon = (k, txt) => { const cs = uniq.filter((c) => rasgos(c)[k]); if (cs.length) ben.push(tr(txt, { c: cs.map(cname).join(", ") })); };
    pon("n", "bN"); pon("cob", "bCob"); pon("raiz", "bRaiz"); pon("seq", "bSeq");
    if (!m.rep.length) ben.push(tr("bFam"));
    if (s.includes("descanso")) ben.push(tr("bDesc"));
    if (m.forr >= 0.34) ben.push(tr("bForr"));
    // 3. riesgos para revisar
    const dichas = String((D.perfil && D.perfil.rotacion_actual) || "").split("|");
    const nuevos = uniq.filter((c) => !dichas.includes(c));
    const rie = v[F.ale].map((i) => (D.textos[LANG] || D.textos.es)[i]);
    if (m.ing < 0) rie.push(tr("rPeor", { p: `${v[F.peor]}/${String(v[F.peor] + 1).slice(-2)}` }));
    const me = mercado(), eq = equipo(), cx0 = D.contexto || {};
    if (!e.hoy && nuevos.length) {
      rie.push(tr("rSemilla", { c: nuevos.map(cname).join(", ") }));
      rie.push(tr({ nose: "rMercado", casa: "meCasa", feria: "meFeria", comprador: "meComp" }[me], { c: nuevos.map(cname).join(", ") }));
    }
    if (eq !== "nose") rie.push(tr({ mano: "eqMano", yunta: "eqYunta", tractor: "eqTractor" }[eq], { c: (e.hoy || !nuevos.length ? uniq : nuevos).map(cname).join(", ") }));
    if (eq === "tractor" && cx0.pendiente > 15) rie.push(tr("eqPend", { p: fmt(cx0.pendiente) }));
    const helados = uniq.filter((c) => T[c] && T[c].helada_umbral_c > -50 && m.hel);
    if (helados.length) rie.push(tr("rHelada", { c: helados.map(cname).join(", ") }));
    if (!e.hoy && typeof CRITERIO !== "undefined") { const sg = CRITERIO.seguridad(e, m); por.push(tr("cdSegF", { n: tr("seg" + sg.n[0].toUpperCase() + sg.n.slice(1)), p: sg.por.join("; ") })); sg.mejor.forEach((x) => { if (!rie.includes(x)) rie.push(x); }); }
    // 4. evidencia y 5. lagunas (para el técnico)
    const cx = D.contexto || {}, an = D.anios || [];
    const ev = [
      tr("feRes", { r: m.rob, ni: m.nino, s: m.seco, p: `${v[F.peor]}/${String(v[F.peor] + 1).slice(-2)}` }),
      ...v[F.raz].map((i) => (D.textos[LANG] || D.textos.es)[i]),
    ];
    const lag = [];
    const baja = uniq.filter((c) => T[c] && T[c].confianza === "baja");
    if (baja.length) lag.push(tr("lConf", { c: baja.map(cname).join(", ") }));
    const propios = typeof CRITERIO !== "undefined" ? CRITERIO.usaPrecios(e.seq) : [];
    if (propios.length) lag.push(tr("prUsa", { c: propios.map(cname).join(", ") })); // precios, suelo, lluvia y plagas: una vez, arriba
    if (!e.hoy && nuevos.length) lag.push(tr("lNuevo", { c: nuevos.map(cname).join(", ") }));
    const aso = uniq.filter((c) => (D.cultivos[c] || {}).grupo === "asociacion");
    if (aso.length) lag.push(tr("lAsoc", { c: aso.map(cname).join(", ") }));
    const leer = [tr("fPorque"), ...por, tr("fBen"), ...ben, tr("fRies"), ...rie].join(". ");
    const op = typeof CRITERIO !== "undefined" ? CRITERIO.opinion(e.seq) : null;
    const marca = op && op.v ? ` <span class="op-tag op-${op.v}">${tr("op" + op.v[0].toUpperCase() + op.v.slice(1)).split(" ")[0]}</span>` : "";
    return `<details class="es-ficha ${e.hoy ? "hoy" : ""}" data-seq="${h(e.seq)}"><summary><b>${h(e.nombre)}</b> <span class="es-sq">${s.map((c) => h(cname(c))).join(" → ")}</span>${marca} <span class="es-r">${m.rob}/10</span></summary>
      <div class="es-sec"><h5>${tr("fPorque")} ${FACIL.voz(leer)}</h5>${li(por)}</div>
      <div class="es-sec ben"><h5>${tr("fBen")}</h5>${ben.length ? li(ben) : "<p>—</p>"}</div>
      <div class="es-sec rie"><h5>${tr("fRies")}</h5>${li(rie.length ? rie : [tr("rDecide")])}</div>
      <details class="es-tec-f"><summary>${tr("fTec")}</summary>
        <div class="es-sec"><h5>${tr("fEvid")}</h5>${li(ev)}</div>
        ${lag.length ? `<div class="es-sec lag"><h5>${tr("fLag")}</h5>${li(lag)}</div>` : ""}</details></details>`;
  }

  // ---------------------------------------------------------------- «Aquí manda su criterio» (paso 4)
  // los casos en que la experiencia del agricultor y de su comunidad vale más que los datos, según su chacra y sus opciones
  // «Aquí manda su criterio»: en el paso 4, lo que más puede cambiar la decisión; la lista completa, en Información extra
  let criterioTodo = [];
  function pintarCriterioTodo() {
    const c = $("#leJuicioLista");
    if (c) c.innerHTML = criterioTodo.length ? `<h5>${tr("leNoVe")}</h5><ul>${criterioTodo.map((x) => `<li>${x}</li>`).join("")}</ul>` : "";
  }
  function renderCriterio(est) {
    const box = $("#suCriterio");
    if (!box || !D) return;
    const T = tabla() || {};
    const cs = [...new Set(est.flatMap((e) => e.seq.split("|")))].filter((c) => (D.cultivos[c] || {}).grupo !== "descanso");
    const actual = D.perfil && D.perfil.rotacion_actual, dichas = String(actual || "").split("|");
    const xs = [];
    if (D.andina) xs.push(tr("scHelada"));
    xs.push(tr("scLluvia"));
    xs.push(tr((D.perfil && D.perfil.riego_mm) > 0 ? "scRiegoSi" : "scRiegoNo"));
    const baja = cs.filter((c) => T[c] && T[c].confianza === "baja");
    if (baja.length) xs.push(tr("scConf", { c: baja.slice(0, 4).map(cname).join(", ") }));
    const nuevos = cs.filter((c) => !dichas.includes(c));
    if (actual && nuevos.length) xs.push(tr("scNuevo", { c: nuevos.slice(0, 4).map(cname).join(", ") }));
    const propios = typeof CRITERIO !== "undefined" ? est.flatMap((e) => CRITERIO.usaPrecios(e.seq)) : [];
    if (!propios.length) xs.push(tr("scPrecio"));
    xs.push(tr("scPlaga"));
    if (D.andina) xs.push(tr("scComun"));
    if (equipo() === "nose") xs.push(tr("scEquipo"));
    if (mercado() === "nose") xs.push(tr("scMerc"));
    criterioTodo = xs;
    pintarCriterioTodo();
    const riego = (D.perfil && D.perfil.riego_mm) > 0 ? "scRiegoSi" : "scRiegoNo";
    const tres = [tr(D.andina ? "scCorto" : "scCortoLl"), tr(propios.length ? riego : "scPrecioCorto"), tr(D.andina ? "scComun" : propios.length ? "scPlaga" : riego)];
    const lista = [revLinea && revLinea.replace(/^[^:]*:\s*/, ""), ...tres].filter(Boolean);
    box.innerHTML = `<h3 class="section-sub">${tr("adT")} ${FACIL.voz(null, "#suCriterio .sc-l")}</h3>
      <ul class="sc-l">${lista.map((x) => `<li>${x}</li>`).join("")}</ul><p class="sc-decide">🤝 ${tr("resDecide")}</p>
      <button type="button" class="sc-ver">${tr("scVer")}</button>`; // «Usted decide» ya está arriba, en «Lo más importante»
    $(".sc-ver", box).onclick = () => {
      temasExtra("confiar", 1);
      $("#leerDlg").showModal();
      $("#leerDlg").scrollTop = 0;
    };
  }
  // para la guía de conversación (criterio.js): lo que limita la chacra y las preguntas de equipos y mercado
  function limitaResumen() {
    return [tr("eRiego" + riegoIdx()), equipo() !== "nose" && tr("rsEq_" + equipo()), mercado() !== "nose" && tr("rsMe_" + mercado())].filter(Boolean).join(" · ");
  }
  function preguntasLimita(cs) {
    const c = cs.map(cname).join(", "), out = [];
    if (!c) return out;
    if (equipo() !== "nose") out.push(tr({ mano: "eqMano", yunta: "eqYunta", tractor: "eqTractor" }[equipo()], { c }));
    if (mercado() !== "nose") out.push(tr({ casa: "meCasa", feria: "meFeria", comprador: "meComp" }[mercado()], { c }));
    return out;
  }

  // ---------------------------------------------------------------- 5. «¿Y si…?»
  let simT = null, simVal = { lluvia: 0, temp: 0, precio: 0 };
  function renderSimulador() {
    const box = $("#simulador");
    if (!box || !D) return;
    if (!conMotor()) { box.innerHTML = ""; return; }
    const rng = (id, lab, min, max, step, v, u) => `<label class="si-r"><span>${tr(lab)} <output id="${id}O">${v ? (v > 0 ? "+" : "") + v + u : tr("siIgual")}</output></span>
      <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${v}"></label>`;
    box.innerHTML = `<h3 class="section-sub">${tr("siT")}</h3><p class="hint">${tr("siS")}</p>
      <div class="si-ctl">${rng("siL", "siLluvia", -40, 40, 10, simVal.lluvia, " %")}${rng("siT", "siTemp", 0, 4, 0.5, simVal.temp, " °C")}${rng("siP", "siPrecio", -50, 50, 10, simVal.precio, " %")}
      <button type="button" class="btn-sec" id="siReset">${tr("siReset")}</button></div>
      <div id="siOut" class="si-out" aria-live="polite"></div><p class="small">${tr("siNota")}</p>`;
    const leer = () => {
      simVal = { lluvia: +$("#siL").value, temp: +$("#siT").value, precio: +$("#siP").value };
      $("#siLO").textContent = simVal.lluvia ? (simVal.lluvia > 0 ? "+" : "") + simVal.lluvia + " %" : tr("siIgual");
      $("#siTO").textContent = simVal.temp ? "+" + simVal.temp + " °C" : tr("siIgual");
      $("#siPO").textContent = simVal.precio ? (simVal.precio > 0 ? "+" : "") + simVal.precio + " %" : tr("siIgual");
      clearTimeout(simT); simT = setTimeout(simular, 220);
    };
    ["#siL", "#siT", "#siP"].forEach((s) => ($(s).oninput = leer));
    $("#siReset").onclick = () => { $("#siL").value = 0; $("#siT").value = 0; $("#siP").value = 0; leer(); };
    simular();
  }
  function costoAnual(seq) { const T = tabla() || {}; return seq.split("|").reduce((a, c) => a + ((T[c] && T[c].costo_s_ha) || 0), 0) / 3; }
  function simular() {
    const out = $("#siOut");
    if (!out) return;
    const est = estrategias();
    if (!est.length) { out.innerHTML = ""; return; }
    out.innerHTML = `<p class="ah-msg"><span class="ah-spin" aria-hidden="true"></span> ${tr("siCalc")}</p>`;
    setTimeout(() => {
      const base = D._perfilMotor || {};
      const cambiaClima = simVal.lluvia || simVal.temp;
      const r = cambiaClima ? MOTOR.calcular(D.sitio, { ...base, solo: est.map((e) => e.seq), clima: { lluvia: simVal.lluvia / 100, temp: simVal.temp } }, [LANG]).rotaciones : null;
      const filas = est.map((e) => {
        const v0 = e.v, v1 = (r && r[e.seq]) || v0;
        const f0 = ten(v0[F.rob]), f1 = ten(v1[4]);
        const loc = (seq, x) => (typeof CRITERIO !== "undefined" ? CRITERIO.ingreso(seq, x) : x); // precios de su feria
        const cost = costoAnual(e.seq), ing1 = (loc(e.seq, v1[7]) + cost) * (1 + simVal.precio / 100) - cost;
        return { e, f0, f1, i0: loc(e.seq, v0[F.ing]), i1: ing1 };
      });
      const mejor = filas.reduce((a, b) => (b.f1 > a.f1 || (b.f1 === a.f1 && b.i1 > a.i1) ? b : a));
      const d = (a, b, f = (x) => x) => (b === a ? "" : ` <span class="${b > a ? "up" : "down"}">${b > a ? "▲" : "▼"} ${f(Math.abs(b - a))}</span>`);
      out.innerHTML = `<div class="es-wrap"><table class="es-t si-t"><thead><tr><th>${tr("siCol")}</th><th>${tr("siFun")}</th><th>${tr("siIng")}</th></tr></thead><tbody>
        ${filas.map((x) => `<tr class="${x === mejor ? "best-row" : ""}"><th scope="row">${h(x.e.nombre)}<small>${x.e.seq.split("|").map((c) => h(cname(c))).join(" → ")}</small></th>
          <td>${puntos(x.f1)}<b>${tr("vDeDiez", { n: x.f1 })}</b>${d(x.f0, x.f1)}</td><td>${x.i1 < 0 ? `<b class="pierde">−S/ ${fmt(-x.i1)}</b>` : `S/ ${fmt(x.i1)}`}${d(Math.round(x.i0), Math.round(x.i1), (v) => "S/ " + fmt(v))}</td></tr>`).join("")}
        </tbody></table></div><p class="si-mejor">🏅 ${tr("siMejor", { c: `<b>${h(mejor.e.nombre)}</b>` })}</p>`;
    }, 30);
  }


  // ---------------------------------------------------------------- 6. cómo leer los datos
  const SATS = {
    es: [
      ["NASA Power", "Lluvia, temperatura, radiación, viento y humedad, cada día desde 1981", "0,5° × 0,625° (~55 km)", "El motor: 45 campañas día a día, corregidas a la altura de su chacra"],
      ["GPM Imerg", "Lluvia medida desde el espacio cada media hora", "0,1° (~11 km)", "«Cómo está su chacra ahora»: la lluvia de los últimos días"],
      ["SMAP L4", "Humedad del suelo en la superficie y en la zona de raíces", "9 km", "Si hay humedad para sembrar hoy"],
      ["Modis NDVI (Terra)", "Verdor de las plantas (índice de vegetación)", "250 m", "Verdor de su chacra frente a otros años"],
      ["Modis LST (Terra)", "Temperatura de la superficie de día", "1 km", "Calor sobre la chacra (en lugar de Ecostress)"],
      ["HLS (Landsat 8/9 y Sentinel-2)", "Foto de la chacra", "30 m", "Ver su chacra desde el satélite"],
      ["Grace y Grace-FO", "Agua total guardada en la región (suelo, acuíferos, nieve)", "~300 km", "Si la reserva de agua de la cuenca baja con los años"],
      ["GEDI", "Biomasa y altura de la vegetación con láser", "1 km", "Cuánta vegetación hay alrededor"],
      ["SRTM / Nasadem y Copernicus DEM", "Altura del terreno", "30 a 90 m", "Altura, pendiente y erosión"],
      ["NEX-GDDP-CMIP6", "Clima proyectado a 2050 (5 modelos)", "0,25°", "Botones «2050» del paso 4"],
      ["Ecostress", "Temperatura y estrés hídrico de las plantas", "70 m", "No usado: pide cuenta de Earthdata y no tiene capa abierta (se usa Modis LST)"],
    ],
    en: [
      ["NASA Power", "Rain, temperature, radiation, wind and humidity, daily since 1981", "0.5° × 0.625° (~55 km)", "The engine: 45 seasons day by day, corrected to your farm's elevation"],
      ["GPM Imerg", "Rain measured from space every half hour", "0.1° (~11 km)", "“How your farm is now”: recent rain"],
      ["SMAP L4", "Surface and root-zone soil moisture", "9 km", "Whether there is moisture to sow today"],
      ["Modis NDVI (Terra)", "Plant greenness (vegetation index)", "250 m", "Your farm's greenness vs. other years"],
      ["Modis LST (Terra)", "Daytime land surface temperature", "1 km", "Heat over the farm (instead of Ecostress)"],
      ["HLS (Landsat 8/9 and Sentinel-2)", "Photo of the farm", "30 m", "See your field from space"],
      ["Grace and Grace-FO", "Total water stored in the region (soil, aquifers, snow)", "~300 km", "Whether the basin's water reserve is falling over the years"],
      ["GEDI", "Vegetation biomass and height by lidar", "1 km", "How much vegetation is around"],
      ["SRTM / Nasadem and Copernicus DEM", "Terrain elevation", "30 to 90 m", "Elevation, slope and erosion"],
      ["NEX-GDDP-CMIP6", "Projected 2050 climate (5 models)", "0.25°", "The “2050” buttons in step 4"],
      ["Ecostress", "Plant temperature and water stress", "70 m", "Not used: needs an Earthdata account and has no open layer (Modis LST is used)"],
    ],
  };
  const TERMS = {
    es: [
      ["Evapotranspiración (ET0 y ETc)", "El agua que el aire «se lleva» del suelo y de las plantas. ET0 es lo que pide un pasto de referencia; ETc = ET0 × Kc es lo que pide cada cultivo según su etapa. Si llueve menos que la ETc, la planta sufre."],
      ["Balance de agua", "La lluvia menos el agua que el aire se lleva del suelo y de las plantas. Si es negativo, el aire pide más agua de la que cae: hace falta guardar humedad o regar."],
      ["Anomalía de humedad del suelo", "Cuánto más húmedo o más seco está el suelo frente a lo normal de ese mes. Una anomalía negativa en la siembra es una alerta, aunque haya llovido algo."],
      ["NDVI (índice de vegetación)", "Mide lo verde que se ve la chacra desde el satélite, de 0 (tierra desnuda) a cerca de 1 (muy verde). Bajo en plena campaña puede ser sequía, helada o plaga."],
      ["Riesgo de helada", "Noches con la mínima bajo 0 °C (helada) o bajo −3 °C (helada fuerte). Lo que importa es si caen cuando el cultivo está en flor o llenando grano."],
      ["Temperatura de superficie (LST)", "La temperatura del suelo o de las hojas que «ve» el satélite. De día suele ser mucho más alta que la del aire."],
      ["Ky (sensibilidad a la sequía)", "Cuánta cosecha se pierde cuando falta agua. Ky menor que 1: el cultivo aguanta mejor la sequía."],
      ["Tendencia y Mann-Kendall", "La tendencia dice cuánto sube o baja algo por década. La prueba de Mann-Kendall dice si ese cambio es claro o puede ser azar."],
    ],
    en: [
      ["Evapotranspiration (ET0 and ETc)", "The water the air ‘takes’ from soil and plants. ET0 is what a reference grass needs; ETc = ET0 × Kc is what each crop needs at each stage. If it rains less than ETc, the plant suffers."],
      ["Water balance", "Rain minus the water the air takes from soil and plants. If negative, the air demands more water than falls: moisture must be kept or irrigated."],
      ["Soil moisture anomaly", "How much wetter or drier the soil is than normal for that month. A negative anomaly at sowing is a warning, even if it rained a little."],
      ["NDVI (vegetation index)", "How green the field looks from space, from 0 (bare soil) to nearly 1 (very green). Low in mid-season can mean drought, frost or pests."],
      ["Frost risk", "Nights below 0 °C (frost) or below −3 °C (hard frost). What matters is whether they hit while the crop is flowering or filling grain."],
      ["Land surface temperature (LST)", "The temperature of soil or leaves as seen by the satellite. In daytime it is usually much higher than air temperature."],
      ["Ky (drought sensitivity)", "How much yield is lost when water is short. Ky below 1: the crop copes better with drought."],
      ["Trend and Mann-Kendall", "The trend says how much something rises or falls per decade. The Mann-Kendall test says whether that change is clear or could be chance."],
    ],
  };
  const PARR = {
    es: {
      svt: ["El satélite mide desde arriba un cuadro grande (de 30 m a 300 km) y casi siempre de forma indirecta: el color o la temperatura de la superficie. Una estación o un pluviómetro miden en un punto, directo y con precisión, pero solo ahí.",
        "Juntos son mejores: el satélite llena los lugares donde no hay estación y la estación corrige al satélite. Muyuy corrige NASA Power con la altura de su chacra (−6,5 °C por cada 1000 m) y un factor de lluvia por región; usa el número de heladas que usted recuerda para ajustar las noches frías; y contrasta la lluvia con ERA5. Falta calibrar con las estaciones de Senamhi (Pisco)."],
      arm: ["Cada dato tiene su tamaño de píxel y su frecuencia: NASA Power ~55 km por día, Imerg 11 km cada media hora, SMAP 9 km, Modis 250 m a 1 km, HLS 30 m, Grace ~300 km por mes, GEDI 1 km.",
        "Muyuy los lleva a una misma cuadrícula y a un mismo calendario: 398 celdas de NASA Power cubren todo el Perú; el clima de cada celda se baja a la altura exacta de la chacra; los satélites se leen en el punto de la chacra; y todo se resume por mes y por campaña (agosto a julio), que es como piensa el agricultor. Así las rotaciones se comparan con las mismas reglas en todos los lugares."],
      inc: ["<b>Años extremos:</b> en 1983 la NASA registró mucha menos lluvia que las estaciones de Piura, cerca de un tercio en la costa; en 1998 sí coincidió. Por eso Muyuy puede decir que un año así «debió irle bien» aunque usted lo haya vivido distinto. Si es así, confíe en lo que vivió.", "Muyuy no da un solo número: dice «funciona 7 de cada 10 años», muestra los 45 años uno por uno, la peor campaña y lo que cambia con El Niño o con años secos. Si una rotación funciona 5 de 10, el resultado depende mucho del año y conviene probarla en un pedazo pequeño primero.",
        "Lo más incierto: los precios (referenciales), los cultivos con tabla de confianza baja, la lluvia en quebradas y laderas, y las plagas locales. Por eso cada ficha tiene «¿Dónde faltan datos?»."],
      cult: [["tN", "Las leguminosas (haba, tarwi, arveja, frijol, caupí, maní) viven con bacterias en sus raíces que toman nitrógeno del aire: dejan la tierra abonada para el cultivo que sigue."],
        ["tCob", "Los cultivos de cobertura y los que cubren bien el surco (avena, cebada, avena con vicia, mucuna) protegen la tierra de la lluvia y el viento: entra más agua, se pierde menos tierra y aumenta la materia orgánica."],
        ["tRaiz", "Las raíces profundas (maíz, cebada, sorgo, algodón) rompen las capas duras, suben nutrientes de abajo y dejan canales para que el agua se infiltre."],
        ["tSeq", "Los cultivos que aguantan la sequía (quinua, cañihua, maní, sorgo, yuca) pierden poca cosecha cuando falta agua: aseguran algo en los años malos."]],
      juicio: ["Cuando el resultado está en el medio (4 a 6 de 10): el año decide; pruebe en un pedazo.", "Cuando entra un cultivo que usted nunca sembró: semilla, manejo y mercado son lo primero.",
        "Cuando su chacra está en una quebrada, ladera o bajo una helada «de hondonada» que el satélite no ve.", "Cuando el precio de su feria es muy distinto al de referencia.",
        "Cuando la comunidad tiene un muyuy (sectores de rotación) acordado: Muyuy ayuda a conversarlo, no lo reemplaza.", "Siempre: la decisión es suya y de su comunidad."],
    },
    en: {
      svt: ["A satellite measures a large square from above (30 m to 300 km), almost always indirectly: the colour or temperature of the surface. A weather station or rain gauge measures one point, directly and precisely, but only there.",
        "Together they are better: satellites fill places without stations and stations correct the satellites. Muyuy corrects NASA Power to your farm's elevation (−6.5 °C per 1000 m) and with a regional rain factor; uses the frosts you remember to adjust cold nights; and cross-checks rain with ERA5. Calibration with Senamhi stations (Pisco) is still pending."],
      arm: ["Each dataset has its own pixel size and frequency: NASA Power ~55 km daily, Imerg 11 km every half hour, SMAP 9 km, Modis 250 m to 1 km, HLS 30 m, Grace ~300 km monthly, GEDI 1 km.",
        "Muyuy brings them to one grid and one calendar: 398 NASA Power cells cover Peru; each cell's climate is brought down to the farm's exact elevation; satellites are read at the farm's point; and everything is summarised by month and by season (August to July), which is how farmers think. So rotations are compared with the same rules everywhere."],
      inc: ["<b>Extreme years:</b> in 1983 NASA recorded much less rain than the stations in Piura, about a third on the coast; in 1998 it did match. That is why Muyuy may say such a year «should have gone well» even if you lived it differently. If so, trust what you lived.", "Muyuy does not give a single number: it says “works 7 out of 10 years”, shows all 45 years one by one, the worst season and what changes with El Niño or dry years. If a rotation works 5 of 10, the outcome depends a lot on the year and it is best to try it on a small plot first.",
        "Most uncertain: prices (reference values), crops with low-confidence data, rain in valleys and slopes and local pests. That is why every sheet has “Where is data missing?”."],
      cult: [["tN", "Legumes (faba bean, tarwi, pea, bean, cowpea, peanut) host bacteria in their roots that take nitrogen from the air: they leave the soil fertilized for the next crop."],
        ["tCob", "Cover crops and crops that cover the row well (oats, barley, oat-vetch, mucuna) protect soil from rain and wind: more water soaks in, less soil is lost and organic matter increases."],
        ["tRaiz", "Deep roots (maize, barley, sorghum, cotton) break hard layers, bring nutrients up and leave channels for water to infiltrate."],
        ["tSeq", "Drought-tolerant crops (quinoa, cañihua, peanut, sorghum, cassava) lose little yield when water is short: they secure something in bad years."]],
      juicio: ["When the result is in the middle (4 to 6 of 10): the year decides; test on a small plot.", "When a crop you have never grown appears: seed, management and market come first.",
        "When your field is in a valley, a slope or a frost hollow the satellite cannot see.", "When your market price is very different from the reference.",
        "When the community has an agreed muyuy (rotation sectors): Muyuy helps the conversation, it does not replace it.", "Always: the decision is yours and your community's."],
    },
  };
  // runasimi (borrador, 2026-11-14): antes «Cómo leer los datos» salía en castellano al elegir quechua
  SATS.qu = [
    ["NASA Power", "Para, q'oñiy, inti k'anchay, wayra, hump'iypas, sapa p'unchaw 1981-manta", "0,5° × 0,625° (~55 km)", "Motor: 45 tarpuy p'unchaw p'unchaw, chakraykipa altunman allichasqa"],
    ["GPM Imerg", "Hanaq pachamanta sapa kuskan horapi tupusqa para", "0,1° (~11 km)", "«Kunan chakrayki imayna»: qhipa p'unchawkunapa paran"],
    ["SMAP L4", "Allpa hawapi sapi kaq suyupipas allpapa hump'iynin", "9 km", "Kunan tarpunapaq hump'iy kanchu"],
    ["Modis NDVI (Terra)", "Yurakunapa q'omer kaynin (yura yupay)", "250 m", "Chakraykipa q'omer kaynin huk watakunawan tupachisqa"],
    ["Modis LST (Terra)", "P'unchaw allpa hawapa q'oñiynin", "1 km", "Chakra hawapi q'oñi (Ecostresspa rantinpi)"],
    ["HLS (Landsat 8/9, Sentinel-2)", "Chakrapa fotonta", "30 m", "Chakraykita satélitemanta qhaway"],
    ["Grace, Grace-FO", "Regionpi waqaychasqa tukuy yaku (allpa, ukhu yaku, rit'i)", "~300 km", "Cuencapa waqaychasqa yakun watakunawan pisiyanchu"],
    ["GEDI", "Yurakunapa kawsaq kaykunan sayayninpas, láserwan", "1 km", "Muyuriqpi hayk'a yurakuna kan"],
    ["SRTM / Nasadem, Copernicus DEM", "Allpapa altun", "30-manta 90 m-kama", "Altun, wichay, allpa apakuypas"],
    ["NEX-GDDP-CMIP6", "2050-paq yuyaykusqa pacha (5 modelo)", "0,25°", "4-ñiqi pasopi «2050» botonkuna"],
    ["Ecostress", "Yurakunapa q'oñiynin yaku sasachakuyninpas", "70 m", "Mana apaykachasqa: Earthdata cuentata mañakun, manataq kichasqa capayuqchu (Modis LST apaykachakun)"],
  ];
  TERMS.qu = [
    ["Evapotranspiración (ET0, ETc)", "Wayra allpamanta yurakunamantawan «apakusqan» yaku. ET0 huk qhawana q'achupa mañakusqanmi; ETc = ET0 × Kc sapa tarpuy wiñayninman hina mañakusqan. ETc-manta pisi paraqtinqa, yura ñak'arin."],
    ["Yaku balance", "Para, wayra allpamanta yurakunamantawan apakusqan yakuta qichuspa. Mana aypaqtinqa, wayraqa urmamuqmanta aswan yakuta mañakun: hump'iyta waqaychana utaq qarpana."],
    ["Allpa hump'iypa hukniray kaynin", "Chay killapa sapa kuti hinanmanta allpa hayk'a aswan hump'i utaq ch'aki kasqan. Tarpuypi pisi kaqtinqa willaymi, pisilla paraspapas."],
    ["NDVI (yura yupay)", "Satélitemanta chakra hayk'a q'omer rikukusqanta tupun, 0-manta (q'ala allpa) 1-kama (ancha q'omer). Chawpi tarpuypi pisi kaqtinqa ch'akiy, qasa utaq kuru kanman."],
    ["Qasa peligro", "0 °C-manta (qasa) utaq −3 °C-manta (sinchi qasa) uraman tutakuna. Tarpuy t'ikachkaqtin utaq muhunta hunt'achkaqtin urmaqtinmi aswan waqllichin."],
    ["Allpa hawapa q'oñiynin (LST)", "Satélitepa «rikusqan» allpapa utaq rapikunapa q'oñiynin. P'unchawqa wayramanta aswan q'oñi."],
    ["Ky (ch'akiyman sasachakuy)", "Yaku pisiqtin hayk'a allay chinkan. Ky 1-manta pisi: tarpuy ch'akiyta aswan allinta aguantan."],
    ["Puriy, Mann-Kendall", "Puriyqa nin sapa chunka watapi imapas hayk'ata wichaykun utaq uraykun. Mann-Kendall pruebataq nin chay tikrakuy sut'ichus utaq kaqllachus."],
  ];
  PARR.qu = {
    svt: ["Satéliteqa hanaqmanta hatun k'uchuta tupun (30 m-manta 300 km-kama), yaqa sapa kuti mana chiqanta: allpa hawapa llimpinta utaq q'oñiyninta. Huk estación utaq pluviómetroqa huk chiqanllapi tupun, chiqanta allintapas, ichaqa chayllapi.",
      "Kuska aswan allin: satéliteqa estación mana kasqan chiqankunata hunt'an, estacióntaq satéliteta allichan. Muyuyqa NASA Powerta chakraykipa altunwan allichan (sapa 1000 m −6,5 °C), sapa regionpaq para yupaywanpas; qam yuyasqayki qasakunawan chiri tutakunata allichan; paratataq ERA5-wan tupachin. Senamhipa estacionninkunawan (Pisco) allichanaraqmi."],
    arm: ["Sapa willakuyqa kikin píxel sayayniyuq, kikin kutiyniyuqmi: NASA Power ~55 km sapa p'unchaw, Imerg 11 km sapa kuskan hora, SMAP 9 km, Modis 250 m-manta 1 km-kama, HLS 30 m, Grace ~300 km sapa killa, GEDI 1 km.",
      "Muyuyqa huk kikin cuadrículaman, huk kikin calendarioman apan: NASA Powerpa 398 k'uchun tukuy Perúta qatan; sapa k'uchupa pachan chakrapa cheqaq altunman uraykachikun; satélitekunataq chakrapa chiqanpi ñawinchakun; tukuytaq sapa killapi sapa tarpuypi (agostomanta julio killakama) huñukun, chakra runa yuyasqan hina. Chhaynapim muyuykunaqa tukuy chiqankunapi kikin kamachiykunawan tupachikun."],
    inc: ["<b>Ancha sasa watakuna:</b> 1983 watapi NASA-qa Piurapa estacionninkunamanta aswan pisi parata qillqarqan, chalapi yaqa kimsamanta huk partellata; 1998-pitaq tuparqan. Chayraykum Muyuyqa chhayna watapi «allinchá karqan» ninman, qam hukniraqta kawsaspapas. Chhayna kaqtinqa, kawsasqaykiman iñiy.", "Muyuyqa manam huk yupayllatachu qun: «chunka watamanta 7 watapi allin» nin, 45 watata sapanka rikuchin, aswan millay tarpuyta, El Niñowan ch'aki watakunawan imachus tikrakusqantapas. Huk muyuy chunkamanta 5 allin kaqtinqa, lluqsiyninqa watamanta ancha kan: ñawpaqta huch'uy pedazopi pruebay.",
      "Aswan mana sut'i: chanikuna (qhawanapaqlla), pisi iñiy listayuq tarpuykuna, wayq'okunapi wichaykunapipas para, llaqtapa kurunkunapas. Chayraykum sapa fichapi «¿Maypitaq willakuy pisin?» kan."],
    cult: [["tN", "Leguminosakuna (hawas, tarwi, alberja, purutu, caupí, maní) sapinkunapi bacteriakunawan kawsanku, wayramanta nitrógenota hap'inku: qatiq tarpuypaq allpata wanuchasqata saqinku."],
      ["tCob", "Qataq tarpuykuna, wachuta allinta qataqkunapas (avena, cebada, vicia avenayuq, mucuna) allpata paramanta wayramantawan waqaychanku: aswan yaku yaykun, pisi allpa chinkan, materia orgánicapas yapakun."],
      ["tRaiz", "Ukhu sapikuna (sara, cebada, sorgo, algodón) sinchi allpakunata p'akinku, uramanta mikhunata wichachinku, yaku yaykunanpaq ñankunata saqinku."],
      ["tSeq", "Ch'akiyta aguantaq tarpuykuna (kinwa, qañiwa, maní, sorgo, rumu) yaku pisiqtin pisi allaytalla chinkachinku: millay watakunapi imallatapas qunku."]],
    juicio: ["Lluqsiy chawpipi kaqtin (chunkamanta 4-manta 6-kama): wata akllan; huk pedazopi pruebay.", "Mana hayk'aq tarpusqayki tarpuy yaykuqtin: muhu, apaykachay, rantikuypas ñawpaqta.",
      "Chakrayki wayq'opi, wichaypi kaqtin utaq satélite mana rikusqan «hoq'o» qasa urmaqtin.", "Qhatuykipa chanin qhawana chanimanta ancha hukniray kaqtin.",
      "Ayllu huk muyuyta (muyuy suyukunata) rimanakusqa kaqtin: Muyuyqa chay rimanakuyta yanapan, manam rantinchu.", "Sapa kuti: akllayqa qampa, aylluykipapas."],
  };
  // ---------------------------------------------------------------- fases de la luna (recomendación de Aponte) y referencias por tema
  // Fase calculada con el mes sinódico (29,53 días) desde la luna nueva del 6 ene 2000 18:14 UTC; puede variar medio día
  function faseLuna(d = new Date()) {
    const M = 29.530588853, e = (((d.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / 864e5) % M + M) % M;
    const i = e < 1 ? 0 : e < M / 4 - 1 ? 1 : e < M / 4 + 1 ? 2 : e < M / 2 - 1 ? 3 : e < M / 2 + 1 ? 4 : e < 3 * M / 4 - 1 ? 5 : e < 3 * M / 4 + 1 ? 6 : e < M - 1 ? 7 : 0;
    const dias = (x) => Math.round(((x - e) % M + M) % M);
    return { i, llena: dias(M / 2), nueva: dias(0), frac: e / M };
  }
  // la luna de hoy, dibujada: 0 = nueva, 0,5 = llena. En el Perú, al sur del ecuador, la creciente se ilumina a la izquierda
  function lunaSvg(frac) {
    const k = Math.cos(2 * Math.PI * frac), rx = (45 * Math.abs(k)).toFixed(1), giro = frac > 0.5 ? ' transform="translate(100) scale(-1 1)"' : "";
    return `<svg class="luna-dib" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45" fill="#37474f"/><path${giro} fill="#ffd54f" d="M50 5A45 45 0 0 0 50 95A${rx} 45 0 0 ${k > 0 ? 1 : 0} 50 5Z"/><circle cx="50" cy="50" r="45" fill="none" stroke="#212c33" stroke-width="5"/></svg>`;
  }
  let lunaDia = null; // el día que mira el agricultor; null = hoy
  const isoDe = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  function lunaHoy() {
    const f = faseLuna(lunaDia || new Date());
    return `<span class="luna-i">${lunaSvg(f.frac)}</span><b>${tr("lunaF" + f.i)}</b><small>${f.i === 4 ? tr("lunaFN", { n: f.nueva }) : tr("lunaFL", { n: f.llena })}</small>`;
  }
  function lunaHtml() {
    return `<p class="luna-hoy" id="lunaHoy">${lunaHoy()}</p>
      <div class="luna-nav"><button type="button" class="btn-sec" data-luna="-1" aria-label="${tr("lunaAntes")}">‹</button><input type="date" id="lunaFecha" value="${isoDe(lunaDia || new Date())}" aria-label="${tr("lunaElige")}"><button type="button" class="btn-sec" data-luna="1" aria-label="${tr("lunaDespues")}">›</button><button type="button" class="btn-sec" data-luna="0">${tr("lunaHoyB")}</button></div>
      <h5>${tr("lunaSaberT")}</h5><ul><li>${tr("lunaS1")}</li><li>${tr("lunaS2")}</li><li>${tr("lunaS3")}</li></ul>
      <h5>${tr("lunaCienT")}</h5><p>${tr("lunaC1")}</p><p class="small">${tr("lunaC2")}</p>`;
  }
  function lunaPinta() { const h = $("#lunaHoy"), i = $("#lunaFecha"); if (h) h.innerHTML = lunaHoy(); if (i) i.value = isoDe(lunaDia || new Date()); }
  // «funciona N de 10», para probar qué significa
  function confHtml(n) {
    return `<div class="le-conf-sq" aria-hidden="true">${Array.from({ length: 10 }, (_, i) => `<span class="sq ${i < n ? "ok" : "bad"}"></span>`).join("")}</div><p><b>${tr("confN", { n })}.</b> ${tr(n >= 7 ? "confA" : n >= 4 ? "confM" : "confB")}</p>`;
  }
  const refLi = ([t, u]) => `<li>${t}${u ? ` <a href="${u}" target="_blank" rel="noopener">${tr("refVer")}</a>` : ""}</li>`;
  const REFS = {
    clima: [["refA", [
      ["NASA Langley Research Center. Power Project, Daily API (clima diario desde 1981).", "https://power.larc.nasa.gov/docs/"],
      ["NASA JPL (2013). SRTM Global 1 arc second (altura del terreno).", "https://lpdaac.usgs.gov/products/srtmgl1v003/"],
      ["Hersbach, H. et al. (2020). The ERA5 global reanalysis. Q. J. R. Meteorol. Soc. 146, 1999–2049.", "https://doi.org/10.1002/qj.3803"],
      ["Aybar, C. et al. (2020). A high-resolution gridded rainfall dataset for Peru (Pisco). Hydrol. Sci. J. 65, 770–785.", "https://doi.org/10.1080/02626667.2019.1649411"],
      ["Thrasher, B. et al. (2022). NASA Global Daily Downscaled Projections, CMIP6. Sci. Data 9, 262.", "https://doi.org/10.1038/s41597-022-01393-4"],
      ["Didan, K. (2021). Modis/Terra Vegetation Indices V061. NASA LP DAAC.", "https://modis.ornl.gov/data/modis_webservice.html"]]],
    ["refB", [
      ["NOAA CPC. Oceanic Niño Index.", "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensostuff/ONI_v5.php"],
      ["Cai, W. et al. (2020). Climate impacts of ENSO on South America. Nat. Rev. Earth Environ. 1, 215–231.", "https://doi.org/10.1038/s43017-020-0040-3"],
      ["Lavado-Casimiro, W. y Espinoza, J. C. (2014). Impactos de El Niño y La Niña en las lluvias del Perú. Rev. Bras. Meteorol. 29, 171–182.", "https://doi.org/10.1590/S0102-77862014000200003"],
      ["BCRP. El Niño de 1982-83 y 1997-98. Revista Moneda 164.", "https://www.bcrp.gob.pe/docs/Publicaciones/Revista-Moneda/moneda-164/moneda-164-06.pdf"],
      ["IGP. El Niño costero 2017.", "https://repositorio.igp.gob.pe/bitstream/handle/IGP/4620/El-nino-costero-2017.pdf"],
      ["Marengo, J. A. y Espinoza, J. C. (2016). Extreme seasonal droughts and floods in Amazonia. Int. J. Climatol. 36, 1033–1050.", "https://doi.org/10.1002/joc.4420"],
      ["Decreto de Urgencia 025-2022 y reportes de Senamhi sobre la sequía del 2022 en la sierra sur.", "https://leyes.congreso.gob.pe/Documentos/2021_2026/Decretos/Urgencias/2022/DU-025-2022-OF.pdf"]]]],
    rot: [["refC", [
      ["Zhao, J. et al. (2022). Yield advantage of legume-based rotations. Nat. Commun. 13, 4926.", "https://doi.org/10.1038/s41467-022-32464-0"],
      ["Bowles, T. M. et al. (2020). Crop-rotation diversification increases agricultural resilience. One Earth 2, 284–293.", "https://doi.org/10.1016/j.oneear.2020.02.007"],
      ["Aguilera, J. et al. (2013). Cultivation and fallow length in the Bolivian Andean highland. Mt. Res. Dev. 33, 391–403.", ""],
      ["Orlove, B. S. y Godoy, R. (1986). Sectoral fallowing systems in the Central Andes. J. Ethnobiol. 6, 169–204.", "https://ethnobiology.org/sites/default/files/pdfs/JoE/6-1/OrloveGodoy1986.pdf"],
      ["Tapia, M. E. y Fries, A. M. (2007). Guía de campo de los cultivos andinos. FAO y ANPE.", "https://www.fao.org/4/ai185s/ai185s.pdf"]]],
    ["refD", [
      ["Allen, R. G. et al. (1998). Crop evapotranspiration (FAO-56).", "https://www.fao.org/4/x0490e/x0490e00.htm"],
      ["Steduto, P. et al. (2012). Crop yield response to water (FAO-66).", "https://www.fao.org/4/i2800e/i2800e00.htm"],
      ["Midagri (2022-2024). Anuarios Producción agrícola 2021, 2022 y 2023 (qué se siembra en cada región).", "https://www.gob.pe/institucion/midagri/informes-publicaciones/2730325-compendio-anual-de-produccion-agricola"],
      ["INIA. Fichas de INIA 332, INIA 434 y quinua (rangos de altura).", "https://www.gob.pe/inia"]]],
    ["refE", [
      ["Pezo Araujo, H. (2012). Influencia de las fases lunares en la producción agrícola. Universidad Nacional de San Martín.", "https://repositorio.unsm.edu.pe/backend/api/core/bitstreams/77ed3b00-545f-4dc1-a68c-2306578af53a/content"],
      ["Mayoral, O. et al. (2020). What has been thought and taught on the lunar influence on plants in agriculture? Agronomy 10, 955.", "https://doi.org/10.3390/agronomy10070955"],
      ["RPP. Las fases de la luna y el calendario agrícola (divulgación).", "https://rpp.pe/lima/actualidad/las-fases-de-la-luna-y-el-calendario-agricola-noticia-453687"]]]],
    leer: [["refF", [
      ["Midagri (2022-2024). Anuarios Producción agrícola, cuadros 4 y 5: rendimiento y precio en chacra por región.", "https://www.gob.pe/institucion/midagri/informes-publicaciones/2730325-compendio-anual-de-produccion-agricola"],
      ["INEI (2021). Costos de producción en base a la Encuesta Nacional Agraria 2018.", "https://www.inei.gob.pe/media/MenuRecursivo/investigaciones/costos-de-produccion-v7.pdf"],
      ["BCRP. Memoria 2022 (inflación de Lima, para llevar los costos a precios recientes).", "https://www.bcrp.gob.pe/docs/Publicaciones/Memoria/2022/memoria-bcrp-2022-4.pdf"],
      ["Ministerio de Agricultura de España (1918). Hoja divulgadora: la arroba del Perú equivale a 11,502 kg.", "https://www.mapa.gob.es/ministerio/pags/biblioteca/hojas/hd_1918_17-19.pdf"]]],
    ["refG", [
      ["INIA (2024). Manual para el análisis de suelos agrícolas y agua para riego.", "https://repositorio.inia.gob.pe/server/api/core/bitstreams/2853f1a1-bb6d-4480-ac2b-f8b5c033f09d/content"],
      ["Poggio, L. et al. (2021). SoilGrids 2.0. SOIL 7, 217–240.", "https://doi.org/10.5194/soil-7-217-2021"],
      ["Hengl, T. (2018). OpenLandMap, suelo a 250 m. Zenodo.", "https://doi.org/10.5281/zenodo.2525663"],
      ["Saxton, K. E. y Rawls, W. J. (2006). Soil water characteristic estimates. SSSAJ 70, 1569–1578.", "https://doi.org/10.2136/sssaj2005.0117"],
      ["Renard, K. G. y Freimund, J. R. (1994). Rainfall erosivity. J. Hydrol. 157, 287–306.", "https://doi.org/10.1016/0022-1694(94)90110-4"]]],
    ["refH", [
      ["Fabregas, R. et al. (2019). Realizing the potential of digital development: agricultural advice. Science 366, eaay3038.", "https://doi.org/10.1126/science.aay3038"],
      ["Rose, D. C. et al. (2016). Decision support tools for agriculture. Agric. Syst. 149, 165–174.", "https://doi.org/10.1016/j.agsy.2016.09.009"],
      ["Garcia-Retamero, R. y Cokely, E. T. (2017). Visual aids that promote risk literacy. Hum. Factors 59, 582–627.", "https://doi.org/10.1177/0018720817690634"],
      ["Clarkson, G. et al. (2022). Participatory Integrated Climate Services for Agriculture. Clim. Serv. 26, 100298.", "https://doi.org/10.1016/j.cliser.2022.100298"]]]],
  };
  const refsHtml = (t) => `<div class="le-refs">${t === "clima" ? `<p class="small">${tr("refNasa")}</p>` : t === "leer" ? `<p class="small">${tr("refEco")}</p>` : ""}${REFS[t].map(([h, l]) => `<h5>${tr(h)}</h5><ul>${l.map(refLi).join("")}</ul>`).join("")}</div>`;

  function renderLeer() {
    const box = $("#leerBody");
    if (!box || !D) return;
    const L = PARR[LANG] ? LANG : "es", P = PARR[L]; // castellano, inglés o runasimi
    const sats = `<div class="es-wrap"><table class="es-t le-t"><thead><tr><th>${tr("thDato")}</th><th>${tr("thMide")}</th><th>${tr("thRes")}</th><th>${tr("thUso")}</th></tr></thead>
      <tbody>${SATS[L].map((r) => `<tr><th scope="row">${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("")}</tbody></table></div>`;
    const dl = (f) => `<dl class="le-dl">${TERMS[L].filter(f).map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join("")}</dl>`;
    const TEC = /ET0|LST|^Ky|Mann-Kendall/; // términos técnicos: solo en la Vista técnica
    const terms = dl(([t]) => !TEC.test(t)), termsTec = dl(([t]) => TEC.test(t));
    const cult = `<div class="le-cult">${P.cult.map(([k, t]) => { const cs = conRasgo({ tN: "n", tCob: "cob", tRaiz: "raiz", tSeq: "seq" }[k]);
      return `<div class="le-c"><h5>${tr(k)}</h5><p>${t}</p><p class="small"><b>${tr("tAqui", { c: cs.length ? cs.map(cname).join(", ") : tr("tNinguno") })}</b></p></div>`; }).join("")}</div>`;
    const sec = (t, body, open = false) => `<details class="le-sec" data-k="${t}"${open ? " open" : ""}><summary>${tr(t)}</summary><div>${body}</div></details>`;
    const cif = sueloCifras((D.suelo_txt && D.suelo_txt[LANG]) || D.contexto.suelo);
    if (cif && D.perfil && D.perfil.lab) for (const k of ["arena", "arcilla", "mo", "ph"]) if (D.perfil.lab[k] != null) cif[k] = D.perfil.lab[k]; // su análisis manda sobre el mapa
    const cf = (k, v, nivel, exp, nota = "") => `<details class="cf-f"><summary><span>${tr(k)}</span><b>${v}</b>${nivel ? `<em>${nivel}</em>` : ""}</summary><p>${tr(exp)}${nota}</p></details>`;
    const cifras = `<p class="hint">${tr("cfS")}</p>${cf("cfPend", `${D.contexto.pendiente} %`, tr("pendT" + pendNivel(D.contexto.pendiente)), "cfXPend")}
      ${cif ? cf("cfArena", `${cif.arena} %`, "", "cfXArena") + cf("cfArcilla", `${cif.arcilla} %`, "", "cfXArcilla") + cf("cfMo", `${cif.mo} %`, tr(claseInia(cif.mo, 2, 4)), "cfXMo") + cf("cfPh", cif.ph, tr(phInia(cif.ph)), "cfXPh") : ""}
      <p class="small">${tr(D.perfil && D.perfil.lab ? "cfLab" : "cfMapa")}</p><button type="button" class="btn-sec ie-ir" data-ir="lab">${tr("labT")}</button>`;
    const conf = `<div class="le-conf"><label for="leConfR"><b>${tr("confT")}</b></label><input type="range" id="leConfR" min="0" max="10" step="1" value="7"><div id="leConfV">${confHtml(7)}</div></div>`;
    const buscaTer = `<input type="search" class="le-ter-q" autocomplete="off" placeholder="${tr("terBus")}" aria-label="${tr("terBus")}"><p class="hint le-ter-no" hidden>${tr("ieNada")}</p>`;
    box.innerHTML = sec("leCifras", cifras) + sec("leSat", sats, true) + sec("leTer", buscaTer + terms) + sec("leTerTec", termsTec) + sec("leSvt", P.svt.map((p) => `<p>${p}</p>`).join("")) +
      sec("leArm", P.arm.map((p) => `<p>${p}</p>`).join("")) + sec("leInc", conf + P.inc.map((p) => `<p>${p}</p>`).join("")) +
      sec("leCult", cult) + sec("leLuna", lunaHtml()) + sec("leRefClima", refsHtml("clima")) + sec("leRefRot", refsHtml("rot")) + sec("leRefLeer", refsHtml("leer")) + sec("leJuicio", `<div id="leJuicioLista"></div><ul>${P.juicio.map((x) => `<li>${x}</li>`).join("")}</ul>`);
    pintarCriterioTodo();
    temasExtra(); // cada sección a su tema (si la ventana está abierta, se queda en el tema que estaba viendo)
  }

  // ---------------------------------------------------------------- «Información extra» ordenada en 6 temas, con buscador y pestañas
  // En vez de 12 secciones seguidas, una portada con 4 temas grandes (ícono, nombre y qué trae). Al tocar uno se ven solo
  // sus 2 a 4 secciones y «‹ Temas» vuelve. Navegar por íconos con pocos niveles es lo que mejor funciona con poco texto
  // en el celular; el carrusel queda para elegir entre opciones parecidas (los juegos), no para consultar.
  // lo técnico (tabla de satélites, ET0, Ky…) se muestra en la Vista técnica → Método. Aquí sigue guardado sin mostrarse
  // porque el chat sin internet responde con estos textos
  // cada tema: [clave, ícono, [[sección, nombre de su pestaña], …]]. Con una sola sección, sin pestañas
  const TEMAS = [
    ["clima", "🌦️", [['[data-k="leCifras"]', "ieTab_cifras"], ["#tendencias", "ieTab_tend"], ["#leClima", "ieTab_clima"], ["#leerSats", "ieTab_sats"]]],
    ["rot", "🔄", [["#leRotar", "ieTab_que"], ['[data-k="leCult"]', "ieTab_cult"]]],
    ["luna", "🌙", [['[data-k="leLuna"]', ""]]],
    ["confiar", "🤔", [['[data-k="leInc"]', "ieTab_inc"], ['[data-k="leJuicio"]', "ieTab_juicio"]]],
    ["palabras", "📖", [['[data-k="leTer"]', ""]]],
    ["fuentes", "📚", [["#fuentes", "ieTab_como"], ["#leMetodo", "ieTab_metodo"], ['[data-k="leRefClima"]', "ieTab_rClima"], ['[data-k="leRefRot"]', "ieTab_rRot"], ['[data-k="leRefLeer"]', "ieTab_rNum"]]],
  ];
  let temaAbierto = null, tabAbierta = 0, ieListo = false;
  function guardarSecciones() { // todas las secciones al depósito; las recién dibujadas por renderLeer reemplazan a las viejas
    const guarda = $("#ieGuarda"), body = $("#leerBody");
    if (!guarda) return;
    if (body) $$("details[data-k]", body).forEach((d) => { const v = $(`[data-k="${d.dataset.k}"]`, guarda); if (v) v.remove(); guarda.appendChild(d); });
    TEMAS.forEach(([, , sels]) => sels.forEach(([s]) => { const el = $("#leer " + s); if (el && el.parentElement !== guarda) guarda.appendChild(el); }));
    $$(".ie-solo", guarda).forEach((d) => d.classList.remove("ie-solo"));
  }
  const secDe = (s) => { const el = $("#ieGuarda " + s); return el && (el.matches("details") || $(":scope > details", el)) ? el : null; };
  // el buscador de la portada: busca en todo lo que hay en las secciones, sin importar las tildes
  const sinTilde = (t) => Array.from(t, (c) => c.normalize("NFD")[0].toLowerCase());
  function iePinta() {
    const q = sinTilde($("#ieQ").value.trim()).join(""), res = $("#ieRes"), nav = $("#ieTemas");
    res.hidden = q.length < 2; nav.hidden = !res.hidden;
    if (res.hidden) { res.innerHTML = ""; return; }
    const hallados = [];
    TEMAS.forEach(([k, ic, sels]) => sels.forEach(([s, tab], i) => {
      const el = secDe(s);
      if (!el) return;
      const texto = Array.from(el.textContent.replace(/\s+/g, " ").trim()), n = sinTilde(texto.join("")).join(""), p = n.indexOf(q);
      if (p < 0) return;
      hallados.push({ k, i, ic, nombre: tr("ieG_" + k) + (tab ? ` · ${tr(tab)}` : ""), trozo: `…${texto.slice(Math.max(0, p - 30), p + q.length + 50).join("").replace(/([\p{Ll}.!?:])(?=\p{Lu})/gu, "$1 ")}…` }); // listas y términos llegan pegados
    }));
    res.innerHTML = hallados.length ? hallados.map((h, j) => `<li><button type="button" data-j="${j}"><span aria-hidden="true">${h.ic}</span> <b>${esc(h.nombre)}</b><small>${esc(h.trozo)}</small></button></li>`).join("") : `<li class="pk-nada">${tr("ieNada")}</li>`;
    $$("button", res).forEach((b) => (b.onclick = () => { const h = hallados[+b.dataset.j]; $("#ieQ").value = ""; temasExtra(h.k, h.i); $("#leerDlg").scrollTop = 0; }));
  }
  function ieEventos() { // una sola vez: las secciones se vuelven a dibujar, la caja que las contiene no
    if (ieListo) return;
    ieListo = true;
    const leer = $("#leer");
    $("#ieQ").addEventListener("input", iePinta);
    leer.addEventListener("click", (e) => {
      const l = e.target.closest("[data-luna]");
      if (l) {
        const paso = +l.dataset.luna, base = lunaDia || new Date();
        lunaDia = paso ? new Date(base.getFullYear(), base.getMonth(), base.getDate() + paso, 12) : null;
        return lunaPinta();
      }
      if (e.target.closest("[data-ir=lab]")) { // al formulario del análisis de suelo, en el paso 1
        $("#leerDlg").close();
        showStep(0, { push: false, focus: false });
        PESTANAS.activar("parcela", 0);
        const d = $("#sueloLab");
        if (d) { d.open = true; d.scrollIntoView({ block: "center" }); }
      }
    });
    leer.addEventListener("input", (e) => {
      const t = e.target;
      if (t.id === "lunaFecha" && t.value) { const [y, m, d] = t.value.split("-").map(Number); lunaDia = new Date(y, m - 1, d, 12); const h = $("#lunaHoy"); if (h) h.innerHTML = lunaHoy(); }
      if (t.id === "leConfR") $("#leConfV").innerHTML = confHtml(+t.value);
      if (t.matches(".le-ter-q")) {
        const caja = t.closest("div"), q = sinTilde(t.value.trim()).join("");
        let hay = 0;
        $$(".le-dl dt", caja).forEach((dt) => { const dd = dt.nextElementSibling, ok = sinTilde(dt.textContent + " " + dd.textContent).join("").includes(q); dt.hidden = dd.hidden = !ok; if (ok) hay++; });
        $(".le-ter-no", caja).hidden = hay > 0;
      }
    });
  }
  function temasExtra(tema = temaAbierto, sec) {
    const nav = $("#ieTemas"), pane = $("#iePane"), secs = $("#ieSecs");
    if (!nav || !pane) return;
    ieEventos();
    const mb = $("#leMetodoBody");
    if (mb && mb.dataset.l !== LANG) { // el método: cómo calcula Muyuy, sus datos de la NASA y el glosario técnico
      mb.dataset.l = LANG; $("#leMetodoT").textContent = LT("tabMetodo").replace(/^\S+\s/, "");
      mb.innerHTML = `<div class="como">${LT("comoTxt")}</div><h4>${LT("datT")}</h4><div class="table-wrap"><table class="cmp dat">${LT("datTabla")}</table></div>
        <details class="refs-box"><summary>${LT("datSvtT")}</summary><div>${LT("datSvt")}</div></details>
        <details class="refs-box"><summary>${LT("datArmT")}</summary><div>${LT("datArm")}</div></details>
        <details class="refs-box"><summary>${LT("gloT")}</summary><dl class="glosario">${LT("glos")}</dl></details>
        <details class="refs-box"><summary>${LT("refsTit")}</summary><div>${LT("refsTec")}</div></details>`;
    }
    guardarSecciones();
    const i0 = sec != null ? sec : tema === temaAbierto ? tabAbierta : 0;
    temaAbierto = tema;
    nav.innerHTML = TEMAS.map(([k, ic, sels]) => `<button type="button" class="ie-tema" data-t="${k}"><span class="ie-i" aria-hidden="true">${ic}</span>
      <b>${tr("ieG_" + k)}</b><small>${tr("ieD_" + k)}</small><span class="ie-n">${sels.length > 1 ? tr("ieN", { n: sels.length }) : tr("ieAbrir")} →</span></button>`).join("");
    $$(".ie-tema", nav).forEach((b) => (b.onclick = () => { temasExtra(b.dataset.t, 0); $("#leerDlg").scrollTop = 0; }));
    $("#ieVolver").onclick = () => { temasExtra(null); $("#leerDlg").scrollTop = 0; };
    const t = TEMAS.find(([k]) => k === tema);
    nav.hidden = !!t; pane.hidden = !t;
    $("#leer > .hint").hidden = !!t;
    $("#ieBus").hidden = !!t;
    $("#ieQ").placeholder = tr("ieBusca");
    if (!t) { secs.replaceChildren(); iePinta(); return; }
    $("#ieTit").textContent = `${t[1]} ${tr("ieG_" + t[0])}`;
    const lista = t[2].map(([s, k]) => ({ el: secDe(s), k })).filter((x) => x.el), i = Math.min(i0, Math.max(lista.length - 1, 0)), tabs = $("#ieTabs"), sig = $("#ieSig");
    tabAbierta = i;
    tabs.hidden = lista.length < 2;
    tabs.innerHTML = lista.map((x, j) => `<button type="button" role="tab" class="ie-tab" aria-selected="${j === i}" data-j="${j}">${tr(x.k)}</button>`).join("");
    $$(".ie-tab", tabs).forEach((b) => (b.onclick = () => { temasExtra(tema, +b.dataset.j); $("#leerDlg").scrollTop = 0; }));
    if (!lista.length) { secs.replaceChildren(); sig.hidden = true; return; }
    const el = lista[i].el, d = el.matches("details") ? el : $(":scope > details", el);
    d.open = true; d.classList.add("ie-solo");
    secs.replaceChildren(el);
    const prox = lista[i + 1];
    sig.hidden = false;
    sig.textContent = prox ? tr("ieSig", { s: tr(prox.k) }) : tr("ieVolver");
    sig.onclick = () => { temasExtra(prox ? tema : null, prox ? i + 1 : undefined); $("#leerDlg").scrollTop = 0; };
  }

  // ---------------------------------------------------------------- entradas desde app.js
  function alSitio() { cargarRegion(); climaCache = { id: null, c: null }; renderTendencias(); renderRestric(); renderLeer(); if (typeof ANALISIS !== "undefined") ANALISIS.pintarCampo(); }
  // cada vez que cambia el orden de las rotaciones (prioridades, restricciones, sitio o idioma)
  function alOrden() {
    if (!D) return;
    const est = estrategias();
    // en pedazos: primero el comparador y después lo demás, para que el teléfono no se trabe
    renderResumen(est);
    renderCriterio(est);
    if (typeof renderEnso === "function") renderEnso(); // nombra la opción 1, que cambia con las prioridades
    renderEstrategias(est);
    const luego = window.requestIdleCallback || ((f) => setTimeout(f, 30));
    const turno = ++ordenTurno;
    luego(() => { if (turno !== ordenTurno) return; if (typeof CRITERIO !== "undefined") CRITERIO.renderPatrones();
      if (typeof ANALISIS !== "undefined") { window.CAMPO_LISTO = true; ANALISIS.pintarRangos(est); ANALISIS.pintarSI(); } // rangos y patrones con SI, con el teléfono libre
      luego(() => { if (turno !== ordenTurno) return; renderCalendario(); luego(() => { if (turno === ordenTurno) renderSimulador(); }); }); });
  }
  let ordenTurno = 0;
  function alIdioma() { renderTendencias(); renderRestric(); renderLeer(); if (typeof ANALISIS !== "undefined") ANALISIS.pintarCampo(); alOrden(); }
  return { datosCard, lunaSvg, noRegion, depNombre, temasExtra, conservarBase, filtrar, extra, pesoIngreso, limitaResumen, preguntasLimita, alSitio, alOrden, alIdioma, rasgos, estrategias, theilSen, mannKendall };
})();

// borrador en quechua para revisar con una persona hablante: «Qué hacer» del paso 1 y lo nuevo de «Lo más importante»
Object.assign(I18N.qu, {
  hz_seco: "👉 Imatataq ruranayki: chakrayki aswan ch'akiyachkan. 4 kaq ruraypi «{s}» llamiy, chay watakunapipas aguantaq muyuyta akllay.",
  hz_ultSeca: "👉 Imatataq ruranayki: qhipa tarpuyqa ch'akim karqan. 4 kaq ruraypi «{s}» llamiy, chay watakunapipas aguantaq muyuyta akllay.",
  hz_calor: "👉 Imatataq ruranayki: chakrayki aswan q'uñiyachkan. 4 kaq ruraypi «{f}» llamiy, aswan q'uñipipas aguantaq muyuyta akllay.",
  hz_helada: "👉 Imatataq ruranayki: ñawpaqmanta aswan qasa kan. 4 kaq ruraypi aswan pisita pantaq muyuyta akllay.",
  hz_igual: "👉 Pachaykiqa mana sut'ita tikrakunchu: 45 watakuna kikinmi muyuykunata tupachinapaq (4 kaq rurayta qhaway).",
  hz_ir: "4 kaq rurayman →", resPierde: "Imatataq chinkachinki: {t}",
});
