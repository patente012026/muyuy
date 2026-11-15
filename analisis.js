// Muyuy · analisis.js: incertidumbre, riesgos dentro de la chacra y detección de patrones con SI, en el propio teléfono.
//  1. Rango de cada rotación: no solo «7 de 10», sino entre cuánto podría estar. Junta dos dudas: pocos años (intervalo de
//     Wilson con los años independientes) y el error de los datos de lluvia (el motor repite el cálculo con ±15 % de lluvia).
//  2. Dentro de la chacra: con el relieve cada 90 m alrededor del punto, dónde se lava la tierra (Rusle), dónde se junta
//     el frío (posición en el relieve) y dónde se seca primero (índice topográfico de humedad).
//  3. Patrones con SI, explicables: k-medias agrupa los años por su clima y se compara con el índice de El Niño; un árbol
//     de decisión aprende qué explica que una rotación funcione y se mide con rotaciones que no vio; y el inicio de lluvias
//     de cada campaña con su tendencia.
"use strict";

Object.assign(I18N.es, {
  rgFila: "🎲 Entre cuánto podría estar", rgDe: "{a} a {b} de 10", q_rango: "Muyuy solo tiene unos 45 años de clima y la lluvia del satélite puede fallar. Por eso, además de «7 de 10», da un rango: lo más bajo y lo más alto que podría ser. Para comparar dos rotaciones, Muyuy mira los mismos años y avisa si la diferencia podría ser casualidad.",
  resRango: "Entre cuánto podría estar: hoy {a} y esta opción {b} de cada 10 años.", resCasual: "Entre cuánto podría estar: hoy {a} y esta opción {b} de cada 10 años. Comparadas en los mismos años, la diferencia es pequeña: podría ser casualidad.",
  crT: "🗺️ Riesgos dentro de su chacra", crS: "El clima de la NASA es de toda la zona. Con el relieve cada 90 m, Muyuy mira qué parte de su chacra sufre más.", crBtn: "Ver los riesgos de mi chacra",
  crCarga: "Midiendo el relieve alrededor de su chacra…", crErr: "No se pudo medir el relieve (necesita internet). Intente de nuevo.", crSinMotor: "Para este lugar todavía no hay datos de suelo y clima para calcularlo.",
  crEro: "⛰️ Se lava la tierra", crHel: "❄️ Se junta el frío", crAgua: "💧 Se seca primero", crBaja: "poco", crMedia: "medio", crAlta: "mucho",
  crCap: "Cada cuadro mide unos 90 m. Se muestra una zona de unos 630 m alrededor de su punto. Es una guía: usted conoce mejor su chacra.",
  crEroX: "En {p} % de esta zona se pierde mucha tierra (más de 11 toneladas por hectárea al año, con un cultivo común){d}. Ahí conviene cubrir el suelo, sembrar en curva o hacer terrazas.",
  crEroB: "En esta zona casi no se pierde tierra por la pendiente. Aun así, deje rastrojo en los meses de lluvia.",
  crHelX: "Las partes bajas y hondonadas{d} juntan el aire frío ({p} % de esta zona). Ahí la helada pega primero: siembre allí lo que aguanta más.",
  crHelB: "No hay hondonadas marcadas: la helada caería parejo en esta zona.",
  crAguaX: "Las partes altas y con pendiente{d} se secan primero ({p} % de esta zona). Las partes bajas guardan más agua: ahí van los cultivos que piden más.",
  crPlano: "Esta zona es casi plana: el agua y el frío se reparten parejo.",
  crN: " al norte", crS2: " al sur", crE: " al este", crO: " al oeste",
  anSiT: "🤖 Lo que encontró Muyuy por su cuenta", anSiS: "Se calcula en este teléfono, sin internet, con los datos de su chacra. Ayuda a ver patrones; usted decide.",
  anSiAnios: "Tipos de año en su chacra", anSiAniosS: "El programa agrupó las {n} campañas por lluvia, agua y frío, sin que nadie le diga cuáles son iguales.",
  kSeco: "Años secos", kHum: "Años lluviosos", kNorm: "Años normales", kFrio: " y fríos",
  anSiGrupo: "{n} campañas · lluvia media {p} mm · {e} % eran El Niño", anSiHoyOp: "Lo de hoy funcionó {a} de 10 · la opción 1, {b} de 10",
  anSiNino: "Comparación: de los {n} años más secos, solo {k} fueron El Niño. Mirar solo El Niño no alcanza: también hay años malos sin él.", anSiNinoSi: "Comparación: de los {n} años más secos, {k} fueron El Niño. Aquí El Niño sí avisa bastante bien los años secos.",
  anSiArbol: "Qué hace que una rotación funcione aquí", anSiArbolS: "Muyuy miró {n} rotaciones para aprender qué las hace funcionar aquí. Después se probó con otras {t}.",
  anSiMejor: "Las que mejor funcionan ({v} de 10): {c}.", anSiPeor: "Las que peor funcionan ({v} de 10): {c}.",
  anSiAcierto: "Probada con rotaciones que no había visto, esta regla aclara {a} de cada 100 diferencias entre ellas; una regla sola aclara {b}. El resto depende de otras cosas.", anSiSinRegla: "Aquí no encontró una regla clara: las rotaciones se diferencian por muchas cosas a la vez.", anSiEsperar: "Calculando todas las rotaciones…",
  sf_leg: "lleva una leguminosa", sf_legN: "sin leguminosa", sf_desc: "tiene descanso", sf_descN: "sin descanso", sf_rep: "repite familia seguida", sf_repN: "no repite familia", sf_raiz: "lleva raíz profunda", sf_raizN: "sin raíz profunda",
  sf_sec: "lleva cultivos que aguantan sequía", sf_secN: "sin cultivos que aguantan sequía", sf_cob: "lleva cultivo que cubre el suelo", sf_cobN: "sin cultivo que cubre el suelo", sf_tub: "lleva tubérculo", sf_tubN: "sin tubérculo", sf_cer: "lleva cereal", sf_cerN: "sin cereal",
  anSiLluvia: "Cuándo empiezan las lluvias", anSiLluviaX: "Las lluvias suelen empezar cerca del {f}.", anSiTarde: " En los últimos 10 años empezaron {d} días más tarde que antes.", anSiTemprano: " En los últimos 10 años empezaron {d} días más temprano que antes.", anSiIgual: " En los últimos 10 años no cambió mucho.", anSiClara: " Es un cambio claro.", anSiNoClara: " Todavía no es un cambio claro.",
});
Object.assign(I18N.en, {
  rgFila: "🎲 Likely range", rgDe: "{a} to {b} of 10", q_rango: "Muyuy only has about 45 years of climate and satellite rain can be wrong. So besides «7 of 10» it gives a range: the lowest and highest it could be. To compare two rotations, Muyuy looks at the same years and warns if the difference could be chance.",
  resRango: "Likely range: today {a} and this option {b} of every 10 years.", resCasual: "Likely range: today {a} and this option {b} of every 10 years. Compared over the same years, the difference is small: it could be chance.",
  crT: "🗺️ Risks inside your farm", crS: "NASA climate covers the whole area. With the terrain every 90 m, Muyuy looks at which part of your farm suffers most.", crBtn: "See the risks on my farm",
  crCarga: "Measuring the terrain around your farm…", crErr: "The terrain could not be measured (internet needed). Try again.", crSinMotor: "There is no soil and climate data to calculate this place yet.",
  crEro: "⛰️ Soil washes away", crHel: "❄️ Cold gathers", crAgua: "💧 Dries first", crBaja: "low", crMedia: "medium", crAlta: "high",
  crCap: "Each square is about 90 m. The map shows about 630 m around your point. It is a guide: you know your farm better.",
  crEroX: "On {p} % of this area a lot of soil is lost (over 11 tonnes per hectare a year with a common crop){d}. There it pays to cover the soil, sow along the contour or build terraces.",
  crEroB: "Little soil is lost to slope in this area. Even so, leave crop residue in the rainy months.",
  crHelX: "Low spots and hollows{d} gather cold air ({p} % of this area). Frost hits there first: sow what tolerates it best there.",
  crHelB: "There are no marked hollows: frost would fall evenly in this area.",
  crAguaX: "High, sloping parts{d} dry first ({p} % of this area). Low parts keep more water: put the thirstier crops there.",
  crPlano: "This area is almost flat: water and cold spread evenly.",
  crN: " to the north", crS2: " to the south", crE: " to the east", crO: " to the west",
  anSiT: "🤖 What Muyuy found on its own", anSiS: "Calculated on this phone, without internet, with your farm's data. It helps you see patterns; you decide.",
  anSiAnios: "Types of year on your farm", anSiAniosS: "The program grouped the {n} seasons by rain, water and cold, without being told which ones are alike.",
  kSeco: "Dry years", kHum: "Rainy years", kNorm: "Normal years", kFrio: " and cold",
  anSiGrupo: "{n} seasons · average rain {p} mm · {e} % were El Niño", anSiHoyOp: "Today's rotation worked {a} of 10 · option 1, {b} of 10",
  anSiNino: "Comparison: of the {n} driest years, only {k} were El Niño. Watching El Niño alone is not enough: there are bad years without it.", anSiNinoSi: "Comparison: of the {n} driest years, {k} were El Niño. Here El Niño does warn of dry years quite well.",
  anSiArbol: "What makes a rotation work here", anSiArbolS: "Muyuy looked at {n} rotations to learn what makes them work here. Then it tested itself on {t} others.",
  anSiMejor: "Those that work best ({v} of 10): {c}.", anSiPeor: "Those that work worst ({v} of 10): {c}.",
  anSiAcierto: "Tested on rotations it had not seen, this rule clears up {a} of every 100 differences between them; one single rule clears up {b}. The rest depends on other things.", anSiSinRegla: "No clear rule was found here: rotations differ in many ways at once.", anSiEsperar: "Calculating all the rotations…",
  sf_leg: "has a legume", sf_legN: "no legume", sf_desc: "has fallow", sf_descN: "no fallow", sf_rep: "repeats a family in a row", sf_repN: "does not repeat a family", sf_raiz: "has a deep root", sf_raizN: "no deep root",
  sf_sec: "has drought-tolerant crops", sf_secN: "no drought-tolerant crops", sf_cob: "has a soil-covering crop", sf_cobN: "no soil-covering crop", sf_tub: "has a tuber", sf_tubN: "no tuber", sf_cer: "has a cereal", sf_cerN: "no cereal",
  anSiLluvia: "When the rains start", anSiLluviaX: "The rains usually start around {f}.", anSiTarde: " In the last 10 years they started {d} days later than before.", anSiTemprano: " In the last 10 years they started {d} days earlier than before.", anSiIgual: " In the last 10 years it has not changed much.", anSiClara: " It is a clear change.", anSiNoClara: " It is not a clear change yet.",
});

