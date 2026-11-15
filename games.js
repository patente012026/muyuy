// Muyuy · paso 6: tres minijuegos con los datos reales de la chacra (inspirados en los minijuegos de
// "Henry's Farm Adventures", Space Apps 2025): el ayllu de 3 sectores, el duelo de rotaciones y la qocha.
// Usan lo que ya calculó el motor: en qué años funcionó cada rotación y cómo fue cada año según NASA Power
// (El Niño, La Niña o neutro; seco, normal o lluvioso). No inventan datos: la lluvia de la qocha es un juego,
// pero su cantidad sigue la clase del año.
"use strict";

// ---------------------------------------------------------------- piezas comunes
const HUM = (i) => { const h = ((D.clases[i] || {}).humedad || "normal").normalize("NFD").replace(/[̀-ͯ]/g, ""); return h === "seco" ? "seco" : h === "humedo" ? "humedo" : "normal"; };
const ENSO = (i) => (D.clases[i] || {}).enso || "";
function anioTxt(i) {
  const y = D.anios[i], rec = recLabel(y), e = ENSO(i);
  const partes = [`${y}/${String(y + 1).slice(-2)}`, rec ? `★ ${rec.replace(/^\S+\s/, "")}` : e && e !== "Neutro" ? e : "", tr("hum_" + HUM(i))];
  return partes.filter(Boolean).join(" · ");
}
// cielo animado según el año: sol de sequía, lluvia o nubes
function pintarCielo(el, i) {
  const h = HUM(i);
  el.className = "cielo " + (h === "seco" ? "sol" : h === "humedo" ? "lluvia" : "nubes") + (ENSO(i) === "El Niño" ? " nino" : "");
  const gotas = h === "humedo" ? Array.from({ length: 26 }, () => `<i style="left:${Math.random() * 100}%;animation-delay:${(Math.random() * 1.2).toFixed(2)}s;animation-duration:${(0.55 + Math.random() * 0.4).toFixed(2)}s"></i>`).join("") : "";
  el.querySelector(".fx").innerHTML = (h === "seco" ? `<b class="astro"></b>` : `<b class="nube n1"></b><b class="nube n2"></b>`) + gotas;
}
function cieloHtml(id) { return `<div class="cielo nubes" ${id ? `id="${id}"` : ""}><div class="fx"><b class="nube n1"></b><b class="nube n2"></b></div><span class="ano"></span></div>`; }
// lluvia de papel picado al ganar
function confeti(el) {
  if (REDUCED) return;
  const box = document.createElement("div");
  box.className = "confeti";
  const col = ["#2e7d32", "#f9a825", "#e53935", "#1e88e5", "#8e5b9c", "#ff7043"];
  box.innerHTML = Array.from({ length: 46 }, (_, k) => `<i style="left:${Math.random() * 100}%;background:${col[k % col.length]};animation-delay:${(Math.random() * 0.5).toFixed(2)}s;transform:rotate(${Math.random() * 360}deg)"></i>`).join("");
  el.appendChild(box);
  setTimeout(() => box.remove(), 2600);
}
// un objeto que vuela de un elemento a otro (costales de cosecha al marcador)
function volar(desde, hasta, html) {
  if (REDUCED || !desde || !hasta) return;
  const a = desde.getBoundingClientRect(), b = hasta.getBoundingClientRect();
  const v = document.createElement("div");
  v.className = "vuela";
  v.innerHTML = html;
  v.style.left = a.left + a.width / 2 + "px";
  v.style.top = a.top + a.height / 3 + "px";
  document.body.appendChild(v);
  v.animate([{ transform: "translate(-50%,-50%) scale(.6)", opacity: 0 }, { transform: "translate(-50%,-120%) scale(1.25)", opacity: 1, offset: 0.25 },
    { transform: `translate(calc(-50% + ${b.left + b.width / 2 - a.left - a.width / 2}px), calc(-50% + ${b.top + b.height / 2 - a.top - a.height / 3}px)) scale(.5)`, opacity: 0.9 }],
  { duration: 900, easing: "cubic-bezier(.5,0,.3,1)" }).onfinish = () => v.remove();
}
const estrellas = (n) => `<span class="estrellas" aria-label="${n}/3">${[1, 2, 3].map((k) => `<i class="${k <= n ? "on" : ""}" style="--k:${k}">★</i>`).join("")}</span>`;
const icos = (seq) => seq.split("|").map((c) => cico(c, "g-ico")).join("");
const nombres = (seq) => seq.split("|").map(cname).join(" → ");

