// Muyuy: la web lee las rotaciones precalculadas (data/<sitio>.json) y las reordena
// en el navegador según las prioridades. No necesita conexión después de la primera carga.
// Los textos cambian de idioma (español, inglés, quechua) con i18n.js.
// Las microanimaciones usan Lottie (lottie/*.json); si no carga, la app funciona igual.
"use strict";

const F = { agua: 0, ingreso: 1, suelo: 2, riesgo: 3, rob: 4, nino: 5, seco: 6, ing: 7, ero: 8, soc: 9,
            vida: 10, grilla: 11, raz: 12, ale: 13, peor: 14, nina: 15, riego: 16 };
const EMOJI = { tuberculo: "🥔", raiz: "🍠", leguminosa: "🫘", cereal: "🌾", pseudocereal: "🌿", fibra: "☁️",
                hortaliza: "🧅", asociacion: "🌽", cobertura: "☘️", descanso: "🍂" };
// ícono ilustrado del cultivo (cultivos_img.js); si faltara, el emoji de su grupo
const cico = (cid, clase = "") => (typeof CULT_IMG !== "undefined" && CULT_IMG[cid])
  ? `<img class="cico ${clase}" src="${CULT_IMG[cid]}" alt="" width="64" height="64" decoding="async">`
  : `<span class="${clase}">${EMOJI[(D.cultivos[cid] || {}).grupo] || "🌱"}</span>`;
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const GAUGE = 2 * Math.PI * 26;

let D = null;            // datos del sitio
let custom = [null, null, null];
let picked = null;       // cultivo tocado (modo táctil)
let lastTop = "";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const ten = (x) => Math.floor(x * 10 + 0.5);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MES = () => MESES_I18N[LANG];
const num = (v) => Math.round(v).toLocaleString(LOCALE[LANG]);
// un cultivo que no está en los datos del sitio no debe cortar la carga: se muestra su código
const cname = (cid) => { const c = D.cultivos[cid]; return c ? (c.nombres && c.nombres[LANG]) || c.nombre : String(cid).replace(/_/g, " "); };
const txt = (i) => (D.textos[LANG] || D.textos.es)[i];

// ---------------------------------------------------------------- Lottie
const LOT = new Map();
function lottieIn(el, name, loop = true) {
  if (!el) return;
  if (typeof lottie === "undefined") { el.textContent = { gota: "💧", moneda: "💰", brote: "🌱", escudo: "🛡️", exito: "✅", helada: "❄️", sol: "☀️", lluvia: "🌧️", muyuy: "⏳" }[name] || ""; return; }
  if (LOT.has(el)) LOT.get(el).destroy();
  for (const [e, an] of LOT) if (!e.isConnected) { an.destroy(); LOT.delete(e); }
  el.textContent = "";
  // en celulares y equipos livianos la animación queda quieta en su dibujo final (moverla cuadro por cuadro congela)
  const quieta = REDUCED || (typeof LIVIANO !== "undefined" && LIVIANO && !el.closest("#computing"));
  const a = lottie.loadAnimation({ container: el, renderer: "svg", loop: loop && !quieta, autoplay: !quieta, ...(window.MUYUY_EMBED ? { animationData: window.MUYUY_EMBED[`lottie/${name}.json`] } : { path: `lottie/${name}.json` }) });
  if (quieta) a.addEventListener("DOMLoaded", () => a.goToAndStop(a.totalFrames - 1, true));
  LOT.set(el, a);
}
// las animaciones llegan después de la página (index.html las carga sin esperar): al llegar, se ponen las de la vista
window.lottieListo = () => { try { initStaticLotties(); } catch {} };
function initStaticLotties(root = document) {
  $$("[data-lottie]", root).forEach((el) => lottieIn(el, el.dataset.lottie, el.dataset.loop === "true"));
  const ld = LOT.get($("#computing .loader")); if (ld) ld.pause();
}

// ---------------------------------------------------------------- utilidades de animación
function countUp(el, to, ms = 900, fmt = (v) => num(v)) {
  if (REDUCED) { el.textContent = fmt(to); return; }
  const t0 = performance.now(), from = 0;
  const step = (t) => {
    const k = Math.min(1, Math.max(0, (t - t0) / ms)), e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(from + (to - from) * e);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function toast(msg, ms = 3200) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  t.style.animation = "none"; void t.offsetWidth; t.style.animation = "";
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (t.hidden = true), ms);
}
// la transición de vista captura toda la página: en celulares y equipos de pocos núcleos congela; ahí se omite
const LIVIANO = matchMedia("(pointer: coarse)").matches || (navigator.hardwareConcurrency || 4) <= 4;
// Sin «view transitions»: mientras duran, el navegador no deja tocar la página y había que dar varios clics.
// Las tarjetas ya entran con su propia animación de CSS (rise), que no bloquea los toques.
function transition(fn) { fn(); }

// ---------------------------------------------------------------- prioridades
let pesosAntes = "", pesosW = null;
function weights() {
  const w = {};
  $$(".prio input").forEach((i) => (w[i.dataset.k] = +i.value));
  const clave = JSON.stringify(w) + $("#maxDesc").value;
  if (clave === pesosAntes) return { ...pesosW }; // sin cambios: ni se guarda ni se vuelven a pintar los puntos (se llama muchas veces)
  pesosAntes = clave;
  try {
    localStorage.setItem("muyuy-pesos", JSON.stringify(w));
    localStorage.setItem("muyuy-maxdesc", $("#maxDesc").value);
  } catch {}
  const s = Object.values(w).reduce((a, b) => a + b, 0) || 1;
  for (const k in w) w[k] /= s;
  const max = Math.max(...Object.values(w));
  $$(".prio").forEach((l) => {
    const k = l.dataset.k, n = Math.round(+$("input", l).value / 2); // 0-5 puntos: sin porcentajes en la vista del agricultor
    $("output", l).textContent = "●".repeat(n) + "○".repeat(5 - n);
    l.classList.toggle("lider", w[k] === max && max > 0.26);
  });
  pesosW = w;
  return { ...w };
}

function tweenSliders(target) {
  const inputs = $$(".prio input");
  const from = inputs.map((i) => +i.value);
  const t0 = performance.now(), ms = REDUCED ? 1 : 220;
  return new Promise((done) => {
    const step = (t) => {
      const k = Math.min(1, Math.max(0, (t - t0) / ms)), e = 1 - Math.pow(1 - k, 3);
      inputs.forEach((i, j) => (i.value = Math.round(from[j] + (target[j] - from[j]) * e)));
      weights();
      if (k < 1) requestAnimationFrame(step); else done();
    };
    requestAnimationFrame(step);
  });
}

// una rotación con al menos un cultivo asociado (dos cultivos en el mismo surco)
const conAsoc = (seq) => seq.split("|").some((c) => (D.cultivos[c] || {}).grupo === "asociacion");
// el orden se pide muchas veces en un mismo dibujo (resumen, fichas, El Niño…): se calcula una vez por turno
let rankCache = null;
const ROB_PISO = 0.6; // igual que ROBUSTEZ_PISO en muyuy/engine.py
function ranked() {
  const w = weights(), clave = [JSON.stringify(w), $("#maxDesc").value, $("#asoc").value, D.sitio, escenario].join("|");
  if (rankCache && rankCache.clave === clave) return rankCache.r.slice();
  const r = rankedCalc(w);
  rankCache = { clave, r };
  setTimeout(() => (rankCache = null), 0); // lo que cambia fuera de estos datos (filtros de campo.js) se ve en el turno siguiente
  return r.slice();
}
["click", "change", "input"].forEach((t) => document.addEventListener(t, () => (rankCache = null), true)); // cada toque puede cambiar un filtro
function rankedCalc(w) {
  const maxD = +$("#maxDesc").value, asoc = $("#asoc").value;
  let r = Object.entries(D.rotaciones)
    .filter(([seq]) => seq.split("|").filter((c) => c === "descanso" || (D.cultivos[c] || {}).grupo === "cobertura").length <= maxD);
  if (asoc === "no") r = r.filter(([seq]) => !conAsoc(seq));
  else if (asoc === "pref") { const a = r.filter(([seq]) => conAsoc(seq)); if (a.length >= 3) r = a; } // si no alcanzan, se muestran todas
  // lo que limita la chacra (campo.js): cultivos que no puede sembrar y, si necesita forraje, un empuje a las que lo dan
  const C = typeof CAMPO !== "undefined" ? CAMPO : null;
  if (C) r = C.filtrar(r);
  let out = r.map(([seq, v]) => [seq, v, w.agua * v[F.agua] + w.ingreso * (C ? C.pesoIngreso() : 1) * v[F.ingreso] + w.suelo * v[F.suelo] + w.riesgo * v[F.riesgo] + (C ? C.extra(seq) : 0)])
    .sort((a, b) => b[2] - a[2]);
  // una rotación que casi nunca funciona no puede salir arriba aunque gaste poca agua o venda más
  // (en Lamas, «Gastar poca agua» ponía de opción 1 una que funciona 0 de cada 10 años): van primero las que
  // funcionan al menos el 60 % de lo que logra la mejor de este lugar; el orden dentro de cada grupo no cambia
  const piso = ROB_PISO * Math.max(0, ...out.map((x) => x[1][F.rob]));
  out = out.filter((x) => x[1][F.rob] >= piso).concat(out.filter((x) => x[1][F.rob] < piso));
  return C && C.conservarBase ? C.conservarBase(out) : out;
}
// qué asociaciones hay en este lugar y cuáles se dan a su altura; sin ninguna, la opción no se muestra
function renderAsoc() {
  const ids = Object.keys(D.cultivos).filter((c) => D.cultivos[c].grupo === "asociacion");
  $("#asocOpt").hidden = !ids.length;
  if (!ids.length) { $("#asoc").value = "si"; return; }
  const si = ids.filter((c) => D.cultivos[c].factible !== false), no = ids.filter((c) => D.cultivos[c].factible === false);
  $("#asocHint").innerHTML = tr("asocHint") + " " + tr("asocAqui", { c: si.length ? si.map(cname).join(", ") : "—" }) +
    (no.length ? " " + tr("asocNoAltura", { c: no.map(cname).join(", ") }) : "") +
    ($("#asoc").value === "pref" && !si.length ? ` <b>${tr("asocPocas")}</b>` : "");
}

// ---------------------------------------------------------------- parcela
// el suelo en palabras: «arena 49%, arcilla 31%, MO 5.2%, pH 5.5» → textura, acidez y materia orgánica
function sueloCifras(txt) {
  const n = String(txt || "").match(/\d+(?:\.\d+)?/g);
  return n && n.length >= 4 ? { arena: +n[0], arcilla: +n[1], mo: +n[2], ph: +n[3] } : null;
}
function sueloPalabras(txt) {
  const c = sueloCifras(txt);
  if (!c) return txt;
  const lab = D.perfil && D.perfil.lab; // su análisis manda sobre el mapa
  if (lab) for (const [k, v] of Object.entries({ arena: lab.arena, arcilla: lab.arcilla, mo: lab.mo, ph: lab.ph })) if (v != null) c[k] = v;
  const tex = c.arcilla >= 40 ? "sue_arcilla" : c.arena >= 65 ? "sue_arena" : "sue_mezcla";
  const ph = c.ph < 5.5 ? "ph1" : c.ph < 6 ? "ph2" : c.ph < 6.6 ? "ph3" : c.ph <= 7.3 ? "ph4" : c.ph <= 8 ? "ph5" : "ph6";
  const mo = c.mo < 2 ? "mo1" : c.mo < 4 ? "mo2" : "mo3"; // bajo, medio y alto en los análisis de suelo del Perú
  return [tr(tex), tr(ph), tr(mo)].join(", "); // el pH se muestra, pero el cálculo no lo usa
}
// pendiente: hasta 8 % se trabaja sin mayor cuidado; desde ahí la lluvia ya lava la ladera
const pendNivel = (p) => (p <= 2 ? 0 : p <= 8 ? 1 : p <= 15 ? 2 : 3);
// paso 2: dice qué hará Muyuy con lo que acaba de elegir
function prioConf() {
  const b = $(".preset.on");
  $("#prioConf").textContent = tr(b ? "conf_" + b.dataset.i18n : "conf_mi");
}
// ---------------------------------------------------------------- análisis de suelo del agricultor
// Rangos: INIA (2024), Manual para el análisis de suelos agrícolas y agua para riego, tabla 20
const LAB_KEY = "muyuy-analisis";
const LAB_C = { ph: "labPh", mo: "labMo", p: "labP", k: "labK", ce: "labCe", arena: "labAr", arcilla: "labAc" };
const labTodos = () => { try { return JSON.parse(localStorage.getItem(LAB_KEY)) || {}; } catch { return {}; } };
const labDe = (id) => labTodos()[id] || [];
const claseInia = (v, a, b) => (v < a ? "labBajo" : v <= b ? "labMedio" : "labAlto");
const phInia = (v) => "ph_" + (v <= 4.4 ? 1 : v <= 5 ? 2 : v <= 5.5 ? 3 : v <= 6 ? 4 : v <= 6.5 ? 5 : v <= 7.3 ? 6 : v <= 7.8 ? 7 : v <= 8.4 ? 8 : v <= 9 ? 9 : 10);
function labLecturas(a) {
  const f = [];
  if (a.ph != null) f.push([tr("labPh"), a.ph, tr(phInia(a.ph)), a.ph <= 5.5 ? "rcPhA" : a.ph <= 6.5 ? "rcPhL" : a.ph > 7.8 ? "rcPhB" : ""]);
  if (a.mo != null) f.push([tr("labMo"), a.mo, tr(claseInia(a.mo, 2, 4)), a.mo < 2 ? "rcMo" : ""]);
  if (a.p != null) f.push([tr("labP"), a.p, tr(claseInia(a.p, 7, 14)), a.p < 7 ? "rcP" : ""]);
  if (a.k != null) f.push([tr("labK"), a.k, tr(claseInia(a.k, 120, 240)), a.k < 120 ? "rcK" : ""]);
  if (a.ce != null) f.push([tr("labCe"), a.ce, tr(a.ce < 4 ? "ce_1" : a.ce <= 8 ? "ce_2" : "ce_3"), a.ce >= 4 ? "rcCe" : ""]);
  return f;
}
function renderLab() {
  const box = $("#sueloLabC");
  if (!box || !D) return;
  const lista = labDe(D.sitio), ult = lista[0], ant = lista[1];
  const campo = (k, min, max, paso) => `<label><span>${tr(LAB_C[k])}</span><input type="number" name="${k}" min="${min}" max="${max}" step="${paso}" inputmode="decimal"></label>`;
  const cambios = ult && ant ? Object.keys(LAB_C).filter((k) => ult[k] != null && ant[k] != null && ult[k] !== ant[k]).map((k) => `<li>${tr(ult[k] > ant[k] ? "labSube" : "labBaja", { k: tr(LAB_C[k]), a: ant[k], b: ult[k] })}</li>`).join("") : "";
  box.innerHTML = `<p class="hint">${tr("labS")}</p>
    <form class="cierre-form lab-f" id="labF"><label><span>${tr("labFecha")}</span><input type="date" name="fecha" value="${hoyISO()}"></label>
      ${campo("ph", 3, 10, "0.1")}${campo("mo", 0, 30, "0.1")}${campo("p", 0, 500, "0.1")}${campo("k", 0, 3000, "1")}${campo("ce", 0, 60, "0.01")}${campo("arena", 0, 100, "1")}${campo("arcilla", 0, 100, "1")}
      <button type="submit">${tr("labGuardar")}</button></form>
    ${ult ? `<h4 class="lab-h">${tr("labRes")} · ${esc(ult.fecha)}</h4><ul class="lab-l">${labLecturas(ult).map(([n, v, c, r]) => `<li><b>${n}: ${v}</b> · ${c}${r ? `<small>${tr(r)}</small>` : ""}</li>`).join("")}</ul>
      ${cambios ? `<h4 class="lab-h">${tr("labHist")}</h4><ul class="lab-l">${cambios}</ul>` : ""}
      <p class="small">${tr("labCalc")}</p><button type="button" class="btn-sec" id="labX">${tr("labQuitar")}</button>` : ""}
    <p class="small">${tr("labFuente")}</p>`;
  $("#labF").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target), a = { fecha: fd.get("fecha") || hoyISO() };
    for (const k of Object.keys(LAB_C)) { const v = String(fd.get(k) || "").trim(); if (v !== "") a[k] = parseFloat(v.replace(",", ".")); }
    if (Object.keys(a).length < 2) return toast(tr("labVacio"));
    const t = labTodos(); t[D.sitio] = [a, ...(t[D.sitio] || [])].slice(0, 12);
    try { localStorage.setItem(LAB_KEY, JSON.stringify(t)); } catch {}
    await labAplicar(a);
  };
  const x = $("#labX");
  if (x) x.onclick = async () => { const t = labTodos(); t[D.sitio] = (t[D.sitio] || []).slice(1); try { localStorage.setItem(LAB_KEY, JSON.stringify(t)); } catch {} await labAplicar(t[D.sitio][0] || null); };
}
async function labAplicar(a) {
  const lab = a ? { arena: a.arena ?? null, arcilla: a.arcilla ?? null, mo: a.mo ?? null, ph: a.ph ?? null } : null;
  D.perfil = { ...D.perfil, lab };
  guardarPerfil({ lab });
  const ok = await motorAplicar(D.perfil);
  toast(tr(ok ? "labListo" : "labSinCalc"));
  await showSite();
  $("#sueloLab").open = true;
}
function renderCtx() {
  const c = D.contexto, cl = c.clima, p = D.perfil;
  const dicho = (p.campanias_texto || [])[0]; // la última campaña, tal como la dijo
  const ant = p.cultivo_anterior ? tr("antes", { c: cname(p.cultivo_anterior) })
    : dicho ? tr("antes", { c: esc(dicho) }) : tr("antesNo");
  const riego = p.riego_mm ? tr("riegoApoyo", { r: p.riego_mm }) : tr("secano");
  const relato = D.andina
    ? (p.heladas_campanias != null ? tr("relatoSierra", { h: p.heladas_campanias, g: p.granizo_anios })
      : p.entrevista ? tr("eHeladaNo") : tr("relatoSin")) + (p.entrevista && p.riego_mm ? ` · ${riego}` : "") // celdas: sin entrevista
    : riego;
  // con entrevista (paso 1 o servidor) lo contó el agricultor; si no, en celdas y chacras es lo típico de la región
  // y en los 4 sitios un perfil de ejemplo
  const supuesto = !p.entrevista && (D.celda || D.parcela);
  const reg0 = D.region || (D.andina ? "sierra" : "costa");
  const quien = p.entrevista ? tr("contó") : tr("ctxEj"); // igual en cualquier lugar: lo típico de la región, sin su entrevista
  const detalle = (supuesto && p.cultivo_anterior ? `${tr("antSup_" + reg0)} · ${relato}` : relato) +
    (dicho && !p.cultivo_anterior ? ` · ${tr(esArroz(dicho) ? "eArrozFuera" : "eFueraTabla")}` : "") +
    (p.entrevista && p.textura ? ` · ${tr("eTierra", { t: tr("tex_" + p.textura) })}` : "") +
    (p.entrevista && p.terrazas ? ` · ${tr("eConTerrazas")}` : "") +
    (p.sinRecalc ? ` · ${tr("eSinRecalc")}` : "");
  const nr = $("#nasaRes");
  if (nr) nr.textContent = `🛰️ ${tr("nasaLinea")}: ${c.altura} m · ${tr("pendiente").toLowerCase()} ${tr("pendT" + pendNivel(c.pendiente)).toLowerCase()} · ${tr("nasaRiesgo")}`;
  const tiles = [
    ["altura", tr("altura"), `${c.altura} m`, ""],
    ["pendiente", tr("pendiente"), tr("pendT" + pendNivel(c.pendiente)), pendNivel(c.pendiente) >= 2 ? tr("pendCuide") : ""],
    ["suelo", tr((D.suelo_fuente || (D.celda ? "openlandmap" : "soilgrids")) === "openlandmap" ? "sueloOLM" : "sueloSG"), sueloPalabras((D.suelo_txt && D.suelo_txt[LANG]) || c.suelo), ""],
    ["clima", tr("climaPower"), `${c.campanias[0]}–${c.campanias[1] + 1}`, tr("corregido", { dt: `${cl.delta_t > 0 ? "+" : ""}${cl.delta_t}`, pf: cl.precip_factor })],
    ["agricultor", quien, ant, detalle],
  ];
  // suelo, clima y relato vienen como "a, b, c" o "a · b": uno por renglón
  const rows = (x, tag) => {
    const parts = String(x).split(/\s*(?:,|·)\s+/).filter(Boolean);
    return parts.length < 2 ? `<${tag}>${x}</${tag}>`
      : `<ul class="ctx-list ${tag}">${parts.map((t) => `<li>${/^\p{Ll}\p{Lu}/u.test(t) ? t : t.charAt(0).toUpperCase() + t.slice(1)}</li>`).join("")}</ul>`;
  };
  const LISTA = new Set(["suelo", "clima", "agricultor"]);
  const tile = ([ic, k, v, s], i) =>
    `<div style="--i:${i}"><span class="ic">${ico(ic)}</span><small>${k}</small>${LISTA.has(ic) ? rows(v, "b") : `<b>${v}</b>`}${s ? (LISTA.has(ic) ? rows(s, "small") : `<small>${s}</small>`) : ""}</div>`;
  // dos columnas sin huecos: a la izquierda los cortos (altura, pendiente, clima), a la derecha los largos (suelo, lo típico)
  const cortos = ["altura", "pendiente", "clima"], col = (f) => tiles.map((t, i) => [t, i]).filter(([t]) => f(cortos.includes(t[0]))).map(([t, i]) => tile(t, i)).join("");
  $("#ctx").innerHTML = `<div class="ctx-col">${col((x) => x)}</div><div class="ctx-col">${col((x) => !x)}</div>`;
  updateSiteName();
  renderLab();
  const otro = chosen && chosen.site === D.sitio && !chosen.exacta && c.lugar !== chosen.nombre && chosen.km > 1;
  $("#siteDatos").hidden = !otro;
  $("#siteDatos").textContent = otro ? tr("lugarDatos", { s: c.lugar, km: num(chosen.km) }) : "";
  const reg = D.region || (D.andina ? "sierra" : "costa");
  document.body.dataset.region = reg;
  $("#regionBadge").textContent = tr(reg + "G"); // igual en cualquier lugar del Perú
  if (D.fuera_peru) toast(tr("fueraPeru"), 10000);
  $("#probando").innerHTML = tr("probando", { n: `<b>${num(D.n_total || Object.keys(D.rotaciones).length)}</b>` });
}

// ---------------------------------------------------------------- tarjetas
function timeline(seq, vida) {
  return seq.map((cid, k) => {
    const c = D.cultivos[cid];
    const months = c.grupo === "descanso" ? tr("todoAnio")
      : tr("siembraCosecha", { s: MES()[c.siembra - 1], c: MES()[c.cosecha - 1] }).split(" · ").join("<br>"); // siembra y cosecha en dos renglones
    const qu = LANG === "es" && D.andina && c.nombre_qu && normTxt(c.nombre_qu) !== normTxt(cname(cid)) ? `<span class="q">${c.nombre_qu}</span>` : "";
    return `<li class="${esClaro(c.color) ? "claro" : ""}" style="background:${c.color};--i:${k}">
      ${cico(cid, "emo")}
      <span class="n">${tr("campania", { n: k + 1 })}</span>
      <span class="c">${cname(cid)}</span>${qu}${c.grupo === "asociacion" ? `<span class="asoc-tag">🤝 ${tr("asocTag")}</span>` : ""}
      <span class="m">${months}</span>
      <span class="soil" title="${tr("vidaSuelo", { v: vida[k] })}"><i data-w="${vida[k]}"></i></span></li>`;
  }).join("");
}

const recNom = (y) => { const r = D.recordados && D.recordados[y]; return r ? r[LANG] || r.es : ""; }; // solo el nombre, sin el año
const recLabel = (y) => { const r = D.recordados && D.recordados[y]; return r ? `${y}/${String(y + 1).slice(-2)} ${r[LANG] || r.es}` : ""; };
function grid(bits) {
  return [...bits].map((b, i) => {
    const y = D.anios[i], nino = D.clases[i] && D.clases[i].enso === "El Niño", rec = recLabel(y);
    return `<span style="--i:${i}" class="${b === "1" ? "ok" : ""} ${nino ? "nino" : ""} ${rec ? "rec" : ""} ${enEscenario(i) ? "" : "dim"}" title="${tr("gridTip", { a: y, b: y + 3 })}${nino ? tr("gridNino") : ""}${rec ? " ★ " + rec : ""}"></span>`;
  }).join("");
}
function recLegend() {
  const ys = Object.keys(D.recordados || {});
  return ys.length ? tr("recLeyenda") + ": " + ys.map((y) => recLabel(+y)).join(" · ") : "";
}

// cuántos de los años El Niño (o secos) de los 42 funcionó: «14 de 15» no choca con el Niño que el agricultor recuerda
// que salió mal, como sí chocaba «10 de 10» redondeado
function cuentaTipo(v, tipo) {
  const g = v[F.grilla] || "";
  let k = 0, n = 0;
  for (let i = 0; i < g.length; i++) {
    const c = D.clases[i] || {};
    const es = tipo === "nino" ? c.enso === "El Niño" : String(c.humedad || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "") === "seco";
    if (es) { n++; if (g[i] === "1") k++; }
  }
  return n ? { k, n } : null;
}
const cuentaTxt = (v, tipo) => { const c = cuentaTipo(v, tipo); return c ? tr("deAnios", c) : null; };
function riskOf(v, seq) {
  const ale = v[F.ale].map((i) => D.textos.es[i]).join(" "); // se detecta sobre el texto en español
  if (/helada/i.test(ale)) return ["helada", tr("rHelada")];
  if (/exceso de agua/i.test(ale)) return ["lluvia", tr("rNino")];
  if (v[F.seco] < 0.6) return ["sol", tr("rSequia")];
  if (v[F.ing] < 0) return ["moneda", tr(preciosPropios(seq) ? "rPierdeS" : "rPierde")]; // antes decía «Muy estable» junto a «pierde S/ …»
  return ["exito", tr("rEstable")];
}

