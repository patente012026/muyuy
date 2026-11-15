// Muyuy · capa rápida para decenas de miles de puntos en Leaflet.
// En lugar de crear un objeto por punto (lo que congelaba la página varios segundos), dibuja los puntos
// por mosaicos en canvas, solo los de la zona visible, y busca el punto tocado en una grilla de 0,5°.
"use strict";
// El punto de datos de un lugar: el calculado más parecido por cercanía y altura. Una celda de clima mide unos 55 km y en
// los Andes va de la costa a la puna: mirar solo la celda o la distancia daba, en el 15 % de las capitales de distrito,
// datos con más de 1000 m de diferencia de altura (scripts/agregar_altura_sitios.py deja la altura de cada punto).
const M_POR_KM = 12; // 12 m de diferencia de altura pesan como 1 km de distancia
const KM_JUNTO = 3; // a esta distancia, ese punto es el lugar: la altura estimada no debe ganarle
function kmEntre(a, b, c, d) {
  const r = Math.PI / 180, x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(x));
}
// la altura de un punto tocado no se conoce sin internet: se estima con las 3 capitales de distrito más cercanas
function alturaEstimada(lat, lon, distritos) {
  const c = [];
  for (const d of distritos || []) {
    if (!d[5]) continue;
    const km = kmEntre(lat, lon, d[1], d[0]);
    if (c.length < 3 || km < c[2][0]) { c.push([km, d[5]]); c.sort((x, y) => x[0] - y[0]); c.length = Math.min(c.length, 3); }
  }
  if (!c.length) return null;
  let suma = 0, peso = 0;
  for (const [km, z] of c) { const w = 1 / (km + 1); suma += z * w; peso += w; }
  return suma / peso;
}
function puntoParecido(lat, lon, alt, sitios, distritos) {
  const z = alt != null ? alt : alturaEstimada(lat, lon, distritos);
  let mejor = null, nota = Infinity, kmMejor = 0;
  for (const s of sitios) {
    const km = kmEntre(lat, lon, s.lat, s.lon), n = km <= KM_JUNTO ? km - 1e4 : km + (z != null && s.alt != null ? Math.abs(s.alt - z) / M_POR_KM : 0);
    if (n < nota) { nota = n; mejor = s; kmMejor = km; }
  }
  return { sitio: mejor, km: kmMejor, altura: z };
}
(function () {
  if (typeof L === "undefined" || !L.GridLayer) return;
  const BIN = 0.5;
  const key = (la, lo) => `${Math.floor(la / BIN)}_${Math.floor(lo / BIN)}`;

  L.PuntosLayer = L.GridLayer.extend({
    options: {
      pane: "overlayPane", tileSize: 256, updateWhenZooming: false, keepBuffer: 2,
      lat: (p) => p[1], lon: (p) => p[0],
      color: () => "#d81b60", radio: (p, z) => (z < 6 ? 1.6 : z < 8 ? 2.6 : z < 10 ? 3.6 : 5),
      filtro: null, tolerancia: 6, desdeZoom: 0,
    },
    initialize(puntos, options) {
      L.setOptions(this, options);
      this._agrupar(puntos);
    },
    _agrupar(puntos) {
      this._pts = puntos;
      this._bins = new Map();
      puntos.forEach((p, i) => {
        const k = key(this.options.lat(p), this.options.lon(p));
        if (!this._bins.has(k)) this._bins.set(k, []);
        this._bins.get(k).push(i);
      });
    },
    setPuntos(puntos) { this._agrupar(puntos); if (this._map) this.redraw(); return this; },
    setFiltro(f) { this.options.filtro = f; this.redraw(); return this; },
    _visibles(la0, la1, lo0, lo1, fn) {
      const o = this.options, f = o.filtro;
      for (let a = Math.floor(la0 / BIN) - 1; a <= Math.floor(la1 / BIN) + 1; a++) {
        for (let b = Math.floor(lo0 / BIN) - 1; b <= Math.floor(lo1 / BIN) + 1; b++) {
          const lst = this._bins.get(`${a}_${b}`);
          if (!lst) continue;
          for (const i of lst) { const p = this._pts[i]; if (!f || f(p)) fn(p); }
        }
      }
    },
    createTile(coords) {
      const t = L.DomUtil.create("canvas", "leaflet-tile"), s = this.getTileSize();
      const dpr = window.devicePixelRatio || 1;
      t.width = s.x * dpr; t.height = s.y * dpr;
      t.style.width = s.x + "px"; t.style.height = s.y + "px";
      const ctx = t.getContext("2d"), map = this._map, z = coords.z, o = this.options;
      ctx.scale(dpr, dpr);
      const nw = map.unproject(coords.scaleBy(s), z), se = map.unproject(coords.add([1, 1]).scaleBy(s), z);
      const origin = coords.scaleBy(s);
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = "rgba(255,255,255,.9)";
      this._visibles(se.lat, nw.lat, nw.lng, se.lng, (p) => {
        const q = map.project([o.lat(p), o.lon(p)], z).subtract(origin), r = o.radio(p, z);
        if (q.x < -r || q.y < -r || q.x > s.x + r || q.y > s.y + r) return;
        ctx.beginPath();
        ctx.arc(q.x, q.y, r, 0, 6.2832);
        ctx.fillStyle = o.color(p);
        ctx.globalAlpha = 0.85;
        ctx.fill();
        if (r > 2) { ctx.globalAlpha = 1; ctx.stroke(); }
      });
      return t;
    },
    onAdd(map) { L.GridLayer.prototype.onAdd.call(this, map); map.on("click", this._click, this); },
    onRemove(map) { map.off("click", this._click, this); L.GridLayer.prototype.onRemove.call(this, map); },
    _click(e) {
      if (e.originalEvent && e.originalEvent._muyuyPunto) return;
      const map = this._map, z = map.getZoom(), c = map.project(e.latlng, z), o = this.options;
      if (z < o.desdeZoom) return; // de lejos, unos píxeles son decenas de km: el toque no se pega a un punto
      let best = null, bd = Infinity;
      const la = e.latlng.lat, lo = e.latlng.lng;
      this._visibles(la - BIN, la + BIN, lo - BIN, lo + BIN, (p) => {
        const d = map.project([o.lat(p), o.lon(p)], z).distanceTo(c);
        if (d < bd) { bd = d; best = p; }
      });
      if (best && bd <= Math.max(o.tolerancia, o.radio(best, z) + 3)) {
        if (e.originalEvent) e.originalEvent._muyuyPunto = true; // el mapa sabe que el toque fue sobre un punto
        this.fire("punto", { punto: best, latlng: L.latLng(o.lat(best), o.lon(best)) });
      }
    },
  });
  L.puntosLayer = (p, o) => new L.PuntosLayer(p, o);
})();