const ANALISIS = (() => {
  const q$ = (s, r = document) => r.querySelector(s);
  const fmt = (n) => Math.round(n).toLocaleString(typeof LOCALE !== "undefined" ? LOCALE[LANG] : "es-PE");
  const media = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
  const conMotor = () => !!(window.MOTOR && D && MOTOR.tiene(D.sitio));

  // ---------------------------------------------------------------- 1. incertidumbre
  let cacheR = { k: null, v: null };
  function wilson(p, n, z = 1.28) { // intervalo de 80 %
    const den = 1 + (z * z) / n, c = (p + (z * z) / (2 * n)) / den, m = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / den;
    return [c - m, c + m];
  }
  function rangos(est) {
    const seqs = est.map((e) => e.seq), p = D._perfilMotor || D.perfil || {};
    const k = [D.sitio, seqs.join(","), JSON.stringify(p), Object.keys(D.rotaciones).length].join("#");
    if (cacheR.k === k) return cacheR.v;
    const otros = []; // el mismo cálculo con 15 % más y menos lluvia: lo que puede errar el dato de lluvia
    if (conMotor()) for (const l of [-0.15, 0.15]) { try { otros.push(MOTOR.calcular(D.sitio, { ...p, solo: seqs, clima: { lluvia: l, temp: 0 } }, ["es"]).rotaciones); } catch {} }
    const out = {};
    for (const e of est) {
      const rob = e.v[F.rob], g = String(e.v[F.grilla] || ""), n = Math.max(4, Math.round(g.length / 3)); // ventanas de 3 años: se traslapan
      const [a, b] = wilson(rob, n), vals = [a, b, rob, ...otros.map((r) => (r[e.seq] ? r[e.seq][F.rob] : rob))];
      out[e.seq] = { lo: Math.max(0, Math.round(Math.min(...vals) * 10)), hi: Math.min(10, Math.round(Math.max(...vals) * 10)) };
    }
    cacheR = { k, v: out };
    return out;
  }
  const txtRango = (r) => (r.lo === r.hi ? String(r.lo) : `${r.lo}–${r.hi}`);
  function lineaResumen(est, hoy, op) {
    if (!hoy || !op) return null;
    const R = rangos(est), a = R[hoy.seq], b = R[op.seq];
    if (!a || !b) return null;
    const ga = String(hoy.v[F.grilla] || ""), gb = String(op.v[F.grilla] || "");
    let soloA = 0, soloB = 0; // años en que solo funcionó una de las dos
    for (let i = 0; i < Math.min(ga.length, gb.length); i++) { if (ga[i] === "1" && gb[i] !== "1") soloA++; if (gb[i] === "1" && ga[i] !== "1") soloB++; }
    const z = (soloA + soloB) ? Math.abs(soloA - soloB) / 3 / Math.sqrt((soloA + soloB) / 3) : 0; // las ventanas de 3 años se traslapan
    return tr(z < 1.28 ? "resCasual" : "resRango", { a: txtRango(a), b: txtRango(b) });
  }
  function filaRango(box, est) {
    const tb = q$(".es-t tbody", box);
    if (!tb || !tb.rows.length || q$(".rg-fila", tb)) return;
    const R = rangos(est), tr0 = document.createElement("tr");
    tr0.className = "rg-fila";
    tr0.innerHTML = `<th scope="row">${tr("rgFila")} ${FACIL.que("rango")}</th>` + est.map((e) => `<td>${tr("rgDe", { a: R[e.seq].lo, b: R[e.seq].hi })}</td>`).join("");
    tb.rows[0].after(tr0);
  }

  // después del primer dibujo: la fila de «Comparar» y la línea del resumen (el cálculo repite el motor dos veces)
  function pintarRangos(est) {
    const cmp = q$("#estrategias");
    if (cmp) filaRango(cmp, est);
    const mas = q$("#resumen .res-mas"), ul = mas && q$(".res-l", mas), hoy = est.find((e) => e.hoy), op = est.find((e) => !e.hoy), t = lineaResumen(est, hoy, op);
    if (!ul || !t || q$(".res-rango", ul)) return;
    mas.hidden = false;
    const li = document.createElement("li");
    li.className = "res-rango";
    li.innerHTML = `<span class="res-i" aria-hidden="true">🎲</span><span>${t}</span>`;
    ul.appendChild(li);
  }

  // ---------------------------------------------------------------- 2. riesgos dentro de la chacra
  const N = 9, PASO = 90, memo = new Map();
  let crMapa = null, crCapa = null, crTipo = "ero", crDatos = null;
  function puntoChacra() {
    const s = (typeof SITES_LIST !== "undefined" ? SITES_LIST : []).find((x) => x.id === D.sitio) || {};
    if (typeof chosen !== "undefined" && chosen && chosen.site === D.sitio && chosen.lat != null) return [chosen.lat, chosen.lon];
    return D.lat != null ? [D.lat, D.lon] : s.lat != null ? [s.lat, s.lon] : null;
  }
  async function relieveMalla(lat, lon) {
    const k = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    if (memo.has(k)) return memo.get(k);
    const dla = PASO / 111320, dlo = PASO / (111320 * Math.cos((lat * Math.PI) / 180)), h = (N - 1) / 2, la = [], lo = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { la.push((lat + (h - i) * dla).toFixed(6)); lo.push((lon + (j - h) * dlo).toFixed(6)); }
    const r = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${la.join(",")}&longitude=${lo.join(",")}`);
    if (!r.ok) throw new Error("relieve");
    const z = (await r.json()).elevation;
    if (!z || z.length !== N * N) throw new Error("relieve");
    const m = { z, dla, dlo, lat, lon };
    memo.set(k, m);
    return m;
  }
  function analizarMalla(m) {
    const Z = (i, j) => m.z[i * N + j], celdas = [];
    const orden = [...m.z.keys()].sort((a, b) => m.z[b] - m.z[a]), acc = new Array(N * N).fill(1);
    for (const c of orden) { // cada celda le pasa su agua a la vecina más baja (D8)
      const i = Math.floor(c / N), j = c % N;
      let mejor = -1, baja = m.z[c];
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
        const y = i + a, x = j + b;
        if ((a || b) && y >= 0 && x >= 0 && y < N && x < N && Z(y, x) < baja) { baja = Z(y, x); mejor = y * N + x; }
      }
      if (mejor >= 0) acc[mejor] += acc[c];
    }
    const camp = MOTOR.clima(D.sitio).camp, lluvia = media(camp.map((c) => c.p)), sg = MOTOR.suelo(D.sitio).suelo;
    const K = MOTOR._interno.factorK(sg), pf = D.perfil && D.perfil.terrazas ? 0.5 : 1;
    for (let i = 1; i < N - 1; i++) for (let j = 1; j < N - 1; j++) {
      const dzdx = (Z(i - 1, j + 1) + 2 * Z(i, j + 1) + Z(i + 1, j + 1) - Z(i - 1, j - 1) - 2 * Z(i, j - 1) - Z(i + 1, j - 1)) / (8 * PASO);
      const dzdy = (Z(i + 1, j - 1) + 2 * Z(i + 1, j) + Z(i + 1, j + 1) - Z(i - 1, j - 1) - 2 * Z(i - 1, j) - Z(i - 1, j + 1)) / (8 * PASO);
      const tan = Math.hypot(dzdx, dzdy), pend = tan * 100;
      let s = 0, n = 0;
      for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) { const y = i + a, x = j + b; if ((a || b) && y >= 0 && x >= 0 && y < N && x < N) { s += Z(y, x); n++; } }
      celdas.push({ i, j, pend, ero: 0.0483 * Math.max(lluvia, 0) ** 1.61 * K * MOTOR._interno.factorLS(pend) * 0.35 * pf, tpi: Z(i, j) - s / n,
                    twi: Math.log((acc[i * N + j] * PASO) / Math.max(tan, 0.001)) });
    }
    const tp = celdas.map((c) => c.tpi).sort((a, b) => a - b), q1 = tp[Math.floor(tp.length / 4)], q2 = tp[Math.floor(tp.length / 2)];
    const tw = celdas.map((c) => c.twi).sort((a, b) => a - b), t1 = tw[Math.floor(tw.length / 3)], t2 = tw[Math.floor((2 * tw.length) / 3)];
    celdas.forEach((c) => {
      c.ero_c = c.ero > 11 ? 2 : c.ero > 5 ? 1 : 0;
      c.hel_c = c.tpi <= q1 && c.tpi < -2 ? 2 : c.tpi <= q2 && c.tpi < -1 ? 1 : 0;
      c.agua_c = c.twi <= t1 ? 2 : c.twi <= t2 ? 1 : 0;
    });
    const zs = m.z, rango = Math.max(...zs) - Math.min(...zs);
    return { celdas, rango, helada: media(camp.map((c) => c.h0)) >= 0.5 };
  }
  function lado(celdas) {
    if (!celdas.length) return "";
    const h = (N - 1) / 2, di = media(celdas.map((c) => c.i)) - h, dj = media(celdas.map((c) => c.j)) - h;
    if (Math.max(Math.abs(di), Math.abs(dj)) < 0.8) return "";
    return tr(Math.abs(di) >= Math.abs(dj) ? (di < 0 ? "crN" : "crS2") : (dj > 0 ? "crE" : "crO"));
  }
  const COLOR = { ero: ["#2e7d32", "#f9a825", "#c62828"], hel: ["#b3e5fc", "#4fc3f7", "#0d47a1"], agua: ["#1565c0", "#e0c068", "#a0522d"] };
  function conclusion() {
    const { celdas, rango } = crDatos, k = crTipo + "_c";
    const altos = celdas.filter((c) => c[k] === 2), p = Math.round((100 * altos.length) / celdas.length), d = lado(altos);
    if (crTipo === "ero") return altos.length ? tr("crEroX", { p, d }) : tr("crEroB");
    if (rango < 3) return tr("crPlano");
    if (crTipo === "hel") return altos.length ? tr("crHelX", { p, d }) : tr("crHelB");
    return tr("crAguaX", { p, d });
  }
  function pintarCapa() {
    const box = q$("#campoRiesgo");
    if (!crDatos || !box) return;
    q$("#crTxt", box).textContent = conclusion();
    box.querySelectorAll(".cr-t").forEach((b) => b.classList.toggle("on", b.dataset.t === crTipo));
    q$("#crLeg", box).innerHTML = ["crBaja", "crMedia", "crAlta"].map((t, i) => `<span class="lg"><span class="sq" style="background:${COLOR[crTipo][i]}"></span> ${tr(t)}</span>`).join(" ");
    if (!crMapa) return;
    if (crCapa) crCapa.remove();
    const { m } = crDatos, h = (N - 1) / 2;
    crCapa = L.layerGroup(crDatos.celdas.map((c) => {
      const la = m.lat + (h - c.i) * m.dla, lo = m.lon + (c.j - h) * m.dlo;
      return L.rectangle([[la - m.dla / 2, lo - m.dlo / 2], [la + m.dla / 2, lo + m.dlo / 2]], { stroke: false, fillColor: COLOR[crTipo][c[crTipo + "_c"]], fillOpacity: 0.5, interactive: false });
    })).addTo(crMapa);
  }
  async function verCampo() {
    const box = q$("#campoRiesgo"), pt = puntoChacra(), msg = q$("#crMsg", box);
    if (!pt) return;
    if (!conMotor()) { msg.textContent = tr("crSinMotor"); return; }
    if (typeof esperarLeaflet === "function") await esperarLeaflet();
    q$("#crBtn", box).disabled = true;
    msg.textContent = tr("crCarga");
    try {
      const m = await relieveMalla(pt[0], pt[1]);
      crDatos = { ...analizarMalla(m), m };
      msg.textContent = "";
      q$("#crBtn", box).hidden = true;
      q$("#crRes", box).hidden = false;
      q$('.cr-t[data-t="hel"]', box).hidden = !crDatos.helada;
      if (crMapa) { crMapa.remove(); crMapa = null; crCapa = null; }
      if (typeof L !== "undefined" && L.map) {
        crMapa = L.map(q$("#crMap", box), { zoomControl: false, preferCanvas: true, scrollWheelZoom: false, attributionControl: false });
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 18 }).addTo(crMapa);
        const h = 3.5 * m.dla, w = 3.5 * m.dlo;
        crMapa.fitBounds([[m.lat - h, m.lon - w], [m.lat + h, m.lon + w]]);
        L.circleMarker([m.lat, m.lon], { radius: 6, color: "#fff", weight: 2, fillColor: "#d81b60", fillOpacity: 1 }).addTo(crMapa);
      }
      crTipo = "ero";
      pintarCapa();
    } catch { msg.textContent = tr("crErr"); q$("#crBtn", box).disabled = false; }
  }
  function pintarCampo() {
    const box = q$("#campoRiesgo");
    if (!box || !D) return;
    if (crMapa) { crMapa.remove(); crMapa = null; crCapa = null; }
    crDatos = null;
    box.hidden = !puntoChacra() || !!D.fuera_peru;
    box.innerHTML = `<h3 class="ctx-h">${tr("crT")}</h3><p class="hint">${tr("crS")}</p>
      <button type="button" class="btn-sec" id="crBtn">${tr("crBtn")}</button><p class="small" id="crMsg" aria-live="polite"></p>
      <div id="crRes" hidden><div class="cr-tabs">${[["ero", "crEro"], ["hel", "crHel"], ["agua", "crAgua"]].map(([t, k]) => `<button type="button" class="cr-t" data-t="${t}">${tr(k)}</button>`).join("")}</div>
        <div id="crMap" class="cr-map"></div><p class="legend" id="crLeg"></p><p class="cr-txt" id="crTxt"></p><p class="small">${tr("crCap")}</p></div>`;
    q$("#crBtn", box).onclick = verCampo;
    box.querySelectorAll(".cr-t").forEach((b) => (b.onclick = () => { crTipo = b.dataset.t; pintarCapa(); }));
  }

  // ---------------------------------------------------------------- 3. patrones con SI
  // k-medias con inicio fijo (por cuantiles de lluvia): el mismo resultado cada vez
  function kmedias(X, orden, k = 3) {
    const n = X.length, d = X[0].length;
    let cen = [0.15, 0.5, 0.85].slice(0, k).map((q) => [...X[orden[Math.floor(q * (n - 1))]]]), asig = new Array(n).fill(0);
    for (let it = 0; it < 40; it++) {
      let cambio = false;
      X.forEach((x, i) => {
        let m = 0, bd = Infinity;
        cen.forEach((c, g) => { const dist = c.reduce((s, v, t) => s + (v - x[t]) ** 2, 0); if (dist < bd) { bd = dist; m = g; } });
        if (asig[i] !== m) { asig[i] = m; cambio = true; }
      });
      cen = cen.map((c, g) => { const mi = X.filter((_, i) => asig[i] === g); return mi.length ? Array.from({ length: d }, (_, t) => media(mi.map((x) => x[t]))) : c; });
      if (!cambio) break;
    }
    return asig;
  }
  function tiposDeAnio(est) {
    const camp = MOTOR.clima(D.sitio).camp.filter((c) => c.p != null);
    if (camp.length < 12) return null;
    const cols = ["p", "b", "h0", "tn"].filter((k) => new Set(camp.map((c) => c[k])).size > 3);
    const st = cols.map((k) => { const v = camp.map((c) => c[k]), m = media(v), s = Math.sqrt(media(v.map((x) => (x - m) ** 2))) || 1; return [m, s]; });
    const X = camp.map((c) => cols.map((k, t) => (c[k] - st[t][0]) / st[t][1]));
    const orden = camp.map((_, i) => i).sort((a, b) => camp[a].p - camp[b].p), asig = kmedias(X, orden);
    const grupos = [0, 1, 2].map((g) => { const m = camp.filter((_, i) => asig[i] === g); return { m, p: media(m.map((c) => c.p)), tn: media(m.map((c) => c.tn)) }; }).filter((g) => g.m.length).sort((a, b) => a.p - b.p);
    const tnM = media(camp.map((c) => c.tn)), tnS = Math.sqrt(media(camp.map((c) => (c.tn - tnM) ** 2))) || 1;
    const idx = new Map((D.anios || []).map((y, i) => [y, i])), hoy = est.find((e) => e.hoy), op = est.find((e) => !e.hoy);
    const parte = (e, g) => { if (!e) return null; const s = String(e.v[F.grilla] || ""), v = g.m.map((c) => s[idx.get(c.anio)]).filter((x) => x === "0" || x === "1"); return v.length ? Math.round((10 * v.filter((x) => x === "1").length) / v.length) : null; };
    const esNino = (c) => { const i = idx.get(c.anio); return i != null && D.clases && D.clases[i] && D.clases[i].enso === "El Niño"; };
    const out = grupos.map((g, i) => ({ nombre: tr(i === 0 ? "kSeco" : i === grupos.length - 1 ? "kHum" : "kNorm") + ((g.tn - tnM) / tnS < -0.5 ? tr("kFrio") : ""), n: g.m.length, p: Math.round(g.p),
      anios: g.m.map((c) => c.anio).slice(-4).join(", "), nino: Math.round((100 * g.m.filter(esNino).length) / g.m.length), a: parte(hoy, g), b: parte(op, g) }));
    const secos = [...camp].sort((a, b) => a.p - b.p).slice(0, Math.max(5, Math.round(camp.length / 6))), kN = secos.filter(esNino).length;
    return { n: camp.length, grupos: out, secos: secos.length, kN };
  }
  // árbol de decisión (CART de regresión) sobre rasgos de cada rotación, con prueba en rotaciones que no vio
  const RASGOS = ["leg", "desc", "rep", "raiz", "sec", "cob", "tub", "cer"];
  function rasgosDe(seq) {
    const s = seq.split("|"), T = MOTOR.tabla(D.sitio) || {}, r = s.map((c) => CAMPO.rasgos(c)), g = s.map((c) => (T[c] || {}).grupo), f = s.map((c) => (T[c] || {}).familia);
    return [r.some((x) => x.n), r.some((x) => x.desc), f.some((x, i) => i && x === f[i - 1] && x !== "Descanso"), r.some((x) => x.raiz), r.filter((x) => x.seq).length >= 2, r.some((x) => x.cob),
            g.includes("tuberculo") || g.includes("raiz"), g.includes("cereal")].map(Boolean);
  }
  const varianza = (ys) => { const m = media(ys); return ys.reduce((s, y) => s + (y - m) ** 2, 0); };
  function arbol(F_, ys, prof, camino) {
    const nodo = { n: ys.length, v: media(ys), camino };
    if (prof === 0 || ys.length < 30) return nodo;
    let mejor = -1, gan = 1e-9;
    const base = varianza(ys);
    for (let k = 0; k < RASGOS.length; k++) {
      const a = [], b = [];
      F_.forEach((x, i) => (x[k] ? a : b).push(ys[i]));
      if (a.length < 12 || b.length < 12) continue;
      const g = base - varianza(a) - varianza(b);
      if (g > gan) { gan = g; mejor = k; }
    }
    if (mejor < 0) return nodo;
    const si = F_.map((x, i) => i).filter((i) => F_[i][mejor]), no = F_.map((x, i) => i).filter((i) => !F_[i][mejor]);
    nodo.k = mejor;
    nodo.si = arbol(si.map((i) => F_[i]), si.map((i) => ys[i]), prof - 1, [...camino, tr("sf_" + RASGOS[mejor])]);
    nodo.no = arbol(no.map((i) => F_[i]), no.map((i) => ys[i]), prof - 1, [...camino, tr("sf_" + RASGOS[mejor] + "N")]);
    return nodo;
  }
  const predecir = (t, x) => (t.k == null ? t.v : predecir(x[t.k] ? t.si : t.no, x));
  const hojas = (t) => (t.k == null ? [t] : [...hojas(t.si), ...hojas(t.no)]);
  const r2 = (y, p) => { const m = media(y), a = y.reduce((s, v, i) => s + (v - p[i]) ** 2, 0), b = y.reduce((s, v) => s + (v - m) ** 2, 0); return b > 0 ? 1 - a / b : 0; };
  function reglas() {
    const seqs = Object.keys(D.rotaciones);
    if (seqs.length < 120) return null;
    const X = seqs.map(rasgosDe), Y = seqs.map((q) => D.rotaciones[q][F.rob]);
    const tr_ = seqs.map((_, i) => i).filter((i) => i % 5), te = seqs.map((_, i) => i).filter((i) => !(i % 5));
    const t = arbol(tr_.map((i) => X[i]), tr_.map((i) => Y[i]), 3, []), yT = te.map((i) => Y[i]);
    const un = arbol(tr_.map((i) => X[i]), tr_.map((i) => Y[i]), 1, []);
    const a = r2(yT, te.map((i) => predecir(t, X[i]))), b = r2(yT, te.map((i) => predecir(un, X[i])));
    const hs = hojas(t).filter((h) => h.n >= 12 && h.camino.length).sort((p, q) => q.v - p.v);
    return { n: tr_.length, t: te.length, a: Math.max(0, Math.round(a * 100)), b: Math.max(0, Math.round(b * 100)), mejor: hs[0], peor: hs[hs.length - 1] };
  }
  function lluvias() {
    const L_ = MOTOR.inicioLluvias ? MOTOR.inicioLluvias(D.sitio) : null;
    if (!L_ || L_.ok < 0.6 || L_.filas.length < 15) return null;
    const dias = L_.filas.map((f) => f.dia), anios = L_.filas.map((f) => f.anio), m = Math.round(media(dias));
    const f = new Date(Date.UTC(2001, 7, 1) + m * 864e5), fecha = `${f.getUTCDate()} ${MES()[f.getUTCMonth()].toLowerCase()}`;
    const ult = media(dias.slice(-10)), ant = media(dias.slice(0, -10)), d = Math.round(ult - ant), p = CAMPO.mannKendall(dias);
    let t = tr("anSiLluviaX", { f: fecha });
    t += Math.abs(d) < 4 ? tr("anSiIgual") : tr(d > 0 ? "anSiTarde" : "anSiTemprano", { d: Math.abs(d) }) + tr(p < 0.05 ? "anSiClara" : "anSiNoClara");
    return t;
  }
  let cacheSI = { k: null, h: "" };
  function pintarSI() {
    const box = q$("#patrones");
    if (!box || !D || !conMotor() || !window.CAMPO_LISTO) return;
    const est = CAMPO.estrategias(), k = [D.sitio, LANG, Object.keys(D.rotaciones).length, est.map((e) => e.seq).join(",")].join("#");
    if (cacheSI.k !== k) {
      const ta = tiposDeAnio(est), rg = reglas(), ll = lluvias();
      let h = `<div class="si-bloque">${ll ? `<h5>${tr("anSiLluvia")}</h5><p>${ll}</p>` : ""}<details class="ah-more si-mas"><summary>${tr("anSiT")}</summary><p class="hint">${tr("anSiS")}</p>`;
      if (ta) {
        h += `<h5>${tr("anSiAnios")}</h5><p class="small">${tr("anSiAniosS", { n: ta.n })}</p><ul class="si-g">` + ta.grupos.map((g) => `<li><b>${g.nombre}</b> <span class="small">(${g.anios}…)</span><br>${tr("anSiGrupo", { n: g.n, p: fmt(g.p), e: g.nino })}${g.a != null && g.b != null ? `<br>${tr("anSiHoyOp", { a: g.a, b: g.b })}` : ""}</li>`).join("") + "</ul>";
        h += `<p>${tr(ta.kN / ta.secos >= 0.6 ? "anSiNinoSi" : "anSiNino", { n: ta.secos, k: ta.kN })}</p>`;
      }
      if (rg) {
        h += `<h5>${tr("anSiArbol")}</h5><p class="small">${tr("anSiArbolS", { n: fmt(rg.n), t: fmt(rg.t) })}</p>`;
        h += rg.a < 15 || !rg.mejor ? `<p>${tr("anSiSinRegla")}</p>` : `<ul class="si-g"><li>${tr("anSiMejor", { v: Math.round(rg.mejor.v * 10), c: rg.mejor.camino.join(", ") })}</li>${rg.peor && rg.peor !== rg.mejor ? `<li>${tr("anSiPeor", { v: Math.round(rg.peor.v * 10), c: rg.peor.camino.join(", ") })}</li>` : ""}</ul><p class="small">${tr("anSiAcierto", { a: rg.a, b: rg.b })}</p>`;
      } else h += `<p class="small">${tr("anSiEsperar")}</p>`;
      cacheSI = { k, h: h + "</details></div>" };
    }
    const viejo = q$(".si-bloque", box), abierto = viejo && q$(".si-mas", viejo) && q$(".si-mas", viejo).open;
    if (viejo) viejo.remove();
    box.insertAdjacentHTML("beforeend", cacheSI.h);
    if (abierto) q$(".si-bloque .si-mas", box).open = true;
  }
  return { rangos, lineaResumen, filaRango, pintarRangos, pintarCampo, pintarSI, _prueba: { wilson, kmedias, tiposDeAnio, reglas, lluvias, analizarMalla, relieveMalla } };
})();

// textos revisados de la vista del agricultor: cortos, sin repetir lo que ya está a la vista. Van al final porque se cargan después de los demás
Object.assign(I18N.es, {"eIntro": "Responda lo que sepa; si no sabe, toque «Siguiente pregunta». Se guarda solo en este teléfono.", "hoyIntro": "Así le habría ido a lo que ya siembra, con el clima de la NASA.", "hoy42T": "Año por año, desde 1981", "hoyFuenteS": "ℹ️ Es la rotación más común de la región. Para ver la suya, responda <a href=\"#parcela\">las preguntas del paso 1</a>.", "robustS": "con el clima de la NASA desde 1981", "gridS": "Cada cuadro son 3 campañas seguidas: verde funcionó, rojo no.", "hoyMemS": "Están con ★ arriba. Muyuy calcula con la lluvia y el frío de la NASA: no ve ríos desbordados ni plagas. ¿Así le fue?", "hTop": "3 opciones para su chacra", "resHoy": "Hoy siembra {r}: le habría ido bien <b>{n} de cada 10 años</b>.", "resOp": "<b>Opción 1:</b> {r}. Le habría ido bien <b>{n} de cada 10 años</b>.", "resOpMenos": "<b>Opción 1:</b> {r}. Ojo: le habría ido bien <b>{n} de cada 10 años</b>, menos que lo de hoy.", "scS": "Muyuy no ve su chacra como usted. Revise sobre todo:", "scLluvia": "<b>Lluvia en su quebrada o ladera:</b> si usted ve otra cosa, confíe en lo que ve.", "scRiegoSi": "<b>Su agua de riego:</b> cuánta le toca de verdad, también en años secos.", "scNuevo": "<b>Cultivos nuevos:</b> nunca sembró {c} aquí. Pruébelos en un pedazo (paso 5).", "decideTop": "🧑‍🌾 Son posibilidades, no órdenes: usted conoce su chacra y usted decide.", "esS": "El ✓ marca la mejor de cada fila, entre todas las posibilidades.", "esDesliza": "👉 Deslice la tabla.", "esFichaS": "Toque una para ver por qué aparece y qué revisar.", "paS": "Lo que más se repite en 45 años de clima.", "paPreg": "¿Usted lo ha visto?", "caOpRastrojo": "💡 En los meses vacíos llueve poco: deje el rastrojo encima para proteger la tierra y guardar humedad.", "rsAguaS": "Muyuy vuelve a probar las rotaciones con esa agua.", "rsEquipoS": "Muyuy le avisa qué revisar en cada posibilidad.", "rsMercS": "Para comer en casa, vender pesa menos; con un comprador grande, pesa más.", "ensoT": "📡 Próxima campaña", "ensoHoy": "Hoy: funcionó {n} de cada 10 años {fase}.", "ensoHoyN": "Hoy: funcionó {k} de {n} años {fase}.", "ensoOpN": " Opción 1: {k} de {n}.", "ensoVer": "Ver los años {fase}", "avEnsoX": "{p} % de probabilidad hasta {b}. En el paso 4 vea qué rotación aguanta esos años.", "deslizaTop": "👉 Deslice para ver las 3 opciones.", "hz_seco": "👉 Su chacra se está volviendo más seca. En el paso 4 toque «{s}» y prefiera la rotación que aguanta esos años.", "hz_calor": "👉 Su chacra se está calentando. En el paso 4 toque «{f}» y prefiera la rotación que sigue aguantando.", "crS": "El clima de la NASA es de toda la zona. Con el relieve, Muyuy mira qué parte de su chacra sufre más.", "asocHint": "Dos cultivos en el mismo surco, como maíz con frijol: la leguminosa deja nitrógeno y, si uno falla, queda el otro.", "eSig": "Siguiente pregunta →", "eAtr": "← Atrás", "ePreg": "Pregunta {n} de {t}", "rsBaseQ": "🍽️ ¿Hay un cultivo que no quiere dejar?", "rsBaseNo": "No, ninguno", "rsBaseS": "Todas las opciones lo llevarán."});
Object.assign(I18N.en, {"eIntro": "Answer what you know; if not, tap «Next question». It is saved only on this phone.", "hoyIntro": "This is how what you already sow would have done, with NASA's climate.", "hoy42T": "Year by year, since 1981", "hoyFuenteS": "ℹ️ This is the region's most common rotation. To see yours, answer <a href=\"#parcela\">the questions in step 1</a>.", "robustS": "with NASA climate since 1981", "gridS": "Each square is 3 seasons in a row: green worked, red did not.", "hoyMemS": "Marked with ★ above. Muyuy works from NASA rain and cold: it cannot see overflowing rivers or pests. Is that how it went?", "hTop": "3 options for your farm", "resHoy": "Today you sow {r}: it would have done well <b>{n} out of 10 years</b>.", "resOp": "<b>Option 1:</b> {r}. It would have done well <b>{n} out of 10 years</b>.", "resOpMenos": "<b>Option 1:</b> {r}. Careful: it would have done well <b>{n} out of 10 years</b>, fewer than today's.", "scS": "Muyuy does not see your farm as you do. Check above all:", "scLluvia": "<b>Rain in your gully or slope:</b> if you see something else, trust what you see.", "scRiegoSi": "<b>Your irrigation water:</b> how much you really get, also in dry years.", "scNuevo": "<b>New crops:</b> you never sowed {c} here. Try them on a small plot first (step 5).", "decideTop": "🧑‍🌾 These are possibilities, not orders: you know your farm and you decide.", "esS": "The ✓ marks the best in each row, among all the possibilities.", "esDesliza": "👉 Swipe the table.", "esFichaS": "Tap one to see why it appears and what to check.", "paS": "What repeats most in 45 years of climate.", "paPreg": "Have you seen this?", "caOpRastrojo": "💡 It rains little in the empty months: leave the stubble on top to protect the soil and keep moisture.", "rsAguaS": "Muyuy tests the rotations again with that water.", "rsEquipoS": "Muyuy tells you what to check in each possibility.", "rsMercS": "To eat at home, selling counts less; with a large buyer, it counts more.", "ensoT": "📡 Next season", "ensoHoy": "Today: it worked {n} of every 10 {fase} years.", "ensoHoyN": "Today: it worked {k} of {n} {fase} years.", "ensoOpN": " Option 1: {k} of {n}.", "ensoVer": "See the {fase} years", "avEnsoX": "{p}% probability until {b}. In step 4 see which rotation withstands those years.", "deslizaTop": "👉 Swipe to see the 3 options.", "hz_seco": "👉 Your farm is getting drier. In step 4 tap «{s}» and prefer the rotation that withstands those years.", "hz_calor": "👉 Your farm is getting hotter. In step 4 tap «{f}» and prefer the rotation that keeps working.", "crS": "NASA's climate covers the whole area. With the terrain, Muyuy looks at which part of your farm suffers most.", "asocHint": "Two crops in the same furrow, like maize with beans: the legume leaves nitrogen and, if one fails, the other remains.", "eSig": "Next question →", "eAtr": "← Back", "ePreg": "Question {n} of {t}", "rsBaseQ": "🍽️ Is there a crop you do not want to give up?", "rsBaseNo": "No, none", "rsBaseS": "All the options will include it."});
// borrador en quechua para revisar con una persona hablante (docs/quechua_por_revisar.csv)
Object.assign(I18N.qu, {"eSig": "Qatiq tapuy →", "eAtr": "← Qhipaman", "ePreg": "{t}-manta {n} tapuy", "rsBaseQ": "🍽️ ¿Kanchu huk ruru mana saqiyta munasqayki?", "rsBaseNo": "Manan", "rsBaseS": "Llapan akllaykunapi kanqa.", "resBase": "Kay atikuypi {c} mana kanchu. {k} akllaypi kachkan."});
Object.assign(I18N.es, { futExacta: "Calculado con el clima de su chacra y el cambio previsto para su zona.", futCalc: "⏳ Calculando con el clima de 2050…", futSinDatos: "Este lugar todavía no tiene clima de 2050." });
Object.assign(I18N.en, { futExacta: "Calculated with your farm's climate and the change expected for your area.", futCalc: "⏳ Calculating with the 2050 climate…", futSinDatos: "This place does not have a 2050 climate yet." });
