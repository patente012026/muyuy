// Muyuy · lo que pasa en la chacra durante la campaña (integra lo mejor de Muyu Chacra y Agroclima 360).
// Paso 1 · «Cómo está su chacra ahora»: semáforo de siembra con los últimos días de NASA Power (lluvia, humedad del suelo
//   y noches frías) frente a la climatología de Power, lluvia de la campaña mes a mes y verdor Modis del píxel de 250 m.
//   Usa las mismas correcciones de la chacra que el resto de Muyuy (lluvia ×precip_factor, Tmin + delta_t + tmin_offset).
//   Los días que NASA Power publica con lluvias imposibles (dato provisional) se marcan y no se usan para decidir.
// Paso 5 · «Pruébelo en un pedazo de su chacra»: protocolo de comparación A/B entre lo de hoy y la rotación armada.
// Paso 6 · Cuaderno de campo con mediciones, CSV, informe para imprimir y «Borrar mis datos».
// Todo se guarda solo en este teléfono. Se carga antes de app.js y usa sus funciones al ejecutarse.
"use strict";

Object.assign(I18N.es, {
  ahT: "📡 Cómo está su chacra ahora", ahCargando: "Consultando a la NASA los últimos días de su chacra…",
  ahSinRed: "Sin internet no se pueden ver los últimos días. Lo de arriba (45 años de clima) sí funciona sin conexión.",
  ahError: "La NASA no respondió ({e}).", ahReintentar: "🔄 Reintentar", ahActualizar: "🔄 Actualizar", ahGuardado: "datos guardados el {f}",
  ahSemK: "¿Ya puedo sembrar en secano?",
  semSi: "Puede sembrar", semSiX: "Llovió lo suficiente en 10 días y el suelo guarda humedad.",
  semPrepare: "Prepare el terreno", semPrepareX: "Ya llueve, pero el suelo todavía no guarda humedad. Espere 1 o 2 lluvias más.",
  semCasi: "Casi listo", semCasiX: "El suelo tiene humedad, pero llovió poco en los últimos 10 días. Espere la siguiente lluvia.",
  semNo: "Todavía no", semNoX: "Llovió poco y el suelo está seco. Sembrar ahora arriesga la semilla.",
  semSeca: "No es época de siembra en secano", semSecaX: "En estos días casi nunca llueve en su zona. Use este tiempo para planear la campaña (pasos 2 a 5).",
  semSecaRiego: "Solo con riego", semSecaRiegoX: "En estos días casi nunca llueve en su zona; con su riego puede sembrar, en secano espere las lluvias.",
  semSueloDud: "Mire su tierra antes de sembrar", semSueloDudX: "El suelo tiene humedad, pero la lluvia de estos días todavía no está confirmada. Haga la prueba del puño: si la tierra húmeda se queda junta, puede sembrar.",
  semNoDud: "Todavía no", semNoDudX: "El suelo está seco y la lluvia de estos días todavía no está confirmada.",
  semHelada: " Ojo: hubo noches con helada; espere para los cultivos que no la aguantan.",
  verde: "verde", ambar: "amarilla", rojo: "roja", luz: "Luz {c}",
  tLluvia: "Lluvia en 10 días", tLluviaV: "{v} mm", tLluviaN: "lo normal: {n} mm", tLluviaDud: "dato dudoso",
  tSuelo: "Humedad del suelo", tSueloS: "superficie {a} % · raíces {b} %", tSueloS1: "superficie {a} %", tSueloX: "0 % seco · 100 % encharcado",
  tFrio: "Noche más fría (7 días)", tFrioS: "a la altura de su chacra · {f}",
  tVerdor: "Verdor de la chacra", tVerdorS: "Modis · {f}", tVerdorUp: "subió desde {v} ({f})", tVerdorDown: "bajó desde {v} ({f})",
  tVerdorX: "menos de 0,2: casi sin plantas · 0,2 a 0,5: algo verde · más de 0,5: muy verde", tVerdorNo: "sin imagen reciente", tVerdorErr: "Modis no respondió; pruebe «Actualizar»", tVerdorCarg: "buscando imágenes…",
  avHelada: "Helada en su zona", avHeladaR: "Riesgo de helada", avHeladaX: "La noche más fría de la última semana llegó a {t} °C a la altura de su chacra. Cubra los almácigos y no siembre lo que no aguanta helada hasta que pase.",
  avFuerte: "Lluvia fuerte", avFuerteX: "Un día de la última semana llovió {v} mm.", avFuerteLadera: " En ladera deje el rastrojo y haga surcos en curva para que el agua no lleve la tierra.", avFuertePlano: " Revise que el agua salga bien de su parcela.",
  avVeranillo: "Veranillo: pocas lluvias", avVeranilloX: "En 10 días llovió {v} mm cuando lo normal es {n} mm. Si ya sembró, aporque y cubra el suelo para guardar humedad.",
  avSeca: "Campaña con menos lluvia", avSecaX: "Desde setiembre llovió {v} mm frente a {n} mm de un año normal. Mire en el paso 4 las rotaciones para «años secos».",
  avLluviosa: "Campaña más lluviosa", avLluviosaX: "Desde setiembre llovió {v} mm frente a {n} mm de un año normal. Vigile la rancha en la papa y la erosión en ladera.",
  avDud: "Lluvia todavía sin confirmar", avDudX: "La lluvia de {d} días ({a} a {b}) todavía no está confirmada: la NASA la corrige unas semanas después (marcó hasta {m} mm en un día, que no es normal aquí). Mientras tanto Muyuy no la usa.",
  gLluviaT: "Lluvia de esta campaña, mes a mes", gObs: "Esta campaña", gNorm: "Normal ({r})", gParcial: "mes en curso", gDud: "dato dudoso",
  gTip: "Toque una barra para ver el número.", gTipV: "{m}: {o} · normal {n} mm", gTabla: "Ver la tabla", gMes: "Mes", gMm: "mm",
  ahSrc: "Datos de la NASA hasta el <b>{f}</b> (llegan con unos días de retraso), comparados con un año normal ({r}).",
  ahCompartir: "📲 Compartir aviso", ahEscuchar: "🔊 Escuchar", ahSenamhi: "🌦️ Pronóstico del Senamhi",
  ahCompTxt: "Muyuy · {lugar} ({f}): {t}. {x} Lluvia 10 días: {ll}. Humedad del suelo: {h}. Noche más fría: {tm}. Datos: NASA Power.",
  umbT: "⚙️ Ajustar el semáforo", umbX: "Son valores de partida. Ajústelos con lo que sabe de su chacra o con su técnico.",
  umbLl: "Lluvia mínima en 10 días (mm)", umbHu: "Humedad mínima del suelo (%)", umbHe: "Alerta de helada (°C)", umbOk: "Guardar", umb0: "↺ Volver a los valores iniciales",
  antesT: "✅ Antes de sembrar, revise", antesN: "{a} de {b} listos",
  antes1: "El semáforo está en verde, o la tierra está húmeda a un palmo de hondo",
  antes2: "Eligió su rotación (paso 4) y no repite la familia de la campaña pasada",
  antes3: "Tiene semilla sana y seleccionada", antes4: "Tiene el abono o guano listo",
  antes5: "Hizo surcos en curva o zanjas para que la lluvia no lleve la tierra (su chacra tiene pendiente)",
  antes6: "Revisó el aviso de heladas del Senamhi para esta semana", antes6m: "Revisó el pronóstico del servicio de meteorología de su país",
  prT: "🧪 Pruébelo en un pedazo de su chacra",
  prX: "Antes de cambiar toda la chacra, compare en dos pedazos. Así usted mismo ve si la rotación nueva le conviene.",
  prA: "Pedazo A · lo de siempre", prB: "Pedazo B · la prueba", prCamp: "en la campaña {n}",
  prCom: "Cómo", prComX: "Dos pedazos iguales, de unos 10 × 10 pasos, uno al lado del otro: misma pendiente, mismo abono y el mismo día de siembra.",
  prAnot: "Qué anotar", prAnotX: "En el cuaderno del paso 6: el día que siembra, las heladas o granizadas que vea y los kilos que cosecha en cada pedazo.",
  prDura: "Cuánto dura", prDuraX: "Una campaña: siembra en {s} y cosecha en {c}.",
  prLee: "Cómo leerla", prLeeX: "Un solo año no basta: compárelo con «funciona {n} de cada 10 años» del cuadro de arriba y repita la prueba otra campaña.",
  prIgual: "Su rotación empieza igual que la de hoy: la prueba empieza en la campaña {n}.",
  prGuardar: "💾 Guardar esta prueba", prGuardada: "✔ Prueba guardada: anote en el cuaderno del paso 6", prQuitar: "Quitar la prueba", prIr: "📒 Ir al cuaderno",
  cuT: "📒 Cuaderno de campo", cuIntro: "Anote lo que pasa en su chacra durante la campaña: siembra, abono, heladas, plagas, mediciones.",
  cuFecha: "Fecha", cuTipo: "¿Qué pasó?", cuPedazo: "Pedazo", cuValor: "Cantidad", cuUnidad: "Unidad", cuNota: "Nota", cuAnotar: "💾 Anotar",
  cuTodo: "Toda la chacra", cuSin: "Todavía no hay anotaciones.", cuBorrarUno: "Borrar", cuAnotado: "Anotado en el cuaderno",
  cu_siembra: "🌱 Siembra", cu_abono: "💩 Abono o guano", cu_riego: "💧 Riego", cu_labor: "⛏️ Deshierbo o aporque", cu_helada: "❄️ Helada",
  cu_granizo: "🌨️ Granizo", cu_lluvia: "🌧️ Lluvia fuerte", cu_plaga: "🐛 Plaga o enfermedad", cu_cosecha: "🧺 Cosecha", cu_medicion: "📏 Medición u otro",
  cuPrRes: "Prueba A/B · cosecha anotada: A {a} kg · B {b} kg", cuPrFalta: "Prueba A/B en curso: anote la cosecha de cada pedazo.",
  cuCsv: "⬇ Descargar cuaderno", cuInforme: "🖨️ Informe para imprimir o guardar en PDF", cuBorrar: "🗑️ Borrar mis datos",
  cuConfX: "¿Borrar del teléfono su cuaderno, su registro, la prueba, las entrevistas y la chacra guardada? No se puede deshacer: descargue antes los CSV si los necesita.",
  cuConfSi: "Sí, borrar todo", cuConfNo: "Cancelar", cuBorrado: "Se borraron sus datos de este teléfono",
  cuPriv: "El cuaderno se guarda solo en este teléfono o computadora; no se envía a ningún lado.",
  infT: "Informe de mi chacra · Muyuy", infAhora: "Cómo estaba la chacra", infRot: "Rotación elegida para explorar", infCu: "Cuaderno de campo", infReg: "Registro de campañas",
  qAcierto: "¿Se pareció a lo que dijo Muyuy?", acSi: "👍 Sí", acMas: "🤏 Más o menos", acNo: "👎 No",
  acResumen: "Muyuy acertó {a} de {n} veces en su chacra.", acMasN: "{m} más o menos.", acSemaforo: "semáforo al sembrar: {c}",
  acSugMas: "Sembró con semáforo verde y le fue mal más de una vez: suba la lluvia mínima a {v} mm.",
  acSugMenos: "Sembró con semáforo amarillo o rojo y le fue bien más de una vez: puede bajar la lluvia mínima a {v} mm.",
  acAplicar: "Aplicar", acAplicado: "Semáforo ajustado",
  t_ahora: "Paso 1. Los últimos días de su chacra: el semáforo dice si ya puede sembrar con la lluvia y la humedad que midió la NASA.",
  t_cuaderno: "Anote aquí lo que pasa durante la campaña. Se descarga en CSV o se imprime como informe.",
  ahEscala: "La NASA entregó la lluvia de los últimos días multiplicada por {f}; Muyuy la corrigió comparándola con días ya verificados.",
  ahEscalaNo: "La lluvia de los últimos días no se pudo verificar porque no llovió en los días de comparación: se muestra como dudosa y no se usa para decidir.",
  fuentesAhora: "<b>Cómo está su chacra ahora</b> usa los últimos días de <b>NASA Power</b> (lluvia, humedad del suelo y temperatura mínima) frente a su promedio 2001–2025, y el verdor de <b>NASA Modis</b> (ORNL DAAC). Si la NASA publica una lluvia que no se puede verificar, se marca como dudosa y no se usa.",
});
Object.assign(I18N.en, {
  ahT: "📡 How your farm is doing now", ahCargando: "Asking NASA for the last few days at your farm…",
  ahSinRed: "Without internet the last few days cannot be shown. The section above (45 years of climate) works offline.",
  ahError: "NASA did not answer ({e}).", ahReintentar: "🔄 Try again", ahActualizar: "🔄 Update", ahGuardado: "data saved on {f}",
  ahSemK: "Can I sow now without irrigation?",
  semSi: "You can sow", semSiX: "Enough rain fell in 10 days and the soil holds moisture.",
  semPrepare: "Prepare the field", semPrepareX: "It is raining, but the soil does not hold moisture yet. Wait for 1 or 2 more rains.",
  semCasi: "Almost ready", semCasiX: "The soil is moist, but little rain fell in the last 10 days. Wait for the next rain.",
  semNo: "Not yet", semNoX: "Little rain and dry soil. Sowing now risks the seed.",
  semSeca: "Not the rainfed sowing season", semSecaX: "It almost never rains here at this time of year. Use the time to plan the season (steps 2 to 5).",
  semSecaRiego: "Only with irrigation", semSecaRiegoX: "It almost never rains here at this time of year; with your irrigation you can sow, rainfed fields should wait.",
  semSueloDud: "Check your soil before sowing", semSueloDudX: "The soil is moist, but the rain NASA published for these days is not reliable. Squeeze a handful of soil: if it holds together, you can sow.",
  semNoDud: "Not yet", semNoDudX: "The soil is dry and the rain NASA published for these days is not reliable.",
  semHelada: " Careful: there were frost nights; wait for crops that cannot stand frost.",
  verde: "green", ambar: "yellow", rojo: "red", luz: "{c} light",
  tLluvia: "Rain in 10 days", tLluviaV: "{v} mm", tLluviaN: "normal: {n} mm", tLluviaDud: "doubtful data",
  tSuelo: "Soil moisture", tSueloS: "surface {a} % · roots {b} %", tSueloS1: "surface {a} %", tSueloX: "0 % dry · 100 % waterlogged",
  tFrio: "Coldest night (7 days)", tFrioS: "at your farm's altitude · {f}",
  tVerdor: "Plot greenness", tVerdorS: "Modis · {f}", tVerdorUp: "up from {v} ({f})", tVerdorDown: "down from {v} ({f})",
  tVerdorX: "below 0.2: almost bare · 0.2 to 0.5: somewhat green · above 0.5: very green", tVerdorNo: "no recent image", tVerdorErr: "Modis did not answer; try «Update»", tVerdorCarg: "looking for images…",
  avHelada: "Frost in your area", avHeladaR: "Frost risk", avHeladaX: "The coldest night of the last week reached {t} °C at your farm's altitude. Cover seedbeds and do not sow frost-sensitive crops until it passes.",
  avFuerte: "Heavy rain", avFuerteX: "One day last week it rained {v} mm.", avFuerteLadera: " On slopes, leave crop residue and plough along the contour so water does not wash the soil away.", avFuertePlano: " Check that water drains well from your plot.",
  avVeranillo: "Dry spell", avVeranilloX: "{v} mm fell in 10 days when {n} mm is normal. If you already sowed, hill up and cover the soil to keep moisture.",
  avSeca: "Drier season", avSecaX: "Since September {v} mm fell against {n} mm in a normal year. See the rotations for «dry years» in step 4.",
  avLluviosa: "Wetter season", avLluviosaX: "Since September {v} mm fell against {n} mm in a normal year. Watch for late blight on potato and erosion on slopes.",
  avDud: "Rain not confirmed yet", avDudX: "The rain for {d} days ({a} to {b}) is not confirmed yet: NASA corrects it a few weeks later (it showed up to {m} mm in one day, which is not normal here). Until then Muyuy does not use it.",
  gLluviaT: "Rain this season, month by month", gObs: "This season", gNorm: "Normal ({r})", gParcial: "current month", gDud: "doubtful data",
  gTip: "Tap a bar to see the number.", gTipV: "{m}: {o} · normal {n} mm", gTabla: "Show the table", gMes: "Month", gMm: "mm",
  ahSrc: "NASA data up to <b>{f}</b> (they arrive a few days late), compared with a normal year ({r}).",
  ahCompartir: "📲 Share alert", ahEscuchar: "🔊 Listen", ahSenamhi: "🌦️ Senamhi forecast",
  ahCompTxt: "Muyuy · {lugar} ({f}): {t}. {x} Rain 10 days: {ll}. Soil moisture: {h}. Coldest night: {tm}. Data: NASA Power.",
  umbT: "⚙️ Adjust the light", umbX: "These are starting values. Adjust them with what you know about your farm or with your technician.",
  umbLl: "Minimum rain in 10 days (mm)", umbHu: "Minimum soil moisture (%)", umbHe: "Frost alert (°C)", umbOk: "Save", umb0: "↺ Back to the starting values",
  antesT: "✅ Before sowing, check", antesN: "{a} of {b} done",
  antes1: "The light is green, or the soil is moist a hand deep",
  antes2: "You chose your rotation (step 4) and it does not repeat last season's family",
  antes3: "You have healthy, selected seed", antes4: "Manure or guano is ready",
  antes5: "You made contour furrows or ditches so rain does not wash the soil away (your farm is on a slope)",
  antes6: "You checked Senamhi's frost warning for this week", antes6m: "You checked your country's weather service forecast",
  prT: "🧪 Try it on a piece of your farm",
  prX: "Before changing the whole farm, compare on two pieces. That way you see for yourself whether the new rotation suits you.",
  prA: "Piece A · as usual", prB: "Piece B · the trial", prCamp: "in season {n}",
  prCom: "How", prComX: "Two equal pieces, about 10 × 10 steps, side by side: same slope, same manure and sown on the same day.",
  prAnot: "What to write down", prAnotX: "In the step 6 notebook: the sowing day, any frost or hail you see and the kilos you harvest on each piece.",
  prDura: "How long", prDuraX: "One season: sow in {s} and harvest in {c}.",
  prLee: "How to read it", prLeeX: "One year is not enough: compare it with «works in {n} of 10 years» above and repeat the trial another season.",
  prIgual: "Your rotation starts like today's: the trial starts in season {n}.",
  prGuardar: "💾 Save this trial", prGuardada: "✔ Trial saved: write it down in the step 6 notebook", prQuitar: "Remove the trial", prIr: "📒 Go to the notebook",
  cuT: "📒 Field notebook", cuIntro: "Write down what happens on your farm during the season: sowing, manure, frost, pests, measurements.",
  cuFecha: "Date", cuTipo: "What happened?", cuPedazo: "Piece", cuValor: "Amount", cuUnidad: "Unit", cuNota: "Note", cuAnotar: "💾 Save note",
  cuTodo: "Whole farm", cuSin: "No notes yet.", cuBorrarUno: "Delete", cuAnotado: "Saved in the notebook",
  cu_siembra: "🌱 Sowing", cu_abono: "💩 Manure or guano", cu_riego: "💧 Irrigation", cu_labor: "⛏️ Weeding or hilling", cu_helada: "❄️ Frost",
  cu_granizo: "🌨️ Hail", cu_lluvia: "🌧️ Heavy rain", cu_plaga: "🐛 Pest or disease", cu_cosecha: "🧺 Harvest", cu_medicion: "📏 Measurement or other",
  cuPrRes: "A/B trial · harvest written down: A {a} kg · B {b} kg", cuPrFalta: "A/B trial running: write down the harvest of each piece.",
  cuCsv: "⬇ Download notebook", cuInforme: "🖨️ Report to print or save as PDF", cuBorrar: "🗑️ Delete my data",
  cuConfX: "Delete your notebook, record, trial, interviews and saved farm from this phone? This cannot be undone: download the CSV files first if you need them.",
  cuConfSi: "Yes, delete everything", cuConfNo: "Cancel", cuBorrado: "Your data was deleted from this phone",
  cuPriv: "The notebook is stored only on this phone or computer; it is not sent anywhere.",
  infT: "My farm report · Muyuy", infAhora: "How the farm was doing", infRot: "Rotation chosen to explore", infCu: "Field notebook", infReg: "Season record",
  qAcierto: "Was it like what Muyuy said?", acSi: "👍 Yes", acMas: "🤏 More or less", acNo: "👎 No",
  acResumen: "Muyuy was right {a} of {n} times on your farm.", acMasN: "{m} more or less.", acSemaforo: "light when sowing: {c}",
  acSugMas: "You sowed with a green light and it went badly more than once: raise the minimum rain to {v} mm.",
  acSugMenos: "You sowed with an amber or red light and it went well more than once: you can lower the minimum rain to {v} mm.",
  acAplicar: "Apply", acAplicado: "Light adjusted",
  t_ahora: "Step 1. The last few days at your farm: the light tells you whether you can sow with the rain and moisture NASA measured.",
  t_cuaderno: "Write down here what happens during the season. Download it as CSV or print it as a report.",
  ahEscala: "NASA delivered the rain of the last days multiplied by {f}; Muyuy corrected it by comparing with days already verified.",
  ahEscalaNo: "Rain for the last days could not be verified because no rain fell on the comparison days: it is shown as doubtful and not used for decisions.",
  fuentesAhora: "<b>How your farm is doing now</b> uses the last days of <b>NASA Power</b> (rain, soil moisture and minimum temperature) against its 2001–2025 average, and <b>NASA Modis</b> greenness (ORNL DAAC). If NASA publishes rain that cannot be verified, it is flagged as doubtful and not used.",
});
Object.assign(I18N.qu, { ahT: "📡 Kunan chakraykiqa imaynan", ahSemK: "¿Kunanchu tarpuyman?", cuT: "📒 Chakra qillqana", prT: "🧪 Huk k'itillapi pruebay" });

