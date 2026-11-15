// Muyuy · criterio.js: Muyuy muestra patrones y posibilidades; el agricultor y su comunidad deciden.
//  1. Patrones: lo que se repite en las miles de rotaciones probadas y en 45 años de clima, dicho como observación,
//     con cuánta evidencia lo respalda, y la pregunta «¿Coincide con lo que usted ha visto?».
//  2. Su opinión de cada estrategia (posible, con dudas o no en mi chacra) y el porqué (semilla, mercado, trabajo,
//     plaga, helada local, acuerdo comunal…). «No en mi chacra» la quita de las opciones: manda su criterio.
//  3. Precios de su feria: reemplazan los de referencia en el comparador y en «¿Y si…?».
//  4. ¿Qué tan seguro es esto?: alta, media o baja, con las razones y lo que la haría más segura.
//  5. Guía para conversar con la comunidad o el técnico (para imprimir) y sus respuestas en CSV.
// Todo se guarda solo en este teléfono.
"use strict";

Object.assign(I18N.es, {
  paT: "🔍 Lo que se repite en su chacra", paS: "Lo que se repite en {n} posibilidades probadas con 45 años de clima. ¿Coincide con lo que usted ha visto?",
  paLeg: "Leguminosa justo antes de un cultivo que pide mucho nitrógeno",
  paFam: "Repetir la misma familia dos campañas seguidas", paDesc: "Dejar una campaña de descanso",
  paAsoc: "Dos cultivos asociados en el mismo surco", paSeq: "Un cultivo que aguanta la sequía", paCob: "Un cultivo que cubre bien la tierra",
  paRes: "Con esto: <b>{a}</b> · sin esto: <b>{b}</b>.",
  mRob: "funciona {v} de 10 años", mSeco: "en años secos funciona {v} de 10", mEro: "el agua se lleva {v} toneladas de tierra por hectárea al año",
  fFuerte: "se repite mucho", fDebil: "se repite poco", fNada: "no se ve diferencia",
  paNino: "En años El Niño llueve {d} ({a} mm frente a {b} mm; {n} campañas).",
  paNina: "En años La Niña llueve {d} ({a} mm frente a {b} mm; {n} campañas).", paMas: "{v} % más", paMenos: "{v} % menos", paIgual: "casi la misma cantidad",
  paSecos: "Sus 5 campañas más secas: {y}. {n} fueron años El Niño.",
  paHoy: "Lo que siembra hoy falló sobre todo por {c}.", paCausaHel: "helada", paCausaSeco: "falta de agua", paCausaExc: "exceso de agua", paCausaN: "falta de nitrógeno",
  paPreg: "¿Coincide con lo que usted ha visto?", paSi: "👍 Sí", paNo: "👎 No", paNose: "🤷 No sé",
  paNoTxt: "Su experiencia pesa más. Anote por qué: los datos no ven hondonadas, riego, variedades ni su manejo.",
  paSiTxt: "Los datos y su experiencia coinciden.", paNota: "¿Por qué? (opcional)",
  paResumen: "Coincide en {s} y no coincide en {n} de {t} patrones.", paMasT: "Ver {n} más",
  opT: "🧑‍🌾 ¿Qué opina?", opSi: "👍 Me parece posible", opDuda: "🤔 Tengo dudas", opNo: "👎 No en mi chacra",
  opPorque: "¿Por qué?", opNota: "Lo que sabe usted o su comunidad (opcional)", opGuardar: "💾 Guardar",
  opR_semilla: "semilla", opR_mercado: "mercado o precio", opR_trabajo: "trabajo o mano de obra", opR_herram: "herramientas", opR_plaga: "plaga o enfermedad local",
  opR_helada: "helada o granizo de mi zona", opR_agua: "agua", opR_comunal: "acuerdo o costumbre de la comunidad", opR_gusto: "lo que come mi familia", opR_otro: "otro",
  opQuitada: "La quitamos. Puede volver a ponerla en «Descartadas».", opGuardada: "Guardado en este teléfono.",
  opDesc: "🗂️ Descartadas por usted", opVolver: "↺ Volver a ponerla", opNinguna: "Ninguna todavía.",
  cSeg: "🎯 Qué tan seguro", cOp: "🧑‍🌾 Su opinión", segAlta: "alta", segMedia: "media", segBaja: "baja", opSin: "—",
  segT: "🎯 Qué tan seguro: {n}", segPor: "Por qué:", segMejor: "Para estar más seguro:",
  sgAnio: "el resultado depende mucho del año ({r} de 10)", sgConf: "{c}: tabla con datos aproximados", sgNuevo: "usted no ha sembrado antes {c}",
  sgPrecio: "precios de referencia, no de su feria", sgCelda: "clima de una celda de ~55 km, no de una estación", sgEnt: "sin entrevista: se supuso lo que siembra hoy",
  sgAsoc: "asociación calculada de forma simple", sgOk: "45 años de datos y cultivos conocidos en su zona",
  mjPedazo: "Pruébela primero en un pedazo pequeño (paso 5)", mjPrecio: "Ponga los precios de su feria (paso 2)", mjEnt: "Complete «Cuéntenos de su chacra» (paso 1)",
  mjTec: "Pregunte al INIA, a la agencia agraria o a un técnico por {c}", mjMayores: "Converse con los mayores que ya sembraron {c}",
  prT: "💰 Precios de su feria (opcional)", prS: "Si sabe a cuánto se vende hoy (S/ por kg), póngalo. Si no, déjelo vacío.",
  prRef: "ref. {v}", prUsa: "Usa sus precios ({c}).",
  guT: "🖨️ Imprimir guía para conversar con la comunidad", guCsv: "⬇ Descargar mis opiniones",
  guTitulo: "Muyuy · guía para conversar", guLugar: "Lugar", guFecha: "Fecha", guIntro: "Posibilidades que muestran 45 años de datos de la NASA. Conversen y decidan juntos.",
  guPreg: "Preguntas para conversar", guDijo: "Lo que dijo la comunidad o el técnico:", guPat: "Patrones y lo que usted respondió",
  guQ1: "¿Alguien de la comunidad ya sembró {c}? ¿Cómo le fue?", guQ2: "¿Dónde se consigue semilla de {c}? ¿A qué precio?", guQ3: "¿Quién compra {c} y a cuánto?",
  guQ4: "¿En qué fecha conviene sembrar para escapar de la helada o la sequía?", guQ5: "¿Alcanza la mano de obra de la familia en siembra y cosecha?", guQ6: "¿Esta posibilidad respeta los sectores (muyuy, laymi, aynuqa) que acordó la comunidad?",
  ayudaComp: "La tabla compara lo que siembra hoy con 3 posibilidades, fila por fila. El ✓ verde marca la mejor de cada fila.",
  ayudaOpin: "Toque cada posibilidad y diga qué opina. Si dice «No en mi chacra», Muyuy la quita.",
  decideTop: "🧑‍🌾 Muyuy le muestra posibilidades y patrones de 45 años de datos. Usted conoce su chacra: usted decide.",
});
Object.assign(I18N.en, {
  paT: "🔍 What repeats on your farm", paS: "What repeats across {n} possibilities tested with 45 years of climate. Does it match what you have seen?",
  paLeg: "A legume right before a crop that needs a lot of nitrogen",
  paFam: "Repeating the same family two seasons in a row", paDesc: "Leaving one season of fallow",
  paAsoc: "Two crops together in the same row", paSeq: "A drought-tolerant crop", paCob: "A crop that covers the soil well",
  paRes: "With this: <b>{a}</b> · without it: <b>{b}</b>.",
  mRob: "works {v} of 10 years", mSeco: "works {v} of 10 in dry years", mEro: "water carries away {v} tonnes of soil per hectare per year",
  fFuerte: "repeats a lot", fDebil: "repeats a little", fNada: "no clear difference",
  paNino: "In El Niño years it rains {d} ({a} mm vs. {b} mm; {n} seasons).",
  paNina: "In La Niña years it rains {d} ({a} mm vs. {b} mm; {n} seasons).", paMas: "{v} % more", paMenos: "{v} % less", paIgual: "about the same",
  paSecos: "Your 5 driest seasons: {y}. {n} were El Niño years.",
  paHoy: "What you grow today failed mostly because of {c}.", paCausaHel: "frost", paCausaSeco: "lack of water", paCausaExc: "excess water", paCausaN: "lack of nitrogen",
  paPreg: "Does this match what you have seen?", paSi: "👍 Yes", paNo: "👎 No", paNose: "🤷 Not sure",
  paNoTxt: "Your experience weighs more. Note why: the data cannot see hollows, irrigation, varieties or your management.",
  paSiTxt: "The data and your experience agree.", paNota: "Why? (optional)",
  paResumen: "Matches {s} and does not match {n} of {t} patterns.", paMasT: "See {n} more",
  opT: "🧑‍🌾 What do you think?", opSi: "👍 Seems possible", opDuda: "🤔 I have doubts", opNo: "👎 Not on my farm",
  opPorque: "Why?", opNota: "What you or your community know (optional)", opGuardar: "💾 Save",
  opR_semilla: "seed", opR_mercado: "market or price", opR_trabajo: "work or labour", opR_herram: "tools", opR_plaga: "local pest or disease",
  opR_helada: "frost or hail in my area", opR_agua: "water", opR_comunal: "community agreement or custom", opR_gusto: "what my family eats", opR_otro: "other",
  opQuitada: "Removed. You can put it back under “Discarded”.", opGuardada: "Saved on this phone.",
  opDesc: "🗂️ Discarded by you", opVolver: "↺ Put it back", opNinguna: "None yet.",
  cSeg: "🎯 How certain", cOp: "🧑‍🌾 Your opinion", segAlta: "high", segMedia: "medium", segBaja: "low", opSin: "—",
  segT: "🎯 How certain: {n}", segPor: "Why:", segMejor: "To be more certain:",
  sgAnio: "the outcome depends a lot on the year ({r} of 10)", sgConf: "{c}: approximate crop data", sgNuevo: "you have not grown {c} before",
  sgPrecio: "reference prices, not your market's", sgCelda: "climate from a ~55 km cell, not a station", sgEnt: "no interview: today's crops were assumed",
  sgAsoc: "intercrop modelled simply", sgOk: "45 years of data and crops known in your area",
  mjPedazo: "Try it first on a small plot (step 5)", mjPrecio: "Enter your market prices (step 2)", mjEnt: "Fill in “What the farmer says” (step 1)",
  mjTec: "Ask INIA, the agricultural agency or an extension agent about {c}", mjMayores: "Talk with elders who have grown {c}",
  prT: "💰 Your market prices (optional)", prS: "If you know today's price (S/ per kg), enter it. If not, leave it empty.",
  prRef: "ref. {v}", prUsa: "Uses your prices ({c}).",
  guT: "🖨️ Print a guide to talk with the community", guCsv: "⬇ Download my opinions",
  guTitulo: "Muyuy · conversation guide", guLugar: "Place", guFecha: "Date", guIntro: "Possibilities shown by 45 years of NASA data. Talk it over and decide together.",
  guPreg: "Questions to discuss", guDijo: "What the community or the extension agent said:", guPat: "Patterns and your answers",
  guQ1: "Has anyone in the community grown {c}? How did it go?", guQ2: "Where can {c} seed be found? At what price?", guQ3: "Who buys {c} and at what price?",
  guQ4: "When is it best to sow to escape frost or drought?", guQ5: "Is the family's labour enough at sowing and harvest?", guQ6: "Does this rotation respect the sectors (muyuy, laymi, aynuqa) the community agreed?",
  ayudaComp: "The table compares what you grow today with 3 possibilities, row by row. The green ✓ marks the best of each row.",
  ayudaOpin: "Tap each possibility and say what you think. If you say “Not on my farm”, Muyuy removes it.",
  decideTop: "🧑‍🌾 Muyuy shows you possibilities and patterns from 45 years of data. You know your farm: you decide.",
});
Object.assign(I18N.qu, {
  paT: "🔍 Chakraykipi Muyuypa tarisqan", paPreg: "¿Qampa rikusqaykiwan tupanchu?", paSi: "👍 Arí", paNo: "👎 Manam", paNose: "🤷 Mana yachanichu",
  opT: "🧑‍🌾 ¿Imatataq yuyanki?", opSi: "👍 Atikunmanmi", opDuda: "🤔 Iskayrayani", opNo: "👎 Mana chakraypichu", opGuardar: "💾 Waqaychay",
});