const PLAN_ICON = { siembra: "🌧️", cosecha: "🌾", chuno: "❄️", caya: "❄️", secado: "☀️", heno: "☀️", guardar: "🏠",
                    incorporar: "♻️", descanso: "🍂", venta: "💰" };
function planHtml(seq) {
  return seq.map((cid) => {
    const c = D.cultivos[cid];
    const items = (c.plan && (c.plan[LANG] || c.plan.es)) || [];
    return `<li><b>${cico(cid, "mini")} ${cname(cid)}</b><ul class="plan-items">${items.map(([tipo, txt]) =>
      `<li><span class="pi" aria-hidden="true">${PLAN_ICON[tipo] || "•"}</span>${txt}</li>`).join("")}</ul></li>`;
  }).join("");
}

function fillCard(el, seq, v, title, score, i = 0) {
  const s = seq.split("|");
  applyStatic(el);
  el.style.setProperty("--i", i);
  $(".rank", el).textContent = title;
  $(".score", el).textContent = ""; // sin puntajes sobre 100 en la vista del agricultor: todo es "de 10"
  $(".timeline", el).innerHTML = timeline(s, v[F.vida]);
  const frac = fracOf(v), r10 = ten(frac);
  $(".robust", el).textContent = robustTxt(r10); // solo "funciona n de cada 10": "falla" confundía
  $(".robust", el).classList.toggle("medio", r10 >= 4 && r10 < 7);
  $(".robust", el).classList.toggle("bajo", r10 < 4);
  $(".vs", el).innerHTML = vsHtml(seq, v);
  $(".share", el).onclick = () => shareCard(seq, v);
  // un dato por fila: etiqueta a la izquierda, valor a la derecha
  $(".sub", el).innerHTML = statRows([
    ["🌧️", tr("kNino"), cuentaTxt(v, "nino") || tr("deDiez", { n: ten(v[F.nino]) })],
    ["☀️", tr("kSeco"), cuentaTxt(v, "seco") || tr("deDiez", { n: ten(v[F.seco]) })],
    ["💰", tr("kIng"), v[F.ing] < 0 ? `<b class="pierde">${tr(preciosPropios(seq) ? "vPierdeS" : "vPierde", { v: num(-v[F.ing]) })}</b>` : `<b>${tr("vIng", { v: num(v[F.ing]) })}</b>`],
    v[F.riego] ? ["💧", tr("kRiego"), tr("vRiego", { r: v[F.riego] })] : null,
  ]) + (esFuturo() && FUTV.has(v) ? `<p class="fut-hoy">${tr("futHoy", { n: ten(v[F.rob]) })}</p>` : "");
  $(".grid", el).innerHTML = grid(v[F.grilla]);
  $(".why", el).innerHTML = whyHtml(seq, v);
  const sum = $(".why-box summary", el); // la de hoy no "conviene": se pregunta qué la ayuda y qué la arriesga
  sum.dataset.i18n = seq === D.perfil.rotacion_actual ? "porQueHoy" : "porQue";
  sum.textContent = tr(sum.dataset.i18n);
  $(".plan", el).innerHTML = planHtml(s);
  const [rk, rtxt] = riskOf(v, seq);
  $(".risk-txt", el).textContent = rtxt;
  lottieIn($(".risk-anim", el), rk, false);
  $(".listen", el).onclick = (e) => speak(s, v, e.currentTarget);
  $(".print", el).onclick = () => printCard(el);
  // medidor circular y conteo
  const fg = $(".g-fg", el), numEl = $(".g-num", el);
  fg.style.stroke = r10 >= 7 ? "var(--green)" : r10 >= 4 ? "var(--amber)" : "var(--red)";
  requestAnimationFrame(() => requestAnimationFrame(() => {
    fg.style.strokeDashoffset = GAUGE * (1 - frac);
    $$(".soil i", el).forEach((b) => (b.style.width = b.dataset.w + "%"));
  }));
  countUp(numEl, r10, 1000, (x) => Math.round(x) + "/10");
}

// en el celular se ve una opción a la vez, con un botón para cada una
let topSel = 0;
function elegirTop(i) {
  topSel = i;
  $$("#top > .rot").forEach((el, k) => el.classList.toggle("sel", k === i));
  $$("#topTabs button").forEach((b, k) => { b.classList.toggle("on", k === i); b.setAttribute("aria-selected", k === i); });
}
async function renderTop(withLoader = false) {
  const r = ranked().slice(0, 3);
  const key = r.map((x) => x[0]).join(",") + LANG + escenario;
  if (key === lastTop && !withLoader) return; // mismo orden: nada que cambiar
  lastTop = key;
  if (withLoader && !REDUCED) {
    $("#computing").hidden = false;
    const ld = LOT.get($("#computing .loader")); if (ld) ld.play();
    await sleep(120); // un instante para ver «Probando…»; antes eran 0,65 s y parecía que el botón no respondía
  }
  $("#recRot").textContent = recLegend();
  transition(() => {
    const box = $("#top");
    box.innerHTML = r.length ? "" : `<p class="pk-lejos">${tr("sinCultivos", { z: num(D.contexto.altura) })}</p>`; // solo descanso: nada da cosecha a esta altura
    r.forEach(([seq, v, sc], i) => {
      const el = $("#tpl-card").content.firstElementChild.cloneNode(true);
      if (i === 0) { el.classList.add("first"); el.dataset.badge = tr("masFuerte"); }
      fillCard(el, seq, v, tr("opcion", { i: i + 1 }), sc, i);
      // lo de «frente a hoy», «según el tipo de año» y «¿por qué?» ya está en el comparador y en las fichas de abajo: no se repite
      $$(".vs, .tipo, .why-box:not(.plan-box)", el).forEach((x) => x.remove());
      // una sola tarjeta: los 3 datos, una pregunta y 2 botones (antes estaban también en «Lo más importante»)
      if (typeof CAMPO !== "undefined") el.querySelector(".robust-row").insertAdjacentHTML("afterend", `<div class="cd">${CAMPO.datosCard(seq, v)}</div>`);
      if (typeof CRITERIO !== "undefined") el.querySelector(".acc-menu").insertAdjacentHTML("beforebegin", CRITERIO.opinionCard(seq));
      el.querySelector(".acc-menu").insertAdjacentHTML("beforebegin", `<div class="rot-b"><button type="button" class="ver-ficha" data-seq="${seq}">${tr("verFicha")}</button></div>`);
      el.querySelector(".rot-b").appendChild(el.querySelector(".share"));
      el.style.viewTransitionName = "rot-" + seq.replace(/\|/g, "-"); // solo aquí: la misma rotación armada en el paso 5 repetía el nombre
      box.appendChild(el);
    });
    if (topSel >= r.length) topSel = 0;
    $("#topTabs").innerHTML = r.map(([, v], i) => `<button type="button" role="tab" data-i="${i}"><b>${tr("opcion", { i: i + 1 })}</b><small>${tr("vDeDiez", { n: ten(fracOf(v)) })}</small></button>`).join("");
    $$("#topTabs button").forEach((b) => (b.onclick = () => elegirTop(+b.dataset.i)));
    elegirTop(topSel);
    if (typeof CRITERIO !== "undefined") CRITERIO.enlazar(box);
    $$(".ver-ficha", box).forEach((b) => (b.onclick = () => { const f = document.querySelector(`.es-ficha[data-seq="${b.dataset.seq}"]`);
      if (f) { if (typeof PESTANAS !== "undefined") PESTANAS.mostrar(f); f.open = true; f.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" }); } }));
  });
  $("#computing").hidden = true;
  const ld = LOT.get($("#computing .loader")); if (ld) ld.pause();
  if (typeof CAMPO !== "undefined") CAMPO.alOrden(); // comparador, calendario y «¿Y si…?» con las mismas estrategias
}

// ---------------------------------------------------------------- voz (se puede apagar)
let audioOn = true;
const vozRate = () => ({ lenta: 0.8, rapida: 1.2 }[(window.MUYUY_AJ || {}).voz] || 1); // velocidad elegida en Configuración
try { audioOn = localStorage.getItem("muyuy-audio") !== "off"; } catch {}
let clip = null; // audio incluido que está sonando
let vozTurno = 0; // cada lectura nueva corta la anterior

function stopAudio() {
  vozTurno++;
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  if (clip) { clip.pause(); clip = null; }
  $$(".speaking").forEach((b) => b.classList.remove("speaking"));
}
function applyAudio() {
  document.body.classList.toggle("muted", !audioOn);
  const b = $("#audioBtn");
  b.innerHTML = ico(audioOn ? "escuchar" : "silencio") + `<span>${(audioOn ? tr("audioOn") : tr("audioOff")).replace(SIN_EMOJI, "")}</span>`;
  b.setAttribute("aria-pressed", String(!audioOn));
  b.title = tr("audioTitulo");
  $$(".say").forEach((s) => (s.textContent = audioOn ? "🔊" : "💬"));
}
function toggleAudio() {
  audioOn = !audioOn;
  try { localStorage.setItem("muyuy-audio", audioOn ? "on" : "off"); } catch {}
  if (!audioOn) stopAudio();
  applyAudio();
  toast(audioOn ? tr("audioActivado") : tr("audioDesactivado"));
}

// La voz se elige según el idioma de la app: primero la del país (es-PE, en-US), luego cualquiera del mismo
// idioma (es-MX, es-ES, en-GB…). Si el equipo no tiene ninguna voz de ese idioma, se muestra el texto: nunca se lee
// un texto en español con una voz en inglés.
let VOCES = [];
function loadVoices() { if ("speechSynthesis" in window) VOCES = speechSynthesis.getVoices(); }
if ("speechSynthesis" in window) { loadVoices(); speechSynthesis.addEventListener("voiceschanged", loadVoices); }
function pickVoice(lang) {
  if (!VOCES.length) loadVoices();
  const want = LOCALE[lang].toLowerCase(), base = want.split("-")[0];
  const same = VOCES.filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith(base));
  const natural = (v) => /natural|neural|online|enhanced|premium|wavenet|google/i.test(v.name);
  const pais = (v) => v.lang.toLowerCase().replace("_", "-") === want;
  return same.find((v) => pais(v) && natural(v)) || same.find(natural)
    || same.find((v) => pais(v) && v.localService) || same.find(pais) || same[0] || null;
}
// Voces incluidas en Muyuy (scripts/build_voces.py): español e inglés con Piper y quechua con Meta MMS, generadas sin
// internet. Cada audio se busca por el código FNV-1a de "idioma|texto". Así la app habla en los tres idiomas aunque el
// equipo no tenga voces instaladas; si falta algún audio se usa la voz del sistema del mismo idioma.
let VOZ = null;
const fnv = (s) => { let h = 0x811c9dc5; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, "0"); };
// los audios van en Opus (pesan menos de la mitad que en MP3); si el navegador no lo reproduce (iPhone antiguos), se
// hace como si no hubiera audios y habla la voz del teléfono
const OPUS = (() => { try { return !!new Audio().canPlayType('audio/webm; codecs="opus"'); } catch { return false; } })();
async function vozLista() {
  if (!VOZ) { try { VOZ = OPUS ? await (await fetch("audio/voces.json")).json() : {}; } catch { VOZ = {}; } }
  return VOZ;
}
// los textos llevan espacios que no se parten (i18n.js, pegarFlechas) y uniones invisibles (iconos.js); los audios se
// generaron con espacios comunes: se buscan con el texto normalizado, si no «100 mm» o «→» dejaban sin audio
const sinPegar = (s) => String(s).replace(/[  ]/g, " ").replace(/⁠/g, "");
async function playClips(parts, btn) {
  const have = new Set((await vozLista())[LANG] || []), ids = parts.map((p) => fnv(`${LANG}|${sinPegar(p)}`));
  if (!ids.length || !ids.every((h) => have.has(h))) return false;
  stopAudio();
  const turno = ++vozTurno;
  if (btn) btn.classList.add("speaking");
  try {
    for (const h of ids) {
      if (turno !== vozTurno || !audioOn) break;
      const url = URL.createObjectURL(await (await fetch(`audio/voz/${LANG}/${h}.webm`)).blob());
      const a = new Audio(url);
      a.playbackRate = vozRate();
      clip = a;
      await new Promise((ok) => { a.onended = a.onerror = a.onpause = ok; a.play().catch(ok); });
      URL.revokeObjectURL(url);
    }
  } catch { return turno === vozTurno ? false : true; } finally { if (btn && turno === vozTurno) btn.classList.remove("speaking"); }
  return true;
}
const PAL_VOZ = {
  es: { de: "de", a: "a", luego: "luego", soles: "soles", pc: "por ciento", gr: "grados", coma: "coma", mas: "más", menos: "menos", mm: "milímetros",
        cm: "centímetros", km: "kilómetros", kg: "kilos", m: "metros", ha: "hectáreas", tha: "toneladas por hectárea", et: "evapotranspiración",
        meses: "enero febrero marzo abril mayo junio julio agosto setiembre octubre noviembre diciembre".split(" "), abr: "ene feb mar abr may jun jul ago set oct nov dic".split(" ") },
  en: { de: "of", a: "to", luego: "then", soles: "soles", pc: "percent", gr: "degrees", coma: "point", mas: "plus", menos: "minus", mm: "millimetres",
        cm: "centimetres", km: "kilometres", kg: "kilos", m: "metres", ha: "hectares", tha: "tonnes per hectare", et: "evapotranspiration",
        meses: "January February March April May June July August September October November December".split(" "), abr: "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ") },
};
function paraVoz(t, lang = LANG) {
  const w = PAL_VOZ[lang] || PAL_VOZ.es;
  t = String(t).replace(/<[^>]+>/g, " ").replace(/→/g, `, ${w.luego} `).replace(/[·—|]/g, ", ").replace(/…/g, ".").replace(/[«»“”"]/g, "");
  t = t.replace(/S\/\s?(\d[\d.,]*)/g, (_, n) => `${n} ${w.soles}`)
    .replace(/\b((?:19|20)\d\d)\s?[/–-]\s?(\d\d)\b/g, (_, a, b) => `${a} ${w.a} ${a.slice(0, 2)}${b}`) // 2024/25
    .replace(/\b(\d{4})\s?[–-]\s?(\d{4})\b/g, (_, a, b) => `${a} ${w.a} ${b}`)                         // 1981–2026
    .replace(/(\d+)\s?\/\s?(\d+)\b/g, (_, a, b) => `${a} ${w.de} ${b}`)                                 // 9/10
    .replace(/(\d),(\d{3})\b/g, "$1$2")                                                                  // 2,197
    .replace(/(\d)\.(\d)/g, `$1 ${w.coma} $2`)                                                          // 0.7
    .replace(/(\d)\s?t\/ha\b/g, `$1 ${w.tha}`).replace(/(\d)\s?%/g, `$1 ${w.pc}`).replace(/°\s?C\b|°/g, ` ${w.gr}`);
  for (const k of ["mm", "cm", "km", "kg", "ha", "m"]) t = t.replace(new RegExp(`(\\d)\\s?${k}\\b`, "g"), `$1 ${w[k]}`);
  t = t.replace(/(^|[^\w)])\+\s?(\d)/g, `$1${w.mas} $2`).replace(/(^|[^\w)])[−-]\s?(\d)/g, `$1${w.menos} $2`)
    .replace(/\bET[₀0c]?\b/g, w.et)
    .replace(new RegExp(`\\b(${w.abr.join("|")})\\b(?![\\wáéíóú])`, "g"), (m) => w.meses[w.abr.indexOf(m)])
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}\u{2300}-\u{23FF}\u{25A0}-\u{25FF}]/gu, " ");
  return t.replace(/\s+/g, " ").replace(/\s+([,.;:!?)])/g, "$1").replace(/^[\s,]+|[\s,]+$/g, "");
}
// quechua: cada frase con su audio (scripts/build_voces.py, «qu|f|frase»); la que no lo tiene, con la voz en castellano
// del teléfono (el quechua se escribe con letras que esa voz pronuncia bien), en vez de solo mostrar el texto
const FRASE_QU = (s) => s.replace(/<[^>]+>/g, " ").replace(/[^\p{L}\p{N}\s.,;:¿?¡!'’()%°-]/gu, " ").replace(/\s+/g, " ").trim();
// las listas llegan pegadas («chacra.Precios») y a veces con «..»: se separan antes de cortar las frases
const frasesQu = (t) => String(t).replace(/<[^>]+>/g, " ").replace(/\.{2,}/g, ".").replace(/([.!?])(?=[\p{Lu}¿¡])/gu, "$1 ").split(/(?<=[.!?])\s+|\n+/).map(FRASE_QU).filter((x) => /\p{L}{2}/u.test(x));
function tocarClip(url, turno) {
  return new Promise(async (ok) => {
    try {
      const u = URL.createObjectURL(await (await fetch(url)).blob()), a = new Audio(u);
      a.playbackRate = vozRate();
      clip = a;
      a.onended = a.onerror = a.onpause = () => { URL.revokeObjectURL(u); ok(); };
      if (turno !== vozTurno) { ok(); return; }
      a.play().catch(ok);
    } catch { ok(); }
  });
}
function decirSistema(texto, voz, lang) {
  return new Promise((ok) => {
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = voz ? voz.lang : lang;
    try { if (voz) u.voice = voz; } catch {}
    u.rate = 0.92 * vozRate();
    u.onend = u.onerror = () => ok();
    speechSynthesis.speak(u);
  });
}
// ¿al menos la mitad de las frases tienen audio de Muyuy? Si no, una sola voz (la del teléfono) para todo el texto
async function conFrases(clean) {
  const have = new Set((await vozLista())[LANG] || []), partes = frasesQu(clean);
  return partes.length > 0 && partes.filter((f) => have.has(fnv(`${LANG}|f|${f}`))).length * 2 >= partes.length;
}
async function hablarQu(clean, btn) {
  const L = LANG, have = new Set((await vozLista())[L] || []), partes = frasesQu(clean);
  if (!partes.length) return;
  const lv = L === "qu" ? "es" : L; // el quechua sin audio lo dice la voz en castellano
  const voz = "speechSynthesis" in window ? pickVoice(lv) : null;
  if (!partes.some((f) => have.has(fnv(`${L}|f|${f}`))) && !voz) { toast(clean, 6000); return; }
  stopAudio();
  const turno = ++vozTurno;
  if (btn) btn.classList.add("speaking");
  try {
    for (const f of partes) {
      if (turno !== vozTurno || !audioOn) break;
      const h = fnv(`${L}|f|${f}`);
      if (have.has(h)) await tocarClip(`audio/voz/${L}/${h}.webm`, turno);
      else if (voz) await decirSistema(paraVoz(f, lv), voz, L === "qu" ? "es-PE" : LOCALE[L]);
      else toast(f, 5000); // sin audio ni voz en castellano en este teléfono: se muestra
    }
  } finally { if (btn && turno === vozTurno) btn.classList.remove("speaking"); }
}
async function speakText(text, btn, parts) {
  // tocar otra vez el mismo botón mientras habla: se calla (en todos los 🔊 de la app)
  if (btn && btn.classList.contains("speaking")) { stopAudio(); return; }
  const clean = sinPegar(text.replace(/<[^>]+>/g, ""));
  if (!audioOn) { toast(clean, 6000); return; } // sin audio: texto
  if (await playClips(parts || [clean.trim()], btn)) return; // voz incluida en Muyuy
  if (LANG === "qu") return hablarQu(clean, btn); // quechua: frase por frase
  if (await conFrases(clean)) return hablarQu(clean, btn); // español e inglés: frase por frase si la mayoría tiene audio
  if (!("speechSynthesis" in window)) { toast(clean, 6000); return; }
  const voz = pickVoice(LANG);
  if (!voz && VOCES.length) { toast(tr("sinVozIdioma") + " " + clean, 8000); return; }
  const u = new SpeechSynthesisUtterance(paraVoz(clean)); // sin íconos y con los signos en palabras
  u.lang = voz ? voz.lang : LOCALE[LANG];
  try { if (voz) u.voice = voz; } catch {} // u.lang ya fija el idioma si el navegador no acepta la voz
  u.rate = 0.95 * vozRate();
  $$(".speaking").forEach((b) => b.classList.remove("speaking"));
  if (btn) { btn.classList.add("speaking"); u.onend = u.onerror = () => btn.classList.remove("speaking"); }
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}
function speak(seq, v, btn) {
  const names = seq.map((c) => cname(c).toLowerCase()).join(tr("luego"));
  const raz = v[F.raz].slice(0, 2).map((i) => txt(i)).join(" ");
  const texto = tr("voz", { c: names, n: ten(v[F.rob]), m: ten(v[F.nino]), r: raz });
  if (!audioOn) return toast(texto, 7000); // sin audio: se muestra el texto
  // con las voces incluidas se arma la frase por piezas: {c} cultivos, {n} y {m} números; las razones quedan en pantalla
  const [p0, p1, p2, p3] = tr("voz").split(/\{\w\}/).map((s) => s.trim()), luego = tr("luego").replace(/[,\s]+/g, " ").trim();
  const partes = [p0, ...seq.flatMap((c, k) => (k ? [luego, cname(c).toLowerCase()] : [cname(c).toLowerCase()])),
    p1, String(ten(v[F.rob])), p2, String(ten(v[F.nino])), p3].filter((x) => x && /[\p{L}\d]/u.test(x)); // sin piezas de solo puntuación
  speakText(texto, btn, partes);
}

function printCard(el) {
  const c = D.contexto;
  const area = $("#printArea");
  const suelo = String((D.suelo_txt && D.suelo_txt[LANG]) || c.suelo).split(/\s*,\s+/).join("<br>");
  area.innerHTML = `<h1>${tr("tituloImp")}</h1><table class="print-ctx">
    <tr><th>${tr("lugar")}</th><td>${c.lugar}</td></tr>
    <tr><th>${tr("altura")}</th><td>${c.altura} m</td></tr>
    <tr><th>${tr("pendiente")}</th><td>${c.pendiente} %</td></tr>
    <tr><th>${tr("suelo")}</th><td>${suelo}</td></tr></table>`;
  const copy = el.cloneNode(true);
  $$("details", copy).forEach((d) => (d.open = true));
  area.appendChild(copy);
  window.print();
}

// ---------------------------------------------------------------- explore su rotación
function renderPalette() {
  const pal = $("#palette");
  const chip = ([id, c]) =>
    `<span class="chip ${c.factible ? "" : "off"} ${esClaro(c.color) ? "claro" : ""}" draggable="${c.factible}" data-id="${id}" style="background:${c.color}"
      role="button" tabindex="${c.factible ? 0 : -1}" title="${c.factible ? (c.nombre_qu || cname(id)) : tr("noAltura")}">${cico(id, "chip-ico")} ${cname(id)}</span>`;
  const todos = Object.entries(D.cultivos), asoc = todos.filter(([, c]) => c.grupo === "asociacion");
  pal.innerHTML = todos.filter(([, c]) => c.grupo !== "asociacion").map(chip).join("") +
    (asoc.length ? `<span class="pal-sep">🤝 ${tr("asocPal")}</span>${asoc.map(chip).join("")}` : "");
  $("#palNota").hidden = !$(".chip.off", pal);
  $("#palNota").textContent = tr("palNota");
  $$(".chip:not(.off)", pal).forEach((ch) => {
    ch.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", ch.dataset.id); ch.classList.add("dragging"); });
    ch.addEventListener("dragend", () => ch.classList.remove("dragging"));
    const pick = () => {
      const vacia = custom.findIndex((x) => !x);
      if (vacia >= 0) return setSlot(vacia, ch.dataset.id);
      $$(".chip", pal).forEach((x) => x.classList.remove("sel"));
      picked = picked === ch.dataset.id ? null : ch.dataset.id;
      if (picked) { ch.classList.add("sel"); toast(tr("toqueCampania", { c: cname(picked).toLowerCase() }), 2200); }
      $$(".slot").forEach((s) => s.classList.toggle("ready", !!picked));
    };
    ch.addEventListener("click", pick);
    ch.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
  });
  $$(".slot").forEach((s, i) => ($("small", s).textContent = tr("campania", { n: i + 1 })));
}

function setSlot(i, id) {
  custom[i] = id;
  const s = $$(".slot")[i], c = D.cultivos[id];
  s.classList.remove("filled"); void s.offsetWidth;
  s.classList.add("filled");
  s.style.background = c.color;
  s.classList.toggle("claro", esClaro(c.color));
  $("b", s).innerHTML = `${cico(id, "slot-ico")} ${cname(id)}`;
  picked = null;
  $$(".chip").forEach((x) => x.classList.remove("sel"));
  $$(".slot").forEach((x) => x.classList.remove("ready"));
  renderCustom();
  if (custom.every(Boolean) && !$("#verdict").hidden) $("#verdict").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
}

// Reglas de rotación que se pueden decir sin simular (familias, leguminosas, descanso, altura), para cada par de
// campañas seguidas como hace el motor (muyuy/explain.py). Dan razones aunque la combinación no esté entre las
// rotaciones guardadas de ese lugar.
const DA_N = new Set(["leguminosa", "cobertura", "asociacion"]);   // dejan nitrógeno (la asociación lleva vicia o frijol)
const PIDE_N = new Set(["cereal", "tuberculo", "pseudocereal", "raiz", "fibra", "hortaliza"]);
function reglasRot(sel) {
  let ok = [], famOk = 0;
  const ojo = [], mal = [];
  const C = (id) => D.cultivos[id], nom = (id) => cname(id);
  sel.forEach((id) => { if (id && !C(id).factible) mal.push(tr("rAltura", { c: nom(id) })); });
  [...new Set(sel)].forEach((id) => { if (id && typeof CAMPO !== "undefined" && CAMPO.noRegion(id)) ojo.push(tr("rRegion", { c: nom(id), d: CAMPO.depNombre() })); }); // Midagri
  [[0, 1], [1, 2]].forEach(([i, j]) => {
    const a = sel[i], b = sel[j];
    if (!a || !b) return;
    const fa = C(a).familia, fb = C(b).familia;
    if (a === b && C(a).grupo !== "descanso") ojo.push(tr("rMismo", { a: nom(a) }));
    else if (fa === fb && fa !== "Descanso") ojo.push(tr("rFamilia", { a: nom(a), b: nom(b).toLowerCase() }));
    else if (fa !== "Descanso" && fb !== "Descanso") { ok.push(tr("rFamOk", { a: nom(a), b: nom(b).toLowerCase() })); famOk++; }
    if (DA_N.has(C(a).grupo) && PIDE_N.has(C(b).grupo)) ok.push(tr("rNitro", { a: nom(a), b: nom(b).toLowerCase() }));
  });
  if (famOk === 2) { // dos frases casi iguales: una sola
    const pares = [[sel[0], sel[1]], [sel[1], sel[2]]].map(([a, b]) => tr("rFamOk", { a: nom(a), b: nom(b).toLowerCase() }));
    ok = [tr("rFamOk3", { a: nom(sel[0]), b: nom(sel[1]).toLowerCase(), c: nom(sel[2]).toLowerCase() }), ...ok.filter((x) => !pares.includes(x))];
  }
  const full = sel.every(Boolean);
  const descansa = sel.find((id) => id && ["descanso", "cobertura"].includes(C(id).grupo));
  if (descansa) ok.push(tr("rDescansa", { a: nom(descansa).toLowerCase() }));
  if (full && !sel.some((id) => DA_N.has(C(id).grupo) || C(id).grupo === "descanso")) ojo.push(tr("rCansa"));
  return { ok: [...new Set(ok)], ojo: [...new Set(ojo)], mal };
}
// una idea concreta cuando hay plagas por familia o la tierra se cansa: poner una leguminosa de la zona
function ideaRot(sel, r) {
  if (!r.ojo.length && !r.mal.length) return "";
  const legs = Object.keys(D.cultivos).filter((id) => D.cultivos[id].grupo === "leguminosa" && D.cultivos[id].factible).slice(0, 2).map(cname);
  return legs.length ? tr("rIdea", { l: legs.join(tr("rY")).toLowerCase() }) : "";
}
const lineas = (xs, cls, ic) => xs.length ? `<ul class="why-l ${cls}">${xs.map((x) => `<li><span aria-hidden="true">${ic}</span> ${x}</li>`).join("")}</ul>` : "";

function renderCustom() {
  const out = $("#custom"), verdict = $("#verdict"), arm = $("#armado");
  const n = custom.filter(Boolean).length, r = reglasRot(custom);
  // mientras arma: qué falta y lo que ya se puede decir
  if (n < 3) {
    out.innerHTML = "";
    verdict.hidden = true;
    renderPrueba();
    const faltan = custom.map((x, i) => (x ? null : i + 1)).filter(Boolean);
    arm.innerHTML = !n ? `<p class="arm-paso">${tr("armPaso1")}</p>`
      : `<p class="arm-paso">${tr(r.mal.length + r.ojo.length + r.ok.length ? "armFalta" : "armFaltaSolo", { c: faltan.join(tr("rY")) })}</p>` + lineas(r.mal, "mal", "✖") + lineas(r.ojo, "alert", "⚠") + lineas(r.ok, "ok", "✔");
    return;
  }
  arm.innerHTML = "";
  const seq = custom.join("|"), v = D.rotaciones[seq];
  const act = D.perfil.rotacion_actual, va = act && D.rotaciones[act];
  // veredicto: con la simulación de los 42 años si esta combinación está guardada; si no, con las reglas
  let nivel, resumen, cifra = "";
  if (v) {
    const r10 = ten(fracOf(v)), peorHoy = va && seq !== act && r10 < ten(fracOf(va));
    nivel = r.mal.length || r10 < 4 ? "mal" : r10 >= 7 && !r.ojo.length && !peorHoy ? "bien" : "medio";
    cifra = `<p class="v-num">${tr("vNum", { n: r10 })}</p>`;
    resumen = va && seq !== act ? tr("vHoyNum", { h: ten(fracOf(va)) }) : seq === act ? tr("vEsHoy") : "";
  } else {
    nivel = r.mal.length || r.ojo.length >= 2 ? "mal" : r.ojo.length || !r.ok.length ? "medio" : "bien";
    resumen = tr("vReglas");
  }
  const best = ranked()[0];
  const mejor = nivel !== "bien" && best && best[0] !== seq ? `<p class="v-mejor">${tr("vVerOpcion", { r: best[0].split("|").map(cname).join(" → "), n: ten(fracOf(best[1])) })}</p>` : "";
  verdict.className = "verdict " + { bien: "good", medio: "meh", mal: "bad" }[nivel];
  verdict.hidden = false;
  verdict.innerHTML = `<span class="v-anim"></span><div class="v-body">
    ${cifra}${resumen ? `<p class="v-resumen">${resumen}</p>` : ""}<p class="v-titulo">${tr("v_" + nivel)}</p>
    ${lineas(r.mal, "mal", "✖")}${lineas(r.ok, "ok", "✔")}${lineas(r.ojo, "alert", "⚠")}
    ${ideaRot(custom, r) ? `<p class="v-idea">💡 ${ideaRot(custom, r)}</p>` : ""}${mejor}</div>`;
  const rk = v ? riskOf(v, seq)[0] : "sol";
  lottieIn($(".v-anim", verdict), nivel === "bien" ? "exito" : rk === "exito" ? "sol" : rk, false);
  out.innerHTML = "";
  if (v) { // la tarjeta completa, igual que las de Rotaciones
    const el = $("#tpl-card").content.firstElementChild.cloneNode(true);
    const det = document.createElement("details");
    det.className = "cu-mas";
    det.innerHTML = `<summary>${tr("cuDetalle")}</summary>`;
    det.appendChild(el);
    out.appendChild(det);
    fillCard(el, seq, v, tr("suRot"), null);
  }
  renderPrueba(); // ahora.js: probarla en un pedazo de la chacra
  nudge();
}

function initSlots() {
  $$(".slot").forEach((s) => {
    const i = +s.dataset.i;
    s.addEventListener("dragover", (e) => { e.preventDefault(); s.classList.add("over"); });
    s.addEventListener("dragleave", () => s.classList.remove("over"));
    s.addEventListener("drop", (e) => {
      e.preventDefault(); s.classList.remove("over");
      const id = e.dataTransfer.getData("text/plain");
      if (id) setSlot(i, id);
    });
    const tap = () => { if (picked) setSlot(i, picked); else if (custom[i]) vaciarSlot(i); else toast(tr("toqueCultivo")); };
    s.addEventListener("click", tap);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(); } });
  });
  $("#clearSlots").onclick = resetSlots;
  // las campañas quedan fijas debajo de la barra de pasos
  const barra = $(".stepper"), alto = () => document.documentElement.style.setProperty("--pasos-alto", `${barra.offsetHeight}px`);
  if (barra) { alto(); if ("ResizeObserver" in window) new ResizeObserver(alto).observe(barra); }
}