const AH_KEY = "muyuy-ahora", UMB_KEY = "muyuy-umbrales", ANTES_KEY = "muyuy-antes", CUAD_KEY = "muyuy-cuaderno", PRUEBA_KEY = "muyuy-prueba";
const UMB0 = { lluvia10: 25, humedad: 55, helada: 2 }; // de partida (Muyu Chacra); se calibran con datos de campo
const MESES_POWER = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const lsGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const ymd = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
const deYmd = (s) => new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8));
const diasMes = (y, m) => new Date(y, m + 1, 0).getDate();
const inicioCamp = (d) => new Date(d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1, 8, 1); // lluvias: setiembre a agosto
const fCorta = (d) => d.toLocaleDateString(LOCALE[LANG], { day: "numeric", month: "short", year: "numeric" });
const r1 = (x) => Math.round(x * 10) / 10;
const dec = (x, n = 1) => x.toLocaleString(LOCALE[LANG], { minimumFractionDigits: n, maximumFractionDigits: n });

let AH = null;       // { punto, raw, verdor, at } de la última consulta
let AH_TOKEN = 0;    // una consulta vieja no pisa la del lugar nuevo

function ahoraPunto() {
  const s = SITES_LIST.find((x) => x.id === D.sitio) || {};
  const p = chosen && chosen.site === D.sitio && chosen.lat != null ? [chosen.lat, chosen.lon] : [s.lat, s.lon];
  return p[0] == null || p[1] == null ? null : p.map((v) => Math.round(v * 1e4) / 1e4);
}

