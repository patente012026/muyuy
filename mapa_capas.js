// Muyuy · mapa_capas.js: lo que pide el reto «Field Shift» para el mapa.
//  - Capas de la NASA (GIBS, sin cuenta) con línea de tiempo y botón de animar: lluvia GPM Imerg, humedad SMAP L4,
//    verdor Modis NDVI, temperatura de superficie Modis LST, agua guardada Grace/GRACE-FO y biomasa GEDI.
//  - Vulnerabilidad e ideas de rotación en las celdas de NASA Power (scripts/build_mapa_riesgos.py): heladas, estrés
//    hídrico, erosión de referencia, tendencia de la lluvia y la mejor rotación según lo que más le importa.
// Se pueden poner las dos a la vez (una capa de la NASA encima de las celdas) para compararlas.
"use strict";

Object.assign(M.es, {
  nasaT: "🛰️ Capas de la NASA", nasaNinguna: "Ninguna", nasaFecha: "Fecha", nasaOpac: "Transparencia", nasaAnimar: "▶ Animar", nasaParar: "⏸ Parar",
  riesgoT: "🧭 Riesgos e ideas de rotación", riesgoNinguna: "Ninguna", rHel: "❄️ Noches de helada al año", rAgua: "💧 Estrés hídrico (lluvia − ET0)",
  rEro: "⛰️ Riesgo de erosión", rTend: "📉 Tendencia de la lluvia desde 1981", rBest: "🌱 Mejor rotación si prioriza…",
  pAgua: "agua", pIngreso: "ingreso", pSuelo: "suelo", pRiesgo: "no perder",
  riesgoNota: "Cada cuadro es una celda de NASA Power (~55 km) con el clima de 1981 a 2026 bajado a la altura de su punto. Toque un cuadro para ver el detalle y abrirlo en Muyuy.",
  tHel: "{v} noches de helada al año ({f} fuertes, ≤ −3 °C)", tAgua: "Lluvia {p} mm · balance {b} mm al año", tEro: "Erosión de referencia: {v} t/ha al año (tolerable: 11)",
  tTend: "Lluvia: {v} mm por década ({c})", tClara: "tendencia clara", tNoClara: "sin tendencia clara", tBest: "Si prioriza {k}: {r} · funciona {n} de 10",
  tSinRiego: "Sin riego (o a esta altura) ninguna rotación funciona aquí: la chacra depende del riego o de cultivos que Muyuy aún no tiene.", abrirMuyuy: "Abrir en Muyuy",
  lyImerg: "Lluvia de ese día (GPM Imerg, 11 km)", lySmap: "Humedad del suelo en la raíz (SMAP L4, 9 km)", lyNdvi: "Verdor de las plantas (Modis NDVI, 250 m)",
  lyLst: "Temperatura de la superficie de día (Modis, 1 km)", lyGrace: "Agua guardada en la región (Grace/GRACE-FO, mensual)", lyGedi: "Biomasa sobre el suelo (GEDI 2019-2023)",
  dImerg: "Más azul o morado: más lluvia ese día.", dSmap: "Café: suelo seco · azul: suelo húmedo.", dNdvi: "Café: poca vegetación · verde oscuro: mucha.",
  dLst: "Azul: superficie fría · rojo: muy caliente.", dGrace: "Rojo: la región perdió agua frente a 2004-2009 · azul: ganó.", dGedi: "Más oscuro: más biomasa (bosque).",
  lgHel: ["0", "1-30", "30-90", "90-180", "> 180"], lgAgua: ["< −1000", "−1000 a −500", "−500 a 0", "0 a 500", "> 500"], lgEro: ["< 5", "5-11", "11-50", "> 50"],
  lgTend: ["baja (clara)", "baja", "sube", "sube (clara)"],
});
Object.assign(M.en, {
  nasaT: "🛰️ NASA layers", nasaNinguna: "None", nasaFecha: "Date", nasaOpac: "Opacity", nasaAnimar: "▶ Animate", nasaParar: "⏸ Stop",
  riesgoT: "🧭 Risks and rotation ideas", riesgoNinguna: "None", rHel: "❄️ Frost nights per year", rAgua: "💧 Water stress (rain − ET0)",
  rEro: "⛰️ Erosion risk", rTend: "📉 Rainfall trend since 1981", rBest: "🌱 Best rotation if you prioritise…",
  pAgua: "water", pIngreso: "income", pSuelo: "soil", pRiesgo: "not losing",
  riesgoNota: "Each square is a NASA Power cell (~55 km) with 1981-2026 weather brought down to its point's elevation. Tap a square for details and to open it in Muyuy.",
  tHel: "{v} frost nights per year ({f} hard, ≤ −3 °C)", tAgua: "Rain {p} mm · balance {b} mm per year", tEro: "Reference erosion: {v} t/ha per year (tolerable: 11)",
  tTend: "Rain: {v} mm per decade ({c})", tClara: "clear trend", tNoClara: "no clear trend", tBest: "If you prioritise {k}: {r} · works {n} of 10",
  tSinRiego: "Without irrigation (or at this altitude) no rotation works here: farming depends on irrigation or on crops Muyuy does not have yet.", abrirMuyuy: "Open in Muyuy",
  lyImerg: "Rain on that day (GPM Imerg, 11 km)", lySmap: "Root-zone soil moisture (SMAP L4, 9 km)", lyNdvi: "Plant greenness (Modis NDVI, 250 m)",
  lyLst: "Daytime land surface temperature (Modis, 1 km)", lyGrace: "Water stored in the region (Grace/GRACE-FO, monthly)", lyGedi: "Aboveground biomass (GEDI 2019-2023)",
  dImerg: "Bluer or purple: more rain that day.", dSmap: "Brown: dry soil · blue: wet soil.", dNdvi: "Brown: little vegetation · dark green: a lot.",
  dLst: "Blue: cold surface · red: very hot.", dGrace: "Red: the region lost water vs. 2004-2009 · blue: gained.", dGedi: "Darker: more biomass (forest).",
  lgHel: ["0", "1-30", "30-90", "90-180", "> 180"], lgAgua: ["< −1000", "−1000 to −500", "−500 to 0", "0 to 500", "> 500"], lgEro: ["< 5", "5-11", "11-50", "> 50"],
  lgTend: ["falling (clear)", "falling", "rising", "rising (clear)"],
});
if (M.qu) Object.assign(M.qu, { // runasimi (borrador)
  nasaT: "🛰️ NASA capakuna", nasaNinguna: "Mana mayqinpas", nasaFecha: "P'unchaw", nasaOpac: "Rikukuy", nasaAnimar: "▶ Kuyuchiy", nasaParar: "⏸ Sayachiy",
  riesgoT: "🧭 Peligrokuna, muyuy yuyaykunapas", riesgoNinguna: "Mana mayqinpas", rHel: "❄️ Watapi qasa tutakuna", rAgua: "💧 Yaku sasachakuy (para − ET0)",
  rEro: "⛰️ Allpa apakuy peligro", rTend: "📉 1981-manta parapa puriynin", rBest: "🌱 Aswan allin muyuy, munasqaykiman hina…",
  pAgua: "yaku", pIngreso: "qullqi", pSuelo: "allpa", pRiesgo: "mana chinkachiy",
  riesgoNota: "Sapa k'uchu NASA Powerpa k'uchunmi (~55 km), 1981-manta 2026-kama pachawan chiqanniykipa altunman uraykachisqa. Huk k'uchuta llamiy aswanta qhawanaykipaq Muyuypi kichanaykipaqpas.",
  tHel: "Watapi {v} qasa tuta ({f} sinchi, ≤ −3 °C)", tAgua: "Para {p} mm · watapi balance {b} mm", tEro: "Qhawana allpa apakuy: watapi {v} t/ha (aguantakun: 11)",
  tTend: "Para: sapa chunka watapi {v} mm ({c})", tClara: "sut'i puriy", tNoClara: "mana sut'i puriyniyuq", tBest: "{k} munaspaqa: {r} · chunkamanta {n} allin",
  tSinRiego: "Mana qarpayniyuq (utaq kay altupi) kaypiqa mana mayqin muyuypas allinchu: chakraqa qarpaymanta utaq Muyuy manaraq kapuq tarpuykunamanta.", abrirMuyuy: "Muyuypi kichay",
  lyImerg: "Chay p'unchawpa paran (GPM Imerg, 11 km)", lySmap: "Sapi kaqpi allpapa hump'iynin (SMAP L4, 9 km)", lyNdvi: "Yurakunapa q'omer kaynin (Modis NDVI, 250 m)",
  lyLst: "P'unchaw allpa hawapa q'oñiynin (Modis, 1 km)", lyGrace: "Regionpi waqaychasqa yaku (Grace/GRACE-FO, sapa killa)", lyGedi: "Allpa hawapi kawsaq kaykuna (GEDI 2019-2023)",
  dImerg: "Aswan anqas utaq kulli: chay p'unchaw aswan para.", dSmap: "Ch'umpi: ch'aki allpa · anqas: hump'i allpa.", dNdvi: "Ch'umpi: pisi yura · yana q'omer: achka.",
  dLst: "Anqas: chiri allpa hawa · puka: ancha q'oñi.", dGrace: "Puka: regionqa 2004-2009-manta yakuta chinkachirqan · anqas: yapakurqan.", dGedi: "Aswan yana: aswan kawsaq kaykuna (sacha).",
  lgHel: ["0", "1-30", "30-90", "90-180", "> 180"], lgAgua: ["< −1000", "−1000-manta −500-kama", "−500-manta 0-kama", "0-manta 500-kama", "> 500"], lgEro: ["< 5", "5-11", "11-50", "> 50"],
  lgTend: ["uraykun (sut'i)", "uraykun", "wichaykun", "wichaykun (sut'i)"],
});

