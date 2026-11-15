// Muyuy · pronóstico de El Niño y satélites de la NASA sin cuenta (se carga antes de app.js, junto a ahora.js).
// - Pronóstico de El Niño (data/enso.json, scripts/build_enso.py): ONI observado de NOAA CPC y pronóstico de IRI-Columbia. En el
//   paso 4 dice qué se espera para la próxima campaña y cómo le fue a «lo que siembra hoy» en esos años en su zona.
// - NASA GIBS, capas abiertas que se leen píxel a píxel con su tabla de colores oficial:
//     SMAP L4 humedad del suelo (superficie y raíces, m³/m³, ~9 km): segunda opinión del semáforo.
//     Imerg lluvia (mm/h, promedio del día): piso mínimo de lluvia, solo cuando la de NASA Power no se puede verificar.
//       Verificado el 26 oct 2026 en Lamas: setiembre Imerg ×24 = 39 mm frente a 31 mm de Merra-2; los días con menos de
//       0,1 mm/h no se dibujan, por eso solo vale como «al menos».
//     HLS (Landsat y Sentinel-2, 30 m): foto de la chacra, bajo pedido (no trae infrarrojo: no es un índice de verdor).
"use strict";

Object.assign(I18N.es, {
  ensoT: "📡 Pronóstico para la próxima campaña", fase_nino: "El Niño", fase_nina: "La Niña", fase_neutro: "condiciones neutras",
  ensoProb: "{fase} con {p} % de probabilidad de {a} a {b}", ensoFuente: "IRI-Columbia y NOAA, {f}",
  ensoAhora: "", ensoHoy: "Lo que siembra hoy funcionó {n} de cada 10 años {fase} en su zona.", ensoHoyN: "Lo que siembra hoy funcionó {k} de {n} años {fase} en su zona.", ensoOpN: " La opción 1 funcionó {k} de {n}.",
  ensoVer: "Ver qué rotación aguanta en años {fase}", ensoViejo: "El pronóstico tiene más de 2 meses: puede estar desactualizado.",
  avEnso: "Se espera {fase}", avEnsoX: "Pronóstico con {p} % de probabilidad hasta {b}. En el paso 4 vea qué rotación aguantó mejor los años {fase} en su zona.",
  tSmap: "Humedad vista por el satélite", tSmapS: "medida el {f}", tSmapX: "mide solo los primeros 5 cm: se seca antes que la tierra de las raíces", smSeco: "seca", smBien: "con humedad", smMuy: "muy húmeda",
  tSmapNo: "SMAP no respondió", tSmapCarg: "consultando el satélite…",
  avSmapSeco: "El satélite ve el suelo seco", avSmapSecoX: "El satélite ve la tierra más seca de lo que indica el semáforo. Haga la prueba del puño antes de sembrar.",
  avSmapHumedo: "El satélite ve el suelo húmedo", avSmapHumedoX: "El satélite ve la tierra más húmeda de lo que indica el semáforo. Mire su tierra: quizá ya puede sembrar.",
  semImerg: "Puede sembrar", semImergX: "El satélite Imerg midió al menos {v} mm de lluvia en 10 días y el suelo guarda humedad.",
  avImerg: "Lluvia medida por satélite", avImergX: "El satélite Imerg midió al menos {v} mm en los últimos 10 días (no registra los días de menos de 2,4 mm).",
  hlsT: "🛰️ Ver su chacra desde el satélite", hlsBusca: "Buscando la imagen más reciente sin nubes…",
  hlsS: "Imagen {s} del {f}. Cada cuadrito mide 30 m; el punto rojo es su chacra. Es una foto, no un índice de verdor.",
  hlsNo: "No hay una imagen sin nubes de los últimos {d} días.", hlsErr: "No se pudo bajar la imagen (¿sin internet?).",
  fuentesSat: "<b>Satélites sin cuenta:</b> humedad del suelo <b>SMAP L4</b>, lluvia <b>Imerg</b> y fotos <b>HLS</b> (Landsat y Sentinel-2, 30 m) se leen de NASA GIBS con su tabla de colores oficial. El pronóstico de El Niño es de <b>IRI-Columbia y NOAA</b> y el índice ONI observado, de <b>NOAA CPC</b>.",
});
Object.assign(I18N.en, {
  ensoT: "📡 Forecast for the next season", fase_nino: "El Niño", fase_nina: "La Niña", fase_neutro: "neutral conditions",
  ensoProb: "{fase} with {p} % probability from {a} to {b}", ensoFuente: "IRI-Columbia and NOAA, {f}",
  ensoAhora: "", ensoHoy: "What you sow today worked {n} of every 10 {fase} years in your area.", ensoHoyN: "What you sow today worked {k} of {n} {fase} years in your area.", ensoOpN: " Option 1 worked {k} of {n}.",
  ensoVer: "See which rotation withstands {fase} years", ensoViejo: "The forecast is over 2 months old: it may be outdated.",
  avEnso: "{fase} expected", avEnsoX: "Forecast with {p} % probability until {b}. In step 4, see which rotation best withstood {fase} years in your area.",
  tSmap: "Moisture seen by satellite", tSmapS: "measured on {f}", tSmapX: "", smSeco: "dry", smBien: "moist", smMuy: "very wet",
  tSmapNo: "SMAP did not answer", tSmapCarg: "asking the satellite…",
  avSmapSeco: "The satellite sees dry soil", avSmapSecoX: "The satellite sees the soil drier than the light suggests. Squeeze a handful of soil before sowing.",
  avSmapHumedo: "The satellite sees moist soil", avSmapHumedoX: "The satellite sees the soil wetter than the light suggests. Check your soil: you may be able to sow.",
  semImerg: "You can sow", semImergX: "The Imerg satellite measured at least {v} mm of rain in 10 days and the soil holds moisture.",
  avImerg: "Rain measured by satellite", avImergX: "The Imerg satellite measured at least {v} mm in the last 10 days (it does not record days under 2.4 mm).",
  hlsT: "🛰️ See your farm at 30 m (Landsat and Sentinel-2)", hlsBusca: "Looking for the latest cloud-free image…",
  hlsS: "{s} image from {f}. Each little square is 30 m; the red dot is your farm. It is a photo, not a greenness index.",
  hlsNo: "No cloud-free image in the last {d} days.", hlsErr: "Could not download the image (offline?).",
  fuentesSat: "<b>Satellites without an account:</b> <b>SMAP L4</b> soil moisture, <b>Imerg</b> rain and <b>HLS</b> photos (Landsat and Sentinel-2, 30 m) are read from NASA GIBS with their official color tables. The El Niño forecast is from <b>IRI-Columbia and NOAA</b> and the observed ONI index from <b>NOAA CPC</b>.",
});

