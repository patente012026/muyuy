// Muyuy · vista técnica. Gráficos en SVG propio (sin librerías) para que funcionen sin conexión;

// solo el mapa necesita internet (Leaflet + teselas de NASA GIBS y de imagen satelital).
// Textos en español e inglés (i18n.js); en quechua se muestra en español porque son términos técnicos.
// Pestañas: Lugar, Clima, Comparar, Rotaciones, Plan, Mundo y Método. Las gráficas se dibujan a la medida de la pantalla.
"use strict";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const MES = () => MESES_I18N[LANG];
const AGRO = [7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6]; // ago → jul (índices de mes)
const F = { agua: 0, ingreso: 1, suelo: 2, riesgo: 3, rob: 4, nino: 5, seco: 6, ing: 7, ero: 8, soc: 9, vida: 10, grilla: 11 };
const ten = (x) => Math.floor(x * 10 + 0.5);
const fmt = (x, d = 0) => Number(x).toLocaleString(LOCALE[LANG], { minimumFractionDigits: d, maximumFractionDigits: d });
const cname = (cid) => { const c = D.cultivos[cid]; return (c.nombres && c.nombres[LANG]) || c.nombre; };
let D, T, map, ndviLayer;

// ---------------------------------------------------------------- utilidades SVG
const lin = (d0, d1, r0, r1) => (v) => r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0);
function niceMax(v) { const p = Math.pow(10, Math.floor(Math.log10(v || 1))); return Math.ceil(v / p) * p; }
function ticks(lo, hi, n = 4) { const s = (hi - lo) / n; return Array.from({ length: n + 1 }, (_, i) => lo + i * s); }
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function frame(W, H, m, y, yt, yfmt = (v) => fmt(v)) {
  let g = `<g class="grid">`;
  yt.forEach((t) => { g += `<line x1="${m.l}" x2="${W - m.r}" y1="${y(t)}" y2="${y(t)}"/><text x="${m.l - 6}" y="${y(t) + 4}" text-anchor="end">${yfmt(t)}</text>`; });
  return g + `</g>`;
}

// ancho real de la gráfica: en el celular, lo que cabe en la tarjeta. Así la letra se mantiene de 11 px y nada se sale.
// Antes tenían 620 px fijos: las chicas se agrandaban y había que deslizarlas de lado.
function anchoG(base) {
  const c = $("main .card:not(.fuera-tab):not([hidden])");
  if (!c) return base;
  const e = getComputedStyle(c), w = c.clientWidth - parseFloat(e.paddingLeft) - parseFloat(e.paddingRight);
  return w > 0 && w < 640 ? Math.max(240, Math.round(w)) : base;
}
const esAngosta = (W) => W < 640;
const mesTxt = (mi, k, bw) => (bw < 21 && k % 2 ? "" : MES()[mi].slice(0, 3)); // si no caben los 12 meses, uno sí y uno no
const anioKey = (c) => String(c.humedad || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function botones(box, opciones, actual, alElegir) {
  box.innerHTML = opciones.map(([v, t]) => `<button type="button" data-v="${v}" aria-pressed="${String(v) === String(actual)}">${t}</button>`).join("");
  $$("button", box).forEach((b) => (b.onclick = () => alElegir(b.dataset.v)));
}

// tooltip compartido: con el mouse al pasar; en el celular, al tocar (con margen, porque las marcas son chicas)
const tip = $("#tip");
let marcada = null;
function verTip(t, x, y) {
  tip.innerHTML = t.dataset.tip;
  tip.hidden = false;
  tip.style.left = Math.max(8, Math.min(x + 14, window.innerWidth - tip.offsetWidth - 8)) + "px";
  const arriba = y - tip.offsetHeight - 14;
  tip.style.top = (arriba > 8 ? arriba : y + 18) + "px";
}
function ocultarTip() {
  tip.hidden = true;
  if (marcada) { marcada.classList.remove("marcado"); marcada = null; }
}
document.addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return;
  const t = e.target.closest && e.target.closest("[data-tip]");
  if (!t) { if (!marcada) tip.hidden = true; return; }
  verTip(t, e.clientX, e.clientY);
});
function marcaCercana(x, y, svg) {
  for (const r of [0, 5, 10, 15]) for (const [dx, dy] of r ? [[r, 0], [-r, 0], [0, r], [0, -r], [r, r], [-r, -r], [r, -r], [-r, r]] : [[0, 0]]) {
    const el = document.elementFromPoint(x + dx, y + dy), t = el && el.closest("[data-tip]");
    if (t && svg.contains(t)) return t;
  }
  return null;
}
document.addEventListener("click", (e) => {
  const svg = e.target.closest && e.target.closest(".chart svg");
  if (!svg) { if (!e.target.closest || !e.target.closest("#tip")) ocultarTip(); return; }
  const t = marcaCercana(e.clientX, e.clientY, svg);
  ocultarTip();
  if (!t) return;
  if (t.dataset.seq) { verRotacion(t.dataset.seq); }
  else verTip(t, e.clientX, e.clientY);
  t.classList.add("marcado");
  marcada = t;
});
addEventListener("scroll", () => { if (!tip.hidden) ocultarTip(); }, { passive: true });

// ---------------------------------------------------------------- pestañas
const TABS = [["lugar", "tabLugar"], ["clima", "tabClima"], ["comparar", "tabComparar"], ["rotaciones", "tabRot"], ["plan", "tabPlan"], ["mundo", "tabMundo"]];
let tabAct = "lugar";
function pintarTabs() {
  $("#tabs").innerHTML = TABS.map(([id, k]) => `<button type="button" role="tab" data-t="${id}" aria-selected="${id === tabAct}">${LT(k)}</button>`).join("");
  $$("#tabs button").forEach((b) => (b.onclick = () => irTab(b.dataset.t)));
  revisarTabs();
}
function revisarTabs() { // una pestaña sin nada que mostrar no aparece
  $$("#tabs button").forEach((b) => { b.hidden = !$$(`main .card[data-tab="${b.dataset.t}"]`).some((c) => !c.hidden); });
}
function irTab(id, subir = true) {
  tabAct = id;
  $$("main .card").forEach((c) => c.classList.toggle("fuera-tab", c.dataset.tab !== id));
  $$("#tabs button").forEach((b) => {
    const on = b.dataset.t === id;
    b.setAttribute("aria-selected", on);
    if (on && subir) b.scrollIntoView({ inline: "center", block: "nearest" });
  });
  ocultarTip();
  if (subir) { const y = $("#tabs").offsetTop; if (window.scrollY > y) window.scrollTo(0, y); }
  if (id === "lugar" && map && map.invalidateSize) setTimeout(() => map.invalidateSize(), 30);
}

// ---------------------------------------------------------------- ranking (mismo cálculo que la vista del agricultor)
function weights() {
  let w = { agua: 5, ingreso: 5, suelo: 5, riesgo: 5 };
  try { const s = JSON.parse(localStorage.getItem("muyuy-pesos")); if (s) w = s; } catch {}
  const t = Object.values(w).reduce((a, b) => a + b, 0) || 1;
  const o = {}; for (const k in w) o[k] = w[k] / t; return o;
}
function ranked() {
  const w = weights();
  let maxD = 1; try { maxD = +(localStorage.getItem("muyuy-maxdesc") ?? 1); } catch {}
  const out = Object.entries(D.rotaciones)
    .filter(([s]) => s.split("|").filter((c) => c === "descanso" || (D.cultivos[c] || {}).grupo === "cobertura").length <= maxD)
    .map(([s, v]) => [s, v, w.agua * v[0] + w.ingreso * v[1] + w.suelo * v[2] + w.riesgo * v[3]])
    .sort((a, b) => b[2] - a[2]);
  // como en app.js: primero las que funcionan al menos el 60 % de lo que logra la mejor (v[4] = robustez)
  const piso = 0.6 * Math.max(0, ...out.map((x) => x[1][4]));
  return out.filter((x) => x[1][4] >= piso).concat(out.filter((x) => x[1][4] < piso));
}
const nameSeq = (s) => s.split("|").map(cname).join(" → ");

