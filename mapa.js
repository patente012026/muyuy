// Muyuy · mapa nacional de comunidades campesinas y nativas (BDPI, Ministerio de Cultura del Perú).
// Los 38 737 puntos se dibujan en canvas; al tocar uno se consulta en vivo el clima de NASA Power de ese lugar.
"use strict";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

const M = {
  es: {
    titulo: "Muyuy V1.0 · Mapa de comunidades", tag: "Comunidades campesinas y nativas del Perú, con el clima de la NASA", idioma: "Idioma",
    volver: "← Vista del agricultor", buscar: "Buscar comunidad o distrito", filtros: "Filtros", campesinas: "Comunidades campesinas",
    nativas: "Comunidades nativas", departamento: "Departamento", todos: "Todo el Perú", capas: "Capas",
    celdas: "Celdas de clima NASA Power", sitios: "Sitios ya calculados en Muyuy", satelite: "Imagen satelital",
    porDep: "Centros poblados por departamento", tipChart: "Toque una barra para filtrar.", cargando: "Cargando 38 737 comunidades…",
    kPuntos: "centros poblados", kCamp: "campesinos", kNat: "nativos", kPob: "habitantes", kCeldas: "celdas NASA Power",
    kNota: "Bastan {c} celdas de clima de la NASA para cubrir a todas estas comunidades. Muyuy tiene calculadas {t}, que cubren todo el Perú.",
    campesina: "Comunidad campesina", nativa: "Comunidad nativa", poblacion: "Población", habitantes: "habitantes",
    verClima: "🛰️ Ver clima NASA de este lugar", climaCargando: "Consultando NASA Power…", climaError: "No se pudo consultar NASA Power (¿sin internet?).",
    lluviaAnual: "Lluvia anual", tminFrio: "Mínima del mes más frío", mesesHelada: "Meses con helada", altCelda: "Altura de la celda NASA",
    ninguno: "ninguno", region: "Región", sierra: "Sierra", costa: "Costa", selva: "Selva", parecido: "Datos de Muyuy para este lugar", distrito: "Distrito", puntoMapa: "Lugar elegido en el mapa", buscarTodo: "Buscar comunidad o distrito",
    abrir: "Abrir en Muyuy", celdaTip: "Celda NASA Power: {n} centros poblados · {p} habitantes",
    fuente: "Fuente: {f}. Cada punto es un centro poblado de una localidad indígena u originaria registrada en la BDPI; una comunidad puede tener varios centros poblados. Clima: NASA Power (climatología, celda de ~50 km).",
    leyCamp: "campesina", leyNat: "nativa", leyDist: "distrito", distritos: "Capitales de distrito (INEI)", leyTam: "tamaño = población", sinRes: "Sin resultados", mapaPeru: "Perú",
    lluvia: "lluvia (mm)", tmin: "Tmin (°C)",
    notaCelda: "Clima de la celda NASA Power (~50 km). La comunidad puede estar más abajo o más arriba: Muyuy lo corrige por altura con SRTM.",
  },
  en: {
    titulo: "Muyuy V1.0 · Community map", tag: "Peru's peasant and native communities, with NASA climate", idioma: "Language",
    volver: "← Farmer view", buscar: "Search community", filtros: "Filters", campesinas: "Peasant communities",
    nativas: "Native communities", departamento: "Department", todos: "All of Peru", capas: "Layers",
    celdas: "NASA Power climate cells", sitios: "Sites already computed in Muyuy", satelite: "Satellite image",
    porDep: "Settlements by department", tipChart: "Tap a bar to filter.", cargando: "Loading 38,737 communities…",
    kPuntos: "settlements", kCamp: "peasant", kNat: "native", kPob: "inhabitants", kCeldas: "NASA Power cells",
    kNota: "Just {c} NASA climate cells cover all these communities. Muyuy has computed {t}, covering all of Peru.",
    campesina: "Peasant community", nativa: "Native community", poblacion: "Population", habitantes: "inhabitants",
    verClima: "🛰️ See NASA climate for this place", climaCargando: "Querying NASA Power…", climaError: "Could not reach NASA Power (offline?).",
    lluviaAnual: "Annual rainfall", tminFrio: "Minimum of the coldest month", mesesHelada: "Months with frost", altCelda: "NASA cell altitude",
    ninguno: "none", region: "Region", sierra: "Andes", costa: "Coast", selva: "Amazon", parecido: "Muyuy data for this place", distrito: "District", puntoMapa: "Place chosen on the map", buscarTodo: "Search community or district",
    abrir: "Open in Muyuy", celdaTip: "NASA Power cell: {n} settlements · {p} inhabitants",
    fuente: "Source: {f}. Each point is a settlement of an indigenous or original locality registered in the BDPI; one community may have several settlements. Climate: NASA Power (climatology, ~50 km cell).",
    leyCamp: "peasant", leyNat: "native", leyDist: "district", distritos: "District capitals (INEI)", leyTam: "size = population", sinRes: "No results", mapaPeru: "Peru",
    lluvia: "rain (mm)", tmin: "Tmin (°C)",
    notaCelda: "Climate of the NASA Power cell (~50 km). The community may sit lower or higher: Muyuy corrects for altitude with SRTM.",
  },
};
const MES = { es: ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"], en: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"] };
// runasimi (borrador, 2026-11-14): antes el mapa salía en castellano al elegir quechua
M.qu = {
  titulo: "Muyuy V1.0 · Ayllukunapa mapan", tag: "Perúpa campesino nativo ayllunkuna, NASA pachawan", idioma: "Rimay",
  volver: "← Chakra runapaq", buscar: "Ayllupa utaq distritopa sutinta maskhay", filtros: "Akllanakuna", campesinas: "Campesino ayllukuna",
  nativas: "Nativo ayllukuna", departamento: "Departamento", todos: "Tukuy Perú", capas: "Capakuna",
  celdas: "NASA Power pachapa k'uchunkuna", sitios: "Muyuypi ñam yupasqa chiqankuna", satelite: "Satélite rikchay",
  porDep: "Sapa departamentopi llaqtakuna", tipChart: "Akllanaykipaq huk barrata llamiy.", cargando: "38 737 ayllukunata apamuchkani…",
  kPuntos: "llaqtakuna", kCamp: "campesinokuna", kNat: "nativokuna", kPob: "runakuna", kCeldas: "NASA Power k'uchukuna",
  kNota: "Kay tukuy ayllukunata qatanapaq NASA pachapa {c} k'uchullan aypan. Muyuyqa {t} k'uchuta yupasqa, tukuy Perúta qatanku.",
  campesina: "Campesino ayllu", nativa: "Nativo ayllu", poblacion: "Runakuna", habitantes: "runakuna",
  verClima: "🛰️ Kay chiqanpa NASA pachanta qhaway", climaCargando: "NASA Powerta tapuchkani…", climaError: "NASA Powerta mana tapuyta atikurqanchu (¿mana internetniyuq?).",
  lluviaAnual: "Watapa paran", tminFrio: "Aswan chiri killapa aswan pisi q'oñiynin", mesesHelada: "Qasayuq killakuna", altCelda: "NASA k'uchupa altun",
  ninguno: "mana mayqinpas", region: "Suyu", sierra: "Sallqa", costa: "Chala", selva: "Sacha", parecido: "Kay chiqanpaq Muyuypa willakuyninkuna", distrito: "Distrito", puntoMapa: "Mapapi akllasqa chiqan", buscarTodo: "Ayllupa utaq distritopa sutinta maskhay",
  abrir: "Muyuypi kichay", celdaTip: "NASA Power k'uchu: {n} llaqtakuna · {p} runakuna",
  fuente: "Maymanta: {f}. Sapa chiqan BDPI-pi qillqasqa ñawpa llaqtapa huk llaqtanmi; huk aylluqa achka llaqtayuqmi kanman. Pacha: NASA Power (climatología, ~50 km k'uchu).",
  leyCamp: "campesino", leyNat: "nativo", leyDist: "distrito", distritos: "Distritokunapa uma llaqtan (INEI)", leyTam: "sayay = runakuna", sinRes: "Mana imapas tarikunchu", mapaPeru: "Perú",
  lluvia: "para (mm)", tmin: "Tmin (°C)",
  notaCelda: "NASA Power k'uchupa pachan (~50 km). Aylluqa aswan urapi utaq aswan hanaqpi kanman: Muyuyqa SRTM-wan altunman hina allichan.",
};
const ML = () => (M[LANG] ? LANG : "es");
const tm = (k, p = {}) => (M[ML()][k] ?? M.es[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => (x in p ? p[x] : `{${x}}`));
const fmt = (x, d = 0) => Number(x).toLocaleString(ML() === "en" ? "en-US" : "es-PE", { maximumFractionDigits: d, minimumFractionDigits: d });
const COL = { camp: "#d81b60", nat: "#2e8b57", dist: "#3f51b5" };

let C, map, canvas, canvasCeldas, layerPts, layerDist, layerCeldas, layerSitios, base, sat, depBounds = {};

function applyStaticM() {
  $$("[data-m]").forEach((el) => (el.textContent = tm(el.dataset.m)));
  document.documentElement.lang = ML();
}

// ---------------------------------------------------------------- filtros y conteos
function filtered() {
  const camp = $("#fCamp").checked, nat = $("#fNat").checked, dep = $("#fDep").value;
  return C.puntos.filter((p) => (p[2] ? nat : camp) && (dep === "" || C.deps[p[5]] === dep));
}
function renderKpis(pts) {
  const camp = pts.filter((p) => !p[2]).length, pob = pts.reduce((a, p) => a + p[3], 0);
  const cells = new Set(pts.map((p) => `${Math.floor((p[1] + 90) / C.celda[0])}_${Math.floor((p[0] + 180) / C.celda[1])}`)).size;
  $("#kpis").innerHTML = `
    <div class="kpi big"><b>${fmt(pts.length)}</b><span>${tm("kPuntos")}</span></div>
    <div class="kpi"><b style="color:${COL.camp}">${fmt(camp)}</b><span>${tm("kCamp")}</span></div>
    <div class="kpi"><b style="color:${COL.nat}">${fmt(pts.length - camp)}</b><span>${tm("kNat")}</span></div>
    <div class="kpi"><b>${fmt(pob / 1e6, 2)} M</b><span>${tm("kPob")}</span></div>
    <div class="kpi"><b>${fmt(cells)}</b><span>${tm("kCeldas")}</span></div>
    <p class="kpi-nota">${tm("kNota", { c: fmt(cells), t: fmt(Object.keys(C.sitio_celda || {}).length) })}</p>`;
}
function renderChart(pts) {
  const by = {};
  C.puntos.filter((p) => (p[2] ? $("#fNat").checked : $("#fCamp").checked)).forEach((p) => (by[C.deps[p[5]]] = (by[C.deps[p[5]]] || 0) + 1));
  const rows = Object.entries(by).sort((a, b) => b[1] - a[1]);
  const max = rows.length ? rows[0][1] : 1, sel = $("#fDep").value;
  $("#chartDep").innerHTML = rows.map(([d, n]) => `<button type="button" class="barra ${sel === d ? "on" : ""}" data-d="${esc(d)}">
      <span class="lab">${esc(d)}</span><span class="track"><i style="width:${(100 * n) / max}%"></i></span><span class="val">${fmt(n)}</span></button>`).join("");
  $$("#chartDep .barra").forEach((b) => (b.onclick = () => { $("#fDep").value = $("#fDep").value === b.dataset.d ? "" : b.dataset.d; refresh(true); }));
}

// ---------------------------------------------------------------- capas
const radius = (pob) => Math.min(9, 2.2 + Math.sqrt(pob) / 9);
function drawPoints() {
  // capa rápida (puntos.js): un solo dibujo por mosaico en lugar de 38 737 objetos
  const camp = $("#fCamp").checked, nat = $("#fNat").checked, dep = $("#fDep").value;
  const filtro = (p) => (p[2] ? nat : camp) && (dep === "" || C.deps[p[5]] === dep);
  if (!layerPts) {
    layerPts = L.puntosLayer(C.puntos, { color: (p) => (p[2] ? COL.nat : COL.camp), filtro,
      radio: (p, z) => Math.min(9, (z < 6 ? 1.4 : z < 8 ? 2.2 : 3) + Math.sqrt(p[3]) / (z < 7 ? 14 : 9)) })
      .on("punto", (e) => openPoint(e.punto, e.latlng)).addTo(map);
    // cualquier lugar del mapa: su clima NASA Power y los datos de Muyuy de su celda
    map.on("click", (e) => { if (!e.originalEvent || !e.originalEvent._muyuyPunto) openLugar(tm("puntoMapa"), `${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)}`, e.latlng); });
  } else layerPts.setFiltro(filtro);
  // capitales de distrito: llenan la costa, donde casi no hay comunidades registradas
  const fd = (d) => $("#fDist").checked && (dep === "" || C.deps[d[3]] === dep);
  if (!layerDist) {
    layerDist = L.puntosLayer(C.distritos || [], { color: () => COL.dist, filtro: fd, radio: (p, z) => (z < 6 ? 1.8 : z < 8 ? 2.8 : 4) })
      .on("punto", (e) => { const d = e.punto; openLugar(d[2], `${tm("distrito")} · ${d[4]}, ${C.deps[d[3]]}${d[5] ? ` · ${fmt(d[5])} m` : ""}`, e.latlng); })
      .addTo(map);
  } else layerDist.setFiltro(fd);
}
function drawCeldas(pts) {
  // solo las celdas que cubren los puntos filtrados, con su conteo
  if (layerCeldas) map.removeLayer(layerCeldas);
  layerCeldas = L.layerGroup();
  const by = new Map();
  for (const p of pts) {
    const k = `${Math.floor((p[1] + 90) / C.celda[0])}_${Math.floor((p[0] + 180) / C.celda[1])}`;
    const c = by.get(k) || [Math.floor((p[1] + 90) / C.celda[0]) * C.celda[0] - 90, Math.floor((p[0] + 180) / C.celda[1]) * C.celda[1] - 180, 0, 0];
    c[2]++; c[3] += p[3]; by.set(k, c);
  }
  const cells = [...by.values()], max = Math.max(1, ...cells.map((c) => c[2]));
  for (const [la, lo, n, pob] of cells) {
    const k = Math.sqrt(n / max);
    L.rectangle([[la, lo], [la + C.celda[0], lo + C.celda[1]]], { renderer: canvasCeldas, weight: 0.6, color: "#1565c0",
      fillColor: "#1e88e5", fillOpacity: 0.08 + 0.5 * k, interactive: true })
      .bindTooltip(tm("celdaTip", { n: fmt(n), p: fmt(pob) }), { sticky: true }).addTo(layerCeldas);
  }
  if ($("#lCeldas").checked) layerCeldas.addTo(map);
}
function drawSitios() {
  if (layerSitios) map.removeLayer(layerSitios);
  layerSitios = L.layerGroup();
  for (const s of C.sitios_muyuy) {
    L.marker([s.lat, s.lon], { icon: L.divIcon({ className: "muyuy-star", html: "★", iconSize: [26, 26] }) })
      .bindTooltip(`★ ${esc(s.nombre)}`).on("click", () => openSite(s.id)).addTo(layerSitios);
  }
  if ($("#lSitios").checked) layerSitios.addTo(map);
}
function legend() {
  $("#leyenda").innerHTML = `<span><i class="sw camp"></i>${tm("leyCamp")}</span><span><i class="sw nat"></i>${tm("leyNat")}</span><span><i class="sw dist"></i>${tm("leyDist")}</span>
    <span>● ${tm("leyTam")}</span>${$("#lCeldas").checked ? `<span><i class="sw celda"></i>${tm("celdas")}</span>` : ""}`;
}
function refresh(fit = false) {
  const pts = filtered();
  renderKpis(pts);
  renderChart(pts);
  drawCeldas(pts);
  drawPoints();
  legend();
  const dep = $("#fDep").value;
  if (fit) map.flyToBounds(dep && depBounds[dep] ? depBounds[dep] : depBounds.__all, { padding: [20, 20], duration: 0.8 });
}

// ---------------------------------------------------------------- ficha de la comunidad y clima de NASA Power
// lugar = {nombre, lat, lon} de la comunidad o el punto tocado: la vista del agricultor muestra su nombre con los datos de la celda
function openSite(id, lugar) {
  if (window.parent !== window && typeof parent.muyuyOpenSite === "function") parent.muyuyOpenSite(id, lugar);
  else location.href = `index.html?sitio=${id}&lang=${LANG}` + (lugar ? `&lugar=${encodeURIComponent(lugar.nombre)}&lat=${lugar.lat}&lon=${lugar.lon}` : "") + "#hoy";
}
function nearestSite(lat, lon) {
  // en el Perú, el punto calculado más parecido por cercanía y altura; fuera de las celdas, el sitio detallado más cercano
  const k = `${Math.floor((lat + 90) / C.celda[0])}_${Math.floor((lon + 180) / C.celda[1])}`;
  const det = C.sitios_muyuy.find((s) => `${Math.floor((s.lat + 90) / C.celda[0])}_${Math.floor((s.lon + 180) / C.celda[1])}` === k);
  const cel = C.sitio_celda && C.sitio_celda[k];
  if (det || cel) return puntoParecido(lat, lon, null, [...C.sitios_muyuy, ...Object.values(C.sitio_celda || {})], C.distritos).sitio; // puntos.js
  let best = null, bd = 1e9;
  for (const s of C.sitios_muyuy) { const d = Math.hypot(s.lat - lat, (s.lon - lon) * Math.cos((lat * Math.PI) / 180)); if (d < bd) { bd = d; best = s; } }
  return best;
}
function openPoint(p, latlng) {
  const html = `<div class="ficha"><b class="f-nom">${esc(p[4])}</b>
    <span class="f-tipo" style="background:${p[2] ? COL.nat : COL.camp}">${tm(p[2] ? "nativa" : "campesina")}</span>
    <p>${esc(C.dists[p[7]])} · ${esc(C.provs[p[6]])} · ${esc(C.deps[p[5]])}</p>
    <p>${tm("poblacion")}: <b>${fmt(p[3])}</b> ${tm("habitantes")} · ${p[1].toFixed(3)}, ${p[0].toFixed(3)}</p>
    <button type="button" class="f-clima">${tm("verClima")}</button><div class="f-res"></div></div>`;
  const pop = L.popup({ maxWidth: 320, minWidth: 260 }).setLatLng(latlng).setContent(html).openOn(map);
  const el = pop.getElement();
  $(".f-clima", el).onclick = () => climate(p, el, p[4]);
}
function openLugar(nombre, sub, latlng) {
  const html = `<div class="ficha"><b class="f-nom">${esc(nombre)}</b><p>${esc(sub)}</p>
    <button type="button" class="f-clima">${tm("verClima")}</button><div class="f-res"></div></div>`;
  const pop = L.popup({ maxWidth: 320, minWidth: 260 }).setLatLng(latlng).setContent(html).openOn(map);
  const el = pop.getElement();
  $(".f-clima", el).onclick = () => climate([latlng.lng, latlng.lat], el, nombre === tm("puntoMapa") ? `${latlng.lat.toFixed(3)}, ${latlng.lng.toFixed(3)}` : nombre);
}
async function climate(p, el, nombre) {
  const box = $(".f-res", el), btn = $(".f-clima", el);
  btn.disabled = true;
  box.innerHTML = `<p class="small">${tm("climaCargando")}</p>`;
  try {
    const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=PRECTOTCORR,T2M_MIN&community=AG&longitude=${p[0]}&latitude=${p[1]}&format=JSON`;
    const js = await (await fetch(url)).json();
    const P = js.properties.parameter, z = js.geometry.coordinates[2];
    const K = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"], D = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const rain = K.map((k, i) => P.PRECTOTCORR[k] * D[i]), tmin = K.map((k) => P.T2M_MIN[k]);
    const annual = rain.reduce((a, b) => a + b, 0), coldest = Math.min(...tmin);
    const frost = MES[ML()].filter((_, i) => tmin[i] < 0);
    // región aproximada: sobre 2 000 m es sierra; debajo, costa al oeste del eje andino y selva al este
    const ejeAndino = -79.5 + (Math.max(5, -p[1]) - 5) * (8.5 / 12);
    const region = z >= 2000 ? "sierra" : p[1] < -15.5 || p[0] < ejeAndino ? "costa" : "selva"; // como muyuy/resumen.py
    document.body.dataset.region = region; // los colores del mapa toman la región del lugar tocado
    const s = nearestSite(p[1], p[0]);
    box.innerHTML = `${miniChart(rain, tmin)}
      <ul class="f-datos"><li>${tm("lluviaAnual")}: <b>${fmt(annual)} mm</b></li><li>${tm("tminFrio")}: <b>${fmt(coldest, 1)} °C</b></li>
      <li>${tm("mesesHelada")}: <b>${frost.length ? frost.join(" ") : tm("ninguno")}</b></li><li>${tm("altCelda")}: <b>${fmt(z)} m</b> · ${tm("region")}: <b>${tm(region)}</b></li></ul>
      <p class="small">${tm("notaCelda")}</p>
      ${s ? `<p class="f-par">${tm("parecido")}: <b>★ ${esc(s.nombre)}</b></p><button type="button" class="f-abrir">${tm("abrir")}</button>` : ""}`;
    if (s) $(".f-abrir", el).onclick = () => openSite(s.id, { nombre, lat: p[1], lon: p[0] });
  } catch {
    box.innerHTML = `<p class="small">${tm("climaError")}</p>`;
    btn.disabled = false;
  }
}
function miniChart(rain, tmin) {
  const W = 260, H = 96, m = 16, bw = (W - 2 * m) / 12, rmax = Math.max(...rain, 1), lo = Math.min(...tmin, -2), hi = Math.max(...tmin, 2);
  const y = (v) => H - 14 - ((v - lo) / (hi - lo)) * (H - 26);
  let s = `<svg viewBox="0 0 ${W} ${H}" class="f-chart" role="img" aria-label="${tm("lluvia")} / ${tm("tmin")}">`;
  rain.forEach((r, i) => { const h = (r / rmax) * (H - 26); s += `<rect x="${m + i * bw + 2}" y="${H - 14 - h}" width="${bw - 4}" height="${h}" rx="2" fill="#64b5f6"><title>${fmt(r)} mm</title></rect>`; });
  s += `<line x1="${m}" x2="${W - m}" y1="${y(0)}" y2="${y(0)}" stroke="#90a4ae" stroke-dasharray="3 3"/>`;
  s += `<polyline points="${tmin.map((t, i) => `${m + i * bw + bw / 2},${y(t)}`).join(" ")}" fill="none" stroke="#c62828" stroke-width="2"/>`;
  tmin.forEach((t, i) => (s += `<circle cx="${m + i * bw + bw / 2}" cy="${y(t)}" r="2.6" fill="${t < 0 ? "#1565c0" : "#c62828"}"><title>${fmt(t, 1)} °C</title></circle>`));
  MES[ML()].forEach((l, i) => (s += `<text x="${m + i * bw + bw / 2}" y="${H - 2}" text-anchor="middle" font-size="9" fill="currentColor">${l}</text>`));
  return s + `<text x="${m}" y="9" font-size="9" fill="#1e88e5">■ ${tm("lluvia")}</text><text x="${W - m}" y="9" font-size="9" text-anchor="end" fill="#c62828">— ${tm("tmin")}</text></svg>`;
}

// ---------------------------------------------------------------- búsqueda
function initSearch() {
  const q = $("#q"), out = $("#resultados");
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  let idx = null, idxD = null;
  q.addEventListener("input", () => {
    const t = norm(q.value.trim());
    if (t.length < 2) { out.innerHTML = ""; return; }
    idx = idx || C.puntos.map((p) => norm(p[4]));
    idxD = idxD || (C.distritos || []).map((d) => norm(`${d[2]} ${d[4]}`));
    const dis = [];
    for (let i = 0; i < idxD.length && dis.length < 4; i++) if (idxD[i].includes(t)) dis.push(C.distritos[i]);
    const hits = [];
    for (let i = 0; i < idx.length && hits.length < 10; i++) if (idx[i].includes(t)) hits.push(C.puntos[i]);
    out.innerHTML = hits.length || dis.length ? dis.map((d, k) => `<li><button type="button" data-d="${k}">🏛️ <b>${esc(d[2])}</b><small>${tm("distrito")} · ${esc(d[4])}, ${esc(C.deps[d[3]])}</small></button></li>`).join("")
      + hits.map((p, k) => `<li><button type="button" data-k="${k}"><i class="sw ${p[2] ? "nat" : "camp"}"></i>
      <b>${esc(p[4])}</b><small>${esc(C.dists[p[7]])}, ${esc(C.deps[p[5]])}</small></button></li>`).join("") : `<li class="small">${tm("sinRes")}</li>`;
    $$("button[data-d]", out).forEach((b) => (b.onclick = () => {
      const d = dis[+b.dataset.d], ll = L.latLng(d[1], d[0]);
      map.flyTo(ll, 11, { duration: 1 });
      map.once("moveend", () => openLugar(d[2], `${tm("distrito")} · ${d[4]}, ${C.deps[d[3]]}${d[5] ? ` · ${fmt(d[5])} m` : ""}`, ll));
    }));
    $$("button[data-k]", out).forEach((b) => (b.onclick = () => {
      const p = hits[+b.dataset.k];
      map.flyTo([p[1], p[0]], 12, { duration: 1 });
      const m = L.circleMarker([p[1], p[0]], { radius: 14, color: "#ffd54f", weight: 4, fill: false }).addTo(map);
      setTimeout(() => map.removeLayer(m), 4000);
      map.once("moveend", () => openPoint(p, L.latLng(p[1], p[0])));
    }));
  });
}

// ---------------------------------------------------------------- arranque
async function main() {
  setLang(LANG);
  $("#lang").value = LANG;
  applyStaticM();
  C = await (await fetch("data/comunidades.json")).json();
  $("#fuente").innerHTML = tm("fuente", { f: `<a href="${C.url}" target="_blank" rel="noopener">${esc(C.fuente)}</a>` });
  const deps = [...C.deps].sort((a, b) => a.localeCompare(b, "es"));
  $("#fDep").innerHTML = `<option value="">${tm("todos")}</option>` + deps.map((d) => `<option>${esc(d)}</option>`).join("");
  if (typeof L === "undefined" || typeof L.map !== "function") { $("#map").innerHTML = `<p class="small" style="padding:16px">${tm("climaError")}</p>`; $("#cargando").hidden = true; return; }
  map = L.map("map", { preferCanvas: true, zoomControl: true, minZoom: 4 });
  map.createPane("celdasPane").style.zIndex = 390; // las celdas debajo de los puntos
  canvas = L.canvas({ padding: 0.4, tolerance: 4 });
  canvasCeldas = L.canvas({ padding: 0.4, pane: "celdasPane" });
  // mapa base gris claro de Esri (no pide clave) con nombres de lugares encima
  const gris = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", { maxZoom: 16, attribution: "Mapa base: Esri, HERE, Garmin, © OpenStreetMap" });
  const nombres = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}", { maxZoom: 16, pane: "shadowPane" });
  base = L.layerGroup([gris, nombres]).addTo(map);
  sat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 18, attribution: "Imagen: Esri, Maxar" });
  // límites de cada departamento según sus puntos
  const all = L.latLngBounds([]);
  for (const p of C.puntos) { const d = C.deps[p[5]]; (depBounds[d] = depBounds[d] || L.latLngBounds([])).extend([p[1], p[0]]); all.extend([p[1], p[0]]); }
  depBounds.__all = all;
  map.fitBounds(all, { padding: [10, 10] });
  if (L.capaLimites) L.capaLimites(map); // departamentos y provincias
  drawSitios();
  refresh();
  $("#cargando").hidden = true;
  // dentro de un panel el tamaño final llega un instante después: volver a encuadrar el Perú
  setTimeout(() => { map.invalidateSize(); map.fitBounds(all, { padding: [10, 10] }); }, 250);
  $("#fCamp").onchange = $("#fNat").onchange = $("#fDist").onchange = () => refresh();
  $("#fDep").onchange = () => refresh(true);
  $("#lCeldas").onchange = (e) => { e.target.checked ? layerCeldas.addTo(map) : map.removeLayer(layerCeldas); legend(); };
  $("#lSitios").onchange = (e) => (e.target.checked ? layerSitios.addTo(map) : map.removeLayer(layerSitios));
  $("#lSat").onchange = (e) => { if (e.target.checked) { map.removeLayer(base); sat.addTo(map); } else { map.removeLayer(sat); base.addTo(map); } };
  $("#lang").onchange = () => { setLang($("#lang").value); applyStaticM(); $("#fuente").innerHTML = tm("fuente", { f: `<a href="${C.url}" target="_blank" rel="noopener">${esc(C.fuente)}</a>` }); refresh(); };
  initSearch();
}
main();