let ENSO_PRON = null; // data/enso.json
const TRI = ["DJF", "JFM", "FMA", "MAM", "AMJ", "MJJ", "JJA", "JAS", "ASO", "SON", "OND", "NDJ"];
// «OND 2026» → «oct–dic 2026»
const trimestre = (s) => {
  const [t, y] = String(s).split(" "), i = TRI.indexOf(t);
  return i < 0 ? s : `${MES()[(i + 11) % 12]}–${MES()[(i + 1) % 12]}${y ? " " + y : ""}`;
};
// la fase que se espera (pronóstico de IRI si se reconoció; si no, la observada)
function ensoEsperado() {
  if (!ENSO_PRON) return null;
  const p = ENSO_PRON.pronostico;
  if (p && p.fase && p.pct >= 50) return { fase: p.fase, pct: p.pct, desde: p.desde, hasta: p.hasta, publicado: p.publicado };
  return null;
}
async function cargarEnso() {
  try { ENSO_PRON = await (await fetch("data/enso.json")).json(); } catch { ENSO_PRON = null; }
  renderEnso();
}
function renderEnso() {
  const box = $("#ensoBanner");
  if (!box || !D) return;
  const e = ensoEsperado(), o = ENSO_PRON && ENSO_PRON.oni && ENSO_PRON.oni.at(-1);
  if (!e && !o) { box.hidden = true; return; }
  const fase = e ? e.fase : ENSO_PRON.fase_actual, nom = tr("fase_" + fase);
  const act = D.perfil.rotacion_actual, va = act && D.rotaciones[act];
  const col = fase === "nino" ? F.nino : fase === "nina" ? F.nina : null;
  const viejo = e && e.publicado && (Date.now() - new Date(e.publicado)) > 62 * 864e5;
  const op1 = fase === "nino" && typeof ranked === "function" ? ranked().find(([q]) => q !== act) : null, cOp = op1 && cuentaTipo(op1[1], "nino");
  const opNino = cOp ? tr("ensoOpN", cOp) : ""; // saber que viene El Niño sirve si se puede comparar
  box.hidden = false;
  box.className = "enso " + fase;
  const abierto = !!(box.querySelector("details") || {}).open;
  const pct = e && e.pct ? ` · ${e.pct} %` : "";
  box.innerHTML = `<p class="enso-l"><span>🌊 <b>${tr("ensoCorto", { fase: nom })}</b>${pct}</span>${col != null ? `<button type="button" class="enso-btn enso-ir">${tr("ensoIr")}</button>` : ""}</p><details class="enso-d"${abierto ? " open" : ""}><summary>${tr("ensoMas")}</summary><div class="enso-c">
    ${e ? `<p class="enso-p"><b>${tr("ensoProb", { fase: nom, p: e.pct, a: trimestre(e.desde), b: trimestre(e.hasta) })}</b> <small>(${tr("ensoFuente", { f: e.publicado ? fCorta(new Date(e.publicado + "T12:00:00")) : "" })})</small></p>` : ""}
    ${o && tr("ensoAhora") ? `<p class="enso-s">${tr("ensoAhora", { v: `${o.valor > 0 ? "+" : ""}${dec(o.valor)}`, t: trimestre(`${o.temporada} ${o.anio}`), fase: tr("fase_" + ENSO_PRON.fase_actual) })}</p>` : ""}
    ${va && col != null ? `<p class="enso-s">${fase === "nino" && typeof cuentaTipo === "function" && cuentaTipo(va, "nino")
      ? tr("ensoHoyN", { ...cuentaTipo(va, "nino"), fase: nom }) + opNino : tr("ensoHoy", { n: ten(va[col]), fase: nom })}</p>` : ""}
    ${viejo ? `<p class="enso-s"><i>${tr("ensoViejo")}</i></p>` : ""}
    </div></details>`;
  const b = $(".enso-btn", box);
  if (b) b.onclick = () => { const x = $(`#escenarios [data-esc="${fase}"]`); if (x) x.click(); };
}