// ---------------------------------------------------------------- 1. mapa
function compositeDates() {
  // fechas de inicio de las composiciones de 16 días de MOD13 (día juliano 1, 17, 33, …) de la última campaña
  const out = [];
  const camp = new Date().getFullYear() - (new Date().getMonth() < 7 ? 2 : 1);
  for (const y of [camp, camp + 1]) {
    for (let doy = 1; doy <= 353; doy += 16) {
      const d = new Date(Date.UTC(y, 0, doy));
      if ((y === camp && d.getUTCMonth() >= 8) || (y === camp + 1 && d.getUTCMonth() <= 6)) out.push(d.toISOString().slice(0, 10));
    }
  }
  return out;
}
let pararAnimacion = null, marcasMapa = [];
const capasNdvi = new Map();
function marcarPunto(lat, lon) {
  marcasMapa.push(L.circleMarker([lat, lon], { radius: 7, color: "#fff", weight: 2, fillColor: "#5d4037", fillOpacity: 1 }).addTo(map).bindTooltip(LT("punto")));
}
function initMap() {
  const facts = $("#facts");
  const c = D.contexto, h = T.hidro;
  const nd = T.ndvi;
  let ndTxt = "";
  if (nd) {
    const pick = (ms) => { const v = nd.fecha.map((f, i) => [+f.slice(5, 7), nd.ndvi[i]]).filter(([m]) => ms.includes(m)).map(([, x]) => x); return v.reduce((a, b) => a + b, 0) / v.length; };
    ndTxt = `<li>${LT("ndviMedio", { a: fmt(pick([2, 3]), 2), b: fmt(pick([8, 9]), 2) })}</li>`;
  }
  const may = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const fila = (k, v, txt, nota) => `<li class="f-r">${txt || may(LT(k))}: <b>${v}</b>${nota ? ` <small>(${nota})</small>` : ""}</li>`; // una línea por dato: «Altura: 138 m»
  facts.innerHTML = `
    ${fila("coord", `${T.lat.toFixed(3)}, ${T.lon.toFixed(3)}`)}
    ${fila("alturaSrtm", `${c.altura} m`)}${fila("pend", `${c.pendiente} %`)}
    <li class="f-g">${LT("sueloSG")}</li>
    ${fila("arena", `${fmt(T.suelo.sand)} %`)}${fila("arcilla", `${fmt(T.suelo.clay)} %`)}${fila("corg", `${fmt(T.suelo.soc, 1)} g/kg`)}
    ${T.suelo.phh2o != null ? fila(null, fmt(T.suelo.phh2o, 1), "pH") : ""}
    ${fila("adt", `${fmt(h.adt_mm_m)} mm/m`, null, `CC ${h.cc} · PMP ${h.pmp}`)}${ndTxt}`;
  renderTriTex();

  const sel = $("#ndviDate");
  const dates = compositeDates();
  sel.innerHTML = dates.map((d) => `<option value="${d}">${d}</option>`).join("");
  const peak = dates.find((d) => d.slice(5, 7) === "03") || dates[dates.length - 1];
  sel.value = peak;

  if (typeof L === "undefined" || typeof L.map !== "function") {
    $("#map").innerHTML = `<p class="hint" style="padding:16px">${LT("sinMapa")}</p>`;
    return;
  }
  if (pararAnimacion) pararAnimacion();
  // el mapa se crea una sola vez; antes se destruía en cada cambio y volvía a bajar todas sus imágenes
  if (!map) {
    map = L.map("map", { scrollWheelZoom: false, preferCanvas: true }).setView([T.lat, T.lon], 12);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 18, keepBuffer: 4, attribution: "Imagen: Esri, Maxar, Earthstar Geographics",
    }).addTo(map);
    if (L.capaLimites) L.capaLimites(map); // departamentos, provincias y distritos (puntos.js)
    map.on("click", (e) => elegirPunto(e.latlng.lat, e.latlng.lng));
    map.on("focus", () => map.scrollWheelZoom.enable()); // la rueda del ratón acerca después de tocar el mapa, sin secuestrar la página
    map.on("blur", () => map.scrollWheelZoom.disable());
  } else map.setView([T.lat, T.lon], map.getZoom(), { animate: false });
  const gibs = (d) => L.tileLayer(`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_L3_NDVI_16Day/default/${d}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`, {
    maxNativeZoom: 9, maxZoom: 18, opacity: 0.45, attribution: "NDVI: NASA GIBS / Modis Terra",
  });
  // cada fecha es una capa guardada: la animación baja por adelantado las que siguen y no se detiene a esperar
  capasNdvi.forEach((c) => map.removeLayer(c));
  capasNdvi.clear();
  const capa = (d) => { if (!capasNdvi.has(d)) capasNdvi.set(d, gibs(d).setOpacity(0).addTo(map)); return capasNdvi.get(d); };
  ndviLayer = capa(sel.value).setOpacity($("#ndviOn").checked ? 0.45 : 0);
  // etiqueta sobre el mapa: fecha de la imagen y NDVI de la parcela en ese mes (serie MOD13Q1 2001 al 16 oct 2026)
  const etiqueta = (d) => {
    const [y, m] = d.split("-").map(Number);
    let v = null;
    if (nd) { const i = nd.fecha.findIndex((f) => +f.slice(0, 4) === y && +f.slice(5, 7) === m); if (i >= 0) v = nd.ndvi[i]; }
    $("#mapFecha").innerHTML = `<b>${MES()[m - 1]} ${y}</b>${v != null ? ` · ${LT("ndviDe", { v: fmt(v, 2) })}` : ""}`;
    $("#mapProg").style.width = `${((dates.indexOf(d) + 1) / dates.length) * 100}%`;
  };
  // cambio de imagen sin parpadeo: la nueva capa se agrega invisible y se muestra cuando terminó de cargar
  const mostrar = (d) => new Promise((ok) => {
    sel.value = d;
    etiqueta(d);
    if (!$("#ndviOn").checked) { ok(); return; }
    const nueva = capa(d), vieja = ndviLayer, i = dates.indexOf(d);
    let listo = false;
    const fin = () => { if (listo) return; listo = true; if (vieja && vieja !== nueva) vieja.setOpacity(0); nueva.setOpacity(0.45); ndviLayer = nueva; ok(); };
    [1, 2, 3].forEach((k) => { if (dates[i + k]) capa(dates[i + k]); }); // las 3 siguientes se bajan mientras se mira esta
    if (!nueva.isLoading()) fin(); else { nueva.once("load", fin); setTimeout(fin, 1200); } // sin internet o lenta, igual avanza
  });
  sel.onchange = () => { pararPlay(); pausadoEn = -1; mostrar(sel.value); };
  etiqueta(sel.value);
  // ▶ recorre la campaña de septiembre a julio, una imagen de 16 días cada ~1 s
  let tocando = false, pausadoEn = -1; // si se pausa a mitad, ▶ sigue desde ahí; si no, empieza en septiembre
  const btn = $("#playNdvi");
  const pararPlay = () => { tocando = false; btn.textContent = LT("playNdvi"); btn.classList.remove("on"); };
  pararAnimacion = pararPlay;
  btn.onclick = async () => {
    if (tocando) { pararPlay(); pausadoEn = dates.indexOf(sel.value); return; }
    tocando = true;
    btn.textContent = LT("pausaNdvi");
    btn.classList.add("on");
    let i = pausadoEn >= 0 && pausadoEn < dates.length - 1 ? pausadoEn : -1;
    pausadoEn = -1;
    while (tocando && ++i < dates.length) {
      await mostrar(dates[i]);
      await new Promise((r) => setTimeout(r, 450));
    }
    if (tocando) pararPlay();
  };
  $("#ndviOn").onchange = (e) => ndviLayer.setOpacity(e.target.checked ? 0.45 : 0);
  marcasMapa.forEach((m) => m.remove());
  marcasMapa = [];
  marcarPunto(T.lat, T.lon);
  if (T.punto_suelo) {
    const p = [T.punto_suelo.lat, T.punto_suelo.lon];
    marcasMapa.push(L.circle(p, { radius: 125, color: "#ffeb3b", weight: 2, fill: false }).addTo(map).bindTooltip(LT("pixel")));
  }
  $("#mapNote").textContent = (T.punto_suelo ? LT("mapNote") + " " : "") + LT("tocaMapa"); // el círculo amarillo solo existe en los sitios piloto
}