// ---------------------------------------------------------------- pestañas
let juegoActual = "ayllu";
function verJuego(g) {
  juegoActual = g;
  $("#gMenu").hidden = true; // al elegir un juego se ve solo ese juego y «‹ Todos los juegos» (sin la fila de pestañas)
  $(".arcade-tabs").hidden = true;
  $("#gVolver").hidden = false;
  $$(".arcade-tabs button").forEach((b) => { const on = b.dataset.g === g; b.classList.toggle("on", on); b.setAttribute("aria-selected", String(on)); });
  $$(".g-pane").forEach((p) => (p.hidden = p.id !== "gp-" + g));
  if (g !== "qocha") qochaPausa();
  if (g === "duelo" && !duelo.jugando) dueloInicio();
  if (g === "ayllu") pintarChacras(null);
  if (g === "viaje" && !viaje.jugando) viajeInicio();
  if (g === "nino" && !nino.jugando) ninoInicio();
  if (g === "qocha" && !qocha.jugando) qochaInicio();
}

// ---------------------------------------------------------------- 1. el ayllu: los 3 sectores en la chacra
function pintarChacras(estado) {
  $("#chacras").innerHTML = sectores.map((q, k) => {
    const st = estado ? estado[k] : "";
    return `<div class="chacra ${st}" data-k="${k}"><div class="surcos"></div>
      <div class="planta">${q.split("|").map((c, j) => cico(c, "g-ico " + (j === 0 ? "grande" : ""))).join("")}</div>
      <small>${tr("sector", { n: k + 1 })}</small>${st === "seca" ? `<b class="marca no">✖</b>` : st === "crece" ? `<b class="marca si">✔</b>` : ""}</div>`;
  }).join("");
}
// el jugador avanza año por año: cada año dice qué pasó. La meta es sencilla: que haya comida los 5 años
const ay = { turno: 0, seguir: null };
function ayCancelar() { // al salir del juego o cambiar de lugar
  ay.turno++;
  if (ay.seguir) { ay.seguir(); ay.seguir = null; }
  const b = $("#gJugar"), p = $("#ayAnio");
  if (b) b.disabled = false;
  if (p) p.hidden = true;
}
async function jugarAyllu() {
  const btn = $("#gJugar"), turno = ++ay.turno;
  btn.disabled = true;
  const nWin = D.rotaciones[sectores[0]][F.grilla].length;
  // 5 años reales: al menos uno recordado o malo, para que el juego enseñe
  const malos = [...Array(nWin).keys()].filter((i) => HUM(i) === "seco" || ENSO(i) === "El Niño" || recLabel(D.anios[i]));
  const idx = [];
  if (malos.length) idx.push(malos[Math.floor(Math.random() * malos.length)]);
  while (idx.length < 5) { const i = Math.floor(Math.random() * nWin); if (!idx.includes(i)) idx.push(i); }
  idx.sort((a, b) => a - b);
  const mar = $("#marcador"), log = $("#rondas"), cielo = $("#aCielo"), panel = $("#ayAnio");
  log.innerHTML = "";
  $("#leccion").hidden = true;
  mar.hidden = false;
  let conComida = 0, ronda = 0;
  mar.innerHTML = tr("ayMarcador", { r: 0, k: 0 });
  for (const i of idx) {
    ronda++;
    panel.hidden = true;
    const res = sectores.map((q) => D.rotaciones[q][F.grilla][i] === "1"), buenos = res.filter(Boolean).length;
    pintarCielo(cielo, i);
    const ano = $(".ano", cielo);
    ano.textContent = anioTxt(i);
    ano.classList.remove("entra"); void ano.offsetWidth; ano.classList.add("entra");
    pintarChacras(null);
    if (!REDUCED) await sleep(600);
    for (let k = 0; k < 3; k++) {
      if (turno !== ay.turno) return;
      const ch = $$(".chacra")[k];
      ch.classList.add(res[k] ? "crece" : "seca");
      ch.insertAdjacentHTML("beforeend", res[k] ? `<b class="marca si">✔</b>` : `<b class="marca no">✖</b>`);
      if (res[k]) volar(ch, mar, "🧺");
      if (!REDUCED) await sleep(240);
    }
    if (buenos) conComida++;
    mar.innerHTML = tr("ayMarcador", { r: ronda, k: conComida });
    mar.classList.remove("bump"); void mar.offsetWidth; mar.classList.add("bump");
    log.insertAdjacentHTML("beforeend", `<span class="r-chip ${buenos === 3 ? "ok" : buenos ? "medio" : "bad"}" title="${anioTxt(i)}">${D.anios[i]} ${buenos ? "🍲" : "✖"}</span>`);
    const ultimo = ronda === idx.length;
    panel.className = `ay-anio ${buenos === 3 ? "ok" : buenos ? "medio" : "mal"}`;
    panel.innerHTML = `<p>${tr(buenos === 3 ? "ayTodos" : buenos ? "ayAlgunos" : "ayNinguno", { k: buenos })}</p><button type="button" class="jugar" id="aySig">${tr(ultimo ? "ayVerFin" : "aySig")}</button>`;
    panel.hidden = false;
    panel.scrollIntoView({ block: "nearest", behavior: REDUCED ? "auto" : "smooth" });
    await new Promise((ok) => { ay.seguir = ok; $("#aySig").onclick = ok; });
    ay.seguir = null;
    if (turno !== ay.turno) return;
  }
  panel.hidden = true;
  // la misma prueba sembrando lo mismo en todo: así se ve lo que aporta turnar los cultivos
  const igual = new Set(sectores).size === 1, n = conComida === 5 ? 3 : conComida >= 4 ? 2 : 1;
  const soloUno = idx.filter((i) => D.rotaciones[sectores[0]][F.grilla][i] === "1").length;
  const lec = $("#leccion");
  lec.className = "verdict " + (conComida >= 4 ? "good" : "meh");
  lec.innerHTML = `<div>${estrellas(n)}<b>${tr("ayResultado", { k: conComida })}</b> ${igual ? tr("ayLecIgual") : tr(conComida > soloUno ? "ayLecGana" : "ayLecPar", { d: soloUno })}</div>`;
  lec.hidden = false;
  lec.scrollIntoView({ block: "nearest", behavior: REDUCED ? "auto" : "smooth" });
  if (n === 3) confeti($("#gp-ayllu"));
  btn.disabled = false;
  btn.textContent = tr("ayOtra");
  nudge();
}