// ---------------------------------------------------------------- NASA GIBS: leer el valor de un píxel
const GIBS = "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/";
const GIBS_CM = {};
async function gibsTabla(nombre) {
  if (GIBS_CM[nombre]) return GIBS_CM[nombre];
  const x = await (await fetch(`https://gibs.earthdata.nasa.gov/colormaps/v1.3/${nombre}.xml`)).text();
  const t = new Map();
  for (const e of x.match(/<ColorMapEntry[^>]*\/>/g) || []) {
    if (/nodata="true"/.test(e)) continue;
    const c = e.match(/rgb="(\d+),(\d+),(\d+)"/), v = e.match(/ value="[[(]([^,\])]+),?([^\])]*)[\])]"/);
    if (!c || !v) continue;
    const lo = parseFloat(v[1].replace("-INF", "-1e9")), hi = v[2] ? parseFloat(v[2].replace("+INF", "1e9")) : lo;
    const k = `${c[1]},${c[2]},${c[3]}`;
    if (!t.has(k)) t.set(k, [lo, hi]);
  }
  return (GIBS_CM[nombre] = t);
}
// tesela EPSG:4326 que contiene el punto, dibujada en un canvas sin conversión de color (los colores son datos)
async function gibsTesela(capa, fecha, tms, nivel, grados, lat, lon) {
  const col = Math.floor((lon + 180) / grados), fila = Math.floor((90 - lat) / grados);
  const r = await ahJSONbin(`${GIBS}${capa}/default/${fecha}/${tms}/${nivel}/${fila}/${col}.png`);
  const bmp = await createImageBitmap(r.blob, { colorSpaceConversion: "none", premultiplyAlpha: "none" });
  const cv = document.createElement("canvas");
  cv.width = bmp.width; cv.height = bmp.height;
  const cx = cv.getContext("2d", { willReadFrequently: true });
  cx.drawImage(bmp, 0, 0);
  return { cv, cx, px: Math.floor(((lon + 180) % grados) / grados * bmp.width), py: Math.floor(((90 - lat) % grados) / grados * bmp.height),
           fecha: (r.fecha || fecha).slice(0, 10) };
}
async function ahJSONbin(url, ms = 30000) {
  const ctl = "AbortController" in window ? new AbortController() : null;
  const t = ctl && setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, ctl ? { signal: ctl.signal } : undefined);
    if (!r.ok) throw new Error("GIBS " + r.status);
    return { blob: await r.blob(), fecha: r.headers.get("layer-time-actual") };
  } finally { clearTimeout(t); }
}
// valor en el punto: [mínimo, máximo] del rango de color; null si el píxel es transparente (sin dato o bajo el mínimo)
async function gibsValor(capa, tabla, fecha, [lat, lon]) {
  const [t, cm] = await Promise.all([gibsTesela(capa, fecha, "2km", 5, 9, lat, lon), gibsTabla(tabla)]);
  const d = t.cx.getImageData(t.px, t.py, 1, 1).data;
  return { v: d[3] === 0 ? null : cm.get(`${d[0]},${d[1]},${d[2]}`) || null, fecha: t.fecha };
}
const medio = (v) => (v ? (v[1] > 1e8 ? v[0] : (v[0] + v[1]) / 2) : null);