// ---------------------------------------------------------------- 2. NDVI
let ndviAnios = null; // cuántos años se ven; en el celular, 5: 25 años en 330 px no se leen
function ndviCharts() {
  const nd = T.ndvi;
  if (!nd) { $("#secNdvi").hidden = true; $("#ndviRango").innerHTML = ""; revisarTabs(); return; }
  $("#secNdvi").hidden = false;
  revisarTabs();
  const W = anchoG(900), H = esAngosta(W) ? 170 : 230, m = { l: esAngosta(W) ? 34 : 40, r: 10, t: 10, b: 24 };
  const ult = Date.parse(nd.fecha[nd.fecha.length - 1]), total = (ult - Date.parse(nd.fecha[0])) / 31557600000;
  if (ndviAnios === null) ndviAnios = esAngosta(W) ? 5 : 0;
  if (total > 6) botones($("#ndviRango"), [[5, LT("ndvi5")], ...(total > 11 ? [[10, LT("ndvi10")]] : []), [0, LT("ndviTodo")]], ndviAnios, (v) => { ndviAnios = +v; ndviCharts(); });
  else $("#ndviRango").innerHTML = "";
  const desde = ndviAnios && total > 6 ? ult - ndviAnios * 31557600000 : -Infinity;
  const fil = nd.fecha.map((f, i) => [Date.parse(f), nd.ndvi[i], f]).filter(([v]) => v >= desde);
  const t = fil.map((f) => f[0]);
  const x = lin(t[0], t[t.length - 1], m.l, W - m.r), y = lin(0, 1, H - m.b, m.t);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="NDVI Modis">` + frame(W, H, m, y, ticks(0, 1, 4), (v) => fmt(v, 2));
  const salto = t.length && (t[t.length - 1] - t[0]) / 31557600000 > 12 ? 5 : (t[t.length - 1] - t[0]) / 31557600000 > 6 ? 2 : 1;
  for (let yr = new Date(t[0]).getFullYear() + 1; yr <= new Date(t[t.length - 1]).getFullYear(); yr++) {
    const xx = x(Date.UTC(yr, 0, 1));
    if (yr % salto === 0) s += `<text x="${xx}" y="${H - 6}" text-anchor="middle">${yr}</text>`;
  }
  const pts = fil.map(([v, n]) => `${x(v).toFixed(1)},${y(n).toFixed(1)}`).join(" ");
  s += `<polyline points="${pts}" fill="none" stroke="var(--series-1)" stroke-width="1.6" stroke-linejoin="round"/>`;
  const step = (W - m.l - m.r) / t.length;
  fil.forEach(([v, n, f]) => { s += `<rect class="hit" x="${x(v) - step / 2}" y="${m.t}" width="${step + 0.5}" height="${H - m.t - m.b}" data-tip="${f}<br>NDVI <b>${fmt(n, 2)}</b>"/>`; });
  $("#ndviChart").innerHTML = s + `</svg>`;

  // estacionalidad: mediana por mes, en orden agrícola
  const byM = Array.from({ length: 12 }, () => []);
  nd.fecha.forEach((f, i) => byM[+f.slice(5, 7) - 1].push(nd.ndvi[i]));
  const med = byM.map((a) => { const b = [...a].sort((p, q) => p - q); return b.length ? b[Math.floor(b.length / 2)] : 0; });
  const W2 = anchoG(520), H2 = esAngosta(W2) ? 150 : 170, m2 = { l: 34, r: 8, t: 8, b: 22 };
  const topN = Math.ceil(Math.max(...med) * 10) / 10;
  const y2 = lin(0, topN, H2 - m2.b, m2.t), bw = (W2 - m2.l - m2.r) / 12;
  let s2 = `<svg viewBox="0 0 ${W2} ${H2}" role="img" aria-label="${LT("ndviMes")}">` + frame(W2, H2, m2, y2, ticks(0, topN, Math.round(topN * 10)), (v) => fmt(v, 1));
  AGRO.forEach((mi, k) => {
    const v = med[mi], xx = m2.l + k * bw + 3, top = y2(v);
    s2 += `<path d="M${xx},${H2 - m2.b} V${top + 4} q0,-4 4,-4 h${bw - 14} q4,0 4,4 V${H2 - m2.b} Z" fill="var(--series-1)" data-tip="${MES()[mi]}: NDVI <b>${fmt(v, 2)}</b>"/>`;
    s2 += `<text x="${xx + (bw - 6) / 2}" y="${H2 - 6}" text-anchor="middle">${mesTxt(mi, k, bw)}</text>`;
  });
  $("#ndviSeason").innerHTML = s2 + `</svg>`;
}

// ---------------------------------------------------------------- 3. clima
function climaCharts() {
  const c = T.clima_mensual;
  const W = anchoG(460), H = esAngosta(W) && W < 460 ? 190 : 220, m = { l: 36, r: 8, t: 22, b: 22 };
  const bw = (W - m.l - m.r) / 12;
  const top = niceMax(Math.max(...c.lluvia_mm, ...c.et0_mm));
  const y = lin(0, top, H - m.b, m.t);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${LT("s3a")}">` + frame(W, H, m, y, ticks(0, top, 4));
  let line = "";
  AGRO.forEach((mi, k) => {
    const xx = m.l + k * bw + 3, v = c.lluvia_mm[mi];
    s += `<path d="M${xx},${H - m.b} V${y(v) + 4} q0,-4 4,-4 h${bw - 14} q4,0 4,4 V${H - m.b} Z" fill="var(--series-1)" data-tip="${MES()[mi]}<br>${LT("lluviaT")} <b>${fmt(v)} mm</b><br>ET₀ <b>${fmt(c.et0_mm[mi])} mm</b>"/>`;
    s += `<text x="${xx + (bw - 6) / 2}" y="${H - 6}" text-anchor="middle">${mesTxt(mi, k, bw)}</text>`;
    line += `${xx + (bw - 6) / 2},${y(c.et0_mm[mi])} `;
  });
  s += `<polyline points="${line}" fill="none" stroke="var(--series-2)" stroke-width="2"/>`;
  AGRO.forEach((mi, k) => { const xx = m.l + k * bw + 3 + (bw - 6) / 2; s += `<circle cx="${xx}" cy="${y(c.et0_mm[mi])}" r="3.5" fill="var(--series-2)" stroke="var(--card)" stroke-width="1.5"/>`; });
  s += `<g transform="translate(${m.l},10)"><rect width="10" height="10" rx="2" fill="var(--series-1)" y="-8"/><text x="14" y="1">${LT("lluvia")}</text><rect x="64" width="10" height="10" rx="2" fill="var(--series-2)" y="-8"/><text x="78" y="1">${LT("et0")}</text></g>`;
  $("#climaAgua").innerHTML = s + `</svg>`;

  const lo = Math.floor(Math.min(...c.tmin_c, 0) / 5) * 5, hi = Math.ceil(Math.max(...c.tmax_c) / 5) * 5;
  const y2 = lin(lo, hi, H - m.b, m.t);
  let s2 = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${LT("s3b")}">` + frame(W, H, m, y2, ticks(lo, hi, (hi - lo) / 5), (v) => fmt(v) + "°");
  s2 += `<line x1="${m.l}" x2="${W - m.r}" y1="${y2(0)}" y2="${y2(0)}" stroke="var(--axis)" stroke-dasharray="4 3"/>`;
  const step = (W - m.l - m.r) / 12;
  const px = (k) => m.l + k * step + step / 2;
  for (const [key, col, name] of [["tmax_c", "var(--series-2)", "Tmax"], ["tmin_c", "var(--series-1)", "Tmin"]]) {
    s2 += `<polyline points="${AGRO.map((mi, k) => `${px(k)},${y2(c[key][mi])}`).join(" ")}" fill="none" stroke="${col}" stroke-width="2"/>`;
    AGRO.forEach((mi, k) => { s2 += `<circle cx="${px(k)}" cy="${y2(c[key][mi])}" r="4" fill="${col}" stroke="var(--card)" stroke-width="2" data-tip="${MES()[mi]} · ${name} <b>${fmt(c[key][mi], 1)} °C</b>"/>`; });
    const lastK = 11; s2 += `<text class="lbl" x="${px(lastK) - 4}" y="${y2(c[key][AGRO[lastK]]) - 8}" text-anchor="end">${name}</text>`;
  }
  AGRO.forEach((mi, k) => { s2 += `<text x="${px(k)}" y="${H - 6}" text-anchor="middle">${mesTxt(mi, k, step)}</text>`; });
  $("#climaTemp").innerHTML = s2 + `</svg>`;
  const cl = D.contexto.clima;
  const tmin = D.andina ? LT("notaTmin", { o: cl.tmin_offset }) : "";
  const riego = D.perfil.riego_mm ? LT("notaRiego", { r: D.perfil.riego_mm }) : "";
  $("#climaNote").textContent = LT("notaClima", { dt: `${cl.delta_t > 0 ? "+" : ""}${cl.delta_t}`, tmin, pf: cl.precip_factor, riego });
}

// ---------------------------------------------------------------- 4. comparador
function defaultCurrent() {
  if (D.andina) return ["papa", "cebada", "descanso"];
  return ["maiz_amarillo", "maiz_amarillo", "descanso"];
}
function fillSelectors() {
  const r = ranked();
  $("#selRec").innerHTML = r.slice(0, 15).map(([s], i) => `<option value="${s}">${i + 1}. ${nameSeq(s)}</option>`).join("");
  const crops = Object.entries(D.cultivos).filter(([, c]) => c.factible);
  const def = defaultCurrent();
  document.querySelectorAll(".selAct").forEach((sel, i) => {
    const prev = sel.value;
    sel.innerHTML = crops.map(([id]) => `<option value="${id}">${cname(id)}</option>`).join("");
    sel.value = crops.some(([id]) => id === prev) ? prev : crops.some(([id]) => id === def[i]) ? def[i] : crops[0][0];
  });
  document.querySelectorAll("#selRec, .selAct").forEach((s) => (s.onchange = () => { compare(); scatter(); }));
  const f = $("#scFiltro"), fv = f.value;
  f.innerHTML = `<option value="">${LT("scTodas")}</option>` + crops.filter(([id]) => id !== "descanso").map(([id]) => `<option value="${id}">${esc(cname(id))}</option>`).join("");
  f.value = crops.some(([id]) => id === fv) ? fv : "";
  f.onchange = scatter;
  $("#scDetalle").hidden = true;
  const w = weights();
  $("#pesos").textContent = LT("pesosUsados", { p: LT("pesosTxt", { a: Math.round(w.agua * 100), i: Math.round(w.ingreso * 100), s: Math.round(w.suelo * 100), r: Math.round(w.riesgo * 100) }) });
}