// tocar una campaña llena la deja vacía, para cambiar ese cultivo
function vaciarSlot(i) {
  custom[i] = null;
  const s = $$(".slot")[i];
  s.classList.remove("filled", "ready", "claro"); s.style.background = ""; $("b", s).textContent = "＋";
  renderCustom();
}
function resetSlots() {
  custom = [null, null, null];
  $$(".slot").forEach((s) => { s.classList.remove("filled", "ready", "claro"); s.style.background = ""; $("b", s).textContent = "＋"; });
  $("#custom").innerHTML = "";
  $("#verdict").hidden = true;
  if (D) renderCustom(); // vuelve a mostrar el primer paso
}

// ---------------------------------------------------------------- ayuda por voz (Medhi et al.: voz y ayuda siempre en el mismo lugar)
function sayText(text, btn) { speakText(text, btn); }
function initHelp() {
  $("#audioBtn").onclick = toggleAudio;
  $$("main .say").forEach((b) => (b.onclick = () => sayText(tr(b.dataset.say), b)));
  $("#helpBtn").onclick = $("#helpBtn2").onclick = () => startTour(); // «?» lleva directo al recorrido guiado
}

// ---------------------------------------------------------------- 3. rotación de hoy y años recordados (Hansen et al.: empezar por la memoria)
const preciosPropios = (seq) => !!seq && typeof CRITERIO !== "undefined" && CRITERIO.usaPrecios(seq).length > 0;
const robustTxt = (n) => (escenario === "todos" ? tr("robust2", { n }) : tr("robustEsc", { esc: tr("esc_" + escenario), n }));

// Sin servidor, la rotación que contó el agricultor casi nunca está entre las guardadas de ese lugar: igual se muestra
// (sus 3 campañas con meses), con el juicio de las reglas de rotación y un botón para probarla en el paso 5
function hoySinSimular(box, seq) {
  const r = reglasRot(seq);
  const nivel = r.mal.length || r.ojo.length >= 2 ? "mal" : r.ojo.length || !r.ok.length ? "medio" : "bien";
  $("#hoyFuente").innerHTML = tr("hoyFuenteE");
  box.innerHTML = `<article class="rot hoy-lite"><header><span class="rank">${tr("hoyActual")}</span></header>
    <ol class="timeline">${timeline(seq, [0, 0, 0])}</ol>
    <div class="verdict ${{ bien: "good", medio: "meh", mal: "bad" }[nivel]}"><div class="v-body">
      <p class="v-titulo">${tr("v_" + nivel)}</p><p class="v-resumen">${tr("hoyLiteRes")}</p>
      ${lineas(r.mal, "mal", "✖")}${lineas(r.ok, "ok", "✔")}${lineas(r.ojo, "alert", "⚠")}
      ${ideaRot(seq, r) ? `<p class="v-idea">💡 ${ideaRot(seq, r)}</p>` : ""}</div></div>
    <p class="hoy-s">${tr("hoyLiteNota")}</p>
    <div class="actions"><button type="button" class="hoy-probar">${tr("hoyProbar")}</button></div></article>`;
  $(".hoy-probar", box).onclick = () => { resetSlots(); seq.forEach((c, i) => setSlot(i, c)); irA("#pruebe"); };
}