async function ahJSON(url, ms = 45000, opt = {}) {
  const ctl = "AbortController" in window ? new AbortController() : null;
  const t = ctl && setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { ...opt, ...(ctl ? { signal: ctl.signal } : {}) });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

async function bajarClima([lat, lon]) {
  const hoy = new Date(), fin = new Date(hoy - 864e5), ini = new Date(Math.min(inicioCamp(hoy), hoy - 90 * 864e5));
  const q = `community=AG&latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&format=JSON`;
  const DAILY = "https://power.larc.nasa.gov/api/temporal/daily/point";
  const [d, c, ref] = await Promise.all([
    ahJSON(`${DAILY}?parameters=PRECTOTCORR,T2M_MIN,GWETTOP,GWETROOT&start=${ymd(ini)}&end=${ymd(fin)}&${q}`),
    ahJSON(`https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=PRECTOTCORR,T2M_MIN,GWETTOP&${q}`),
    // control: hasta hace 40 días ya es solo Merra-2 (Power lo publica con ~4 semanas de retraso)
    ahJSON(`${DAILY}?parameters=PRECTOTCORR&start=${ymd(ini)}&end=${ymd(new Date(hoy - 40 * 864e5))}&${q}`).catch(() => null),
  ]);
  if (!d.properties || !c.properties) throw new Error("NASA Power");
  // Verificado el 26 oct 2026: si la respuesta incluye la fuente GEOSIT (dato casi en tiempo real), NASA Power entrega TODA la
  // lluvia de esa respuesta multiplicada por 24 (17 ago: 4,63 mm pedido solo con Merra-2, 111,12 mm pedido hasta octubre).
  // El factor se mide en cada consulta con los días de control, que además se reemplazan por su valor de Merra-2; si no se
  // puede medir (no llovió en esos días), la lluvia posterior al control queda como dudosa.
  const P = d.properties.parameter, fuentes = (d.header && d.header.sources) || [];
  let escala = 1, lluviaDud = false, refFin = "";
  if (fuentes.includes("GEOSIT")) {
    const pr = ref && ref.properties && !((ref.header && ref.header.sources) || []).includes("GEOSIT") ? ref.properties.parameter.PRECTOTCORR : null;
    let a = 0, b = 0;
    if (pr) for (const k in pr) if (pr[k] >= 0 && P.PRECTOTCORR[k] >= 0) { a += P.PRECTOTCORR[k]; b += pr[k]; refFin = k > refFin ? k : refFin; }
    if (b >= 1) escala = Math.abs(a / b - 1) < 0.05 ? 1 : a / b;
    else lluviaDud = true;
    for (const k in P.PRECTOTCORR) if (P.PRECTOTCORR[k] >= 0) P.PRECTOTCORR[k] = pr && pr[k] >= 0 ? pr[k] : P.PRECTOTCORR[k] / escala;
  }
  // se guarda solo lo que se usa (unos pocos KB)
  return { d: { fill: d.header && d.header.fill_value, p: P, fuentes, escala: Math.round(escala * 10) / 10, lluviaDud, refFin },
           c: { range: (c.header && c.header.range) || "", p: c.properties.parameter } };
}

async function bajarVerdor([lat, lon]) {
  const fin = new Date(), ini = new Date(fin - 170 * 864e5);
  const ad = (d) => `A${d.getFullYear()}${String(Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5)).padStart(3, "0")}`;
  const j = await ahJSON(`https://modis.ornl.gov/rst/api/v1/MOD13Q1/subset?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&band=250m_16_days_NDVI&startDate=${ad(ini)}&endDate=${ad(fin)}&kmAboveBelow=0&kmLeftRight=0`,
    75000, { headers: { Accept: "application/json" } });
  const k = parseFloat(j.scale) || 1e-4;
  return (j.subset || []).map((s) => ({ f: s.calendar_date, v: s.data && typeof s.data[0] === "number" && s.data[0] > -2000 ? Math.round(s.data[0] * k * 100) / 100 : null }))
    .filter((x) => x.v != null);
}

