// Muyuy · facil.js: ayudas para quien lee poco o nunca usó mapas ni datos (V1.0).
// Siguen recomendaciones de diseño para usuarios con poca lectura y poca experiencia digital:
//  - voz junto a cada bloque (Medhi et al., 2011: interfaces con voz e íconos para personas que leen poco);
//  - un «?» que explica con palabras de todos los días cada fila y cada término (ayuda en el lugar, no en un manual);
//  - un solo mensaje principal arriba y el detalle después (divulgación progresiva);
//  - lo que se recomienda se conversa y se comparte por WhatsApp (Hansen et al., 2011: servicios del clima participativos).
// Los botones se atienden por delegación: siguen funcionando aunque la sección se vuelva a dibujar.
"use strict";

Object.assign(I18N.es, {
  fxEscuchar: "🔊 Escuchar", fxQue: "¿Qué quiere decir?", fxCerrar: "Entendido",
  q_anios: "De los últimos 45 años, en cuántos de cada 10 le habría ido bien con estos cultivos, con el clima de la NASA para su chacra. 7 de 10 quiere decir: 7 años buenos y 3 malos.",
  q_seco: "Lo mismo, pero contando solo los años en que llovió poco.",
  q_agua: "Si la lluvia de esos meses alcanza para lo que piden los cultivos. Si dice «faltan», en años normales la planta pasa sed o hace falta regar.",
  q_tierra: "Si la tierra queda mejor o peor después de 3 campañas: cuánto alimento deja para las plantas, si gana o pierde materia orgánica y cuánta tierra se lleva la lluvia.",
  q_plaga: "Si se siembran seguidos cultivos de la misma familia (por ejemplo papa después de papa), los gusanos y enfermedades del suelo se quedan y aumentan. Cambiar de familia los corta.",
  q_forr: "Cuánto pasto, paja o rastrojo deja para los animales.",
  q_ing: "Lo que se gana al año en una hectárea: lo que se vende menos lo que se gasta en semilla, abono y otros (sin contar el trabajo de la familia). Los precios son de referencia si usted no puso los de su feria.",
  q_seg: "Qué tan seguro es el resultado. Es «baja» cuando faltan datos de su zona o el resultado cambia mucho de un año a otro. Entonces conviene probar primero en un pedazo pequeño.",
  q_op: "Lo que usted piensa de cada posibilidad. Si marca «No en mi chacra», Muyuy la quita y muestra otra.",
  q_vacia: "Meses en que la chacra queda sin ningún cultivo. La tierra sin cubrir se seca y la lluvia o el viento se la llevan.",
  q_delicado: "Meses en que la planta está floreciendo o llenando el grano. Una helada o la falta de agua en esos meses hacen más daño.",
  q_patron: "Algo que se repite en los datos. «Fuerte» quiere decir que se repite mucho; «débil», que se ve poco. Usted puede decir si lo ha visto en su chacra.",
  q_tend: "Cómo cambió el clima de su chacra desde 1981, mirando cada campaña.",
  resT: "⭐ Lo más importante", resHoy: "Lo que siembra hoy ({r}) le habría ido bien <b>{n} de cada 10 años</b>.",
  resOp: "Con lo que usted marcó, la posibilidad que más se ajusta es <b>{r}</b>: le habría ido bien <b>{n} de cada 10 años</b>.",
  resOpMenos: "Con lo que usted marcó, la posibilidad que más puntos saca es <b>{r}</b>. Ojo: le habría ido bien <b>{n} de cada 10 años</b>, menos que lo de hoy.",
  resBase: "La opción 1 no lleva {c}. La opción {k} sí.", resMasT: "🔎 Más cosas que revisar",
  resGana: "Lo que gana: {t}", resRev: "Antes de decidir, revise: {t}", resDecide: "Usted decide. Converse con su familia y su comunidad.",
  resIgual: "Lo que siembra hoy ya está entre lo mejor para lo que usted marcó.", resVer: "📋 Ver por qué", resWa: "📲 Enviar por WhatsApp",
  resWaTxt: "Muyuy · {l}\nHoy: {h} (bien {nh} de 10 años)\nPosibilidad: {o} (bien {no} de 10 años)\nRevisar: {r}\nUsted decide.",
});
Object.assign(I18N.en, {
  fxEscuchar: "🔊 Listen", fxQue: "What does it mean?", fxCerrar: "Got it",
  q_anios: "Of the last 45 years, in how many out of 10 these crops would have done well, with your farm's real weather. 7 of 10 means: 7 good years and 3 bad ones.",
  q_seco: "The same, counting only the years with little rain.",
  q_agua: "Whether the rain of those months is enough for what the crops need. “Short” means that in normal years the plant goes thirsty or needs irrigation.",
  q_tierra: "Whether the soil ends better or worse after 3 seasons: food left for plants, organic matter gained or lost, and soil washed away.",
  q_plaga: "Growing crops of the same family in a row (for example potato after potato) lets soil worms and diseases stay and grow. Changing family breaks them.",
  q_forr: "How much pasture, straw or stubble it leaves for animals.",
  q_ing: "What one hectare earns per year: sales minus seed, fertilizer and other costs (family work not counted). Prices are reference values unless you entered your market's.",
  q_seg: "How certain the result is. “Low” when data from your area are missing or the result changes a lot from year to year: try it first on a small plot.",
  q_op: "What you think of each possibility. If you mark “Not on my farm”, Muyuy removes it and shows another.",
  q_vacia: "Months when the field has no crop. Bare soil dries out and rain or wind carry it away.",
  q_delicado: "Months when the plant is flowering or filling grain. Frost or lack of water then does more harm.",
  q_patron: "Something that repeats in the data. “Strong” means it repeats a lot; “weak”, a little. You can say whether you have seen it on your farm.",
  q_tend: "How your farm's climate has changed since 1981, season by season.",
  resT: "⭐ The most important", resHoy: "What you grow today ({r}) would have done well <b>{n} out of 10 years</b>.",
  resOp: "With what you marked, the best-fitting possibility is <b>{r}</b>: it would have done well <b>{n} out of 10 years</b>.",
  resOpMenos: "With what you marked, the highest-scoring possibility is <b>{r}</b>. Careful: it would have done well <b>{n} out of 10 years</b>, fewer than what you sow today.",
  resBase: "Option 1 does not include {c}. Option {k} does.", resMasT: "🔎 More things to check",
  resGana: "What you gain: {t}", resRev: "Before deciding, check: {t}", resDecide: "You decide. Talk it over with your family and community.",
  resIgual: "What you grow today is already among the best for what you marked.", resVer: "📋 See why", resWa: "📲 Send by WhatsApp",
  resWaTxt: "Muyuy · {l}\nToday: {h} (good {nh} of 10 years)\nPossibility: {o} (good {no} of 10 years)\nCheck: {r}\nYou decide.",
});
Object.assign(I18N.qu, {
  fxEscuchar: "🔊 Uyariy", fxQue: "¿Imatataq niyta munan?", fxCerrar: "Entiendeniña",
  q_anios: "Qhipa 45 watamanta, sapa chunka watapi hayk'a watapi allin kanman karqan kay rurukunawan, chakraykiq cheqaq pachanwan. Chunkamanta 7: 7 allin wata, 3 mana allin.",
  q_seco: "Kikin, ichaqa pisi parayuq watakunallata yupaspa.", q_agua: "Chay killakunapi para rurukunapaq aypanchu. «Pisin» nispaqa, sachaqa ch'akiyta muchun utaq qarpana.",
  q_tierra: "Kimsa tarpuy qhipata allpa aswan allinchu utaq aswan sayk'usqachu.", q_plaga: "Kikin ayllu rurukunata qatiqllata tarpuspaqa allpa kurukuna yapakunku. Ayllunta tikraspa kuchunki.",
  q_forr: "Uywakunapaq hayk'a q'achuta, ichhuta saqin.", q_ing: "Huk hectáreapi sapa watapi hayk'a qullqi qhepan: rantikusqamanta muhu, wanu qullqita qichuspa.",
  q_seg: "Hayk'a takyasqa. «Pisi» nispaqa, ñawpaqta huk huch'uy pedazopi tarpuy.", q_op: "Sapa atikuymanta imatam yuyanki. «Mana chakraypichu» nispaqa, Muyuy qichun.",
  q_vacia: "Mana ruruyuq killakuna. Mana p'istusqa allpaqa ch'akin, paraq wayraq apakun.", q_delicado: "Sacha t'ikachkaqtin utaq ruruchkaqtin. Chaypi qasa utaq ch'aki aswan mana allinta ruran.",
  q_patron: "Willakuykunapi kutipaq. «Sinchi» achkata kutipan; «pisi» pisillata.", q_tend: "1981 watamanta chakraykiq pachan imayna tikrakurqan.",
  resT: "⭐ Aswan allin yachanapaq", resHoy: "Kunan tarpusqayki ({r}) <b>chunka watamanta {n}</b> allin kanman karqan.",
  resOp: "Akllasqaykiwan, aswan tupaq atikuy <b>{r}</b>: <b>chunka watamanta {n}</b> allin kanman karqan.",
  resOpMenos: "Akllasqaykiwan, aswan tupaq atikuy <b>{r}</b>. Cuidakuy: <b>chunka watamanta {n}</b> allin kanman karqan, kunan tarpusqaykimanta aswan pisi.",
  resBase: "Kay atikuypi {c} mana kanchu. {k} akllaypi kachkan.", resMasT: "🔎 Aswan qhawanapaq",
  resGana: "Imatataq tarinki: {t}", resRev: "Manaraq akllaspa, qhaway: {t}", resDecide: "Qanmi akllanki. Aylluykiwan, llaqtaykiwan rimanakuy.",
  resIgual: "Kunan tarpusqayki ñam aswan allinkuna ukhupi kachkan.", resVer: "📋 Imarayku", resWa: "📲 WhatsAppwan apachiy",
});

const FACIL = (() => {
  const sinIconos = (t) => String(t).replace(/<[^>]+>/g, " ").replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}✓✔●○⚠↓→▲▼·]/gu, " ").replace(/\s+/g, " ").trim();
  const h = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  // botón 🔊 que lee un texto (o el texto de un elemento, con data-de="selector")
  const voz = (texto, de) => `<button type="button" class="say fx-voz" aria-label="${h(tr("fxEscuchar"))}"${texto ? ` data-txt="${h(sinIconos(texto))}"` : ""}${de ? ` data-de="${h(de)}"` : ""}>🔊</button>`;
  // botón «?» que explica con palabras sencillas
  const que = (clave) => `<button type="button" class="fx-que" data-q="${clave}" aria-label="${h(tr("fxQue"))}">?</button>`;

  function explicar(clave, desde) {
    let d = document.getElementById("fxDlg");
    if (!d) {
      d = document.createElement("dialog");
      d.id = "fxDlg"; d.className = "fx-dlg";
      document.body.appendChild(d);
      d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
    }
    const t = tr("q_" + clave);
    d.innerHTML = `<p class="fx-t">${h(t)}</p><div class="fx-b">${voz(t)}<button type="button" class="fx-ok">${h(tr("fxCerrar"))}</button></div>`;
    d.querySelector(".fx-ok").onclick = () => d.close();
    d.showModal();
    d.querySelector(".fx-ok").focus();
    if (desde) d.dataset.desde = "1";
  }
  // un solo oyente para todos los 🔊 y «?» que se dibujen ahora o después
  document.addEventListener("click", (e) => {
    const v = e.target.closest(".fx-voz");
    if (v) {
      e.preventDefault(); e.stopPropagation();
      const el = v.dataset.de && document.querySelector(v.dataset.de);
      const t = v.dataset.txt || (el ? sinIconos(el.innerText) : "");
      if (t && typeof sayText === "function") sayText(t, v);
      return;
    }
    const q = e.target.closest(".fx-que");
    if (q) { e.preventDefault(); e.stopPropagation(); explicar(q.dataset.q, q); }
  });
  return { voz, que, sinIconos, explicar };
})();

