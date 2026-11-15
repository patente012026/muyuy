// Muyuy · chat.js: «Pregúntele a Muyuy», un chat que se abre con el botón 💬 desde cualquier pantalla o ventana.
//  - Con internet pregunta a la Edge Function «muyuy-chat» (supabase/functions/muyuy-chat): prueba modelos gratuitos
//    en orden (Groq y Z.ai) y, si uno agota su cuota, pasa al siguiente.
//  - Sin internet, sin servidor configurado o si ningún modelo responde, contesta con lo que Muyuy ya sabe de la
//    chacra (resumen del paso 4, clima, semáforo, El Niño, Información extra…), buscando las palabras de la pregunta.
//  - Al modelo solo se manda la pregunta, las últimas del chat y un resumen de la chacra; nunca el nombre ni datos personales.
"use strict";

// dirección de la función publicada (vacía: el chat solo responde con lo que Muyuy ya sabe)
const CHAT_URL = window.MUYUY_CHAT_URL || "https://avmwunuxfzutgluwodrx.supabase.co/functions/v1/muyuy-chat";

Object.assign(I18N.es, {
  chT: "💬 Pregúntele a Muyuy", chAbrir: "Abrir el chat de Muyuy", chCerrar: "Cerrar el chat",
  chHola: "¡Hola! Soy Muyuy. Pregúnteme sobre su chacra: qué le conviene sembrar, El Niño, la helada o qué quiere decir una palabra. Usted decide; yo le muestro lo que dicen los datos.",
  chPh: "Escriba su pregunta…", chEnviar: "Enviar", chPensando: "Muyuy está pensando…", chBorrar: "🗑️ Borrar esta conversación",
  chLocal: "📴 Sin internet: le respondo con lo que Muyuy ya sabe de su chacra",
  chNotaLocal: "Respuesta sin IA, con los datos de Muyuy.", chNada: "No encontré eso en Muyuy. Pruebe con otras palabras, o pregunte por: qué sembrar, El Niño, la helada, el riego o una palabra que no entienda.",
  chLimite: "Hoy se hicieron muchas preguntas. Le respondo con lo que Muyuy ya sabe.",
  chS1: "¿Qué me conviene sembrar?", chS2: "¿Qué pasa si viene El Niño?", chS3: "¿Ya puedo sembrar?", chS4: "¿Qué es rotar?",
  chHoy: "Con lo que usted marcó en Muyuy:", chNino: "Sobre El Niño en su chacra:", chAhora: "Cómo está su chacra ahora:", chClima: "Su clima desde 1981:",
  chJuegos: "En 🎮 Juegos hay 5 juegos con el clima de la NASA para su chacra: el ayllu, el duelo, la qocha, vuelta al mundo y El Niño en el mundo. No cambian su plan.",
  chSaludo: "¡Hola! ¿En qué le ayudo? Puede preguntarme qué le conviene sembrar, qué pasa con El Niño o la helada, o qué quiere decir una palabra.",
  chEscuchar: "🔊 Escuchar", chComp: "En «Comparar» (paso 4) —",
  chMetodo: "Así se calculó:", chFilas: "Recomendada · actual:",
  chHolaT: "¡Hola! Pregúnteme por las gráficas, los términos o cómo se calculó. Usted decide; yo le explico los datos.",
  chTs1: "¿Qué es el NDVI?", chTs2: "¿Qué es el déficit de agua?", chTs3: "¿Por qué esta rotación?", chTs4: "¿Cómo se calculó?",
});
Object.assign(I18N.en, {
  chT: "💬 Ask Muyuy", chAbrir: "Open the Muyuy chat", chCerrar: "Close the chat",
  chHola: "Hello! I am Muyuy. Ask me about your farm: what to sow, El Niño, frost or what a word means. You decide; I show you what the data say.",
  chPh: "Type your question…", chEnviar: "Send", chPensando: "Muyuy is thinking…", chBorrar: "🗑️ Delete this conversation",
  chLocal: "📴 No internet: I answer with what Muyuy already knows about your farm",
  chNotaLocal: "Answer without AI, from Muyuy's data.", chNada: "I could not find that in Muyuy. Try other words, or ask about: what to sow, El Niño, frost, irrigation or a word you do not understand.",
  chLimite: "Many questions were asked today. I answer with what Muyuy already knows.",
  chS1: "What should I sow?", chS2: "What if El Niño comes?", chS3: "Can I sow now?", chS4: "What is rotating?",
  chHoy: "With what you chose in Muyuy:", chNino: "About El Niño on your farm:", chAhora: "How your farm is now:", chClima: "Your climate since 1981:",
  chJuegos: "In 🎮 Games there are 5 games with NASA's climate for your farm: the ayllu, the duel, the qocha, around the world and El Niño around the world. They do not change your plan.",
  chSaludo: "Hello! How can I help? Ask me what to sow, what happens with El Niño or frost, or what a word means.",
  chEscuchar: "🔊 Listen", chComp: "In «Compare» (step 4) —",
  chMetodo: "How it was computed:", chFilas: "Recommended · current:",
  chHolaT: "Hello! Ask me about the charts, the terms or how it was computed. You decide; I explain the data.",
  chTs1: "What is NDVI?", chTs2: "What is water deficit?", chTs3: "Why this rotation?", chTs4: "How was it computed?",
});
// borrador en quechua para revisar con una persona hablante
Object.assign(I18N.qu, {
  chT: "💬 Muyuyta tapuy", chHola: "Allillanchu! Muyuy kani. Chakraykimanta tapuway: imata tarpunayki, El Niño, qasa. Qanmi akllanki.",
  chPh: "Tapuyniykita qillqay…", chEnviar: "Apachiy", chPensando: "Muyuy yuyaykuchkan…",
  chS1: "¿Imatataq tarpuyman?", chS2: "¿El Niño hamuqtin imataq?", chS3: "¿Kunanchu tarpuyman?", chS4: "¿Imataq muyuy?",
});