// ---------------------------------------------------------------- análisis
function analizarAhora(raw) {
  const cl = D.contexto.clima || {}, pf = cl.precip_factor || 1, dt = (cl.delta_t || 0) + (D.tmin_offset ?? cl.tmin_offset ?? 0);
  const P = raw.d.p, C = raw.c.p, fill = raw.d.fill ?? -999;
  const ok = (v) => (typeof v === "number" && v > -98 && v !== fill ? v : null);
  const normDia = MESES_POWER.map((m) => ok(C.PRECTOTCORR && C.PRECTOTCORR[m]) ?? 0); // mm/día, climatología
  const rows = Object.keys(P.PRECTOTCORR || {}).filter((k) => /^\d{8}$/.test(k)).sort().map((k) => ({
    k, f: deYmd(k), p: ok(P.PRECTOTCORR[k]), t: ok(P.T2M_MIN && P.T2M_MIN[k]), h: ok(P.GWETTOP && P.GWETTOP[k]), r: ok(P.GWETROOT && P.GWETROOT[k]) }));
  while (rows.length && [rows.at(-1).p, rows.at(-1).t, rows.at(-1).h].every((v) => v == null)) rows.pop(); // días aún sin publicar
  if (!rows.length) throw new Error("NASA Power sin datos");
  // control de calidad: un día por encima de max(80 mm, 25 veces lo normal) o un mes por encima de max(150 mm, 5 veces su normal)
  const mes = {};
  rows.forEach((x) => { if (x.p == null) return; const k = x.f.getFullYear() * 12 + x.f.getMonth(); mes[k] = (mes[k] || 0) + x.p; });
  rows.forEach((x) => {
    if (x.p == null) return;
    const m = x.f.getMonth(), nd = normDia[m], k = x.f.getFullYear() * 12 + m;
    x.dud = (!!raw.d.lluviaDud && x.k > (raw.d.refFin || "")) || x.p > Math.max(80, 25 * nd) || mes[k] > Math.max(150, 5 * nd * diasMes(x.f.getFullYear(), m));
  });
  const L = rows.length - 1, last = rows[L].f;
  const ventana = (n, end = L) => {
    let obs = 0, norm = 0, dud = 0, max = 0;
    for (let i = end; i > end - n && i >= 0; i--) {
      const x = rows[i];
      norm += normDia[x.f.getMonth()] * pf;
      if (x.p == null) continue;
      if (x.dud) { dud++; continue; }
      obs += x.p * pf; max = Math.max(max, x.p * pf);
    }
    return { obs: r1(obs), norm: r1(norm), dud, max: r1(max) };
  };
  const r10 = ventana(10), r7 = ventana(7);
  const prom = (k, n) => { const v = []; for (let i = L; i >= 0 && v.length < n; i--) if (rows[i][k] != null) v.push(rows[i][k]); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  const suelo = prom("h", 5), raiz = prom("r", 5);
  let tmin = null, tminF = null;
  for (let i = L; i > L - 7 && i >= 0; i--) if (rows[i].t != null && (tmin == null || rows[i].t + dt < tmin)) { tmin = r1(rows[i].t + dt); tminF = rows[i].f; }
  // campaña: barras mensuales desde setiembre; la comparación con lo normal solo usa los días confiables
  const c0 = inicioCamp(last), meses = [];
  let sObs = 0, sNorm = 0;
  for (let y = c0.getFullYear(), m = 8; y * 12 + m <= last.getFullYear() * 12 + last.getMonth(); m === 11 ? (y++, m = 0) : m++) {
    const dm = rows.filter((x) => x.f.getFullYear() === y && x.f.getMonth() === m && x.p != null);
    const buenos = dm.filter((x) => !x.dud);
    const o = buenos.reduce((a, x) => a + x.p * pf, 0);
    sObs += o; sNorm += buenos.length * normDia[m] * pf;
    meses.push({ y, m, normal: r1(normDia[m] * diasMes(y, m) * pf), obs: dm.length ? r1(o) : null, dud: dm.length - buenos.length,
                 parcial: dm.length < diasMes(y, m) });
  }
  const ratio = sNorm >= 30 ? sObs / sNorm : null;
  const tipo = ratio == null ? "normal" : ratio < 0.7 ? "seco" : ratio > 1.3 ? "lluvioso" : "normal";
  const dudosos = rows.filter((x) => x.dud);
  return { last, r10, r7, suelo, raiz, tmin, tminF, meses, escala: raw.d.escala || 1, lluviaDud: !!raw.d.lluviaDud, sObs: Math.round(sObs), sNorm: Math.round(sNorm), tipo, pf, dt: r1(dt),
           rango: (raw.c.range.match(/\d{4}\D+\d{4}/g) || [""]).pop().replace(/\D+/, "–").replace(/[^\d–]/g, ""),
           dudosos: dudosos.length ? { n: dudosos.length, a: dudosos[0].f, b: dudosos.at(-1).f, max: Math.round(Math.max(...dudosos.map((x) => x.p * pf))) } : null };
}

function semaforo(a) {
  const U = { ...UMB0, ...lsGet(UMB_KEY, {}) };
  const riego = (D.perfil && D.perfil.riego_mm) > 0;
  const conf = a.r10.dud === 0;
  const imerg = !conf && AH && AH.imerg && AH.imerg.min >= U.lluvia10; // al menos esa lluvia según el satélite
  const lluviaOk = conf ? a.r10.obs >= U.lluvia10 : imerg ? true : null;
  const sueloOk = a.suelo != null && a.suelo * 100 >= U.humedad;
  let s;
  if (a.r10.norm < 5 && !lluviaOk) s = riego ? ["ambar", "semSecaRiego"] : ["rojo", "semSeca"];
  else if (lluviaOk == null) s = sueloOk ? ["ambar", "semSueloDud"] : ["rojo", "semNoDud"];
  else if (lluviaOk && sueloOk) s = ["verde", imerg ? "semImerg" : "semSi"];
  else if (lluviaOk) s = ["ambar", "semPrepare"];
  else if (sueloOk) s = ["ambar", "semCasi"];
  else s = ["rojo", "semNo"];
  const helada = a.tmin != null && a.tmin <= U.helada;
  const avisos = [];
  if (helada) avisos.push([a.tmin <= 0 ? "alto" : "medio", "❄️", a.tmin <= 0 ? "avHelada" : "avHeladaR", tr("avHeladaX", { t: dec(a.tmin) })]);
  if (conf && a.r7.max >= 25) avisos.push(["medio", "🌧️", "avFuerte", tr("avFuerteX", { v: Math.round(a.r7.max) }) + tr(D.contexto.pendiente > 8 ? "avFuerteLadera" : "avFuertePlano")]);
  if (conf && a.r10.norm >= 15 && a.r10.obs < 0.3 * a.r10.norm) avisos.push(["medio", "☀️", "avVeranillo", tr("avVeranilloX", { v: Math.round(a.r10.obs), n: Math.round(a.r10.norm) })]);
  if (a.tipo === "seco") avisos.push(["medio", "🏜️", "avSeca", tr("avSecaX", { v: num(a.sObs), n: num(a.sNorm) })]);
  if (a.tipo === "lluvioso") avisos.push(["medio", "🌊", "avLluviosa", tr("avLluviosaX", { v: num(a.sObs), n: num(a.sNorm) })]);
  if (a.dudosos && a.lluviaDud) avisos.push(["info", "⚠️", "avDud", tr("ahEscalaNo")]);
  else if (a.dudosos) avisos.push(["info", "⚠️", "avDud", tr("avDudX", { d: a.dudosos.n, a: fCorta(a.dudosos.a), b: fCorta(a.dudosos.b), m: num(a.dudosos.max) })]);
  const e = typeof ensoEsperado === "function" && ensoEsperado();
  if (e && e.fase !== "neutro") avisos.push(["medio", e.fase === "nino" ? "🌊" : "🌀", "avEnso", tr("avEnsoX", { p: e.pct, b: trimestre(e.hasta), fase: tr("fase_" + e.fase) }), { fase: tr("fase_" + e.fase) }]);
  const sm = AH && AH.smap;
  if (sm && sueloOk && sm.sup < 0.12) avisos.push(["medio", "🛰️", "avSmapSeco", tr("avSmapSecoX", { a: dec(sm.sup, 2) })]);
  if (sm && !sueloOk && sm.sup > 0.3) avisos.push(["info", "🛰️", "avSmapHumedo", tr("avSmapHumedoX", { a: dec(sm.sup, 2) })]);
  if (!conf && AH && AH.imerg) avisos.push(["info", "🛰️", "avImerg", tr("avImergX", { v: num(AH.imerg.min) })]);
  const orden = { alto: 0, medio: 1, info: 2 };
  avisos.sort((x, y) => orden[x[0]] - orden[y[0]]);
  return { nivel: s[0], clave: s[1], texto: tr(s[1] + "X", { v: AH && AH.imerg ? num(AH.imerg.min) : "" }) + (helada && s[0] === "verde" ? tr("semHelada") : ""), avisos, U };
}

// ---------------------------------------------------------------- dibujo
function graficoLluvia(a) {
  const ms = a.meses;
  if (!ms.length) return "";
  const W = 340, H = 170, ml = 34, mr = 6, mt = 10, mb = 26, iw = W - ml - mr, ih = H - mt - mb;
  const top = Math.max(10, ...ms.map((x) => Math.max(x.normal, x.obs || 0)));
  const paso = [5, 10, 20, 25, 50, 100, 200, 250, 500].find((p) => top / p <= 4) || 1000, ymax = Math.ceil(top / paso) * paso;
  const Y = (v) => mt + ih - (v / ymax) * ih, gw = iw / Math.max(ms.length, 4), bw = Math.min(22, (gw - 8) / 2);
  let s = `<svg class="ah-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(tr("gLluviaT"))}">`;
  s += `<defs><pattern id="ahRaya" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="var(--card)"/><line x1="0" y1="0" x2="0" y2="5" stroke="var(--ah-obs)" stroke-width="2"/></pattern></defs>`;
  for (let v = 0; v <= ymax; v += paso) s += `<line class="ah-grid" x1="${ml}" x2="${W - mr}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ah-ax" x="${ml - 4}" y="${Y(v) + 3}" text-anchor="end">${num(v)}</text>`;
  // barra con la punta redondeada (4 px) y apoyada en la base
  const barra = (x, h, cls) => h < 0.5 ? "" : h < 4 ? `<rect class="${cls}" x="${x}" y="${Y(0) - h}" width="${bw}" height="${h}"/>`
    : `<path class="${cls}" d="M${x},${Y(0)} v${-(h - 3)} q0,-3 3,-3 h${bw - 6} q3,0 3,3 v${h - 3} z"/>`;
  ms.forEach((x, i) => {
    const gx = ml + i * gw + (gw - 2 * bw - 2) / 2, hN = Y(0) - Y(x.normal), hO = x.obs == null ? 0 : Y(0) - Y(x.obs);
    const mesTxt = `${MES()[x.m]} ${x.y}`;
    const oTxt = x.obs == null ? "—" : `${num(x.obs)} mm${x.parcial ? ` (${tr("gParcial")})` : ""}${x.dud ? ` · ${x.dud} ${tr("gDud")}` : ""}`;
    const tip = tr("gTipV", { m: mesTxt, o: oTxt, n: num(x.normal) });
    s += `<g class="ah-bar" tabindex="0" data-tip="${esc(tip)}"><title>${esc(tip)}</title>`;
    s += `<rect class="ah-hit" x="${ml + i * gw}" y="${mt}" width="${gw}" height="${ih}"/>`;
    s += barra(gx, hN, "ah-n");
    s += barra(gx + bw + 2, hO, "ah-o" + (x.parcial ? " parcial" : "") + (x.dud ? " dud" : ""));
    if (x.dud) s += `<text class="ah-q" x="${gx + bw + 2 + bw / 2}" y="${Y(x.obs || 0) - 3}" text-anchor="middle">?</text>`;
    s += `<text class="ah-ax" x="${ml + i * gw + gw / 2}" y="${H - 10}" text-anchor="middle">${MES()[x.m]}</text></g>`;
  });
  s += `<line class="ah-base" x1="${ml}" x2="${W - mr}" y1="${Y(0)}" y2="${Y(0)}"/></svg>`;
  const tabla = `<details class="ah-tabla"><summary>${tr("gTabla")}</summary><table><thead><tr><th>${tr("gMes")}</th><th>${tr("gObs")} (${tr("gMm")})</th><th>${tr("gNorm", { r: a.rango })} (${tr("gMm")})</th></tr></thead><tbody>` +
    ms.map((x) => `<tr><td>${MES()[x.m]} ${x.y}</td><td>${x.obs == null ? "—" : num(x.obs)}${x.parcial ? " *" : ""}${x.dud ? ` (${x.dud} ${tr("gDud")})` : ""}</td><td>${num(x.normal)}</td></tr>`).join("") + "</tbody></table></details>";
  return `<figure class="ah-fig"><figcaption><b>${tr("gLluviaT")}</b>
    <span class="ah-leg"><span><i class="sw o"></i>${tr("gObs")}</span><span><i class="sw n"></i>${tr("gNorm", { r: a.rango })}</span><span><i class="sw p"></i>${tr("gParcial")}</span>${a.dudosos ? `<span><i class="sw d"></i>${tr("gDud")}</span>` : ""}</span></figcaption>
    ${s}<p class="ah-tip" aria-live="polite">${tr("gTip")}</p>${tabla}</figure>`;
}

function tileVerdor() {
  const v = AH && AH.verdor;
  if (v === undefined) return `<div class="ah-tile"><span class="ic">🌿</span><small>${tr("tVerdor")}</small><b>…</b><small>${tr("tVerdorCarg")}</small></div>`;
  if (!v || !v.length) return `<div class="ah-tile"><span class="ic">🌿</span><small>${tr("tVerdor")}</small><b>—</b><small>${tr(v === null ? "tVerdorErr" : "tVerdorNo")}</small></div>`;
  const u = v.at(-1), p = v.length > 1 ? v[0] : null, f = (s) => fCorta(new Date(s + "T12:00:00"));
  const W = 120, H = 30, lo = Math.min(...v.map((x) => x.v)), hi = Math.max(...v.map((x) => x.v)), sp = hi - lo || 0.1;
  const pts = v.map((x, i) => `${(i / Math.max(1, v.length - 1)) * (W - 8) + 4},${H - 4 - ((x.v - lo) / sp) * (H - 8)}`);
  const linea = `<svg class="ah-spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><polyline points="${pts.join(" ")}"/><circle cx="${pts.at(-1).split(",")[0]}" cy="${pts.at(-1).split(",")[1]}" r="4"/></svg>`;
  const cambio = p && Math.abs(u.v - p.v) >= 0.03 ? tr(u.v > p.v ? "tVerdorUp" : "tVerdorDown", { v: dec(p.v, 2), f: f(p.f) }) : "";
  return `<div class="ah-tile"><span class="ic">🌿</span><small>${tr("tVerdor")}</small><b>${dec(u.v, 2)}</b>${linea}<small>${tr("tVerdorS", { f: f(u.f) })}${cambio ? " · " + cambio : ""}</small><small class="ah-esc">${tr("tVerdorX")}</small></div>`;
}

const avisoHtml = ([n, ic, t, x, p5]) => `<li class="ah-av ${n}"><span aria-hidden="true">${ic}</span><div><b>${tr(t, p5 || {})}</b><p>${x}</p></div></li>`;
function renderAhora() {
  const box = $("#ahoraBody");
  if (!box || !D) return;
  const top = $("#ahoraTop");
  if (top) top.hidden = true; // solo con datos recientes
  if (!AH || AH.estado === "cargando") { box.innerHTML = `<p class="ah-msg"><span class="ah-spin" aria-hidden="true"></span> ${tr("ahCargando")}</p>`; return; }
  if (AH.estado === "error") {
    box.innerHTML = `<p class="ah-msg">${navigator.onLine === false ? tr("ahSinRed") : tr("ahError", { e: esc(AH.error) })}</p><button type="button" class="ah-btn" data-ah="recargar">${tr("ahReintentar")}</button>`;
    $("[data-ah=recargar]", box).onclick = () => cargarAhora(true);
    return;
  }
  let a;
  try { a = analizarAhora(AH.raw); } catch (e) { AH = { estado: "error", error: e.message }; return renderAhora(); }
  const s = semaforo(a);
  AH.resumen = { a, s };
  const abiertos = $$("details[id]", box).filter((d) => d.open).map((d) => d.id);
  const pct = (x) => (x == null ? "—" : Math.round(x * 100));
  const tiles = [
    `<div class="ah-tile"><span class="ic">🌧️</span><small>${tr("tLluvia")}</small><b>${a.r10.dud ? tr("tLluviaDud") : tr("tLluviaV", { v: num(a.r10.obs) })}</b><small>${tr("tLluviaN", { n: num(a.r10.norm) })}</small></div>`,
    `<div class="ah-tile"><span class="ic">💧</span><small>${tr("tSuelo")}</small><b>${pct(a.suelo)} %</b><span class="ah-meter" aria-hidden="true"><i style="width:${pct(a.suelo) || 0}%"></i><u style="left:${s.U.humedad}%"></u></span><small>${a.raiz != null ? tr("tSueloS", { a: pct(a.suelo), b: pct(a.raiz) }) : tr("tSueloS1", { a: pct(a.suelo) })}</small><small class="ah-esc">${tr("tSueloX")}</small></div>`,
    `<div class="ah-tile${a.tmin != null && a.tmin <= s.U.helada ? " frio" : ""}"><span class="ic">❄️</span><small>${tr("tFrio")}</small><b>${a.tmin == null ? "—" : dec(a.tmin) + " °C"}</b><small>${a.tminF ? tr("tFrioS", { f: fCorta(a.tminF) }) : ""}</small></div>`,
    `<div id="ahVerdor">${tileVerdor()}</div>`,
    `<div id="ahSmap">${tileSmap()}</div>`,
  ];
  const luz = { verde: "🟢", ambar: "🟡", rojo: "🔴" }[s.nivel];
  const peru = !D.fuera_peru;
  box.innerHTML = `
    <div class="ah-sem ah-${s.nivel}" role="status">
      <span class="ah-luz" aria-hidden="true"><i></i><i></i><i></i></span>
      <div class="ah-sem-t"><p class="ah-k">${tr("ahSemK")} <span class="sr">${tr("luz", { c: tr(s.nivel) })}</span></p>
        <p class="ah-t"><span aria-hidden="true">${luz}</span> ${tr(s.clave)}</p><p class="ah-x">${s.texto}</p></div>
    </div>
    ${s.avisos.length ? `<ul class="ah-avisos">${s.avisos.slice(0, 1).map(avisoHtml).join("")}</ul>` : ""}
    <details class="ah-more ah-datos" id="ahDatos"><summary>${tr("ahDatos")}${s.avisos.length > 1 ? ` · ${tr(s.avisos.length === 2 ? "ahMasAv1" : "ahMasAv", { n: s.avisos.length - 1 })}` : ""}</summary>
    <div class="ah-tiles">${tiles.join("")}</div>
    ${s.avisos.length > 1 ? `<ul class="ah-avisos">${s.avisos.slice(1).map(([n, ic, t, x, p5]) => `<li class="ah-av ${n}"><span aria-hidden="true">${ic}</span><div><b>${tr(t, p5 || {})}</b><p>${x}</p></div></li>`).join("")}</ul>` : ""}
    ${graficoLluvia(a)}
    <p class="ah-src">${tr("ahSrc", { r: a.rango, f: fCorta(a.last), pf: dec(a.pf, 2), dt: `${a.dt > 0 ? "+" : ""}${dec(a.dt)}` })}${a.escala !== 1 ? " " + tr("ahEscala", { f: dec(a.escala) }) : ""}${AH.viejo ? ` · <b>${tr("ahGuardado", { f: fCorta(new Date(AH.at)) })}</b>` : ""}</p>
    <div class="ah-acc">
      <button type="button" class="ah-btn" data-ah="escuchar">${tr("ahEscuchar")}</button>
      <button type="button" class="ah-btn" data-ah="compartir">${tr("ahCompartir")}</button>
      ${peru ? `<a class="ah-btn" href="https://www.senamhi.gob.pe/?p=pronostico-meteorologico" target="_blank" rel="noopener">${tr("ahSenamhi")}</a>` : ""}
      <button type="button" class="ah-btn" data-ah="recargar">${tr("ahActualizar")}</button>
    </div>
    <details class="ah-more"><summary>${tr("umbT")}</summary><p class="hint">${tr("umbX")}</p>
      <form class="ah-umb" id="ahUmb">
        <label>${tr("umbLl")} <input type="number" name="lluvia10" min="5" max="100" step="1" value="${s.U.lluvia10}"></label>
        <label>${tr("umbHu")} <input type="number" name="humedad" min="20" max="90" step="1" value="${s.U.humedad}"></label>
        <label${D.andina ? "" : " hidden"}>${tr("umbHe")} <input type="number" name="helada" min="-5" max="8" step="0.5" value="${s.U.helada}"></label>
        <div><button type="submit">${tr("umbOk")}</button> <button type="button" data-ah="umb0">${tr("umb0")}</button></div>
      </form></details>
    <details class="ah-more" id="ahHls"><summary>${tr("hlsT")}</summary><div class="ah-hls">${AH.hls ? `<img class="ah-hls-img" src="${AH.hls.src}" alt="" width="256" height="256"><p class="ah-hls-s">${AH.hls.cap}</p>` : ""}</div></details>
    <details class="ah-more" id="ahAntes"><summary>${tr("antesT")} <span class="ah-cnt"></span></summary><ul class="ah-check"></ul></details>
    </details>`;
  if (top && !AH.viejo) {
    top.className = `ah-top ah-${s.nivel}`;
    top.innerHTML = `<small>${tr("ahSemK")}</small><b><span aria-hidden="true">${luz}</span> ${tr(s.clave)}</b><span>${s.texto}</span><u>${tr("ahTopMas")}</u>`;
    top.onclick = () => irA("#ahora");
    top.hidden = false;
  }
  renderAntes();
  const hls = $("#ahHls");
  hls.ontoggle = () => { if (hls.open && !AH.hls) buscarHls($(".ah-hls", hls), ahoraPunto()); };
  abiertos.forEach((id) => { const d = document.getElementById(id); if (d) d.open = true; });
  const tip = $(".ah-tip", box);
  $$(".ah-bar", box).forEach((g) => { const f = () => { tip.textContent = g.dataset.tip; $$(".ah-bar", box).forEach((x) => x.classList.toggle("on", x === g)); }; g.onpointerenter = f; g.onfocus = f; g.onclick = f; });
  $("[data-ah=recargar]", box).onclick = () => cargarAhora(true);
  $("[data-ah=escuchar]", box).onclick = (e) => speakText(`${tr(s.clave)}. ${s.texto} ${s.avisos.map((x) => tr(x[2]) + ". " + x[3]).join(" ")}`, e.currentTarget);
  $("[data-ah=compartir]", box).onclick = () => window.open("https://wa.me/?text=" + encodeURIComponent(textoAviso()), "_blank", "noopener");
  $("#ahUmb").onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target), u = {};
    for (const k of Object.keys(UMB0)) { const v = parseFloat(f.get(k)); if (Number.isFinite(v)) u[k] = v; }
    lsSet(UMB_KEY, u); renderAhora(); $("#ahoraBody details.ah-more").open = true;
  };
  $("[data-ah=umb0]", box).onclick = () => { try { localStorage.removeItem(UMB_KEY); } catch {} renderAhora(); };
}