// ---------------------------------------------------------------- pestañas dentro de cada paso
// Cada paso mostraba muchas secciones a la vez. Ahora los pasos cargados se dividen en pestañas: una cosa a la vez,
// en el orden en que la necesita el agricultor. Las secciones siguen en la página (la vista técnica y la impresión
// las usan); la pestaña solo las oculta con una clase, sin tocar su atributo hidden.
Object.assign(I18N.es, {
  tb_chacra: "🏡 Su chacra", tb_ahora: "📡 Ahora", tb_clima: "📈 Su clima", tb_importa: "⚖️ Le importa", tb_limita: "🧰 Le limita",
  tb_hoy: "🧑‍🌾 Cómo le va", tb_cal: "🗓️ Calendario", tb_principal: "⭐ Opciones", tb_comparar: "⚖️ Comparar", tb_patrones: "🔍 Se repite",
  tb_ysi: "🎚️ ¿Y si…?", tb_cierre: "📝 Mi cosecha", tb_cuaderno: "📒 Cuaderno", tbAyuda: "Toque una pestaña para ver otra parte de este paso.",
  rotQue: "🔄 ¿Qué es rotar?", deslizaTop: "👉 Deslice de lado para ver las 3 posibilidades.",
});
Object.assign(I18N.en, {
  tb_chacra: "🏡 Your farm", tb_ahora: "📡 Now", tb_clima: "📈 Climate", tb_importa: "⚖️ Priorities", tb_limita: "🧰 Limits",
  tb_hoy: "🧑‍🌾 How it does", tb_cal: "🗓️ Calendar", tb_principal: "⭐ Options", tb_comparar: "⚖️ Compare", tb_patrones: "🔍 Repeats",
  tb_ysi: "🎚️ What if…?", tb_cierre: "📝 My harvest", tb_cuaderno: "📒 Notebook", tbAyuda: "Tap a tab to see another part of this step.",
  rotQue: "🔄 What is rotating?", deslizaTop: "👉 Swipe sideways to see the 3 possibilities.",
});
Object.assign(I18N.qu, {
  tb_chacra: "🏡 Chakrayki", tb_ahora: "📡 Kunan", tb_clima: "📈 Pacha", tb_importa: "⚖️ Munasqayki", tb_limita: "🧰 Sasachakuyniyki",
  tb_hoy: "🧑‍🌾 Tarpusqayki", tb_cal: "🗓️ Killa yupana", tb_principal: "⭐ Aswan allin", tb_comparar: "⚖️ Tupachiy", tb_patrones: "🔍 Kutipaqkuna",
  tb_ysi: "🎚️ ¿Sichus…?", tb_cierre: "📝 Tukuy", tb_cuaderno: "📒 Qillqana", rotQue: "🔄 ¿Imataq muyuy?", deslizaTop: "👉 Kimsa atikuyta rikunaykipaq waqtaman aysay.",
});

const PESTANAS = (() => {
  // paso → [clave, [secciones que muestra]]
  const PLAN = {}; // sin pestañas dentro de los pasos: lo que eran pestañas va seguido o plegado (app.js: irA)
  const KEY = "muyuy-pestanas";
  const guardadas = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const hijos = (sec, sels) => sels.flatMap((s) => [...sec.querySelectorAll(":scope > " + s)]);

  function activar(paso, i, { guardar = true } = {}) {
    const sec = document.getElementById(paso), grupos = PLAN[paso];
    if (!sec || !grupos) return;
    i = Math.max(0, Math.min(grupos.length - 1, i));
    grupos.forEach(([, sels], k) => hijos(sec, sels).forEach((el) => el.classList.toggle("tab-oculto", k !== i)));
    sec.querySelectorAll(".fx-tabs button").forEach((b, k) => { b.classList.toggle("on", k === i); b.setAttribute("aria-selected", k === i); b.tabIndex = k === i ? 0 : -1; });
    if (guardar) { const g = guardadas(); g[paso] = i; try { localStorage.setItem(KEY, JSON.stringify(g)); } catch {} }
  }
  function textos() {
    for (const [paso, grupos] of Object.entries(PLAN)) {
      const nav = document.querySelector(`#${paso} .fx-tabs`);
      if (nav) nav.querySelectorAll("button").forEach((b, k) => (b.textContent = tr("tb_" + grupos[k][0])));
    }
  }
  function iniciar() {
    const g = guardadas();
    for (const [paso, grupos] of Object.entries(PLAN)) {
      const sec = document.getElementById(paso), h2 = sec && sec.querySelector(":scope > h2");
      if (!h2 || sec.querySelector(".fx-tabs")) continue;
      const nav = document.createElement("div");
      nav.className = "fx-tabs"; nav.setAttribute("role", "tablist");
      nav.innerHTML = grupos.map(([k], i) => `<button type="button" role="tab" data-i="${i}">${tr("tb_" + k)}</button>`).join("");
      h2.after(nav);
      nav.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { activar(paso, +b.dataset.i); nav.scrollIntoView({ block: "nearest" }); } });
      nav.addEventListener("keydown", (e) => { // flechas entre pestañas
        const i = [...nav.children].indexOf(document.activeElement);
        if (i < 0 || !["ArrowRight", "ArrowLeft"].includes(e.key)) return;
        const j = (i + (e.key === "ArrowRight" ? 1 : -1) + grupos.length) % grupos.length;
        activar(paso, j); nav.children[j].focus();
      });
      activar(paso, g[paso] || 0, { guardar: false });
    }
    // al cambiar de idioma, los nombres de las pestañas también (después de que app.js cambie LANG)
    const sel = document.getElementById("lang");
    if (sel) sel.addEventListener("change", () => setTimeout(textos, 0));
  }
  // muestra la pestaña donde está un elemento (recorrido guiado, «ver por qué»…)
  function mostrar(el) {
    if (!el) return;
    const sec = el.closest(".step"), k = sec && typeof STEPS !== "undefined" ? STEPS.indexOf(sec.id) : -1;
    if (k >= 0 && k !== cur) showStep(k, { focus: false });
    for (let d = el.closest("details"); d; d = d.parentElement && d.parentElement.closest("details")) d.open = true;
    for (const [paso, grupos] of Object.entries(PLAN)) {
      const sec = document.getElementById(paso);
      if (!sec || !sec.contains(el)) continue;
      grupos.forEach(([, sels], k) => { if (hijos(sec, sels).some((x) => x === el || x.contains(el))) activar(paso, k); });
    }
  }
  return { iniciar, activar, mostrar, textos };
})();


// ---------------------------------------------------------------- Configuración (Más → ⚙️): ver, tocar, escuchar, datos
// Los valores se guardan en «muyuy-ajustes» y un guion en <head> los aplica antes de dibujar (aquí, en la vista técnica y en el mapa).
Object.assign(I18N.es, {"cfgMenu": "⚙️ Configuración", "cfgT": "⚙️ Configuración", "cfgS": "Los cambios se guardan en este teléfono.", "cfgVer": "👁️ Para ver mejor", "cfgLetra": "Tamaño de letra", "cfgL0": "Normal", "cfgL1": "Grande", "cfgL2": "Más grande", "cfgL3": "Muy grande", "cfgContraste": "Alto contraste", "cfgContrasteS": "Negro sobre blanco: se lee mejor con sol.", "cfgLegible": "Letra más fácil de leer", "cfgLegibleS": "Letra simple, con más espacio entre palabras y líneas.", "cfgOir": "🔊 Para escuchar",  "cfgVel": "Velocidad de la voz", "cfgV_lenta": "Lenta", "cfgV_normal": "Normal", "cfgV_rapida": "Rápida", "cfgProbar": "🔊 Probar la voz", "cfgProbarTxt": "Así suena la voz de Muyuy. Usted decide qué sembrar.", "cfgLeer": "Leer cada paso al abrirlo", "cfgLeerS": "Para quien prefiere escuchar antes que leer.", "cfgIdioma": "🌐 Idioma", "t_cfg": "En Más → Configuración cambia el tamaño de letra, el contraste y otros ajustes.", "cfgMis": "🗂️ Mis datos", "cfgRest": "↺ Volver a los ajustes iniciales", "cfgRestOk": "Configuración restablecida.", "cfgBorrar": "🗑️ Borrar mis datos…", "cfgListo": "Listo", "cfgCerrar": "Cerrar"});
Object.assign(I18N.en, {"cfgMenu": "⚙️ Settings", "cfgT": "⚙️ Settings", "cfgS": "Changes are saved on this phone.", "cfgVer": "👁️ To see better", "cfgLetra": "Text size", "cfgL0": "Normal", "cfgL1": "Large", "cfgL2": "Larger", "cfgL3": "Very large", "cfgContraste": "High contrast", "cfgContrasteS": "Black on white: easier to read in the sun.", "cfgLegible": "Easier-to-read text", "cfgLegibleS": "Simple font, with more space between words and lines.", "cfgOir": "🔊 To listen",  "cfgVel": "Voice speed", "cfgV_lenta": "Slow", "cfgV_normal": "Normal", "cfgV_rapida": "Fast", "cfgProbar": "🔊 Try the voice", "cfgProbarTxt": "This is Muyuy's voice. You decide what to sow.", "cfgLeer": "Read each step when it opens", "cfgLeerS": "For those who prefer listening to reading.", "cfgIdioma": "🌐 Language", "t_cfg": "In More → Settings you can change the text size, the contrast and other options.", "cfgMis": "🗂️ My data", "cfgRest": "↺ Back to the starting settings", "cfgRestOk": "Settings restored.", "cfgBorrar": "🗑️ Delete my data…", "cfgListo": "Done", "cfgCerrar": "Close"});
// borrador en quechua para revisar con una persona hablante; lo demás se muestra en castellano
Object.assign(I18N.qu, {"cfgMenu": "⚙️ Allichay", "cfgT": "⚙️ Allichay", "cfgListo": "Tukuy", "cfgIdioma": "🌐 Simi"});

