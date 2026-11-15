// Muyuy · Objetivos de Desarrollo Sostenible (ODS) a los que aporta, cada uno con la meta concreta y el paso donde se ve.
// Se muestran en la pantalla de inicio (franja de 5 ODS que se pueden tocar), en cada prioridad del paso 2 (lo que el
// agricultor elige empuja un ODS) y en «¿De dónde salen estos números?». Colores oficiales de la ONU; el número va en
// texto oscuro sobre los colores claros para que se lea bien.
"use strict";

const ODS = [
  { n: 1, c: "#E5243B", meta: "1.5", paso: 2 },
  { n: 2, c: "#DDA63A", oscuro: true, meta: "2.4", paso: 4 },
  { n: 6, c: "#26BDE2", oscuro: true, meta: "6.4", paso: 2 },
  { n: 13, c: "#3F7E44", meta: "13.1", paso: 4 },
  { n: 15, c: "#56C02B", oscuro: true, meta: "15.3", paso: 5 },
];
const ODS_PRIO = { agua: 6, ingreso: 1, suelo: 15, riesgo: 13 }; // prioridad del paso 2 → ODS que empuja

Object.assign(I18N.es, {
  odsT: "Muyuy aporta a 5 objetivos de desarrollo sostenible", odsToque: "Toque un ODS para ver cómo.", odsPaso: "Lo ve en el paso {p}.",
  ods2: "Hambre cero", ods2X: "Meta 2.4: sistemas de producción sostenibles y resilientes. Muyuy busca rotaciones que aguantan sequías, heladas y El Niño, y asociaciones que dan más de un cultivo en la misma chacra.",
  ods13: "Acción por el clima", ods13X: "Meta 13.1: resiliencia y adaptación a los riesgos del clima. 45 años de clima de la NASA, escenarios El Niño y el clima de 2050 para decidir antes de sembrar.",
  ods15: "Vida de ecosistemas terrestres", ods15X: "Meta 15.3: recuperar suelos degradados. Leguminosas, asociaciones y descanso devuelven nitrógeno y cuidan la tierra de la erosión.",
  ods6: "Agua limpia y saneamiento", ods6X: "Meta 6.4: usar el agua con más eficiencia. El balance de agua FAO-56 muestra qué cultivos aguantan con la lluvia y cuáles piden riego.",
  ods1: "Fin de la pobreza", ods1X: "Meta 1.5: menos pérdidas de los más pobres ante sequías y heladas. Muyuy muestra en cuántos años de cada 10 una rotación no falla.",
  odsChipT: "Elegir esto aporta al ODS {n}: {t} (meta {m})",
  fuentesOds: "<b>ODS:</b> Muyuy aporta a las metas 1.5 (pobreza), 2.4 (hambre cero), 6.4 (agua), 13.1 (clima) y 15.3 (suelos). Cada prioridad del paso 2 empuja un ODS: 💧 Agua → ODS 6 · 💰 Ingreso → ODS 1 · 🌱 Suelo → ODS 15 · 🛡️ No perder → ODS 13.",
});
Object.assign(I18N.en, {
  odsT: "Muyuy contributes to 5 sustainable development goals", odsToque: "Tap a goal to see how.", odsPaso: "See it in step {p}.",
  ods2: "Zero hunger", ods2X: "Target 2.4: sustainable, resilient food production. Muyuy looks for rotations that withstand drought, frost and El Niño, and intercrops that give more than one crop on the same field.",
  ods13: "Climate action", ods13X: "Target 13.1: resilience and adaptation to climate hazards. 45 years of NASA climate, El Niño scenarios and the 2050 climate to decide before sowing.",
  ods15: "Life on land", ods15X: "Target 15.3: restore degraded soil. Legumes, intercrops and fallow return nitrogen and protect the land from erosion.",
  ods6: "Clean water and sanitation", ods6X: "Target 6.4: use water more efficiently. The FAO-56 water balance shows which crops make it on rain and which need irrigation.",
  ods1: "No poverty", ods1X: "Target 1.5: fewer losses for the poorest when drought and frost hit. Muyuy shows in how many years out of 10 a rotation does not fail.",
  odsChipT: "Choosing this contributes to SDG {n}: {t} (target {m})",
  fuentesOds: "<b>SDGs:</b> Muyuy contributes to targets 1.5 (poverty), 2.4 (zero hunger), 6.4 (water), 13.1 (climate) and 15.3 (soil). Each step 2 priority pushes one goal: 💧 Water → SDG 6 · 💰 Income → SDG 1 · 🌱 Soil → SDG 15 · 🛡️ Not losing → SDG 13.",
});
// quechua (Cusco-Collao)
Object.assign(I18N.qu, {
  odsT: "Muyuyqa 5 ODS nisqakunaman yanapan", odsToque: "Huk ODS-ta llapiy, rikunaykipaq.", odsPaso: "{p} kaq ruraypi rikunki.",
  ods2: "Yarqayta tukuchiy", ods2X: "Meta 2.4: sinchi, wiñaypaq tarpuy. Muyuyqa ch'aki watata, qasata, El Niñotapas aguantaq muyuykunata maskan, kuska tarpuykunatapas: huk chakrallapi iskay rurukuna.",
  ods13: "Pacha tikrakuypaq ruray", ods13X: "Meta 13.1: pacha tikrakuypa sasachakuyninkunapaq sinchiyay. NASA-pa 45 watapa pachan, El Niño, 2050 watapa pachanpas: manaraq tarpuspa yuyaykunapaq.",
  ods15: "Allpa pachapi kawsay", ods15X: "Meta 15.3: millayasqa allpakunata kutichiy. Hawas, purutu, kuska tarpuy, samachiypas allpaman kallpata kutichinku, yaku apakuymantataq waqaychanku.",
  ods6: "Ch'uya yaku", ods6X: "Meta 6.4: yakuta allinta llamk'achiy. FAO-56 yaku yupaymi rikuchin mayqin rurukunam paralla aguantanku, mayqinkunataq qarpayta munanku.",
  ods1: "Wakchakayta tukuchiy", ods1X: "Meta 1.5: wakcha runakuna ch'aki watapi, qasapipas aswan pisita chinkachinankupaq. Muyuyqa rikuchin sapa chunka watamanta hayka watapim huk muyuy mana pisinchu.",
  odsChipT: "Kayta akllaspa ODS {n}-man yanapanki: {t} (meta {m})",
  fuentesOds: "<b>ODS:</b> Muyuyqa 1.5 (wakchakay), 2.4 (yarqay), 6.4 (yaku), 13.1 (pacha) 15.3 (allpa) metakunaman yanapan. 💧 → ODS 6 · 💰 → ODS 1 · 🌱 → ODS 15 · 🛡️ → ODS 13.",
});
// cultivos asociados (app.js: renderAsoc, paleta y línea de tiempo)
Object.assign(I18N.es, {
  asocOpt: "🌽🫘 Cultivos asociados", asocSi: "Incluir", asocPref: "Darles preferencia", asocNo: "No usar",
  asocHint: "Asociar es sembrar dos cultivos juntos en el mismo surco, como el maíz con frijol: la leguminosa deja nitrógeno, el suelo queda más cubierto y si uno falla queda el otro.",
  asocAqui: "En su zona: {c}.", asocNoAltura: "No se da a su altura: {c}.", asocPocas: "Aquí no alcanzan para dar preferencia: se muestran todas.",
  asocTag: "asociado", asocPal: "Asociados: dos cultivos juntos en el mismo surco",
});
Object.assign(I18N.en, {
  asocOpt: "🌽🫘 Intercrops", asocSi: "Include", asocPref: "Prefer them", asocNo: "Do not use",
  asocHint: "Intercropping is sowing two crops together in the same row, like maize with bean: the legume leaves nitrogen, the soil stays more covered and if one fails the other remains.",
  asocAqui: "In your area: {c}.", asocNoAltura: "Does not grow at your altitude: {c}.", asocPocas: "Not enough here to prefer them: all are shown.",
  asocTag: "intercrop", asocPal: "Intercrops: two crops together in the same row",
});
Object.assign(I18N.qu, { asocOpt: "🌽🫘 Kuska tarpuy", asocTag: "kuska" });