function textoAviso() {
  if (!AH || !AH.resumen) return "";
  const { a, s } = AH.resumen;
  return tr("ahCompTxt", { lugar: chosen && chosen.site === D.sitio ? chosen.nombre : D.contexto.lugar, f: fCorta(a.last), t: tr(s.clave), x: s.texto,
    ll: a.r10.dud ? tr("tLluviaDud") : `${num(a.r10.obs)} mm (${tr("tLluviaN", { n: num(a.r10.norm) })})`,
    h: a.suelo == null ? "—" : Math.round(a.suelo * 100) + " %", tm: a.tmin == null ? "—" : dec(a.tmin) + " °C" });
}

function renderAntes() {
  const det = $("#ahAntes");
  if (!det) return;
  const items = ["antes1", "antes2", "antes3", "antes4", ...(D.contexto.pendiente > 8 ? ["antes5"] : []), D.fuera_peru ? "antes6m" : D.andina ? "antes6" : null].filter(Boolean); // el aviso de heladas: solo en la sierra
  const k = `${D.sitio}:${inicioCamp(new Date()).getFullYear()}`, todo = lsGet(ANTES_KEY, {}), hechos = todo[k] || {};
  $(".ah-check", det).innerHTML = items.map((it) => `<li><label><input type="checkbox" data-it="${it}"${hechos[it] ? " checked" : ""}> <span>${tr(it)}</span></label></li>`).join("");
  const cuenta = () => ($(".ah-cnt", det).textContent = "· " + tr("antesN", { a: items.filter((it) => hechos[it]).length, b: items.length }));
  cuenta();
  $$("input", det).forEach((i) => (i.onchange = () => { hechos[i.dataset.it] = i.checked; todo[k] = hechos; lsSet(ANTES_KEY, todo); cuenta(); }));
}