function compare() {
  const a = $("#selRec").value;
  const b = [...document.querySelectorAll(".selAct")].map((s) => s.value).join("|");
  const va = D.rotaciones[a], vb = D.rotaciones[b], pa = T.pasos[a], pb = T.pasos[b];
  if (!vb) { $("#cmpTable").innerHTML = `<tr><td>${LT("noDisp")}</td></tr>`; $("#multiples").innerHTML = ""; return; }
  const all = ranked(), pos = (s) => all.findIndex((x) => x[0] === s) + 1 || "—";
  const rows = [
    [LT("puestoP"), pos(a), pos(b), "min"],
    [LT("funciona10"), ten(va[F.rob]), ten(vb[F.rob]), "max"],
    [LT("nino10"), ten(va[F.nino]), ten(vb[F.nino]), "max"],
    [LT("seco10"), ten(va[F.seco]), ten(vb[F.seco]), "max"],
    [LT("ingMed"), va[F.ing], vb[F.ing], "max", 0],
    [LT("ingP10"), pa.ingreso_p10, pb.ingreso_p10, "max", 0],
    [LT("aguaCub"), pa.agua_media * 100, pb.agua_media * 100, "max", 0, "%"],
    [LT("nFinal"), pa.n_final, pb.n_final, "max", 0],
    [LT("soc"), va[F.soc], vb[F.soc], "max", 2],
    [LT("ero"), va[F.ero], vb[F.ero], "min", 1],
    [LT("vidaFin"), va[F.vida][2], vb[F.vida][2], "max", 0],
  ];
  let h = `<thead><tr><th></th><th><span class="sw s1"></span> ${LT("rec")}</th><th><span class="sw s2"></span> ${LT("act")}</th></tr></thead><tbody>`;
  for (const [lab, x, y, best, d = 0, u = ""] of rows) {
    const wa = best && (best === "max" ? x > y : x < y), wb = best && (best === "max" ? y > x : y < x);
    const f = (v) => (typeof v === "number" ? fmt(v, d) + u : esc(v));
    h += `<tr><td>${lab}</td><td class="${wa ? "win" : ""}">${f(x)}</td><td class="${wb ? "win" : ""}">${f(y)}</td></tr>`;
  }
  $("#cmpTable").innerHTML = h + "</tbody>";

  const metrics = [
    [LT("defAgua"), 0, 100, LT("menos")],
    [LT("nCub"), 2, 100, LT("mas")],
    [LT("rendRel"), 3, 100, LT("mas")],
    [LT("vida"), 6, 1, LT("mas")],
  ];
  botones($("#metricas"), metrics.map(([title], i) => [i, title]), metricaSel, (v) => { metricaSel = +v; compare(); });
  const [title, idx, mult, note] = metrics[metricaSel];
  const W = anchoG(560), H = 190, m = { l: 32, r: 6, t: 22, b: 22 };
  const vals = [pa.p.map((p) => p[idx] * mult), pb.p.map((p) => p[idx] * mult)];
  const top = 100, y = lin(0, top, H - m.b, m.t), gw = (W - m.l - m.r) / 3, bw = (gw - 14) / 2;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}"><text x="${W - m.r}" y="12" text-anchor="end">${note}</text>`;
  s += frame(W, H, m, y, [0, 50, 100]);
  for (let k = 0; k < 3; k++) {
    [0, 1].forEach((j) => {
      const v = Math.max(0, Math.min(top, vals[j][k])), xx = m.l + k * gw + 6 + j * (bw + 2), yy = y(v);
      const seq = [a, b][j].split("|")[k];
      s += `<path d="M${xx},${H - m.b} V${Math.min(yy + 4, H - m.b)} q0,-4 4,-4 h${bw - 8} q4,0 4,4 V${H - m.b} Z" fill="var(--series-${j + 1})" data-tip="${LT("campania", { n: k + 1 })} · ${esc(cname(seq))}<br>${title}: <b>${fmt(vals[j][k])}</b>"/>`;
    });
    s += `<text x="${m.l + k * gw + gw / 2}" y="${H - 6}" text-anchor="middle">${LT("campania", { n: k + 1 })}</text>`;
  }
  $("#multiples").innerHTML = s + `</svg>`;
}
let metricaSel = 0;

// ---------------------------------------------------------------- 5. mapa de calor del déficit
let heatF = "todos";
function heatmap() {
  const crops = Object.entries(D.cultivos).filter(([id, c]) => c.factible && id !== "descanso");
  const W = anchoG(900), ang = esAngosta(W), yrs = D.anios, rowH = ang ? 17 : 20, m = { l: ang ? 88 : 120, r: 4, t: 18, b: 20 }, H = m.t + crops.length * rowH + m.b;
  const cw = (W - m.l - m.r) / yrs.length, gap = cw < 8 ? 0.5 : 1;
  const bins = [0.1, 0.2, 0.3, 0.4, 0.5];
  const col = (v) => `var(--seq-${bins.filter((b) => v >= b).length})`;
  botones($("#heatFiltro"), [["todos", LT("hTodos")], ["nino", LT("hNino")], ["seco", LT("hSeco")]], heatF, (v) => { heatF = v; heatmap(); });
  const vale = (c) => heatF === "todos" || (heatF === "nino" ? c.enso === "El Niño" : anioKey(c) === "seco");
  const corto = (t) => (ang && t.length > 15 ? t.slice(0, 14) + "…" : t);
  let s = `<svg viewBox="0 0 ${W} ${H + 26}" role="img" aria-label="${LT("s5")}">`;
  D.clases.forEach((c, i) => { if (c.enso === "El Niño") s += `<text x="${m.l + i * cw + cw / 2}" y="${m.t - 5}" text-anchor="middle" style="font-size:8px" data-tip="${c.campania}/${String(c.campania + 1).slice(-2)}: El Niño">▲</text>`; });
  crops.forEach(([id], r) => {
    const d = T.campanias[id].deficit, hl = D.andina ? T.campanias[id].helada : T.campanias[id].exceso;
    const hlName = D.andina ? LT("perdHelada") : LT("perdExceso");
    s += `<text x="${m.l - 5}" y="${m.t + r * rowH + rowH - 5}" text-anchor="end">${esc(corto(cname(id)))}</text>`;
    d.forEach((v, i) => {
      s += `<rect x="${m.l + i * cw + gap / 2}" y="${m.t + r * rowH + 1}" width="${Math.max(cw - gap, 1)}" height="${rowH - 2}" rx="${cw < 8 ? 0.5 : 2}" fill="${col(v)}"${vale(D.clases[i]) ? "" : ' opacity=".14"'} data-tip="${esc(cname(id))} · ${LT("campaniaL")} ${yrs[i]}/${String(yrs[i] + 1).slice(-2)}<br>${LT("deficit")} <b>${fmt(v * 100)}%</b> · ${hlName} <b>${fmt(hl[i] * 100)}%</b><br>${D.clases[i].enso} · ${LT("anio")} ${D.clases[i].humedad}"/>`;
    });
  });
  const pasoA = cw < 6 ? 10 : 5;
  yrs.forEach((yv, i) => { if (yv % pasoA === 0) s += `<text x="${m.l + i * cw + cw / 2}" y="${m.t + crops.length * rowH + 14}" text-anchor="middle">${yv}</text>`; });
  const ly = H + 8, x0 = ang ? 0 : m.l, paso = ang ? W / 6 : 70;
  ["<10%", "10-20", "20-30", "30-40", "40-50", "≥50%"].forEach((t, i) => {
    s += `<rect x="${x0 + i * paso}" y="${ly}" width="${ang ? 10 : 16}" height="12" rx="2" fill="var(--seq-${i})"/><text x="${x0 + i * paso + (ang ? 13 : 20)}" y="${ly + 10}">${t}</text>`;
  });
  $("#heat").innerHTML = s + `</svg>`;
}