Object.assign(I18N.es, {"cfgPrivT": "🔒 Privacidad", "cfgPrivBtn": "Privacidad y uso de la IA", "cfgPrivS": "Qué datos usa Muyuy, a dónde van y cómo se usa la IA.", "cfgPrivV": "Versión 1 · 15 de noviembre de 2026", "cfgVolver": "← Volver", "cuConfX": "¿Borrar de este teléfono todo lo que anotó y eligió en Muyuy? No se puede deshacer: descargue antes los CSV si los necesita."});
Object.assign(I18N.en, {"cfgPrivT": "🔒 Privacy", "cfgPrivBtn": "Privacy and use of AI", "cfgPrivS": "What data Muyuy uses, where it goes and how AI is used.", "cfgPrivV": "Version 1 · November 15, 2026", "cfgVolver": "← Back", "cuConfX": "Delete from this phone everything you wrote and chose in Muyuy? This cannot be undone: download the CSV files first if you need them."});
Object.assign(I18N.qu, { cfgPrivT: "🔒 Pakasqa", cfgVolver: "← Kutiy" }); // borrador; el texto de privacidad se muestra en castellano
// Privacidad: describe lo que Muyuy hace de verdad. Si cambia un servicio, el chat o lo que se guarda, hay que cambiar esto.
const PRIV = {"es": {"sellos": ["No pide nombre, DNI, correo ni teléfono", "Sin cuentas, publicidad ni rastreadores", "No se venden datos"], "acc": [["📝", "Anotar en Muyuy", "no", "No sale de su teléfono", "Sus respuestas, precios, cuaderno y opiniones se quedan aquí.", 0], ["🗺️", "Ver clima y mapas", "si", "Sale el punto de su chacra", "Va sin su nombre a los servicios de clima, suelo y mapas, junto con la dirección IP del teléfono.", 2], ["📍", "Usar «Mi ubicación»", "si", "Sale el punto que marca el GPS", "El GPS se usa solo si toca ese botón, y el teléfono le pide permiso. Ese punto se usa igual que uno elegido en el mapa.", 1], ["💬", "Preguntar en el chat", "si", "Salen su pregunta y un resumen de la chacra", "Van cifrados a Supabase y de ahí a Groq o Z.ai, que generan la respuesta. Sin internet no sale nada.", 3], ["📤", "Descargar o enviar por WhatsApp", "tu", "Sale solo si usted lo hace", "Lo ve quien lo reciba, y WhatsApp lo trata según sus propias reglas.", 0]], "filas": [["📱 ¿Qué se queda en mi teléfono?", "<p>Sus respuestas, prioridades, precios, cuaderno, registro de campaña, opiniones, la chacra elegida y esta configuración. No se guardan en ningún servidor de Muyuy; si usa el chat, va un resumen (vea «¿Cómo se usa la IA?»).</p><p>Solo salen del teléfono si usted descarga un archivo o toca «Enviar por WhatsApp»: entonces los ve quien los reciba y WhatsApp los trata según sus propias reglas.</p>"], ["📍 ¿Qué pasa con mi ubicación?", "<ul><li>Muyuy trabaja con el punto que usted elige en el mapa o con «Mi ubicación». El GPS se usa solo si toca ese botón, y el teléfono le pedirá permiso.</li><li>Las coordenadas de ese punto se envían a los servicios de clima, suelo y mapas, para traer sus datos.</li><li>Esos pedidos no llevan su nombre, pero sí la ubicación y, como toda conexión a internet, la dirección IP técnica del teléfono.</li></ul>"], ["🌐 ¿A qué servicios se conecta Muyuy?", "<ul><li><b>NASA</b> (Power, Gibs) y <b>ORNL</b> (Modis), de Estados Unidos: clima e imágenes de satélite.</li><li><b>Open-Meteo</b> (Suiza): pronóstico, clima pasado y altura del terreno.</li><li><b>SoilGrids · Isric</b> (Países Bajos): suelo de la chacra exacta.</li><li><b>Esri</b> (Estados Unidos): imágenes del mapa.</li><li><b>Render</b> (Estados Unidos) publica esta web y <b>Cdnjs · Cloudflare</b> entrega algunos programas de la página.</li><li>Cada servicio aplica sus propias reglas.</li></ul>"], ["🤖 ¿Cómo se usa la IA?", "<ul><li><b>Chat:</b> al enviar una pregunta con internet, se envían por conexión cifrada su pregunta, las últimas del chat y un resumen de la chacra (lugar, altura, pendiente, lo que marcó en el paso 2 y resultados de Muyuy).</li><li>Eso pasa por <b>Supabase</b> (empresa de Estados Unidos, con servidores en São Paulo, Brasil) y llega a <b>Groq</b> (Estados Unidos) o <b>Z.ai · Zhipu</b> (China), que generan la respuesta y aplican sus propias políticas.</li><li><b>No escriba en el chat</b> su nombre, DNI, teléfono ni datos de otras personas.</li><li>Sin internet no se envía nada: Muyuy responde con lo que ya sabe de su chacra.</li><li><b>La IA puede equivocarse.</b> Revise sus respuestas con los datos de Muyuy, su experiencia o un técnico.</li><li><b>Rotaciones y patrones:</b> los calcula un motor con modelos agronómicos y datos de la NASA, en el teléfono. Los «patrones» usan aprendizaje automático sin enviar nada. La IA del chat no calcula esos resultados.</li><li><b>Voz:</b> los audios se generaron antes con voces sintéticas (Piper y Meta MMS) y vienen dentro de la app.</li><li><b>Desarrollo:</b> el equipo usó IA para ayudar con código y traducciones. El quechua es un borrador que debe revisar una persona hablante.</li></ul>"], ["🗄️ ¿Qué guarda el servidor?", "<p>El servidor del chat <b>no guarda sus preguntas ni su IP</b>. Para limitar los abusos guarda un resumen cifrado de la IP con la cuenta de preguntas, y se borra a partir de los 2 días. También guarda cuántas preguntas y palabras usó cada modelo en el día, sin dato de quién preguntó.</p><p>Para evitar abusos hay un límite de preguntas por minuto y por día.</p>"], ["🗑️ ¿Cómo borro mis datos?", "<p>En Configuración → «Borrar mis datos» se elimina de este teléfono lo que anotó y eligió, y el chat abierto. Se conservan solo el idioma y esta configuración. No se puede deshacer: descargue antes lo que necesite.</p><p>Lo que ya envió a un servicio externo no se borra desde aquí.</p>"]]}, "en": {"sellos": ["Does not ask for your name, ID, email or phone number", "No accounts, ads or trackers", "No data is sold"], "acc": [["📝", "Write things down in Muyuy", "no", "It does not leave your phone", "Your answers, prices, notebook and opinions stay here.", 0], ["🗺️", "See climate and maps", "si", "Your farm's point is sent", "It goes without your name to the climate, soil and map services, along with the phone's IP address.", 2], ["📍", "Use “My location”", "si", "The GPS point is sent", "GPS is used only if you tap that button, and the phone asks for permission. That point is used like one chosen on the map.", 1], ["💬", "Ask in the chat", "si", "Your question and a farm summary are sent", "They go encrypted to Supabase and from there to Groq or Z.ai, which generate the answer. Offline nothing is sent.", 3], ["📤", "Download or send by WhatsApp", "tu", "It leaves only if you do it", "Whoever receives it sees it, and WhatsApp handles it under its own rules.", 0]], "filas": [["📱 What stays on my phone?", "<p>Your answers, priorities, prices, notebook, season record, opinions, chosen farm and these settings. They are not stored on any Muyuy server; if you use the chat, a summary is sent (see “How is AI used?”).</p><p>They only leave the phone if you download a file or tap “Send by WhatsApp”: then whoever receives them sees them, and WhatsApp handles them under its own rules.</p>"], ["📍 What happens with my location?", "<ul><li>Muyuy works with the point you choose on the map or with “My location”. GPS is used only if you tap that button, and the phone asks for permission.</li><li>That point's coordinates are sent to the climate, soil and map services to bring their data.</li><li>Those requests do not carry your name, but they do carry the location and, as with any internet connection, the phone's technical IP address.</li></ul>"], ["🌐 Which services does Muyuy connect to?", "<ul><li><b>NASA</b> (Power, Gibs) and <b>ORNL</b> (Modis), United States: climate and satellite images.</li><li><b>Open-Meteo</b> (Switzerland): forecast, past climate and terrain height.</li><li><b>SoilGrids · Isric</b> (Netherlands): soil of the exact farm.</li><li><b>Esri</b> (United States): map images.</li><li><b>Render</b> (United States) hosts this site and <b>Cdnjs · Cloudflare</b> delivers some of the page's programs.</li><li>Each service applies its own rules.</li></ul>"], ["🤖 How is AI used?", "<ul><li><b>Chat:</b> when you send a question online, your question, the latest chat messages and a farm summary (place, altitude, slope, what you marked in step 2 and Muyuy's results) are sent over an encrypted connection.</li><li>They go through <b>Supabase</b> (a United States company, with servers in São Paulo, Brazil) to <b>Groq</b> (United States) or <b>Z.ai · Zhipu</b> (China), which generate the answer and apply their own policies.</li><li><b>Do not type</b> your name, ID, phone number or other people's data in the chat.</li><li>Offline nothing is sent: Muyuy answers with what it already knows about your farm.</li><li><b>AI can be wrong.</b> Check its answers against Muyuy's data, your experience or a technician.</li><li><b>Rotations and patterns:</b> calculated by an engine with agronomic models and NASA data, on the phone. “Patterns” use machine learning without sending anything. The chat AI does not calculate these results.</li><li><b>Voice:</b> the audio was generated beforehand with synthetic voices (Piper and Meta MMS) and comes inside the app.</li><li><b>Development:</b> the team used AI to help with code and translations. The Quechua is a draft that a speaker must review.</li></ul>"], ["🗄️ What does the server keep?", "<p>The chat server <b>does not store your questions or your IP</b>. To limit abuse it stores an encrypted summary of the IP with a question count, deleted from 2 days on. It also stores how many questions and words each model used that day, with no data on who asked.</p><p>To prevent abuse there is a limit on questions per minute and per day.</p>"], ["🗑️ How do I delete my data?", "<p>In Settings → “Delete my data”, what you wrote and chose on this phone is removed, along with the open chat. Only the language and these settings remain. This cannot be undone: download what you need first.</p><p>What was already sent to an outside service is not deleted from here.</p>"]]}};
// runasimi (borrador, 2026-11-14): antes la privacidad salía en castellano al elegir quechua
PRIV.qu = {"sellos": ["Manam sutiykita, DNI-ykita, correoykita nitaq teléfonoykita mañakunchu", "Mana cuentayuq, mana publicidadniyuq, mana qatipaqniyuq", "Manam willakuykunata rantikunchu"],
  "acc": [["📝", "Muyuypi qillqay", "no", "Manam celularniykimanta lluqsinchu", "Kutichiyniykikuna, chaniykikuna, qillqanayki, yuyayniykikunapas kaypi qhepan.", 0],
    ["🗺️", "Pachata mapakunatapas qhaway", "si", "Chakraykipa chiqannin lluqsin", "Mana sutiykiyuq pacha, allpa, mapa servicioman rin, celularpa IP direccionninwan kuska.", 2],
    ["📍", "«Maypi kasqay» apaykachay", "si", "GPS-pa marcasqan chiqan lluqsin", "GPS-qa chay botonta llamispallam apaykachakun, celulartaq licenciata mañakun. Chay chiqanqa mapapi akllasqa hinallataq apaykachakun.", 1],
    ["💬", "Chatpi tapuy", "si", "Tapuyniyki, chakraykipa pisichasqa willakuyninpas lluqsin", "Pakasqa Supabaseman rinku, chaymantataq Groq utaq Z.ai-man, paykunam kutichiyta ruwanku. Mana internetniyuq manam imapas lluqsinchu.", 3],
    ["📤", "Uraqachiy utaq WhatsAppwan kachay", "tu", "Qam ruwaqtillam lluqsin", "Chaskiqmi rikun, WhatsApptaq kikin kamachiyninkunaman hina apaykachan.", 0]],
  "filas": [["📱 ¿Imataq celularniypi qhepan?", "<p>Kutichiyniykikuna, munasqaykikuna, chaniykikuna, qillqanayki, tarpuy qillqasqayki, yuyayniykikuna, akllasqa chakrayki, kay allichaykunapas. Manam Muyuypa mayqin servidorninpipas waqaychakunchu; chatta apaykachaspaqa, huk pisichasqa willakuy rin («¿Imaynatataq IA apaykachakun?» qhaway).</p><p>Celularmanta lluqsinku huk archivota uraqachiqtiykilla utaq «WhatsAppwan kachay» llamiqtiykilla: chaypachaqa chaskiqmi rikun, WhatsApptaq kikin kamachiyninkunaman hina apaykachan.</p>"],
    ["📍 ¿Imataq maypi kasqaywan pasan?", "<ul><li>Muyuyqa mapapi akllasqayki chiqanwan utaq «Maypi kasqay» nisqawan llamk'an. GPS-qa chay botonta llamispallam apaykachakun, celulartaq licenciata mañakusunki.</li><li>Chay chiqanpa coordenadankuna pacha, allpa, mapa serviciokunaman kachakun, willakuyninkunata apamunanpaq.</li><li>Chay mañakuykunaqa manam sutiykita apankuchu, ichaqa chiqantam apanku, tukuy internet hinataq celularpa IP direccionninta.</li></ul>"],
    ["🌐 ¿Mayqin serviciokunawantaq Muyuy tinkukun?", "<ul><li><b>NASA</b> (Power, Gibs), <b>ORNL</b> (Modis) ima, Estados Unidosmanta: pacha, satélite rikchaykunapas.</li><li><b>Open-Meteo</b> (Suiza): pacha willakuy, ñawpaq pacha, allpapa altunpas.</li><li><b>SoilGrids · Isric</b> (Países Bajos): cheqaq chakrapa allpan.</li><li><b>Esri</b> (Estados Unidos): mapapa rikchaykunan.</li><li><b>Render</b> (Estados Unidos) kay webta rikuchin, <b>Cdnjs · Cloudflare</b> nisqataq paginapa wakin programankunata qun.</li><li>Sapa servicio kikin kamachiyninkunata apaykachan.</li></ul>"],
    ["🤖 ¿Imaynatataq IA apaykachakun?", "<ul><li><b>Chat:</b> internetwan huk tapuyta kachaspa, pakasqa tinkuywan tapuyniyki, chatpa qhipa rimayninkuna, chakraykipa pisichasqa willakuyninpas (chiqan, altun, wichay, 2-ñiqi pasopi marcasqayki, Muyuypa lluqsiyninkunapas) kachakun.</li><li>Chayqa <b>Supabase</b> nisqanta pasan (Estados Unidos empresa, São Paulo, Brasilpi servidorniyuq), <b>Groq</b> (Estados Unidos) utaq <b>Z.ai · Zhipu</b> (China) nisqakunaman chayan, paykunam kutichiyta ruwanku, kikin kamachiyninkunatataq apaykachanku.</li><li><b>Ama chatpi qillqaychu</b> sutiykita, DNI-ykita, teléfonoykita nitaq huk runakunapa willakuyninta.</li><li>Mana internetniyuq manam imapas kachakunchu: Muyuyqa chakraykimanta yachasqanwan kutichin.</li><li><b>IA-qa pantanmanmi.</b> Kutichiyninkunata Muyuypa willakuyninkunawan, yachasqaykiwan utaq huk técnicowan qhaway.</li><li><b>Muyuykuna, patronkunapas:</b> chakra yachaypa modelonkunawan NASA willakuykunawan huk motor celularpi yupan. «Patronkuna» mana imatapas kachaspa yachay makinawan llamk'anku. Chatpa IA-nqa manam chay lluqsiykunata yupanchu.</li><li><b>Kunka:</b> audiokunaqa ñawpaqtaña sintético kunkakunawan (Piper, Meta MMS) ruwasqa, apppa ukhunpi hamunku.</li><li><b>Ruwasqa:</b> llamk'aqkunaqa IA-ta apaykacharqanku códigopi traduccionkunapipas yanapananpaq. Runasimiqa borradormi, huk rimaq runa qhawananmi.</li></ul>"],
    ["🗄️ ¿Imatataq servidor waqaychan?", "<p>Chatpa servidorninqa <b>manam tapuyniykikunata nitaq IP-ykita waqaychanchu</b>. Mana allin apaykachayta hark'anapaq IP-pa pakasqa pisichasqanta tapuykunapa yupayninwan waqaychan, 2 p'unchawmanta pichakun. Sapa modelo p'unchawpi hayk'a tapuyta simitapas apaykachasqantapas waqaychan, mana pi tapusqanta yachaspa.</p><p>Mana allin apaykachayta hark'anapaq sapa minutopi sapa p'unchawpipas tapuykunapa tukukuynin kan.</p>"],
    ["🗑️ ¿Imaynatataq willakuyniykunata pichasaq?", "<p>Allichay → «Willakuyniykunata pichay» nisqapi kay celularmanta qillqasqaykita akllasqaykitapas, kichasqa chattapas pichan. Rimaylla kay allichaykunallapas qhepan. Manam kutichiyta atikunchu: necesitasqaykita ñawpaqta uraqachiy.</p><p>Hawa servicioman ñam kachasqaykiqa manam kaymanta pichakunchu.</p>"]]};