async function bajarSmap(punto) {
  const [s, r] = await Promise.all([
    gibsValor("SMAP_L4_Analyzed_Surface_Soil_Moisture", "SMAP_Analyzed_Soil_Moisture", "default", punto),
    gibsValor("SMAP_L4_Analyzed_Root_Zone_Soil_Moisture", "SMAP_Analyzed_Soil_Moisture", "default", punto),
  ]);
  if (s.v == null) return null;
  return { sup: Math.round(medio(s.v) * 1000) / 1000, raiz: r.v ? Math.round(medio(r.v) * 1000) / 1000 : null, fecha: s.fecha };
}
// lluvia mínima de los 10 días que terminan en «fin» (último día de NASA Power): suma de los mínimos de cada rango × 24 h
async function bajarImergMin(punto, fin) {
  let min = 0, dias = 0;
  const ds = Array.from({ length: 10 }, (_, k) => { const d = new Date(fin); d.setDate(d.getDate() - k); return d.toISOString().slice(0, 10); });
  const rs = await Promise.all(ds.map((f) => gibsValor("IMERG_Precipitation_Rate", "GPM_Precipitation_Rate", f, punto).catch(() => null)));
  for (const r of rs) {
    if (!r) continue;
    dias++;
    if (r.v && r.v[0] > 0) min += r.v[0] * 24;
  }
  return dias >= 8 ? { min: Math.round(min), dias } : null;
}

// ---------------------------------------------------------------- HLS: foto de la chacra a 30 m (bajo pedido)
async function buscarHls(box, punto) {
  if (box.dataset.listo) return;
  box.dataset.listo = "1";
  box.innerHTML = `<p class="ah-msg"><span class="ah-spin" aria-hidden="true"></span> ${tr("hlsBusca")}</p>`;
  const [lat, lon] = punto, G = 360 / 2560, DIAS = 12;
  let errores = 0;
  // el último día publicado (la capa «default» lo dice en su cabecera); pedir un día aún sin publicar da error sin CORS
  let ult = new Date(Date.now() - 2 * 864e5);
  try {
    const f0 = (await gibsTesela("HLS_S30_Nadir_BRDF_Adjusted_Reflectance", "default", "31.25m", 11, G, lat, lon)).fecha;
    if (/^\d{4}-\d{2}-\d{2}$/.test(f0)) ult = new Date(f0 + "T12:00:00");
  } catch {}
  for (let k = 0; k < DIAS; k++) {
    const d = new Date(ult); d.setDate(d.getDate() - k);
    const f = d.toISOString().slice(0, 10);
    for (const [capa, sat] of [["HLS_S30_Nadir_BRDF_Adjusted_Reflectance", "Sentinel-2"], ["HLS_L30_Nadir_BRDF_Adjusted_Reflectance", "Landsat"]]) {
      let t;
      try { t = await gibsTesela(capa, f, "31.25m", 11, G, lat, lon); } catch { errores++; continue; }
      // ventana de 21 × 21 píxeles (~650 m) alrededor de la chacra: con dato y sin nubes
      const w = 10, img = t.cx.getImageData(Math.max(0, t.px - w), Math.max(0, t.py - w), 2 * w + 1, 2 * w + 1).data;
      let con = 0, nube = 0, n = img.length / 4;
      for (let i = 0; i < img.length; i += 4) {
        if (img[i + 3] === 0) continue;
        con++;
        if (img[i] > 200 && img[i + 1] > 200 && img[i + 2] > 200) nube++;
      }
      if (con / n < 0.8 || nube / Math.max(con, 1) > 0.25) continue;
      const L = 64, E = 4, c = document.createElement("canvas"); // 64 píxeles (~2 km) aumentados 4 veces
      c.width = c.height = L * E;
      c.className = "ah-hls-img";
      const cx = c.getContext("2d");
      cx.imageSmoothingEnabled = false;
      cx.fillStyle = "#222"; cx.fillRect(0, 0, c.width, c.height);
      cx.drawImage(t.cv, t.px - L / 2, t.py - L / 2, L, L, 0, 0, L * E, L * E);
      cx.strokeStyle = "#fff"; cx.lineWidth = 3; cx.fillStyle = "#e53935";
      cx.beginPath(); cx.arc(L * E / 2, L * E / 2, 7, 0, 2 * Math.PI); cx.fill(); cx.stroke();
      box.innerHTML = "";
      box.append(c);
      const cap = tr("hlsS", { s: sat, f: fCorta(new Date(f + "T12:00:00")) });
      box.insertAdjacentHTML("beforeend", `<p class="ah-hls-s">${cap}</p>`);
      if (AH) AH.hls = { src: c.toDataURL("image/png"), cap }; // se conserva al volver a pintar el bloque
      return;
    }
  }
  box.innerHTML = `<p class="ah-msg">${tr(errores >= DIAS * 2 ? "hlsErr" : "hlsNo", { d: DIAS })}</p>`;
  delete box.dataset.listo;
}
Object.assign(I18N.es, { ensoMas: "Más del pronóstico" });
Object.assign(I18N.en, { ensoMas: "More about the forecast" });