// ---------------------------------------------------------------- 6. dispersión de todas las rotaciones
function scatter() {
  const all = ranked(), top = new Set(all.slice(0, 3).map((x) => x[0]));
  const act = [...document.querySelectorAll(".selAct")].map((s) => s.value).join("|");
  const filtro = $("#scFiltro").value, lleva = (seq) => seq.split("|").includes(filtro);
  const W = anchoG(900), ang = esAngosta(W), H = ang ? 270 : 340, m = { l: 52, r: 12, t: 14, b: 38 };
  const ings = all.map((r) => r[1][F.ing]);
  const lo = Math.floor(Math.min(...ings) / 1000) * 1000, hi = Math.ceil(Math.max(...ings) / 1000) * 1000;
  const x = lin(0, 100, m.l, W - m.r), y = lin(lo, hi, H - m.b, m.t);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${LT("s6")}">` + frame(W, H, m, y, ticks(lo, hi, 4), (v) => "S/ " + fmt(v));
  [0, 25, 50, 75, 100].forEach((t) => { s += `<text x="${x(t)}" y="${H - 20}" text-anchor="middle">${t}%</text>`; });
  s += `<text x="${(m.l + W - m.r) / 2}" y="${H - 4}" text-anchor="middle">${LT("robEje")}</text>`;
  const dot = (seq, v, fill, r, label, extra = "") => {
    const jx = ((seq.length * 7) % 9) / 9 - 0.5; // pequeño desplazamiento para separar puntos iguales
    return `<circle cx="${x(v[F.rob] * 100) + jx * 4}" cy="${y(v[F.ing])}" r="${r}" fill="${fill}" stroke="var(--card)" stroke-width="1.5"${extra} data-seq="${seq}" data-tip="${esc(nameSeq(seq))}<br>${LT("funcionaTip", { n: ten(v[F.rob]) })} · S/ ${fmt(v[F.ing])}${LT("porHa")}${label ? "<br><b>" + label + "</b>" : ""}"/>`;
  };
  const resto = all.filter(([seq]) => !top.has(seq) && seq !== act);
  if (filtro) {
    muestra(resto.filter(([q]) => !lleva(q)), 300).forEach(([seq, v]) => { s += dot(seq, v, "var(--axis)", 2.5, "", ' opacity=".22"'); });
    muestra(resto.filter(([q]) => lleva(q))).forEach(([seq, v]) => { s += dot(seq, v, "#2e7d32", 4, ""); });
  } else muestra(resto).forEach(([seq, v]) => { s += dot(seq, v, "var(--axis)", ang ? 3 : 3.5, ""); });
  all.slice(0, 3).forEach(([seq, v], i) => {
    s += dot(seq, v, "var(--series-1)", ang ? 6 : 7, LT("opcion", { i: i + 1 }));
    s += `<text class="lbl" x="${x(v[F.rob] * 100) - 10}" y="${y(v[F.ing]) - 10 - i * 12}" text-anchor="end">${i + 1}</text>`;
  });
  if (D.rotaciones[act]) {
    const v = D.rotaciones[act];
    s += dot(act, v, "var(--series-2)", ang ? 6 : 7, LT("suActual"));
    s += `<text class="lbl" x="${x(v[F.rob] * 100) + (v[F.rob] > 0.8 ? -10 : 10)}" y="${y(v[F.ing]) + 4}"${v[F.rob] > 0.8 ? ' text-anchor="end"' : ""}>${LT("actual")}</text>`;
  }
  $("#scatter").innerHTML = s + `</svg>`;
  $("#scLey").innerHTML = `<span><i style="background:var(--series-1)"></i>${LT("mejores")}</span><span><i style="background:var(--series-2)"></i>${LT("actual")}</span>` +
    (filtro ? `<span><i style="background:#2e7d32"></i>${esc(cname(filtro))}</span>` : `<span><i style="background:var(--axis)"></i>${LT("otras")}</span>`);
}
// tocar un punto: qué rotación es y un botón para llevarla a «Comparar»
function verRotacion(seq) {
  const v = D.rotaciones[seq], box = $("#scDetalle");
  if (!v) return;
  const pos = ranked().findIndex(([q]) => q === seq) + 1;
  box.innerHTML = `<b>${esc(nameSeq(seq))}</b><br>${LT("funcionaTip", { n: ten(v[F.rob]) })} · S/ ${fmt(v[F.ing])}${LT("porHa")}${pos ? ` · ${LT("puestoN", { n: fmt(pos) })}` : ""}<button type="button">${LT("scComparar")}</button>`;
  box.hidden = false;
  $("button", box).onclick = () => {
    const sel = $("#selRec");
    if (![...sel.options].some((o) => o.value === seq)) { const o = document.createElement("option"); o.value = seq; o.textContent = nameSeq(seq); sel.append(o); }
    sel.value = seq;
    compare(); scatter();
    irTab("comparar");
  };
}

// ---------------------------------------------------------------- 7. plan de campaña
function planTable() {
  const lang = I18N_TEC[LANG] ? LANG : "es", sel = $("#planCult"), prev = sel.value;
  const crops = Object.entries(D.cultivos).filter(([id, c]) => c.factible && id !== "descanso");
  sel.innerHTML = crops.map(([id]) => `<option value="${id}">${esc(cname(id))}</option>`).join("");
  const r = ranked()[0], primero = r && r[0].split("|").find((c) => crops.some(([id]) => id === c));
  sel.value = crops.some(([id]) => id === prev) ? prev : primero || (crops[0] && crops[0][0]) || "";
  const pintar = () => {
    const c = D.cultivos[sel.value];
    $("#planPasos").innerHTML = ((c && c.plan && (c.plan[lang] || c.plan.es)) || []).map((x) => `<li>${esc(Array.isArray(x) ? x[1] : x)}</li>`).join("");
  };
  sel.onchange = pintar;
  pintar();
}

// ---------------------------------------------------------------- idioma y arranque
function applyLangTec() {
  applyStatic(document, I18N_TEC);
  $("#lblLang").textContent = tr("idioma");
  $("#lblSite").textContent = tr("comunidad");
  $("#lnkBack").textContent = tr("vistaAgr");
  pintarTabs();
}
let renderTurno = 0;
async function renderAll() {
  const turno = ++renderTurno;
  for (const f of [initMap, ndviCharts, climaCharts, () => { fillSelectors(); compare(); }, heatmap, scatter, planTable, futuro, mundo]) {
    if (turno !== renderTurno) return; // ya se eligió otro lugar
    await f();
    await new Promise((r) => setTimeout(r, 0));
  }
  revisarTabs();
}
// al girar el teléfono las gráficas se vuelven a medir (el alto cambia solo al esconderse la barra del navegador: no cuenta)
let anchoVentana = window.innerWidth, tRedibujo = 0;
addEventListener("resize", () => {
  if (window.innerWidth === anchoVentana || !D) return;
  anchoVentana = window.innerWidth;
  clearTimeout(tRedibujo);
  tRedibujo = setTimeout(() => { ndviCharts(); climaCharts(); compare(); heatmap(); scatter(); futuro(); }, 200);
});
// en una nube de miles de puntos se dibuja una muestra pareja: se ve igual y el navegador no se traba
const muestra = (lista, max = 700) => (lista.length <= max ? lista : lista.filter((_, i) => i % Math.ceil(lista.length / max) === 0));