const AJUSTES = (() => {
  const KEY = "muyuy-ajustes", ATR = ["letra", "contraste", "legible"];
  const A = window.MUYUY_AJ || (window.MUYUY_AJ = {});
  const dlg = () => document.getElementById("ajustes");
  function aplicar() {
    try { localStorage.setItem(KEY, JSON.stringify(A)); } catch {}
    ATR.forEach((k) => { if (A[k]) document.documentElement.setAttribute("data-" + k, A[k]); else document.documentElement.removeAttribute("data-" + k); });
  }
  const sw = (k, t, s, on) => `<button type="button" class="aj-sw" role="switch" aria-checked="${on}" data-k="${k}"><span><b>${tr(t)}</b><small>${tr(s)}</small></span><i aria-hidden="true"></i></button>`;
  function pintar() {
    const d = dlg(), letra = A.letra || 0, vel = A.voz || "normal";
    d.innerHTML = `<header class="aj-h"><h2 id="cfgTit">${tr("cfgT")}</h2><button type="button" class="aj-x" aria-label="${tr("cfgCerrar")}">✕</button></header>
      <p class="aj-s">${tr("cfgS")}</p>
      <section><h3>${tr("cfgVer")}</h3>
        <p class="aj-l">${tr("cfgLetra")}</p>
        <div class="aj-letras" role="group" aria-label="${tr("cfgLetra")}">${[0, 1, 2, 3].map((n) => `<button type="button" data-letra="${n}" aria-pressed="${n === +letra}"><b style="font-size:${1 + n * 0.25}rem">A</b><small>${tr("cfgL" + n)}</small></button>`).join("")}</div>
        ${sw("contraste", "cfgContraste", "cfgContrasteS", !!A.contraste)}${sw("legible", "cfgLegible", "cfgLegibleS", !!A.legible)}</section>
      <section><h3>${tr("cfgOir")}</h3>
        <p class="aj-l">${tr("cfgVel")}</p>
        <div class="aj-vel" role="group" aria-label="${tr("cfgVel")}">${["lenta", "normal", "rapida"].map((v) => `<button type="button" data-vel="${v}" aria-pressed="${v === vel}">${tr("cfgV_" + v)}</button>`).join("")}</div>
        <button type="button" class="btn-sec aj-prueba">${tr("cfgProbar")}</button>
        ${sw("leer", "cfgLeer", "cfgLeerS", !!A.leer)}</section>
      <section><h3>${tr("cfgPrivT")}</h3><button type="button" class="aj-sw aj-priv"><span><b>${tr("cfgPrivBtn")}</b><small>${tr("cfgPrivS")}</small></span><span aria-hidden="true">›</span></button></section>
      <section><h3>${tr("cfgMis")}</h3><div class="aj-acc"><button type="button" class="btn-sec aj-rest">${tr("cfgRest")}</button><button type="button" class="btn-sec aj-borrar">${tr("cfgBorrar")}</button></div></section>
      <button type="button" class="aj-listo">${tr("cfgListo")}</button>`;
    d.querySelector(".aj-x").onclick = d.querySelector(".aj-listo").onclick = () => d.close();
    d.querySelectorAll(".aj-letras button").forEach((b) => (b.onclick = () => { A.letra = +b.dataset.letra || 0; aplicar(); pintar(); }));
    d.querySelectorAll(".aj-vel button").forEach((b) => (b.onclick = () => { A.voz = b.dataset.vel === "normal" ? 0 : b.dataset.vel; aplicar(); pintar(); }));
    d.querySelectorAll(".aj-sw[data-k]").forEach((b) => (b.onclick = () => {
      const k = b.dataset.k;
      A[k] = A[k] ? 0 : 1;
      aplicar();
      const y = d.scrollTop; pintar(); d.scrollTop = y;
    }));
    d.querySelector(".aj-priv").onclick = pintarPrivacidad;
    d.querySelector(".aj-prueba").onclick = (e) => { if (typeof sayText === "function") sayText(tr("cfgProbarTxt"), e.currentTarget); };
    d.querySelector(".aj-rest").onclick = () => {
      Object.keys(A).forEach((k) => delete A[k]);
      aplicar();
      if (typeof renderMini === "function") renderMini();
      pintar();
      if (typeof toast === "function") toast(tr("cfgRestOk"));
    };
    d.querySelector(".aj-borrar").onclick = (e) => { // borrar sigue pidiendo confirmación: no se puede deshacer
      const acc = e.currentTarget.parentElement;
      acc.innerHTML = `<p class="aj-conf">${tr("cuConfX")}</p><button type="button" class="btn-sec aj-no">${tr("cuConfNo")}</button><button type="button" class="aj-si">${tr("cuConfSi")}</button>`;
      acc.querySelector(".aj-no").onclick = () => { const y = d.scrollTop; pintar(); d.scrollTop = y; };
      acc.querySelector(".aj-si").onclick = () => document.getElementById("cuConfSi").click();
      acc.querySelector(".aj-no").focus();
    };
  }
  function pintarPrivacidad() {
    const d = dlg(), P = PRIV[LANG] || PRIV.es;
    d.innerHTML = `<header class="aj-h"><h2 id="cfgTit">${tr("cfgPrivT")}</h2><button type="button" class="aj-x" aria-label="${tr("cfgCerrar")}">✕</button></header>
      <ul class="pv-sellos">${P.sellos.map((t) => `<li>${t}</li>`).join("")}</ul>
      <h3 class="pv-t">${tr("cfgPrivSalT")}</h3>
      <p class="aj-l">${tr("cfgPrivSalS")}</p>
      <div class="pv-acc" role="group" aria-label="${tr("cfgPrivSalT")}">${P.acc.map(([ic, t], i) => `<button type="button" data-i="${i}" aria-pressed="${!i}"><span aria-hidden="true">${ic}</span>${t}</button>`).join("")}</div>
      <div class="pv-res" aria-live="polite"></div>
      <h3 class="pv-t">${tr("cfgPrivMas")}</h3>
      <div class="aj-pv">${P.filas.map(([t, c]) => `<details class="le-sec"><summary>${t}</summary><div>${c}</div></details>`).join("")}</div>
      <p class="aj-s pv-ver">${tr("cfgPrivV")}</p>
      <button type="button" class="aj-listo aj-volver">${tr("cfgVolver")}</button>`;
    const filas = [...d.querySelectorAll(".aj-pv details")], res = d.querySelector(".pv-res");
    const abrir = (f) => { f.open = true; f.scrollIntoView({ block: "start", behavior: REDUCED ? "auto" : "smooth" }); };
    const elegir = (i) => {
      const [, , est, tit, txt, ir] = P.acc[i];
      d.querySelectorAll(".pv-acc button").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.i === i));
      res.className = "pv-res pv-" + est;
      res.innerHTML = `<b>${tit}</b><p>${txt}</p><button type="button" class="pv-ver-mas">${tr("cfgPrivVerMas")}</button>`;
      res.querySelector("button").onclick = () => abrir(filas[ir]);
    };
    d.querySelectorAll(".pv-acc button").forEach((b) => (b.onclick = () => elegir(+b.dataset.i)));
    filas.forEach((f) => f.addEventListener("toggle", () => { if (f.open) filas.forEach((o) => { if (o !== f) o.open = false; }); })); // una sola abierta: no se pierde en el texto
    elegir(0);
    d.querySelector(".aj-x").onclick = () => d.close();
    d.querySelector(".aj-volver").onclick = () => { pintar(); d.scrollTop = 0; };
    d.scrollTop = 0;
  }
  document.addEventListener("click", (e) => {
    if (e.target.closest && e.target.closest("#verAjustes")) { pintar(); dlg().showModal(); dlg().scrollTop = 0; }
    else if (e.target === dlg()) dlg().close(); // toque fuera de la ventana
  });
  return { aplicar };
})();