const odsDe = (n) => ODS.find((o) => o.n === n);
const odsCuadro = (o) => `<span class="ods-n${o.oscuro ? " osc" : ""}" style="--ods:${o.c}">${o.n}</span>`;

// pantalla de inicio: franja de los 5 ODS; al tocar uno se explica cómo aporta Muyuy
function odsInicio() {
  return `<details class="sp-ods"><summary class="sp-ods-t">${tr("odsT")}</summary>
    <div class="sp-ods-b">${ODS.map((o) => `<button type="button" data-ods="${o.n}" aria-expanded="false" title="ODS ${o.n} · ${tr("ods" + o.n)}">${odsCuadro(o)}<span class="sp-ods-l">${tr("ods" + o.n)}</span></button>`).join("")}</div>
    <p class="sp-ods-x" aria-live="polite">${tr("odsToque")}</p></details>`;
}
function initOdsInicio(root) {
  const x = $(".sp-ods-x", root), d = $(".sp-ods", root);
  d.ontoggle = () => { if (d.open) d.scrollIntoView({ block: "end" }); }; // en pantallas chicas el detalle queda más abajo
  $$(".sp-ods-b button", root).forEach((b) => (b.onclick = () => {
    const o = odsDe(+b.dataset.ods), abierto = b.getAttribute("aria-expanded") === "true";
    $$(".sp-ods-b button", root).forEach((y) => y.setAttribute("aria-expanded", "false"));
    if (abierto) { x.textContent = tr("odsToque"); return; }
    b.setAttribute("aria-expanded", "true");
    x.innerHTML = `<b>ODS ${o.n} · ${tr("ods" + o.n)}.</b> ${tr("ods" + o.n + "X")} <i>${tr("odsPaso", { p: o.paso })}</i>`;
  }));
}

// paso 2: el ODS de cada prioridad ya no va en la tarjeta (no ayuda a decidir); está en «Información extra» → fuentes
function pintarOdsPrio() {
  if (true) return;
  $$(".prio").forEach((l) => {
    const o = odsDe(ODS_PRIO[l.dataset.k]);
    if (!o) return;
    let ch = $(".ods-chip", l);
    if (!ch) { ch = document.createElement("span"); ch.className = "ods-chip"; $(".prio-desc", l).after(ch); }
    ch.title = tr("odsChipT", { n: o.n, t: tr("ods" + o.n), m: o.meta });
    ch.innerHTML = `${odsCuadro(o)} <span>ODS ${o.n} · ${tr("ods" + o.n)}</span>`;
  });
}