// ---------------------------------------------------------------- 8. clima de 2041-2060
async function gz(url) {
  const r = await fetch(url);
  const plano = "DecompressionStream" in window ? r.body.pipeThrough(new DecompressionStream("gzip")) : r.body;
  return new Response(plano).json();
}
let FUT = null, MUNDO = null;
// años en que funciona cada rotación en 2050: con el motor, aplicando el cambio de cada mes al clima del lugar. Lo guardado en
// el archivo es de una versión anterior de las rotaciones y solo se usa si no hay motor y el largo coincide.
const R2050 = new Map();
async function rob2050(s) {
  const p = D.perfil || {}, k = D.sitio + "#" + JSON.stringify([p.riego_mm, p.heladas_campanias, p.textura, p.terrazas, p.usa_abono]);
  if (R2050.has(k)) return R2050.get(k);
  let out = null;
  try {
    await MOTOR.cargar(D.sitio);
    const R = MOTOR.calcular(D.sitio, { cultivo_anterior: p.cultivo_anterior, heladas_campanias: p.heladas_campanias, granizo_anios: p.granizo_anios, riego_mm: p.riego_mm,
                                        textura: p.textura, terrazas: p.terrazas, usa_abono: p.usa_abono, clima: { meses: s.ssp245.mes } }, []).rotaciones;
    out = Object.fromEntries(Object.entries(R).map(([q, v]) => [q, v[F.rob] * 100]));
  } catch {
    const keys = D._ordenFut && D._ordenFut.length ? D._ordenFut : Object.keys(D.rotaciones);
    if (s.ssp245.r && s.ssp245.r.length === keys.length) { out = {}; keys.forEach((q, i) => { if (s.ssp245.r[i] >= 0) out[q] = s.ssp245.r[i]; }); }
  }
  R2050.set(k, out);
  return out;
}
async function futuro() {
  try { FUT = FUT || await gz("data/futuro.json.gz"); } catch { $("#secFuturo").hidden = true; revisarTabs(); return; }
  // la chacra exacta usa el cambio de su zona
  const cerca = !D.fuera_peru && T.lat != null ? cercano(T.lat, T.lon) : null;
  const s = FUT.sitios[D.sitio] || (cerca && FUT.sitios[cerca.id]);
  $("#secFuturo").hidden = !s;
  revisarTabs();
  if (!s) return;
  const esc2 = ["ssp245", "ssp585"], col = { ssp245: "var(--series-1)", ssp585: "var(--series-2)" };
  // cambio de cada mes (orden agrícola: agosto → julio)
  const W = anchoG(900), ang = esAngosta(W), H = ang ? 220 : 290, m = ang ? { l: 46, r: 34, t: 12, b: 24 } : { l: 48, r: 56, t: 12, b: 34 };
  const dT = (e, k) => (s[e].mes.dtmax[k] + s[e].mes.dtmin[k]) / 2, dP = (e, k) => 100 * (s[e].mes.pr[k] - 1);
  const tMax = Math.ceil(Math.max(...esc2.flatMap((e) => AGRO.map((k) => dT(e, k)))) * 2) / 2;
  const pAbs = Math.max(10, ...esc2.flatMap((e) => AGRO.map((k) => Math.abs(dP(e, k)))));
  const bw = (W - m.l - m.r) / 12, y = lin(0, tMax, H - m.b, m.t), yp = lin(-pAbs, pAbs, H - m.b, m.t);
  let g = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${LT("s8")}">` + frame(W, H, m, y, ticks(0, tMax, 4), (v) => `+${fmt(v, 1)} °C`);
  AGRO.forEach((k, i) => {
    esc2.forEach((e, j) => {
      const pad = Math.max(1, Math.min(6, bw * 0.12)), x0 = m.l + i * bw + pad + j * (bw - 2 * pad) / 2, v = dT(e, k);
      g += `<rect x="${x0}" y="${y(v)}" width="${Math.max(1.5, (bw - 2 * pad) / 2 - 0.5)}" height="${H - m.b - y(v)}" fill="${col[e]}" rx="2" data-tip="${MES()[k]} · ${LT(e)}: +${fmt(v, 1)} °C · ${LT("lluvia")} ${dP(e, k) > 0 ? "+" : ""}${fmt(dP(e, k))} %"/>`;
    });
    g += `<text x="${m.l + i * bw + bw / 2}" y="${H - (ang ? 7 : 14)}" text-anchor="middle">${mesTxt(k, i, bw)}</text>`;
  });
  // cambio de lluvia (SSP2-4.5) como línea sobre el eje derecho
  const pts = AGRO.map((k, i) => `${m.l + i * bw + bw / 2},${yp(dP("ssp245", k))}`).join(" ");
  g += `<polyline points="${pts}" fill="none" stroke="var(--series-3, #1565c0)" stroke-width="2.5"/>`;
  [-pAbs, 0, pAbs].forEach((t) => (g += `<text x="${W - m.r + 6}" y="${yp(t) + 4}">${t > 0 ? "+" : ""}${fmt(t)} %</text>`));
  $("#futLey").innerHTML = `<span><i style="background:${col.ssp245}"></i>${LT("ssp245")}</span><span><i style="background:${col.ssp585}"></i>${LT("ssp585")}</span><span><i class="lin" style="background:var(--series-3, #1565c0)"></i>${LT("lluviaFut")}</span>`;
  $("#futMes").innerHTML = g + `</svg>`;
  // todas las rotaciones: hoy (x) frente a 2050 (y)
  const r = await rob2050(s);
  $("#futScatter").hidden = !r;
  const pares = r ? Object.keys(D.rotaciones).filter((q) => r[q] != null).map((q) => [q, D.rotaciones[q][F.rob] * 100, r[q]]) : [];
  const mejor = pares.filter((p) => p[2] > p[1] + 4).length, peor = pares.filter((p) => p[2] < p[1] - 4).length;
  const W2 = anchoG(900), H2 = esAngosta(W2) ? 280 : 340, m2 = { l: 40, r: 14, t: 14, b: 38 }, x = lin(0, 100, m2.l, W2 - m2.r), yy = lin(0, 100, H2 - m2.b, m2.t);
  let sc = `<svg viewBox="0 0 ${W2} ${H2}" role="img" aria-label="${LT("futScatter")}">` + frame(W2, H2, m2, yy, [0, 25, 50, 75, 100], (v) => `${v}%`);
  [0, 25, 50, 75, 100].forEach((t) => (sc += `<text x="${x(t)}" y="${H2 - 20}" text-anchor="middle">${t}%</text>`));
  sc += `<text x="${(m2.l + W2 - m2.r) / 2}" y="${H2 - 4}" text-anchor="middle">${LT("futEjeX")}</text>`;
  sc += `<line x1="${x(0)}" y1="${yy(0)}" x2="${x(100)}" y2="${yy(100)}" stroke="var(--axis)" stroke-dasharray="5 4"/>`;
  muestra(pares).forEach(([q, a, b]) => {
    const c = b > a + 4 ? "var(--good, #2e7d32)" : b < a - 4 ? "var(--bad, #c62828)" : "var(--axis)";
    sc += `<circle cx="${x(a)}" cy="${yy(b)}" r="${esAngosta(W2) ? 3 : 4}" fill="${c}" opacity=".8" data-tip="${esc(nameSeq(q))}<br>${LT("hoyFut", { a: ten(a / 100), b: ten(b / 100) })}"/>`;
  });
  sc += `<text x="${m2.l + 6}" y="${m2.t + 8}" class="lbl">${LT("futEjeY")}</text>`;
  $("#futScatter").innerHTML = sc + `</svg>`;
  $("#futResumen").innerHTML = LT("futResumen", { t1: fmt(s.ssp245.dT, 1), t2: fmt(s.ssp585.dT, 1), p1: `${s.ssp245.dP > 0 ? "+" : ""}${s.ssp245.dP}`, p2: `${s.ssp585.dP > 0 ? "+" : ""}${s.ssp585.dP}`, n: pares.length, m: mejor, p: peor });
}

// ---------------------------------------------------------------- 9. Muyuy fuera del Perú
async function mundo() {
  try { MUNDO = MUNDO || await gz("data/mundo.json.gz"); } catch { $("#secMundo").hidden = true; revisarTabs(); return; }
  const nombre = (c) => (c.nombres && c.nombres[LANG]) || c.nombre;
  const filas = Object.values(MUNDO).map((s) => {
    const cs = Object.values(s.cultivos).filter((c) => !["descanso", "cobertura"].includes(c.grupo)).sort((a, b) => a.siembra - b.siembra);
    const comida = Object.entries(s.rotaciones).filter(([q]) => q.split("|").every((c) => !["descanso", "cobertura"].includes((s.cultivos[c] || {}).grupo)));
    const [q, v] = comida.sort((a, b) => b[1][F.rob] - a[1][F.rob] || b[1][F.ing] - a[1][F.ing])[0] || ["", null];
    const e = s.enso_lluvia || {}, mm = e.meses || [];
    return `<details class="mu"><summary><span><b>${esc(s.nombre)}</b></span><small class="${e.nino < 0 ? "neg" : "pos"}">El Niño ${e.nino > 0 ? "+" : ""}${e.nino ?? ""} %</small></summary><dl>
      <dt>${LT("mClima")}</dt><dd>${fmt(s.contexto.altura)} m · ${fmt(s.clima_mes.P.reduce((a, b) => a + b, 0))} mm/año${mm.length ? ` · ${LT("mLluvias")}: ${MES()[mm[0] - 1].slice(0, 3)}–${MES()[mm[mm.length - 1] - 1].slice(0, 3)}` : ""}</dd>
      <dt>${LT("mCultivos")}</dt><dd>${cs.map((c) => `${esc(nombre(c))} (${MES()[c.siembra - 1].slice(0, 3)})`).join(", ")}</dd>
      ${q ? `<dt>${LT("mRot")}</dt><dd>${esc(q.split("|").map((c) => nombre(s.cultivos[c])).join(" → "))} · ${LT("funcionaTip", { n: ten(v[F.rob]) })}</dd>` : ""}</dl></details>`;
  }).join("");
  $("#mundoLista").innerHTML = filas;
}