Object.assign(I18N.es, { atrasPortada: "Volver a la portada", cfgPrivSalT: "¿Qué sale de su teléfono?", cfgPrivSalS: "Toque lo que quiere hacer.", cfgPrivMas: "Más detalle", cfgPrivVerMas: "Ver detalle ›" });
Object.assign(I18N.en, { atrasPortada: "Back to the cover", cfgPrivSalT: "What leaves your phone?", cfgPrivSalS: "Tap what you want to do.", cfgPrivMas: "More detail", cfgPrivVerMas: "See detail ›" });

// la portada lleva directo al mapa: el botón dice exactamente eso
Object.assign(I18N.es, { spGo: "📍 Elegir mi chacra en el mapa", spAbriendo: "Abriendo el mapa…" });
Object.assign(I18N.en, { spGo: "📍 Choose my farm on the map", spAbriendo: "Opening the map…" });
if (I18N.qu.wElegir) I18N.qu.spGo = I18N.qu.wElegir;

Object.assign(I18N.es, { pickZona: "✔ Ver mi zona (rápido)", pickExactoCorto: "🛰️ Mi punto exacto (preciso)", pickLeyenda: "Ver leyenda", pickGpsBusca: "⏳ Buscando su ubicación…", pickAviso: "⚠ Ese punto queda lejos o a otra altura. Para ver su chacra, use «Mi punto exacto»." });
Object.assign(I18N.en, { pickZona: "✔ See my area (fast)", pickExactoCorto: "🛰️ My exact point (precise)", pickLeyenda: "Show legend", pickGpsBusca: "⏳ Finding your location…", pickAviso: "⚠ That point is far away or at another altitude. To see your farm, use «My exact point»." });
Object.assign(I18N.es, { leyLimDep: "Departamento", leyLimProv: "Provincia", leyLimDist: "Límite distrital" });
Object.assign(I18N.en, { leyLimDep: "Department", leyLimProv: "Province", leyLimDist: "District border" });
Object.assign(I18N.qu, { leyLimDep: "Departamento", leyLimProv: "Provincia", leyLimDist: "Límite distrital" });
Object.assign(I18N.qu, { pickZona: "✔ Llaqtayta qhaway (utqaylla)", pickExactoCorto: "🛰️ Chiqan puntuyta yupay", pickLeyenda: "Leyendata qhaway", pickGpsBusca: "⏳ Maypi kasqaykita maskachkan…", pickAviso: "⚠ Chay puntuqa karupim utaq huk altupim. Chakraykita rikunaykipaq, chiqan puntuykita yupay." });
// paso 1: el suelo y la pendiente en palabras; los números quedan en Información extra
Object.assign(I18N.es, { sue_arcilla: "Arcilloso: guarda agua, pero se encharca", sue_arena: "Arenoso: suelto, se seca rápido", sue_mezcla: "Mezcla de arena y arcilla",
  ph1: "Muy ácido", ph2: "Ácido", ph3: "Poco ácido", ph4: "Ni ácido ni alcalino", ph5: "Poco alcalino", ph6: "Alcalino",
  mo1: "Poca materia orgánica", mo2: "Materia orgánica regular", mo3: "Bastante materia orgánica",
  pendT0: "Plana", pendT1: "Suave", pendT2: "Media", pendT3: "Fuerte", pendCuide: "cuide la erosión",
  ahTopMas: "Ver más →", leCifras: "📏 Los números de su chacra", cfArena: "Arena", cfArcilla: "Arcilla", cfMo: "Materia orgánica", cfPh: "Acidez (pH)", cfPend: "Pendiente" });
Object.assign(I18N.en, { sue_arcilla: "Clayey: holds water, but gets waterlogged", sue_arena: "Sandy: loose, dries fast", sue_mezcla: "Mix of sand and clay",
  ph1: "Very acidic", ph2: "Acidic", ph3: "Slightly acidic", ph4: "Neither acidic nor alkaline", ph5: "Slightly alkaline", ph6: "Alkaline",
  mo1: "Little organic matter", mo2: "Average organic matter", mo3: "Plenty of organic matter",
  pendT0: "Flat", pendT1: "Gentle", pendT2: "Medium", pendT3: "Steep", pendCuide: "watch erosion",
  ahTopMas: "See more →", leCifras: "📏 Your farm's numbers", cfArena: "Sand", cfArcilla: "Clay", cfMo: "Organic matter", cfPh: "Acidity (pH)", cfPend: "Slope" });
Object.assign(I18N.qu, { sue_arcilla: "Llinki allpa", sue_arena: "Aqu allpa", sue_mezcla: "Aqu llinkiwan chaqrusqa",
  pendT0: "Pampa", pendT1: "Pisi wichay", pendT2: "Wichay", pendT3: "Sinchi wichay", pendCuide: "allpata waqaychay",
  ahTopMas: "Astawan qhaway →", leCifras: "📏 Chakraykiq yupayninkuna", cfArena: "Aqu", cfArcilla: "Llinki", cfPend: "Wichay" });
Object.assign(I18N.es, { miChacraT: "Mi chacra", cambiar: "Cambiar", mcCerca: "Cerca de {d} ({p})" });
Object.assign(I18N.en, { miChacraT: "My farm", cambiar: "Change", mcCerca: "Near {d} ({p})" });
Object.assign(I18N.qu, { miChacraT: "Chakray", cambiar: "Tikray", mcCerca: "{d} ({p}) qayllapi" });
// paso 2: qué hará Muyuy con lo que eligió; «Le limita» en filas que muestran la respuesta
Object.assign(I18N.es, { prioAjT: "🎚️ Ajustar a mi gusto", conf_preEq: "Muyuy buscará un equilibrio entre agua, venta, suelo y cosecha segura.", conf_preAgua: "Muyuy pondrá primero lo que gasta poca agua y aguanta la sequía.", conf_preIng: "Muyuy pondrá primero lo que puede dejarle más ingreso.", conf_preSuelo: "Muyuy pondrá primero lo que cuida su tierra.", conf_preRiesgo: "Muyuy pondrá primero lo que aguanta los años malos.", conf_mi: "Muyuy usará su propio ajuste.",
  rsExclTodos: "Puede sembrar todos", rsAguaDicho: "Ya lo contó en la entrevista. Si cambió, elija aquí." });
Object.assign(I18N.en, { prioAjT: "🎚️ Adjust to my liking", conf_preEq: "Muyuy will look for a balance between water, sales, soil and a safe harvest.", conf_preAgua: "Muyuy will put first what uses little water and withstands drought.", conf_preIng: "Muyuy will put first what can bring you more income.", conf_preSuelo: "Muyuy will put first what cares for your soil.", conf_preRiesgo: "Muyuy will put first what withstands bad years.", conf_mi: "Muyuy will use your own setting.",
  rsExclTodos: "You can grow them all", rsAguaDicho: "You already told us in the interview. If it changed, choose here." });
Object.assign(I18N.qu, { prioAjT: "🎚️ Munasqayman allichay", conf_preEq: "Muyuyqa yakuta, rantikuyta, allpata, rurutapas kuskachanqa.", conf_preAgua: "Muyuyqa ñawpaqta pisi yakuta apaykachaqta rikuchinqa.", conf_preIng: "Muyuyqa ñawpaqta aswan qullqi quqta rikuchinqa.", conf_preSuelo: "Muyuyqa ñawpaqta allpata waqaychaqta rikuchinqa.", conf_preRiesgo: "Muyuyqa ñawpaqta millay watata aguantaqta rikuchinqa.", conf_mi: "Muyuyqa munasqaykita apaykachanqa.",
  rsExclTodos: "Llapanta tarpuyta atinki", rsAguaDicho: "Tapuypi ñam willawarqanki. Tikrakuqtinqa kaypi akllay." });