async function cargarAhora(forzar = false) {
  if (!D || !$("#ahoraBody")) return;
  const punto = ahoraPunto();
  if (!punto) { $("#ahora").hidden = true; return; }
  $("#ahora").hidden = false;
  const clave = punto.join(","), cache = lsGet(AH_KEY, null), token = ++AH_TOKEN;
  if (!forzar && cache && cache.clave === clave && Date.now() - cache.at < 6 * 3600e3) {
    AH = { estado: "ok", raw: cache.raw, verdor: cache.verdor, smap: cache.smap, imerg: cache.imerg, at: cache.at };
    return renderAhora();
  }
  AH = { estado: "cargando" };
  renderAhora();
  try {
    const raw = await bajarClima(punto);
    if (token !== AH_TOKEN) return;
    AH = { estado: "ok", raw, verdor: undefined, at: Date.now() };
    renderAhora();
  } catch (e) {
    if (token !== AH_TOKEN) return;
    AH = cache && cache.clave === clave ? { estado: "ok", raw: cache.raw, verdor: cache.verdor, at: cache.at, viejo: true } : { estado: "error", error: e.name === "AbortError" ? "tiempo de espera" : e.message };
    return renderAhora();
  }
  const viejo = cache && cache.clave === clave ? cache : {};
  let dud = false;
  try { dud = analizarAhora(AH.raw).r10.dud > 0; } catch {}
  const [verdor, smap, imerg] = await Promise.all([
    bajarVerdor(punto).catch(() => viejo.verdor || null),
    bajarSmap(punto).catch(() => viejo.smap || null),
    dud ? bajarImergMin(punto, analizarAhora(AH.raw).last).catch(() => null) : Promise.resolve(null),
  ]);
  if (token !== AH_TOKEN) return;
  Object.assign(AH, { verdor, smap, imerg });
  lsSet(AH_KEY, { clave, at: AH.at, raw: AH.raw, verdor, smap, imerg });
  renderAhora(); // SMAP e Imerg pueden cambiar el semáforo y los avisos
}

function tileSmap() {
  const m = AH && AH.smap;
  if (m === undefined) return `<div class="ah-tile"><span class="ic">🛰️</span><small>${tr("tSmap")}</small><b>…</b><small>${tr("tSmapCarg")}</small></div>`;
  if (!m) return `<div class="ah-tile"><span class="ic">🛰️</span><small>${tr("tSmap")}</small><b>—</b><small>${tr("tSmapNo")}</small></div>`;
  return `<div class="ah-tile"><span class="ic">🛰️</span><small>${tr("tSmap")}</small><b>${tr(m.sup < 0.15 ? "smSeco" : m.sup > 0.3 ? "smMuy" : "smBien")}</b><span class="ah-meter" aria-hidden="true"><i style="width:${Math.min(100, m.sup / 0.5 * 100)}%"></i><u style="left:30%"></u><u style="left:60%"></u></span>` +
    `<small>${tr("tSmapS", { a: dec(m.sup, 2), b: m.raiz != null ? dec(m.raiz, 2) : "—", f: fCorta(new Date(m.fecha + "T12:00:00")) })}</small><small class="ah-esc">${tr("tSmapX")}</small></div>`;
}