// Runasimi (quechua sureño) · textos de campo.js y criterio.js para el agricultor. Lo técnico («Para el técnico») se queda en castellano, como la vista técnica.
Object.assign(I18N.qu, {
  // 1. pachamanta
  tdT: "📈 1981 watamanta pachaykiq kawsaynin", tdS: "Sapa tarpuy watapaq huk siq'i (agosto killamanta julio killakama). Ch'iqchi siq'iqa imayna purisqanta rikuchin.",
  tdLluvia: "Tarpuy watapi para", tdHel: "Qasa tutakuna (0 °C uraypi)", tdTmin: "Tutapa chiri kaynin", tdCalor: "Aswan q'uñi killa",
  tdProm: "chawpinpi {v}", tdUlt: "qhipa tarpuy {a}: {v} ({d} chawpinmanta)", tdSube: "sapa chunka watapi {v} yapakun", tdBaja: "sapa chunka watapi {v} pisiyan",
  tdClara: "sut'i purisqan", tdNoClara: "mana sut'ichu", tdEscuchar: "🎵 45 wata parata uyariy", tdParar: "⏹ Sayachiy",
  tdEscS: "Sapa takiy huk tarpuy wata: aswan ñañu, aswan para. Huk ukhu waqay (celularpas kuyun) ch'aki watakunata rikuchin.",
  tdGraf: "📊 Sapa watapa siq'inkunata qhaway",
  rz_p_sube: "🌧️ {a} watamanta aswan paran: sapa tarpuypi yaqa {v} mm aswan.", rz_p_baja: "🌧️ {a} watamanta pisillata paran: sapa tarpuypi yaqa {v} mm pisi.",
  rz_p_igual: "🌧️ {a} watamanta para mana sut'ita tikrakunchu: kan allin watakuna, mana allin watakunapas.",
  rz_h0_sube: "❄️ Ñawpamanta aswan qasa kan: {a} watamanta sapa watapi yaqa {v} tuta aswan.", rz_h0_baja: "❄️ Ñawpamanta pisi qasa kan: {a} watamanta sapa watapi yaqa {v} tuta pisi.",
  rz_h0_igual: "❄️ {a} watamanta qasa mana sut'ita tikrakunchu.",
  rz_tmx_sube: "🌡️ Q'uñi killakuna {a} watamanta {v} °C aswan q'uñi.", rz_tmx_baja: "🌡️ Q'uñi killakuna {a} watamanta {v} °C aswan chiri.",
  rz_tn_sube: "🌙 Tutakuna {a} watamanta {v} °C aswan q'uñi.", rz_tn_baja: "🌙 Tutakuna {a} watamanta {v} °C aswan chiri.",
  rz_ult_normal: "📅 Qhipa tarpuypi ({a}) para chawpinpi karqan.", rz_ult_mas: "📅 Qhipa tarpuypi ({a}) {v} % aswan paran.", rz_ult_menos: "📅 Qhipa tarpuypi ({a}) {v} % pisillata paran.",
  // 2. sasachakuykuna
  rsT: "🧰 Chakraykiq sasachakuynin", rsS: "Muyuyqa atisqaykillata rikuchisunki.",
  rsExcl: "🚫 Mana tarpuy atisqayki (mana muhu, llamk'ana, rantiqpas kanchu)", rsExclS: "Huk rurutam llamiy qichunaykipaq utaq kutichinaykipaq.",
  rsForraje: "🐄 ¿Uywaykikunapaq q'achuta munankichu?", rsNo: "Manam", rsSi: "Arí, munani",
  rsAgua: "💧 Qarpay: {r} (1 pasopi tikrachiy).", rsSinRiego: "parallawan", rsConRiego: "qarpayniyuq",
  rsQuitados: "Qichusqayki: {c}.", rsTodos: "Mana llapan rurukunata qichuyta atinkichu.",
  prT: "💰 Qhatuykipi chanin (munaspaqa)", prS: "Kunan hayk'api rantikun (S/ sapa kilo) chayta yachaspaqa, churay. Mana yachaspaqa ch'usaqta saqiy.", prRef: "ñawpaq {v}",
  // 3. killa yupana
  caT: "🗓️ Chakraykiq killa yupanan", caS: "Kimsa tarpuy, agosto killamanta julio killakama.",
  caComo: "Sapa tawa k'uchu huk killa. Llimp'i: ruru · siq'isqa: ch'usaq chakra · q'umir: samay · ⚠: sasa killa.",
  caLluvia: "Para", caEt: "Inti wayrapas ch'akichisqan", caHel: "Qasa tutakuna", caMm: "mm sapa killa",
  caVacia: "ch'usaq chakra", caDesc: "samay", caVuln: "sasa killa",
  caVulnHel: "❄️ {c}: {m} killapi {n} qasa tuta kan, sacha aswan llamp'u kaqtin.",
  caVulnSeco: "☀️ {c}: {m} killapi {p} mm paran, sachataq {e} mm munan, aswan llamp'u kaqtin.",
  caVulnExc: "💧 {c}: {m} killapi {p} mm paran; achka yakuqa sapintapas ruruntapas ismuchinman.",
  caVaciaTxt: "🍂 {a} killamanta {b} killakama: ch'usaq chakra ({n} killa).",
  caOpVerde: "💡 Chay killakunapi {p} mm paran: huk usqhay q'achu wanu ({c}) allpata p'istunman, nitrogenotapas saqinman.",
  caOpRastrojo: "💡 Chay killakunapi pisillata paran ({p} mm): q'upa sachata allpa patapi saqiy, allpata waqaychanapaq, chiwiyanpas qhepakunanpaq.",
  caNada: "✔ Chakraqa yaqa manapuni ch'usaqchu kan.", caSinMotor: "Kay killa yupanaqa sapa p'unchawpa pachanta munan (Perú llaqtakunallapi kan).",
  // 4. tupachiy
  decideTop: "🧑‍🌾 Muyuyqa 45 wata willakuykunamanta atikuykunata rikuchisunki. Qanmi chakraykita riqsinki: qanmi akllanki.",
  esT: "⚖️ Kunan tarpusqayki, kimsa atikuywan tupachisqa", esS: "Sapa siq'ita ñawinchay: q'umir ✓ aswan allinta rikuchin.", esDesliza: "👉 Llapanta rikunaykipaq tablata aysay.",
  esHoy: "Kunan", esOpc: "{i} kaq", esCrit: "¿Imatataq tupachin?", esFicha: "📋 Sapa atikuy, willasqa", esFichaS: "Huktam llamiy: imarayku rikhurin, ima qhawana, hinaspa yuyayniykita niwayku.",
  verFicha: "📋 Imarayku rikhurin, yuyayniykipas ↓",
  cAnios: "✅ Allin kanan watakuna", cSeco: "☀️ Ch'aki watakunapi", cAguaS: "💧 ¿Para aypanchu?", vAguaOk: "aypan", vAguaFalta: "sapa watapi {v} mm pisin",
  cTierra: "🌱 ¿Allpata imayna saqin?", vTierraMuy: "🌱🌱 ancha allinta qhawan", vTierraBien: "🌱 allinta qhawan", vTierraIgual: "➖ kikin", vTierraMal: "⚠️ sayk'uchin",
  cPlaga: "🐛 Kurukuna", vPlagaOk: "kurukunata kuchun", vPlagaMal: "{f} kutipan", cForr: "🐄 Uywapaq q'achu", vForrAlto: "achka", vForrMedio: "aslla", vForrBajo: "pisi",
  cIng: "💰 Sapa watapi qullqi (hectárea)", vIng: "S/ {v}", vIngMal: "S/ {v} chinkachin", vDeDiez: "chunkamanta {n}",
  fPorque: "🎯 Imarayku rikhurin", fBen: "🌱 Imatataq tarinki", fRies: "⚠️ Ayllu masiykiwan utaq yachaqwan qhawanapaq",
  fpHoy: "Kayqa kunan tarpusqayki: tupachinapaq.", fpRank: "2 pasopi akllasqaykiwan, {n} qhawasqamanta {r} kaq.", fpDest: "Aswan allin: {k}.", fpVsHoy: "Kunanwan tupachisqa: {d}.",
  kAgua: "yaku", kIngreso: "qullqi", kSuelo: "allpa", kRiesgo: "mana chinkachiy",
  fvMasAnios: "aswan watakuna allin ({a} chunkamanta, kunan {b})", fvMenosAnios: "pisi watakuna allin ({a} chunkamanta, kunan {b})",
  fvMasIng: "sapa watapi S/ {v} aswan", fvMenosIng: "sapa watapi S/ {v} pisi", fvTierraMas: "allpata aswan qhawan", fvTierraMenos: "allpata pisita qhawan",
  bN: "🫘 {c}: wayramanta nitrogenota hap'in; qatiq ruruqa pisi wanuta munan.", bCob: "☘️ {c}: allpata allinta p'istun; aswan yaku yaykun, pisi allpa chinkan.",
  bRaiz: "🌳 {c}: ukhu sapiyuq; allpata kichan, yakutapas yaykuchin.", bSeq: "🌵 {c}: ch'akiyta aswan aguantan.",
  bFam: "🐛 Mana ayllunta kutipanchu: allpa kurukunaqa iskay watata mana mikhunata tarinkuchu.", bDesc: "🍂 Huk wata samay: allpa kallpanta kutichin.",
  bForr: "🐄 Uywakunapaq q'achuta, ichhuta qun.",
  rPeor: "Aswan mana allin watapi ({p}) mana qullqi aypanmanchu karqan.", rSemilla: "¿Llaqtaykipi {c} allin muhu kanchu?", rMercado: "¿Pitaq {c} rantin, hayk'apitaq?",
  rHelada: "¿Hayk'aqtaq machukuna {c} tarpunku qasamanta ayqinapaq?", rDecide: "Mana imapas qhawanachu: qanmi akllanki.",
  // patrones
  paT: "🔍 Chakraykipi kutipaq", paS: "{n} atikuykunapi, 45 wata pachawan, ima kutipan. ¿Qampa rikusqaykiwan tupanchu?",
  paLeg: "Achka nitrogenota munaq ruru ñawpaqninpi hawas hina ruru", paFam: "Kikin ayllu rurutam iskay watata kutipay", paDesc: "Huk wata samay",
  paAsoc: "Iskay ruru kikin wachupi", paSeq: "Ch'akiyta aguantaq ruru", paCob: "Allpata allinta p'istuq ruru",
  paRes: "Kaywan: <b>{a}</b> · mana kaywan: <b>{b}</b>.", mRob: "chunkamanta {v} wata allin", mSeco: "ch'aki watakunapi chunkamanta {v}", mEro: "sapa watapi {v} t/ha allpa chinkan",
  fFuerte: "sinchi", fDebil: "pisi", fNada: "mana hukniraychu",
  paNino: "El Niño watakunapi {d} paran ({a} mm, {b} mm; {n} tarpuy).", paNina: "La Niña watakunapi {d} paran ({a} mm, {b} mm; {n} tarpuy).",
  paMas: "{v} % aswan", paMenos: "{v} % pisi", paIgual: "yaqa kikin", paSecos: "Pichqa aswan ch'aki tarpuyniyki: {y}. {n} El Niño wata karqan.",
  paHoy: "Kunan tarpusqayki {c} rayku mana allinchu karqan.", paCausaHel: "qasa", paCausaSeco: "yaku pisi", paCausaExc: "achka yaku", paCausaN: "nitrogeno pisi",
  paPreg: "¿Qampa rikusqaykiwan tupanchu?", paSi: "👍 Arí", paNo: "👎 Manam", paNose: "🤷 Mana yachanichu",
  paNoTxt: "Qampa yachayniyki aswan llasan. Imarayku chayta qillqay: willakuykunaqa mana qhuchakunata, qarpayta, rurukunata, ruwasqaykitapas rikunchu.",
  paSiTxt: "Willakuykuna, qampa yachayniykipas tupanku.", paNota: "¿Imarayku? (munaspaqa)", paResumen: "{t} kutipaqmanta {s} tupan, {n} mana tupanchu.", paMasT: "Huk {n} qhaway",
  // yuyay, takyasqa kay
  opT: "🧑‍🌾 ¿Imatataq yuyanki?", opSi: "👍 Atikunmanmi", opDuda: "🤔 Iskayrayani", opNo: "👎 Mana chakraypichu", opPorque: "¿Imarayku?",
  opNota: "Qampa utaq ayllu masiykiq yachaynin (munaspaqa)", opGuardar: "💾 Waqaychay",
  opR_semilla: "muhu", opR_mercado: "qhatu utaq chanin", opR_trabajo: "llamk'ay", opR_herram: "llamk'anakuna", opR_plaga: "kuru utaq unquy",
  opR_helada: "qasa utaq chikchi", opR_agua: "yaku", opR_comunal: "ayllu rimanakuy", opR_gusto: "ayllu mikhusqan", opR_otro: "huk",
  opQuitada: "Qichurqayku. «Wikch'usqakuna» nisqapi kutichiyta atinki.", opGuardada: "Kay celularpi waqaychasqa.",
  opDesc: "🗂️ Qampa wikch'usqayki", opVolver: "↺ Kutichiy", opNinguna: "Manaraq.",
  cSeg: "🎯 Hayk'a takyasqa", cOp: "🧑‍🌾 Yuyayniyki", segAlta: "hatun", segMedia: "chawpi", segBaja: "pisi", segT: "🎯 Hayk'a takyasqa: {n}",
  segPor: "Imarayku:", segMejor: "Aswan takyasqa kananpaq:",
  sgAnio: "watamanta ancha kaqtin ({r} chunkamanta)", sgConf: "{c}: willakuy yaqa yaqalla", sgNuevo: "manaraq {c} tarpurqankichu", sgPrecio: "ñawpaq chaninkuna, mana qhatuykipatachu",
  sgCelda: "55 km pachamanta, mana estacionmantachu", sgEnt: "mana tapuspa: kunan tarpusqayki yuyaykusqa", sgAsoc: "iskay ruru pisillata yupasqa", sgOk: "45 wata willakuy, llaqtaykipi riqsisqa rurukuna",
  mjPedazo: "Ñawpaqta huk huch'uy pedazopi tarpuy (5 paso)", mjPrecio: "Qhatuykipi chaninta churay (2 paso)", mjEnt: "«Chakrakuq willakusqan» nisqata hunt'ay (1 paso)",
  mjTec: "INIAta, agenciatá utaq yachaqta {c} nisqamanta tapuy", mjMayores: "{c} tarpuq machukunawan rimay",
  // ¿sichus…?
  siT: "🎚️ ¿Sichus pacha utaq chanin tikrakun?", siS: "Barrakunata kuyuchiy. Kayqa kikin 45 watawan prueballa, mana willakuychu.",
  siLluvia: "🌧️ ¿Sichus aswan utaq pisi paran?", siTemp: "🌡️ ¿Sichus aswan q'uñi kan?", siPrecio: "💰 ¿Sichus chanin wichan utaq uraykun?",
  siIgual: "kikin", siReset: "↺ Cheqaqman kutiy", siCol: "Atikuy", siFun: "Allin kanan watakuna", siIng: "Sapa watapi qullqi", siMejor: "Aswan aguantan: {c}.", siCalc: "Yupachkani…",
  // rimanakuy
  guT: "🖨️ Rimanakunapaq (imprimiy)", guCsv: "⬇ Yuyayniykuna (CSV)", guTitulo: "Muyuy · rimanakunapaq", guLugar: "Llaqta", guFecha: "P'unchaw",
  guIntro: "NASA 45 wata willakuykunamanta atikuykuna. Rimanakuychik, kuskataq akllaychik.", guPreg: "Rimanakunapaq tapukuykuna", guDijo: "Ayllu utaq yachaq nisqan:",
  guPat: "Kutipaqkuna, kutichisqaykipas", guQ1: "¿Ayllupi pipas {c} tarpurqanchu? ¿Imaynataq karqan?", guQ2: "¿Maypitaq {c} muhu kan? ¿Hayk'apitaq?",
  guQ3: "¿Pitaq {c} rantin, hayk'apitaq?", guQ4: "¿Hayk'aqtaq tarpuna qasamanta, ch'akimanta ayqinapaq?", guQ5: "¿Ayllu llamk'ayqa tarpuypi allaypi aypanchu?",
  guQ6: "¿Kay atikuyqa ayllu rimanakusqan muyuykunata (laymi, aynuqa) respetanchu?",
  ayudaComp: "Tablaqa kunan tarpusqaykita kimsa atikuywan tupachin, sapa siq'ipi. Q'umir ✓ aswan allinta rikuchin.",
  ayudaOpin: "Sapa atikuyta llamiy, imatam yuyanki niy. «Mana chakraypichu» nispaqa, Muyuy qichun.",
});