// paso 3: lo que vivió en los años recordados, dinero con cautela y calendario con su conclusión primero
Object.assign(I18N.es, { memAsi: "¿Así le fue?", memNo: "Confíe en lo que vivió: este cálculo no lo vio.", rPierdeS: "Ojo: con sus precios podría perder", vPierdeS: "con sus precios podría perder S/ {v} por ha al año",
  caCamp: "Campaña {n}", caCampH: "Camp.", caConcl0: "✅ No vemos meses delicados para estos cultivos.", caConcl1: "⚠ Mes delicado: {x}", caConclN: "⚠ Meses delicados: {x}", caVaciaTot: "🍂 Su chacra queda vacía {n} meses en estas 3 campañas." });
Object.assign(I18N.en, { memAsi: "Is that how it went?", memNo: "Trust what you lived: this calculation did not see it.", rPierdeS: "Careful: at your prices it could lose money", vPierdeS: "at your prices it could lose S/ {v} per ha per year",
  caCamp: "Season {n}", caCampH: "Season", caConcl0: "✅ We see no sensitive months for these crops.", caConcl1: "⚠ Sensitive month: {x}", caConclN: "⚠ Sensitive months: {x}", caVaciaTot: "🍂 Your field stays empty {n} months over these 3 seasons." });
Object.assign(I18N.qu, { hoyMemS: "★ nisqawan hanaqpi kachkan. Muyuyqa NASA paratawan qasatawan yupan: manam mayu lluqsiyta rikunchu. ¿Chhaynachu karqan?", memAsi: "¿Chhaynachu karqan?", memNo: "Kawsasqaykiman hapipakuy: kay yupayqa manam rikurqanchu.",
  caCamp: "Tarpuy {n}", caCampH: "Tarpuy", caConcl1: "⚠ Sasa killa: {x}", caConclN: "⚠ Sasa killakuna: {x}", caVaciaTot: "🍂 Chakraykiqa {n} killa ch'usaqmi kay kimsa tarpuypi." });
// paso 4: su cultivo principal, ganancia con cautela, pronóstico en una fila y cifras en palabras
Object.assign(I18N.es, { ensoCorto: "Se prevé: {fase}", resRef: "con precios de referencia", resBaseSin: "La opción 1 no lleva {c}.", resBaseVer: "Ver opciones con {c}", resBaseSolo: "Solo se muestran opciones con {c}.", resBaseTodas: "Ver todas", paEroMenos: "Se pierde cerca de {p} % menos tierra con la lluvia.", paEroMas: "Se pierde cerca de {p} % más tierra con la lluvia." });
Object.assign(I18N.en, { ensoCorto: "Forecast: {fase}", resRef: "at reference prices", resBaseSin: "Option 1 does not include {c}.", resBaseVer: "See options with {c}", resBaseSolo: "Only options with {c} are shown.", resBaseTodas: "See all", paEroMenos: "About {p} % less soil is lost to rain.", paEroMas: "About {p} % more soil is lost to rain." });
Object.assign(I18N.qu, { ensoCorto: "Suyakun: {fase}", resRef: "yuyaykusqa chanikunawan", resBaseSin: "Kay atikuypi {c} mana kanchu.", resBaseVer: "{c}-yuq atikuykunata qhaway", resBaseSolo: "{c}-yuq atikuykunallam rikukun.", resBaseTodas: "Llapanta qhaway", paEroMenos: "{p} % pisiyta allpa chinkan parawan.", paEroMas: "{p} % astawan allpa chinkan parawan." });
// paso 4: lo principal de «Aquí manda su criterio»; la lista completa está en Información extra
Object.assign(I18N.es, { scCorto: "<b>Heladas y lluvia:</b> usted sabe dónde caen en su chacra.", scCortoLl: "<b>Lluvia:</b> usted sabe cómo cae en su chacra.", scPrecioCorto: "<b>Precios:</b> Muyuy usa precios de referencia. Ponga los de su feria en el paso 2.", scVer: "Ver todo lo que Muyuy no sabe →", leNoVe: "Lo que Muyuy no ve de su chacra" });
Object.assign(I18N.en, { scCorto: "<b>Frost and rain:</b> you know where they fall on your farm.", scCortoLl: "<b>Rain:</b> you know how it falls on your farm.", scPrecioCorto: "<b>Prices:</b> Muyuy uses reference prices. Enter your market's prices in step 2.", scVer: "See everything Muyuy does not know →", leNoVe: "What Muyuy cannot see on your farm" });
Object.assign(I18N.qu, { scCorto: "<b>Qasa, para ima:</b> qanmi yachanki chakraykipi maypi urmasqanta.", scCortoLl: "<b>Para:</b> qanmi yachanki chakraykipi imayna urmasqanta.", scPrecioCorto: "<b>Chanikuna:</b> Muyuyqa yuyaykusqa chanikunawan yupan. Feriaykiq chaninkunata 2 pasopi churay.", scVer: "Muyuy mana yachasqanta llapanta qhaway →", leNoVe: "Muyuy chakraykipi mana rikusqan" });
// paso 5: primero la respuesta
Object.assign(I18N.es, { vNum: "Funciona {n} de 10 años", vHoyNum: "Lo que siembra hoy: {h} de 10", vEsHoy: "Es lo que siembra hoy.", cuDetalle: "Ver el detalle de esta rotación", rFamOk3: "{a}, {b} y {c} cambian de familia cada campaña: las plagas no pasan de uno a otro." });
Object.assign(I18N.en, { vNum: "It works {n} of 10 years", vHoyNum: "What you sow today: {h} of 10", vEsHoy: "This is what you sow today.", cuDetalle: "See this rotation's details", rFamOk3: "{a}, {b} and {c} change family each season: pests do not pass between them." });
Object.assign(I18N.qu, { vNum: "Chunkamanta {n} wata allin", vHoyNum: "Kunan tarpusqayki: {h}/10", vEsHoy: "Kayqa kunan tarpusqaykim.", cuDetalle: "Kay muyuypa astawan rikuy", rFamOk3: "{a}, {b}, {c} ima sapa tarpuypi ayllunta tikranku: kurukuna manam rinkuchu." });
Object.assign(I18N.es, { phNota: "(no entra en el cálculo)" });
Object.assign(I18N.en, { phNota: "(not used in the calculation)" });
Object.assign(I18N.qu, { phNota: "(manam yupaypi kanchu)" });
// paso 6: aviso, unidades del agricultor y cuaderno
Object.assign(I18N.es, { cierreAviso: "Esto es para después de la cosecha. Hoy no tiene que llenar nada.", cFaltaComo: "Primero toque cómo le fue.", cNoVendi: "No vendí", qPrecioU: "¿A cuánto vendió? (S/ por {u}, opcional)", cEq: "Se guarda como unos {v} kg.", cU_kg: "kg", cU_arroba: "arroba (11,5 kg)", cU_quintal: "quintal (46 kg)", cU_saco: "saco (≈ 50 kg)", cN_kg: "kg", cN_arroba: "arroba", cN_quintal: "quintal", cN_saco: "saco", cuDet: "Agregar cantidad o nota" });
Object.assign(I18N.en, { cierreAviso: "This is for after the harvest. You do not have to fill in anything today.", cFaltaComo: "First tap how it went.", cNoVendi: "I did not sell", qPrecioU: "What price did you sell at? (S/ per {u}, optional)", cEq: "Saved as about {v} kg.", cU_kg: "kg", cU_arroba: "arroba (11.5 kg)", cU_quintal: "quintal (46 kg)", cU_saco: "sack (≈ 50 kg)", cN_kg: "kg", cN_arroba: "arroba", cN_quintal: "quintal", cN_saco: "sack", cuDet: "Add amount or note" });
Object.assign(I18N.qu, { cierreAviso: "Kayqa allay qhipapaqmi. Kunanqa manam imatapas qillqanaykichu.", cFaltaComo: "Ñawpaqta imayna karqanta llamiy.", cNoVendi: "Manam rantikurqanichu", qPrecioU: "Hayk'apitaq rantikurqanki? (S/ {u})", cEq: "{v} kg hina waqaychakun.", cuDet: "Hayk'a, willay ima yapay" });
// entrevista: la tierra por cómo se siente en la mano
Object.assign(I18N.es, { ePuno: "Moje un puñado de tierra y apriételo en la mano:", ePuno_arenosa: "Se desarma al abrir la mano", ePuno_franca: "Forma una bola que se agrieta", ePuno_negra: "Es oscura, suelta y huele a tierra de monte", ePuno_arcillosa: "Forma una cinta larga y pegajosa" });
Object.assign(I18N.en, { ePuno: "Wet a handful of soil and squeeze it:", ePuno_arenosa: "It falls apart when you open your hand", ePuno_franca: "It forms a ball that cracks", ePuno_negra: "It is dark, loose and smells like forest soil", ePuno_arcillosa: "It forms a long, sticky ribbon" });
Object.assign(I18N.qu, { ePuno: "Huk hapt'a allpata unuchiy, makiykipi ch'irway:", ePuno_arenosa: "Makita kichaqtin ch'aqchukun", ePuno_franca: "Rumpu hina kan, rachikun", ePuno_negra: "Yana, ch'aqchu, sacha allpa hina asnan", ePuno_arcillosa: "Suni k'aspi hina, k'apchi" });
// arroz de riego: Muyuy no lo calcula y lo dice
Object.assign(I18N.es, { eArrozFuera: "el arroz de riego no está en el cálculo de Muyuy", hoyArroz: "El arroz de riego (en poza) no está en el cálculo de Muyuy: gasta mucha más agua de la que Muyuy puede simular y suele sembrarse cada año. Le mostramos qué otras opciones tiene su chacra en el paso 4. Sobre el arroz, consulte al técnico de su zona." });
Object.assign(I18N.en, { eArrozFuera: "irrigated rice is not in Muyuy's calculation", hoyArroz: "Irrigated (paddy) rice is not in Muyuy's calculation: it uses much more water than Muyuy can simulate and is usually sown every year. Step 4 shows the other options for your farm. For rice, ask your local technician." });
Object.assign(I18N.qu, { eArrozFuera: "qarpasqa arrozqa manam Muyuypa yupayninpichu", hoyArroz: "Qarpasqa arrozqa manam Muyuypa yupayninpichu: ancha yakuta munan. 4 pasopi huk akllaykunata qhaway. Arrozmantaqa llaqtaykipi técnicota tapuy." });
// cultivos que casi no se siembran en la región (Midagri, anuarios 2021-2023)
Object.assign(I18N.es, { rsRegNota: "Apagados porque casi no se siembran en {d} (Midagri, 2021-2023): {c}. Si usted sí los siembra, tóquelos.", rRegion: "{c} casi no se siembra en {d} (Midagri, 2021-2023): consiga semilla y comprador antes de probarlo." });
Object.assign(I18N.en, { rsRegNota: "Turned off because they are hardly grown in {d} (Midagri, 2021-2023): {c}. If you do grow them, tap them.", rRegion: "{c} is hardly grown in {d} (Midagri, 2021-2023): find seed and a buyer before trying it." });
Object.assign(I18N.qu, { rsRegNota: "{d}-pi manam tarpukunchu (Midagri, 2021-2023): {c}. Qan tarpuspaqa llamiy.", rRegion: "{c}-qa {d}-pi manam tarpukunchu: ñawpaqta muhuta, rantiqtapas maskay." });
// coordenadas y lugares guardados (recomendación de Aponte)
Object.assign(I18N.es, { pickCorT: "📌 Pegar o escribir coordenadas", pickCorIr: "Ir", pickCorS: "Pegue lo que copia de Google Maps, con todas sus cifras, o escriba latitud y longitud.", pickCorMal: "No entendí esas coordenadas. Escríbalas así: -13.39, -72.05", pickFavGuardar: "⭐ Guardar este lugar", pickFavListo: "✔ Guardado", pickFavQuitar: "Quitar" });
Object.assign(I18N.en, { pickCorT: "📌 Paste or type coordinates", pickCorIr: "Go", pickCorS: "Paste what you copy from Google Maps, with all its digits, or type latitude and longitude.", pickCorMal: "I could not read those coordinates. Write them like this: -13.39, -72.05", pickFavGuardar: "⭐ Save this place", pickFavListo: "✔ Saved", pickFavQuitar: "Remove" });
Object.assign(I18N.qu, { pickCorT: "📌 Coordenadata qillqay", pickCorIr: "Riy", pickCorS: "Latitud, longitud, comawan utaq ch'usaqwan rakisqa.", pickCorMal: "Manam hamut'anichu. Kay hinata qillqay: -13.39, -72.05", pickFavGuardar: "⭐ Kay chiqanta waqaychay", pickFavListo: "✔ Waqaychasqa", pickFavQuitar: "Qichuy" });
// análisis de suelo (recomendación de Aponte). Rangos: INIA (2024), Manual para el análisis de suelos agrícolas y agua para riego, Tabla 20
Object.assign(I18N.es, { labT: "🧪 Tengo un análisis de suelo", labS: "Escriba lo que dice su análisis; deje vacío lo que no tenga. Se guarda solo en este teléfono.",
  labPh: "pH", labMo: "Materia orgánica (%)", labP: "Fósforo disponible (ppm)", labK: "Potasio disponible (ppm)", labCe: "Conductividad eléctrica (mS/cm)", labAr: "Arena (%)", labAc: "Arcilla (%)", labFecha: "Fecha del análisis",
  labGuardar: "💾 Guardar y volver a calcular", labVacio: "Escriba al menos un valor.", labListo: "Listo: Muyuy calculó con su análisis.", labSinCalc: "Guardado. En este lugar Muyuy no puede volver a calcular.", labQuitar: "Quitar este análisis",
  labRes: "Lo que dice su análisis", labHist: "Sus análisis", labSube: "{k}: subió de {a} a {b}", labBaja: "{k}: bajó de {a} a {b}", labFuente: "Rangos: INIA (2024), Manual para el análisis de suelos agrícolas y agua para riego, tabla 20. Es orientación general, sin dosis: confirme con un técnico o con su laboratorio.", labCalc: "La textura y la materia orgánica entran en el cálculo. El pH, el fósforo, el potasio y las sales no: orientan el abonado.", labSuelo: "Suelo (su análisis)",
  labBajo: "bajo", labMedio: "medio", labAlto: "alto",
  ph_1: "Extremadamente ácido", ph_2: "Muy fuertemente ácido", ph_3: "Fuertemente ácido", ph_4: "Moderadamente ácido", ph_5: "Ligeramente ácido", ph_6: "Neutro", ph_7: "Ligeramente alcalino", ph_8: "Moderadamente alcalino", ph_9: "Fuertemente alcalino", ph_10: "Muy fuertemente alcalino",
  ce_1: "Sin peligro de sales", ce_2: "Peligro de sales", ce_3: "Fuertemente salino",
  rcPhA: "Considere encalar con cal agrícola: la cantidad depende del análisis y del cultivo.", rcPhL: "Revise qué cultivos lo toleran bien.", rcPhB: "Agregar materia orgánica ayuda; en estos suelos algunos micronutrientes están menos disponibles.",
  rcMo: "Considere estiércol, compost, rastrojo o un abono verde.", rcP: "Considere guano de isla, roca fosfórica o compost.", rcK: "Considere compost, ceniza de madera o un abono con potasio.", rcCe: "Si tiene agua, mejore el drenaje y lave las sales con riego; prefiera cultivos que las toleren." });