// ---------------------------------------------------------------- paso 5: prueba A/B (protocolo de campo)
function renderPrueba() {
  const box = $("#prueba");
  if (!box) return;
  const act = D.perfil.rotacion_actual;
  if (custom.some((x) => !x) || !act) { box.innerHTML = ""; return; }
  const a = act.split("|"), b = custom, i = a.findIndex((c, k) => c !== b[k]);
  if (i < 0) { box.innerHTML = ""; return; }
  const cA = a[i], cB = b[i], cul = D.cultivos[cB] || {}, v = D.rotaciones[custom.join("|")];
  const guardada = (lsGet(PRUEBA_KEY, {})[D.sitio] || null);
  const esta = guardada && guardada.a === cA && guardada.b === cB;
  const dura = cul.siembra && cul.cosecha ? `<li><b>${tr("prDura")}</b> ${tr("prDuraX", { s: MES()[cul.siembra - 1], c: MES()[cul.cosecha - 1] })}</li>` : "";
  box.innerHTML = `<details class="prueba"${esta ? " open" : ""}><summary>${tr("prT")}</summary>
    <p class="hint">${tr("prX")}</p>
    ${i > 0 ? `<p class="hint">${tr("prIgual", { n: i + 1 })}</p>` : ""}
    <div class="pr-ab"><div class="pr-p a"><small>${tr("prA")}</small>${cico(cA, "pr-ico")}<b>${cname(cA)}</b><small>${tr("prCamp", { n: i + 1 })}</small></div>
      <span class="pr-vs" aria-hidden="true">⇄</span>
      <div class="pr-p b"><small>${tr("prB")}</small>${cico(cB, "pr-ico")}<b>${cname(cB)}</b><small>${tr("prCamp", { n: i + 1 })}</small></div></div>
    <ul class="pr-pasos"><li><b>${tr("prCom")}</b> ${tr("prComX")}</li><li><b>${tr("prAnot")}</b> ${tr("prAnotX")}</li>${dura}
      ${v ? `<li><b>${tr("prLee")}</b> ${tr("prLeeX", { n: ten(fracOf(v)) })}</li>` : ""}</ul>
    <div class="pr-acc">${esta ? `<p class="pr-ok">${tr("prGuardada")}</p><button type="button" data-pr="ir">${tr("prIr")}</button><button type="button" data-pr="quitar">${tr("prQuitar")}</button>`
      : `<button type="button" class="pr-save" data-pr="guardar">${tr("prGuardar")}</button>`}</div></details>`;
  const set = (val) => { const t = lsGet(PRUEBA_KEY, {}); if (val) t[D.sitio] = val; else delete t[D.sitio]; lsSet(PRUEBA_KEY, t); renderPrueba(); renderCuaderno(); };
  const g = $("[data-pr=guardar]", box), q = $("[data-pr=quitar]", box), ir = $("[data-pr=ir]", box);
  if (g) g.onclick = () => { set({ a: cA, b: cB, campania: i + 1, rot: custom.join("|"), creada: hoyISO() }); toast(tr("prGuardada")); };
  if (q) q.onclick = () => set(null);
  if (ir) ir.onclick = () => irA("#cuaderno");
}