// ---------------------------------------------------------------- cualquier lugar (no solo los 4 sitios piloto)
// Los sitios piloto traen su archivo técnico (data/<id>_tec.json). Para cualquier otro lugar —el que el agricultor
// eligió en su vista, una celda del mapa o su chacra exacta— el mismo motor de la vista del agricultor (motor.js)
// calcula aquí lo que piden los gráficos, con lo que contó el agricultor. El NDVI de los últimos 3 años se baja de la NASA.
let SITIOS_T = [], PILOTOS = new Set();
const leerLS = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const distKm = (a, b, c, d) => 111 * Math.hypot(a - c, (b - d) * Math.cos((a * Math.PI) / 180));
function cercano(lat, lon) {
  return SITIOS_T.filter((s) => s.lat != null && !s.ejemplo).reduce((m, s) => (!m || distKm(lat, lon, s.lat, s.lon) < distKm(lat, lon, m.lat, m.lon) ? s : m), null);
}
async function celdaT(id) {
  const [c, t] = await Promise.all([gz(`data/celdas/${id}.json.gz`), gz("data/celdas/textos.json.gz")]);
  return { ...c, textos: t };
}
// las rotaciones se calculan en otro hilo (motor_worker.js): el mapa y la página siguen respondiendo
let hiloT = null, hiloN = 0;
function calcularT(id, perfil, exacta) {
  const local = () => ({ R: MOTOR.calcular(id, perfil), cultivos: MOTOR.cultivos(id, perfil.riego_mm || 0) });
  if (exacta || !window.Worker || !location.protocol.startsWith("http")) return Promise.resolve(local()); // la chacra exacta vive en esta página
  return new Promise((ok) => {
    try {
      hiloT = hiloT || new Worker("motor_worker.js");
      const n = ++hiloN;
      hiloT.onmessage = (e) => { if (e.data.n === n) ok(e.data.ok ? { R: e.data.r, cultivos: e.data.cultivos } : local()); };
      hiloT.onerror = () => ok(local());
      hiloT.postMessage({ n, id, perfil: JSON.parse(JSON.stringify(perfil)), langs: ["es", "en", "qu"], campanias: true });
    } catch { ok(local()); }
  });
}
async function datosCalculados(id, punto) {
  if (typeof MOTOR === "undefined") throw new Error("sin motor");
  const ex = leerLS("muyuy-exacta");
  let base;
  if (ex && ex.id === id) { // la chacra exacta que el agricultor calculó en su vista
    base = await celdaT(ex.near);
    await MOTOR.cargar(ex.near);
    await MOTOR.desempaquetar(ex.bin);
    base = { ...base, sitio: id, parcela: true, contexto: { ...base.contexto, ...MOTOR.contexto(id), lugar: ex.nombre } };
    punto = punto || { lat: ex.lat, lon: ex.lon, nombre: ex.nombre };
  } else {
    base = await celdaT(id);
    await MOTOR.cargar(id);
  }
  const g = (leerLS("muyuy-perfil") || {})[id] || {}; // lo que contó el agricultor de ese lugar
  const perfil = { ...base.perfil, ...(g.resp || {}), ...(g.riego_mm != null ? { riego_mm: g.riego_mm } : {}) };
  const { R, cultivos } = await calcularT(id, perfil, !!(ex && ex.id === id));
  for (const [k, c] of Object.entries(cultivos)) if (!Object.keys(c.plan || {}).length && base.cultivos && base.cultivos[k]) c.plan = base.cultivos[k].plan;
  const d = { ...base, _ordenFut: Object.keys(base.rotaciones || {}), rotaciones: R.rotaciones, textos: R.textos, anios: R.anios, cultivos,
              n_total: Object.keys(R.rotaciones).length, perfil, calculado: true };
  if (d.perfil.rotacion_actual && !d.rotaciones[d.perfil.rotacion_actual]) d.perfil.rotacion_actual = null;
  const sg = MOTOR.suelo(id), cl = MOTOR.clima(id), sit = SITIOS_T.find((s) => s.id === id) || {};
  const campanias = {};
  for (const [k, a] of Object.entries(R._campanias)) campanias[k] = { deficit: a.deficit, helada: a.perdida_helada, exceso: a.perdida_exceso, lluvia: a.lluvia };
  // el paso a paso de una rotación se calcula la primera vez que un gráfico lo pide
  const pasos = new Proxy({}, { get: (o, q) => {
    if (typeof q !== "string") return undefined;
    if (!(q in o)) { const x = MOTOR.calcular(id, { ...perfil, solo: [q], detalle: true }, ["es"])._pasos || {}; o[q] = x[q] || null; }
    return o[q];
  } });
  const t = {
    sitio: id, lat: punto ? punto.lat : sg.lat ?? cl.lat ?? sit.lat, lon: punto ? punto.lon : sg.lon ?? cl.lon ?? sit.lon, punto_suelo: null,
    clima_mensual: { lluvia_mm: cl.meses.map((m) => m.p), et0_mm: cl.meses.map((m) => m.e), tmin_c: cl.meses.map((m) => m.tn),
                     tmax_c: cl.meses.map((m) => (m.tm != null ? Math.round((2 * m.tm - m.tn) * 10) / 10 : m.tn)) }, // máxima ≈ 2·media − mínima
    campanias, pasos, ndvi: null, hidro: sg.hidro, suelo: sg.suelo, calculado: true,
  };
  return [d, t];
}
// NDVI de los últimos 3 años en el punto (Modis MOD13Q1, servicio ORNL DAAC de la NASA), en tandas de 160 días
async function ndviReciente(lat, lon) {
  // de a 3 consultas a la vez y con tiempo límite: el servicio tarda unos 6 s por tramo y antes uno colgado dejaba todo sin verdor
  const clave = `muyuy-ndvi:${lat.toFixed(3)},${lon.toFixed(3)}`;
  try { const g = JSON.parse(localStorage.getItem(clave)); if (g && Date.now() - g.at < 7 * 864e5) return g.nd; } catch {}
  const ad = (d) => `A${d.getUTCFullYear()}${String(Math.floor((d - Date.UTC(d.getUTCFullYear(), 0, 0)) / 864e5)).padStart(3, "0")}`;
  const fin = Date.now(), tandas = [];
  for (let a = fin - 3 * 365 * 864e5; a < fin; a += 160 * 864e5) tandas.push([new Date(a), new Date(Math.min(fin, a + 159 * 864e5))]);
  const uno = async ([i, f]) => {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 25000);
    try {
      const r = await fetch(`https://modis.ornl.gov/rst/api/v1/MOD13Q1/subset?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&band=250m_16_days_NDVI&startDate=${ad(i)}&endDate=${ad(f)}&kmAboveBelow=0&kmLeftRight=0`,
        { headers: { Accept: "application/json" }, signal: ctl.signal });
      const j = await r.json(), k = parseFloat(j.scale) || 1e-4;
      return (j.subset || []).map((s) => [s.calendar_date, s.data && typeof s.data[0] === "number" && s.data[0] > -2000 ? Math.round(s.data[0] * k * 1000) / 1000 : null]);
    } catch { return []; } finally { clearTimeout(t); }
  };
  const res = [];
  for (let k = 0; k < tandas.length; k += 3) res.push(...(await Promise.all(tandas.slice(k, k + 3).map(uno))));
  const filas = res.flat().filter(([, v]) => v != null).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const nd = filas.length > 5 ? { fecha: filas.map((x) => x[0]), ndvi: filas.map((x) => x[1]), reciente: true } : null;
  if (nd) try { localStorage.setItem(clave, JSON.stringify({ at: Date.now(), nd })); } catch {}
  return nd;
}
const nombreLugar = (id, punto) => (punto && punto.nombre) || (SITIOS_T.find((s) => s.id === id) || {}).nombre || id;

async function loadSite(id, punto = null) {
  const nota = $("#calcNota");
  if (PILOTOS.has(id)) {
    [D, T] = await Promise.all([fetch(`data/${id}.json`).then((r) => r.json()), fetch(`data/${id}_tec.json`).then((r) => r.json())]);
    D._ordenFut = Object.keys(D.rotaciones || {});
    if (punto) { T = { ...T, lat: punto.lat, lon: punto.lon }; }
    if (nota) nota.hidden = true;
  } else {
    if (nota) { nota.hidden = false; nota.textContent = LT("calculando", { l: nombreLugar(id, punto) }); }
    await new Promise((r) => setTimeout(r, 30)); // deja ver el aviso antes del cálculo
    try { [D, T] = await datosCalculados(id, punto); }
    catch { if (nota) nota.textContent = LT("sinCalculo"); return; }
    if (nota) nota.hidden = true; // listo: el aviso se quita y el mapa sube
  }
  document.body.dataset.region = D.region || (D.andina ? "sierra" : "costa"); // colores de la región, como en la vista del agricultor
  try { localStorage.setItem("muyuy-sitio", id); } catch {}
  renderAll();
  if (!T.ndvi && T.lat != null && navigator.onLine !== false) { // lugares calculados aquí: el verdor reciente, de la NASA
    const sitio = T;
    ndviReciente(T.lat, T.lon).then((nd) => { if (nd && T === sitio) { T.ndvi = nd; ndviCharts(); } });
  }
}
// tocar el mapa elige ese punto: se usan los datos ya calculados más cercanos (como en la vista del agricultor)
async function elegirPunto(lat, lon) {
  const s = cercano(lat, lon);
  if (!s) return;
  const nombre = LT("puntoElegido", { lat: lat.toFixed(3), lon: lon.toFixed(3) });
  try { localStorage.setItem("muyuy-comunidad", JSON.stringify({ site: s.id, nombre, lat, lon, km: Math.round(distKm(lat, lon, s.lat, s.lon)), clase: "punto" })); } catch {}
  ponerOpcion(s.id, nombre);
  marcasMapa.forEach((m) => m.remove()); // el punto se ve de inmediato, antes de calcular
  marcasMapa = [];
  marcarPunto(lat, lon);
  await loadSite(s.id, { lat, lon, nombre });
}
function ponerOpcion(id, nombre) {
  const sel = $("#site");
  let o = sel.querySelector('option[data-elegido]');
  if (!o) { o = document.createElement("option"); o.dataset.elegido = "1"; sel.prepend(o); }
  o.value = id; o.textContent = LT("suLugar", { n: nombre });
  sel.value = id;
}