// Límites de departamentos y provincias (data/limites.json.gz, de scripts/build_limites.py). Se ven sobre las celdas y
// no atrapan toques: tocar sobre una línea sigue eligiendo el punto de abajo. Las provincias aparecen al acercarse.
(function () {
  if (typeof L === "undefined" || !L.GridLayer) return;
  const Z_PROV_LINEA = 6, Z_DEP_NOMBRE = 6, Z_DEP_NOMBRE_HASTA = 8, Z_PROV_NOMBRE = 8, Z_PROV_NOMBRE_HASTA = 11, Z_DIST_LINEA = 9, Z_DIST_NOMBRE = 11;
  async function leer(archivo) {
    const r = await fetch(archivo);
    if (!r.ok) throw new Error("limites");
    const plano = "DecompressionStream" in window ? r.body.pipeThrough(new DecompressionStream("gzip")) : r.body;
    return new Response(plano).json();
  }
  const rutas = (ls) => ls.map((d) => { // diferencias en diezmilésimas de grado → [lat, lon]
    const out = new Array(d.length / 2);
    let x = 0, y = 0;
    for (let i = 0; i < d.length; i += 2) { x += d[i]; y += d[i + 1]; out[i / 2] = [y / 1e4, x / 1e4]; }
    return out;
  });
  const marca = (p, clase, pre = "") => L.marker([p.y, p.x], {
    pane: "limitesTxt", interactive: false, keyboard: false,
    icon: L.divIcon({ className: "lim-t " + clase, html: `<span>${pre}${p.n}</span>`, iconSize: [0, 0] }),
  });
  const nombres = (lista, clase, pre) => L.layerGroup(lista.map((p) => marca(p, clase, pre)));
  L.capaLimites = function (map) {
    for (const [pane, z] of [["limites", 420], ["limitesTxt", 430]]) {
      const el = map.createPane(pane);
      el.style.zIndex = z;
      el.style.pointerEvents = "none";
    }
    return leer("data/limites.json.gz").then((d) => {
      const lienzo = L.canvas({ pane: "limites", padding: 0.3 });
      const o = { renderer: lienzo, interactive: false, smoothFactor: 1.2 };
      const lp = rutas(d.lProv), ld = rutas(d.lDep);
      // con borde claro: se distinguen sobre cualquier fondo, también entre muchos puntos
      const prov = L.layerGroup([L.polyline(lp, { ...o, color: "#fff", weight: 3.2, opacity: 0.7 }), L.polyline(lp, { ...o, color: "#10181d", weight: 1.4, opacity: 0.95, dashArray: "5 3" })]);
      const depBorde = L.polyline(ld, { ...o, color: "#fff", weight: 5, opacity: 0.85 }).addTo(map);
      const depLinea = L.polyline(ld, { ...o, color: "#10181d", weight: 2.5, opacity: 1 }).addTo(map);
      let depFina = null;
      const nd = nombres(d.dep, "lim-dep"), np = nombres(d.prov, "lim-prov", "Prov. "); // «Prov.»: no se confunde con el pueblo del mismo nombre
      const pon = (capa, si) => { if (si && !map.hasLayer(capa)) capa.addTo(map); else if (!si && map.hasLayer(capa)) map.removeLayer(capa); };
      // los distritos pesan más: se bajan recién al acercarse. Sus nombres se dibujan solo para lo que está a la vista
      let lineasDist = null, listaDist = null, pidiendo = false;
      const nDist = L.layerGroup();
      const pedirDist = () => {
        if (pidiendo || lineasDist) return;
        pidiendo = true;
        leer("data/limites_dist.json.gz").then((x) => {
          const l = rutas(x.lDist);
          lineasDist = L.layerGroup([L.polyline(l, { ...o, color: "#fff", weight: 2.4, opacity: 0.55 }), L.polyline(l, { ...o, color: "#10181d", weight: 1, opacity: 0.85, dashArray: "1 3" })]);
          listaDist = x.dist;
          ver();
        }).catch(() => {}).finally(() => { pidiendo = false; }); // sin señal: lo intenta otra vez en el próximo movimiento
      };
      const verNombresDist = () => {
        nDist.clearLayers();
        const b = map.getBounds().pad(0.15);
        for (const p of listaDist) if (b.contains([p.y, p.x])) nDist.addLayer(marca(p, "lim-dist", "Dist. "));
      };
      const ver = () => {
        const z = map.getZoom(), fina = z < Z_PROV_LINEA; // de lejos, líneas finas: el país no se vuelve una mancha oscura
        if (fina !== depFina) {
          depFina = fina;
          depBorde.setStyle({ weight: fina ? 2.6 : 5 });
          depLinea.setStyle({ weight: fina ? 1.1 : 2.5 });
        }
        pon(prov, z >= Z_PROV_LINEA);
        pon(nd, z >= Z_DEP_NOMBRE && z < Z_DEP_NOMBRE_HASTA);
        pon(np, z >= Z_PROV_NOMBRE && z < Z_PROV_NOMBRE_HASTA);
        if (z >= Z_DIST_LINEA) pedirDist();
        if (lineasDist) pon(lineasDist, z >= Z_DIST_LINEA);
        const conNombres = !!listaDist && z >= Z_DIST_NOMBRE;
        if (conNombres) verNombresDist();
        pon(nDist, conNombres);
      };
      map.on("moveend", ver); // también llega después de cada cambio de zoom
      ver();
      if (map.attributionControl) map.attributionControl.addAttribution("Límites referenciales: IGN Perú · OCHA");
      return true;
    }).catch(() => false); // sin los límites el mapa sigue funcionando
  };
})();
