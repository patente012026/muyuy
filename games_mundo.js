// Muyuy · juegos internacionales de la sala de juegos.
// Usan las 12 chacras de ejemplo de otros continentes (scripts/build_mundo_ejemplos.py): la lluvia de cada mes de
// NASA Power, los cultivos que eligió Muyuy por el clima de cada lugar y sus 45 años de rotaciones.
"use strict";

let MAPA_MUNDO = null;
async function datosMundo() {
  const M = await getMundo();
  if (!MAPA_MUNDO) MAPA_MUNDO = await (await fetch("data/mapa_mundo.json")).json();
  return M;
}
const mezclar = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const nomC = (c) => (c.nombres && c.nombres[LANG]) || c.nombre;
const icoM = (cid, c, cls = "g-ico") => (typeof CULT_IMG !== "undefined" && CULT_IMG[cid])
  ? `<img class="cico ${cls}" src="${CULT_IMG[cid]}" alt="" width="64" height="64">` : `<span class="${cls} emo-f">${EMOJI[c.grupo] || "🌱"}</span>`;
const cultivosDe = (s) => Object.entries(s.cultivos).filter(([, c]) => !["descanso", "cobertura", "asociacion"].includes(c.grupo));
const paisDe = (s) => (s.nombre.split(",")[1] || "").replace(/\(.*\)/, "").trim() || s.nombre;
const distMes = (a, b) => Math.min(Math.abs(a - b), 12 - Math.abs(a - b));
// mapa del mundo en puntos: x = longitud + 180, y = 82,5 − latitud
const proy = (lat, lon) => [lon + 180, 82.5 - lat];
function mapaSvg(paradas) {
  const M = MAPA_MUNDO, p = M.paso;
  let d = "";
  M.filas.forEach((f, r) => { for (let k = 0; k < f.length; k++) if (f[k] === "1") d += `M${(k + 0.5) * p} ${(r + 0.5) * p}h0`; });
  const puntos = `<path d="${d}"/>`;
  const pins = paradas.map((s, i) => { const [x, y] = proy(s.lat, s.lon); return `<g class="v-pin" data-i="${i}" transform="translate(${x} ${y})"><circle r="3.2"/><circle class="in" r="1.4"/></g>`; }).join("");
  return `<svg class="v-svg" viewBox="0 0 360 142" role="img" aria-label="${tr("vMapa")}"><g class="v-tierra">${puntos}</g><path class="v-ruta" d=""/>${pins}<text class="v-avion" x="-20" y="-20">✈️</text></svg>`;
}
function volarAvion(svg, de, a, ms = 1400) {
  return new Promise((ok) => {
    const av = svg.querySelector(".v-avion"), ruta = svg.querySelector(".v-ruta");
    const [x0, y0] = de, [x1, y1] = a, cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 18 - Math.abs(x1 - x0) * 0.12;
    ruta.setAttribute("d", `${ruta.getAttribute("d")} M${x0},${y0} Q${cx},${cy} ${x1},${y1}`);
    if (REDUCED) { av.setAttribute("x", x1 - 4); av.setAttribute("y", y1 + 3); ok(); return; }
    const t0 = performance.now();
    const paso = (now) => {
      const t = Math.min(1, (now - t0) / ms), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, u = 1 - e;
      av.setAttribute("x", u * u * x0 + 2 * u * e * cx + e * e * x1 - 4);
      av.setAttribute("y", u * u * y0 + 2 * u * e * cy + e * e * y1 + 3);
      t < 1 ? requestAnimationFrame(paso) : ok();
    };
    requestAnimationFrame(paso);
  });
}

