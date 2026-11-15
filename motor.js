// Motor de Muyuy dentro de la web: las mismas ecuaciones de muyuy/engine.py (balance hídrico FAO-56, heladas, nitrógeno,
// carbono, erosión Rusle, plagas, granizo e ingreso) con el clima diario de la NASA ya preparado de cada lugar
// (scripts/build_motor.py). Así la app prueba en el teléfono, con o sin internet, todas las rotaciones con lo que
// contó el agricultor. Funciona también en Node (pruebas: tests/test_motor.js).
(function (raiz) {
  "use strict";
  let BASE = null;           // tablas de cultivos, constantes y textos (data/motor/base.json)
  const SITIOS = {};         // clima y datos de cada lugar ya leídos

  async function gunzip(buf) {
    if (typeof DecompressionStream !== "undefined") {
      const s = new Response(buf).body.pipeThrough(new DecompressionStream("gzip"));
      return new Uint8Array(await new Response(s).arrayBuffer());
    }
    return new Uint8Array(require("zlib").gunzipSync(Buffer.from(buf)));   // Node
  }

  // lee data/motor/<id>.bin: cabecera JSON, lluvia, ET0, Tmin (diferencias) y temperatura media mensual
  function leer(u8) {
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    const hl = dv.getUint32(0, true);
    const h = JSON.parse(new TextDecoder().decode(u8.subarray(4, 4 + hl)));
    const n = h.dias;
    let o = 4 + hl;
    const P = new Float64Array(n), E = new Float64Array(n), TN = new Float64Array(n);
    for (let i = 0; i < n; i++) P[i] = dv.getUint16(o + 2 * i, true) / 10;
    o += 2 * n;
    for (let i = 0; i < n; i++) E[i] = u8[o + i] / 10;
    o += n;
    let t = h.tn0;
    for (let i = 0; i < n; i++) { t += (u8[o + i] << 24) >> 24; TN[i] = t / 10; }
    o += n;
    const TM = new Float64Array(h.n_meses);
    for (let i = 0; i < h.n_meses; i++) TM[i] = dv.getInt16(o + 2 * i, true) / 10;
    o += 2 * h.n_meses;
    let E3 = null; // ET0 con Tmin 3 °C más fría (solo en la sierra)
    if (h.e3) { E3 = new Float64Array(n); for (let i = 0; i < n; i++) E3[i] = E[i] + ((u8[o + i] << 24) >> 24) / 10; }
    const [y0] = h.inicio.split("-").map(Number);
    const t0 = Date.UTC(y0, 7, 1);
    return { ...h, P, E, E3, TN, TM, t0, y0 };
  }

  async function cargar(id, fetchFn) {
    if (SITIOS[id]) return SITIOS[id];
    const f = fetchFn || fetch;
    if (!BASE) BASE = await (await f("data/motor/base.json")).json();
    const r = await f(`data/motor/${id}.bin`);
    if (!r.ok) throw new Error("sin datos del motor para " + id);
    SITIOS[id] = leer(await gunzip(await r.arrayBuffer()));
    return SITIOS[id];
  }
  const tiene = (id) => !!SITIOS[id];

  // ------------------------------------------------------------------ utilidades con las reglas de Python
  const DIA = 86400000;
  const dIdx = (S, ms) => Math.round((ms - S.t0) / DIA);            // día → índice en las series
  const roundPy = (x) => { const r = Math.round(x); return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r; }; // mitad al par
  const r = (x, d) => { const f = 10 ** d; return roundPy(x * f) / f; };
  const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  function pct(a, q) {                                               // np.percentile (interpolación lineal)
    const s = Float64Array.from(a).sort(), pos = (s.length - 1) * q / 100, lo = Math.floor(pos), hi = Math.ceil(pos);
    return s[lo] + (s[hi] - s[lo]) * (pos - lo);
  }
  function tmMes(S, ms) {                                            // temperatura media del mes de ese día
    const d = new Date(ms), k = (d.getUTCFullYear() - S.meses0[0]) * 12 + d.getUTCMonth() + 1 - S.meses0[1];
    return S.TM[Math.max(0, Math.min(S.TM.length - 1, k))];
  }

  // ------------------------------------------------------------------ suelo (muyuy/soil.py)
  function sueloAgricultor(s, textura) {
    const rep = textura && BASE.textura[textura];
    if (!rep) return { ...s };
    const sand = (s.sand + rep.sand) / 2, clay = (s.clay + rep.clay) / 2;
    return { ...s, sand, clay, silt: 100 - sand - clay, soc: s.soc + (rep.soc_extra || 0) / 2 };
  }
  // el análisis de suelo del agricultor reemplaza al mapa en lo que trae: textura y materia orgánica
  function sueloLab(s, lab) {
    if (!lab) return s;
    const out = { ...s };
    if (lab.arena != null && lab.arcilla != null && lab.arena + lab.arcilla <= 100) { out.sand = lab.arena; out.clay = lab.arcilla; out.silt = 100 - lab.arena - lab.arcilla; }
    if (lab.mo != null) out.soc = Math.max(lab.mo / 1.724 * 10, 1); // % de materia orgánica → g/kg de carbono
    return out;
  }
  function hidraulica(s) {                                           // Saxton y Rawls (2006)
    const S = s.sand / 100, C = s.clay / 100, om = s.soc / 10 * 1.724;
    const t1500 = -0.024 * S + 0.487 * C + 0.006 * om + 0.005 * S * om - 0.013 * C * om + 0.068 * S * C + 0.031;
    const wp = t1500 + (0.14 * t1500 - 0.02);
    const t33 = -0.251 * S + 0.195 * C + 0.011 * om + 0.006 * S * om - 0.027 * C * om + 0.452 * S * C + 0.299;
    const fc = t33 + (1.283 * t33 ** 2 - 0.374 * t33 - 0.015);
    return r(1000 * (fc - wp), 1);
  }
  function factorK(s) {                                              // Williams (EPIC, 1995)
    const sa = s.sand, si = s.silt, cl = s.clay, oc = s.soc / 10, sn = 1 - sa / 100;
    const a = 0.2 + 0.3 * Math.exp(-0.256 * sa * (1 - si / 100)), b = (si / (cl + si)) ** 0.3;
    const c = 1 - 0.25 * oc / (oc + Math.exp(3.72 - 2.95 * oc)), d = 1 - 0.7 * sn / (sn + Math.exp(-5.51 + 22.9 * sn));
    return r(0.1317 * a * b * c * d, 4);
  }
  function factorLS(slope, len = 30) {
    const th = Math.atan(slope / 100), m = slope >= 5 ? 0.5 : slope >= 3.5 ? 0.4 : slope >= 1 ? 0.3 : 0.2;
    return r((len / 22.13) ** m * (65.41 * Math.sin(th) ** 2 + 4.56 * Math.sin(th) + 0.065), 3);
  }
  const socStock = (s) => s.soc / 1000 * s.bdod * 1000 * 0.3 * 10000 / 1000;
  const nTotal = (s) => s.nitrogen / 1000 * s.bdod * 1000 * 0.3 * 10000;

  // ------------------------------------------------------------------ heladas que recuerda el agricultor (climate.py)
  function offsetHeladas(S, umbral, n) {
    const fin = new Date(S.t0 + (S.dias - 1) * DIA).getUTCFullYear() - 1;
    let best = 0, err0 = 1e9;
    for (let k = 0; k <= 24; k++) {
      const off = 2 - 0.25 * k;
      let c = 0;
      for (let y = fin - 4; y <= fin; y++) {
        const a = Math.max(0, dIdx(S, Date.UTC(y, 8, 1))), b = Math.min(S.dias - 1, dIdx(S, Date.UTC(y + 1, 4, 31)));
        let hay = false;
        for (let i = a; i <= b && !hay; i++) {
          const mo = new Date(S.t0 + i * DIA).getUTCMonth() + 1;
          if ([11, 12, 1, 2, 3].includes(mo) && S.TN[i] + off < umbral) hay = true;
        }
        c += hay ? 1 : 0;
      }
      const err = Math.abs(c - n);
      if (err < err0 - 1e-9) { best = off; err0 = err; }
      if (err === 0) break;
    }
    return best;
  }

  // ------------------------------------------------------------------ paso 1: cada cultivo en cada campaña
  function curvaKc(c, n) {
    const l1 = roundPy(c.f_ini * n), l2 = roundPy(c.f_des * n), l3 = roundPy(c.f_med * n), l4 = n - l1 - l2 - l3;
    const kc = [];
    for (let i = 0; i < l1; i++) kc.push(c.kc_ini);
    for (let i = 0; i < l2; i++) kc.push(c.kc_ini + (c.kc_med - c.kc_ini) * i / l2);
    for (let i = 0; i < l3; i++) kc.push(c.kc_med);
    for (let i = 0; i < l4; i++) kc.push(l4 === 1 ? c.kc_med : c.kc_med + (c.kc_fin - c.kc_med) * i / (l4 - 1));
    return kc;
  }
  // cuánta agua puede sacar la chacra en un día sin encharcarse (mm/día; muyuy/engine.py, drenaje_diario): lo que el suelo
  // deja pasar hacia abajo según su arcilla (DREN_MM, calibrado), por (1 + pendiente / DREN_PEND_REF) porque en ladera
  // el agua corre fuera de la chacra. Solo el agua que pasa de eso cuenta como encharcamiento.
  function drenaje(slope, clay) {
    const K = BASE.k, ARC = K.DREN_ARCILLA || [5, 15, 30, 45], MM = K.DREN_MM || [27, 13.7, 4.7, 1.8], sr = K.DREN_PEND_REF || 1;
    let d = clay <= ARC[0] ? MM[0] : MM[MM.length - 1];
    for (let i = 1; i < ARC.length; i++) if (clay > ARC[i - 1] && clay <= ARC[i]) { d = MM[i - 1] + (MM[i] - MM[i - 1]) * (clay - ARC[i - 1]) / (ARC[i] - ARC[i - 1]); break; }
    return d * (1 + Math.max(0, slope) / sr);
  }
  function campania(S, c, y, adt, riego, toff, E, dren = 0) {
    const K = BASE.k;
    const sy = c.siembra_mes >= 8 ? y : y + 1, n = c.ciclo_dias;
    const sow = Date.UTC(sy, c.siembra_mes - 1, 15), harvest = sow + (n - 1) * DIA, spin = Date.UTC(y, 7, 1);
    const a = dIdx(S, spin), b = dIdx(S, harvest);
    if (a < 0 || b > S.dias - 1) return null;
    const taw = adt * c.raiz_m, raw = c.p_agotamiento * taw, nSpin = dIdx(S, sow) - a;
    const kc = new Array(nSpin).fill(0.3).concat(curvaKc(c, n));
    const sinCosecha = K.NO_HARVEST.includes(c.grupo);
    let dr = 0.8 * taw, etc = 0, eta = 0, exc = 0, irr = 0;
    for (let i = 0; i <= b - a; i++) {
      if (i >= nSpin && kc[i] > 0 && dr > raw && irr < riego && !sinCosecha) { const dose = Math.min(dr, riego - irr); dr -= dose; irr += dose; }
      const ks = dr <= raw ? 1 : Math.max(0, (taw - dr) / ((1 - c.p_agotamiento) * taw));
      const e = kc[i] * E[a + i], ea = ks * e, nw = dr - S.P[a + i] + ea;
      if (i >= nSpin) { etc += e; eta += ea; exc += Math.max(0, -nw - dren); }
      dr = Math.min(taw, Math.max(0, nw));
    }
    const deficit = etc > 0 ? 1 - eta / etc : 0;
    const s0 = dIdx(S, sow), s1 = dIdx(S, harvest);
    let lluvia = 0, tsum = 0;
    for (let i = s0; i <= s1; i++) { lluvia += S.P[i]; tsum += tmMes(S, S.t0 + i * DIA); }
    let noches = 0;
    if (c.grupo !== "descanso") {
      const f0 = s0 + Math.trunc(c.fase_sens_ini * n), f1 = s0 + Math.trunc(c.fase_sens_fin * n);
      for (let i = f0; i <= Math.min(f1, S.dias - 1); i++) if (S.TN[i] + toff < c.helada_umbral_c) noches++;
    }
    return { deficit, perdida_helada: 1 - (1 - K.FROST_LOSS_PER_NIGHT) ** noches,
             perdida_exceso: (c.sens_exceso || 0) * Math.min(1, exc / K.EXCESS_REF_MM),
             rend_agua: Math.max(0, 1 - c.ky * deficit), lluvia, tmedia: tsum / (s1 - s0 + 1), riego_mm: irr };
  }

  // ------------------------------------------------------------------ paso 2: cada secuencia en las ventanas de 3 años
  function plagas(seq, C, prev) {
    const K = BASE.k, full = (prev ? [prev] : []).concat(seq), off = prev ? 1 : 0;
    return seq.map((_, k) => {
      const i = k + off, fam = C[full[i]].familia;
      if (fam === "Descanso") return 0;
      const sol = fam === "Solanaceae";
      let p = 0;
      if (i >= 1 && C[full[i - 1]].familia === fam) p += sol ? K.PEST_SAME_FAMILY_SOLANACEAE : K.PEST_SAME_FAMILY;
      if (i >= 2 && C[full[i - 2]].familia === fam) p += sol ? K.PEST_GAP_ONE_SOLANACEAE : K.PEST_GAP_ONE;
      return Math.min(p, 0.8);
    });
  }

  function evaluar(ctx, seq) {
    const K = BASE.k, C = ctx.C, f = ctx.farm, years = ctx.years, nw = years.length - K.CAMPAIGNS + 1;
    const pests = plagas(seq, C, f.cultivo_anterior);
    const hail_p = f.granizo_anios / 5;
    let n_carry = new Float64Array(nw).fill(K.N_START + (f.cultivo_anterior ? C[f.cultivo_anterior].n_aporte_residual * 0.5 : 0));
    let soc = new Float64Array(nw).fill(ctx.soc0);
    const ero = new Float64Array(nw), income = new Float64Array(nw), irrig = new Float64Array(nw), okAll = new Array(nw).fill(true);
    const water = [], frost = [], steps = [], campOk = [];
    seq.forEach((cid, k) => {
      const c = C[cid], A = ctx.arr[cid];
      const abono = f.usa_abono ? c.n_abono_tipico : 0;
      const ok = new Array(nw), ws = new Float64Array(nw), fr = new Float64Array(nw), life = new Float64Array(nw);
      const sinCosecha = K.NO_HARVEST.includes(c.grupo);
      let sDef = 0, sHel = 0, sExc = 0, sNs = 0, sYr = 0, sEro = 0;
      const nCar = new Float64Array(nw);
      for (let w = 0; w < nw; w++) {
        const j = k + w;
        const deficit = A.deficit[j], fl = A.perdida_helada[j], wl = A.perdida_exceso[j], ra = A.rend_agua[j];
        irrig[w] += A.riego_mm[j];
        const ft = 2 ** ((A.tmedia[j] - 15) / 10);
        const navail = n_carry[w] + ctx.n_tot * K.N_MIN_RATE * ft + abono;
        const base = ra * (1 - fl) * (1 - wl), demand = c.n_extraccion_suelo * base;
        const nsat = demand > 0 ? Math.min(1, navail / Math.max(demand, 1e-9)) : 1;
        const yr = base * (0.4 + 0.6 * nsat) * (1 - pests[k]) * (1 - hail_p * c.sens_granizo * K.HAIL_DAMAGE);
        const fix = c.n_aporte_residual * (K.FIXES_N.includes(c.grupo) ? ra : 1);
        nCar[w] = (navail - Math.min(navail, demand)) * K.N_RETENTION + fix;
        const cin = (c.residuo_c_t_ha * (c.grupo !== "descanso" ? ra : 1) + abono * K.MANURE_C_PER_KG_N) * K.SOC_HUMIFICATION;
        soc[w] = soc[w] + cin - soc[w] * K.SOC_DECOMP_RATE * ft * K.TILLAGE[c.grupo];
        const e = 0.0483 * Math.max(A.lluvia[j], 0) ** 1.61 * ctx.k_fac * ctx.ls * c.factor_c_rusle * ctx.p_fac;
        ero[w] += e;
        income[w] += c.rend_t_ha * 1000 * yr * c.precio_s_kg - c.costo_s_ha;
        ok[w] = sinCosecha ? true : deficit <= K.MAX_DEFICIT && fl <= K.MAX_FROST && wl <= K.MAX_FROST && nsat >= K.MIN_N;
        ws[w] = 1 - deficit; fr[w] = fl;
        okAll[w] = okAll[w] && ok[w];
        const dsoc = (soc[w] - ctx.soc0) / ctx.soc0;
        life[w] = 100 * (0.35 * Math.min(1, nCar[w] / 60) + 0.35 * Math.min(1, Math.max(0, 0.5 + 25 * dsoc))
                         + 0.30 * (1 - Math.min(1, ero[w] / (K.EROSION_TOLERANCE * (k + 1)))));
        sDef += deficit; sHel += fl; sExc += wl; sNs += nsat; sYr += yr; sEro += e;
      }
      n_carry = nCar;
      if (!sinCosecha) { water.push(ws); frost.push(fr); }
      campOk.push(ok);
      steps.push({ cultivo: cid, deficit: sDef / nw, perdida_helada: sHel / nw, perdida_exceso: sExc / nw,
                   vida_suelo: mean(life), erosion_t_ha: sEro / nw, satisf_n: sNs / nw, rend_rel: sYr / nw, plagas: pests[k] });
    });
    const iy = Array.from(income, (x) => x / K.CAMPAIGNS);
    const wsM = water.length ? Array.from({ length: nw }, (_, w) => mean(water.map((a) => a[w]))) : new Array(nw).fill(1);
    const porClase = {};
    for (const key of ["El Niño", "La Niña", "Neutro", "seco", "normal", "húmedo"]) {
      const col = ["El Niño", "La Niña", "Neutro"].includes(key) ? 0 : 1;
      let hits = 0, tot = 0;
      for (let k = 0; k < K.CAMPAIGNS; k++) for (let w = 0; w < nw; w++) {
        if (ctx.clases[years[k + w]][col] === key) { tot++; if (campOk[k][w]) hits++; }
      }
      porClase[key] = tot ? hits / tot : null;
    }
    let worst = 0;
    iy.forEach((x, i) => { if (x < iy[worst]) worst = i; });
    return {
      secuencia: seq.join("|"), robustez: okAll.filter(Boolean).length / nw, por_clase: porClase,
      ventanas_ok: okAll.map((x) => (x ? "1" : "0")).join(""),
      agua_media: mean(wsM), agua_p10: pct(wsM, 10), ingreso_medio: mean(iy), ingreso_p10: pct(iy, 10),
      ingreso_peor: iy[worst], peor_anio: years[worst], n_final: mean(n_carry),
      soc_cambio_pct: mean(Array.from(soc, (x) => (x - ctx.soc0) / ctx.soc0)) * 100, erosion_total: mean(ero),
      plagas_total: pests.reduce((s, x) => s + x, 0), riego_medio: mean(irrig) / K.CAMPAIGNS, pasos: steps,
    };
  }

  // ------------------------------------------------------------------ paso 3: puntajes 0-100
  function puntajes(rows) {
    const norm = (vals, inv) => {
      const lo = Math.min(...vals), hi = Math.max(...vals);
      return vals.map((x) => { const v = hi > lo ? (x - lo) / (hi - lo) : 0.5; return inv ? 1 - v : v; });
    };
    const col = (f) => rows.map(f);
    const seg = norm(col((x) => 0.5 * x.agua_media + 0.5 * x.agua_p10));
    const conRiego = Math.max(...col((x) => x.riego_medio)) > 0, rie = norm(col((x) => x.riego_medio), true);
    const ing = norm(col((x) => 0.5 * x.ingreso_medio + 0.5 * x.ingreso_p10));
    const nf = norm(col((x) => x.n_final)), so = norm(col((x) => x.soc_cambio_pct));
    const er = norm(col((x) => x.erosion_total), true), pl = norm(col((x) => x.plagas_total), true), pe = norm(col((x) => x.ingreso_peor));
    rows.forEach((x, i) => {
      x.p_agua = 100 * (conRiego ? 0.5 * seg[i] + 0.5 * rie[i] : seg[i]);
      x.p_ingreso = 100 * ing[i];
      x.p_suelo = 100 * (0.30 * nf[i] + 0.30 * so[i] + 0.25 * er[i] + 0.15 * pl[i]);
      x.p_riesgo = 100 * (0.6 * x.robustez + 0.2 * (x.por_clase["El Niño"] || 0) + 0.2 * pe[i]);
    });
    return rows;
  }

  // ------------------------------------------------------------------ razones y alertas (muyuy/explain.py)
  function tradicional(seq, C) {
    const g = seq.map((s) => C[s].grupo);
    if (g[0] !== "tuberculo") return false;
    const l = g.slice(1);
    return l.every((x) => ["tuberculo", "pseudocereal", "cereal", "leguminosa", "asociacion", "descanso"].includes(x)) &&
      l.some((x) => ["cereal", "leguminosa", "pseudocereal", "asociacion", "descanso"].includes(x));
  }
  function razones(ctx, row) {
    const C = ctx.C, seq = row.secuencia.split("|"), prev = ctx.farm.cultivo_anterior;
    const raz = [], ale = [];
    const full = (prev && C[prev] ? [prev] : []).concat(seq);
    for (let i = 1; i < full.length; i++) {
      if (["leguminosa", "cobertura"].includes(C[full[i - 1]].grupo) && C[full[i]].n_extraccion_suelo >= 45) raz.push(["razon_leg", { a: full[i - 1], b: full[i] }]);
    }
    const cob = seq.find((s) => C[s].grupo === "cobertura");
    if (cob) raz.push(["razon_cobertura", { a: cob }]);
    if (row.plagas_total === 0) raz.push([C.papa ? "razon_familia_papa" : "razon_familia", {}]);
    else {
      const fams = full.map((s) => C[s].familia);
      const rep = [...new Set(fams.filter((x, j) => j && x === fams[j - 1] && x !== "Descanso"))].sort();
      if (rep.length) ale.push(["alerta_familia", { f: rep }]);
    }
    if (seq.includes("descanso")) raz.push(["razon_descanso", { d: ctx.region }]);
    if (tradicional(seq, C)) raz.push(["razon_tradicional", {}]);
    seq.forEach((cid, k) => {
      if (["descanso", "cobertura"].includes(C[cid].grupo)) return;
      const st = row.pasos[k];
      if (st.perdida_helada >= 0.10) ale.push(["alerta_helada", { c: cid }]);
      if (st.perdida_exceso >= 0.08) ale.push(["alerta_exceso", { c: cid }]);
      if (st.deficit >= 0.30) ale.push(["alerta_seco", { c: cid }]);
    });
    const eroAnio = row.erosion_total / seq.length;
    if (eroAnio > BASE.k.EROSION_TOLERANCE) ale.push(["alerta_erosion", { t: roundPy(eroAnio) }]);
    return [raz, ale];
  }
  function escribir(item, ctx, lang) {
    const [key, p] = item, kw = {};
    for (const [k, v] of Object.entries(p)) {
      if (["a", "b", "c"].includes(k)) { const nm = ctx.C[v].nombres[lang] || ctx.C[v].nombres.es; kw[k] = k === "a" || lang === "qu" ? nm : nm.toLowerCase(); }
      else if (k === "d") kw[k] = BASE.descanso[v][lang];
      else if (k === "f") kw[k] = v.map((x) => BASE.familias[lang][x] || x).join(lang === "en" ? " and " : " y ");
      else kw[k] = v;
    }
    const d = BASE.textos[key];
    let s = d[lang] || d.es;
    if (s.includes("{C}")) kw.C = (kw.c || "").charAt(0).toUpperCase() + (kw.c || "").slice(1).toLowerCase();
    s = s.replace(/\{(\w+)\}/g, (_, k) => (k in kw ? kw[k] : `{${k}}`));
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // ------------------------------------------------------------------ todo junto: rotaciones en el formato de la web
  // perfil: cultivo_anterior, heladas_campanias, granizo_anios, riego_mm, textura, terrazas, usa_abono
  // «¿Y si…?»: el mismo clima diario con más o menos lluvia y más calor. La ET0 sube ~3 % por °C (sensibilidad típica
  // de Penman-Monteith en los Andes; aproximación documentada en docs/12). No es un pronóstico: es un ensayo.
  function perturbar(S, cl) {
    // clima de 2050 (método delta): cambio de cada mes en lluvia y temperatura. La demanda de agua sube 3 % por grado, como en
    // «¿Y si…?»; scripts/build_futuro.py la recalcula con Penman-Monteith porque tiene todas las variables diarias.
    if (cl.meses) {
      const { dtmax, dtmin, pr } = cl.meses, dm = dtmax.map((x, i) => (x + dtmin[i]) / 2);
      const P = new Float64Array(S.dias), TN = new Float64Array(S.dias), E = new Float64Array(S.dias), E3 = S.E3 ? new Float64Array(S.dias) : null;
      for (let i = 0; i < S.dias; i++) {
        const m = new Date(S.t0 + i * DIA).getUTCMonth(), fe = 1 + 0.03 * dm[m];
        P[i] = S.P[i] * pr[m]; TN[i] = S.TN[i] + dtmin[m]; E[i] = S.E[i] * fe;
        if (E3) E3[i] = S.E3[i] * fe;
      }
      const m0 = (S.meses0 ? S.meses0[1] : 8) - 1;
      return { ...S, P, TN, E, E3, TM: S.TM.map((x, j) => x + dm[(m0 + j) % 12]) };
    }
    const fp = 1 + (cl.lluvia || 0), dt = cl.temp || 0, fe = 1 + 0.03 * dt;
    if (fp === 1 && !dt) return S;
    return { ...S, P: S.P.map((x) => x * fp), TN: S.TN.map((x) => x + dt), TM: S.TM.map((x) => x + dt),
             E: S.E.map((x) => x * fe), E3: S.E3 ? S.E3.map((x) => x * fe) : null };
  }
  // perfil.clima = {lluvia: −0.4…+0.4, temp: 0…+4}; perfil.solo = ["a|b|c", …] prueba solo esas rotaciones (más rápido)
  function calcular(id, perfil = {}, langs = ["es", "en", "qu"]) {
    const S = perfil.clima ? perturbar(SITIOS[id], perfil.clima) : SITIOS[id];
    const C = BASE.tablas[S.tabla];
    const farm = { cultivo_anterior: perfil.cultivo_anterior && C[perfil.cultivo_anterior] ? perfil.cultivo_anterior : null,
                   granizo_anios: perfil.granizo_anios || 0, riego_mm: perfil.riego_mm || 0, terrazas: !!perfil.terrazas,
                   usa_abono: perfil.usa_abono !== false };
    // en 2050 se mantiene la calibración de heladas con el clima de hoy, como en scripts/build_futuro.py
    const refH = perfil.clima && perfil.clima.meses ? SITIOS[id] : S;
    const toff = perfil.heladas_campanias != null && C.papa ? offsetHeladas(refH, C.papa.helada_umbral_c, perfil.heladas_campanias) : 0;
    const soil = sueloLab(sueloAgricultor(S.soil, perfil.textura), perfil.lab), adt = hidraulica(soil), dren = drenaje(S.slope, soil.clay);
    // con Tmin desplazada también cambia la ET0 (climate.prepare_climate): entre 0 y −3 °C se interpola
    let E = S.E;
    if (toff && S.E3) { const f = toff / -3; E = S.E.map((x, i) => Math.max(0, x + (S.E3[i] - x) * f)); }
    // paso 1: tabla de campañas; solo los años que todos los cultivos completan
    const arr = {}, valid = {};
    for (const cid of Object.keys(C)) {
      arr[cid] = { deficit: [], perdida_helada: [], perdida_exceso: [], rend_agua: [], lluvia: [], tmedia: [], riego_mm: [] };
      valid[cid] = new Set();
      for (const y of S.anios) {
        const x = campania(S, C[cid], y, adt, farm.riego_mm, toff, E, dren);
        if (!x) continue;
        valid[cid].add(y);
        for (const k in arr[cid]) arr[cid][k][y] = x[k];
      }
    }
    const years = S.anios.filter((y) => Object.values(valid).every((v) => v.has(y)));
    for (const cid in arr) for (const k in arr[cid]) arr[cid][k] = years.map((y) => arr[cid][k][y]);
    const ctx = { C, farm, years, arr, clases: S.clases, region: S.region, soc0: socStock(soil), n_tot: nTotal(soil),
                  k_fac: factorK(soil), ls: factorLS(S.slope), p_fac: farm.terrazas ? 0.5 : 1 };
    const feas = Object.keys(C).filter((c) => C[c].alt_min_m <= S.elev && S.elev <= C[c].alt_max_m);
    const rows = [];
    if (perfil.solo) { for (const q of perfil.solo) { const s = q.split("|"); if (s.length === 3 && s.every((c) => C[c])) rows.push(evaluar(ctx, s)); } }
    else for (const a of feas) for (const b of feas) for (const c of feas) rows.push(evaluar(ctx, [a, b, c]));
    puntajes(rows);
    // formato de la web (scripts/build_app_data.py): textos sin repetir, cada rotación apunta a los suyos
    const items = [], idx = new Map(), tid = (it) => { const k = JSON.stringify(it); if (!idx.has(k)) { idx.set(k, items.length); items.push(it); } return idx.get(k); };
    const rot = {};
    for (const x of rows) {
      const [raz, ale] = razones(ctx, x), pc = x.por_clase;
      rot[x.secuencia] = [r(x.p_agua, 1), r(x.p_ingreso, 1), r(x.p_suelo, 1), r(x.p_riesgo, 1), r(x.robustez, 3), r(pc["El Niño"] || 0, 3),
        r(pc.seco || 0, 3), roundPy(x.ingreso_medio), r(x.erosion_total, 1), r(x.soc_cambio_pct, 2), x.pasos.map((s) => roundPy(s.vida_suelo)),
        x.ventanas_ok, raz.map(tid), ale.map(tid), x.peor_anio, r(pc["La Niña"] || 0, 3), roundPy(x.riego_medio)];
    }
    const textos = {};
    for (const l of langs) textos[l] = items.map((it) => escribir(it, ctx, l));
    const out = { rotaciones: rot, textos, anios: years, factibles: feas, tmin_offset: toff, adt, _campanias: arr };
    if (perfil.detalle) out._pasos = Object.fromEntries(rows.map((x) => [x.secuencia, {
      p: x.pasos.map((q) => [r(q.deficit, 3), r(q.perdida_helada, 3), r(q.satisf_n, 3), r(q.rend_rel, 3), r(q.plagas, 3), r(q.erosion_t_ha, 3), r(q.vida_suelo, 3)]),
      n_final: r(x.n_final, 1), agua_media: r(x.agua_media, 3), ingreso_p10: roundPy(x.ingreso_p10) }]));
    return out;
  }

  // cultivos en el formato de la web (nombre, familia, meses, color, si se dan a esa altura y su plan de campaña)
  const COLORES = { tuberculo: "#7b2cbf", raiz: "#b0399b", leguminosa: "#2e9d3e", cereal: "#f9a825", pseudocereal: "#ef6c00",
                    fibra: "#5c8fb3", hortaliza: "#c2185b", asociacion: "#7cb342", cobertura: "#00897b", descanso: "#a5d6a7" };
  function cultivos(id, riego = 0) {
    const S = SITIOS[id], C = BASE.tablas[S.tabla], out = {};
    for (const [cid, c] of Object.entries(C)) {
      const pl = S.planes[cid];
      const plan = {};
      if (pl) for (const l of Object.keys(pl.sin)) { plan[l] = pl.sin[l].slice(); if (riego && pl.con_siembra[l] && plan[l].length) plan[l][0] = pl.con_siembra[l]; }
      out[cid] = { nombre: c.nombres.es, nombres: c.nombres, nombre_qu: c.nombre_qu, familia: c.familia, grupo: c.grupo,
                   siembra: c.siembra_mes, cosecha: c.cosecha, color: COLORES[c.grupo], factible: c.alt_min_m <= S.elev && S.elev <= c.alt_max_m, plan };
    }
    return out;
  }

  // ------------------------------------------------------------------ la chacra exacta, con internet (muyuy/parcela.py)
  // En el teléfono: NASA Power (clima diario 1981-2026), Copernicus DEM 90 m (altura y pendiente, vía Open-Meteo) y
  // SoilGrids (suelo). Se prepara el clima como en muyuy/climate.py y queda listo para el mismo motor.
  const esat = (t) => 0.6108 * Math.exp(17.27 * t / (t + 237.3));
  function et0PM(tmax, tmin, rs, u2, rh, doy, lat, z) {            // FAO-56 ec. 6 (climate.et0_penman_monteith)
    const phi = lat * Math.PI / 180, dr = 1 + 0.033 * Math.cos(2 * Math.PI * doy / 365);
    const dec = 0.409 * Math.sin(2 * Math.PI * doy / 365 - 1.39);
    const ws = Math.acos(Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(dec))));
    const ra = 24 * 60 / Math.PI * 0.0820 * dr * (ws * Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.sin(ws));
    const tmean = (tmax + tmin) / 2;
    if (!(rs >= 0)) rs = 0.16 * Math.sqrt(Math.max(tmax - tmin, 0)) * ra;   // sin radiación: Hargreaves-Samani
    const es = (esat(tmax) + esat(tmin)) / 2, ea = rh / 100 * es;
    const delta = 4098 * esat(tmean) / (tmean + 237.3) ** 2, gamma = 0.000665 * 101.3 * ((293 - 0.0065 * z) / 293) ** 5.26;
    const rso = (0.75 + 2e-5 * z) * ra, rns = 0.77 * rs;
    const rnl = 4.903e-9 * ((tmax + 273.16) ** 4 + (tmin + 273.16) ** 4) / 2 * (0.34 - 0.14 * Math.sqrt(Math.max(ea, 0)))
      * (1.35 * Math.min(1, Math.max(0.25, rs / rso)) - 0.35);
    const et0 = (0.408 * delta * (rns - rnl) + gamma * 900 / (tmean + 273) * u2 * (es - ea)) / (delta + gamma * (1 + 0.34 * u2));
    return Math.max(0, et0);
  }
  const ejeAndino = (lat) => -79.5 + (Math.max(5, -lat) - 5) * (8.5 / 12);
  const TABLA = { sierra: "cultivos.csv", costa: "cultivos_costa_norte.csv", selva: "cultivos_selva.csv" };

  async function bajarJSON(url, ms = 90000) {
    const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const t = ctl && setTimeout(() => ctl.abort(), ms);
    try {
      const r = await fetch(url, ctl ? { signal: ctl.signal } : undefined);
      if (!r.ok) throw new Error(`${new URL(url).hostname}: ${r.status}`);
      return await r.json();
    } finally { if (t) clearTimeout(t); }
  }
  // altura y pendiente: ventana de 3x3 puntos cada 90 m y método de Horn (data_sources.fetch_elevation)
  async function relieve(lat, lon, paso = 90) {
    const dlat = paso / 111320, dlon = paso / (111320 * Math.cos(lat * Math.PI / 180));
    const pts = [1, 0, -1].flatMap((i) => [-1, 0, 1].map((j) => [lat + i * dlat, lon + j * dlon]));
    const js = await bajarJSON(`https://api.open-meteo.com/v1/elevation?latitude=${pts.map((p) => p[0].toFixed(6)).join(",")}&longitude=${pts.map((p) => p[1].toFixed(6)).join(",")}`, 30000);
    const [a, b, c, d, e, f, g, h, i] = js.elevation;
    const dzdx = ((c + 2 * f + i) - (a + 2 * d + g)) / (8 * paso), dzdy = ((g + 2 * h + i) - (a + 2 * b + c)) / (8 * paso);
    return { elev: e, slope: r(Math.hypot(dzdx, dzdy) * 100, 2) };
  }
  // suelo 0-30 cm de SoilGrids (data_sources.soil_summary); si no responde, el del punto calculado más cercano
  async function sueloSG(lat, lon) {
    const props = ["clay", "sand", "silt", "soc", "phh2o", "nitrogen", "bdod"];
    const q = `lon=${lon.toFixed(4)}&lat=${lat.toFixed(4)}&value=mean&` + props.map((p) => "property=" + p).join("&") + "&depth=0-5cm&depth=5-15cm&depth=15-30cm";
    const js = await bajarJSON("https://rest.isric.org/soilgrids/v2.0/properties/query?" + q, 25000);
    const W = { "0-5cm": 5, "5-15cm": 10, "15-30cm": 15 }, out = {};
    for (const L of js.properties.layers) {
      let acc = 0, ws = 0;
      for (const d of L.depths) { const v = d.values.mean; if (v == null) continue; acc += v / L.unit_measure.d_factor * W[d.label]; ws += W[d.label]; }
      out[L.name] = ws ? r(acc / ws, 3) : null;
    }
    if (out.clay == null || out.sand == null) throw new Error("SoilGrids sin datos en ese punto");
    out.soc = Math.max(out.soc || 0, 1.0);
    return out;
  }

  // vecino: id del punto calculado más cercano (su suelo de respaldo y su plan de campaña)
  async function parcela(lat, lon, vecino, avance = () => {}) {
    const PC = BASE ? BASE.parcela : null;
    await cargar(vecino);
    const V = SITIOS[vecino], cfg = BASE.parcela || PC;
    avance("clima");
    const fin = cfg.anio_fin;
    const pw = await bajarJSON(`https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M,WS2M,ALLSKY_SFC_SW_DWN&community=AG&latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&start=${cfg.anio_ini}0101&end=${cfg.fecha_fin ? cfg.fecha_fin.replace(/-/g, "") : fin + "1231"}&format=JSON`, 120000);
    avance("relieve");
    const rel = await relieve(lat, lon);
    avance("suelo");
    let soil, sueloFuente = "soilgrids";
    try { soil = await sueloSG(lat, lon); } catch { soil = { ...V.soil, phh2o: V.soil.phh2o }; sueloFuente = "vecino"; }
    const region = rel.elev >= 2000 ? "sierra" : lat < -15.5 || lon < ejeAndino(lat) ? "costa" : "selva"; // muyuy/resumen.py: al sur de 15,5° S todo es costa
    const tabla = TABLA[region], C = BASE.tablas[tabla];
    const zCelda = pw.geometry.coordinates[2], dt = cfg.lapse * (rel.elev - zCelda), pf = cfg.precip_regional[region];
    const P0 = pw.properties.parameter, fechas = Object.keys(P0.T2M).sort();
    const val = (k, f) => { const v = P0[k][f]; return v === -999 || v == null ? NaN : v; };
    // desde el 1 de agosto del primer año, como build_motor.py
    const i0 = fechas.indexOf(`${cfg.anio_ini}0801`);
    const fs = fechas.slice(i0).filter((f) => !isNaN(val("T2M", f)));
    const n = fs.length, P = new Float64Array(n), E = new Float64Array(n), E3 = new Float64Array(n), TN = new Float64Array(n);
    const tmes = {};
    fs.forEach((f, i) => {
      const y = +f.slice(0, 4), m = +f.slice(4, 6), d = +f.slice(6, 8);
      const doy = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / DIA);
      const tx = val("T2M_MAX", f) + dt, tn = val("T2M_MIN", f) + dt, tm = val("T2M", f) + dt;
      const rs = val("ALLSKY_SFC_SW_DWN", f), u2 = val("WS2M", f), rh = val("RH2M", f);
      P[i] = Math.max(0, val("PRECTOTCORR", f) || 0) * pf;
      E[i] = et0PM(tx, tn, rs, u2, rh, doy, lat, rel.elev);
      E3[i] = et0PM(tx, tn - 3, rs, u2, rh, doy, lat, rel.elev);
      TN[i] = tn;
      const k = `${y}-${m}`; (tmes[k] = tmes[k] || []).push(tm);
    });
    const y0 = cfg.anio_ini, t0 = Date.UTC(y0, 7, 1);
    const ultimo = t0 + (n - 1) * DIA;
    const ks = Object.keys(tmes);
    const TM = Float64Array.from(ks, (k) => mean(tmes[k]));
    // campañas que todos los cultivos completan (la última siembra de ciclo largo puede no cerrar)
    const anios = [];
    for (let y = y0; y < new Date(ultimo).getUTCFullYear(); y++) {
      const ok = Object.values(C).every((c) => Date.UTC(c.siembra_mes >= 8 ? y : y + 1, c.siembra_mes - 1, 15) + (c.ciclo_dias - 1) * DIA <= ultimo);
      if (ok) anios.push(y);
    }
    // clase de cada año: El Niño por el ONI de diciembre-febrero y terciles de la lluvia de octubre a abril
    const lluviaOA = anios.map((y) => { let s = 0; for (let i = Math.max(0, Math.round((Date.UTC(y, 9, 1) - t0) / DIA)); i <= Math.min(n - 1, Math.round((Date.UTC(y + 1, 3, 30) - t0) / DIA)); i++) s += P[i]; return s; });
    const q1 = pct(lluviaOA, 100 / 3), q2 = pct(lluviaOA, 200 / 3);
    const clases = {};
    anios.forEach((y, j) => {
      const a = cfg.oni_djf[String(y + 1)];
      clases[y] = [a >= 0.5 ? "El Niño" : a <= -0.5 ? "La Niña" : "Neutro", lluviaOA[j] <= q1 ? "seco" : lluviaOA[j] >= q2 ? "húmedo" : "normal"];
    });
    const id = "p" + `${lat.toFixed(4)}_${lon.toFixed(4)}`.replace(/-/g, "m").replace(/\./g, "d");
    const [my, mm] = ks[0].split("-").map(Number);
    SITIOS[id] = { id, region, tabla, elev: rel.elev, slope: rel.slope, soil, inicio: `${y0}-08-01`, dias: n, meses0: [my, mm], n_meses: TM.length,
                   anios, clases, planes: V.planes, e3: true, P, E, E3, TN, TM, t0, y0, lat, lon, dt: r(dt, 2), pf, sueloFuente };
    return SITIOS[id];
  }

  // la chacra exacta guardada en el teléfono (mismo formato que data/motor/<id>.bin), para no bajarla otra vez
  async function empaquetar(id) {
    const S = SITIOS[id];
    const head = { id: S.id, region: S.region, tabla: S.tabla, elev: S.elev, slope: S.slope, soil: S.soil, inicio: S.inicio, dias: S.dias,
                   tn0: Math.round(S.TN[0] * 10), meses0: S.meses0, n_meses: S.n_meses, anios: S.anios, clases: S.clases, planes: S.planes,
                   e3: true, lat: S.lat, lon: S.lon, dt: S.dt, pf: S.pf, sueloFuente: S.sueloFuente };
    const hb = new TextEncoder().encode(JSON.stringify(head)), n = S.dias;
    const u8 = new Uint8Array(4 + hb.length + 2 * n + n + n + 2 * S.n_meses + n), dv = new DataView(u8.buffer);
    dv.setUint32(0, hb.length, true); u8.set(hb, 4);
    let o = 4 + hb.length, prev = head.tn0;
    for (let i = 0; i < n; i++) dv.setUint16(o + 2 * i, Math.min(65535, Math.round(S.P[i] * 10)), true);
    o += 2 * n;
    const e8 = (x) => Math.min(255, Math.max(0, Math.round(x * 10)));
    for (let i = 0; i < n; i++) u8[o + i] = e8(S.E[i]);
    o += n;
    for (let i = 0; i < n; i++) { const t = Math.round(S.TN[i] * 10); dv.setInt8(o + i, Math.max(-127, Math.min(127, t - prev))); prev = t; }
    o += n;
    for (let i = 0; i < S.n_meses; i++) dv.setInt16(o + 2 * i, Math.round(S.TM[i] * 10), true);
    o += 2 * S.n_meses;
    for (let i = 0; i < n; i++) dv.setInt8(o + i, Math.max(-127, Math.min(127, e8(S.E3[i]) - e8(S.E[i]))));
    const gz = new Response(new Blob([u8]).stream().pipeThrough(new CompressionStream("gzip")));
    const b = new Uint8Array(await gz.arrayBuffer());
    let s = "";
    for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    return btoa(s);
  }
  async function desempaquetar(b64) {
    const bin = atob(b64), u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const S = leer(await gunzip(u8));
    SITIOS[S.id] = S;
    return S;
  }
  // contexto para la vista (altura, pendiente, suelo y clima) de la chacra exacta
  function contexto(id) {
    const S = SITIOS[id], s = S.soil, om = s.soc / 10 * 1.724;
    const txt = {};
    for (const [l, t] of Object.entries(BASE.parcela.suelo_txt)) {
      txt[l] = t.replace("{s:.0f}", Math.round(s.sand)).replace("{c:.0f}", Math.round(s.clay)).replace("{mo:.1f}", om.toFixed(1)).replace("{ph:.1f}", (s.phh2o || 0).toFixed(1));
    }
    return { region: S.region, altura: Math.round(S.elev), pendiente: r(S.slope, 1), suelo_txt: txt, delta_t: S.dt, precip_factor: r(S.pf, 3),
             campanias: [S.anios[0], S.anios[S.anios.length - 1]], suelo_fuente: S.sueloFuente };
  }

  // clima del lugar para el calendario y las tendencias (campo.js): promedios de cada mes y una fila por campaña
  // (agosto a julio) con lluvia, ET0, balance, noches de helada, mínima media y el mes más caluroso
  function clima(id) {
    const S = SITIOS[id];
    if (!S) return null;
    const mes = Array.from({ length: 12 }, () => ({ p: 0, e: 0, h0: 0, h3: 0, tn: 0, n: 0, ym: new Set(), tm: 0, ntm: 0 }));
    const camp = {};
    for (let i = 0; i < S.dias; i++) {
      const d = new Date(S.t0 + i * DIA), m = d.getUTCMonth(), y = d.getUTCFullYear(), cy = m >= 7 ? y : y - 1;
      const M = mes[m], tn = S.TN[i];
      M.p += S.P[i]; M.e += S.E[i]; M.tn += tn; M.n++; M.ym.add(y);
      if (tn < 0) M.h0++;
      if (tn <= -3) M.h3++;
      const c = camp[cy] || (camp[cy] = { anio: cy, p: 0, e: 0, h0: 0, tn: 0, n: 0, tmx: -99 });
      c.p += S.P[i]; c.e += S.E[i]; c.tn += tn; c.n++;
      if (tn < 0) c.h0++;
    }
    for (let k = 0; k < S.TM.length; k++) {
      const tot = S.meses0[1] - 1 + k, y = S.meses0[0] + Math.floor(tot / 12), m = tot % 12, cy = m >= 7 ? y : y - 1;
      mes[m].tm += S.TM[k]; mes[m].ntm++;
      if (camp[cy]) camp[cy].tmx = Math.max(camp[cy].tmx, S.TM[k]);
    }
    return {
      meses: mes.map((M) => { const ny = M.ym.size || 1; return { p: r(M.p / ny, 1), e: r(M.e / ny, 1), h0: r(M.h0 / ny, 1), h3: r(M.h3 / ny, 1),
        tn: r(M.tn / (M.n || 1), 1), tm: M.ntm ? r(M.tm / M.ntm, 1) : null }; }),
      camp: Object.values(camp).filter((c) => c.n >= 360).map((c) => ({ anio: c.anio, p: r(c.p, 0), e: r(c.e, 0), b: r(c.p - c.e, 0), h0: c.h0,
        tn: r(c.tn / c.n, 2), tmx: c.tmx > -99 ? r(c.tmx, 1) : null })),
      region: S.region, elev: S.elev, slope: S.slope, lat: S.lat, lon: S.lon,
    };
  }
  // cuánto se corre la mínima con las heladas que recuerda el agricultor, sin calcular las rotaciones
  function offset(id, perfil = {}) {
    const S = SITIOS[id], C = S && BASE.tablas[S.tabla];
    return C && perfil.heladas_campanias != null && C.papa ? offsetHeladas(S, C.papa.helada_umbral_c, perfil.heladas_campanias) : 0;
  }
  // inicio de lluvias de cada campaña: primer día desde agosto con 20 mm en 5 días que no sigue de 10 días casi secos
  function inicioLluvias(id) {
    const S = SITIOS[id];
    if (!S) return null;
    const filas = [];
    let total = 0;
    for (let a = 0; (a + 1) * 365 <= S.dias; a++) {
      const y = S.y0 + a, d0 = Math.round((Date.UTC(y, 7, 1) - S.t0) / DIA);
      if (d0 + 300 > S.dias) break;
      total++;
      for (let d = 0; d < 260; d++) {
        let s5 = 0;
        for (let k = 0; k < 5; k++) s5 += S.P[d0 + d + k];
        if (s5 < 20) continue;
        let seca = false;
        for (let w = 5; w <= 15 && !seca; w++) { let s = 0; for (let k = 0; k < 10; k++) s += S.P[d0 + d + w + k]; if (s < 5) seca = true; }
        if (!seca) { filas.push({ anio: y, dia: d }); break; }
      }
    }
    return { filas, ok: total ? filas.length / total : 0 };
  }
  function suelo(id) {
    const S = SITIOS[id];
    if (!S) return null;
    const s = S.soil, Sa = s.sand / 100, C = s.clay / 100, om = s.soc / 10 * 1.724;
    const t1500 = -0.024 * Sa + 0.487 * C + 0.006 * om + 0.005 * Sa * om - 0.013 * C * om + 0.068 * Sa * C + 0.031, wp = t1500 + (0.14 * t1500 - 0.02);
    const t33 = -0.251 * Sa + 0.195 * C + 0.011 * om + 0.006 * Sa * om - 0.027 * C * om + 0.452 * Sa * C + 0.299, fc = t33 + (1.283 * t33 ** 2 - 0.374 * t33 - 0.015);
    return { suelo: { ...s, silt: s.silt ?? r(100 - s.sand - s.clay, 1) },
             hidro: { cc: r(fc, 3), pmp: r(wp, 3), adt_mm_m: r(1000 * (fc - wp), 1), mo_pct: r(om, 2) }, lat: S.lat, lon: S.lon };
  }
  // la tabla de cultivos del lugar (rasgos: raíz, Kc, Ky, nitrógeno, cobertura, precio…)
  const tabla = (id) => (SITIOS[id] && BASE ? BASE.tablas[SITIOS[id].tabla] : null);

  const MOTOR = { cargar, tiene, calcular, cultivos, parcela, empaquetar, desempaquetar, contexto, clima, tabla, offset, suelo, inicioLluvias,
                  _interno: { leer, campania, evaluar, offsetHeladas, hidraulica, factorK, factorLS, et0PM } };
  if (typeof module !== "undefined" && module.exports) module.exports = MOTOR;
  else raiz.MOTOR = MOTOR;
})(typeof window !== "undefined" ? window : globalThis);