(async function main() {
  setLang(LANG);
  const langSel = $("#lang");
  langSel.value = LANG;
  langSel.onchange = () => { setLang(langSel.value); applyLangTec(); if (D) renderAll(); };
  applyLangTec();
  irTab("lugar", false);
  SITIOS_T = await (await fetch("data/sitios.json")).json();
  // los sitios piloto traen su archivo técnico; cualquier otro lugar se calcula aquí con el motor
  const pilotos = SITIOS_T.filter((s) => !s.grid && !s.ejemplo);
  PILOTOS = new Set(pilotos.map((s) => s.id));
  // la lista solo muestra «Su lugar»: el que eligió en la vista del agricultor (comunidad, punto del mapa o chacra exacta)
  // o, si todavía no eligió, el que tiene abierto allí. Para cambiarlo se toca el mapa.
  const sel = $("#site");
  const ch = leerLS("muyuy-comunidad"), ex = leerLS("muyuy-exacta");
  const fromUrl = new URLSearchParams(location.search).get("sitio");
  let abierto = null; try { abierto = localStorage.getItem("muyuy-sitio"); } catch {}
  const existe = (x) => x && SITIOS_T.some((s) => s.id === x && !s.ejemplo);
  let id, punto = null;
  if (existe(fromUrl)) id = fromUrl;
  else if (ch && ch.site) {
    id = ch.exacta && ex && ex.id ? ex.id : ch.site;
    punto = ch.lat != null ? { lat: ch.lat, lon: ch.lon, nombre: ch.nombre } : null;
  } else if (existe(abierto)) id = abierto;
  else { // todavía no eligió su chacra: no se muestra un lugar cualquiera
    $("main").innerHTML = `<section class="card tec-vacio"><h2>${LT("elijaT")}</h2><p>${LT("elijaX")}</p><a class="back" href="index.html">${LT("elijaBtn")}</a></section>`;
    return;
  }
  ponerOpcion(id, (punto && punto.nombre) || (ch && ch.site === id && ch.nombre) || nombreLugar(id));
  await loadSite(sel.value, punto);
})();

// ---------------------------------------------------------------- triángulo textural (USDA)
// 12 clases como polígonos en (arena %, arcilla %); el limo es el resto. Marca el suelo del mapa satelital y, si el
// agricultor respondió la entrevista, su respuesta y la mezcla 50/50 que usa el cálculo (muyuy/soil.py)
const TEX_USDA = [
  ["arcilla", [[0, 100], [0, 60], [20, 40], [45, 40], [45, 55]]], ["arcillaLimosa", [[0, 60], [0, 40], [20, 40]]],
  ["arcillaArenosa", [[45, 55], [45, 35], [65, 35]]], ["francoArcilloso", [[20, 40], [20, 27], [45, 27], [45, 40]]],
  ["francoArcilloLimoso", [[0, 40], [0, 27], [20, 27], [20, 40]]], ["francoArcilloArenoso", [[45, 35], [45, 27], [52, 20], [80, 20], [65, 35]]],
  ["franco", [[45, 27], [23, 27], [43, 7], [52, 7], [52, 20]]], ["francoLimoso", [[23, 27], [0, 27], [0, 12], [8, 12], [20, 0], [50, 0], [43, 7]]],
  ["limo", [[0, 12], [0, 0], [20, 0], [8, 12]]], ["francoArenoso", [[70, 0], [50, 0], [43, 7], [52, 7], [52, 20], [80, 20], [85, 15]]],
  ["arenaFranca", [[85, 0], [70, 0], [85, 15], [90, 10]]], ["arena", [[100, 0], [85, 0], [90, 10]]],
];
const TEX_AGR = { arenosa: [70, 10], franca: [40, 20], negra: [35, 25], arcillosa: [20, 45] }; // igual que TEXTURA_REPORTADA
function claseTex(a, c) {
  const P = [a, c];
  const dentro = (poly) => { let s = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > P[1]) !== (yj > P[1]) && P[0] < ((xj - xi) * (P[1] - yi)) / (yj - yi) + xi) s = !s; } return s; };
  return (TEX_USDA.find(([, poly]) => dentro(poly)) || [null])[0];
}
function renderTriTex() {
  const box = $("#triTex");
  if (!box || !T || !T.suelo || T.suelo.sand == null) { if (box) box.innerHTML = ""; return; }
  const W = 300, H = 260, X0 = 20, Y0 = 10;
  const xy = (a, c) => { const l = 100 - a - c; return [X0 + (a * 0 + l * W + c * W / 2) / 100, Y0 + (a * H + l * H + c * 0) / 100]; };
  const pts = (poly) => poly.map(([a, c]) => xy(a, c).map((v) => v.toFixed(1)).join(",")).join(" ");
  const guard = ((typeof leerLS === "function" && leerLS("muyuy-perfil")) || {})[D.sitio] || {}; // en los sitios piloto la respuesta solo está guardada
  const sat = [T.suelo.sand, T.suelo.clay], tx = (D.perfil && D.perfil.textura) || (guard.resp || {}).textura, agr = tx && TEX_AGR[tx];
  const mez = agr ? [(sat[0] + agr[0]) / 2, (sat[1] + agr[1]) / 2] : null;
  const marca = ([a, c], cls, r) => { const [x, y] = xy(a, c); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" class="${cls}"/>`; };
  const cuad = [20, 40, 60, 80].map((v) => `<polyline class="tt-g" points="${pts([[v, 0], [v, 100 - v]])}"/><polyline class="tt-g" points="${pts([[0, v], [100 - v, v]])}"/><polyline class="tt-g" points="${pts([[0, 100 - v], [100 - v, 0]])}"/>`).join("");
  const clases = TEX_USDA.map(([k, poly]) => `<polygon class="tt-c${claseTex(sat[0], sat[1]) === k ? " on" : ""}" points="${pts(poly)}"><title>${LT("tt_" + k)}</title></polygon>`).join("");
  const nombre = (p) => LT("tt_" + claseTex(p[0], p[1]));
  box.innerHTML = `<p class="tt-t"><b>${LT("ttT")}</b></p>
    <svg viewBox="0 0 ${W + 40} ${H + 40}" role="img" aria-label="${LT("ttT")}">${clases}${cuad}
      <text x="${X0}" y="${Y0 + H + 22}" class="tt-l">${LT("ttArena")}</text><text x="${X0 + W}" y="${Y0 + H + 22}" text-anchor="end" class="tt-l">${LT("ttLimo")}</text>
      <text x="${X0 + W / 2}" y="${Y0 - 1}" text-anchor="middle" class="tt-l" dy="-1">${LT("ttArcilla")}</text>
      ${agr ? marca(agr, "tt-agr", 6) + marca(mez, "tt-mez", 5) : ""}${marca(sat, "tt-sat", 6)}</svg>
    <ul class="tt-ley"><li><i class="tt-sat"></i>${LT("ttSat", { c: nombre(sat), a: fmt(sat[0]), r: fmt(sat[1]) })}</li>
      ${agr ? `<li><i class="tt-agr"></i>${LT("ttAgr", { t: tr("tex_" + tx), c: nombre(agr) })}</li><li><i class="tt-mez"></i>${LT("ttMez", { c: nombre(mez) })}</li>` : `<li class="tt-no">${LT("ttSinEnt")}</li>`}</ul>`;
}
Object.assign(I18N_TEC.es, { ttT: "Triángulo de texturas (USDA)", ttArena: "Arena", ttLimo: "Limo", ttArcilla: "Arcilla",
  ttSat: "Mapa satelital: {c} (arena {a} %, arcilla {r} %)", ttAgr: "Lo que dijo el agricultor: {t} ({c})", ttMez: "Usado en el cálculo, mitad y mitad: {c}",
  ttSinEnt: "Sin entrevista: el cálculo usa solo el mapa satelital.",
  tt_arcilla: "Arcilloso", tt_arcillaLimosa: "Arcillo limoso", tt_arcillaArenosa: "Arcillo arenoso", tt_francoArcilloso: "Franco arcilloso", tt_francoArcilloLimoso: "Franco arcillo limoso",
  tt_francoArcilloArenoso: "Franco arcillo arenoso", tt_franco: "Franco", tt_francoLimoso: "Franco limoso", tt_limo: "Limoso", tt_francoArenoso: "Franco arenoso", tt_arenaFranca: "Arena franca", tt_arena: "Arenoso", tt_null: "—" });
Object.assign(I18N_TEC.en, { ttT: "Soil texture triangle (USDA)", ttArena: "Sand", ttLimo: "Silt", ttArcilla: "Clay",
  ttSat: "Satellite map: {c} (sand {a} %, clay {r} %)", ttAgr: "What the farmer said: {t} ({c})", ttMez: "Used in the calculation, half and half: {c}",
  ttSinEnt: "No interview: the calculation uses only the satellite map.",
  tt_arcilla: "Clay", tt_arcillaLimosa: "Silty clay", tt_arcillaArenosa: "Sandy clay", tt_francoArcilloso: "Clay loam", tt_francoArcilloLimoso: "Silty clay loam",
  tt_francoArcilloArenoso: "Sandy clay loam", tt_franco: "Loam", tt_francoLimoso: "Silt loam", tt_limo: "Silt", tt_francoArenoso: "Sandy loam", tt_arenaFranca: "Loamy sand", tt_arena: "Sand", tt_null: "—" });
Object.assign(I18N_TEC.es, { elijaT: "Primero elija la chacra", elijaX: "La vista técnica muestra los datos del lugar que se elige en la vista del agricultor, en cualquier parte del Perú.", elijaBtn: "📍 Elegir la chacra en el mapa" });
Object.assign(I18N_TEC.en, { elijaT: "First choose the farm", elijaX: "The technical view shows the data of the place chosen in the farmer view, anywhere in Peru.", elijaBtn: "📍 Choose the farm on the map" });