// ---------------------------------------------------------------- 4. vuelta al mundo
const viaje = { jugando: false };
async function viajeInicio() {
  viaje.jugando = false;
  const pane = $("#gp-viaje");
  pane.innerHTML = `<p class="hint">${tr("vCargando")}</p>`;
  let M;
  try { M = await datosMundo(); } catch { pane.innerHTML = `<p class="hint">${tr("vSinDatos")}</p>`; return; }
  pane.innerHTML = `<img class="g-banner" src="img/mundo.webp" alt="" width="760" height="428"><p class="hint">${tr("vIntro")}</p>
    <button type="button" class="jugar" id="vEmpezar">${tr("vEmpezar")}</button>`;
  $("#vEmpezar").onclick = viajeJugar;
}
async function viajeJugar() {
  const M = await datosMundo();
  const paradas = mezclar(Object.values(M)).slice(0, 5).sort((a, b) => a.lon - b.lon);
  Object.assign(viaje, { jugando: true, paradas, n: 0, pts: 0 });
  $("#gp-viaje").innerHTML = `<div class="d-hud"><span id="vParada"></span><b class="d-pts" id="vPts">${tr("dPuntos", { p: 0 })}</b></div>
    <div class="v-mapa">${mapaSvg(paradas)}</div>
    <div class="v-pasaporte">${paradas.map((s, i) => `<span class="v-sello vacio" data-i="${i}">${esc(paisDe(s))}</span>`).join("")}</div>
    <div class="v-panel" id="vPanel" aria-live="polite"></div>`;
  const av = $("#gp-viaje .v-avion"), [x, y] = proy(-12, -77); // sale de Lima
  av.setAttribute("x", x - 4); av.setAttribute("y", y + 3);
  viajeParada();
}
async function viajeParada() {
  const s = viaje.paradas[viaje.n], svg = $("#gp-viaje .v-svg");
  $("#vParada").textContent = tr("vParada", { n: viaje.n + 1, t: viaje.paradas.length });
  $("#vPanel").innerHTML = `<p class="v-vuela">✈️ ${tr("vVolando", { l: esc(s.nombre) })}</p>`;
  const prev = viaje.n ? viaje.paradas[viaje.n - 1] : { lat: -12, lon: -77 };
  await volarAvion(svg, proy(prev.lat, prev.lon), proy(s.lat, s.lon));
  $$(".v-pin", svg).forEach((p) => p.classList.toggle("on", +p.dataset.i === viaje.n));
  viajeMes(s);
}
// pregunta 1: ¿en qué mes sembraría? (respuesta: el mes en que Muyuy siembra la mayoría de los cultivos de ese lugar)
function viajeMes(s) {
  const P = s.clima_mes.P, max = Math.max(...P), meses = MES(), cuenta = {};
  cultivosDe(s).forEach(([, c]) => (cuenta[c.siembra] = (cuenta[c.siembra] || 0) + 1));
  const bueno = +Object.entries(cuenta).sort((a, b) => b[1] - a[1])[0][0];
  $("#vPanel").innerHTML = `<h3 class="v-lugar">📍 ${esc(s.nombre)} <small>${num(s.contexto.altura)} m</small></h3>
    <p class="d-preg">${tr("vPregMes")}</p>
    <div class="v-barras">${P.map((p, k) => `<button type="button" class="v-barra" data-m="${k + 1}" style="--h:${Math.max(4, (p / max) * 100)}%" aria-label="${meses[k]}: ${p} mm">
      <i></i><small>${meses[k].slice(0, 3)}</small></button>`).join("")}</div>
    <p class="v-nota">${tr("vNotaLluvia", { t: num(P.reduce((a, b) => a + b, 0)) })}</p><div class="d-expl" id="vExpl"></div>`;
  $$(".v-barra").forEach((b) => (b.onclick = () => {
    const ok = distMes(+b.dataset.m, bueno) <= 1;
    $$(".v-barra").forEach((x) => { x.disabled = true; x.classList.toggle("bien", distMes(+x.dataset.m, bueno) <= 1); });
    b.classList.add(ok ? "elegida-ok" : "elegida-mal");
    const sembrados = cultivosDe(s).filter(([, c]) => c.siembra === bueno).map(([, c]) => nomC(c).toLowerCase()).slice(0, 3).join(", ");
    if (ok) { viaje.pts += 100; volar(b, $("#vPts"), "⭐"); }
    $("#vPts").textContent = tr("dPuntos", { p: viaje.pts });
    viaje.okMes = ok;
    $("#vExpl").innerHTML = `<b class="${ok ? "ok" : "no"}">${ok ? tr("vBien") : tr("vCasi")}</b> ${tr("vMesExpl", { m: meses[bueno - 1], c: sembrados })}
      <button type="button" class="jugar" id="vSig">${tr("vPreg2")}</button>`;
    $("#vSig").onclick = () => viajeCultivo(s);
    $("#vExpl").scrollIntoView({ block: "nearest", behavior: REDUCED ? "auto" : "smooth" });
  }));
}
// pregunta 2: ¿qué cultivo se da aquí? (uno que Muyuy eligió por el clima y dos que no entraron en ese lugar)
function viajeCultivo(s) {
  const aqui = cultivosDe(s), ids = new Set(Object.keys(s.cultivos));
  const [cid, c] = aqui[Math.floor(Math.random() * aqui.length)];
  const otros = {};
  Object.values(MUNDO).forEach((o) => cultivosDe(o).forEach(([k, v]) => { if (!ids.has(k)) otros[k] = v; }));
  const ops = mezclar([[cid, c, true], ...mezclar(Object.entries(otros)).slice(0, 2).map(([k, v]) => [k, v, false])]);
  $("#vPanel").innerHTML = `<h3 class="v-lugar">📍 ${esc(s.nombre)}</h3><p class="d-preg">${tr("vPregCultivo")}</p>
    <div class="d-ops v-ops">${ops.map(([k, v, ok], i) => `<button type="button" class="d-op" data-ok="${ok}" style="--k:${i}">${icoM(k, v, "g-ico v-ico")}<span class="d-nom">${esc(nomC(v))}</span><em class="d-res"></em></button>`).join("")}</div>
    <div class="d-expl" id="vExpl"></div>`;
  $$("#vPanel .d-op").forEach((b) => (b.onclick = () => {
    const ok = b.dataset.ok === "true";
    $$("#vPanel .d-op").forEach((x) => { x.disabled = true; const g = x.dataset.ok === "true"; x.classList.add(g ? "gana" : "pierde"); $(".d-res", x).textContent = g ? tr("vSiDa") : tr("vNoDa"); });
    b.classList.add("elegida");
    if (ok) { viaje.pts += 100; volar(b, $("#vPts"), "⭐"); }
    $("#vPts").textContent = tr("dPuntos", { p: viaje.pts });
    const nota = (viaje.okMes ? 1 : 0) + (ok ? 1 : 0), sello = $(`.v-sello[data-i="${viaje.n}"]`);
    sello.classList.remove("vacio");
    sello.classList.add(nota === 2 ? "oro" : nota === 1 ? "plata" : "visto");
    $("#vExpl").innerHTML = `<b class="${ok ? "ok" : "no"}">${ok ? tr("vBien") : tr("vCasi")}</b> ${tr("vCultExpl", { c: esc(nomC(c)), m: MES()[c.siembra - 1] })}
      <button type="button" class="jugar" id="vSig">${viaje.n + 1 < viaje.paradas.length ? tr("vSigParada") : tr("dVerFin")}</button>`;
    $("#vSig").onclick = () => { viaje.n++; viaje.n < viaje.paradas.length ? viajeParada() : viajeFin(); };
    $("#vExpl").scrollIntoView({ block: "nearest", behavior: REDUCED ? "auto" : "smooth" });
  }));
}
function viajeFin() {
  viaje.jugando = false;
  const max = viaje.paradas.length * 200, n = viaje.pts >= max * 0.8 ? 3 : viaje.pts >= max * 0.5 ? 2 : 1;
  $("#vPanel").innerHTML = `<div class="g-fin">${estrellas(n)}<p class="g-fin-t">${tr("vFin", { p: viaje.pts, max })}</p><p>${tr("vMsg")}</p>
    <button type="button" class="jugar" id="vOtra">${tr("dOtra")}</button></div>`;
  $("#vOtra").onclick = viajeJugar;
  if (n === 3) confeti($("#gp-viaje"));
  nudge();
}