// ---------------------------------------------------------------- 2. duelo de rotaciones (con años malos reales)
const duelo = { jugando: false, rondas: [], n: 0, pts: 0, racha: 0, aciertos: 0, timer: null };
function dueloRondas() {
  const act = D.perfil.rotacion_actual && D.rotaciones[D.perfil.rotacion_actual] ? D.perfil.rotacion_actual : null;
  // todas las rotaciones, de la mejor a la peor: en muchas celdas las 40 mejores tienen cosecha todos los años y no
  // había duelo («Con los datos de este lugar no hay años…»); la que gana sale de las mejores y su rival de las que perdieron
  const pool = [...new Set([act, ...ranked().map((x) => x[0]), ...Object.keys(D.rotaciones)])].filter((q) => q && D.rotaciones[q]);
  const nWin = D.rotaciones[pool[0]][F.grilla].length;
  const peso = (i) => (recLabel(D.anios[i]) ? 3 : 0) + (ENSO(i) === "El Niño" ? 2 : 0) + (HUM(i) === "seco" ? 2 : 0) + Math.random() * 2;
  const anios = [...Array(nWin).keys()].sort((a, b) => peso(b) - peso(a));
  const out = [];
  for (const i of anios) {
    const si = pool.filter((q) => D.rotaciones[q][F.grilla][i] === "1"), no = pool.filter((q) => D.rotaciones[q][F.grilla][i] !== "1");
    if (!si.length || !no.length) continue;
    // si se puede, una de las dos es la rotación de hoy: así el duelo habla de su chacra
    const g = act && si.includes(act) ? act : si[Math.floor(Math.random() * Math.min(si.length, 8))];
    const p = act && no.includes(act) && g !== act ? act : no[Math.floor(Math.random() * Math.min(no.length, 8))];
    out.push({ i, g, p, izq: Math.random() < 0.5 });
    if (out.length === 6) break;
  }
  return out.sort(() => Math.random() - 0.5);
}
function dueloInicio() {
  clearInterval(duelo.timer);
  duelo.jugando = false;
  $("#gp-duelo").innerHTML = `<p class="hint">${tr("dIntro")}</p>
    <div class="g-portada">${cieloHtml()}<div class="g-vs"><span>${icos(D.perfil.rotacion_actual && D.rotaciones[D.perfil.rotacion_actual] ? D.perfil.rotacion_actual : ranked()[0][0])}</span><b>VS</b><span>${icos(ranked()[0][0])}</span></div></div>
    <button type="button" class="jugar" id="dEmpezar">${tr("dEmpezar")}</button>`;
  $("#dEmpezar").onclick = dueloJugar;
}
function dueloJugar() {
  duelo.rondas = dueloRondas();
  if (!duelo.rondas.length) { $("#gp-duelo").innerHTML = `<p class="hint">${tr("dSinPares")}</p>`; return; }
  Object.assign(duelo, { jugando: true, n: 0, pts: 0, racha: 0, aciertos: 0 });
  dueloRonda();
}
function dueloRonda() {
  const r = duelo.rondas[duelo.n], T = 12;
  const [a, b] = r.izq ? [r.g, r.p] : [r.p, r.g];
  $("#gp-duelo").innerHTML = `<div class="d-hud"><span>${tr("dRonda", { n: duelo.n + 1, t: duelo.rondas.length })}</span>
      <b class="d-pts">${tr("dPuntos", { p: duelo.pts })}</b>${duelo.racha > 1 ? `<span class="d-racha">${tr("dRacha", { r: duelo.racha })}</span>` : ""}</div>
    ${cieloHtml("dCielo")}
    <div class="d-reloj"><i style="animation-duration:${T}s"></i></div>
    <p class="d-preg">${tr("dPregunta")}</p>
    <div class="d-ops">${[a, b].map((q, k) => `<button type="button" class="d-op" data-q="${q}" style="--k:${k}">
      <span class="d-icos">${icos(q)}</span><span class="d-nom">${nombres(q)}</span>${q === D.perfil.rotacion_actual ? `<small class="d-hoy">${tr("dHoy")}</small>` : ""}<em class="d-res"></em></button>`).join("")}</div>
    <div class="d-expl" aria-live="polite"></div>`;
  const cielo = $("#dCielo");
  pintarCielo(cielo, r.i);
  $(".ano", cielo).textContent = anioTxt(r.i);
  $(".ano", cielo).classList.add("entra");
  const t0 = Date.now();
  $$(".d-op").forEach((bt) => (bt.onclick = () => dueloRevela(bt.dataset.q, Math.max(0, T - (Date.now() - t0) / 1000))));
  clearInterval(duelo.timer);
  duelo.timer = setInterval(() => { if (Date.now() - t0 > T * 1000) dueloRevela(null, 0); }, 200);
}
function dueloRevela(elegida, resta) {
  clearInterval(duelo.timer);
  if ($(".d-ops.listo")) return;
  const r = duelo.rondas[duelo.n], acierto = elegida === r.g;
  $(".d-ops").classList.add("listo");
  $(".d-reloj").classList.add("parado");
  $$(".d-op").forEach((bt) => {
    const gana = bt.dataset.q === r.g;
    bt.disabled = true;
    bt.classList.add(gana ? "gana" : "pierde");
    if (bt.dataset.q === elegida) bt.classList.add("elegida");
    $(".d-res", bt).textContent = gana ? tr("dSi") : tr("dNo");
  });
  let txt;
  if (acierto) {
    const p = 100 + Math.round(resta * 10) + duelo.racha * 20;
    duelo.pts += p; duelo.racha++; duelo.aciertos++;
    txt = `<b class="ok">${tr("dBien", { p })}</b>`;
    volar($(".d-op.gana"), $(".d-pts"), "⭐");
  } else { duelo.racha = 0; txt = `<b class="no">${elegida ? tr("dMal") : tr("dTiempo")}</b>`; }
  $(".d-pts").textContent = tr("dPuntos", { p: duelo.pts });
  $(".d-expl").innerHTML = `${txt} ${tr("dExpl", { a: `${D.anios[r.i]}/${String(D.anios[r.i] + 1).slice(-2)}`, g: nombres(r.g), p: nombres(r.p) })}
    <button type="button" class="jugar d-sig">${duelo.n + 1 < duelo.rondas.length ? tr("dSig") : tr("dVerFin")}</button>`;
  $(".d-sig").onclick = () => { duelo.n++; duelo.n < duelo.rondas.length ? dueloRonda() : dueloFin(); };
  $(".d-sig").focus({ preventScroll: true });
  $(".d-expl").scrollIntoView({ block: "nearest", behavior: REDUCED ? "auto" : "smooth" });
}
function dueloFin() {
  duelo.jugando = false;
  const t = duelo.rondas.length, k = duelo.aciertos, n = k >= t - 1 ? 3 : k >= t / 2 ? 2 : 1;
  $("#gp-duelo").innerHTML = `<div class="g-fin">${estrellas(n)}<p class="g-fin-t">${tr("dFin", { k, t })}</p><p>${tr("dMsg" + n)}</p>
    <p class="d-pts-fin">${tr("dPuntos", { p: duelo.pts })}</p><button type="button" class="jugar" id="dOtra">${tr("dOtra")}</button></div>`;
  $("#dOtra").onclick = dueloJugar;
  if (n === 3) confeti($("#gp-duelo"));
  nudge();
}