Object.assign(I18N.en, { labT: "🧪 I have a soil analysis", labS: "Enter what your analysis says; leave blank what you do not have. Saved only on this phone.",
  labPh: "pH", labMo: "Organic matter (%)", labP: "Available phosphorus (ppm)", labK: "Available potassium (ppm)", labCe: "Electrical conductivity (mS/cm)", labAr: "Sand (%)", labAc: "Clay (%)", labFecha: "Date of the analysis",
  labGuardar: "💾 Save and recalculate", labVacio: "Enter at least one value.", labListo: "Done: Muyuy calculated with your analysis.", labSinCalc: "Saved. Muyuy cannot recalculate for this place.", labQuitar: "Remove this analysis",
  labRes: "What your analysis says", labHist: "Your analyses", labSube: "{k}: rose from {a} to {b}", labBaja: "{k}: fell from {a} to {b}", labFuente: "Ranges: INIA (2024), Manual for the analysis of agricultural soils and irrigation water, table 20. General guidance, no doses: confirm with a technician or your laboratory.", labCalc: "Texture and organic matter enter the calculation. pH, phosphorus, potassium and salts do not: they guide fertilization.", labSuelo: "Soil (your analysis)",
  labBajo: "low", labMedio: "medium", labAlto: "high",
  ph_1: "Extremely acidic", ph_2: "Very strongly acidic", ph_3: "Strongly acidic", ph_4: "Moderately acidic", ph_5: "Slightly acidic", ph_6: "Neutral", ph_7: "Slightly alkaline", ph_8: "Moderately alkaline", ph_9: "Strongly alkaline", ph_10: "Very strongly alkaline",
  ce_1: "No salt hazard", ce_2: "Salt hazard", ce_3: "Strongly saline",
  rcPhA: "Consider liming with agricultural lime: the amount depends on the analysis and the crop.", rcPhL: "Check which crops tolerate it well.", rcPhB: "Adding organic matter helps; some micronutrients are less available in these soils.",
  rcMo: "Consider manure, compost, crop residue or a green manure.", rcP: "Consider guano, rock phosphate or compost.", rcK: "Consider compost, wood ash or a potassium fertilizer.", rcCe: "If you have water, improve drainage and leach the salts with irrigation; prefer tolerant crops." });
Object.assign(I18N.qu, { labT: "🧪 Allpa qhawasqayuqmi kani", labS: "Qhawasqaykipi kaqta qillqay; mana kaqtaqa ch'usaqta saqiy. Kay celularllapim waqaychakun.", labGuardar: "💾 Waqaychay, hukmanta yupay", labRes: "Qhawasqayki ima nin", labHist: "Qhawasqaykikuna", labBajo: "pisi", labMedio: "chawpi", labAlto: "hatun", labVacio: "Huk yupayllatapas qillqay.", labListo: "Ñam: Muyuyqa qhawasqaykiwan yuparqan.", labQuitar: "Kayta qichuy" });
// revisión de realismo: el saco no pesa siempre igual; los años marcados son de registros, no de una encuesta en su comunidad
Object.assign(I18N.es, { cU_saco: "saco (diga cuántos kg)", cSacoQ: "¿Cuántos kg pesa su saco?", cFaltaSaco: "Escriba cuántos kilos pesa su saco.", recLeyenda: "★ años difíciles registrados en su región", hoyMemT: "Años difíciles en su región", ayudaHoy: "Mire cómo le habría ido a lo que siembra hoy en los años difíciles registrados en su región.", t_memoria: "Paso 3. Así le habría ido a lo que siembra hoy en los años difíciles de su región.",
  antSup_sierra: "uno de los más sembrados en la sierra", antSup_costa: "uno de los más sembrados en la costa", antSup_selva: "uno de los más sembrados en la selva" });
Object.assign(I18N.en, { cU_saco: "sack (say how many kg)", cSacoQ: "How many kg does your sack weigh?", cFaltaSaco: "Enter how many kilos your sack weighs.", recLeyenda: "★ hard years on record in your region", hoyMemT: "Hard years in your region", ayudaHoy: "See how what you sow today would have done in the hard years on record in your region.", t_memoria: "Step 3. How what you sow today would have done in the hard years of your region.",
  antSup_sierra: "one of the most sown crops in the Andes", antSup_costa: "one of the most sown crops on the coast", antSup_selva: "one of the most sown crops in the Amazon" });
Object.assign(I18N.qu, { cU_saco: "costal (hayk'a kilo kasqanta niy)", cSacoQ: "Costalniyki hayk'a kilotaq?", cFaltaSaco: "Costalniyki hayk'a kilo kasqanta qillqay.", recLeyenda: "★ llaqtaykipi sasa watakuna", hoyMemT: "Llaqtaykipi sasa watakuna" });
// fases de la luna y referencias por tema en Información extra
Object.assign(I18N.es, { leLuna: "🌙 La luna y la chacra", leRefClima: "📚 Referencias: clima y satélites", leRefRot: "📚 Referencias: rotaciones y cultivos", leRefLeer: "📚 Referencias: números, suelo y decisiones", refVer: "Ver",
  lunaF0: "Luna nueva", lunaF1: "Luna creciente", lunaF2: "Cuarto creciente", lunaF3: "Creciente, casi llena", lunaF4: "Luna llena", lunaF5: "Menguante, recién pasada la llena", lunaF6: "Cuarto menguante", lunaF7: "Luna menguante", lunaFL: "Luna llena en unos {n} días", lunaFN: "Luna nueva en unos {n} días",
  lunaSaberT: "Lo que se cuenta en el campo", lunaS1: "<b>Siembra:</b> según una recopilación peruana, lo que da arriba del suelo se siembra de cuarto creciente a pocos días de la luna llena, y lo que da abajo, entre luna nueva y cuarto creciente. Otros prefieren sembrar raíces y tubérculos en menguante.", lunaS2: "<b>Poda:</b> las opiniones cambian. Unos podan en menguante para perder menos savia; otros, entre luna nueva y creciente para que rebrote más.", lunaS3: "<b>Cosecha:</b> hay quienes prefieren la luna llena para cosechar granos.",
  lunaCienT: "Lo que dice la ciencia", lunaC1: "Una revisión científica del 2020 no halló evidencia confiable de que las fases de la luna cambien el crecimiento de las plantas. Por eso la luna no entra en el cálculo de Muyuy.", lunaC2: "Es un saber heredado que vale escuchar y que cambia entre comunidades: pregunte a los mayores de la suya. Si sigue la luna, elija el día dentro de la ventana de siembra y de lluvias.",
  refA: "Clima y satélites", refB: "El Niño y los años difíciles", refC: "Rotación y descanso", refD: "Agua y cultivos", refE: "La luna", refF: "Rendimientos, precios y costos", refG: "Suelo y erosión", refH: "Cómo presentar la información al agricultor",
  refNasa: "Muyuy usa datos públicos de la NASA. La NASA no revisó ni respalda esta app.", refEco: "Rendimiento y precio: promedio 2021-23 del Midagri, mediana de las regiones de cada zona. Costo: encuesta del INEI del 2018, sin el arriendo de la tierra y llevado a precios recientes (× 1,18); incluye jornales pagados. Algunos cultivos no tienen dato propio: su costo sale de uno parecido. El maní, la soya, la mucuna y el arroz de secano llevan una estimación de Muyuy. El detalle está en docs/auditoria_economia.csv." });