// ---------------------------------------------------------------- 5. El Niño en el mundo
// Pregunta con datos, no con el modelo: cuánto más o menos llueve en la temporada de lluvias de los años El Niño
// en cada lugar (NASA Power 1981-2026 y el índice ONI de NOAA para esos mismos meses).
const nino = { jugando: false };
async function ninoInicio() {
  nino.jugando = false;
  const pane = $("#gp-nino");
  pane.innerHTML = `<p class="hint">${tr("vCargando")}</p>`;
  try { await datosMundo(); } catch { pane.innerHTML = `<p class="hint">${tr("vSinDatos")}</p>`; return; }
  pane.innerHTML = `<p class="hint">${tr("nIntro")}</p><div class="g-portada">${cieloHtml("nCielo")}</div>
    <button type="button" class="jugar" id="nEmpezar">${tr("nEmpezar")}</button>`;
  const ci = $("#nCielo");
  ci.className = "cielo lluvia nino";
  $(".fx", ci).innerHTML = `<b class="nube n1"></b><b class="nube n2"></b>` +
    Array.from({ length: 22 }, () => `<i style="left:${Math.random() * 100}%;animation-delay:${(Math.random() * 1.2).toFixed(2)}s"></i>`).join("");
  $(".ano", ci).textContent = "1997/98 · El Niño";
  $("#nEmpezar").onclick = ninoJugar;
}
async function ninoJugar() {
  const M = await datosMundo();
  const lugares = [...Object.values(M).map((s) => ({ s, peru: false })), ...(MAPA_MUNDO.peru || []).map((s) => ({ s, peru: true }))]
    .filter((x) => x.s.enso_lluvia).map((x) => ({ ...x, v: x.s.enso_lluvia.nino }));
  const pares = [];
  for (const a of mezclar(lugares)) {
    const b = mezclar(lugares).find((o) => o !== a && Math.abs(o.v - a.v) >= 10 && !pares.some((q) => q.includes(a) && q.includes(o)));
    if (b) pares.push([a, b, Math.random() < 0.5 ? "menos" : "mas"]);
    if (pares.length >= 6) break;
  }
  // una ronda siempre compara un lugar del Perú con otro continente
  const pe = lugares.filter((x) => x.peru), mu = mezclar(lugares.filter((x) => !x.peru));
  const a = pe[Math.floor(Math.random() * pe.length)], b = a && mu.find((o) => Math.abs(o.v - a.v) >= 10);
  if (a && b) pares[0] = [a, b, "menos"];
  if (!pares.length) { $("#gp-nino").innerHTML = `<p class="hint">${tr("vSinDatos")}</p>`; return; }
  Object.assign(nino, { jugando: true, pares: mezclar(pares).slice(0, 6), n: 0, pts: 0, k: 0, racha: 0 });
  ninoRonda();
}
const pct = (v) => `${v > 0 ? "+" : ""}${v} %`;
// mapa con los dos lugares de la ronda: A (ámbar) y B (turquesa); al responder se pintan de café (más seco) o azul (más lluvia)
function ninoMapa(xs) {
  return `<div class="v-mapa n-mapa">${mapaSvg(xs.map((x) => x.s)).replace(/<g class="v-pin" data-i="(\d)"/g, (m, i) => `<g class="v-pin n-${"ab"[i]}" data-i="${i}"`)
    .replace(/<\/g><path class="v-ruta"/, `</g><path class="v-ruta"`)}</div>`;
}
const ninoHud = () => `<div class="d-hud"><span>${tr("nRonda", { n: nino.n + 1, t: nino.pares.length })}</span><b class="d-pts" id="nPts">${tr("dPuntos", { p: nino.pts })}</b>${nino.racha > 1 ? `<span class="d-racha">${tr("dRacha", { r: nino.racha })}</span>` : ""}</div>`;
// pluviómetro: la barra sube (más lluvia) o baja (menos lluvia) desde la línea de lo normal
const medidor = (v) => `<span class="n-medidor ${v < 0 ? "seco" : "humedo"}" style="--v:${Math.min(50, Math.abs(v)) * 2}%"><i></i><b class="n-normal"></b></span>`;
const cieloDe = (v) => (v <= -10 ? "☀️🌵" : v < 0 ? "🌤️" : v < 10 ? "🌦️" : "🌧️🌧️");
function ninoSig() {
  const b = $("#nSig");
  b.onclick = () => { nino.n++; nino.n < nino.pares.length ? ninoRonda() : ninoFin(); };
  $("#nExpl").scrollIntoView({ block: "nearest", behavior: REDUCED ? "auto" : "smooth" });
}
function ninoRonda() {
  if (nino.n % 3 === 2) return ninoAdivina(nino.pares[nino.n][0]); // cada 3 rondas: ¿cuánto cambia la lluvia?
  const [a, b, preg] = nino.pares[nino.n], meses = MES();
  const temporada = (s) => { const m = s.enso_lluvia.meses; return `${meses[m[0] - 1].slice(0, 3)}–${meses[m[m.length - 1] - 1].slice(0, 3)}`; };
  $("#gp-nino").innerHTML = `${ninoHud()}${ninoMapa([a, b])}
    <p class="d-preg">${tr(preg === "menos" ? "nPregMenos" : "nPregMas")}</p>
    <div class="d-ops">${[a, b].map((x, i) => `<button type="button" class="d-op n-op" data-i="${i}" style="--k:${i}">
      <span class="n-letra n-${"ab"[i]}">${"AB"[i]}</span><span class="n-globo">${x.peru ? "🏔️" : "🌍"}</span><span class="n-lugar">${esc(x.s.nombre)}</span>
      <small class="n-temp">${tr("nTemporada", { m: temporada(x.s) })}</small><em class="d-res"></em></button>`).join("")}</div>
    <div class="d-expl" id="nExpl"></div>`;
  $$("#gp-nino .d-op").forEach((bt) => (bt.onclick = () => {
    const gana = preg === "menos" ? (a.v <= b.v ? 0 : 1) : (a.v >= b.v ? 0 : 1), ok = +bt.dataset.i === gana;
    $$("#gp-nino .d-op").forEach((x, k) => {
      x.disabled = true;
      const it = [a, b][k];
      x.classList.add(k === gana ? "gana" : "pierde");
      $(".d-res", x).innerHTML = `<span class="n-cielo" aria-hidden="true">${cieloDe(it.v)}</span>${medidor(it.v)}
        <span class="n-pct ${it.v < 0 ? "seco" : "humedo"}">${pct(it.v)}</span> ${tr("nLluvia")}`;
      const pin = $(`#gp-nino .v-pin[data-i="${k}"]`);
      if (pin) pin.classList.add(it.v < 0 ? "seco" : "humedo");
    });
    requestAnimationFrame(() => $$("#gp-nino .n-medidor").forEach((m) => m.classList.add("lleno"))); // la barra crece
    bt.classList.add("elegida");
    if (ok) { nino.pts += 100 + nino.racha * 20; nino.k++; nino.racha++; volar(bt, $("#nPts"), "⭐"); } else nino.racha = 0;
    $("#nPts").textContent = tr("dPuntos", { p: nino.pts });
    $("#nExpl").innerHTML = `<b class="${ok ? "ok" : "no"}">${ok ? tr("vBien") : tr("vCasi")}</b> ${tr("nExpl")}
      <button type="button" class="jugar" id="nSig">${nino.n + 1 < nino.pares.length ? tr("nSig") : tr("dVerFin")}</button>`;
    ninoSig();
  }));
}
// ronda «¿cuánto cambia?»: se mueve la barra para adivinar cuánto más o menos llueve en años El Niño
function ninoAdivina(x) {
  $("#gp-nino").innerHTML = `${ninoHud()}${ninoMapa([x])}
    <p class="d-preg">${tr("nPregCuanto", { l: esc(x.s.nombre) })}</p>
    <div class="n-adiv">
      <div class="n-cielo-grande" id="nCieloG" aria-hidden="true">🌦️</div>
      <input type="range" id="nRango" min="-50" max="50" step="5" value="0" aria-label="${esc(tr("nPregCuanto", { l: x.s.nombre }))}">
      <div class="n-escala"><span>${tr("nMenos")}</span><span>${tr("nNormal")}</span><span>${tr("nMas")}</span></div>
      <output class="n-val" id="nVal">0 %</output>
    </div>
    <button type="button" class="jugar" id="nListo">${tr("nListo")}</button>
    <div class="d-expl" id="nExpl"></div>`;
  const r = $("#nRango"), out = $("#nVal"), cielo = $("#nCieloG");
  const pinta = () => { const v = +r.value; out.textContent = pct(v); out.className = `n-val ${v < 0 ? "seco" : v > 0 ? "humedo" : ""}`; cielo.textContent = cieloDe(v);
    r.style.setProperty("--p", `${(v + 50)}%`); };
  r.oninput = pinta; pinta();
  $("#nListo").onclick = () => {
    const v = +r.value, real = x.v, d = Math.abs(v - real), p = Math.max(0, 100 - d * 3), cerca = d <= 10;
    r.disabled = true; $("#nListo").remove();
    $(".n-adiv").insertAdjacentHTML("beforeend", `<span class="n-real" style="--x:${Math.max(0, Math.min(100, real + 50))}%">▲ ${tr("nReal")}: ${pct(real)}</span>`);
    cielo.textContent = cieloDe(real);
    const pin = $("#gp-nino .v-pin"); if (pin) pin.classList.add(real < 0 ? "seco" : "humedo");
    nino.pts += p; if (cerca) { nino.k++; nino.racha++; volar(out, $("#nPts"), "⭐"); } else nino.racha = 0;
    $("#nPts").textContent = tr("dPuntos", { p: nino.pts });
    $("#nExpl").innerHTML = `<b class="${cerca ? "ok" : "no"}">${cerca ? tr("nAdivBien", { p }) : tr("nAdivLejos", { d, p })}</b> ${tr("nExpl")}
      <button type="button" class="jugar" id="nSig">${nino.n + 1 < nino.pares.length ? tr("nSig") : tr("dVerFin")}</button>`;
    ninoSig();
  };
}
function ninoFin() {
  nino.jugando = false;
  const t = nino.pares.length, n = nino.k >= t - 1 ? 3 : nino.k >= t / 2 ? 2 : 1;
  $("#gp-nino").innerHTML = `<div class="g-fin">${estrellas(n)}<p class="g-fin-t">${tr("dFin", { k: nino.k, t })}</p><p>${tr("nMsg")}</p>
    <button type="button" class="jugar" id="nOtra">${tr("dOtra")}</button></div>`;
  $("#nOtra").onclick = ninoJugar;
  if (n === 3) confeti($("#gp-nino"));
  nudge();
}