// ---------------------------------------------------------------- 3. la qocha: guardar la lluvia de 3 años reales
const qocha = { jugando: false, raf: 0, pausa: false };
const LLUVIA = { seco: 1.1, normal: 2.1, humedo: 3.3 }; // gotas por segundo: sigue la clase del año (NASA Power)
const NECESITA = { seco: 16, normal: 12, humedo: 9 };    // cántaros que necesitan los cultivos en esa campaña
function qochaAnios() {
  const nWin = D.anios.length, por = { seco: [], normal: [], humedo: [] };
  for (let i = 0; i < nWin; i++) por[HUM(i)].push(i);
  const una = (l) => l[Math.floor(Math.random() * l.length)];
  return ["normal", "seco", "humedo"].map((h) => una(por[h].length ? por[h] : [...Array(nWin).keys()]));
}
function qochaInicio() {
  qochaPausa();
  qocha.jugando = false;
  const obs = D.andina ? tr("qObsSierra") : tr("qObsOtro");
  $("#gp-qocha").innerHTML = `<p class="hint">${tr("qIntro", { obs })}</p>
    <div class="q-marco"><canvas id="qCanvas" tabindex="0" aria-label="${tr("qAria")}"></canvas>
      <div class="q-portada"><span class="q-gota">💧</span><button type="button" class="jugar" id="qEmpezar">${tr("qEmpezar")}</button><small>${tr("qNota")}</small></div></div>
    <div class="q-res" id="qRes"></div>`;
  $("#qEmpezar").onclick = qochaJugar;
  qochaDibujarFondo("normal");
}
function qochaPausa() { cancelAnimationFrame(qocha.raf); qocha.raf = 0; }
function qochaTam(cv) {
  const w = cv.parentElement.clientWidth, h = Math.min(340, Math.max(240, w * 0.55)), dpr = window.devicePixelRatio || 1;
  cv.width = w * dpr; cv.height = h * dpr; cv.style.height = h + "px";
  const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}