const CRITERIO = (() => {
  const K_OP = "muyuy-opiniones", K_PAT = "muyuy-patrones", K_PRE = "muyuy-precios";
  const st = { get(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } },
               set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
  const h = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const fmt = (v, d = 0) => Number(v).toLocaleString(LOCALE[LANG], { maximumFractionDigits: d, minimumFractionDigits: d }).replace(/^-/, "−");
  const tabla = () => (D && D.motor && window.MOTOR && MOTOR.tiene(D.sitio) ? MOTOR.tabla(D.sitio) : null);
  const RAZONES = ["semilla", "mercado", "trabajo", "herram", "plaga", "helada", "agua", "comunal", "gusto", "otro"];
  const yy = (y) => `${y}/${String(y + 1).slice(-2)}`;

  // ---------------------------------------------------------------- opiniones del agricultor (por lugar y rotación)
  const ops = () => (st.get(K_OP)[D.sitio] || {});
  function guardarOp(seq, o) { const all = st.get(K_OP); all[D.sitio] = { ...(all[D.sitio] || {}), [seq]: { ...o, f: hoyISO() } }; st.set(K_OP, all); }
  function borrarOp(seq) { const all = st.get(K_OP); if (all[D.sitio]) { delete all[D.sitio][seq]; st.set(K_OP, all); } }
  const descartadas = () => new Set(Object.entries(ops()).filter(([, o]) => o.v === "no").map(([q]) => q));
  const opinion = (seq) => ops()[seq] || null;

  // ---------------------------------------------------------------- precios de su feria
  const regionKey = () => D.region || (D.andina ? "sierra" : "costa");
  const precios = () => (st.get(K_PRE)[regionKey()] || {});
  function ingreso(seq, ing) {
    const T = tabla(), P = precios();
    if (!T) return ing;
    const s = seq.split("|").filter((c) => T[c] && T[c].precio_s_kg > 0 && T[c].rend_t_ha > 0);
    if (!s.some((c) => P[c] > 0)) return ing;
    const cost = seq.split("|").reduce((a, c) => a + ((T[c] && T[c].costo_s_ha) || 0), 0) / 3;
    const ref = s.map((c) => T[c].rend_t_ha * 1000 * T[c].precio_s_kg), tot = ref.reduce((a, b) => a + b, 0) || 1;
    const f = s.reduce((a, c, i) => a + ref[i] / tot * ((P[c] > 0 ? P[c] : T[c].precio_s_kg) / T[c].precio_s_kg), 0);
    return (ing + cost) * f - cost;
  }
  const usaPrecios = (seq) => { const P = precios(); return seq.split("|").filter((c) => P[c] > 0); };
  function preciosHtml() {
    const T = tabla();
    if (!T) return "";
    const P = precios();
    const ids = Object.keys(D.cultivos).filter((c) => T[c] && T[c].precio_s_kg > 0 && D.cultivos[c].factible !== false && D.cultivos[c].grupo !== "asociacion");
    const n = ids.filter((c) => P[c] > 0).length;
    return `<details class="rs-f pr-f"${n ? " open" : ""}><summary>${tr("prT")}${n ? ` · ${n}` : ""}</summary><p class="small">${tr("prS")}</p><div class="pr-grid">${ids.map((c) =>
      `<label class="pr-c">${cico(c, "mini")}<span>${h(cname(c))}</span><input type="number" min="0" step="0.1" inputmode="decimal" data-c="${c}" value="${P[c] > 0 ? P[c] : ""}" placeholder="${tr("prRef", { v: fmt(T[c].precio_s_kg, 2) })}"></label>`).join("")}</div></details>`;
  }
  function enlazarPrecios(box) {
    let t = null;
    $$(".pr-c input", box).forEach((i) => (i.oninput = () => {
      const all = st.get(K_PRE), P = { ...(all[regionKey()] || {}) }, v = parseFloat(i.value);
      if (v > 0) P[i.dataset.c] = v; else delete P[i.dataset.c];
      all[regionKey()] = P; st.set(K_PRE, all);
      clearTimeout(t); t = setTimeout(() => CAMPO.alOrden(), 400);
    }));
  }

  // ---------------------------------------------------------------- ¿qué tan seguro es esto?
  function seguridad(e, m) {
    const T = tabla() || {}, s = [...new Set(e.seq.split("|"))].filter((c) => (D.cultivos[c] || {}).grupo !== "descanso");
    const por = [], mejor = [];
    let p = 3;
    if (m.rob >= 4 && m.rob <= 6) { p -= 0.75; por.push(tr("sgAnio", { r: m.rob })); mejor.push(tr("mjPedazo")); }
    const baja = s.filter((c) => T[c] && T[c].confianza === "baja");
    if (baja.length) { p -= 0.75; por.push(tr("sgConf", { c: baja.map(cname).join(", ") })); mejor.push(tr("mjTec", { c: baja.map(cname).join(", ") })); }
    const dichas = String((D.perfil && D.perfil.rotacion_actual) || "");
    const nuevos = e.hoy ? [] : s.filter((c) => !dichas.split("|").includes(c));
    if (nuevos.length) { p -= 0.5; por.push(tr("sgNuevo", { c: nuevos.map(cname).join(", ") })); mejor.push(tr("mjMayores", { c: nuevos.map(cname).join(", ") })); }
    let comun = false; // precios y entrevista valen para todas: se dicen una vez, arriba de las fichas
    if (!usaPrecios(e.seq).length) { p -= 0.25; comun = true; }
    if (D.celda || /^c\d+_\d+$/.test(D.sitio)) { p -= 0.5; por.push(tr("sgCelda")); }
    if (!(D.perfil && D.perfil.entrevista)) { p -= 0.25; comun = true; }
    if (s.some((c) => (D.cultivos[c] || {}).grupo === "asociacion")) { p -= 0.25; por.push(tr("sgAsoc")); }
    if (!por.length) por.push(tr(comun ? "sgComun" : "sgOk"));
    const n = p >= 2.25 ? "alta" : p >= 1.25 ? "media" : "baja";
    return { n, por, mejor: [...new Set(mejor)] };
  }

  // ---------------------------------------------------------------- ficha: seguridad y opinión
  function fichaExtra(e, m) {
    const sg = seguridad(e, m), o = opinion(e.seq) || {};
    const chip = (k) => `<button type="button" class="op-r ${(o.r || []).includes(k) ? "on" : ""}" data-r="${k}" aria-pressed="${(o.r || []).includes(k)}">${tr("opR_" + k)}</button>`;
    return `<div class="es-sec seg seg-${sg.n}"><h5>${tr("segT", { n: `<span class="seg-b seg-${sg.n}">${tr("seg" + sg.n[0].toUpperCase() + sg.n.slice(1))}</span>` })}</h5>
        <p class="small"><b>${tr("segPor")}</b></p><ul>${sg.por.map((x) => `<li>${x}</li>`).join("")}</ul>
        ${sg.mejor.length ? `<p class="small"><b>${tr("segMejor")}</b></p><ul>${sg.mejor.map((x) => `<li>${x}</li>`).join("")}</ul>` : ""}</div>
      <div class="es-sec op${o.v === "duda" || o.v === "no" ? " op-pide" : ""}" data-seq="${h(e.seq)}"><h5>${tr("opT")}</h5>
        <div class="op-v" role="group">${["si", "duda", "no"].map((v) => `<button type="button" class="op-b ${o.v === v ? "on" : ""} op-${v}" data-v="${v}" aria-pressed="${o.v === v}">${tr("op" + v[0].toUpperCase() + v.slice(1))}</button>`).join("")}</div>
        <p class="small op-pq">${tr("opPorque")}</p><div class="op-rs">${RAZONES.map(chip).join("")}</div>
        <label class="op-n"><span class="small">${tr("opNota")}</span><input type="text" maxlength="200" value="${h(o.n || "")}"></label>
        <button type="button" class="btn-sec op-g">${tr("opGuardar")}</button></div>`;
  }
  // en la tarjeta de cada opción: una sola pregunta; el «¿Por qué?» aparece solo con «dudas» o «no»
  function opinionCard(seq) {
    const o = opinion(seq) || {};
    const chip = (k) => `<button type="button" class="op-r ${(o.r || []).includes(k) ? "on" : ""}" data-r="${k}" aria-pressed="${(o.r || []).includes(k)}">${tr("opR_" + k)}</button>`;
    return `<div class="es-sec op op-card${o.v && o.v !== "si" ? " op-abre" : ""}${o.v === "duda" || o.v === "no" ? " op-pide" : ""}" data-seq="${h(seq)}"><p class="op-q">${tr("opCardT")}</p>
      <div class="op-v" role="group">${["si", "duda", "no"].map((v) => `<button type="button" class="op-b ${o.v === v ? "on" : ""} op-${v}" data-v="${v}" aria-pressed="${o.v === v}">${tr("opC" + v[0].toUpperCase() + v.slice(1))}</button>`).join("")}</div>
      <p class="small op-pq">${tr("opPorque")}</p><div class="op-rs">${RAZONES.map(chip).join("")}</div>
      <label class="op-n"><span class="small">${tr("opNota")}</span><input type="text" maxlength="200" value="${h(o.n || "")}"></label>
      <button type="button" class="btn-sec op-g">${tr("opGuardar")}</button></div>`;
  }
  function enlazar(box) {
    $$(".es-sec.op", box).forEach((w) => {
      const seq = w.dataset.seq, hoy = D.perfil && seq === D.perfil.rotacion_actual;
      let sel = (opinion(seq) || {}).v || null;
      $$(".op-b", w).forEach((b) => (b.onclick = () => { sel = b.dataset.v; $$(".op-b", w).forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
        w.classList.toggle("op-pide", sel === "duda" || sel === "no");
        if (!w.classList.contains("op-card")) return;
        w.classList.toggle("op-abre", sel !== "si"); // «sí» se guarda de una vez; «dudas» o «no» piden el porqué
        if (sel === "si") { const o = opinion(seq) || {}; guardarOp(seq, { v: "si", r: o.r || [], n: o.n || "" }); toast(tr("opGuardada")); CAMPO.alOrden(); } }));
      $$(".op-r", w).forEach((b) => (b.onclick = () => { b.classList.toggle("on"); b.setAttribute("aria-pressed", b.classList.contains("on")); }));
      $(".op-g", w).onclick = () => {
        const r = $$(".op-r.on", w).map((b) => b.dataset.r), n = $(".op-n input", w).value.trim();
        if (!sel && !r.length && !n) { borrarOp(seq); return; }
        guardarOp(seq, { v: sel, r, n });
        if (sel === "no" && !hoy) { toast(tr("opQuitada")); lastTop = ""; renderTop(true).then(() => renderCustom()); }
        else { toast(tr("opGuardada")); CAMPO.alOrden(); }
      };
    });
    $$(".op-volver", document).forEach((b) => (b.onclick = () => { borrarOp(b.dataset.seq); lastTop = ""; renderTop(true).then(() => renderCustom()); }));
    const g = $("#guiaBtn"); if (g) g.onclick = imprimirGuia;
    const c = $("#guiaCsv"); if (c) c.onclick = csv;
  }
  // filas extra del comparador
  function filas(est, M) {
    const op = (e) => { const o = opinion(e.seq); return o && o.v ? tr("op" + o.v[0].toUpperCase() + o.v.slice(1)) : tr("opSin"); };
    return `<tr class="es-extra"><th scope="row">${tr("cSeg")} ${FACIL.que("seg")}</th>${est.map((e, i) => { const s = seguridad(e, M[i]).n; return `<td><span class="seg-b seg-${s}">${tr("seg" + s[0].toUpperCase() + s.slice(1))}</span></td>`; }).join("")}</tr>
      <tr class="es-extra"><th scope="row">${tr("cOp")} ${FACIL.que("op")}</th>${est.map((e) => `<td>${op(e)}</td>`).join("")}</tr>`;
  }
  function pie() {
    const ds = [...descartadas()];
    return `<details class="es-desc"><summary>${tr("opDesc")} (${ds.length})</summary>${ds.length ? `<ul>${ds.map((q) => { const o = opinion(q) || {};
      return `<li>${q.split("|").map((c) => h(cname(c))).join(" → ")}${(o.r || []).length ? ` · <i>${o.r.map((r) => tr("opR_" + r)).join(", ")}</i>` : ""}${o.n ? ` · «${h(o.n)}»` : ""}
        <button type="button" class="btn-sec op-volver" data-seq="${h(q)}">${tr("opVolver")}</button></li>`; }).join("")}</ul>` : `<p class="small">${tr("opNinguna")}</p>`}</details>
      <div class="guia-btns"><button type="button" class="btn-sec" id="guiaBtn">${tr("guT")}</button><button type="button" class="btn-sec" id="guiaCsv">${tr("guCsv")}</button></div>`;
  }

  // ---------------------------------------------------------------- patrones
  function patrones() {
    const T = tabla() || {}, C = D.cultivos, out = [];
    const sinCos = (q) => q.split("|").filter((c) => c === "descanso" || (C[c] || {}).grupo === "cobertura").length;
    const rows = Object.entries(D.rotaciones).filter(([q]) => sinCos(q) <= 1 && q.split("|").every((c) => C[c] && C[c].factible !== false));
    const fam = (c) => (T[c] || C[c] || {}).familia;
    const rasgo = (c, k) => CAMPO.rasgos(c)[k];
    const rasgos = {
      leg: (q) => { const s = q.split("|"); return s.some((c, i) => i < 2 && ["leguminosa", "cobertura"].includes((C[c] || {}).grupo) && T[s[i + 1]] && T[s[i + 1]].n_extraccion_suelo >= 45); },
      fam: (q) => { const s = q.split("|"); return s.some((c, i) => i && fam(c) === fam(s[i - 1]) && fam(c) !== "Descanso"); },
      desc: (q) => q.split("|").includes("descanso"),
      asoc: (q) => q.split("|").some((c) => (C[c] || {}).grupo === "asociacion"),
      seq: (q) => q.split("|").some((c) => rasgo(c, "seq")),
      cob: (q) => q.split("|").some((c) => rasgo(c, "cob")),
    };
    const met = { rob: (v) => v[F.rob] * 10, seco: (v) => v[F.seco] * 10, ero: (v) => v[F.ero] / 3 };
    const defs = [["leg", "paLeg", "rob", 1], ["fam", "paFam", "rob", 1], ["desc", "paDesc", "rob", 1], ["asoc", "paAsoc", "rob", 1], ["seq", "paSeq", "seco", 1], ["cob", "paCob", "ero", -1]];
    for (const [k, lab, mk, sentido] of defs) {
      const con = rows.filter(([q]) => rasgos[k](q)), sin = rows.filter(([q]) => !rasgos[k](q));
      if (con.length < 15 || sin.length < 15) continue;
      const media = (xs) => xs.reduce((a, [, v]) => a + met[mk](v), 0) / xs.length;
      const a = media(con), b = media(sin), d = a - b;
      const escala = mk === "ero" ? Math.max(1, b * 0.2) : 1;
      const fuerza = Math.abs(d) >= escala ? "fFuerte" : Math.abs(d) >= escala * 0.4 ? "fDebil" : "fNada";
      const txt = (x) => tr(mk === "rob" ? "mRob" : mk === "seco" ? "mSeco" : "mEro", { v: fmt(x, 1) });
      const mejor = sentido * d > 0;
      out.push({ id: k, t: tr(lab), r: mk === "ero" && b > 0 ? tr(d <= 0 ? "paEroMenos" : "paEroMas", { p: Math.round(Math.abs(d) / b * 100) }) : tr("paRes", { a: txt(a), b: txt(b), na: fmt(con.length), nb: fmt(sin.length) }), f: fuerza, signo: fuerza === "fNada" ? 0 : mejor ? 1 : -1 });
    }
    // patrones del clima: El Niño, La Niña y las campañas más secas
    const cl = D.motor && window.MOTOR && MOTOR.tiene(D.sitio) ? MOTOR.clima(D.sitio) : null;
    if (cl && D.clases) {
      const cls = {}; D.clases.forEach((c) => (cls[c.campania] = c));
      const grupo = (f) => cl.camp.filter((c) => cls[c.anio] && f(cls[c.anio]));
      const prom = (xs) => xs.reduce((a, c) => a + c.p, 0) / (xs.length || 1);
      for (const [k, lab, enso] of [["nino", "paNino", "El Niño"], ["nina", "paNina", "La Niña"]]) {
        const g = grupo((c) => c.enso === enso), o = grupo((c) => c.enso !== enso);
        if (g.length < 3) continue;
        const a = prom(g), b = prom(o), pc = (a - b) / b * 100;
        const d = Math.abs(pc) < 5 ? tr("paIgual") : tr(pc > 0 ? "paMas" : "paMenos", { v: fmt(Math.abs(pc)) });
        out.push({ id: k, t: tr(lab, { d, a: fmt(a), b: fmt(b), n: g.length }), r: "", f: Math.abs(pc) >= 15 ? "fFuerte" : Math.abs(pc) >= 5 ? "fDebil" : "fNada", signo: 0, clima: true });
      }
      const secos = [...cl.camp].sort((x, y) => x.p - y.p).slice(0, 5);
      const nN = secos.filter((c) => cls[c.anio] && cls[c.anio].enso === "El Niño").length;
      out.push({ id: "secos", t: tr("paSecos", { y: secos.map((c) => yy(c.anio)).join(", "), n: nN }), r: "", f: nN >= 3 ? "fFuerte" : nN >= 2 ? "fDebil" : "fNada", signo: 0, clima: true });
    }
    // por qué falla la rotación de hoy (alertas del motor)
    const act = D.perfil && D.perfil.rotacion_actual, va = act && D.rotaciones[act];
    if (va && va[F.rob] < 0.9) {
      const ale = va[F.ale].map((i) => (D.textos.es || [])[i] || "").join(" ");
      const causa = /helada/i.test(ale) ? "paCausaHel" : /exceso/i.test(ale) ? "paCausaExc" : /seca|agua|sequ/i.test(ale) || va[F.seco] < 0.6 ? "paCausaSeco" : null;
      if (causa) out.push({ id: "hoy", t: tr("paHoy", { c: tr(causa) }), r: "", f: "fDebil", signo: 0, clima: true });
    }
    return { out, n: rows.length };
  }
  let cachePat = { k: null, v: null };
  function patronesCache() { // dependen del lugar, del cálculo y del idioma, no de las prioridades
    const k = `${D.sitio}|${Object.keys(D.rotaciones).length}|${LANG}|${D.perfil && D.perfil.rotacion_actual}|${D._perfilMotor ? JSON.stringify(D._perfilMotor) : ""}`;
    if (cachePat.k !== k) cachePat = { k, v: patrones() };
    return cachePat.v;
  }
  function renderPatrones() {
    const box = $("#patrones");
    if (!box || !D) return;
    const { out, n } = patronesCache();
    if (!out.length) { box.innerHTML = ""; box.hidden = true; return; }
    box.hidden = false;
    const resp = st.get(K_PAT)[D.sitio] || {};
    const cont = { si: 0, no: 0 };
    Object.values(resp).forEach((r) => { if (r.v === "si") cont.si++; if (r.v === "no") cont.no++; });
    box.innerHTML = `<h3 class="section-sub">${tr("paT")} ${FACIL.que("patron")}</h3><p class="hint">${tr("paS", { n: fmt(n) })}</p>
      ${(() => { const item = (p) => { const r = resp[p.id] || {};
        return `<li class="pa ${p.signo > 0 ? "pos" : p.signo < 0 ? "neg" : ""}" data-id="${p.id}">
          <p class="pa-t">${p.clima ? "🌦️" : p.signo > 0 ? "📈" : p.signo < 0 ? "📉" : "↔️"} <b>${p.t}</b> <span class="pa-f ${p.f}">${tr(p.f)}</span></p>${p.r ? `<p class="pa-r">${p.r}</p>` : ""}
          <div class="pa-q"><span class="small">${tr("paPreg")}</span>${["si", "no", "nose"].map((v) => `<button type="button" class="pa-b ${r.v === v ? "on" : ""}" data-v="${v}" aria-pressed="${r.v === v}">${tr("pa" + v[0].toUpperCase() + v.slice(1))}</button>`).join("")}</div>
          <p class="pa-msg small">${r.v === "no" ? tr("paNoTxt") : r.v === "si" ? tr("paSiTxt") : ""}</p>
          <input type="text" class="pa-n" maxlength="160" placeholder="${tr("paNota")}" value="${h(r.n || "")}" ${r.v ? "" : "hidden"}></li>`; };
        // primero los patrones más claros; el resto, plegado
        const orden = [...out].sort((a, b) => ({ fFuerte: 0, fDebil: 1, fNada: 2 }[a.f] - { fFuerte: 0, fDebil: 1, fNada: 2 }[b.f]));
        const ver = orden.slice(0, 3), resto = orden.slice(3);
        return `<ul class="pa-l">${ver.map(item).join("")}</ul>` + (resto.length ? `<details class="pa-mas"><summary>${tr("paMasT", { n: resto.length })}</summary><ul class="pa-l">${resto.map(item).join("")}</ul></details>` : "");
      })()}
      <p class="small pa-res">${tr("paResumen", { s: cont.si, n: cont.no, t: out.length })}</p>`;
    $$(".pa", box).forEach((li) => {
      const id = li.dataset.id, save = (o) => { const all = st.get(K_PAT); all[D.sitio] = { ...(all[D.sitio] || {}), [id]: { ...((all[D.sitio] || {})[id] || {}), ...o } }; st.set(K_PAT, all); };
      $$(".pa-b", li).forEach((b) => (b.onclick = () => { save({ v: b.dataset.v }); renderPatrones(); }));
      $(".pa-n", li).onchange = (e) => save({ n: e.target.value.trim() });
    });
  }

  // ---------------------------------------------------------------- guía para conversar y CSV
  function imprimirGuia() {
    const est = CAMPO.estrategias(), area = $("#printArea"), resp = st.get(K_PAT)[D.sitio] || {}, { out } = patronesCache();
    const nuevos = (seq) => [...new Set(seq.split("|"))].filter((c) => (D.cultivos[c] || {}).grupo !== "descanso" && !String(D.perfil.rotacion_actual || "").split("|").includes(c));
    const bloques = est.map((e) => {
      const o = opinion(e.seq) || {}, nv = nuevos(e.seq).map(cname).join(", ");
      const qs = [nv && tr("guQ1", { c: nv }), nv && tr("guQ2", { c: nv }), nv && tr("guQ3", { c: nv }), tr("guQ4"), tr("guQ5"), D.andina && tr("guQ6"), ...CAMPO.preguntasLimita(nuevos(e.seq).length ? nuevos(e.seq) : [...new Set(e.seq.split("|"))].filter((c) => (D.cultivos[c] || {}).grupo !== "descanso"))].filter(Boolean);
      return `<section class="gu-e"><h2>${h(e.nombre)}: ${e.seq.split("|").map((c) => h(cname(c))).join(" → ")}</h2>
        <p>${tr("robust2", { n: ten(e.v[F.rob]) })} · ${tr("cSeg")}: <b>${tr("seg" + (s => s[0].toUpperCase() + s.slice(1))(seguridad(e, { rob: ten(e.v[F.rob]) }).n))}</b>${o.v ? ` · ${tr("cOp")}: <b>${tr("op" + o.v[0].toUpperCase() + o.v.slice(1))}</b>` : ""}${(o.r || []).length ? ` (${o.r.map((r) => tr("opR_" + r)).join(", ")})` : ""}${o.n ? ` · «${h(o.n)}»` : ""}</p>
        <p><b>${tr("guPreg")}</b></p><ol>${qs.map((q) => `<li>${q}</li>`).join("")}</ol>
        <p><b>${tr("guDijo")}</b></p><div class="gu-lineas"></div></section>`;
    }).join("");
    area.innerHTML = `<div class="guia"><h1>${tr("guTitulo")}</h1><p>${tr("guLugar")}: <b>${h(D.contexto.lugar)}</b> · ${tr("guFecha")}: ${new Date().toLocaleDateString(LOCALE[LANG])}</p>
      <p>${tr("guLimita")}: <b>${h(CAMPO.limitaResumen())}</b></p><p><i>${tr("guIntro")}</i></p>${bloques}
      <section class="gu-e"><h2>${tr("guPat")}</h2><ul>${out.map((p) => { const r = resp[p.id] || {}; return `<li>${p.t}${p.r ? ` — ${p.r.replace(/<[^>]+>/g, "")}` : ""}${r.v ? ` → <b>${tr("pa" + r.v[0].toUpperCase() + r.v.slice(1))}</b>` : ""}${r.n ? ` «${h(r.n)}»` : ""}</li>`; }).join("")}</ul></section></div>`;
    window.print();
  }
  function csv() {
    const q = (v) => (v == null ? "" : /[",\n;]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
    const filas = [["tipo", "lugar", "fecha", "clave", "respuesta", "razones", "nota"]];
    for (const [seq, o] of Object.entries(ops())) filas.push(["estrategia", D.contexto.lugar, o.f, seq, o.v || "", (o.r || []).join("|"), o.n || ""]);
    for (const [id, o] of Object.entries(st.get(K_PAT)[D.sitio] || {})) filas.push(["patron", D.contexto.lugar, "", id, o.v || "", "", o.n || ""]);
    for (const [c, p] of Object.entries(precios())) filas.push(["precio", D.contexto.lugar, "", c, p, "", "S/ por kg"]);
    const blob = new Blob(["﻿" + filas.map((r) => r.map(q).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `muyuy_opiniones_${D.sitio}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  return { opinionCard, descartadas, opinion, ingreso, usaPrecios, preciosHtml, enlazarPrecios, seguridad, fichaExtra, enlazar, filas, pie, renderPatrones };
})();