const CHAT = (() => {
  const K = "muyuy-chat";
  let hist = [];
  try { hist = JSON.parse(sessionStorage.getItem(K)) || []; } catch {}
  const guardar = () => { try { sessionStorage.setItem(K, JSON.stringify(hist.slice(-30))); } catch {} };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const txt = (sel) => { const e = document.querySelector(sel); return e ? e.innerText.replace(/\s+/g, " ").trim() : ""; };
  const todo = (sel) => { const e = document.querySelector(sel); return e ? e.textContent.replace(/\s+/g, " ").trim() : ""; }; // también lo plegado
  const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const enLinea = () => !!CHAT_URL && navigator.onLine !== false;
  const enTecnica = () => !!document.getElementById("cmpTable"); // el mismo chat en la vista técnica
  let fab, dlg, ocupado = false;

  // cada fila ya dice cuál es mejor: el modelo no compara números (una vez dijo que la erosión bajaba cuando subía)
  function comparacionAgricultor() {
    const out = [];
    document.querySelectorAll("#estrategias .es-t:not(.si-t)").forEach((t, i) => {
      const cab = [...t.querySelectorAll("thead th")].slice(1);
      const nom = cab.map((th) => (th.querySelector(".es-n") || th).textContent.trim());
      if (!i) out.push("Rotaciones: " + cab.map((th, k) => `${nom[k]} = ${(th.querySelector(".es-nom") || th).textContent.trim()}`).join("; "));
      t.querySelectorAll("tbody tr").forEach((f) => {
        const c = [...f.querySelectorAll("td")].map((td) => td.textContent.replace(/\s+/g, " ").trim());
        if (!c.length || c.every((x) => x === "—")) return;
        const gana = nom.filter((_, k) => (c[k] || "").includes("✓"));
        out.push(`${f.querySelector("th").textContent.replace("?", "").trim()}: ${c.map((x, k) => `${nom[k]} ${x.replace(/[●○✓]/g, "").trim()}`).join(" | ")} → ${gana.length ? "mejor: " + gana.join(", ") : "sin diferencia clara"}`);
      });
    });
    return out.join("\n");
  }
  function comparacionTecnica() {
    return [...document.querySelectorAll("#cmpTable tbody tr")].map((f) => {
      const [a, b, x] = f.children;
      return `${a.textContent.trim()}: recomendada ${b.textContent.trim()} | actual ${x.textContent.trim()} → ${b.classList.contains("win") ? "mejor: recomendada" : x.classList.contains("win") ? "mejor: actual" : "iguales"}`;
    }).join("\n");
  }

  // ---------------------------------------------------------------- lo que Muyuy sabe de la chacra (va al modelo)
  function contexto() {
    if (typeof D === "undefined" || !D) return "";
    const c = D.contexto || {}, L = [];
    L.push(`Lugar: ${c.lugar || ""} · región ${D.region || ""} · altura ${c.altura ?? "?"} m · pendiente ${c.pendiente ?? "?"} %`);
    // primero: qué cultivos calcula Muyuy aquí (el contexto se corta al final y esto no debe perderse)
    const cs = Object.entries(D.cultivos || {}).filter(([, x]) => x.grupo !== "descanso" && x.factible !== false).map(([k]) => (typeof cname === "function" ? cname(k) : k));
    if (cs.length) L.push("Cultivos que Muyuy calcula en esta chacra: " + cs.join(", ") + ".");
    // arriba: el contexto se corta al final y antes el pronóstico se perdía («Muyuy no muestra pronóstico»)
    const enso = todo("#ensoBanner").replace(/Ver cómo le iría →|See how it would do →|Imayna kanman qhaway →/, "");
    if (enso) L.push("Pronóstico de El Niño (Muyuy lo muestra en el paso 2): " + enso.slice(0, 400));
    L.push("Muyuy no calcula: arroz de riego en poza (gasta mucha más agua de la que su cálculo simula y suele sembrarse cada año), cultivos permanentes (café, cacao, frutales, caña). Para probar otra combinación: paso 2, «Probar mi propia idea».");
    try { L.push("Paso que está viendo: " + (typeof STEPS !== "undefined" && typeof cur !== "undefined" ? `${cur + 1} (${STEPS[cur]})` : "")); } catch {}
    L.push("Opción 1 frente a lo de hoy (paso 2): " + [...document.querySelectorAll("#resumen .res-l li")].map((l) => l.textContent.trim()).join(" · ").slice(0, 700));
    L.push("Comparación ya resuelta por Muyuy (cada fila dice cuál es mejor):\n" + comparacionAgricultor().slice(0, 1500));
    L.push("Su clima desde 1981: " + txt("#tendencias .td-res").slice(0, 500));
    L.push("Cómo está su chacra ahora: " + txt("#ahoraBody").slice(0, 500));
    L.push("Lo que le limita (paso 1): " + todo("#restric").slice(0, 300));
    if (enTecnica()) {
      const ver = (sel, n) => { const e = document.querySelector(sel); return e ? e.textContent.replace(/\s+/g, " ").trim().slice(0, n) : ""; };
      const rec = document.getElementById("selRec"), act = [...document.querySelectorAll(".selAct")];
      L.push("Está en la vista técnica: quien pregunta es técnico o extensionista; puede usar términos técnicos si los explica.");
      L.push("Comparación que tiene en pantalla: recomendada " + (rec && rec.selectedOptions[0] ? rec.selectedOptions[0].textContent : "") + "; actual " + act.map((x) => (x.selectedOptions[0] || {}).textContent).join(" → ") + ". Ya resuelta por Muyuy:\n" + comparacionTecnica().slice(0, 1100));
      L.push("Datos de la parcela: " + [...document.querySelectorAll("#facts li")].map((x) => x.textContent.trim()).join("; ").slice(0, 400));
      L.push("Clima: " + ver("#climaNote", 240));
      L.push("Clima de 2050: " + ver("#futResumen", 300));
      L.push("Método: " + ver("#metodo .como, #leMetodo .como", 700));
    }
    return L.filter((x) => !/:\s*$/.test(x)).join("\n").slice(0, 3400);
  }

  // ---------------------------------------------------------------- respuesta sin internet
  const PARADAS = new Set("el la los las un una unos unas de del al a en y o u que q es son ser por para con sin mi mis su sus se me le lo como cual cuales cuando donde quien muy mas menos ya hay esta este esto eso esa the a an of to is are what how do does can my your in on for and or".split(" "));
  const palabras = (s) => norm(s).replace(/[^a-z0-9ñ ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !PARADAS.has(w)).map((w) => w.replace(/(es|s)$/, ""));
  function trozos() { // todo lo que Muyuy muestra o explica, en pedazos: Información extra, criterio, ayuda, resumen…
    const out = [];
    document.querySelectorAll("#leer details.le-sec, #ieGuarda details.le-sec").forEach((d) => {
      const tit = (d.querySelector("summary") || {}).innerText || "";
      d.querySelectorAll("p, li, dd, tr, .le-c").forEach((e) => { const t = e.innerText.replace(/\s+/g, " ").trim(); if (t.length > 25) out.push(`${tit.replace(/\s+/g, " ").trim()}: ${t}`); });
      d.querySelectorAll("dt").forEach((dt) => { const dd = dt.nextElementSibling; if (dd) out.push(`${dt.innerText.trim()}: ${dd.innerText.trim()}`); });
    });
    document.querySelectorAll("#glosario dt, #leMetodo .glosario dt").forEach((dt) => { const dd = dt.nextElementSibling; if (dd) out.push(`${dt.textContent.trim()}: ${dd.textContent.trim()}`); });
    ["#metodo .como li, #leMetodo .como li", "main .hint", "#facts li", "#climaNote", "#futResumen", "#suCriterio li", "#resumen li", "#tendencias .td-res li", "#calendario .ca-notas li", "#patrones .pa-l li"].forEach((s) =>
      document.querySelectorAll(s).forEach((e) => { const t = e.innerText.replace(/\s+/g, " ").trim(); if (t.length > 20) out.push(t); }));
    Object.keys(I18N.es).filter((k) => /^ayuda|^rotFig$|^fuentes/.test(k)).forEach((k) => out.push(tr(k).replace(/<[^>]+>/g, "")));
    return [...new Set(out)];
  }
  // una fila de la tabla «Comparar» del paso 4 (forraje, ingreso, plagas, tierra, agua, años secos, seguridad)
  const FILAS = [[/forraje|animal|vaca|oveja|cuy|pasto|fodder|uyway/, /forraje|fodder/], [/ingreso|plata|dinero|gan[ao]|precio|vend|income|qullqi/, /ingreso|income/],
    [/plaga|gusano|insecto|enfermedad|rancha|pest/, /plaga|pest/], [/tierra|suelo|soil|allpa|cans/, /tierra|soil/], [/riego|agua|alcanza|water|yaku/, /lluvia|rain/],
    [/seco|sequia|drought|ch.aki/, /secos|dry/], [/segur|confi|certain/, /seguro|certain/]];
  function filaComparar(n) {
    const f = FILAS.find(([q]) => q.test(n));
    const filas = [...document.querySelectorAll("#estrategias .es-t tr")];
    if (!f || filas.length < 2) return "";
    const nombres = [...filas[0].querySelectorAll("th")].slice(1).map((th) => ((th.querySelector(".es-n") || th).innerText || "").replace(/\s+/g, " ").trim());
    const tr_ = filas.find((r) => { const th = r.querySelector("th"); return th && f[1].test(norm(th.innerText)); });
    if (!tr_) return "";
    const celdas = [...tr_.querySelectorAll("td")].map((td) => td.innerText.replace(/[●○]/g, "").replace(/\s+/g, " ").trim());
    return `${tr("chComp")} ${tr_.querySelector("th").innerText.replace("?", "").trim()}\n` + celdas.map((c, i) => `• ${nombres[i] || ""}: ${c}`).join("\n");
  }
  function local(q) {
    const n = norm(q);
    const lista = (t, sel, max = 4) => { const li = [...document.querySelectorAll(sel)].map((e) => "• " + e.innerText.replace(/\s+/g, " ").trim()).filter((x) => x.length > 3).slice(0, max); return li.length ? `${t}\n${li.join("\n")}` : ""; };
    if (/^(hola|buen[oa]s|hello|hi|allillanchu)\b/.test(n) && n.length < 25) return tr("chSaludo");
    if (enTecnica() && /por que|why/.test(n) && /rotacion|rotation|recomiend|recommend/.test(n)) {
      const filas = [...document.querySelectorAll("#cmpTable tbody tr")].map((f) => "• " + [...f.children].map((c) => c.textContent.trim()).join(" · "));
      if (filas.length) return `${txt("#selRec option:checked")}\n${tr("chFilas")}\n${filas.join("\n")}`;
    }
    if (enTecnica() && /(como se calcul|metodo|how was|method)/.test(n)) {
      const r = lista(tr("chMetodo"), "#metodo .como li, #leMetodo .como li", 6);
      if (r) return r;
    }
    if (/juego|jugar|game|pukllay/.test(n)) return tr("chJuegos");
    if (/(ya puedo|puedo sembrar|cuando (sembr|siembr)|semaforo|can i sow|when (to|should i) (sow|plant)|kunanchu|mayk.aq tarpu)/.test(n)) {
      const s = txt("#ahoraBody .ah-sem, #ahoraBody").slice(0, 320);
      if (s) return `${tr("chAhora")} ${s}`;
    }
    if (/nino|el nino|ninyo/.test(n)) {
      const r = [todo("#ensoBanner .enso-l b") + (todo("#ensoBanner .enso-c") ? ". " + todo("#ensoBanner .enso-c") : ""), lista(tr("chNino"), "#tendencias .td-res li", 2)].filter(Boolean).join("\n");
      if (r) return r;
    }
    if (/(que (me )?conviene|que sembr|recomiend|mejor rotacion|what should|imatataq tarpu)/.test(n)) {
      const r = lista(tr("chHoy"), "#resumen .res-l li", 6);
      if (r) return r;
    }
    if (/(clima|llov|lluvia|calor|helad|qasa|frost|rain|climate)/.test(n) && !/que es|que significa|what is/.test(n)) {
      const r = lista(tr("chClima"), "#tendencias .td-res li", 5);
      if (r) return r;
    }
    const fila = filaComparar(n);
    if (fila) return fila;
    // buscar las palabras de la pregunta en lo que Muyuy explica
    const qs = palabras(q);
    if (!qs.length) return tr("chNada");
    let best = null, bs = 0;
    for (const t of trozos()) {
      const ws = new Set(palabras(t));
      let s = 0;
      qs.forEach((w) => { if (ws.has(w)) s += 1; else if ([...ws].some((x) => x.startsWith(w) || w.startsWith(x) && x.length > 3)) s += 0.5; });
      s = s / Math.sqrt(Math.max(8, ws.size)) + (s >= qs.length ? 0.3 : 0);
      if (s > bs) { bs = s; best = t; }
    }
    return best && bs >= 0.18 ? best.replace(/<[^>]+>/g, "").slice(0, 700) : tr("chNada");
  }

  // ---------------------------------------------------------------- con internet
  async function enLineaResp(q) {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 60000);
    try {
      const mensajes = [...hist.filter((m) => !m.local).slice(-8).map((m) => ({ r: m.r, t: m.t.slice(0, 800) })), { r: "u", t: q.slice(0, 800) }];
      const r = await fetch(CHAT_URL, { method: "POST", signal: ctl.signal, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensajes, idioma: LANG, contexto: contexto() }) });
      const j = await r.json().catch(() => ({}));
      if (j && j.ok && j.texto) return { t: j.texto };
      return { limite: r.status === 429 };
    } catch { return {}; } finally { clearTimeout(to); }
  }

  // ---------------------------------------------------------------- pantalla
  function burbuja(m, i) {
    const cuerpo = esc(m.t).replace(/\n/g, "<br>");
    return m.r === "u" ? `<div class="ch-m ch-u">${cuerpo}</div>`
      : `<div class="ch-m ch-a">${cuerpo}${m.local ? `<small class="ch-nota">${esc(m.nota || tr("chNotaLocal"))}</small>` : ""}
          ${typeof speakText === "function" ? `<button type="button" class="ch-voz" data-i="${i}">${tr("chEscuchar")}</button>` : ""}</div>`;
  }
  function pintar() {
    if (!dlg) return;
    $("#chT", dlg).textContent = tr("chT");
    const modo = $("#chModo", dlg); modo.textContent = enLinea() ? "" : tr("chLocal"); modo.hidden = enLinea(); // solo se avisa cuando no hay internet
    $("#chIn", dlg).placeholder = tr("chPh");
    $("#chEnv", dlg).setAttribute("aria-label", tr("chEnviar"));
    $("#chBorrar", dlg).textContent = tr("chBorrar");
    $("#chX", dlg).setAttribute("aria-label", tr("chCerrar"));
    const log = $("#chLog", dlg);
    log.innerHTML = `<div class="ch-m ch-a">${esc(tr(enTecnica() ? "chHolaT" : "chHola"))}</div>` + hist.map(burbuja).join("") +
      (ocupado ? `<div class="ch-m ch-a ch-esp"><span class="ah-spin" aria-hidden="true"></span> ${tr("chPensando")}</div>` : "");
    $("#chSug", dlg).innerHTML = hist.length ? "" : (enTecnica() ? ["chTs1", "chTs2", "chTs3", "chTs4"] : ["chS1", "chS2", "chS3", "chS4"]).map((k) => `<button type="button" class="ch-s">${tr(k)}</button>`).join("");
    $$(".ch-s", dlg).forEach((b) => (b.onclick = () => preguntar(b.textContent)));
    $$(".ch-voz", dlg).forEach((b) => (b.onclick = () => typeof speakText === "function" && speakText(hist[+b.dataset.i].t, b)));
    log.scrollTop = log.scrollHeight;
  }
  async function preguntar(q) {
    q = String(q || "").trim();
    if (!q || ocupado) return;
    hist.push({ r: "u", t: q.slice(0, 800) });
    ocupado = true; pintar();
    let resp = null, nota = "";
    if (enLinea()) {
      const r = await enLineaResp(q);
      if (r.t) resp = { r: "a", t: r.t };
      else if (r.limite) nota = tr("chLimite");
    }
    if (!resp) resp = { r: "a", t: local(q), local: true, nota: nota || tr("chNotaLocal") };
    hist.push(resp); guardar();
    ocupado = false; pintar();
    $("#chIn", dlg).focus({ preventScroll: true });
  }
  function abrir() {
    if (!dlg.open) dlg.showModal();
    fab.hidden = true; subir();
    pintar();
    setTimeout(() => $("#chIn", dlg).focus({ preventScroll: true }), 50);
  }
  function cerrar() { dlg.close(); }
  // el botón va dentro de la ventana abierta de más arriba (una ventana modal deja inactivo todo lo de afuera) y se
  // ubica sobre lo que haya abajo: la barra de pasos en la página o el pie de «Elija su chacra»
  const pila = [];
  function subir() {
    if (!fab) return;
    for (let i = pila.length - 1; i >= 0; i--) if (!pila[i].open) pila.splice(i, 1);
    document.querySelectorAll("dialog[open]").forEach((d) => { if (d !== dlg && d.id !== "ajustes" && !pila.includes(d)) pila.push(d); }); // Configuración se redibuja por dentro: el botón se perdería al tocar una opción
    const arriba = pila[pila.length - 1] || null, padre = arriba || document.body;
    if (fab.parentElement !== padre) padre.appendChild(fab);
    let abajo = 12;
    if (arriba) { const pie = arriba.querySelector(".pk-foot"); if (pie && pie.offsetParent) abajo += pie.offsetHeight; }
    else { const nav = document.getElementById("wizardNav"); if (nav && getComputedStyle(nav).display !== "none") abajo += nav.getBoundingClientRect().height; } // fija: no tiene offsetParent
    fab.style.bottom = `calc(${abajo}px + env(safe-area-inset-bottom, 0px))`;
    colocar();
  }
  // el agricultor lo arrastra a donde no le estorbe. Se guarda como proporción de la pantalla: al girar el celular sigue dentro
  const POS_KEY = "muyuy-chat-pos";
  let pos = null;
  try { const g = JSON.parse(localStorage.getItem(POS_KEY)); if (g && g.x >= 0 && g.x <= 1 && g.y >= 0 && g.y <= 1) pos = g; } catch {}
  function colocar() {
    if (!fab || !pos) return;
    const w = fab.offsetWidth || 52, h = fab.offsetHeight || 52;
    fab.style.left = `${Math.round(pos.x * (innerWidth - w))}px`;
    fab.style.top = `${Math.round(pos.y * (innerHeight - h))}px`;
    fab.style.right = fab.style.bottom = "auto";
  }
  function hacerMovible() {
    let ini = null, movido = false;
    fab.addEventListener("pointerdown", (e) => {
      if (e.button) return;
      const r = fab.getBoundingClientRect();
      ini = { x: e.clientX, y: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, id: e.pointerId };
      movido = false;
      try { fab.setPointerCapture(e.pointerId); } catch {} // aunque el puntero corra más rápido que el botón
    });
    fab.addEventListener("pointermove", (e) => {
      if (!ini || e.pointerId !== ini.id) return;
      if (!movido) {
        if (Math.hypot(e.clientX - ini.x, e.clientY - ini.y) < 8) return; // un toque con el dedo tembloroso sigue siendo un toque
        movido = true;
        fab.classList.add("moviendo");
      }
      const w = fab.offsetWidth, h = fab.offsetHeight, maxX = Math.max(1, innerWidth - w), maxY = Math.max(1, innerHeight - h);
      pos = { x: Math.min(1, Math.max(0, (e.clientX - ini.dx) / maxX)), y: Math.min(1, Math.max(0, (e.clientY - ini.dy) / maxY)) };
      colocar();
    });
    const soltar = (e) => {
      if (!ini || e.pointerId !== ini.id) return;
      ini = null;
      fab.classList.remove("moviendo");
      if (movido) try { localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch {}
    };
    fab.addEventListener("pointerup", soltar);
    fab.addEventListener("pointercancel", soltar);
    fab.addEventListener("click", (e) => { if (movido) { movido = false; e.stopImmediatePropagation(); e.preventDefault(); } }, true); // soltarlo no abre el chat
    addEventListener("resize", colocar);
  }
  function iniciar() {
    fab = document.createElement("button");
    fab.type = "button"; fab.id = "chatFab"; fab.className = "chat-fab";
    fab.innerHTML = `<span aria-hidden="true">💬</span>`;
    fab.setAttribute("aria-label", tr("chAbrir"));
    document.body.appendChild(fab);
    dlg = document.createElement("dialog");
    dlg.id = "chatDlg"; dlg.className = "chat-dlg"; dlg.setAttribute("aria-labelledby", "chT");
    dlg.innerHTML = `<header class="ch-head"><h2 id="chT"></h2><button type="button" class="ch-x" id="chX">✕</button></header>
      <p class="ch-modo" id="chModo"></p>
      <div class="ch-log" id="chLog" aria-live="polite"></div>
      <div class="ch-sug" id="chSug"></div>
      <form class="ch-form" id="chForm"><input id="chIn" type="text" autocomplete="off" maxlength="600" enterkeyhint="send">
        <button type="submit" id="chEnv" class="ch-env">➤</button></form>
      <button type="button" class="ch-borrar" id="chBorrar"></button>`;
    document.body.appendChild(dlg);
    hacerMovible();
    colocar();
    const tapan = ["#picker", "#queHacer", "#splash"].map((s) => document.querySelector(s)).filter(Boolean);
    const verTapan = () => document.documentElement.classList.toggle("sin-chat", tapan.some((d) => d.open));
    tapan.forEach((d) => new MutationObserver(verTapan).observe(d, { attributes: true, attributeFilter: ["open"] })); verTapan();
    fab.onclick = abrir;
    $("#chX", dlg).onclick = cerrar;
    dlg.addEventListener("close", () => { fab.hidden = false; subir(); });
    dlg.addEventListener("click", (e) => { if (e.target === dlg) cerrar(); }); // toque fuera: cierra
    $("#chForm", dlg).onsubmit = (e) => { e.preventDefault(); const i = $("#chIn", dlg); const q = i.value; i.value = ""; preguntar(q); };
    $("#chBorrar", dlg).onclick = () => { hist = []; guardar(); pintar(); };
    // al abrirse o cerrarse otra ventana (juegos, selector, información extra…), el botón se muda a la de más arriba
    new MutationObserver((ms) => { if (ms.some((m) => m.target !== dlg && m.target.tagName === "DIALOG")) setTimeout(subir, 0); })
      .observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
    addEventListener("resize", subir);
    new MutationObserver(() => subir()).observe(document.body, { attributes: true, attributeFilter: ["class"] }); // modo guiado: aparece la barra
    subir();
    const lang = document.getElementById("lang");
    if (lang) lang.addEventListener("change", () => setTimeout(() => { fab.setAttribute("aria-label", tr("chAbrir")); if (dlg.open) pintar(); }, 0));
    addEventListener("online", pintar); addEventListener("offline", pintar);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
  return { local, contexto, abrir, preguntar };
})();