// paisaje de fondo según la región: cerros y nevado en la sierra, dunas en la costa, árboles en la selva
function paisaje(ctx, w, h, hum) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  const c = hum === "seco" ? ["#ffe9a8", "#fbd27a"] : hum === "humedo" ? ["#9fb3c2", "#c9d6de"] : ["#a9d7f5", "#e3f2fb"];
  g.addColorStop(0, c[0]); g.addColorStop(1, c[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const base = h * 0.78, reg = D.region || (D.andina ? "sierra" : "costa");
  ctx.fillStyle = reg === "selva" ? "#2e7d4f" : reg === "costa" ? "#f0c46a" : "#b4553a";
  ctx.beginPath(); ctx.moveTo(0, base);
  for (let x = 0; x <= w; x += Math.max(8, w / 8)) { // con w = 0 (sala cerrada) el paso nunca avanzaría
    const y = reg === "sierra" ? base - h * (0.18 + 0.16 * Math.abs(Math.sin(x * 0.011 + 1))) : reg === "costa" ? base - h * (0.06 + 0.05 * Math.sin(x * 0.02)) : base - h * 0.1;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
  if (reg === "selva") { ctx.fillStyle = "#1f6b43"; for (let x = 12; x < w; x += 34) { ctx.beginPath(); ctx.arc(x, base - h * 0.1, 18, 0, 7); ctx.fill(); } }
  if (reg === "sierra") { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(w * 0.62, base - h * 0.34); ctx.lineTo(w * 0.68, base - h * 0.42); ctx.lineTo(w * 0.74, base - h * 0.33); ctx.fill(); }
  ctx.fillStyle = "#a8472f"; ctx.fillRect(0, base, w, h - base);
  if (hum === "seco") { ctx.fillStyle = "rgba(255,200,40,.9)"; ctx.beginPath(); ctx.arc(w * 0.85, h * 0.16, 26, 0, 7); ctx.fill(); }
}
function qochaDibujarFondo(hum) {
  const cv = $("#qCanvas"); if (!cv || !cv.parentElement.clientWidth) return;
  const { ctx, w, h } = qochaTam(cv);
  paisaje(ctx, w, h, hum);
}
function qochaJugar() {
  qocha.anios = qochaAnios();
  qocha.res = [];
  qocha.jugando = true;
  $("#qRes").innerHTML = "";
  qochaRonda(0);
}
function qochaRonda(r) {
  const cv = $("#qCanvas"); if (!cv) return;
  $(".q-portada") && $(".q-portada").remove();
  const i = qocha.anios[r], hum = HUM(i), DUR = 15;
  let { ctx, w, h } = qochaTam(cv);
  const S = { x: w / 2, objetivo: w / 2, agua: 0, gotas: [], salpica: [], t0: performance.now(), ult: performance.now(), sacudir: 0, acum: 0, acumObs: 0 };
  const suelo = h * 0.8, qw = Math.max(74, w * 0.16);
  const mover = (cx) => { const b = cv.getBoundingClientRect(); S.objetivo = Math.max(qw / 2, Math.min(w - qw / 2, cx - b.left)); };
  cv.onpointermove = (e) => mover(e.clientX);
  cv.onpointerdown = (e) => { cv.setPointerCapture(e.pointerId); mover(e.clientX); };
  cv.onkeydown = (e) => { if (e.key === "ArrowLeft") { S.objetivo = Math.max(qw / 2, S.objetivo - 40); e.preventDefault(); } if (e.key === "ArrowRight") { S.objetivo = Math.min(w - qw / 2, S.objetivo + 40); e.preventDefault(); } };
  cv.focus({ preventScroll: true });
  const obsEmoji = D.andina ? "🧊" : "🐛";
  // sus cultivos al costado de la qocha: crecen con el agua guardada
  const seq = D.perfil.rotacion_actual && D.rotaciones[D.perfil.rotacion_actual] ? D.perfil.rotacion_actual : ranked()[0][0];
  const plantas = seq.split("|").map((c) => { const im = new Image(); if (typeof CULT_IMG !== "undefined" && CULT_IMG[c]) im.src = CULT_IMG[c]; return im; });
  const nubes = [0, 1, 2].map((k) => ({ x: (k * w) / 3 + Math.random() * 60, y: 22 + k * 16 + Math.random() * 10, s: 0.8 + Math.random() * 0.5, v: 10 + Math.random() * 14 }));
  const paso = (now) => {
    const dt = Math.min(0.05, (now - S.ult) / 1000), t = (now - S.t0) / 1000;
    S.ult = now;
    S.x += (S.objetivo - S.x) * Math.min(1, dt * 14);
    // lluvia: más o menos gotas según el año; obstáculos que hacen perder agua
    S.acum += dt * LLUVIA[hum] * (1 + t / DUR * 0.6);
    while (S.acum >= 1) { S.acum--; S.gotas.push({ x: 20 + Math.random() * (w - 40), y: -10, v: 120 + Math.random() * 90, obs: false }); }
    S.acumObs += dt * 0.32;
    while (S.acumObs >= 1) { S.acumObs--; S.gotas.push({ x: 20 + Math.random() * (w - 40), y: -10, v: 150 + Math.random() * 60, obs: true }); }
    paisaje(ctx, w, h, hum);
    // nubes que avanzan (más oscuras en año lluvioso)
    ctx.fillStyle = hum === "humedo" ? "rgba(236,239,241,.95)" : "rgba(255,255,255,.9)";
    for (const n of nubes) {
      n.x += n.v * dt; if (n.x > w + 80) n.x = -90;
      ctx.beginPath(); ctx.ellipse(n.x, n.y, 44 * n.s, 15 * n.s, 0, 0, 7); ctx.ellipse(n.x - 16 * n.s, n.y - 10 * n.s, 22 * n.s, 18 * n.s, 0, 0, 7); ctx.ellipse(n.x + 14 * n.s, n.y - 8 * n.s, 18 * n.s, 15 * n.s, 0, 0, 7); ctx.fill();
    }
    // cultivos que crecen con el agua
    const crec = Math.min(1, S.agua / NECESITA[hum]);
    plantas.forEach((im, k) => {
      if (!im.complete || !im.naturalWidth) return;
      const t = 26 + 30 * crec, x = k < 2 ? 18 + k * 50 : w - 64;
      ctx.globalAlpha = 0.55 + 0.45 * crec;
      ctx.drawImage(im, x, suelo + 2 - t, t, t);
      ctx.globalAlpha = 1;
    });
    for (const g of S.gotas) {
      g.y += g.v * dt;
      if (!g.fin && g.y > suelo - 16 && g.y < suelo + 6 && Math.abs(g.x - S.x) < qw / 2) {
        g.fin = true;
        if (g.obs) { S.agua = Math.max(0, S.agua - 2); S.sacudir = 0.35; }
        else { S.agua++; for (let k = 0; k < 5; k++) S.salpica.push({ x: g.x, y: suelo - 12, vx: (Math.random() - 0.5) * 120, vy: -80 - Math.random() * 80, t: 0.5 }); }
      }
      if (g.fin) continue;
      if (g.obs) { ctx.font = "28px serif"; ctx.textAlign = "center"; ctx.fillText(obsEmoji, g.x, g.y); }
      else {
        ctx.fillStyle = "#1e88e5"; ctx.beginPath(); ctx.moveTo(g.x, g.y - 15); ctx.quadraticCurveTo(g.x + 10, g.y, g.x, g.y + 8); ctx.quadraticCurveTo(g.x - 10, g.y, g.x, g.y - 15); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.beginPath(); ctx.arc(g.x - 3, g.y - 1, 2.2, 0, 7); ctx.fill();
      }
    }
    S.gotas = S.gotas.filter((g) => !g.fin && g.y < h + 20);
    for (const p of S.salpica) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; ctx.fillStyle = `rgba(30,136,229,${Math.max(0, p.t * 2)})`; ctx.fillRect(p.x, p.y, 3, 3); }
    S.salpica = S.salpica.filter((p) => p.t > 0);
    // la qocha: borde de tierra y el agua que sube
    const sx = S.sacudir > 0 ? (Math.random() - 0.5) * 10 : 0; S.sacudir -= dt;
    const lleno = Math.min(1, S.agua / NECESITA[hum]);
    ctx.fillStyle = "#3e2723"; ctx.beginPath(); ctx.ellipse(S.x + sx, suelo + 3, qw / 2 + 10, 20, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#b4553a"; ctx.beginPath(); ctx.ellipse(S.x + sx, suelo, qw / 2 + 6, 16, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#3a7bd5"; ctx.beginPath(); ctx.ellipse(S.x + sx, suelo + 1, (qw / 2) * (0.35 + 0.65 * lleno), 11 * (0.4 + 0.6 * lleno), 0, 0, 7); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.beginPath(); ctx.ellipse(S.x + sx - qw * 0.12, suelo - 2, qw * 0.12 * (0.4 + lleno), 3, 0, 0, 7); ctx.fill();
    // marcador
    ctx.fillStyle = "rgba(255,255,255,.88)"; ctx.fillRect(10, 10, 180, 46); ctx.fillStyle = "#2b2420"; ctx.font = "700 13px 'Nunito Sans', sans-serif"; ctx.textAlign = "left";
    ctx.fillText(`${tr("qAnio", { n: r + 1, a: `${D.anios[i]}/${String(D.anios[i] + 1).slice(-2)}` })} · ${tr("hum_" + hum)}`, 18, 28);
    ctx.fillStyle = "#cfd8dc"; ctx.fillRect(18, 36, 120, 10); ctx.fillStyle = lleno >= 1 ? "#2e7d32" : "#1e88e5"; ctx.fillRect(18, 36, 120 * lleno, 10);
    ctx.fillStyle = "#2b2420"; ctx.fillText(`${Math.max(0, Math.ceil(DUR - t))} s`, 148, 46);
    if (t < DUR) qocha.raf = requestAnimationFrame(paso);
    else qochaFinRonda(r, i, hum, S.agua);
  };
  qocha.raf = requestAnimationFrame(paso);
}
function qochaFinRonda(r, i, hum, agua) {
  const pct = Math.min(100, Math.round((agua / NECESITA[hum]) * 100));
  qocha.res.push({ i, hum, agua, pct });
  const seq = D.perfil.rotacion_actual && D.rotaciones[D.perfil.rotacion_actual] ? D.perfil.rotacion_actual : ranked()[0][0];
  $("#qRes").insertAdjacentHTML("beforeend", `<div class="q-fila" style="--p:${pct}"><span class="q-plantas">${seq.split("|").map((c) => cico(c, "g-ico")).join("")}</span>
    <span>${tr("qResAnio", { a: anioTxt(i), p: pct })}</span><i class="q-barra"><b></b></i></div>`);
  if (r + 1 < qocha.anios.length) {
    const cv = $("#qCanvas"), { ctx, w, h } = qochaTam(cv);
    paisaje(ctx, w, h, HUM(qocha.anios[r + 1]));
    ctx.fillStyle = "rgba(43,36,32,.72)"; ctx.fillRect(0, h / 2 - 34, w, 68);
    ctx.fillStyle = "#fff"; ctx.font = "800 18px 'Nunito Sans', sans-serif"; ctx.textAlign = "center";
    ctx.fillText(tr("qSigue", { a: anioTxt(qocha.anios[r + 1]) }), w / 2, h / 2 + 6);
    setTimeout(() => qocha.jugando && qochaRonda(r + 1), REDUCED ? 600 : 1800);
    return;
  }
  qocha.jugando = false;
  const prom = Math.round(qocha.res.reduce((s, x) => s + x.pct, 0) / qocha.res.length), n = prom >= 85 ? 3 : prom >= 55 ? 2 : 1;
  const seco = qocha.res.find((x) => x.hum === "seco");
  $("#qRes").insertAdjacentHTML("afterbegin", `<div class="g-fin">${estrellas(n)}<p class="g-fin-t">${tr("qFin", { p: prom })}</p>
    <p>${seco ? tr("qMsgSeco", { a: `${D.anios[seco.i]}/${String(D.anios[seco.i] + 1).slice(-2)}` }) : ""}</p>
    <button type="button" class="jugar" id="qOtra">${tr("qOtra")}</button></div>`);
  $("#qOtra").onclick = qochaJugar;
  if (n === 3) confeti($("#gp-qocha"));
  nudge();
}

// ---------------------------------------------------------------- inicio y cambios de sitio o idioma
function resetJuegos() {
  qochaPausa();
  clearInterval(duelo.timer);
  duelo.jugando = false; qocha.jugando = false;
  if ($("#aCielo")) { $("#aCielo").className = "cielo nubes"; $(".ano", $("#aCielo")).textContent = ""; }
  pintarChacras(null);
  // con la sala cerrada solo se vacían: al abrirla, verJuego vuelve a preparar el juego elegido
  const abierta = $("#juegos") && $("#juegos").open;
  if (abierta && juegoActual === "duelo") dueloInicio(); else $("#gp-duelo").innerHTML = "";
  if (abierta && juegoActual === "qocha") qochaInicio(); else $("#gp-qocha").innerHTML = "";
  if (typeof viaje !== "undefined") { viaje.jugando = false; nino.jugando = false; }
  if (abierta && juegoActual === "viaje") viajeInicio(); else if ($("#gp-viaje")) $("#gp-viaje").innerHTML = "";
  if (abierta && juegoActual === "nino") ninoInicio(); else if ($("#gp-nino")) $("#gp-nino").innerHTML = "";
}
// la sala de juegos: se abre desde la cabecera, desde el paso 4 (duelo) o desde el cierre
function abrirJuegos(g = "menu") {
  const d = $("#juegos");
  if (!d.open) d.showModal();
  if (g === "menu") verMenu(); else verJuego(g);
}

// ---------------------------------------------------------------- carrusel para elegir el juego
// Se desliza con el dedo (scroll-snap); la tarjeta del centro es la elegida y se agranda; tocarla abre el juego.
const JUEGOS = [["ayllu", "🌾", "gTabAyllu", "gTabAylluS"], ["duelo", "⚔️", "gTabDuelo", "gTabDueloS"], ["qocha", "💧", "gTabQocha", "gTabQochaS"],
  ["viaje", "🌍", "gTabViaje", "gTabViajeS"], ["nino", "🌊", "gTabNino", "gTabNinoS"]];
const MENOS_MOV = matchMedia("(prefers-reduced-motion: reduce)").matches;
function verMenu() {
  qochaPausa();
  ayCancelar();
  $(".arcade-tabs").hidden = true;
  $("#gVolver").hidden = true;
  $$(".g-pane").forEach((p) => (p.hidden = true));
  $("#gMenu").hidden = false;
  pintarMenu();
  $("#juegos").scrollTop = 0;
}
function pintarMenu() {
  const m = $("#gMenu"), i0 = Math.max(0, JUEGOS.findIndex((j) => j[0] === juegoActual));
  m.innerHTML = `<p class="gm-q">${tr("gmElija")}</p>
    <div class="gm-car" data-i="${i0}">
      <div class="gm-track">${JUEGOS.map(([g, ic, t, s], i) => `<button type="button" class="gm-card gm-${g}${i === i0 ? " on" : ""}" data-i="${i}" aria-label="${tr(t)}: ${tr(s)}">
        <span class="gm-ico" aria-hidden="true">${ic}</span><span class="gm-txt"><b>${tr(t)}</b><small>${tr(s)}</small><span class="gm-play" aria-hidden="true">${tr("gmJugar")}</span></span></button>`).join("")}</div>
      <button type="button" class="gm-nav prev" aria-label="${tr("gmAnt")}">‹</button>
      <button type="button" class="gm-nav next" aria-label="${tr("gmSig")}">›</button>
    </div>
    <div class="gm-dots" aria-hidden="true">${JUEGOS.map((_, i) => `<i class="${i === i0 ? "on" : ""}"></i>`).join("")}</div>`;
  const car = $(".gm-car", m), track = $(".gm-track", m), cards = $$(".gm-card", m), dots = $$(".gm-dots i", m);
  let cur = i0, raf = 0;
  const centro = (el) => el.offsetLeft + el.offsetWidth / 2;
  const ir = (i, suave = true) => {
    i = Math.max(0, Math.min(cards.length - 1, i));
    track.scrollTo({ left: centro(cards[i]) - track.clientWidth / 2, behavior: suave && !MENOS_MOV ? "smooth" : "auto" });
  };
  const pintar = () => { // cada tarjeta se inclina y achica según su distancia al centro
    raf = 0;
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = cur, bd = Infinity;
    cards.forEach((c, i) => {
      const d = (centro(c) - mid) / (c.offsetWidth || 1), a = Math.min(1, Math.abs(d));
      if (Math.abs(d) < bd) { bd = Math.abs(d); best = i; }
      if (MENOS_MOV) return;
      c.style.transform = `perspective(900px) rotateY(${(-d * 16).toFixed(2)}deg) scale(${(1 - a * 0.12).toFixed(3)})`;
      c.style.opacity = (1 - a * 0.35).toFixed(3);
    });
    if (best !== cur) {
      cards[cur].classList.remove("on"); dots[cur].classList.remove("on");
      cur = best; car.dataset.i = cur;
      cards[cur].classList.add("on"); dots[cur].classList.add("on");
      if (navigator.vibrate) try { navigator.vibrate(6); } catch {}
    }
  };
  track.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(pintar); }, { passive: true });
  // la tarjeta del costado se centra; la del centro abre el juego
  cards.forEach((c, i) => (c.onclick = () => (i === cur ? verJuego(JUEGOS[i][0]) : ir(i))));
  $(".gm-nav.prev", m).onclick = () => ir(cur - 1);
  $(".gm-nav.next", m).onclick = () => ir(cur + 1);
  track.onkeydown = (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); ir(cur - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); ir(cur + 1); }
  };
  const colocar = () => {
    if (!track.clientWidth) return requestAnimationFrame(colocar);
    track.scrollLeft = centro(cards[cur]) - track.clientWidth / 2;
    pintar();
  };
  colocar();
}
function cerrarJuegos() { ayCancelar(); qochaPausa(); clearInterval(duelo.timer); duelo.jugando = false; qocha.jugando = false; $("#juegos").close(); }
function initJuegos() {
  $$("[data-abre]").forEach((b) => (b.onclick = () => abrirJuegos(b.dataset.abre)));
  $("#jCerrar").onclick = cerrarJuegos;
  $("#juegos").addEventListener("cancel", (e) => { e.preventDefault(); cerrarJuegos(); });
  $$(".arcade-tabs button").forEach((b) => (b.onclick = () => verJuego(b.dataset.g)));
  $("#gVolver").onclick = verMenu;
  $("#lang").addEventListener("change", () => setTimeout(() => { if (!$("#gMenu").hidden) pintarMenu(); }, 0));
  $("#gJugar").onclick = jugarAyllu;
  // la qocha se detiene si se sale del paso o se oculta la pestaña
  document.addEventListener("visibilitychange", () => { if (document.hidden) qochaPausa(); });
}