// ---------------------------------------------------------------- paso 6: cuaderno de campo
const CU_TIPOS = { siembra: "kg", abono: "kg", riego: "mm", labor: "", helada: "°C", granizo: "", lluvia: "mm", plaga: "plantas", cosecha: "kg", medicion: "cm" };
const CU_UNID = ["kg", "mm", "cm", "°C", "plantas", "S/", ""];
const getCu = () => lsGet(CUAD_KEY, []);
function renderCuaderno() {
  const f = $("#cuForm");
  if (!f || !D) return;
  const prueba = lsGet(PRUEBA_KEY, {})[D.sitio];
  const tipo = $("#cuTipo").value || "siembra";
  const tipos = Object.keys(CU_TIPOS).filter((k) => D.andina || !["helada", "granizo"].includes(k) || k === tipo); // helada y granizo: solo en la sierra
  $("#cuTipo").innerHTML = tipos.map((k) => `<option value="${k}"${k === tipo ? " selected" : ""}>${tr("cu_" + k)}</option>`).join("");
  $("#cuTipos").innerHTML = tipos.map((k) => `<button type="button" data-k="${k}" class="${k === tipo ? "on" : ""}" aria-pressed="${k === tipo}">${tr("cu_" + k)}</button>`).join("");
  $$("#cuTipos button").forEach((b) => (b.onclick = () => {
    $("#cuTipo").value = b.dataset.k; $("#cuUnidad").value = CU_TIPOS[b.dataset.k];
    $$("#cuTipos button").forEach((x) => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); });
  }));
  const un = $("#cuUnidad").value;
  $("#cuUnidad").innerHTML = CU_UNID.map((u) => `<option value="${u}"${u === (un || CU_TIPOS[tipo]) ? " selected" : ""}>${u || "—"}</option>`).join("");
  if (!$("#cuFecha").value) $("#cuFecha").value = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  $("#cuPedazoL").hidden = !prueba;
  if (prueba) $("#cuPedazo").innerHTML = [["", tr("cuTodo")], ["A", `A · ${cname(prueba.a)}`], ["B", `B · ${cname(prueba.b)}`]].map(([v, t]) => `<option value="${v}">${t}</option>`).join("");
  const lista = getCu().filter((r) => r.sitio === D.sitio).sort((x, y) => (x.fecha < y.fecha ? 1 : -1));
  $("#cuLista").innerHTML = lista.length ? lista.map((r) =>
    `<li><b>${r.fecha}</b> <span>${tr("cu_" + r.tipo)}</span>${r.pedazo ? ` <span class="cu-pz">${r.pedazo}</span>` : ""}${r.valor != null ? ` · ${num(r.valor)} ${esc(r.unidad || "")}` : ""}${r.nota ? ` · ${esc(r.nota)}` : ""}${r.semaforo ? ` <span class="cu-sem" title="${tr("acSemaforo", { c: tr(r.semaforo) })}">${{ verde: "🟢", ambar: "🟡", rojo: "🔴" }[r.semaforo]}</span>` : ""}
      <button type="button" class="cu-x" data-del="${r.id}" aria-label="${tr("cuBorrarUno")}">✕</button></li>`).join("") : `<li class="cu-vacio">${tr("cuSin")}</li>`;
  $$("#cuLista [data-del]").forEach((b) => (b.onclick = () => { lsSet(CUAD_KEY, getCu().filter((r) => r.id !== b.dataset.del)); renderCuaderno(); }));
  const pr = $("#cuPrueba");
  if (prueba) {
    const kg = (p) => lista.filter((r) => r.tipo === "cosecha" && r.pedazo === p && r.unidad === "kg").reduce((s, r) => s + (r.valor || 0), 0);
    const A = kg("A"), B = kg("B");
    pr.innerHTML = `<p class="cu-prueba">🧪 ${A || B ? tr("cuPrRes", { a: num(A), b: num(B) }) : tr("cuPrFalta")}</p>`;
  } else pr.innerHTML = "";
}
function initCuaderno() {
  if (!$("#cuForm")) return;
  $("#cuTipo").onchange = () => { $("#cuUnidad").value = CU_TIPOS[$("#cuTipo").value]; };
  $("#cuForm").onsubmit = (e) => {
    e.preventDefault();
    const v = parseFloat($("#cuValor").value);
    const r = { id: Date.now().toString(36), fecha: $("#cuFecha").value, sitio: D.sitio, lugar: chosen && chosen.site === D.sitio ? chosen.nombre : D.contexto.lugar,
                tipo: $("#cuTipo").value, pedazo: $("#cuPedazoL").hidden ? "" : $("#cuPedazo").value, valor: Number.isFinite(v) ? v : null,
                unidad: Number.isFinite(v) ? $("#cuUnidad").value : "", nota: $("#cuNota").value.trim() };
    if (r.tipo === "siembra" && AH && AH.resumen) { r.semaforo = AH.resumen.s.nivel; r.semaforo_datos = ymd(AH.resumen.a.last); }
    lsSet(CUAD_KEY, [...getCu(), r]);
    $("#cuValor").value = ""; $("#cuNota").value = "";
    toast(tr("cuAnotado"));
    renderCuaderno();
  };
  $("#cuCsv").onclick = () => {
    const filas = getCu();
    const cols = ["fecha", "sitio", "lugar", "tipo", "pedazo", "valor", "unidad", "nota"];
    const q = (v) => (v == null ? "" : /[",\n;]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
    const reg = getReg().map((r) => ({ fecha: r.fecha, sitio: r.sitio, tipo: "cierre_campania", valor: r.kg, unidad: "kg",
      nota: `${r.seq} · S/ ${r.precio}/kg · ${r.como}${r.acierto ? ` · acertó: ${r.acierto}` : ""}${r.semaforo ? ` · semáforo al sembrar: ${r.semaforo}` : ""}` }));
    const csv = "﻿" + [cols.join(","), ...[...filas, ...reg].map((r) => cols.map((c) => q(r[c])).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `muyuy_cuaderno_${hoyISO()}.csv`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };
  $("#cuInforme").onclick = imprimirInforme;
  $("#cuBorrar").onclick = () => { $("#cuConfirma").hidden = false; $("#cuConfNo").focus(); };
  $("#cuConfNo").onclick = () => ($("#cuConfirma").hidden = true);
  $("#cuConfSi").onclick = () => {
    try { Object.keys(localStorage).filter((k) => k.startsWith("muyuy-") && !["muyuy-idioma", "muyuy-ajustes", "muyuy-audio"].includes(k)).forEach((k) => localStorage.removeItem(k)); } catch {}
    try { sessionStorage.removeItem("muyuy-chat"); } catch {}
    toast(tr("cuBorrado"));
    setTimeout(() => location.reload(), 900);
  };
}

function imprimirInforme() {
  const c = D.contexto, area = $("#printArea"), best = ranked()[0];
  const lugar = chosen && chosen.site === D.sitio ? chosen.nombre : c.lugar;
  let h = `<h1>${tr("infT")}</h1><p>${esc(lugar)} · ${fCorta(new Date())}</p>
    <table class="print-ctx"><tr><th>${tr("lugar")}</th><td>${esc(c.lugar)}</td></tr><tr><th>${tr("altura")}</th><td>${c.altura} m</td></tr><tr><th>${tr("pendiente")}</th><td>${c.pendiente} %</td></tr></table>`;
  if (AH && AH.resumen) {
    const { a, s } = AH.resumen;
    h += `<h2>${tr("infAhora")} (${fCorta(a.last)})</h2><p><b>${tr(s.clave)}</b>: ${s.texto}</p><p>${esc(textoAviso())}</p>` +
      (s.avisos.length ? `<ul>${s.avisos.map((x) => `<li><b>${tr(x[2])}</b>: ${x[3]}</li>`).join("")}</ul>` : "");
  }
  const sel = custom.every(Boolean) ? custom.join("|") : best && best[0];
  if (sel) h += `<h2>${tr("infRot")}</h2><p>${sel.split("|").map(cname).join(" → ")}${D.rotaciones[sel] ? ` · ${tr("robust", { n: ten(fracOf(D.rotaciones[sel])) })}` : ""}</p>`;
  const pr = lsGet(PRUEBA_KEY, {})[D.sitio];
  if (pr) h += `<p>🧪 A: ${cname(pr.a)} · B: ${cname(pr.b)} (${tr("prCamp", { n: pr.campania })})</p>`;
  const cu = getCu().filter((r) => r.sitio === D.sitio).sort((x, y) => (x.fecha > y.fecha ? 1 : -1));
  h += `<h2>${tr("infCu")}</h2>` + (cu.length ? `<table class="print-ctx"><tr><th>${tr("cuFecha")}</th><th>${tr("cuTipo")}</th><th>${tr("cuPedazo")}</th><th>${tr("cuValor")}</th><th>${tr("cuNota")}</th></tr>` +
    cu.map((r) => `<tr><td>${r.fecha}</td><td>${tr("cu_" + r.tipo)}</td><td>${r.pedazo || ""}</td><td>${r.valor != null ? `${num(r.valor)} ${esc(r.unidad)}` : ""}</td><td>${esc(r.nota)}</td></tr>`).join("") + "</table>" : `<p>${tr("cuSin")}</p>`);
  const reg = getReg().filter((r) => r.sitio === D.sitio);
  if (reg.length) h += `<h2>${tr("infReg")}</h2><ul>${reg.map((r) => `<li>${r.fecha} · ${r.seq === "otra" ? tr("otra") : D.rotaciones[r.seq] ? seqName(r.seq) : esc(r.seq)} · ${r.kg || "—"} kg · ${tr(r.como || "regular")}</li>`).join("")}</ul>`;
  const ac = resumenAcierto();
  if (ac) h += `<p>${ac.texto}</p>`;
  h += `<p class="small">${tr("fuentesAhora")}</p>`;
  area.innerHTML = h;
  window.print();
}

// ---------------------------------------------------------------- «¿Acertó Muyuy?» (cierre de campaña)
// El semáforo con el que sembró (cuaderno) y lo que el agricultor dice al cerrar la campaña: se cuentan los aciertos y,
// si el semáforo verde falló o el rojo/ámbar acertó dos veces o más, se sugiere mover la lluvia mínima 5 mm.
function semaforoAlSembrar() {
  const s = getCu().filter((r) => r.sitio === D.sitio && r.tipo === "siembra" && r.semaforo).sort((x, y) => (x.fecha < y.fecha ? 1 : -1))[0];
  return s ? s.semaforo : "";
}
function resumenAcierto() {
  const reg = getReg().filter((r) => r.sitio === D.sitio && r.acierto);
  if (!reg.length) return null;
  const si = reg.filter((r) => r.acierto === "si").length, mas = reg.filter((r) => r.acierto === "mas").length;
  const U = { ...UMB0, ...lsGet(UMB_KEY, {}) };
  const verdeMal = reg.filter((r) => r.semaforo === "verde" && (r.acierto === "no" || r.como === "mal")).length;
  const otroBien = reg.filter((r) => r.semaforo && r.semaforo !== "verde" && r.como === "bien").length;
  const sug = verdeMal >= 2 ? Math.min(60, U.lluvia10 + 5) : otroBien >= 2 ? Math.max(10, U.lluvia10 - 5) : null;
  return { texto: tr("acResumen", { a: si, n: reg.length }) + (mas ? " " + tr("acMasN", { m: mas }) : ""), sug, sube: verdeMal >= 2 };
}
function renderAcierto() {
  const box = $("#acierto");
  if (!box) return;
  const r = resumenAcierto();
  if (!r) { box.innerHTML = ""; return; }
  box.innerHTML = `<p class="ac-res">🎯 ${r.texto}</p>` + (r.sug != null ? `<p class="ac-sug">${tr(r.sube ? "acSugMas" : "acSugMenos", { v: r.sug })} <button type="button" id="acAplicar">${tr("acAplicar")}</button></p>` : "");
  const b = $("#acAplicar");
  if (b) b.onclick = () => { lsSet(UMB_KEY, { ...UMB0, ...lsGet(UMB_KEY, {}), lluvia10: r.sug }); toast(tr("acAplicado")); renderAhora(); renderAcierto(); };
}

function initAhora() {
  cargarEnso(); // satelite.js
  initCuaderno();
  addEventListener("online", () => { if (AH && AH.estado === "error") cargarAhora(true); });
}

// borrador en quechua (Cusco-Collao) del semáforo y los avisos: lo primero que ve el agricultor en el paso 1.
// Debe revisarlo una persona hablante; las claves que falten siguen en castellano.
Object.assign(I18N.qu, {
  semSi: "Tarpuyta atinkiña", semSiX: "Chunka p'unchaypi aypanankama paran, allpapas uqum.",
  semPrepare: "Chakrata wakichiy", semPrepareX: "Parachkanña, ichaqa allpa manaraq uquchu. Huk utaq iskay parata suyay.",
  semCasi: "Yaqañam", semCasiX: "Allpa uqum, ichaqa chunka p'unchaypi pisillata paran. Hamuq parata suyay.",
  semNo: "Manaraqmi", semNoX: "Pisillata paran, allpapas ch'akim. Kunan tarpuspaqa muhuta chinkachiwaq.",
  semSeca: "Manam paraywan tarpuna pachachu", semSecaX: "Kay p'unchaykunapi suyuykipi yaqa manam paranchu. Kunanqa tarpuyta yuyaykuy (2 kaq ruraymanta 5 kaq rurayman).",
  semSecaRiego: "Qarpaywanlla", semSecaRiegoX: "Kay p'unchaykunapi yaqa manam paranchu: qarpayniykiwan tarpuyta atinki; mana qarpayniyuq kaspaqa parata suyay.",
  semSueloDud: "Manaraq tarpuspa allpaykita qhaway", semSueloDudX: "Allpa uqum, ichaqa kay p'unchaykunapa paranqa manaraq takyasqachu. Allpata hap'iy: makiykipi huñukuqtinqa tarpuyta atinki.",
  semNoDud: "Manaraqmi", semNoDudX: "Allpa ch'akim, kay p'unchaykunapa paranqa manaraq takyasqachu.",
  semHelada: " Cuidakuy: qasa tutakuna karqan; qasata mana aguantaq tarpuykunapaqqa suyay.",
  verde: "q'omer", ambar: "q'illu", rojo: "puka", luz: "{c} k'anchay",
  tLluvia: "Para chunka p'unchaypi", tLluviaN: "sapa kuti: {n} mm", tLluviaDud: "manaraq takyasqa",
  tSuelo: "Allpaq uqu kaynin", tSueloX: "0 % ch'aki · 100 % yaku hunt'a",
  tFrio: "Aswan chiri tuta (7 p'unchay)", tFrioS: "chakraykiq altunpi · {f}",
  tVerdor: "Chakraq q'omer kaynin",
  avHelada: "Qasa suyuykipi", avHeladaR: "Qasa hamunman", avHeladaX: "Qhipa semanapi aswan chiri tuta {t} °C-man chayarqan chakraykiq altunpi. Almácigokunata qataykuy; qasata mana aguantaqtaqa ama tarpuychu qasa pasanankama.",
  avFuerte: "Sinchi para", avFuerteX: "Qhipa semanapi huk p'unchay {v} mm paran.",
  avVeranillo: "Veranillo: pisi para", avVeranilloX: "Chunka p'unchaypi {v} mm paran, sapa kuti {n} mm. Tarpurqankiña chayqa, hallmay, allpatapas qataykuy uqu waqaychanapaq.",
  avSeca: "Pisi parayuq tarpuy", avSecaX: "Setiembremanta {v} mm paran, sapa kuti {n} mm. 4 kaq ruraypi «ch'aki watakuna» muyuykunata qhaway.",
  avLluviosa: "Aswan parayuq tarpuy", avLluviosaX: "Setiembremanta {v} mm paran, sapa kuti {n} mm. Papapi rancha unquyta, qhatapi allpa apakuytapas qhaway.",
});