// ¿Así le fue?: lo que vivió el agricultor en los años recordados. Queda en este teléfono y no cambia el cálculo
const MEM_KEY = "muyuy-memoria";
function memoriaDe() { try { return JSON.parse(localStorage.getItem(MEM_KEY)) || {}; } catch { return {}; } }
function pintarMemoria() {
  const r = (memoriaDe()[D.sitio]) || {}, ul = $("#memoria");
  $$("li", ul).forEach((li) => {
    const v = r[li.dataset.y];
    $$(".mem-r button", li).forEach((b) => { const on = b.dataset.r === v; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    $(".mem-x", li).hidden = v !== "no";
  });
  ul.onclick = (e) => {
    const b = e.target.closest(".mem-r button");
    if (!b) return;
    const todo = memoriaDe(), y = b.closest("li").dataset.y, de = (todo[D.sitio] = todo[D.sitio] || {});
    if (de[y] === b.dataset.r) delete de[y]; else de[y] = b.dataset.r;
    try { localStorage.setItem(MEM_KEY, JSON.stringify(todo)); } catch {}
    pintarMemoria();
  };
}
// Paso 3 en el orden de una historia: 1) lo que siembra hoy, 2) cómo le fue en los 42 años (medidor, repaso,
// cuadros y leyenda juntos), 3) los años que recuerda la comunidad, 4) según el tipo de año, 5) por qué, plan y botones
function renderHoy() {
  const seq = D.perfil.rotacion_actual, v = seq && D.rotaciones[seq];
  const box = $("#hoyCard"), mem = $("#memoria"), stash = $("#hoyStash");
  ["#replayRow", "#hoyLegend", "#hoyMem"].forEach((s) => stash.appendChild($(s))); // antes de vaciar la tarjeta
  box.before($("#hoyNota")); // sin rotación calculada la nota queda sola, arriba
  const ys = Object.keys(D.recordados || {}).map(Number), p = D.perfil;
  // de dónde sale "lo que siembra hoy": lo que contó el agricultor en el paso 1 o el supuesto de la región
  const fuente = p.desdeCierre ? tr("hoyFuenteC", { f: p.desdeCierre }) : p.entrevista ? tr("hoyFuenteE") : tr("hoyFuenteS");
  $("#hoyFuente").innerHTML = v ? fuente : "";
  // sin entrevista todo se calcula con un perfil de ejemplo: la primera vez el formulario del paso 1 viene abierto
  const ent = $("#entrevista");
  if (ent) {
    ent.classList.toggle("pendiente", !p.entrevista);
    if (!p.entrevista && !ent.dataset.abierto) { ent.open = true; ent.dataset.abierto = "1"; }
  }
  if (!v) {
    mem.innerHTML = "";
    const pedida = p.rotacion_pedida && p.rotacion_pedida.split("|").filter((c) => D.cultivos[c]);
    if (pedida && pedida.length === 3) return hoySinSimular(box, pedida); // la suya, aunque no esté calculada aquí
    const dichas = (p.campanias_texto || []).map((t) => t.trim());
    const fuera = dichas.filter((t) => t && !cultivoDe(t));
    const vacias = dichas.length < 3 || dichas.some((t) => !t);
    const arroz = fuera.some(esArroz), otros = fuera.filter((t) => !esArroz(t));
    const msg = !p.entrevista ? tr("hoyNada")
      : arroz ? tr("hoyArroz") + (otros.length ? " " + tr("hoyFuera", { c: otros.map((t) => `«${esc(t)}»`).join(tr("rY")) }) : "")
      : fuera.length ? tr("hoyFuera", { c: fuera.map((t) => `«${esc(t)}»`).join(tr("rY")) })
      : vacias ? tr("hoyFaltan") : tr("hoyNada");
    box.innerHTML = `<p class="hoy-falta">${msg}</p>`;
    return;
  }
  mem.innerHTML = ys.map((y) => {
    const i = D.anios.indexOf(y), ok = i >= 0 && v[F.grilla][i] === "1";
    return i < 0 || i >= v[F.grilla].length ? "" :
      `<li class="${ok ? "ok" : "bad"}" data-y="${y}"><span class="mem-t"><b>★ ${recLabel(y)}</b> → ${ok ? "✔ " + tr("recOk") : "✖ " + tr("recMal")}</span>
        <span class="mem-r" role="group" aria-label="${tr("memAsi")}"><button type="button" data-r="si">${tr("eSi")}</button><button type="button" data-r="no">${tr("eNo")}</button></span><span class="mem-x" hidden>${tr("memNo")}</span></li>`;
  }).join("");
  pintarMemoria();
  $("#hoyMem").hidden = !mem.children.length;
  const el = $("#tpl-card").content.firstElementChild.cloneNode(true);
  box.innerHTML = "";
  box.appendChild(el);
  fillCard(el, seq, v, tr("hoyActual"), null);
  // la tarjeta ya trae el orden (plantilla tpl-card); aquí se suman el título, el repaso, la leyenda y los años recordados
  const h3 = Object.assign(document.createElement("h3"), { className: "hoy-h", textContent: tr("hoy42T") });
  // primero la respuesta: ¿le funciona lo que siembra? Después de qué rotación se habla y sus cultivos
  const resp = $(".robust-row", el);
  el.prepend(resp);
  resp.after($("#hoyNota"));
  $(".grid-s", el).before(h3, $("#replayRow"));
  $(".grid", el).after($("#hoyLegend"));
  $("#hoyLegend").after($("#hoyMem"));
}

// ---------------------------------------------------------------- 6. juego del muyuy comunal
let sectores = [];
function gameOptions() {
  const top = ranked().slice(0, 12).map((x) => x[0]);
  const act = D.perfil.rotacion_actual;
  const rot = (q, k) => { const a = q.split("|"); return [...a.slice(k), ...a.slice(0, k)].join("|"); };
  const base = act && D.rotaciones[act] ? [act, rot(act, 1), rot(act, 2)] : [];
  const opts = [...new Set([...base, ...top])].filter((q) => D.rotaciones[q]);
  return opts.length ? opts : Object.keys(D.rotaciones); // muy alto: solo queda el descanso
}
const seqName = (q) => q.split("|").map((c) => `${EMOJI[D.cultivos[c].grupo] || ""} ${cname(c)}`).join(" → ");
function presetGame(kind) {
  const opts = gameOptions(), act = D.perfil.rotacion_actual && D.rotaciones[D.perfil.rotacion_actual] ? D.perfil.rotacion_actual : opts[0];
  const a = act.split("|");
  if (typeof ayCancelar === "function") ayCancelar();
  if (kind === "igual") sectores = [act, act, act];
  else {
    const el = [...new Set([0, 1, 2].map((k) => [...a.slice(k), ...a.slice(0, k)].join("|")).filter((q) => D.rotaciones[q]))];
    const libres = opts.filter((q) => !el.includes(q)), primero = (q) => q.split("|")[0];
    // con un solo cultivo girar no cambia nada: se completa con opciones que empiecen con otro cultivo
    for (const q of libres) if (el.length < 3 && !el.some((x) => primero(x) === primero(q))) el.push(q);
    for (const q of libres) if (el.length < 3 && !el.includes(q)) el.push(q);
    while (el.length < 3) el.push(act);
    sectores = el.slice(0, 3);
  }
  renderGame();
}
function renderGame() {
  const opts = gameOptions();
  sectores = sectores.map((q) => (D.rotaciones[q] ? q : opts[0]));
  $("#sectores").innerHTML = sectores.map((q, k) => `<label class="sector"><b>${tr("aySector", { n: k + 1 })}</b>
    <select data-k="${k}">${[...new Set([q, ...opts])].map((o) => `<option value="${o}" ${o === q ? "selected" : ""}>${seqName(o)}</option>`).join("")}</select></label>`).join("");
  $$("#sectores select").forEach((s) => (s.onchange = () => { sectores[+s.dataset.k] = s.value; ayCancelar(); $("#rondas").innerHTML = ""; $("#leccion").hidden = true; $("#marcador").hidden = true; pintarChacras(null); }));
  pintarChacras(null);
}
// el juego animado del ayllu, el duelo y la qocha están en games.js
function initGame() {
  $("#gMuyuy").onclick = () => presetGame("muyuy");
  $("#gIgual").onclick = () => presetGame("igual");
  initJuegos();
}

// ---------------------------------------------------------------- 7. cierre de la campaña (se guarda en este teléfono)
const REG_KEY = "muyuy-registro";
function getReg() { try { return JSON.parse(localStorage.getItem(REG_KEY)) || []; } catch { return []; } }
// la cosecha se anota en la unidad del agricultor y se guarda en kg. El saco varía según el cultivo y la zona: es aproximado
// quintal = 100 libras, arroba = 25 libras (libra peruana ≈ 0,46 kg). El saco no tiene un peso único: lo dice el agricultor
const C_UNIDAD = { kg: 1, arroba: 11.5, quintal: 46, saco: 0 };
const factorU = () => { const u = $("#cUnidad").value || "kg"; return u === "saco" ? +$("#cSacoKg").value || 0 : C_UNIDAD[u]; };
function cierreUnidad() {
  const u = $("#cUnidad").value || "kg", f = factorU(), q = +$("#cKg").value, sk = $("#cSacoKg");
  sk.hidden = u !== "saco"; sk.placeholder = tr("cSacoQ"); sk.setAttribute("aria-label", tr("cSacoQ"));
  $("#cPrecioT").textContent = tr("qPrecioU", { u: tr("cN_" + u) });
  $("#cKgEq").textContent = q > 0 && f > 0 && f !== 1 ? tr("cEq", { v: num(Math.round(q * f)) }) : "";
  $("#cPrecioL").hidden = $("#cNoVendi").checked;
}
function renderCierre() {
  const opts = [...new Set([D.perfil.rotacion_actual, ...ranked().slice(0, 3).map((x) => x[0])].filter((q) => q && D.rotaciones[q]))];
  $("#cSembro").innerHTML = opts.map((q) => `<option value="${q}">${seqName(q)}</option>`).join("") + `<option value="otra">${tr("otra")}</option>`;
  const reg = getReg().filter((r) => r.sitio === D.sitio);
  $("#cierreAviso").hidden = reg.length > 0; // quien ya anotó una cosecha no necesita el aviso
  const uni = $("#cUnidad").value || "kg";
  $("#cUnidad").innerHTML = Object.keys(C_UNIDAD).map((u) => `<option value="${u}"${u === uni ? " selected" : ""}>${tr("cU_" + u)}</option>`).join("");
  cierreUnidad();
  $("#registro").innerHTML = reg.length ? reg.map((r) => {
    const name = r.seq === "otra" ? tr("otra") : D.rotaciones[r.seq] ? seqName(r.seq) : r.seq;
    const ing = r.kg && r.precio ? " · " + tr("ingresoReg", { v: num(r.kg * r.precio) }) : "";
    return `<li><b>${r.fecha}</b> · ${name} · ${r.kg || "—"} kg${ing} · ${tr(r.como || "regular")}</li>`;
  }).join("") : `<li>${tr("sinRegistro")}</li>`;
  renderAcierto(); // ahora.js
}
function initCierre() {
  ["#cUnidad", "#cKg", "#cSacoKg", "#cNoVendi"].forEach((q) => $(q).addEventListener("input", cierreUnidad));
  $("#cierreForm").addEventListener("reset", () => setTimeout(cierreUnidad, 0));
  $("#cierreForm").onsubmit = (e) => {
    e.preventDefault();
    const como = ($('input[name="como"]:checked') || {}).value;
    if (!como) { toast(tr("cFaltaComo")); $(".como").scrollIntoView({ block: "center" }); return; } // antes guardaba «regular» sin que lo dijera
    if ($("#cUnidad").value === "saco" && !factorU() && (+$("#cKg").value || +$("#cPrecio").value)) { toast(tr("cFaltaSaco")); $("#cSacoKg").focus(); return; }
    const fU = factorU() || 1;
    const reg = getReg();
    reg.push({ fecha: hoyISO(), sitio: D.sitio, seq: $("#cSembro").value,
               kg: Math.round((+$("#cKg").value || 0) * fU * 10) / 10, precio: $("#cNoVendi").checked ? 0 : (+$("#cPrecio").value || 0) / fU, como,
               acierto: ($('input[name="acierto"]:checked') || {}).value || "", semaforo: semaforoAlSembrar() }); // ahora.js
    try { localStorage.setItem(REG_KEY, JSON.stringify(reg)); } catch {}
    toast(tr("guardado"));
    const seq = $("#cSembro").value;
    e.target.reset();
    // lo que sembró es ahora «lo que siembra hoy» en los pasos 3 y 4
    if (seq && seq !== "otra" && D.rotaciones[seq] && seq !== D.perfil.rotacion_actual) {
      D.perfil = { ...D.perfil, rotacion_actual: seq, desdeCierre: reg[reg.length - 1].fecha };
      renderHoy(); lastTop = ""; renderTop(); if (typeof CAMPO !== "undefined") CAMPO.alOrden();
    }
    renderCierre();
    nudge();
  };
}

// ---------------------------------------------------------------- entrevista (paso 1)
// Lo que cuenta el agricultor va primero en el paso 1 porque cambia el cálculo. Las 3 últimas campañas son "lo que
// siembra hoy" del paso 3 (la última es el cultivo anterior); heladas, granizo, riego, textura, terrazas y abono entran
// al motor. Cada entrevista se guarda en el teléfono y se descarga en CSV (una fila por entrevista) para el equipo.
// Con el servidor, POST /perfil vuelve a probar las rotaciones con esas respuestas; sin él, el paso 3 usa su rotación
// solo si ya estaba calculada.
const ENT_KEY = "muyuy-entrevistas";
const RIEGOS = [0, 100, 200, 300]; // no · poco · regular · bastante (mm por campaña)
const TEXTURAS = ["arenosa", "franca", "negra", "arcillosa"]; // las que entiende muyuy/soil.py
// cómo se ve un puñado de tierra húmeda apretado: suelto, en bola, oscuro, en cinta
const TEX_DIBUJO = {"arenosa": "<circle cx=\"12\" cy=\"30\" r=\"3\"/><circle cx=\"22\" cy=\"34\" r=\"2.5\"/><circle cx=\"31\" cy=\"28\" r=\"3\"/><circle cx=\"40\" cy=\"35\" r=\"2.5\"/><circle cx=\"18\" cy=\"22\" r=\"2\"/><circle cx=\"35\" cy=\"20\" r=\"2\"/><circle cx=\"27\" cy=\"38\" r=\"2\"/><circle cx=\"46\" cy=\"27\" r=\"2.5\"/>", "franca": "<path d=\"M14 30c0-9 7-15 15-15s15 6 15 15-7 13-15 13-15-4-15-13z\"/><path class=\"tx-r\" d=\"M22 24l5 5-3 6M36 22l-3 7 5 4\"/>", "negra": "<path class=\"tx-n\" d=\"M10 36c2-8 8-12 14-12 3-5 10-7 15-3 6 0 10 6 9 13-1 5-8 6-19 6-11 0-20 0-19-4z\"/><circle class=\"tx-n\" cx=\"16\" cy=\"40\" r=\"2\"/><circle class=\"tx-n\" cx=\"46\" cy=\"40\" r=\"2\"/>", "arcillosa": "<path d=\"M6 30c8-10 16 6 24-2s14-10 24-2c-8 10-16-6-24 2S14 38 6 30z\"/>", "": "<text x=\"29\" y=\"38\" text-anchor=\"middle\" font-size=\"26\" font-weight=\"700\">?</text>"};
const getEnt = () => { try { return JSON.parse(localStorage.getItem(ENT_KEY)) || []; } catch { return []; } };
// Cultivos comunes del Perú que no están en las tablas del motor: se sugieren igual para anotar lo que dijo el
// agricultor (van al CSV como "campanias_dichas"), pero no cambian el cálculo
// Solo cultivos de campaña: los perennes de árbol, enredadera o plantación (café, cacao, frutales, caña, espárrago…) no se
// rotan y no se sugieren; la yuca y los de ciclo corto sí.
const OTROS_CULTIVOS = ["Aguaymanto", "Ají", "Ajo", "Algodón", "Arroz", "Arveja", "Avena", "Camote", "Cebada", "Cebolla",
  "Fresa", "Frijol", "Haba", "Kiwicha", "Lechuga", "Maca", "Maíz", "Maní", "Oca", "Olluco", "Papa", "Papaya", "Pepino", "Piña",
  "Quinua", "Sandía", "Tarwi", "Tomate", "Trigo", "Yacón", "Yuca", "Zanahoria", "Zapallo"];
const normTxt = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
let SUG = []; // [{id|null, nombre}] del sitio actual: primero los de la tabla del motor
const CAMPOS = ["#eC1", "#eC2", "#eC3"]; // última, anterior, hace 3

// lo escrito → id de la tabla (si coincide con un cultivo que el motor simula) o null
// "maiz" → Maíz amiláceo: si lo escrito es el comienzo de un solo cultivo de la tabla, se toma ese
const cultivoDe = (txt) => {
  const n = normTxt(txt), tabla = SUG.filter((o) => o.id);
  if (!n) return null;
  const igual = tabla.find((o) => normTxt(o.nombre) === n);
  if (igual) return igual.id;
  const empieza = tabla.filter((o) => normTxt(o.nombre).startsWith(n + " "));
  return empieza.length === 1 ? empieza[0].id : null;
};
// el arroz de riego (en poza) no se calcula: gasta mucha más agua de la que el balance de Muyuy simula. En la selva el
// arroz de secano sí está en la tabla, y cultivoDe lo reconoce
const esArroz = (t) => /^arroz\b/.test(normTxt(t)) && !cultivoDe(t);
const opciones = (vals, sel, label) => vals.map((v, i) => `<option value="${v}"${v === sel ? " selected" : ""}>${label(v, i)}</option>`).join("");

function renderEntrevista() {
  const p = D.perfil;
  const tabla = Object.keys(D.cultivos).map((id) => ({ id, nombre: cname(id) }));
  const vistos = new Set(tabla.map((o) => normTxt(o.nombre)));
  // fuera quedan los nombres que ya están en la tabla o que son el comienzo de uno ("Avena" → Avena forrajera, Avena con vicia)
  const enTabla = (n) => vistos.has(normTxt(n)) || [...vistos].some((t) => t.startsWith(normTxt(n) + " "));
  SUG = [...tabla, ...OTROS_CULTIVOS.filter((n) => !enTabla(n)).map((nombre) => ({ id: null, nombre }))];
  // las 3 campañas: lo que dijo (si hay entrevista) o vacío; el supuesto de la región no se escribe por el agricultor
  const dichas = p.entrevista ? p.campanias_texto || [] : [];
  CAMPOS.forEach((s, i) => { $(s).placeholder = tr("eAntPh"); $(s).value = dichas[i] || ""; });
  cerrarSug();
  const cinco = (v) => `<option value="">${tr("eNoSabe")}</option>` + opciones([0, 1, 2, 3, 4, 5], v, (n) => `${n} / 5`);
  $("#eHeladas").innerHTML = cinco(p.entrevista ? p.heladas_campanias : null);
  $("#eGranizo").innerHTML = cinco(p.entrevista ? p.granizo_anios : null);
  const r0 = RIEGOS.reduce((a, b) => (Math.abs(b - (p.riego_mm || 0)) < Math.abs(a - (p.riego_mm || 0)) ? b : a));
  $("#eRiego").innerHTML = opciones(RIEGOS, r0, (r, i) => tr("eRiego" + i));
  $("#eTextura").innerHTML = `<option value="">${tr("eNoSabe")}</option>` + opciones(TEXTURAS, p.textura, (t) => tr("tex_" + t));
  const siNo = (v) => `<option value="">${tr("eNoSabe")}</option>` + opciones(["si", "no"], v == null ? null : v ? "si" : "no", (x) => tr(x === "si" ? "eSi" : "eNo"));
  $("#eTerrazas").innerHTML = siNo(p.entrevista ? p.terrazas : null);
  $("#eTerrazas").closest("fieldset")?.classList.add("f-tierra"); // reemplaza a fieldset:has(#eTerrazas), que hacía lenta la página
  $("#eAbono").innerHTML = siNo(p.entrevista ? p.usa_abono : null);
  $$(".e-sierra").forEach((l) => (l.hidden = !D.andina)); // helada y granizo: solo en la sierra
  pintarAsistente();
  $(".e-total").hidden = !getEnt().length; // el registro y su descarga aparecen cuando hay algo guardado
  const n = getEnt().length;
  $("#eTotal").textContent = tr("eTotal", { n });
  $("#eCsv").disabled = !n;
}

// sugerencias mientras escribe: "gua" → Guayaba, Guanábana (sin importar tildes ni mayúsculas)
let sugI = -1;
const sugDe = (inp) => document.getElementById(inp.getAttribute("aria-controls"));
function cerrarSug(inp) {
  (inp ? [inp] : $$(".e-cult")).forEach((i) => {
    const ul = sugDe(i);
    ul.hidden = true;
    ul.innerHTML = "";
    i.setAttribute("aria-expanded", "false");
    i.removeAttribute("aria-activedescendant");
  });
  sugI = -1;
}
function mostrarSug(inp) {
  const ul = sugDe(inp), q = normTxt(inp.value);
  if (!q) return cerrarSug(inp);
  const empieza = (n) => normTxt(n).startsWith(q), palabra = (n) => normTxt(n).split(/[\s-]+/).some((w) => w.startsWith(q));
  const lista = SUG.filter((o) => palabra(o.nombre))
    .sort((a, b) => empieza(b.nombre) - empieza(a.nombre) || !!b.id - !!a.id || a.nombre.localeCompare(b.nombre))
    .slice(0, 8);
  if (!lista.length || (lista.length === 1 && normTxt(lista[0].nombre) === q)) return cerrarSug(inp);
  const marca = (n) => { // resalta lo escrito al inicio de la palabra que coincide (sin tildes, mismo largo)
    const t = normTxt(n), k = t.startsWith(q) ? 0 : [" ", "-"].map((s) => t.indexOf(s + q)).filter((x) => x >= 0).map((x) => x + 1)[0] ?? -1;
    return k < 0 ? esc(n) : `${esc(n.slice(0, k))}<b>${esc(n.slice(k, k + q.length))}</b>${esc(n.slice(k + q.length))}`;
  };
  ul.innerHTML = lista.map((o, i) => `<li role="option" id="${ul.id}-${i}" data-n="${esc(o.nombre)}">${o.id ? cico(o.id, "mini") : "<span class=\"e-sin\">🌱</span>"} <span>${marca(o.nombre)}</span>${o.id ? "" : `<small>${tr("eSoloAnota")}</small>`}</li>`).join("");
  ul.hidden = false;
  sugI = -1;
  inp.setAttribute("aria-expanded", "true");
}
function elegirSug(inp, n) { inp.value = n; cerrarSug(inp); }
function moverSug(inp, d) {
  const items = $$("li", sugDe(inp));
  if (!items.length) return;
  sugI = (sugI + d + items.length) % items.length;
  items.forEach((li, i) => li.setAttribute("aria-selected", i === sugI ? "true" : "false"));
  inp.setAttribute("aria-activedescendant", items[sugI].id);
  items[sugI].scrollIntoView({ block: "nearest" });
}

// la entrevista, de una pregunta por vez y con botones grandes: toda junta era lo primero que veía el agricultor y se podía
// rendir ahí. Las listas siguen debajo, escondidas: guardar y recalcular no cambia.
let ePaso = 0, eSucio = false;
const E_SELECTS = ["eHeladas", "eGranizo", "eRiego", "eTextura", "eTerrazas", "eAbono"];
const ePreguntas = () => ["eCult", "eRiego"]; // heladas, granizo y tierra: en «Afinar (opcional)»
function pintarAsistente() {
  const form = $("#eForm");
  form.classList.add("e-uno");
  $$(".e-sierra").forEach((f) => (f.hidden = !(D && D.andina))); // heladas y granizo: solo en la sierra
  $$(".e-ops").forEach((x) => x.remove()); // también las de «Afinar», fuera del formulario
  E_SELECTS.forEach((id) => {
    const sel = $("#" + id), ops = document.createElement("div");
    ops.className = "e-ops";
    ops.dataset.de = id;
    ops.innerHTML = [...sel.options].map((o) => `<button type="button" data-v="${esc(o.value)}" aria-pressed="${o.value === sel.value}"${/ \/ 5$/.test(o.text) ? ` aria-label="${esc(o.text)}"` : ""}>${esc(o.text.replace(/ \/ 5$/, ""))}</button>`).join(""); // escala 0 a 5: solo el número
    if (id === "eTextura") { // con dibujos y la prueba del puño: no hace falta saber el nombre de la textura
      ops.classList.add("e-tex");
      ops.innerHTML = `<p class="e-puno">${tr("ePuno")}</p>` + [...sel.options].map((o) => `<button type="button" data-v="${esc(o.value)}" aria-pressed="${o.value === sel.value}">
        <svg viewBox="0 0 58 50" aria-hidden="true" class="tx-${o.value || "nose"}">${TEX_DIBUJO[o.value] || TEX_DIBUJO[""]}</svg><span><b>${esc(o.text)}</b>${o.value ? `<small>${tr("ePuno_" + o.value)}</small>` : ""}</span></button>`).join("");
    }
    sel.closest("label").after(ops);
    if (id === "eTerrazas") { // terrazas o zanjas: solo en la sierra o en una chacra con pendiente
      const sin = !(D && (D.andina || ((D.contexto || {}).pendiente || 0) >= 5));
      sel.closest("label").hidden = sin; ops.hidden = sin;
    }
    $$("button", ops).forEach((b) => (b.onclick = () => {
      sel.value = b.dataset.v;
      $$("button", ops).forEach((x) => x.setAttribute("aria-pressed", x === b));
      if (ePreguntas().includes(id)) setTimeout(() => irPregunta(ePaso + 1), 220); // al responder pasa sola a la siguiente
    }));
  });
  if (!$(".e-nav", form)) {
    $('button[type="submit"]', form).insertAdjacentHTML("beforebegin", `<div class="e-nav"><button type="button" class="btn-sec" id="eAtr"></button><span class="e-pos"><span id="ePos"></span> <span id="eVozQ"></span></span><button type="button" class="btn-sec" id="eSgt"></button></div>`);
    $("#eAtr").onclick = () => irPregunta(ePaso - 1);
    $("#eSgt").onclick = () => irPregunta(ePaso + 1);
  }
  irPregunta(ePaso);
}
function irPregunta(n) {
  const form = $("#eForm"), qs = ePreguntas();
  ePaso = Math.max(0, Math.min(n, qs.length - 1));
  const cur = qs[ePaso], campo = cur === "eCult" ? $("#eC1") : $("#" + cur), fs = campo.closest("fieldset");
  $$("fieldset", form).forEach((f) => f.classList.toggle("e-fuera", f !== fs));
  ePreguntas().forEach((id) => {
    if (id === "eCult") return;
    const vis = id === cur;
    $("#" + id).closest("label").classList.toggle("e-fuera", !vis);
    $(`.e-ops[data-de="${id}"]`, form).classList.toggle("e-fuera", !vis);
  });
  const ultima = ePaso === qs.length - 1;
  $("#eAtr").textContent = tr("eAtr");
  $("#eAtr").style.visibility = ePaso ? "visible" : "hidden";
  $("#eSgt").textContent = tr("eSig");
  $("#eSgt").hidden = ultima;
  $('button[type="submit"]', form).hidden = !ultima;
  $("#ePos").textContent = tr("ePreg", { n: ePaso + 1, t: qs.length });
  const texto = cur === "eCult" ? $("legend", fs).textContent : `${campo.closest("label").querySelector("span").textContent} ${[...campo.options].map((o) => o.text).join(". ")}`;
  $("#eVozQ").innerHTML = FACIL.voz(texto);
  if (qs.length <= 2) { // solo 2 preguntas: las dos a la vista, sin «Siguiente pregunta»
    $$(".e-fuera", form).forEach((x) => x.classList.remove("e-fuera"));
    $(".e-nav", form).hidden = true;
    $('button[type="submit"]', form).hidden = false;
  }
}
function initEntrevista() {
  $$(".e-cult").forEach((inp) => {
    inp.addEventListener("input", () => mostrarSug(inp));
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter" && sugDe(inp).hidden) { e.preventDefault(); irPregunta(ePaso + 1); } }); // Enter no guarda a medias
    inp.addEventListener("focus", () => mostrarSug(inp));
    inp.addEventListener("blur", () => setTimeout(() => cerrarSug(inp), 120));
    inp.addEventListener("keydown", (e) => {
      if (sugDe(inp).hidden) return;
      if (e.key === "ArrowDown") { e.preventDefault(); moverSug(inp, 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); moverSug(inp, -1); }
      else if (e.key === "Enter" && sugI >= 0) { e.preventDefault(); elegirSug(inp, $$("li", sugDe(inp))[sugI].dataset.n); }
      else if (e.key === "Escape") { e.preventDefault(); cerrarSug(inp); }
    });
    sugDe(inp).addEventListener("mousedown", (e) => { // mousedown: antes de que el blur cierre la lista
      const li = e.target.closest("li");
      if (li) { e.preventDefault(); elegirSug(inp, li.dataset.n); }
    });
  });
  $("#eForm").onsubmit = async (e) => {
    e.preventDefault();
    const int = (v) => (v === "" ? null : +v), sn = (v) => (v === "" ? null : v === "si");
    const dichas = CAMPOS.map((s) => $(s).value.trim());          // última, anterior, hace 3
    const ids = dichas.map(cultivoDe);
    // lo que siembra hoy, de la más antigua a la última (como las rotaciones de Muyuy): solo si las 3 están en la tabla
    const rot = ids.every(Boolean) ? [...ids].reverse().join("|") : null;
    const resp = { cultivo_anterior: ids[0], rotacion_actual: rot,
                   heladas_campanias: D.andina ? int($("#eHeladas").value) : null,
                   granizo_anios: D.andina ? int($("#eGranizo").value) || 0 : 0, riego_mm: +$("#eRiego").value,
                   textura: $("#eTextura").value || null, terrazas: sn($("#eTerrazas").value) === true,
                   usa_abono: sn($("#eAbono").value) !== false };
    // el motor de la app vuelve a probar todas las rotaciones con estas respuestas, aquí mismo (con o sin internet)
    const recalc = D.motor ? await motorAplicar(resp) : false;
    const hay = rot && D.rotaciones[rot];
    D.perfil = { ...D.perfil, ...resp, rotacion_actual: hay ? rot : null, entrevista: true, sinRecalc: !recalc };
    D.perfil.campanias_texto = dichas; // lo que dijo, aunque no esté en la tabla del motor
    D.perfil.rotacion_pedida = rot || null;
    delete D.perfil.desdeCierre; // la entrevista es lo más nuevo
    guardarPerfil({ resp: { ...resp, rotacion_actual: rot }, dichas, fechaEnt: hoyISO(), riego_mm: resp.riego_mm });
    const reg = getEnt();
    const aqui = chosen && chosen.site === D.sitio ? chosen : D.lat != null ? D : SITES_LIST.find((s) => s.id === D.sitio) || {};
    const ahora = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16).replace("T", " "); // hora local
    reg.push({ fecha: ahora, sitio: D.sitio,
               lugar: chosen && chosen.site === D.sitio ? chosen.nombre : D.contexto.lugar, lat: aqui.lat ?? "", lon: aqui.lon ?? "",
               region: D.region || (D.andina ? "sierra" : "costa"), campania_ultima: dichas[0], campania_anterior: dichas[1],
               campania_hace3: dichas[2], ...resp, terrazas: sn($("#eTerrazas").value), usa_abono: sn($("#eAbono").value),
               idioma: LANG, recalculado: recalc });
    try { localStorage.setItem(ENT_KEY, JSON.stringify(reg)); } catch {}
    toast(tr(recalc ? "eListo" : "eGuardadoSin"), 7000);
    ePaso = 0;
    eSucio = false;
    $("#afinar").open = false;
    if (recalc) await showSite(); else { renderCtx(); renderEntrevista(); renderHoy(); }
  };
  $("#afinarGuardar").onclick = () => $("#eForm").requestSubmit(); // lo de «Afinar» entra con la entrevista
  // la entrevista ya no se pliega: es la primera pregunta del paso 1
  $("#entrevista").addEventListener("toggle", (e) => { if (!e.currentTarget.open) e.currentTarget.open = true; });
  // si respondió y va a sus opciones sin tocar «Guardar», se guarda igual
  ["#eForm", "#afinar"].forEach((q) => { $(q).addEventListener("input", () => (eSucio = true)); $(q).addEventListener("click", (e) => { if (e.target.closest(".e-ops button")) eSucio = true; }); });
  document.addEventListener("click", (e) => { if (eSucio && e.target.closest('#parcela [data-go="1"]')) $("#eForm").requestSubmit(); }, true);
  $("#nasaMas").addEventListener("toggle", () => { if (typeof miniMap !== "undefined" && miniMap) setTimeout(() => miniMap.invalidateSize(), 60); });
  $("#eCsv").onclick = () => {
    const reg = getEnt();
    if (!reg.length) return;
    const cols = ["fecha", "sitio", "lugar", "lat", "lon", "region", "campania_ultima", "campania_anterior", "campania_hace3",
                  "cultivo_anterior", "rotacion_actual", "heladas_campanias", "granizo_anios", "riego_mm", "textura", "terrazas",
                  "usa_abono", "idioma", "recalculado"];
    const q = (v) => (v == null ? "" : /[",\n;]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
    const csv = "﻿" + [cols.join(","), ...reg.map((r) => cols.map((c) => q(r[c])).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `muyuy_entrevistas_${hoyISO()}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };
}

// ---------------------------------------------------------------- idioma
function applyLang() {
  applyStatic();
  if ($("#audioBtn")) applyAudio();
  if ($("#nextBtn")) renderStepper();
  const note = $("#quNote");
  note.hidden = !(LANG === "qu" && !(D && D.qu_revisado) && tr("borradorQu")); // el quechua está revisado: sin aviso
  note.textContent = tr("borradorQu");
  $$(".prio").forEach((l) => $("input", l).setAttribute("aria-label", $(".prio-title", l).textContent));
}

let langTurno = 0;
async function changeLang(l) {
  setLang(l);
  applyLang();
  if (!D) return;
  lastTop = "";
  // en partes, con una pausa entre ellas: todo junto congelaba el celular casi un segundo
  const ceder = () => new Promise((r) => setTimeout(r, 0)), turno = ++langTurno;
  renderCtx();
  renderEntrevista();
  renderEscenarios();
  updateSiteName();
  prioConf();
  await ceder(); if (turno !== langTurno) return;
  renderPalette();
  custom.forEach((id, i) => { if (id) $("b", $$(".slot")[i]).innerHTML = `${cico(id, "slot-ico")} ${cname(id)}`; });
  renderHoy();
  await ceder(); if (turno !== langTurno) return;
  renderGame();
  resetJuegos();
  renderCierre();
  renderAsoc();
  pintarOdsPrio();
  await ceder(); if (turno !== langTurno) return;
  renderAhora();
  renderEnso(); // satelite.js
  renderCuaderno();
  if (typeof PESTANAS !== "undefined") PESTANAS.textos(); // las pestañas también cambian de idioma
  await ceder(); if (turno !== langTurno) return;
  if (typeof CAMPO !== "undefined") CAMPO.alSitio();
  await ceder(); if (turno !== langTurno) return;
  if (tourI >= 0) tourGo(tourI);
  await renderTop();
  renderCustom();
}


// ---------------------------------------------------------------- escenarios "¿Qué pasa en…?"
let escenario = "todos"; // todos, nino, seco, nina, f245 y f585 (clima de 2041-2060)
const ESC_COL = { nino: F.nino, seco: F.seco, nina: F.nina };
const enEscenario = (i) => {
  const c = D.clases[i] || {};
  return escenario === "nino" ? c.enso === "El Niño" : escenario === "nina" ? c.enso === "La Niña" : escenario === "seco" ? c.humedad === "seco" : true;
};
// clima futuro: robustez de cada rotación con el clima proyectado (scripts/build_futuro.py), ligada a su arreglo de datos
let FUTURO = null, FUTS = null, FUTV = new Map();
const esFuturo = () => escenario === "f245" || escenario === "f585";
async function getFuturo() {
  if (!FUTURO) {
    const r = await fetch("data/futuro.json.gz");
    const plano = "DecompressionStream" in window ? r.body.pipeThrough(new DecompressionStream("gzip")) : r.body;
    FUTURO = await new Response(plano).json();
  }
  return FUTURO;
}
// 2050 se calcula en el teléfono: el cambio de cada mes de la zona (data/futuro.json.gz) aplicado al clima del lugar. Los
// resultados guardados en ese archivo son de una versión anterior de las rotaciones: en muchos lugares ya no coinciden, y
// la chacra exacta no los tiene. Solo se usan si no hay motor y la lista de rotaciones tiene el mismo largo.
const FUTX = new Map();
const zonaFut = () => (FUTURO && D ? FUTURO.sitios[D.sitio] || FUTURO.sitios[D.vecino || (nearestComputed(D.lat, D.lon) || {}).id] || null : null);
const futPorMotor = () => !!(D && D.motor && window.MOTOR && zonaFut());
function futuroExacto(esc) {
  const z = zonaFut();
  if (!z || !window.MOTOR) return null;
  const k = [D.sitio, esc, JSON.stringify(D._perfilMotor || {})].join("#");
  if (!FUTX.has(k)) {
    const r = MOTOR.calcular(D.sitio, { ...(D._perfilMotor || {}), clima: { meses: z[esc].mes } }, []);
    FUTX.set(k, { rob: Object.fromEntries(Object.entries(r.rotaciones).map(([q, v]) => [q, v[F.rob]])), dT: z[esc].dT, dP: z[esc].dP, exacto: !!D.parcela });
  }
  return FUTX.get(k);
}
function prepararFuturo() {
  FUTV = new Map();
  if (esFuturo() && futPorMotor()) {
    try {
      const x = futuroExacto(escenario === "f585" ? "ssp585" : "ssp245");
      if (x) {
        FUTS = x;
        Object.entries(D.rotaciones).forEach(([q, v]) => { if (q in x.rob) FUTV.set(v, x.rob[q]); });
        return;
      }
    } catch {}
  }
  FUTS = FUTURO && D && FUTURO.sitios[D.sitio] ? FUTURO.sitios[D.sitio][escenario === "f585" ? "ssp585" : "ssp245"] : null;
  if (!FUTS) return;
  const keys = D._ordenFut && D._ordenFut.length ? D._ordenFut : Object.keys(D.rotaciones); // el orden del archivo, no el del motor
  if (FUTS.r.length !== keys.length) { FUTS = null; return; }
  FUTS.r.forEach((x, i) => { if (x >= 0 && keys[i] && D.rotaciones[keys[i]]) FUTV.set(D.rotaciones[keys[i]], x / 100); });
}
const fracOf = (v) => (escenario === "todos" ? v[F.rob] : esFuturo() ? (FUTV.has(v) ? FUTV.get(v) : v[F.rob]) : v[ESC_COL[escenario]]);
function renderEscenarios() {
  $("#escenarios").innerHTML = `<p class="esc-q">${tr("escPregunta2")}</p><div class="esc-bs${esFuturo() ? " c5" : ""}">` +
    ["todos", "nino", "seco", "nina", ...(esFuturo() ? [escenario] : [])].map((k) => `<button type="button" data-esc="${k}" class="${k === escenario ? "on" : ""} ${k[0] === "f" ? "fut" : ""}">${tr("escC_" + k)}</button>`).join("") + "</div>";
  const nota = $("#futNota");
  nota.hidden = !(esFuturo() && FUTS);
  if (FUTS && esFuturo()) nota.innerHTML = `<img class="fut-img" src="img/clima2050.webp" alt="" width="760" height="428">` + `<span>${tr("futNota", { esc: tr(escenario === "f585" ? "futAlto" : "futMedio"), dT: `+${FUTS.dT}`, dP: `${FUTS.dP > 0 ? "+" : ""}${FUTS.dP}` })}</span>`;
  if (FUTS && esFuturo() && FUTS.exacto) nota.insertAdjacentHTML("beforeend", `<span> ${tr("futExacta")}</span>`);
  $$("#escenarios button").forEach((b) => (b.onclick = async () => {
    if (b.dataset.esc[0] === "f") {
      try { await getFuturo(); } catch { FUTURO = { sitios: {} }; }
      const guardado = FUTURO.sitios[D.sitio], largo = (D._ordenFut && D._ordenFut.length) || Object.keys(D.rotaciones).length;
      if (!futPorMotor() && !(guardado && guardado.ssp245.r.length === largo)) { toast(tr("futSinDatos"), 6000); return; }
      if (futPorMotor()) { toast(tr("futCalc"), 2500); await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 60))); } // primero se ve el aviso
    }
    escenario = b.dataset.esc;
    prepararFuturo();
    renderEscenarios();
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0))); // primero se ve el botón marcado; después se recalcula
    lastTop = "";
    await renderTop();
    const tt = $("#topTabs"); if (tt && tt.getBoundingClientRect().top < 0) tt.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" }); // ver el cambio en la tarjeta
    renderHoy();
    renderCustom();
    nudge();
  }));
}

// ---------------------------------------------------------------- comparación con lo de hoy y compartir
function vsHtml(seq, v) {
  const act = D.perfil.rotacion_actual, va = act && D.rotaciones[act];
  if (!va || seq === act) return "";
  const sign = (d, fmt = (x) => x) => `<b class="${d > 0 ? "up" : d < 0 ? "down" : ""}">${d > 0 ? "▲ +" : d < 0 ? "▼ " : "= "}${fmt(d)}</b>`;
  const dA = ten(fracOf(v)) - ten(fracOf(va)), dI = v[F.ing] - va[F.ing], dS = v[F.vida][2] - va[F.vida][2];
  return `<p class="card-t">${tr("vsHoy")}</p>` + statRows([
    ["✅", tr("kAnios"), tr("vAnios", { d: sign(dA) })],
    ["💰", tr("kIng"), tr("vsIng", { d: sign(dI, num) })],
    ["🌱", tr("kSuelo"), sign(dS)],
  ]);
}
// "¿Por qué esta rotación?" en dos partes cortas, sin repetir los números de arriba:
// por qué conviene (lo que explica el motor) y qué tener en cuenta
function whyHtml(seq, v) {
  const bien = v[F.raz].map(txt); // lo que explica el motor; los números ya están arriba de la tarjeta // lo que explica el motor: leguminosa antes de un cereal, descanso, familias
  const ojo = [...v[F.ale].map(txt), tr("wPeor", { y: v[F.peor], yy: String(v[F.peor] + 1).slice(-2) })];
  const lista = (xs, cls, ic) => `<ul class="why-l ${cls}">${xs.map((x) => `<li><span aria-hidden="true">${ic}</span> ${x}</li>`).join("")}</ul>`;
  return `<p class="card-t">${tr("wBienT")}</p>` + (bien.length ? lista(bien, "ok", "✔") : `<p class="why-nada">${tr("wNada")}</p>`) +
    `<p class="card-t">${tr("wOjoT")}</p>` + lista(ojo, "alert", "⚠");
}
const statRows = (rows) => `<dl class="stats">${rows.filter(Boolean).map(([ic, k, v]) =>
  `<div><dt><span aria-hidden="true">${ic}</span> ${k}</dt><dd>${v}</dd></div>`).join("")}</dl>`;
function shareCard(seq, v) {
  const names = seq.split("|").map(cname).join(" → ");
  const r10 = ten(fracOf(v));
  const plan = ((D.cultivos[seq.split("|")[0]].plan || {})[LANG] || [])[0];
  const text = tr("compartirTexto", { lugar: D.contexto.lugar, rot: names, rob: tr("robust2", { n: r10, f: 10 - r10 }), plan: plan ? plan[1] : "" });
  window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
}

// ---------------------------------------------------------------- repaso de los 42 años (rotación de hoy)
let replaying = false;
async function replayHoy() {
  const grid = $("#hoyCard .grid"), seq = D.perfil.rotacion_actual, v = seq && D.rotaciones[seq];
  if (!grid || !v || replaying) return;
  replaying = true;
  const cells = [...grid.children], out = $("#replayYear"), head = $("#hoyCard .robust"), btn = $("#replayBtn");
  const chips = $$("#memoria li");
  btn.disabled = true;
  cells.forEach((c) => c.classList.add("ghost"));
  chips.forEach((c) => c.classList.add("ghost"));
  let k = 0;
  for (let i = 0; i < cells.length; i++) {
    const ok = v[F.grilla][i] === "1", y = D.anios[i], rec = recLabel(y);
    if (ok) k++;
    cells[i].classList.remove("ghost");
    cells[i].classList.add("pop");
    // el titular cuenta en vivo; en un año recordado se enciende su tarjeta de abajo
    head.textContent = tr("replayVa", { k, n: i + 1 });
    out.innerHTML = `<b>${y}/${String(y + 1).slice(-2)}</b> ${ok ? "✔ " + tr("recOk") : "✖ " + tr("recMal")}${rec ? ` · ★ ${recNom(y)}` : ""}`;
    chips.forEach((c) => c.classList.toggle("now", +c.dataset.y === y));
    const chip = chips.find((c) => +c.dataset.y === y);
    if (chip) chip.classList.remove("ghost");
    if (!REDUCED) await sleep(rec ? 900 : 110);
  }
  chips.forEach((c) => c.classList.remove("now", "ghost"));
  head.textContent = robustTxt(ten(fracOf(v)));
  out.innerHTML = `<b>${tr("replayFin", { k, n: cells.length })}</b>`;
  btn.disabled = false;
  replaying = false;
  nudge();
}

// ---------------------------------------------------------------- empuje suave del botón Siguiente
function nudge() {
  const b = $("#nextBtn");
  if (!b || !guided) return;
  b.classList.remove("ready");
  void b.offsetWidth;
  b.classList.add("ready");
}

// ---------------------------------------------------------------- letra legible sobre el color de un cultivo
// true si sobre ese color se lee mejor la letra oscura que la blanca (amarillo, verde claro, naranja…)
function esClaro(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return false;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (L + 0.05) / 0.0637 > 1.05 / (L + 0.05); // letra oscura #1f1d36 frente a blanca
}
// ---------------------------------------------------------------- pantalla de inicio (portada)
function renderSplash() {
  const s = $("#splash");
  s.innerHTML = `<img class="sp-img" src="${innerWidth <= 820 ? "img/portada-800.webp" : "img/portada.webp"}" alt="${esc(tr("spImg"))}" width="1400" height="788" fetchpriority="high">
    <div class="sp-txt">
      <div class="sp-langs">${[["es", "Español"], ["qu", "Runasimi"], ["en", "English"]].map(([l, n]) =>
        `<button type="button" data-l="${l}" class="${l === LANG ? "on" : ""}">${n}</button>`).join("")}</div>
      <p class="sp-kicker">🛰️ ${tr("spKicker")}</p>
      <h1 id="spTitulo">${tr("spTitulo")}</h1>
      <p class="sp-sub">${tr("spSub")}</p>
      <button type="button" class="sp-go">${tr("spGo")}</button>
      <p class="sp-pie">${tr("spPie")}</p>
      ${odsInicio()}
    </div>`;
  initOdsInicio(s); // ods.js
  $$(".sp-langs button", s).forEach((b) => (b.onclick = async () => { $("#lang").value = b.dataset.l; await changeLang(b.dataset.l); renderSplash(); $(".sp-go", s).focus(); }));
  $(".sp-go", s).onclick = async (e) => { // directo al mapa: la portada se cierra cuando el mapa ya está abierto
    const b = e.currentTarget;
    b.disabled = true; b.textContent = tr("spAbriendo");
    desdePortada = true;
    await openPicker();
    s.close();
    b.disabled = false; b.textContent = tr("spGo");
  };
}
let desdePortada = false; // el mapa se abrió desde la portada y aún no se elige lugar
const quitarPortadaRapida = () => { const r = document.getElementById("portadaRapida"); if (r) r.remove(); };
function openSplash() {
  document.documentElement.classList.add("portada");
  renderSplash();
  $("#splash").showModal();
  quitarPortadaRapida();
  $("#splash .sp-go").focus();
}
function initWelcome(portada = true) {
  $("#splash").addEventListener("close", () => {
    document.documentElement.classList.remove("portada"); // recién ahora se dibuja la página
    setTimeout(() => { if (typeof miniMap !== "undefined" && miniMap) miniMap.invalidateSize(); }, 60);
  });
  // «Cómo leer los datos (y lo que Muyuy no sabe)» (campo.js), en una ventana desde el menú Más
  $("#verLeer").onclick = () => { $(".mas").open = false; if (typeof CAMPO !== "undefined") CAMPO.temasExtra(null); $("#leerDlg").showModal(); $("#leerDlg").scrollTop = 0; };
  $("#leerClose").onclick = () => $("#leerDlg").close();
  $("#verQueHacer").onclick = () => { $(".mas").open = false; abrirQueHacer(); };
  $("#leerDlg").addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }); // toque fuera: cierra
  // con Esc se pasa de la portada al mapa
  $("#splash").addEventListener("cancel", (e) => { e.preventDefault(); $("#splash .sp-go").click(); });
  // la portada se muestra cada vez que se abre Muyuy, no al recargar (?sinbienvenida la salta, para las pruebas)
  if (portada && !new URLSearchParams(location.search).has("sinbienvenida")) openSplash();
}

// ---------------------------------------------------------------- volver donde se quedó
// Quien ya pasó la portada y la bienvenida (o eligió su lugar) vuelve directo al paso, a la altura de la página y al
// panel o la sala de juegos donde se quedó, al recargar o al abrir Muyuy otra vez. La portada sigue en ☰ Más.
const DONDE_KEY = "muyuy-donde";
function guardarDonde() {
  if ($("#splash").open || desdePortada) return; // todavía no entró: la próxima vez vuelve a ver la portada
  try {
    localStorage.setItem(DONDE_KEY, JSON.stringify({ step: cur, y: Math.round(scrollY), panel: window.MUYUY_PANEL || null,
                                                     juegos: !!($("#juegos") && $("#juegos").open) }));
  } catch {}
}
function volverDonde() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(DONDE_KEY)); } catch {}
  if (!d) return false;
  if (d.step >= 0 && d.step < STEPS.length) showStep(d.step, { push: false, focus: false });
  if (location.hash !== "#" + STEPS[cur]) history.replaceState({ step: cur }, "", "#" + STEPS[cur]);
  if (d.y) setTimeout(() => window.scrollTo({ top: d.y, behavior: "auto" }), 700); // después de pintar las tarjetas
  if (d.panel && window.muyuyOpen) window.muyuyOpen(d.panel); // Muyuy.html: proyecto, vista técnica o mapa
  else if (d.juegos && typeof abrirJuegos === "function") abrirJuegos();
  return true;
}
function initDonde() {
  let t;
  addEventListener("scroll", () => { clearTimeout(t); t = setTimeout(guardarDonde, 250); }, { passive: true });
  addEventListener("pagehide", guardarDonde);
  // al cerrar la bienvenida o elegir el lugar ya cuenta como entrado, aunque no haya movido la página
  ["#picker", "#juegos"].forEach((s) => $(s) && $(s).addEventListener("close", () => setTimeout(guardarDonde, 50)));
  document.addEventListener("visibilitychange", () => { if (document.hidden) guardarDonde(); });
}

// ---------------------------------------------------------------- recorrido guiado interactivo
// Cada parada: [paso del recorrido (o null), selector, texto, ¿pide que el usuario lo haga?]
const TOUR = [
  [null, "#lang", "t_lang"], [null, "#audioBtn", "t_audio"], [null, ".mas", "t_cfg"], [null, "#steps", "t_steps"],
  [0, "#sitePick", "t_site"], [0, "#prioridades .presets", "t_presets", true], [0, "#prioAjuste", "t_prio"], [0, "#ctx", "t_ctx"],
  [1, "#escenarios", "t_escenarios", true], [1, "#top .rot .gauge", "t_icons"], [1, "#top .rot .plan-box", "t_plan", true],
  [1, "#top .rot .share", "t_share"], [1, "#estrategias .es-t", "t_vs"], [1, "#palette", "t_palette"],
  [2, "#ahora", "t_ahora"], [2, "#memoria", "t_memoria"], [2, "#replayBtn", "t_replay", true],
  [3, "#cierreForm", "t_cierre"], [3, "#cuaderno", "t_cuaderno"], [null, "#btnJuegos", "t_juegos"], [null, "#wizardNav", "t_nav"],
];
let tourI = -1, tourTarget = null, tourWait = null;
function tourPlace() {
  if (tourI < 0 || !tourTarget) return;
  const r = tourTarget.getBoundingClientRect(), pad = 8, spot = $("#tourSpot"), bub = $("#tourBubble");
  Object.assign(spot.style, { left: r.left - pad + "px", top: r.top - pad + "px", width: r.width + 2 * pad + "px", height: r.height + 2 * pad + "px" });
  const bw = Math.min(360, innerWidth - 24), below = r.bottom + 16 + bub.offsetHeight < innerHeight;
  bub.style.width = bw + "px";
  bub.style.left = Math.max(12, Math.min(innerWidth - bw - 12, r.left + r.width / 2 - bw / 2)) + "px";
  bub.style.top = (below ? r.bottom + 14 : Math.max(12, r.top - bub.offsetHeight - 14)) + "px";
  bub.dataset.side = below ? "below" : "above";
}
async function tourGo(i) {
  if (tourWait) { tourWait.el.removeEventListener("click", tourWait.fn, true); tourWait = null; }
  if (i < 0) i = 0;
  if (i >= TOUR.length) return endTour(true);
  tourI = i;
  const [step, sel, key, act] = TOUR[i];
  if (step !== null && step !== cur) { showStep(step, { focus: false }); await sleep(REDUCED ? 50 : 450); }
  if (typeof PESTANAS !== "undefined") PESTANAS.mostrar($(sel)); // la parada puede estar en otra pestaña del paso
  if (key === "t_plan") { const d = $(sel); if (d) d.open = false; }
  if (key === "t_prio") $("#prioAjuste").open = true; // aquí se muestran las barras
  if (key === "t_escenarios") { const d = $(".esc-d"); if (d) d.open = true; }
  if (String(sel).startsWith("#top")) elegirTop(0);
  tourTarget = $(sel);
  if (!tourTarget) return tourGo(i + 1);
  for (let d = tourTarget.parentElement.closest("details"); d; d = d.parentElement.closest("details")) d.open = true; // «Más de esta rotación»
  tourTarget.scrollIntoView({ block: "center", behavior: REDUCED ? "auto" : "smooth" });
  await sleep(REDUCED ? 30 : 380);
  const bub = $("#tourBubble");
  bub.innerHTML = `<p class="tb-n">${i + 1} / ${TOUR.length}</p><p>${tr(key)}</p>${act ? `<p class="tb-do">${tr("tourHazlo")}</p>` : ""}
    <div class="tb-btns"><button type="button" class="tb-skip">${tr("tourSaltar")}</button>
    <span><button type="button" class="tb-prev" ${i === 0 ? "disabled" : ""}>←</button>
    <button type="button" class="tb-next">${tr("tourSig")}</button></span></div>`;
  $(".tb-skip", bub).onclick = () => endTour(false);
  $(".tb-prev", bub).onclick = () => tourGo(i - 1);
  $(".tb-next", bub).onclick = () => tourGo(i + 1);
  $("#tour").hidden = false;
  tourPlace();
  if (act) { // la parada avanza sola cuando el usuario hace lo que se le pide
    const fn = () => setTimeout(() => tourGo(i + 1), 900);
    tourTarget.addEventListener("click", fn, true);
    tourWait = { el: tourTarget, fn };
  }
  if (audioOn) sayText(tr(key));
  $(".tb-next", bub).focus({ preventScroll: true });
}
let tourDesde = null;
function startTour() {
  if (!guided) setMode(true);
  if (tourI < 0) tourDesde = { step: cur, y: scrollY }; // al terminar, vuelve a donde estaba
  tourGo(Math.max(0, TOUR.findIndex(([paso]) => paso === cur))); // empieza en el paso donde está; con ← llega a las primeras paradas
}
function endTour(done) {
  if (tourWait) { tourWait.el.removeEventListener("click", tourWait.fn, true); tourWait = null; }
  tourI = -1;
  tourTarget = null;
  $("#tour").hidden = true;
  stopAudio();
  if (tourDesde) {
    const d = tourDesde; tourDesde = null;
    if (d.step !== cur) showStep(d.step, { focus: false });
    setTimeout(() => window.scrollTo({ top: d.y, behavior: "auto" }), REDUCED ? 0 : 450);
  }
  if (done) toast(tr("tourFin"), 5000);
}
function initTour() {
  if ($("#tourBtn")) $("#tourBtn").onclick = startTour;
  addEventListener("resize", tourPlace);
  addEventListener("scroll", tourPlace, { passive: true });
  document.addEventListener("keydown", (e) => {
    if (tourI < 0) return;
    if (e.key === "Escape") endTour(false);
    if (e.key === "ArrowRight") { e.stopImmediatePropagation(); tourGo(tourI + 1); }
    if (e.key === "ArrowLeft") { e.stopImmediatePropagation(); tourGo(tourI - 1); }
  }, true);
}


// ---------------------------------------------------------------- comunidad elegida en el mapa del Perú
// El agricultor toca su comunidad (BDPI, 38 737 lugares), su distrito o uno de los 111 mil centros poblados del Minedu. Todas tienen datos: Muyuy usa el sitio detallado
// o el punto calculado de su misma celda de clima NASA Power (398 celdas, scripts/build_celdas.py) y lo dice con claridad.
// Solo si un lugar quedara fuera de todas las celdas avisaría que su zona todavía no está calculada.
let COM = null;          // datos del mapa (data/comunidades.json), se cargan al abrir el selector
let chosen = null;       // {nombre, tipo, dist, prov, dep, pob, lat, lon, site, km} o null
let pickMap = null, pickSel = null, pickRing = null, miniMap = null, SITES_LIST = [];
try { chosen = JSON.parse(localStorage.getItem("muyuy-comunidad")); } catch {}

const kmBetween = (a, b, c, d) => {
  const R = 6371, r = Math.PI / 180, x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};
const celdaDe = (lat, lon) => `${Math.floor((lat + 90) / 0.5)}_${Math.floor((lon + 180) / 0.625)}`;
function nearestComputed(lat, lon, alt = null) {
  // en el Perú, el punto calculado más parecido por cercanía y altura (puntos.js); antes de tener las alturas de las
  // capitales, el de la misma celda de clima; fuera de las celdas calculadas, el más cercano
  const k = celdaDe(lat, lon), con = (s) => ({ ...s, km: kmBetween(lat, lon, s.lat, s.lon) });
  const det = SITES_LIST.find((s) => !s.grid && celdaDe(s.lat, s.lon) === k);
  const cel = det ? null : SITES_LIST.find((s) => s.grid && s.celda && `${s.celda[0]}_${s.celda[1]}` === k);
  if (det || cel) {
    if (COM && COM.distritos) {
      const r = puntoParecido(lat, lon, alt, SITES_LIST.filter((s) => !s.ejemplo), COM.distritos);
      return { ...r.sitio, km: r.km, alturaLugar: r.altura, misma: true };
    }
    return { ...con(det || cel), misma: true };
  }
  let best = null;
  for (const s of SITES_LIST) { const km = kmBetween(lat, lon, s.lat, s.lon); if (!best || km < best.km) best = { ...s, km, misma: false }; }
  return best;
}
const siteNombre = (id) => (SITES_LIST.find((s) => s.id === id) || {}).nombre || id;
function updateSiteName() {
  const propio = chosen && chosen.site === $("#site").value;
  // un punto tocado se llama «Mi chacra», igual que el título: se nombra por lo que tiene cerca
  const n = propio && chosen.clase === "punto" && !chosen.fav
    ? (chosen.cerca ? tr("mcCerca", { d: chosen.cerca[2], p: chosen.cerca[4] }) : tr("pickPuntoTipo"))
    : propio ? chosen.nombre : siteNombre($("#site").value);
  const limpio = String(n).replace(/\s*\(-?\d+(\.\d+)?, -?\d+(\.\d+)?\)\s*$/, ""); // sin coordenadas (lugares guardados antes)
  // dos niveles: «Chulucanas» y, debajo, «Morropón (Piura)»
  const partes = /^(.+?)(?:, | \()(.+?)$/.exec(limpio);
  const principal = partes ? partes[1] : limpio;
  const resto = partes ? (limpio[partes[1].length] === "(" || limpio[partes[1].length + 1] === "(" ? partes[2].replace(/\)$/, "") : partes[2]) : "";
  const sub = resto && !principal.endsWith(resto) ? resto : "";
  $("#siteName").textContent = principal;
  $("#siteSub").textContent = sub;
  $("#siteSub").hidden = !sub;
  $("#sitePick").title = n;
}
async function getCom() {
  if (!COM) COM = await (await fetch("data/comunidades.json")).json();
  return COM;
}
// 111 mil centros poblados: van aparte para que el mapa abra sin esperarlos. Cada punto: [lon, lat, nombre, distrito]
let POB = null;
function getPoblados() {
  POB = POB || gzJson("data/poblados.json.gz").then((d) => {
    const pts = new Array(d.nombres.length);
    let x = 0, y = 0, i = 0;
    for (const dist of d.distritos) for (let n = 0; n < dist[3]; n++, i++) {
      x += d.lon[i]; y += d.lat[i];
      pts[i] = [x / 1e4, y / 1e4, d.nombres[i], dist];
    }
    return pts;
  }).catch(() => []);
  return POB;
}
const pobladoDe = (p) => ({ nombre: p[2], clase: "poblado", dist: p[3][0], prov: p[3][1], dep: p[3][2], lat: p[1], lon: p[0] });

function pickInfo(html, ok) {
  $("#pickInfo").innerHTML = html;
  $("#pickUse").disabled = !ok;
  $("#pickExacta").hidden = true;
}
function selectCommunity(c) {
  pickSel = c;
  const near = c.isSite ? { id: c.site, nombre: c.nombre, km: 0 } : nearestComputed(c.lat, c.lon, c.alt);
  pickSel.site = near.id;
  pickSel.km = Math.round(near.km);
  if (pickRing) pickMap.removeLayer(pickRing);
  pickRing = L.circleMarker([c.lat, c.lon], { radius: 12, color: "#ffd54f", weight: 4, fill: false }).addTo(pickMap);
  const clase = c.isSite ? "s" : c.clase === "distrito" ? "d" : c.clase === "punto" ? "p" : c.clase === "poblado" ? "o" : c.tipo ? "n" : "c";
  const tipo = { s: tr("pickSitio"), d: tr("pickDistrito"), p: tr("pickPuntoTipo"), o: tr("pickPoblado"), n: tr("comNat"), c: tr("comCamp") }[clase];
  const lugar = clase === "p" ? `<p>${c.cerca ? tr("pickCerca", { d: esc(c.cerca[2]), p: esc(c.cerca[4]), km: num(c.cercaKm) }) : `${c.lat.toFixed(4)}, ${c.lon.toFixed(4)}`}</p>`
    : clase === "d" ? `<p>${esc(c.prov)} · ${esc(c.dep)}${c.alt ? ` · ${num(c.alt)} m` : ""}</p>`
    : clase === "o" ? `<p>${esc(c.dist)} · ${esc(c.prov)} · ${esc(c.dep)}</p>`
    : clase === "s" ? "" : `<p>${esc(c.dist)} · ${esc(c.prov)} · ${esc(c.dep)}</p><p>${num(c.pob)} ${tr("habit")}</p>`;
  const sinRed = navigator.onLine === false;
  const exacta = clase === "s" ? "" : `<p id="exactaMsg" class="pk-exmsg">${sinRed ? tr("exactaSin") : tr("exactaTxt")}</p>`;
  // lejos o a otra altura: el agricultor lo sabe y puede calcular su punto
  const distinto = !c.isSite && near.misma && near.alt != null && (near.km > 50 || (near.alturaLugar != null && Math.abs(near.alt - near.alturaLugar) > 400));
  pickInfo(`<h3>${esc(c.nombre)}</h3><span class="pk-tipo ${clase}">${tipo}</span>${lugar}
    <p class="pk-datos">${c.isSite ? tr("pickMismo") : near.alt != null
      ? tr("pickCelda", { s: esc(near.nombre), km: num(near.km), a: Math.round(near.alt) }) : tr("pickDatos", { s: esc(near.nombre), km: num(near.km) })}</p>
    ${!c.isSite && !near.misma ? `<p class="pk-lejos">${tr("pickFuera")}</p>` : ""}${distinto ? `<p class="pk-lejos">${tr("pickAviso")}</p>` : ""}${exacta}${c.isSite || c.fav ? "" : `<button type="button" class="pk-guardar" id="pickGuardar">${tr("pickFavGuardar")}</button>`}`, true);
  const bg = $("#pickGuardar");
  if (bg) bg.onclick = () => {
    const n = c.clase === "punto" && c.cerca ? tr("mcCerca", { d: c.cerca[2], p: c.cerca[4] }) : c.nombre;
    const l = getFavs();
    if (!l.some((f) => Math.abs(f.lat - c.lat) < 1e-4 && Math.abs(f.lon - c.lon) < 1e-4)) setFavs([{ n, lat: c.lat, lon: c.lon, alt: c.alt }, ...l].slice(0, 12));
    bg.textContent = tr("pickFavListo"); bg.disabled = true;
  };
  $("#pickUse").textContent = tr(c.isSite ? "pickUsar" : "pickZona");
  const bx = $("#pickExacta");
  bx.textContent = tr("pickExactoCorto");
  bx.hidden = clase === "s";
  bx.disabled = sinRed;
  bx.onclick = () => calcularExacta(c, near);
  if (window.innerWidth < 760) $("#pickInfo").scrollIntoView({ block: "nearest" });
}
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
// Con internet: la chacra exacta, calculada aquí mismo por el motor de la app (motor.js): clima diario de NASA Power,
// altura y pendiente (Copernicus) y suelo (SoilGrids) de este punto, y todas las rotaciones. Queda guardada en el
// teléfono para las próximas veces.
async function calcularExacta(c, near) {
  const bx = $("#pickExacta"), msg = $("#exactaMsg");
  const vec = SITES_LIST.find((s) => s.id === near.id);
  if (!vec || vec.ejemplo || !window.MOTOR) { msg.textContent = tr("exactaPeru"); return; }
  bx.disabled = true;
  $("#pickUse").disabled = true;
  const paso = (k) => (msg.innerHTML = `<span class="loader-dot"></span> ${tr("exacta_" + k)}`);
  paso("clima");
  try {
    const S = await MOTOR.parcela(c.lat, c.lon, near.id, paso);
    const id = S.id;
    EXACTAS[id] = await armarExacta(id, near.id, c);
    try { localStorage.setItem(EXACTA_KEY, JSON.stringify({ id, near: near.id, nombre: c.nombre, lat: c.lat, lon: c.lon, bin: await MOTOR.empaquetar(id) })); } catch {}
    if (!SITES_LIST.some((s) => s.id === id)) {
      SITES_LIST.push({ id, nombre: c.nombre, lat: c.lat, lon: c.lon, parcela: true });
      $("#site").insertAdjacentHTML("beforeend", `<option value="${id}">${esc(c.nombre)}</option>`);
    }
    Object.assign(pickSel, { site: id, km: 0, exacta: true });
    msg.innerHTML = tr("exactaOk");
    $(".pk-datos").innerHTML = tr("pickExacta");
    const lj = $(".pk-lejos");
    if (lj) lj.remove();
    $("#pickUse").textContent = tr("pickUsar"); // ya no son los de la zona: son los de su punto
    bx.hidden = true;
  } catch (e) {
    msg.textContent = tr(navigator.onLine === false ? "exactaSin" : "exactaError", { e: e.message });
    bx.disabled = false;
  }
  $("#pickUse").disabled = false;
}
// los datos de la vista de la chacra exacta: los de su punto calculado más cercano, con la altura, la pendiente, el
// suelo y el clima de este punto
const EXACTA_KEY = "muyuy-exacta";
async function armarExacta(id, nearId, c) {
  const base = await siteData(nearId), cx = MOTOR.contexto(id);
  return { ...base, sitio: id, vecino: nearId, region: cx.region, andina: cx.region === "sierra", celda: false, parcela: true, lat: c.lat, lon: c.lon,
           contexto: { ...base.contexto, lugar: c.nombre, altura: cx.altura, pendiente: cx.pendiente, suelo: cx.suelo_txt.es,
                       clima: { ...base.contexto.clima, delta_t: cx.delta_t, precip_factor: cx.precip_factor }, campanias: cx.campanias },
           suelo_txt: cx.suelo_txt, suelo_fuente: cx.suelo_fuente === "soilgrids" ? "soilgrids" : base.suelo_fuente,
           perfil: { ...base.perfil, rotacion_actual: null, entrevista: false } };
}
// la chacra exacta guardada en el teléfono (sin internet también)
async function restaurarExacta(id) {
  let g = null;
  try { g = JSON.parse(localStorage.getItem(EXACTA_KEY)); } catch {}
  if (!g || g.id !== id || !window.MOTOR) return null;
  await MOTOR.cargar(g.near);
  await MOTOR.desempaquetar(g.bin);
  return (EXACTAS[id] = await armarExacta(id, g.near, g));
}
// el agua de riego elegida en «Lo que le limita» (paso 2): el motor vuelve a probar todo con esa agua, como con la entrevista
async function cambiarRiego(mm) {
  if (!D || !D.motor) return false;
  const ok = await motorAplicar({ ...D.perfil, riego_mm: mm });
  if (!ok) return false;
  D.perfil = { ...D.perfil, riego_mm: mm, sinRecalc: false };
  guardarPerfil({ riego_mm: mm }); // se recuerda al volver a abrir Muyuy
  await showSite();
  return true;
}
// un lugar cualquiera del mapa o la ubicación del teléfono
const PICK_CERCA = 8; // desde este acercamiento un toque puede elegir una comunidad o un distrito
// coordenadas escritas: «-13.39, -72.05», «-13,39 -72,05» o «13°23'S 72°03'O» (recomendación de Aponte)
function leerCoordenadas(t) {
  const texto = String(t).trim().replace(/[−–]/g, "-");
  // un enlace de Google Maps: primero el marcador exacto (!3d…!4d…), luego la vista (@lat,lon) o la búsqueda (q=lat,lon)
  const url = texto.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) || texto.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || texto.match(/[?&](?:q|ll|query|destination)=(-?\d+\.\d+)(?:,|%2C)\s*(-?\d+\.\d+)/i);
  if (url) return [parseFloat(url[1]), parseFloat(url[2])];
  t = texto.replace(/[()\[\]]/g, " ").trim().toUpperCase();
  const gms = [...t.matchAll(/(\d+(?:[.,]\d+)?)\s*°\s*(?:(\d+(?:[.,]\d+)?)\s*['’]\s*)?(?:(\d+(?:[.,]\d+)?)\s*(?:"|''|”)\s*)?([NSEOW])/g)];
  if (gms.length === 2) {
    const val = (m) => { const n = (x) => parseFloat(String(x || 0).replace(",", ".")); return (n(m[1]) + n(m[2]) / 60 + n(m[3]) / 3600) * (/[SOW]/.test(m[4]) ? -1 : 1); };
    const a = gms.find((m) => /[NS]/.test(m[4])), b = gms.find((m) => /[EOW]/.test(m[4]));
    return a && b ? [val(a), val(b)] : null;
  }
  const p = t.match(/^(-?\d+(?:[.,]\d+)?)[\s;,]+(-?\d+(?:[.,]\d+)?)$/);
  if (!p) return null;
  const la = parseFloat(p[1].replace(",", ".")), lo = parseFloat(p[2].replace(",", "."));
  return Math.abs(la) <= 90 && Math.abs(lo) <= 180 ? [la, lo] : null;
}
// lugares guardados en este teléfono
const FAV_KEY = "muyuy-favoritos";
const getFavs = () => { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; } };
function setFavs(l) { try { localStorage.setItem(FAV_KEY, JSON.stringify(l)); } catch {} pintarFavs(); }
function pintarFavs() {
  const box = $("#pickFavs"), l = getFavs();
  box.hidden = !l.length;
  box.innerHTML = l.map((f, i) => `<span class="pk-fav"><button type="button" data-i="${i}">⭐ ${esc(f.n)}</button><button type="button" class="pk-fav-x" data-x="${i}" aria-label="${esc(tr("pickFavQuitar"))}: ${esc(f.n)}">✕</button></span>`).join("");
  $$("button[data-i]", box).forEach((b) => (b.onclick = () => {
    const f = getFavs()[+b.dataset.i];
    if (pickMap) pickMap.flyTo([f.lat, f.lon], 12, { duration: 0.8 });
    selectCommunity({ nombre: f.n, clase: "punto", fav: true, lat: f.lat, lon: f.lon, alt: f.alt });
  }));
  $$("button[data-x]", box).forEach((b) => (b.onclick = () => { const x = getFavs(); x.splice(+b.dataset.x, 1); setFavs(x); }));
}
function selectPoint(lat, lon) {
  // un lugar sin punto en el mapa también se reconoce: se nombra la capital de distrito más cercana
  let cerca = null, cercaKm = Infinity;
  for (const d of (COM && COM.distritos) || []) { const km = kmBetween(lat, lon, d[1], d[0]); if (km < cercaKm) { cercaKm = km; cerca = d; } }
  selectCommunity({ nombre: tr("pickPunto", { lat: lat.toFixed(3), lon: lon.toFixed(3) }), clase: "punto", lat, lon, cerca: cercaKm <= 80 ? cerca : null, cercaKm: Math.round(cercaKm) });
}

async function openPicker() {
  await esperarLeaflet();
  const dlg = $("#picker");
  $("#pickQ").placeholder = tr("pickBuscar");
  applyStatic(dlg);
  dlg.showModal();
  pickSel = null;
  pickInfo(`<p class="pk-vacio">${tr("pickNinguna")}</p>`, false);
  if (typeof L === "undefined" || typeof L.map !== "function") { showPickList(); return; }
  if (!pickMap) {
    $("#pickMap").classList.add("cargando");
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 30)));
  }
  const C = await getCom();
  if (!pickMap) {
    pickMap = L.map("pickMap", { minZoom: 2, worldCopyJump: true });
    const cred = pickMap.attributionControl.getContainer(); // los créditos, en una línea que se abre al tocarla
    cred.addEventListener("click", (e) => { if (e.target.tagName !== "A") cred.classList.toggle("abierto"); });
    if ("ResizeObserver" in window) new ResizeObserver(() => pickMap.invalidateSize()).observe($("#pickMap")); // la leyenda y los datos cambian su tamaño
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", { maxZoom: 16, attribution: "Esri, HERE, Garmin, © OpenStreetMap" }).addTo(pickMap);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}", { maxZoom: 16, pane: "shadowPane" }).addTo(pickMap);
    const all = L.latLngBounds([[-18.4, -81.4], [-0.1, -68.6]]); // Perú
    // las 398 celdas de clima ya calculadas: todo el Perú tiene datos, aunque no haya comunidades registradas
    const cob = L.canvas({ padding: 0.3 });
    for (const k of Object.keys(C.sitio_celda || {})) {
      const [ci, cj] = k.split("_").map(Number), la = ci * C.celda[0] - 90, lo = cj * C.celda[1] - 180;
      L.rectangle([[la, lo], [la + C.celda[0], lo + C.celda[1]]], { renderer: cob, stroke: false, fillColor: "#43a047", fillOpacity: 0.24, interactive: false }).addTo(pickMap);
    }
    if (L.capaLimites) L.capaLimites(pickMap); // departamentos y provincias
    L.puntosLayer(C.puntos, { color: (p) => (p[2] ? "#2e8b57" : "#d81b60"), radio: (p, z) => (z < 6 ? 1.6 : z < 9 ? 2 : z < 11 ? 3.2 : 5), desdeZoom: PICK_CERCA })
      .on("punto", (e) => { const p = e.punto; selectCommunity({ nombre: p[4], tipo: p[2], pob: p[3], dep: C.deps[p[5]], prov: C.provs[p[6]], dist: C.dists[p[7]], lat: p[1], lon: p[0] }); })
      .addTo(pickMap);
    // capitales de distrito (INEI): en la costa casi no hay comunidades registradas, pero cada distrito tiene datos
    L.puntosLayer(C.distritos || [], { color: () => "#3f51b5", radio: (p, z) => (z < 6 ? 2 : z < 8 ? 3 : 4.5), desdeZoom: PICK_CERCA })
      .on("punto", (e) => { const d = e.punto; selectCommunity({ nombre: d[2], clase: "distrito", prov: d[4], dep: C.deps[d[3]], alt: d[5], lat: d[1], lon: d[0] }); })
      .addTo(pickMap);
    // debajo de los otros puntos y solo de cerca: de lejos serían una mancha y un celular medio se trabaría
    const capaPob = L.puntosLayer([], { color: () => "#e67e00", radio: (p, z) => (z < 9 ? 1.5 : z < 11 ? 2.5 : 4), minZoom: 7, zIndex: 0, desdeZoom: PICK_CERCA, attribution: "Minedu (Escale) · Mincul (BDPI)" })
      .on("punto", (e) => selectCommunity(pobladoDe(e.punto)))
      .addTo(pickMap);
    getPoblados().then((pts) => capaPob.setPuntos(pts));
    pickMap.on("click", (e) => {
      if (e.originalEvent && e.originalEvent._muyuyPunto) return;
      selectPoint(e.latlng.lat, e.latlng.lng);
      if (pickMap.getZoom() < PICK_CERCA) pickMap.flyTo(e.latlng, PICK_CERCA + 1, { duration: 0.6 }); // de cerca se ve si es su chacra
    });
    // chacras de ejemplo en otros continentes: se ven al alejar el mapa
    for (const s of SITES_LIST.filter((x) => x.ejemplo)) {
      L.marker([s.lat, s.lon], { icon: L.divIcon({ className: "muyuy-mundo", html: "🌍", iconSize: [28, 28] }), zIndexOffset: 900 })
        .bindTooltip(`🌍 ${esc(s.nombre)}`, { direction: "top" })
        .on("click", () => selectCommunity({ nombre: s.nombre, lat: s.lat, lon: s.lon, isSite: true, site: s.id }))
        .addTo(pickMap);
    }
    $("#pickMundo").innerHTML = SITES_LIST.filter((x) => x.ejemplo).map((s) =>
      `<button type="button" data-id="${s.id}">${esc(s.nombre.split(",")[0])}<small>${esc((s.nombre.split(",")[1] || "").trim())}</small></button>`).join("");
    $$("#pickMundo button").forEach((b) => (b.onclick = () => {
      const s = SITES_LIST.find((x) => x.id === b.dataset.id);
      pickMap.setView([s.lat, s.lon], 7);
      selectCommunity({ nombre: s.nombre, lat: s.lat, lon: s.lon, isSite: true, site: s.id });
    }));
    pickMap.fitBounds(all, { padding: [10, 10] });
    pickMap._peru = all;
    $("#pickMap").classList.remove("cargando");
  }
  setTimeout(() => {
    pickMap.invalidateSize();
    if (chosen) pickMap.setView([chosen.lat, chosen.lon], 9); else pickMap.fitBounds(pickMap._peru, { padding: [10, 10] });
  }, 120);
}
function showPickList() {
  $("#pickMap").innerHTML = `<p class="pk-vacio">${tr("sinMapaPick")}</p>`;
  $("#pickRes").innerHTML = SITES_LIST.filter((s) => !s.parcela).map((s) => `<li><button type="button" data-id="${s.id}">${esc(s.nombre)}</button></li>`).join("");
  $$("#pickRes button").forEach((b) => (b.onclick = () => {
    const s = SITES_LIST.find((x) => x.id === b.dataset.id);
    pickSel = { nombre: s.nombre, lat: s.lat, lon: s.lon, isSite: true, site: s.id, km: 0 };
    pickInfo(`<h3>${esc(s.nombre)}</h3><p class="pk-datos">${tr("pickMismo")}</p>`, true);
  }));
}
async function usePicked() {
  if (!pickSel) return;
  chosen = pickSel.isSite ? null : pickSel;
  try { chosen ? localStorage.setItem("muyuy-comunidad", JSON.stringify(chosen)) : localStorage.removeItem("muyuy-comunidad"); } catch {}
  desdePortada = false;
  $("#picker").close();
  if ($("#site").value !== pickSel.site) { $("#site").value = pickSel.site; await loadSite(pickSel.site); }
  else { renderCtx(); renderMini(); updateSiteName(); }
  if (guided) showStep(0);
  nudge();
  abrirQueHacer();
}
// desde el mapa del Perú (mapa.js): la comunidad o el punto tocado, con los datos del sitio `id` de su celda
function usarLugar(id, lugar) {
  const s = SITES_LIST.find((x) => x.id === id);
  chosen = lugar && lugar.nombre && s ? { nombre: lugar.nombre, lat: lugar.lat, lon: lugar.lon, site: id, km: Math.round(kmBetween(lugar.lat, lugar.lon, s.lat, s.lon)) } : null;
  try { chosen ? localStorage.setItem("muyuy-comunidad", JSON.stringify(chosen)) : localStorage.removeItem("muyuy-comunidad"); } catch {}
}
function listaSoloSinRed() { $("#pickList").hidden = navigator.onLine !== false; }
function initPicker() {
  listaSoloSinRed();
  addEventListener("online", listaSoloSinRed);
  addEventListener("offline", listaSoloSinRed);
  // el menú "Más" se cierra al elegir una opción o al tocar fuera de él
  document.addEventListener("click", (e) => {
    const d = $(".mas");
    if (d && d.open && (!d.contains(e.target) || e.target.closest(".mas-menu"))) d.open = false;
  });
  $("#sitePick").onclick = openPicker;
  $("#pickClose").onclick = () => $("#picker").close();
  // quien entra por primera vez y cierra sin elegir vuelve a la portada: no se queda viendo los datos de otro lugar
  $("#picker").addEventListener("close", () => {
    if (!desdePortada) return;
    desdePortada = false;
    let ya = false;
    try { ya = !!localStorage.getItem(DONDE_KEY); } catch {}
    if (!ya) openSplash();
  });
  $("#pickUse").onclick = usePicked;
  pintarFavs();
  // la misma caja busca lugares y acepta coordenadas: al pegarlas va solo; al escribirlas, con Enter o tocando la fila
  const irCoord = async (p) => {
    $("#pickRes").innerHTML = "";
    await getCom(); // para nombrar el lugar y elegir el punto de datos más parecido
    if (pickMap) pickMap.flyTo(p, 12, { duration: 0.8 });
    selectPoint(p[0], p[1]);
  };
  const pareceCoord = (t) => /\d/.test(t) && /^[-−–+\d\s.,;°º'’"”NSEOW()]+$/i.test(t);
  $("#pickQ").addEventListener("paste", () => setTimeout(() => { const p = leerCoordenadas($("#pickQ").value); if (p) irCoord(p); }, 0));
  $("#pickList").onclick = showPickList;
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  let idx = null, idxD = null, idxP = null;
  $("#pickGps").onclick = () => {
    if (!navigator.geolocation) return toast(tr("pickGpsNo"));
    const b = $("#pickGps"), antes = b.innerHTML, listo = () => { b.disabled = false; b.innerHTML = antes; };
    b.disabled = true; b.textContent = tr("pickGpsBusca"); // el GPS puede tardar hasta 15 segundos
    navigator.geolocation.getCurrentPosition((pos) => {
      listo();
      const { latitude: la, longitude: lo } = pos.coords;
      if (pickMap) pickMap.flyTo([la, lo], 12, { duration: 0.8 });
      selectPoint(la, lo);
    }, () => { listo(); toast(tr("pickGpsNo")); }, { enableHighAccuracy: true, timeout: 15000 });
  };
  // la lista se cierra al tocar fuera de la caja; Esc la cierra sin cerrar la ventana
  $("#picker").addEventListener("click", (e) => { if (!e.target.closest(".pk-buscar, #pickList")) $("#pickRes").innerHTML = ""; });
  $("#pickQ").addEventListener("keydown", (e) => {
    if (e.key === "Escape" && $("#pickRes").innerHTML) { e.preventDefault(); $("#pickRes").innerHTML = ""; }
    if (e.key === "Enter") {
      const v = $("#pickQ").value.trim(), p = leerCoordenadas(v);
      const primero = $("#pickRes button"); // con nombre: Enter (o «Ir» en el teclado del celular) elige la primera fila
      if (p) { e.preventDefault(); irCoord(p); } else if (pareceCoord(v)) { e.preventDefault(); toast(tr("pickCorMal")); }
      else if (primero) { e.preventDefault(); primero.click(); }
    }
  });
  $("#pickQ").addEventListener("input", async () => {
    const t = norm($("#pickQ").value.trim()), out = $("#pickRes"), crudo = $("#pickQ").value.trim(), co = leerCoordenadas(crudo);
    if (co) {
      out.innerHTML = `<li><button type="button">📌 <b>${tr("pickCorIrA")}</b> <small>${co[0].toFixed(6)}, ${co[1].toFixed(6)}</small></button></li>`;
      $("button", out).onclick = () => irCoord(co);
      return;
    }
    if (pareceCoord(crudo)) { out.innerHTML = `<li class="pk-nada">${tr("pickCorSigue")}</li>`; return; } // todavía escribe los números
    if (t.length < 2) { out.innerHTML = ""; return; }
    const C = await getCom(), P = await getPoblados();
    if (norm($("#pickQ").value.trim()) !== t) return; // ya escribió otra cosa: no pisar la lista nueva
    idx = idx || C.puntos.map((p) => [norm(p[4]), norm(C.dists[p[7]])]);
    idxP = idxP || P.map((p) => [norm(p[2]), norm(p[3][0])]);
    idxD = idxD || (C.distritos || []).map((d) => [norm(d[2]), norm(d[4])]);
    // primero el nombre exacto, luego el que empieza así; a igual parecido, distrito, comunidad y centro poblado
    const nota = ([n, arriba]) => (n === t ? 0 : n.startsWith(t) ? 1 : ` ${n}`.includes(` ${t}`) ? 2 : n.includes(t) ? 3 : `${n} ${arriba}`.includes(t) ? 4 : -1);
    const todos = [];
    const junta = (lista, ind, clave, orden) => { for (let i = 0; i < ind.length; i++) { const v = nota(ind[i]); if (v >= 0) todos.push({ [clave]: lista[i], v, orden }); } };
    junta(C.distritos || [], idxD, "d", 0);
    junta(C.puntos, idx, "p", 1);
    junta(P, idxP, "o", 2);
    const hits = todos.sort((a, b) => a.v - b.v || a.orden - b.orden).slice(0, 10);
    out.innerHTML = !hits.length ? `<li class="pk-nada">${tr("pickSinRes")}</li>` : hits.map((h, k) => (h.d
      ? `<li><button type="button" data-k="${k}">🏛️ <b>${esc(h.d[2])}</b> <small>${tr("pickDistrito")} · ${esc(h.d[4])}, ${esc(C.deps[h.d[3]])}</small></button></li>`
      : h.o ? `<li><button type="button" data-k="${k}">🏘️ <b>${esc(h.o[2])}</b> <small>${esc(h.o[3][0])}, ${esc(h.o[3][2])}</small></button></li>`
      : `<li><button type="button" data-k="${k}"><i class="sw ${h.p[2] ? "nat" : "camp"}"></i> <b>${esc(h.p[4])}</b>
      <small>${esc(C.dists[h.p[7]])}, ${esc(C.deps[h.p[5]])}</small></button></li>`)).join("");
    $$("button", out).forEach((b) => (b.onclick = () => {
      const h = hits[+b.dataset.k];
      out.innerHTML = "";
      if (h.o) {
        if (pickMap) pickMap.flyTo([h.o[1], h.o[0]], 12, { duration: 0.8 });
        return selectCommunity(pobladoDe(h.o));
      }
      if (h.d) {
        const d = h.d;
        if (pickMap) pickMap.flyTo([d[1], d[0]], 11, { duration: 0.8 });
        return selectCommunity({ nombre: d[2], clase: "distrito", prov: d[4], dep: C.deps[d[3]], alt: d[5], lat: d[1], lon: d[0] });
      }
      const p = h.p;
      if (pickMap) pickMap.flyTo([p[1], p[0]], 11, { duration: 0.8 });
      selectCommunity({ nombre: p[4], tipo: p[2], pob: p[3], dep: C.deps[p[5]], prov: C.provs[p[6]], dist: C.dists[p[7]], lat: p[1], lon: p[0] });
    }));
  });
}

// mini mapa del paso 1: la comunidad elegida, su celda de clima NASA Power y el sitio calculado
// Leaflet se baja sin bloquear la portada: lo que usa mapas espera a que llegue
const esperarLeaflet = () => (typeof L !== "undefined" ? Promise.resolve() : new Promise((ok) => {
  const t0 = Date.now(), t = setInterval(() => { if (typeof L !== "undefined" || Date.now() - t0 > 15000) { clearInterval(t); ok(); } }, 100);
}));
function renderMini() {
  const el = $("#miniMap");
  $(".mini-cap").hidden = false;
  if (typeof L === "undefined") { esperarLeaflet().then(() => { if (typeof L !== "undefined") renderMini(); else el.hidden = true; }); return; }
  if (typeof L.map !== "function") { el.hidden = true; return; }
  const site = SITES_LIST.find((s) => s.id === $("#site").value);
  if (!site) { el.hidden = true; return; }
  el.hidden = false;
  const pt = chosen && chosen.site === site.id ? [chosen.lat, chosen.lon] : [site.lat, site.lon];
  if (!miniMap) {
    miniMap = L.map(el, { zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false, attributionControl: false });
    // sin internet la foto satelital no carga: se dice en el recuadro en vez de dejarlo gris
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 16 })
      .on("tileerror", () => { el.dataset.msg = tr("miniSinRed"); el.classList.add("sin-red"); })
      .on("tileload", () => el.classList.remove("sin-red"))
      .addTo(miniMap);
    miniMap._capa = L.layerGroup().addTo(miniMap);
  }
  const g = miniMap._capa;
  g.clearLayers();
  const la0 = Math.floor((pt[0] + 90) / 0.5) * 0.5 - 90, lo0 = Math.floor((pt[1] + 180) / 0.625) * 0.625 - 180;
  L.rectangle([[la0, lo0], [la0 + 0.5, lo0 + 0.625]], { color: "#64b5f6", weight: 2, fillOpacity: 0.08, dashArray: "6 4" }).addTo(g);
  L.circleMarker(pt, { radius: 8, color: "#fff", weight: 3, fillColor: "#e53935", fillOpacity: 1 }).addTo(g);
  setTimeout(() => { miniMap.invalidateSize(); miniMap.fitBounds([[la0, lo0], [la0 + 0.5, lo0 + 0.625], [site.lat, site.lon], pt], { padding: [18, 18] }); }, 80);
}

// ---------------------------------------------------------------- recorrido guiado paso a paso
// Un paso a la vez, con barra de progreso, botones Atrás/Siguiente, flechas, deslizar y el botón atrás del navegador.
// "Ver todo en una página" muestra los 7 pasos seguidos (para el jurado o el técnico).
const STEPS = ["parcela", "rotaciones", "hoy", "cierre"]; // prioridades y «Pruebe su idea» van dentro de los pasos 1 y 2
const STEP_TITLE = ["hParcela", "hPrio", "hHoy", "hTop", "hBuild", "hCierre"];
const STEP_SHORT = ["paso1", "paso3", "pasoCuando", "pasoCierre"];
let cur = 0, maxSeen = 0;
let guided = true; // siempre paso a paso: «Ver todo en una página» se quitó del menú Más (y no se recuerda el modo viejo)

function renderStepper() {
  const n = STEPS.length;
  $$("#steps li").forEach((li, i) => {
    li.classList.toggle("current", i === cur);
    li.classList.toggle("done", i < cur || (i <= maxSeen && i !== cur));
    $("button", li).setAttribute("aria-current", i === cur ? "step" : "false");
  });
  $("#steps").style.setProperty("--prog-n", cur / (n - 1));
  $("#stepNow").textContent = `${tr("pasoDe", { n: cur + 1, t: n })} · ${tr(STEP_SHORT[cur])}`;
  $("#stepBar").style.width = `${((cur + 1) / n) * 100}%`;
  $("#stepCount").textContent = tr("pasoDe", { n: cur + 1, t: n });
  $("#prevBtn").title = cur === 0 ? tr("atrasPortada") : ""; // en el paso 1, «Atrás» lleva a la portada
  // solo «Siguiente →» (el nombre del paso ocupaba mucho en el celular); el paso que sigue queda en la descripción del botón
  const nb = $("#nextBtn"), sig = cur < n - 1 ? tr("siguiente", { s: tr(STEP_SHORT[cur + 1]) }) : "";
  nb.textContent = sig ? tr("siguiente", { s: "" }).replace(/[\s:：]+$/, "") + " →" : tr("terminar"); // la única flecha: el botón Siguiente
  if (sig) { nb.title = sig; nb.setAttribute("aria-label", sig); } else { nb.removeAttribute("title"); nb.removeAttribute("aria-label"); }
}

function showStep(i, { push = true, focus = true } = {}) {
  i = Math.max(0, Math.min(STEPS.length - 1, i));
  const dir = i >= cur ? "fwd" : "back";
  cur = i;
  maxSeen = Math.max(maxSeen, i);
  if (guided) {
    STEPS.forEach((id, k) => {
      const el = document.getElementById(id);
      el.hidden = k !== i;
      el.classList.remove("enter-fwd", "enter-back");
      // el paso estaba oculto: al mostrarse, su animación empieza sola (leer offsetWidth medía toda la página: 0,3 s en un celular)
      if (k === i && !REDUCED) el.classList.add("enter-" + dir);
    });
    window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
    if (focus) document.getElementById(STEPS[i]).querySelector("h2").focus({ preventScroll: true });
    if (focus && audioOn && (window.MUYUY_AJ || {}).leer) setTimeout(() => { const v = document.getElementById(STEPS[i]).querySelector(".say"); if (v && cur === i) v.click(); }, 500); // leer cada paso al abrirlo
  } else {
    document.getElementById(STEPS[i]).scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
  }
  if (push && location.hash !== "#" + STEPS[i]) history.pushState({ step: i }, "", "#" + STEPS[i]);
  renderStepper();
}

function setMode(g) {
  guided = g;
  try { localStorage.setItem("muyuy-modo", g ? "guiado" : "todo"); } catch {}
  document.body.classList.toggle("guided", g);
  if (!g) { STEPS.forEach((id) => (document.getElementById(id).hidden = false)); }
  showStep(cur, { push: false, focus: false });
}

function initWizard() {
  STEPS.forEach((id) => document.getElementById(id).querySelector("h2").setAttribute("tabindex", "-1"));
  $$("[data-go]").forEach((b) => (b.onclick = () => showStep(+b.dataset.go)));
  $("#prevBtn").onclick = () => (cur === 0 ? openSplash() : showStep(cur - 1));
  $("#nextBtn").onclick = () => showStep(cur < STEPS.length - 1 ? cur + 1 : 0);
  // enlaces internos (#rotaciones, ayuda) y botón atrás del navegador
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const k = STEPS.indexOf(a.getAttribute("href").slice(1));
    if (k >= 0) { e.preventDefault(); showStep(k); }
  });
  window.addEventListener("popstate", () => { const k = STEPS.indexOf(location.hash.slice(1)); showStep(k >= 0 ? k : 0, { push: false }); });
  // flechas del teclado (si no se está escribiendo o moviendo un slider)
  document.addEventListener("keydown", (e) => {
    if (!guided || e.target.closest("input, select, textarea, dialog") || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "ArrowRight") showStep(cur + 1);
    if (e.key === "ArrowLeft") showStep(cur - 1);
  });
  // deslizar con el dedo (fuera de sliders, cultivos y casillas)
  let x0 = null, y0 = 0;
  $("main").addEventListener("touchstart", (e) => {
    x0 = e.target.closest("input, select, .chip, .slot, .grid, .leaflet-container") ? null : e.touches[0].clientX;
    y0 = e.touches[0].clientY;
  }, { passive: true });
  $("main").addEventListener("touchend", (e) => {
    if (!guided || x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 70 && Math.abs(dx) > 2 * Math.abs(dy)) showStep(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });
  const start = STEPS.indexOf((window.MUYUY_HASH || location.hash).slice(1)); // index.html quita la marca al abrir
  cur = start >= 0 ? start : 0;
  history.replaceState({ step: cur }, "", "#" + STEPS[cur]);
  setMode(guided);
}

function initScrollFx() {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.08 });
  $$(".reveal").forEach((el) => io.observe(el));
  // respaldo: si el observador no llega a disparar (impresión, pasos ocultos, navegadores antiguos), todo queda visible
  setTimeout(() => $$(".reveal").forEach((el) => el.classList.add("in")), 1500);
  // en modo "ver todo", la barra sigue al paso que se está leyendo
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (!guided && e.isIntersecting) { cur = STEPS.indexOf(e.target.id); maxSeen = Math.max(maxSeen, cur); renderStepper(); }
  }), { rootMargin: "-40% 0px -55% 0px" });
  STEPS.forEach((id) => spy.observe(document.getElementById(id)));
}

// ---------------------------------------------------------------- arranque
// una celda: su archivo (pocos KB) y los textos compartidos; si no están, el archivo con las 398 celdas
async function gzJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(url);
  const plano = "DecompressionStream" in window ? r.body.pipeThrough(new DecompressionStream("gzip")) : r.body;
  return new Response(plano).json();
}
let TEXTOS_CELDAS = null;
async function celdaDatos(id) {
  try {
    const [c, t] = await Promise.all([gzJson(`data/celdas/${id}.json.gz`), TEXTOS_CELDAS || gzJson("data/celdas/textos.json.gz")]);
    TEXTOS_CELDAS = t;
    return { ...c, textos: t };
  } catch {
    const C = await getCeldas();
    return { ...C.celdas[id], textos: C.textos };
  }
}
let CELDAS = null;
async function getCeldas() {
  if (!CELDAS) {
    const r = await fetch("data/celdas.json.gz");
    const plano = "DecompressionStream" in window ? r.body.pipeThrough(new DecompressionStream("gzip")) : r.body;
    CELDAS = await new Response(plano).json();
  }
  return CELDAS;
}
const EXACTAS = {}; // chacras exactas calculadas en el teléfono (calcularExacta)
let MUNDO = null; // chacras de ejemplo en otros continentes (scripts/build_mundo_ejemplos.py)
async function getMundo() {
  if (!MUNDO) {
    const r = await fetch("data/mundo.json.gz");
    const plano = "DecompressionStream" in window ? r.body.pipeThrough(new DecompressionStream("gzip")) : r.body;
    MUNDO = await new Response(plano).json();
  }
  return MUNDO;
}
// colores vivos de los grupos de cultivos (los datos ya calculados traen los cafés de antes)
const COLOR_VIVO = { "#8d6e63": "#7b2cbf", "#8e5b9c": "#b0399b", "#558b2f": "#2e9d3e", "#9e9d24": "#7cb342" };
function colorVivo(d) {
  for (const c of Object.values((d && d.cultivos) || {})) if (c && COLOR_VIVO[String(c.color).toLowerCase()]) c.color = COLOR_VIVO[String(c.color).toLowerCase()];
  return d;
}
async function siteData(id) {
  const s = SITES_LIST.find((x) => x.id === id);
  if (s && s.ejemplo) return (await getMundo())[id];
  if (s && s.parcela) return EXACTAS[id] || (await restaurarExacta(id)) || siteData(nearestComputed(s.lat, s.lon).id);
  if (s && s.grid) return celdaDatos(id);
  return (await fetch(`data/${id}.json`)).json();
}

async function loadSite(id, first = false) {
  $(".logo-spin").classList.add("spin");
  setTimeout(() => $(".logo-spin").classList.remove("spin"), 900);
  D = colorVivo(await siteData(id));
  try { localStorage.setItem("muyuy-sitio", id); } catch {}
  // el clima de 2050 (data/futuro.json.gz) viene en el orden de las rotaciones del archivo del lugar: se guarda ese orden,
  // porque al recalcular (entrevista, riego o el resto en segundo plano) las rotaciones cambian de orden
  D._ordenFut = Object.keys(D.rotaciones || {});
  const delAgricultor = perfilDelAgricultor(D); // su entrevista, su riego y lo que sembró según su último cierre
  // Las rotaciones ya vienen calculadas en los datos del lugar: se muestran al instante. Solo se calcula si faltan:
  //  - sitios piloto: traen todas (motor de Python) → no se recalcula nada al abrir;
  //  - celdas del mapa: traen las mejores → se muestran ya y el resto se calcula en segundo plano (motor_worker.js);
  //  - sin ninguna (archivo único sin internet, chacra exacta): se calcula antes de mostrar.
  // si la tabla de cultivos cambió (p. ej., nuevas alturas con fuente), pueden faltar combinaciones: se calculan en segundo plano
  const posibles = Object.values(D.cultivos || {}).filter((c) => c.factible !== false).length;
  const n = Object.keys(D.rotaciones || {}).length, todas = n > 0 && n >= Math.max(D.n_total || n, D.celda ? posibles ** 3 : 0);
  const sitio = D;
  if (!n || delAgricultor) { // con lo que contó el agricultor, todas las rotaciones se vuelven a probar con sus respuestas
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0))); // deja pintar antes del cálculo
    const ok = await motorAplicar(D.perfil);
    if (delAgricultor) D.perfil.sinRecalc = !ok;
  } else await motorAplicar(D.perfil, { calcular: false });
  if (D.perfil.rotacion_actual && !D.rotaciones[D.perfil.rotacion_actual]) D.perfil.rotacion_actual = null;
  await showSite(first);
  if (n && !todas && !delAgricultor && D === sitio) completarEnFondo(sitio);
  guardarVecinos(sitio);
}
// con señal, se guardan también los datos de los 8 puntos calculados más cercanos (unos 400 KB): si la persona se mueve
// por su zona sin señal, Muyuy sigue calculando. No se hace con «ahorro de datos» activado en el teléfono
function guardarVecinos(s) {
  const c = navigator.connection;
  const yo = SITES_LIST.find((x) => x.id === s.sitio) || s; // las coordenadas están en la lista de lugares
  if (navigator.onLine === false || (c && c.saveData) || yo.lat == null) return;
  const cerca = SITES_LIST.filter((x) => x.grid && x.id !== s.sitio).map((x) => [kmBetween(yo.lat, yo.lon, x.lat, x.lon), x.id]).sort((a, b) => a[0] - b[0]).slice(0, 8);
  const bajar = () => Promise.all(["data/celdas/textos.json.gz", ...cerca.flatMap(([, id]) => [`data/motor/${id}.bin`, `data/celdas/${id}.json.gz`])]
    .map((u) => fetch(u).then((r) => r.ok && r.arrayBuffer()).catch(() => null)));
  setTimeout(() => ("requestIdleCallback" in window ? requestIdleCallback(bajar, { timeout: 8000 }) : bajar()), 4000); // después de mostrar su chacra
}

// ---------------------------------------------------------------- lo que contó el agricultor, guardado por lugar
// Antes la entrevista solo se guardaba para el CSV: al volver a abrir Muyuy o cambiar de lugar se perdía y todo se
// calculaba con el perfil de ejemplo. Ahora cada lugar recuerda su entrevista y su riego, y «lo que siembra hoy» parte
// del último cierre de campaña si es más nuevo que la entrevista.
const PERFIL_KEY = "muyuy-perfil";
const perfilesGuardados = () => { try { return JSON.parse(localStorage.getItem(PERFIL_KEY)) || {}; } catch { return {}; } };
const hoyISO = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
function guardarPerfil(cambios) {
  if (!D) return;
  const todos = perfilesGuardados();
  todos[D.sitio] = { ...(todos[D.sitio] || {}), ...cambios };
  try { localStorage.setItem(PERFIL_KEY, JSON.stringify(todos)); } catch {}
}
function perfilDelAgricultor(sitio) {
  const g = perfilesGuardados()[sitio.sitio];
  const cierre = getReg().filter((r) => r.sitio === sitio.sitio && r.seq && r.seq !== "otra").sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0];
  if (!g && !cierre) return false;
  const p = { ...sitio.perfil };
  if (g && g.resp) Object.assign(p, g.resp, { entrevista: true, campanias_texto: g.dichas || [], rotacion_pedida: g.resp.rotacion_actual || null });
  if (g && g.riego_mm != null) p.riego_mm = g.riego_mm;
  if (g && g.lab) p.lab = g.lab; // su análisis de suelo
  if (cierre && (!g || !g.resp || cierre.fecha >= (g.fechaEnt || ""))) { p.rotacion_actual = cierre.seq; p.desdeCierre = cierre.fecha; }
  sitio.perfil = p;
  return true;
}

// el resto de las rotaciones de una celda, sin congelar la pantalla; al llegar se vuelve a ordenar todo
async function completarEnFondo(sitio) {
  const ok = await motorAplicar(sitio.perfil, { fondo: true, sitio });
  if (!ok || D !== sitio) return;
  lastTop = "";
  renderHoy();
  await renderTop();
  renderCustom();
  if (typeof CAMPO !== "undefined") CAMPO.alSitio();
}

// ---------------------------------------------------------------- motor en segundo plano (Web Worker)
// En la web (http) el cálculo corre en motor_worker.js; en el archivo único (file://) o si el hilo falla, aquí mismo.
let MW = null, mwN = 0;
const mwPend = new Map();
function motorHilo() {
  if (MW !== null) return MW;
  MW = false;
  try {
    if (window.Worker && location.protocol.startsWith("http")) {
      MW = new Worker("motor_worker.js");
      MW.onmessage = (e) => { const f = mwPend.get(e.data.n); if (f) { mwPend.delete(e.data.n); f(e.data); } };
      MW.onerror = () => { MW = false; for (const f of mwPend.values()) f({ ok: false }); mwPend.clear(); };
    }
  } catch { MW = false; }
  return MW;
}
function calcularMotor(id, p) {
  const local = () => ({ r: MOTOR.calcular(id, p), cultivos: MOTOR.cultivos(id, p.riego_mm) });
  const w = motorHilo();
  if (!w) return Promise.resolve(local());
  return new Promise((res) => {
    const n = ++mwN;
    mwPend.set(n, (d) => res(d.ok ? { r: d.r, cultivos: d.cultivos } : local()));
    w.postMessage({ n, id, perfil: p, langs: ["es", "en", "qu"] });
  });
}

// Motor dentro de la app (motor.js): con el clima diario de la NASA del lugar prueba todas las rotaciones con el perfil
// (cultivo anterior, heladas, granizo, riego, textura, terrazas, abono). Si el lugar no tiene esos datos (los ejemplos
// fuera del Perú), se quedan las rotaciones que ya traía.
const ROT_TIPICA = { sierra: "papa|cebada|descanso", costa: "maiz_amarillo|maiz_amarillo|maiz_amarillo",
                     selva: "maiz_amarillo|maiz_amarillo|maiz_amarillo" }; // muyuy/resumen.py (ACTUAL)
// calcular: false → solo deja listo el motor (clima, tablas y «¿Y si…?») con las rotaciones que ya traía el lugar.
// fondo / sitio: el cálculo de completarEnFondo; si mientras tanto se eligió otro lugar, no se aplica.
async function motorAplicar(perfil, { calcular = true, sitio = D } = {}) {
  if (!window.MOTOR || !sitio) return false;
  if (sitio.fuera_peru) { sitio.motor = false; return false; } // los ejemplos de otros países no tienen datos del motor: no se piden
  try { await MOTOR.cargar(sitio.sitio); } catch { sitio.motor = false; return false; }
  const p = { cultivo_anterior: perfil.cultivo_anterior, heladas_campanias: perfil.heladas_campanias, granizo_anios: perfil.granizo_anios,
              riego_mm: perfil.riego_mm, textura: perfil.textura, terrazas: perfil.terrazas, usa_abono: perfil.usa_abono, lab: perfil.lab || null };
  sitio._perfilMotor = p; // el «¿Y si…?» de campo.js vuelve a calcular con el mismo perfil
  sitio.motor = true;
  if (!calcular) sitio.tmin_offset = MOTOR.offset(sitio.sitio, p); // la calibración de heladas sí (ahora.js), es inmediata
  if (calcular) {
    const { r, cultivos } = await calcularMotor(sitio.sitio, p);
    const antes = sitio.cultivos || {};
    sitio.cultivos = cultivos;
    for (const [id, c] of Object.entries(sitio.cultivos)) if (!Object.keys(c.plan).length && antes[id]) c.plan = antes[id].plan; // plan ya escrito
    sitio.rotaciones = r.rotaciones;
    sitio.textos = r.textos;
    sitio.anios = r.anios;
    sitio.n_total = Object.keys(r.rotaciones).length;
    sitio.tmin_offset = r.tmin_offset; // calibración de heladas con lo que contó el agricultor (ahora.js la usa también)
  }
  if (sitio !== D) return true;
  // sin entrevista, lo que siembra hoy es la rotación típica de la región (ahora siempre está calculada)
  if (!D.perfil.entrevista && !D.perfil.rotacion_actual) {
    const t = ROT_TIPICA[D.region || (D.andina ? "sierra" : "costa")];
    if (t && D.rotaciones[t]) D.perfil.rotacion_actual = t;
  }
  return true;
}

// pinta todos los pasos con el D actual (al cambiar de sitio o al recalcular con la entrevista)
// En pedazos: primero lo que se ve (cabecera y paso 1), después el resto. Cada pedazo es corto y entre uno y otro el
// teléfono pinta y atiende los toques: la página no se queda trabada al abrir o al cambiar de lugar.
const pausa = () => new Promise((r) => setTimeout(r, 0));
async function showSite(first = false) {
  lastTop = "";
  applyLang();
  updateSiteName();
  renderCtx();
  renderEntrevista();
  cargarAhora(); // ahora.js: los últimos días de la chacra (no espera a la NASA)
  (window.requestIdleCallback || ((f) => setTimeout(f, 60)))(() => renderMini()); // el mini mapa (Leaflet) cuando el teléfono esté libre
  await pausa();
  if (typeof CAMPO !== "undefined") CAMPO.alSitio(); // tendencias, restricciones y «Cómo leer los datos»
  if (esFuturo()) { prepararFuturo(); if (!FUTS) escenario = "todos"; }
  renderEscenarios();
  renderHoy();
  $("#replayYear").textContent = "";
  await pausa();
  renderPalette();
  resetSlots();
  renderAsoc();
  renderEnso(); // satelite.js: pronóstico de El Niño para la próxima campaña
  await pausa();
  await renderTop(!first);
  await pausa();
  $("#marcador").hidden = true;
  sectores = [];
  presetGame("muyuy");
  resetJuegos();
  $("#rondas").innerHTML = "";
  $("#leccion").hidden = true;
  renderCierre();
  renderCuaderno(); // ahora.js
}

async function main() {
  setLang(LANG);
  const langSel = $("#lang");
  langSel.value = LANG;
  langSel.onchange = () => changeLang(langSel.value);
  applyLang();
  // la portada se abre ya, antes de calcular el sitio: si no, se ve un momento el paso 1 detrás y luego aparece la portada
  let hayDonde = false;
  try { hayDonde = !!JSON.parse(localStorage.getItem(DONDE_KEY)); } catch {}
  if (!hayDonde && !new URLSearchParams(location.search).has("sinbienvenida")) openSplash();
  else { document.documentElement.classList.remove("portada"); quitarPortadaRapida(); }
  const sites = await (await fetch("data/sitios.json")).json();
  SITES_LIST = sites;
  const sel = $("#site");
  sel.innerHTML = sites.map((s) => `<option value="${s.id}">${s.nombre}</option>`).join(""); // incluye los puntos de celda
  if (chosen && chosen.exacta && (await restaurarExacta(chosen.site))) { // la chacra exacta guardada en el teléfono
    SITES_LIST.push({ id: chosen.site, nombre: chosen.nombre, lat: chosen.lat, lon: chosen.lon, parcela: true });
    sel.insertAdjacentHTML("beforeend", `<option value="${chosen.site}">${esc(chosen.nombre)}</option>`);
  } else if (chosen && chosen.lat != null && !sites.some((s) => s.id === chosen.site)) { // una elección guardada con un sitio que ya no existe
    const n = nearestComputed(chosen.lat, chosen.lon);
    if (n && n.id !== chosen.site) {
      chosen.site = n.id; chosen.km = Math.round(n.km);
      try { localStorage.setItem("muyuy-comunidad", JSON.stringify(chosen)); } catch {}
    }
  }
  let saved = null;
  try { saved = localStorage.getItem("muyuy-sitio"); } catch {}
  const fromUrl = new URLSearchParams(location.search).get("sitio"); // enlace directo: index.html?sitio=chulucanas&lang=en
  if (!fromUrl && chosen && sites.some((s) => s.id === chosen.site)) saved = chosen.site; // la comunidad elegida en el mapa
  if (fromUrl && sites.some((s) => s.id === fromUrl)) {
    saved = fromUrl;
    const q = new URLSearchParams(location.search); // desde mapa.html: el nombre del lugar tocado
    if (q.get("lugar")) usarLugar(fromUrl, { nombre: q.get("lugar"), lat: +q.get("lat"), lon: +q.get("lon") });
  }
  if (saved && sites.some((s) => s.id === saved)) sel.value = saved;
  sel.onchange = () => loadSite(sel.value);

  let deb;
  $$(".prio input").forEach((i) => i.addEventListener("input", () => {
    $$(".preset").forEach((p) => p.classList.remove("on"));
    prioConf();
    weights();
    clearTimeout(deb);
    deb = setTimeout(() => { renderTop(); renderCustom(); }, 180);
  }));
  $$(".preset").forEach((b) => b.addEventListener("click", async () => {
    $$(".preset").forEach((p) => p.classList.toggle("on", p === b));
    prioConf();
    await tweenSliders(b.dataset.p.split(",").map(Number));
    await renderTop(true);
    renderCustom();
    nudge();
  }));
  prioConf();
  $("#maxDesc").onchange = () => { renderTop(true); renderCustom(); };
  $("#asoc").onchange = () => { renderAsoc(); renderTop(true); renderCustom(); renderCierre(); };
  initStaticLotties();
  initSlots();
  initHelp();
  initGame();
  initCierre();
  initAhora();
  pintarOdsPrio(); // ods.js
  initEntrevista();
  initScrollFx();
  initWizard();
  if (typeof PESTANAS !== "undefined") PESTANAS.iniciar(); // pestañas dentro de los pasos cargados (facil.js)
  initTour();
  initPicker();
  $("#replayBtn").onclick = replayHoy;
  await loadSite(sel.value, true);
  volverDonde();
  initWelcome(false); // la portada ya se abrió al inicio de main()
  initDonde();
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    // la versión nueva se baja en silencio y se ve al abrir o recargar Muyuy: nunca se recarga mientras alguien la usa
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then((r) => r.update()).catch(() => {});
  }
}

main();

// ---------------------------------------------------------------- textos más cortos y claros (revisión de todos los pasos)
Object.assign(I18N.es, {"eIntro": "Responda lo que sepa; si no sabe, pase a la siguiente. Se guarda en este teléfono.", "relatoSin": "sin su entrevista", "ctxEj": "Lo típico de la región (sin su entrevista)", "crS": "Con el relieve, Muyuy ve qué parte de su chacra sufre más.", "tSmapX": "mide solo los primeros 5 cm del suelo", "hoyIntro": "Así le habría ido a lo que siembra hoy.", "hoyMemS": "Están con ★ arriba. Muyuy no ve ríos desbordados ni plagas. ¿Así le fue?", "gridS": "Cada cuadro son 3 campañas seguidas: verde funcionó, rojo no.", "resCasual": "Entre cuánto podría estar: hoy {a} y esta opción {b} de cada 10 años. La diferencia es pequeña: podría ser casualidad.", "scS": "Revise sobre todo:", "esS": "El ✓ marca la mejor de cada fila.", "esFichaS": "Toque una para ver los detalles y dar su opinión.", "anSiS": "Calculado en este teléfono con los datos de su chacra.", "anSiAniosS": "Muyuy agrupó las {n} campañas por lluvia, agua y frío.", "anSiArbolS": "Muyuy revisó {n} rotaciones para ver qué las hace funcionar aquí, y lo comprobó con otras {t}.", "anSiAcierto": "Con rotaciones nuevas, esta regla explica {a} de cada 100 diferencias; una regla simple, {b}. Lo demás depende de otras cosas.", "siNota": "Con más calor, las plantas piden más agua (unos 3 % por grado). El precio cambia solo la venta, no los costos.", "cierreIntro": "Después de la cosecha, anote lo que sembró, cosechó y vendió. La próxima vez Muyuy partirá de lo que le pasó a usted.", "cierreAviso": "Hoy no tiene que llenar nada.", "cuIntro": "Anote lo que pasa en la campaña: siembra, abono, heladas, plagas.", "cuPriv": "Se guarda solo en este equipo; no se envía a ningún lado.", "labS": "Escriba lo que dice su análisis; deje vacío lo que no tenga.", "labFuente": "Rangos del INIA (2024). Es una guía sin dosis: confírmela con un técnico o su laboratorio.", "fpRank": "Con sus prioridades sale n.° {r} de {n}.", "rsExcl": "🚫 Cultivos que no puede sembrar", "esComunT": "Vale para todas las opciones", "sgComun": "solo lo que vale para todas (arriba)"});
Object.assign(I18N.en, {"eIntro": "Answer what you know; if not, go to the next one. Saved on this phone.", "relatoSin": "without your interview", "ctxEj": "Typical for the region (without your interview)", "crS": "Using the terrain, Muyuy sees which part of your farm suffers most.", "tSmapX": "measures only the top 5 cm of soil", "hoyIntro": "How what you sow today would have done.", "hoyMemS": "Marked with ★ above. Muyuy does not see floods or pests. Is that how it went?", "resCasual": "Likely range: today {a} and this option {b} out of 10 years. The difference is small: it could be chance.", "scS": "Check above all:", "esS": "The ✓ marks the best in each row.", "esFichaS": "Tap one to see the details and give your opinion.", "anSiS": "Calculated on this phone with your farm's data.", "anSiAniosS": "Muyuy grouped the {n} seasons by rain, water and cold.", "anSiArbolS": "Muyuy reviewed {n} rotations to see what makes them work here, and checked it with {t} others.", "anSiAcierto": "With new rotations, this rule explains {a} out of 100 differences; a simple rule, {b}. The rest depends on other things.", "siNota": "With more heat, plants need more water (about 3% per degree). Price changes only sales, not costs.", "cierreIntro": "After the harvest, note what you sowed, harvested and sold. Next time Muyuy will start from what happened to you.", "cierreAviso": "You do not have to fill in anything today.", "cuIntro": "Note what happens during the season: sowing, fertilizer, frost, pests.", "cuPriv": "Saved only on this device; it is not sent anywhere.", "labS": "Enter what your analysis says; leave blank what you do not have.", "labFuente": "Ranges from INIA (2024). A guide without doses: confirm with a technician or your laboratory.", "fpRank": "With your priorities it ranks no. {r} of {n}.", "rsExcl": "🚫 Crops you cannot sow", "esComunT": "Applies to every option", "sgComun": "only what applies to all (above)"});
Object.assign(I18N.es, { esTodos: "cada cultivo" }); Object.assign(I18N.en, { esTodos: "each crop" });
// notas entre paréntesis que no ayudan a decidir
Object.assign(I18N.es, { ahSrc: "Datos de la NASA hasta el <b>{f}</b>, comparados con un año normal ({r}).", feClima: "Probada con el clima diario de NASA Power de {a} a {b} ({n} campañas), corregido a {z} m de altura.", siNota: "Con más calor, las plantas piden más agua. El precio cambia solo la venta, no los costos." });
Object.assign(I18N.en, { ahSrc: "NASA data up to <b>{f}</b>, compared with a normal year ({r}).", feClima: "Tested with NASA Power daily weather from {a} to {b} ({n} seasons), corrected to {z} m elevation.", siNota: "With more heat, plants need more water. Price changes only sales, not costs." });
Object.assign(I18N.es, { ieTab_metodo: "Método completo" }); Object.assign(I18N.en, { ieTab_metodo: "Full method" }); if (I18N.qu) I18N.qu.ieTab_metodo = "Imaynam yupan";

// ---------------------------------------------------------------- reestructura: 4 pasos y una pregunta al entrar
// Lo que antes eran pestañas o pasos aparte (prioridades, comparar, su idea, cuaderno) se abre dentro del paso que le toca.
function irA(sel) { // muestra el paso donde está, abre lo plegado y lo pone a la vista
  const el = $(sel);
  if (!el) return;
  if (typeof PESTANAS !== "undefined") PESTANAS.mostrar(el);
  setTimeout(() => el.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" }), 120);
}
function abrirQueHacer() { // grupos de preguntas (todos opcionales) o ir directo a lo que busca
  const d = $("#queHacer");
  if (!d || d.open) return;
  const G = [
    ["qhGPreg", [["qhSembro", "qhSembroS", "🌱", () => { showStep(0); irA("#entrevista"); }],
                 ["qhImporta", "qhImportaS", "⚖️", () => { showStep(0); irA("#prioridades"); }],
                 [D && D.andina ? "qhAfinar" : "qhAfinarC", "qhAfinarS", "🔧", () => { showStep(0); irA("#afinar"); }]]],
    ["qhGDirecto", [["qhOpciones", "qhOpcionesS", "⭐", () => showStep(1)],
                    ["qhYa", "qhYaS", "🌧️", () => { showStep(2); irA("#ahora"); }],
                    ["qhCosecha", "qhCosechaS", "📒", () => showStep(3)]]],
  ];
  const op = G.flatMap(([, l]) => l);
  const sitio = $("#siteName") ? $("#siteName").textContent : "";
  let i = 0;
  d.innerHTML = `<button type="button" class="pk-x qh-x" aria-label="${tr("cerrar")}">✕</button><h2 id="qhT">${tr("qhT")}</h2>${sitio ? `<p class="qh-chacra">📍 ${esc(sitio)}</p>` : ""}
    ${G.map(([g, l]) => `<p class="qh-g">${tr(g)}</p><div class="qh-ops${g === "qhGDirecto" ? " qh-dir" : ""}">${l.map(([t, st, ic]) => `<button type="button" class="qh-op" data-i="${i++}"><span class="qh-i" aria-hidden="true">${ic}</span><span class="qh-t"><b>${tr(t)}</b><small>${tr(st)}</small></span></button>`).join("")}</div>`).join("")}`;
  $$(".qh-op", d).forEach((b) => (b.onclick = () => { d.close(); op[+b.dataset.i][3](); }));
  $(".qh-x", d).onclick = () => d.close(); // sin esta X solo se cerraba tocando fuera o con Esc
  d.onclick = (e) => { if (e.target === d) d.close(); };
  d.showModal();
}
Object.assign(I18N.es, { qhGPreg: "Cuéntele a Muyuy de su chacra (opcional)", qhGDirecto: "O vaya directo",
  qhSembro: "Qué sembró y si tiene riego", qhSembroS: "2 preguntas", qhImporta: "Qué le importa y qué le limita", qhImportaS: "Agua, venta, suelo, animales",
  qhAfinar: "Afinar: heladas, tierra, precios", qhAfinarS: "Si sabe más de su chacra", qhOpciones: "Ver mis 3 opciones ya", qhOpcionesS: "Con lo típico de su región" });
Object.assign(I18N.en, { qhGPreg: "Tell Muyuy about your farm (optional)", qhGDirecto: "Or go straight to",
  qhSembro: "What you sowed and whether you irrigate", qhSembroS: "2 questions", qhImporta: "What matters to you and what limits you", qhImportaS: "Water, sales, soil, animals",
  qhAfinar: "Fine-tune: frost, soil, prices", qhAfinarS: "If you know more about your farm", qhOpciones: "See my 3 options now", qhOpcionesS: "With what is typical for your region" });
Object.assign(I18N.es, { pasoCuando: "Cuándo", hCuando: "Cuándo sembrar", pGuia1: "Responda lo que sepa: qué sembró, qué le importa y qué le limita. Con eso Muyuy le muestra 3 opciones.",
  eMas: "➕ Más sobre su chacra (opcional)", irOpciones: "Ver mis opciones →", irCuando: "Cuándo sembrar →", irCierre: "Después de la cosecha →",
  pmComparar: "⚖️ Comparar con lo que siembra hoy", pmPruebe: "✏️ Probar mi propia idea", pmMasAn: "🔍 Más análisis (para el técnico)", pmHoy: "📊 Cómo le ha ido a lo que siembra hoy",
  qhT: "¿Qué quiere hacer hoy?", qhMenu: "🧭 ¿Qué quiere hacer?", qhSiembro: "¿Qué siembro esta campaña?", qhSiembroS: "3 preguntas y 3 opciones para su chacra",
  qhYa: "¿Ya puedo sembrar?", qhYaS: "Cómo está su chacra hoy y su calendario", qhCosecha: "Anotar mi cosecha", qhCosechaS: "Cómo le fue y su cuaderno de campo", qhTodo: "Ver todo, paso a paso", ieTab_tend: "Desde 1981" });
Object.assign(I18N.en, { pasoCuando: "When", hCuando: "When to sow", pGuia1: "Answer what you know: what you sowed, what matters to you and what limits you. With that, Muyuy shows you 3 options.",
  eMas: "➕ More about your farm (optional)", irOpciones: "See my options →", irCuando: "When to sow →", irCierre: "After the harvest →",
  pmComparar: "⚖️ Compare with what you sow today", pmPruebe: "✏️ Try my own idea", pmMasAn: "🔍 More analysis (for technicians)", pmHoy: "📊 How what you sow today has done",
  qhT: "What do you want to do today?", qhMenu: "🧭 What do you want to do?", qhSiembro: "What should I sow this season?", qhSiembroS: "3 questions and 3 options for your farm",
  qhYa: "Can I sow yet?", qhYaS: "How your farm is today and your calendar", qhCosecha: "Record my harvest", qhCosechaS: "How it went and your field notebook", qhTodo: "See everything, step by step", ieTab_tend: "Since 1981" });
if (I18N.qu) Object.assign(I18N.qu, { pasoCuando: "Hayk'aq", hCuando: "Hayk'aq tarpuna", qhT: "¿Kunan imatataq ruwayta munanki?", qhSiembro: "¿Kay watapi imatataq tarpusaq?", qhYa: "¿Tarpuymanñachu?", qhCosecha: "Pallaymanta qillqay" });
// los textos nombran los pasos viejos (1 a 6): se llevan a los 4 nuevos
(() => {
  const N = { 1: 1, 2: 1, 3: 3, 4: 2, 5: 2, 6: 4 };
  for (const L of ["es", "en", "qu"]) {
    const T = I18N[L];
    if (!T) continue;
    for (const k of Object.keys(T)) {
      if (typeof T[k] !== "string" || k === "pasoDe") continue;
      T[k] = T[k].replace(/\b([Pp]aso|[Ss]tep)( |&nbsp;)([1-6])\b/g, (m, p, sp, n) => p + sp + N[n])
        .replace(/\b(6|seis|six) (pasos|steps)\b/g, (m, n, p) => ({ 6: "4", seis: "cuatro", six: "four" })[n] + " " + p);
    }
  }
})();
// paso 1 corto: preguntas que cambian el cálculo arriba; lo demás en «Afinar»
Object.assign(I18N.es, { saltoT: "¿Tiene apuro? Muyuy usa lo típico de su región.", saltoB: "Ver mis opciones ya →", afinarT: "🔧 Afinar (opcional)",
  afinarS: "Si sabe más de su chacra, póngalo aquí. Si no, Muyuy usa lo típico de su región.", nasaLinea: "Lo que ve la NASA",
  pGuia1: "Responda lo que sepa: qué sembró, si tiene riego, qué le importa y qué le limita. Con eso Muyuy le muestra 3 opciones." });
Object.assign(I18N.en, { saltoT: "In a hurry? Muyuy uses what is typical for your region.", saltoB: "See my options now →", afinarT: "🔧 Fine-tune (optional)",
  afinarS: "If you know more about your farm, add it here. If not, Muyuy uses what is typical for your region.", nasaLinea: "What NASA sees",
  pGuia1: "Answer what you know: what you sowed, whether you irrigate, what matters to you and what limits you. With that, Muyuy shows you 3 options." });
Object.assign(I18N.es, { saltoT: "Todo es opcional.", nasaLinea: "Su chacra vista por la NASA", nasaRiesgo: "riesgos" });
Object.assign(I18N.en, { saltoT: "Everything is optional.", nasaLinea: "Your farm seen by NASA", nasaRiesgo: "risks" });
Object.assign(I18N.es, { eNoSabe: "No sé" }); Object.assign(I18N.en, { eNoSabe: "Don't know" }); // cabe en una casilla
Object.assign(I18N.es, { eTerrazas: "¿Tiene terrazas o zanjas?", eAbono: "¿Abona con guano?" }); Object.assign(I18N.en, { eTerrazas: "Terraces or ditches?", eAbono: "Do you use manure?" });
Object.assign(I18N.es, { calendario: "🖨️ Imprimir" }); Object.assign(I18N.en, { calendario: "🖨️ Print" }); // cabe en la fila de botones
// paso 2 en una sola tarjeta por opción
Object.assign(I18N.es, { verFicha: "📋 Por qué aparece", compartir: "📲 WhatsApp", cdHoy: "Lo de hoy: {n} de 10", cdMas: "S/ {v} más al año", cdMenos: "S/ {v} menos al año",
  cdSeg: "Seguro: {n}", cdSegF: "Qué tan seguro: {n} ({p}).", opCardT: "¿La probaría en su chacra?", opCSi: "👍 Sí", opCDuda: "🤔 Dudas", opCNo: "👎 No",
  adT: "🧑‍🌾 Antes de decidir", escPregunta2: "¿Cómo le iría en…?", escC_todos: "Todos", escC_nino: "El Niño", escC_seco: "Secos", escC_nina: "La Niña",
  escC_f245: "2050", escC_f585: "2050 +", ensoIr: "Ver cómo le iría →", cdT2: "Cuida mucho la tierra", cdT1: "Cuida la tierra", cdT0: "La tierra queda igual", cdTm: "Cansa la tierra" });
Object.assign(I18N.en, { verFicha: "📋 Why it appears", compartir: "📲 WhatsApp", cdHoy: "Today's: {n} of 10", cdMas: "S/ {v} more per year", cdMenos: "S/ {v} less per year",
  cdSeg: "Certainty: {n}", cdSegF: "How certain: {n} ({p}).", opCardT: "Would you try it on your farm?", opCSi: "👍 Yes", opCDuda: "🤔 Unsure", opCNo: "👎 No",
  adT: "🧑‍🌾 Before deciding", escPregunta2: "How would it do in…?", escC_todos: "All", escC_nino: "El Niño", escC_seco: "Dry", escC_nina: "La Niña",
  escC_f245: "2050", escC_f585: "2050 +", ensoIr: "See how it would do →", cdT2: "Greatly cares for the soil", cdT1: "Cares for the soil", cdT0: "Soil stays the same", cdTm: "Wears out the soil" });

// quechua (borrador: debe revisarlo una persona hablante) de los textos que el agricultor ve y aún salían en castellano
Object.assign(I18N.qu, {
  relatoSin: "mana tapuyniykiwan", ahMasAv: "{n} willakuykuna astawan", ahMasAv1: "1 willakuy astawan", nNormal: "sapa kuti hina", nReal: "cheqaq",
  gmElija: "Imawantaq pukllayta munanki?", gmJugar: "▶ Pukllay",
  tSueloS: "allpa hawan {a} % · sapikuna {b} %", tSueloS1: "allpa hawan {a} %", tVerdorDown: "{v}-manta urmarqan ({f})",
  tVerdorX: "0,2-manta pisi: yaqa mana yurakuna · 0,2-manta 0,5-kama: pisi q'omer · 0,5-manta astawan: ancha q'omer",
  avDud: "Para manaraq takyachisqa", avDudX: "{d} p'unchaw para ({a}-manta {b}-kama) manaraq takyachisqachu: NASA wakin semanakunamanta allichan (huk p'unchawpi {m} mm-kama qhawachin, kaypiqa mana sapa kutichu). Chaykama Muyuyqa mana chayta llamk'achinchu.",
  gLluviaT: "Kay tarpuypa paran, killa killa", gObs: "Kay tarpuy", gParcial: "kunan killa", gDud: "iskayrayana willakuy", gTip: "Huk sayt'uta llamiy yupayta rikunaykipaq.", gTabla: "Tablata qhaway",
  ahSrc: "NASA willakuykuna <b>{f}</b>-kama, sapa kuti wata hinawan tupachisqa ({r}).",
  umbX: "Qallariy chanikunam. Chakraykimanta yachasqaykiwan utaq técnicoykiwan allichay.", umbLl: "10 p'unchawpi aswan pisi para (mm)", umbHu: "Allpapa aswan pisi chirinkaynin (%)", umbHe: "Qasa willakuy (°C)", umbOk: "Waqaychay", umb0: "↺ Qallariy chanikunaman kutiy",
  antes1: "Semáforo q'omerpi kachkan, utaq allpa huk t'aqlla ukhukama chirin", antes2: "Muyuyniykita akllarqanki (2 kaq) mana ñawpaq tarpuypa ayllunta kutichinkichu", antes3: "Allin akllasqa muhuyki kan", antes4: "Wanuyki utaq guanuyki listo kachkan", antes6: "Kay semanapaq Senamhipa qasa willakuyninta qhawarqanki",
  prCamp: "{n} kaq tarpuypi", prCom: "Imayna",
  cuIntro: "Tarpuypi imakuna pasasqanta qillqay: tarpuy, wanu, qasa, kurukuna.", cuFecha: "P'unchaw", cuTipo: "Imataq pasarqan?", cuValor: "Hayk'a", cuUnidad: "Tupuna", cuNota: "Willakuy",
  cuSin: "Manaraq imapas qillqasqachu.", cuBorrarUno: "Pichay", cu_abono: "💩 Wanu utaq guano", cu_granizo: "🌨️ Chikchi", cuCsv: "⬇ Cuadernota uraqachiy", cuPriv: "Kay celularllapim waqaychakun; mana maymanpas apachikunchu.",
  qAcierto: "Muyuy nisqanman rikch'akurqanchu?", acMas: "🤏 Yaqa yaqalla",
  fuentesAhora: "<b>Kunan chakrayki imayna kachkan</b>: <b>NASA Power</b>-pa qhipa p'unchawninkunata (para, allpa chirinkay, aswan pisi q'oñi) 2001–2025 chawpinwan tupachin, <b>NASA Modis</b>-pa q'omerninwan (ORNL DAAC). NASA mana takyachiy atina parata qhawachiptinqa, iskayrayanapaq churakun, manataq llamk'achikunchu.",
  fase_nino: "El Niño", fase_nina: "La Niña", ensoProb: "{fase} {p} % kananpaq, {a}-manta {b}-kama", ensoFuente: "IRI-Columbia, NOAA, {f}",
  ensoHoy: "Kunan: {fase} watakunapi chunkamanta {n} allin karqan.", ensoHoyN: "Kunan: {fase} watakunapi {n}-manta {k} allin karqan.",
  avEnsoX: "{p} % kananpaq {b}-kama. 2 kaqpi qhaway mayqen muyuy chay watakunata aguantan.", ensoMas: "Willakuymanta astawan",
  tSmap: "Satélite rikusqan chirinkay", tSmapX: "allpapa ñawpaq 5 cm-llanta tupun", smSeco: "ch'aki", smBien: "chirinkaywan",
  semImergX: "Imerg satélite 10 p'unchawpi {v} mm parata tuparqan, allpataq chirinkayta waqaychan.", avImerg: "Satélitewan tupusqa para",
  avImergX: "Imerg satélite qhipa 10 p'unchawpi {v} mm-ta tuparqan (2,4 mm-manta pisi p'unchawkunataqa mana qillqanchu).", hlsBusca: "Puyuyuq mana kaq aswan musuq rikch'ayta maskachkan…",
  fuentesSat: "<b>Cuentayuq mana kaq satélitekuna:</b> allpa chirinkay <b>SMAP L4</b>, para <b>Imerg</b>, rikch'aykuna <b>HLS</b> (Landsat, Sentinel-2, 30 m) NASA GIBS-manta ñawinchakun. El Niño willakuyqa <b>IRI-Columbia, NOAA</b>-manta, ONI qhawasqataq <b>NOAA CPC</b>-manta.",
  asocHint: "Iskay ruru huk wachupi, sara purutuwan hina: purutuqa nitrógenota saqen, hukninpas mana allin kaptinqa, hukninmi qhepan.", asocAqui: "Llaqtaykipi: {c}.", asocNoAltura: "Kay hanaq kaypi mana wiñanchu: {c}.", asocPal: "Masichasqa: iskay ruru kuska huk wachupi",
  cfgS: "Tikraykunaqa kay celularpim waqaychakun.", cfgVer: "👁️ Aswan allinta rikunapaq", cfgLetra: "Qillqa sayaynin", cfgL0: "Sapa kuti hina", cfgL1: "Hatun", cfgL2: "Aswan hatun", cfgL3: "Ancha hatun",
  cfgContraste: "Hatun contraste", cfgContrasteS: "Yana yuraq hawapi: intipi aswan allinta ñawinchakun.", cfgLegible: "Aswan ñawinchana qillqa", cfgLegibleS: "Llamp'u qillqa, simikuna chawpipi aswan ch'usaqwan.",
  cfgVel: "Kunkapa utqaynin", cfgV_lenta: "Pisi pisimanta", cfgV_normal: "Sapa kuti hina", cfgV_rapida: "Utqay", cfgLeer: "Sapa kaqta kicharispa ñawinchay", cfgLeerS: "Ñawinchanamanta aswan uyariyta munaqpaq.",
  cfgRest: "↺ Qallariy allichaykunaman kutiy", cfgPrivBtn: "Pakasqa kay, IA llamk'achiypas", cfgPrivS: "Ima willakuykunatam Muyuy llamk'achin, maymantaq rin, imaynatataq IA llamk'achikun.",
  ph3: "Pisi p'uchqu", ph4: "Mana p'uchqu, mana alcalino", mo2: "Chawpi materia orgánica", cfMo: "Materia orgánica", labMo: "Materia orgánica (%)", labP: "Fósforo (ppm)", labK: "Potasio (ppm)",
  labCe: "Conductividad eléctrica (mS/cm)", labAr: "Aqo (%)", labAc: "Llinki (%)", labFecha: "Análisis p'unchaw", labFuente: "INIA rangokuna (2024). Mana dosisniyuqchu: técnicowan utaq laboratorioykiwan takyachiy.",
  ieD_clima: "Yupayniykikuna, ñawpaq watakuna, satélitekunapas.", ieD_rot: "Ima kan muyuy, ima rurukunataq allpaykita yanapan.", ieD_luna: "Mayqen p'unchawpa killan, chakrapi imakunatam willanku.",
  ieD_confiar: "Sapa tukuy ima niyta munan, mayk'aqtaq yuyayniyki kamachin.", ieD_palabras: "Sapa simi ima niyta munasqanta maskay.", ieD_fuentes: "Imaynatam yupakurqan, maymantataq.",
  ieTab_cifras: "Yupayniykikuna", ieTab_como: "Imaynatam yupakurqan",
  feClima: "NASA Power-pa sapa p'unchaw pachanwan {a}-manta {b}-kama ({n} tarpuy) pruebasqa, {z} m hanaq kayman allichasqa.",
  feRes: "Chunkamanta {r} kuti allin karqan; El Niño watakunapi chunkamanta {ni}; ch'aki watakunapi chunkamanta {s}. Aswan mana allin tarpuy: {p}.",
  lConf: "{c}-pa tablanqa yaqa yaqalla willakuykunawan ruwasqa (pisi takyay): INIAwan utaq agencia agrariawan takyachiy.",
  lPrecio: "Chanikunaqa Midagripa chawpinmi, gastokunataq INEI-manta; manam feriaykipa chaninchu: tapuy kunan hayk'ata pagankuman {c}-manta.",
  lSuelo: "Allpaqa pacha mapamanta hamun: chakraykipa allpa análisisnin aswan allinta rikuchinman.",
  lClima: "Paraqa 50 km celdamanta hamun, hanaq kayman allichasqa; wayq'okunapi, pata patakunapi hukniray kanman. Senamhi estacionkunawan allichanaraqmi.",
  lPlagas: "Muyuyqa llaqtaykipa kurunkunata mana riqsinchu: ayllu kutichiyqa paykunata yanapasqantam yachan.", lNuevo: "Manaraq {c} tarpurqankichu: chakraykipi manaraq yachaynikichu.",
  lAsoc: "{c} llamp'ullata yupakun (iskay ruru huk wachupi): yakumanta, k'anchaymanta atipanakuyqa hukniray kanman.",
  siNota: "Aswan q'oñiwan yurakuna aswan yakuta mañakunku. Chaniqa vendeyllatam tikran, mana gastokunataqa.", thDato: "Willakuy", tAqui: "Llaqtaykipi: {c}.", resSeguro: "Hayk'a takyasqa: {n}. {x}",
  crS: "Allpa rikch'ayninwan Muyuy rikun chakraykipa mayqen partin aswan ñak'arin.", crBtn: "Chakraypa sasachakuyninkunata qhaway", crMedia: "chawpi", crAlta: "ancha",
  anSiT: "🤖 Muyuy kikinmanta tarisqan", anSiS: "Kay celularpi chakraykipa willakuyninkunawan yupasqa.", anSiAnios: "Chakraykipi wata kaykuna", anSiAniosS: "Muyuy {n} tarpuyta huñurqan paraman, yakuman, chiriman hina.",
  kHum: "Para watakuna", kNorm: "Sapa kuti watakuna", kFrio: ", chiripas", anSiGrupo: "{n} tarpuy · chawpi para {p} mm · {e} % El Niño karqan", anSiHoyOp: "Kunan kaq chunkamanta {a} allin · 1 kaq atikuy, chunkamanta {b}",
  anSiNino: "Tupachiy: {n} aswan ch'aki watakunamanta {k}-llam El Niño karqan. El Niñollata qhawayqa mana aypanchu: paywan mana kaq mana allin watakunapas kan.",
  anSiNinoSi: "Tupachiy: {n} aswan ch'aki watakunamanta {k} El Niño karqan. Kaypiqa El Niño ch'aki watakunata allintam willan.",
  anSiArbol: "Ima ruran huk muyuy kaypi allin kananpaq", anSiArbolS: "Muyuy {n} muyuykunata qhawarqan imarayku allin kasqanta yachanapaq, hukkuna {t}-wantaq takyachirqan.",
  anSiMejor: "Aswan allinkuna (chunkamanta {v}): {c}.", anSiPeor: "Aswan mana allinkuna (chunkamanta {v}): {c}.",
  anSiAcierto: "Musuq muyuykunawan, kay kamachiy 100-manta {a} hukniray kayta sut'inchan; huk llamp'u kamachiytaq, {b}. Wakinqa huk imakunamanta.",
  sf_legN: "mana purutuyuq", sf_desc: "samayniyuq", sf_descN: "mana samayniyuq", sf_rep: "ayllunta qatiqllata kutichin", sf_raizN: "mana ukhu sapiyuq", sf_sec: "ch'akita aguantaq rurukunayuq", sf_cob: "allpata p'istuq ruruyuq", sf_tub: "papa hina ruruyuq", sf_tubN: "mana papa hina ruruyuq",
  anSiLluvia: "Mayk'aq paraqa qallarin", anSiLluviaX: "Paraqa {f} kayllapi qallarin.", anSiTarde: " Qhipa 10 watakunapi {d} p'unchaw ñawpaqmanta aswan qhipata qallarirqan.", anSiTemprano: " Qhipa 10 watakunapi {d} p'unchaw ñawpaqmanta aswan temprano qallarirqan.",
  anSiIgual: " Qhipa 10 watakunapi mana anchatachu tikrarqan.", anSiNoClara: " Manaraq sut'i tikraychu.", esComunT: "Llapan atikuykunapaq", esTodos: "sapa ruru",
  qhGPreg: "Muyuyman chakraykimanta willay (munaspaqa)", qhGDirecto: "Utaq chiqanta riy", qhSembro: "Ima tarpurqanki, qarpayniyki kanchu", qhSembroS: "2 tapukuy", qhImporta: "Ima munasqayki, ima hark'asunki",
  qhImportaS: "Yaku, vendey, allpa, uywakuna", qhAfinar: "Allichay: qasa, allpa, chanikuna", qhAfinarS: "Chakraykimanta astawan yachaspaqa", qhOpciones: "Kunanpacha 3 atikuyniyta qhaway",
  irOpciones: "Atikuyniykunata qhaway →", irCuando: "Mayk'aq tarpuna →", irCierre: "Cosechaymanta qhipaman →", pmPruebe: "✏️ Yuyayniyta pruebay", qhMenu: "🧭 Imatataq ruwayta munanki?",
  saltoT: "Llapanmi munaspalla.", saltoB: "Kunanpacha atikuyniykunata qhaway →", afinarT: "🔧 Allichay (munaspalla)", afinarS: "Chakraykimanta astawan yachaspaqa, kaypi churay. Mana yachaspaqa, Muyuy llaqtaykipa sapa kuti kaqninta llamk'achin.",
  nasaLinea: "NASA rikusqan chakrayki", nasaRiesgo: "sasachakuykuna",
  cdHoy: "Kunan kaq: chunkamanta {n}", cdMas: "S/ {v} aswan sapa wata", cdMenos: "S/ {v} pisi sapa wata", cdSeg: "Takyasqa: {n}", cdSegF: "Hayk'a takyasqa: {n} ({p}).",
  opCardT: "Chakraykipi pruebawaqchu?", opCSi: "👍 Arí", opCDuda: "🤔 Iskayrayani", opCNo: "👎 Manam", adT: "🧑‍🌾 Manaraq akllaspa",
  escPregunta2: "Imaynataq kanman…?", escC_todos: "Llapan", escC_nino: "El Niño", escC_seco: "Ch'aki", escC_nina: "La Niña", ensoIr: "Imayna kanman qhaway →",
  pmComparar: "⚖️ Kunan tarpusqaykiwan tupachiy", pmMasAn: "🔍 Astawan qhawariy (técnicopaq)", pmHoy: "📊 Kunan tarpusqayki imaynataq karqan", hlsT: "🛰️ Chakraykita satélitemanta qhaway", ensoOpN: " 1 kaq atikuy: {n}-manta {k}.",
  cdT2: "Allpata ancha qhawan", cdT1: "Allpata qhawan", cdT0: "Allpa kikillan qhepan", cdTm: "Allpata sayk'uchin", compartir: "📲 WhatsApp", verFicha: "📋 Imarayku rikhurin",
});
// lo que se pregunta depende del lugar: sin heladas ni granizo fuera de la sierra
Object.assign(I18N.es, { qhAfinarC: "Afinar: tierra, abono, precios" });
Object.assign(I18N.en, { qhAfinarC: "Fine-tune: soil, manure, prices" });
Object.assign(I18N.qu, { qhAfinarC: "Allichay: allpa, wanu, chanikuna" });