Object.assign(I18N.en, { leLuna: "🌙 The moon and the farm", leRefClima: "📚 References: climate and satellites", leRefRot: "📚 References: rotations and crops", leRefLeer: "📚 References: numbers, soil and decisions", refVer: "View",
  lunaF0: "New moon", lunaF1: "Waxing moon", lunaF2: "First quarter", lunaF3: "Waxing, nearly full", lunaF4: "Full moon", lunaF5: "Waning, just past full", lunaF6: "Last quarter", lunaF7: "Waning moon", lunaFL: "Full moon in about {n} days", lunaFN: "New moon in about {n} days",
  lunaSaberT: "What is told in the fields", lunaS1: "<b>Sowing:</b> according to a Peruvian compilation, crops that yield above ground are sown from the first quarter to a few days after the full moon, and those that yield below ground between the new moon and first quarter. Others prefer sowing roots and tubers on the waning moon.", lunaS2: "<b>Pruning:</b> opinions differ. Some prune on the waning moon to lose less sap; others between the new and waxing moon so it regrows more.", lunaS3: "<b>Harvest:</b> some prefer the full moon to harvest grains.",
  lunaCienT: "What science says", lunaC1: "A 2020 scientific review found no reliable evidence that moon phases change plant growth. That is why the moon is not part of Muyuy's calculation.", lunaC2: "It is inherited knowledge worth hearing, and it varies between communities: ask your elders. If you follow the moon, choose the day within the sowing and rain window.",
  refA: "Climate and satellites", refB: "El Niño and hard years", refC: "Rotation and fallow", refD: "Water and crops", refE: "The moon", refF: "Yields, prices and costs", refG: "Soil and erosion", refH: "How to present information to farmers",
  refNasa: "Muyuy uses public NASA data. NASA has not reviewed or endorsed this app.", refEco: "Yield and price: 2021-23 Midagri average, median of each zone's regions. Cost: 2018 INEI survey, without land rent and brought to recent prices (× 1.18); includes paid labor. Some crops have no data of their own: their cost comes from a similar crop. Peanut, soybean, mucuna and rainfed rice carry a Muyuy estimate. Details are in docs/auditoria_economia.csv." });
Object.assign(I18N.qu, { leLuna: "🌙 Killa, chakrapas", leRefClima: "📚 Maymanta: para, satelitekuna", leRefRot: "📚 Maymanta: muyuykuna, tarpuykuna", leRefLeer: "📚 Maymanta: yupaykuna, allpa", refVer: "Qhaway", lunaF0: "Musuq killa", lunaF4: "Pura killa", lunaSaberT: "Chakrapi ima ninku", lunaCienT: "Ciencia ima nin", lunaC1: "2020 watapi huk qhawariyqa manam tarirqanchu killa yurakunata tikrachisqanmanta allin yachayta. Chayraykum killaqa Muyuypa yupayninpi mana kanchu.", lunaC2: "Kay yachayqa machu taytakunamanta hamun: llaqtaykipi machukunata tapuy." });
// una sola caja en «Elija su chacra»: lugares y coordenadas
Object.assign(I18N.es, { pickBuscar: "Comunidad, distrito o coordenadas…", pickCorIrA: "Ir a estas coordenadas", pickCorSigue: "Siga escribiendo: latitud y longitud, por ejemplo -13.39, -72.05" });
Object.assign(I18N.en, { pickBuscar: "Community, district or coordinates…", pickCorIrA: "Go to these coordinates", pickCorSigue: "Keep typing: latitude and longitude, for example -13.39, -72.05" });
Object.assign(I18N.qu, { pickBuscar: "Ayllu, distrito, coordenada…", pickCorIrA: "Kay coordenadaman riy", pickCorSigue: "Qillqaspa kachkay: latitud, longitud; kay hina: -13.39, -72.05" });
// Información extra: 6 temas, buscador, pestañas y partes para tocar
Object.assign(I18N.es, { leS: "Para consultar cuando quiera; para decidir bastan los 6 pasos. Toque un tema o búsquelo.", ieBusca: "Busque: helada, pH, El Niño…", ieNada: "No encontré eso. Pruebe con otra palabra.", ieAbrir: "Abrir", ieSig: "Siguiente: {s} →",
  ieG_clima: "Su chacra y su clima", ieD_clima: "Sus números, los años pasados y los satélites.", ieG_rot: "Rotar y cuidar el suelo", ieD_rot: "Qué es rotar y qué cultivos ayudan a su tierra.", ieG_luna: "La luna", ieD_luna: "La fase de cualquier día y lo que se cuenta en el campo.",
  ieG_confiar: "Cuánto confiar", ieD_confiar: "Qué significa cada resultado y cuándo manda su criterio.", ieG_palabras: "Palabras de Muyuy", ieD_palabras: "Busque qué significa cada palabra.", ieG_fuentes: "De dónde sale todo", ieD_fuentes: "Cómo se calculó y las referencias.",
  ieTab_cifras: "Sus números", ieTab_clima: "Año por año", ieTab_sats: "Satélites", ieTab_que: "¿Qué es rotar?", ieTab_cult: "Cultivos que ayudan", ieTab_inc: "Leer un resultado", ieTab_juicio: "Su criterio", ieTab_como: "Cómo se calculó", ieTab_rClima: "Clima", ieTab_rRot: "Cultivos y luna", ieTab_rNum: "Precios y suelo",
  cfS: "Toque un número para ver qué significa.", cfXPend: "Cuánto sube el terreno en cada 100 metros. Con más pendiente, la lluvia se lleva más tierra.", cfXArena: "Con más arena, el agua se va rápido y la tierra se seca antes.", cfXArcilla: "Con más arcilla, la tierra guarda más agua, pero se encharca y cuesta más trabajarla.", cfXMo: "Alimenta la tierra y ayuda a guardar agua. Según el INIA: bajo, menos de 2 %; medio, de 2 a 4 %; alto, más de 4 %.", cfXPh: "Qué tan ácida o alcalina es la tierra. Orienta el abono y la cal.", cfMapa: "Son estimados de mapas de satélite: su chacra puede ser distinta.", cfLab: "Con los valores de su análisis de suelo.",
  confT: "Pruebe: mueva la barra", confN: "Funciona {n} de cada 10 años", confA: "Le va bien la mayoría de los años. Aun así, mire qué pasó en los años malos.", confM: "Depende mucho del año. Conviene probarla primero en un pedazo pequeño.", confB: "Falla la mayoría de los años. Mire otras opciones, salvo que usted tenga algo que Muyuy no ve, como un ojo de agua.",
  terBus: "Busque una palabra…", lunaElige: "Elija un día", lunaAntes: "Día anterior", lunaDespues: "Día siguiente", lunaHoyB: "Hoy" });
Object.assign(I18N.en, { leS: "To look up whenever you like; the 6 steps are enough to decide. Tap a topic or search for it.", ieBusca: "Search: frost, pH, El Niño…", ieNada: "I did not find that. Try another word.", ieAbrir: "Open", ieSig: "Next: {s} →",
  ieG_clima: "Your farm and climate", ieD_clima: "Your numbers, past years and the satellites.", ieG_rot: "Rotating and soil care", ieD_rot: "What rotating is and which crops help your land.", ieG_luna: "The moon", ieD_luna: "The phase on any day and what is told in the fields.",
  ieG_confiar: "How much to trust", ieD_confiar: "What each result means and when your judgment rules.", ieG_palabras: "Muyuy's words", ieD_palabras: "Look up what each word means.", ieG_fuentes: "Where it all comes from", ieD_fuentes: "How it was calculated and the references.",
  ieTab_cifras: "Your numbers", ieTab_clima: "Year by year", ieTab_sats: "Satellites", ieTab_que: "What is rotating?", ieTab_cult: "Helpful crops", ieTab_inc: "Reading a result", ieTab_juicio: "Your judgment", ieTab_como: "How it was calculated", ieTab_rClima: "Climate", ieTab_rRot: "Crops and moon", ieTab_rNum: "Prices and soil",
  cfS: "Tap a number to see what it means.", cfXPend: "How much the land rises every 100 meters. On steeper land, rain carries away more soil.", cfXArena: "With more sand, water drains fast and the land dries sooner.", cfXArcilla: "With more clay, the land holds more water, but it waterlogs and is harder to work.", cfXMo: "It feeds the land and helps hold water. According to INIA: low, under 2%; medium, 2 to 4%; high, over 4%.", cfXPh: "How acidic or alkaline the land is. It guides fertilizer and lime.", cfMapa: "These are estimates from satellite maps: your farm may differ.", cfLab: "Using the values from your soil analysis.",
  confT: "Try it: move the bar", confN: "It works {n} out of 10 years", confA: "It does well most years. Even so, check what happened in the bad years.", confM: "It depends a lot on the year. Try it first on a small plot.", confB: "It fails most years. Look at other options, unless you have something Muyuy cannot see, like a spring.",
  terBus: "Search for a word…", lunaElige: "Choose a day", lunaAntes: "Previous day", lunaDespues: "Next day", lunaHoyB: "Today" });
Object.assign(I18N.qu, { leS: "Munasqaykipi qhaway; akllanapaqqa 6 puriyllam kanan. Huk yachayta llamiy utaq maskay.", ieBusca: "Maskay: qasa, pH, El Niño…", ieNada: "Manam tarinichu. Huk simiwan maskay.", ieAbrir: "Kichay", ieSig: "Qatiq: {s} →",
  ieG_clima: "Chakrayki, paraypas", ieG_rot: "Muyuy, allpa waqaychaypas", ieG_luna: "Killa", ieG_confiar: "Hayk'ata iñina", ieG_palabras: "Muyuypa siminkuna", ieG_fuentes: "Maymanta hamun", terBus: "Simita maskay…", lunaHoyB: "Kunan", confT: "Barrata kuyuchiy", confN: "Sapa 10 watamanta {n} watapi allin" });