(function () {
  // capas de NASA GIBS en la proyección del mapa (EPSG:3857); lag = días que tarda en publicarse
  const NASA = {
    imerg: { capa: "IMERG_Precipitation_Rate", tms: "GoogleMapsCompatible_Level6", z: 6, tipo: "dia", lag: 2, lab: "lyImerg", d: "dImerg" },
    smap: { capa: "SMAP_L4_Analyzed_Root_Zone_Soil_Moisture", tms: "GoogleMapsCompatible_Level6", z: 6, tipo: "dia", lag: 5, lab: "lySmap", d: "dSmap" },
    ndvi: { capa: "MODIS_Terra_NDVI_8Day", tms: "GoogleMapsCompatible_Level9", z: 9, tipo: "dia", lag: 10, paso: 8, lab: "lyNdvi", d: "dNdvi" },
    lst: { capa: "MODIS_Terra_Land_Surface_Temp_Day", tms: "GoogleMapsCompatible_Level7", z: 7, tipo: "dia", lag: 2, lab: "lyLst", d: "dLst" },
    grace: { capa: "GRACE_Tellus_Liquid_Water_Equivalent_Thickness_Mascon_CRI", tms: "GoogleMapsCompatible_Level6", z: 6, tipo: "mes", desde: [2002, 4], hasta: [2022, 6], lab: "lyGrace", d: "dGrace" },
    gedi: { capa: "GEDI_ISS_L4B_Aboveground_Biomass_Density_Mean_201904-202303", tms: "GoogleMapsCompatible_Level7", z: 7, tipo: "fijo", fecha: "2019-04-18", lab: "lyGedi", d: "dGedi" },
  };
  const COLG = { tuberculo: "#7b2cbf", raiz: "#b0399b", leguminosa: "#2e9d3e", cereal: "#f9a825", pseudocereal: "#ef6c00",
                 fibra: "#5c8fb3", hortaliza: "#c2185b", asociacion: "#7cb342", cobertura: "#00897b", descanso: "#a5d6a7" };
  const ESC = {
    hel: { c: ["rgba(0,0,0,0)", "#cfe3f7", "#8fbfe9", "#4a90d9", "#1f4e9c"], v: (x) => (x.h0 < 1 ? 0 : x.h0 < 30 ? 1 : x.h0 < 90 ? 2 : x.h0 < 180 ? 3 : 4), lg: "lgHel" },
    agua: { c: ["#b2182b", "#ef8a62", "#fddbc7", "#a6d96a", "#1a9641"], v: (x) => (x.b < -1000 ? 0 : x.b < -500 ? 1 : x.b < 0 ? 2 : x.b < 500 ? 3 : 4), lg: "lgAgua" },
    ero: { c: ["#1a9641", "#fee08b", "#f46d43", "#a50026"], v: (x) => (x.ero == null ? -1 : x.ero < 5 ? 0 : x.ero < 11 ? 1 : x.ero < 50 ? 2 : 3), lg: "lgEro" },
    tend: { c: ["#d6604d", "#f4a582", "#92c5de", "#2166ac"], v: (x) => (x.tp < 0 ? (x.tpp < 0.05 ? 0 : 1) : (x.tpp < 0.05 ? 3 : 2)), lg: "lgTend" },
  };
  let R = null, capaR = null, capaN = null, anim = null;

  const hoy = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
  function fechaDe(cfg, v) {
    if (cfg.tipo === "fijo") return cfg.fecha;
    if (cfg.tipo === "mes") { const t = cfg.desde[0] * 12 + cfg.desde[1] - 1 + v; return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}-01`; }
    const d = hoy(); d.setUTCDate(d.getUTCDate() - cfg.lag - (365 - v)); return d.toISOString().slice(0, 10);
  }
  function rango(cfg) {
    if (cfg.tipo === "fijo") return [0, 0, 1];
    if (cfg.tipo === "mes") return [0, (cfg.hasta[0] - cfg.desde[0]) * 12 + cfg.hasta[1] - cfg.desde[1], 1];
    return [0, 365, cfg.paso || 1];
  }
  function ponerNasa() {
    if (capaN) { map.removeLayer(capaN); capaN = null; }
    const k = $("#nasaSel").value, cfg = NASA[k];
    $("#nasaCtl").hidden = !cfg;
    if (!cfg) { leyendaNasa(); return; }
    const [lo, hi, st] = rango(cfg), s = $("#nasaT");
    s.min = lo; s.max = hi; s.step = st;
    if (+s.value > hi || s.dataset.k !== k) s.value = hi;
    s.dataset.k = k;
    s.disabled = cfg.tipo === "fijo";
    const f = fechaDe(cfg, +s.value);
    $("#nasaF").textContent = cfg.tipo === "mes" ? f.slice(0, 7) : f;
    capaN = L.tileLayer(`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${cfg.capa}/default/${f}/${cfg.tms}/{z}/{y}/{x}.png`,
      { maxNativeZoom: cfg.z, maxZoom: 18, opacity: +$("#nasaO").value, attribution: "NASA GIBS / EOSDIS", pane: "nasaPane", crossOrigin: true }).addTo(map);
    leyendaNasa();
  }
  function leyendaNasa() {
    const k = $("#nasaSel").value, cfg = NASA[k];
    $("#nasaLey").innerHTML = cfg ? `<b>${tm(cfg.lab)}</b><br>${tm(cfg.d)}` : "";
    $("#nasaLey").hidden = !cfg;
  }
  function animar() {
    const b = $("#nasaAnim");
    if (anim) { clearInterval(anim); anim = null; b.textContent = tm("nasaAnimar"); return; }
    b.textContent = tm("nasaParar");
    const s = $("#nasaT"), st = +s.step || 1;
    const cfg = NASA[$("#nasaSel").value];
    const salto = cfg && cfg.tipo === "mes" ? 6 : Math.max(st, 7); // medio año en Grace, una semana en las diarias
    if (+s.value >= +s.max) s.value = s.min;
    anim = setInterval(() => {
      const v = Math.min(+s.max, +s.value + salto);
      s.value = v; ponerNasa();
      if (v >= +s.max) animar();
    }, 1400);
  }

  // ---------------------------------------------------------------- celdas: vulnerabilidad e ideas de rotación
  async function datosR() {
    if (!R) R = await (await fetch("data/mapa_riesgos.json")).json();
    return R;
  }
  function colorDe(x, modo) {
    if (modo.startsWith("best:")) { const b = x.best && x.best[modo.slice(5)]; return b ? (b.rob === 0 ? "#9e9e9e" : COLG[b.g] || "#777") : null; }
    const e = ESC[modo], i = e.v(x);
    return i < 0 ? null : e.c[i];
  }
  function tip(x) {
    const L = ML(), k = (n) => tm("p" + n[0].toUpperCase() + n.slice(1));
    const best = Object.entries(x.best || {}).map(([n, b]) => `<li>${tm("tBest", { k: k(n), r: esc(b[L] || b.es), n: b.rob })}</li>`).join("");
    const sinRiego = x.best && Object.values(x.best).length && Object.values(x.best).every((b) => b.rob === 0);
    return `<div class="ficha"><b class="f-nom">${esc(x.n)}</b><p>${tm(x.r)} · ${fmt(x.z)} m · ${fmt(x.sl, 1)} %</p>
      <p>❄️ ${tm("tHel", { v: fmt(x.h0), f: fmt(x.h3) })}</p><p>💧 ${tm("tAgua", { p: fmt(x.p), b: fmt(x.b) })}</p>
      ${x.ero != null ? `<p>⛰️ ${tm("tEro", { v: fmt(x.ero, 1) })}</p>` : ""}
      <p>📉 ${tm("tTend", { v: (x.tp > 0 ? "+" : "") + fmt(x.tp), c: tm(x.tpp < 0.05 ? "tClara" : "tNoClara") })}</p>
      ${sinRiego ? `<p><b>${tm("tSinRiego")}</b></p>` : `<ul class="f-datos">${best}</ul>`}
      <button type="button" class="f-abrir" data-id="${esc(x.id)}">${tm("abrirMuyuy")}</button></div>`;
  }
  async function ponerRiesgo() {
    if (capaR) { map.removeLayer(capaR); capaR = null; }
    const modo = $("#riesgoSel").value;
    $("#riesgoNota").hidden = !modo;
    if (!modo) { leyendaR(); return; }
    const d = await datosR();
    capaR = L.layerGroup();
    for (const x of d.puntos) {
      const col = colorDe(x, modo);
      if (!col) continue;
      const opts = { renderer: rCanvas, weight: 0.4, color: "#ffffff", fillColor: col, fillOpacity: col === "rgba(0,0,0,0)" ? 0 : 0.62 };
      const shape = x.c ? L.rectangle([[x.c[0] * d.celda[0] - 90, x.c[1] * d.celda[1] - 180], [(x.c[0] + 1) * d.celda[0] - 90, (x.c[1] + 1) * d.celda[1] - 180]], opts)
        : L.circleMarker([x.lat, x.lon], { ...opts, radius: 9, weight: 2, color: "#5d4037" });
      shape.bindPopup(() => tip(x), { maxWidth: 320, minWidth: 240 }).on("popupopen", (e) => {
        const b = e.popup.getElement().querySelector(".f-abrir");
        if (b) b.onclick = () => openSite(b.dataset.id, { nombre: x.n, lat: x.lat, lon: x.lon });
      });
      shape.addTo(capaR);
    }
    capaR.addTo(map);
    leyendaR();
  }
  function leyendaR() {
    const modo = $("#riesgoSel").value, box = $("#riesgoLey");
    if (!modo) { box.hidden = true; return; }
    box.hidden = false;
    if (modo.startsWith("best:")) {
      const usados = new Set(R.puntos.map((x) => x.best && x.best[modo.slice(5)] && x.best[modo.slice(5)].g).filter(Boolean));
      const nom = { es: { tuberculo: "tubérculo", raiz: "raíz", leguminosa: "leguminosa", cereal: "cereal", pseudocereal: "pseudocereal", fibra: "fibra", hortaliza: "hortaliza", asociacion: "asociación", cobertura: "cobertura", descanso: "descanso" },
                    en: { tuberculo: "tuber", raiz: "root", leguminosa: "legume", cereal: "cereal", pseudocereal: "pseudocereal", fibra: "fibre", hortaliza: "vegetable", asociacion: "intercrop", cobertura: "cover crop", descanso: "fallow" } }[ML()];
      box.innerHTML = [...usados].map((g) => `<span><i class="sw" style="background:${COLG[g]}"></i>${nom[g] || g}</span>`).join("") + `<span><i class="sw" style="background:#9e9e9e"></i>${ML() === "en" ? "none works (irrigation or altitude)" : "ninguna funciona (riego o altura)"}</span>`;
      return;
    }
    const e = ESC[modo];
    box.innerHTML = (M[ML()][e.lg] || M.es[e.lg]).map((t, i) => `<span><i class="sw r" style="background:${e.c[i]};${e.c[i].startsWith("rgba(0") ? "border:1px solid #999" : ""}"></i>${t}</span>`).join("");
  }

  let rCanvas = null;
  function panel() {
    const sec = document.createElement("section");
    sec.className = "bloque filtros capas-nasa";
    sec.innerHTML = `<h3>${tm("nasaT")}</h3>
      <label class="sel"><select id="nasaSel"><option value="">${tm("nasaNinguna")}</option>${Object.entries(NASA).map(([k, c]) => `<option value="${k}">${tm(c.lab)}</option>`).join("")}</select></label>
      <div id="nasaCtl" hidden>
        <label class="sel"><span>${tm("nasaFecha")}: <b id="nasaF"></b></span><input type="range" id="nasaT" min="0" max="365" value="365"></label>
        <label class="sel"><span>${tm("nasaOpac")}</span><input type="range" id="nasaO" min="0.2" max="1" step="0.05" value="0.75"></label>
        <button type="button" id="nasaAnim" class="btn-anim">${tm("nasaAnimar")}</button>
        <p class="small" id="nasaLey" hidden></p>
      </div>
      <h3>${tm("riesgoT")}</h3>
      <label class="sel"><select id="riesgoSel"><option value="">${tm("riesgoNinguna")}</option>
        <option value="hel">${tm("rHel")}</option><option value="agua">${tm("rAgua")}</option><option value="ero">${tm("rEro")}</option><option value="tend">${tm("rTend")}</option>
        <optgroup label="${tm("rBest")}">${["agua", "ingreso", "suelo", "riesgo"].map((k) => `<option value="best:${k}">${tm("rBest").replace(/…$/, "")} ${tm("p" + k[0].toUpperCase() + k.slice(1))}</option>`).join("")}</optgroup></select></label>
      <div class="leyenda-r" id="riesgoLey" hidden></div>
      <p class="small" id="riesgoNota" hidden>${tm("riesgoNota")}</p>`;
    const filtros = document.querySelector(".panel-izq .filtros");
    filtros.parentNode.insertBefore(sec, filtros.nextSibling);
    $("#nasaSel").onchange = ponerNasa;
    $("#nasaT").oninput = () => { const cfg = NASA[$("#nasaSel").value]; if (cfg) $("#nasaF").textContent = fechaDe(cfg, +$("#nasaT").value).slice(0, cfg.tipo === "mes" ? 7 : 10); };
    $("#nasaT").onchange = ponerNasa;
    $("#nasaO").oninput = () => { if (capaN) capaN.setOpacity(+$("#nasaO").value); };
    $("#nasaAnim").onclick = animar;
    $("#riesgoSel").onchange = ponerRiesgo;
  }
  function init() {
    map.createPane("riesgoPane").style.zIndex = 380;
    map.createPane("nasaPane").style.zIndex = 395;
    map.getPane("nasaPane").style.pointerEvents = "none";
    rCanvas = L.canvas({ padding: 0.4, pane: "riesgoPane" });
    panel();
    // al cambiar el idioma se vuelve a armar el panel con los textos nuevos
    $("#lang").addEventListener("change", () => {
      const n = $("#nasaSel").value, r = $("#riesgoSel").value;
      document.querySelector(".capas-nasa").remove();
      panel();
      $("#nasaSel").value = n; $("#riesgoSel").value = r;
      ponerNasa(); ponerRiesgo();
    });
  }
  const espera = setInterval(() => { if (typeof map !== "undefined" && map && map.getPane) { clearInterval(espera); init(); } }, 150);
})();
