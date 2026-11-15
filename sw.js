// Guarda la app, los datos precalculados y las animaciones para usarla sin conexión en el campo.
const CACHE = "muyuy-V1.0-zzzzx"; // cambia cuando cambian los archivos: los teléfonos bajan la copia nueva
const SITES = ["chinchero", "acora", "chulucanas", "lamas"];
const FILES = ["index.html", "muyuy.min.js", "muyuy.min.css", "img/portada-800.webp", "i18n.js", "motor.js", "motor_worker.js", "icon-96.png", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "manifest.json",
  "tecnica.html", "tecnica.css", "tecnica.js", "mapa.html", "mapa.css", "mapa.js", "mapa_capas.js", "data/mapa_riesgos.json", "data/motor/base.json", "puntos.js", "data/mapa_mundo.json", "data/enso.json", "fonts/fraunces-700.woff2", "fonts/nunito-sans.woff2", "img/portada.webp", "img/mundo.webp", "img/clima2050.webp", "img/bienvenida.webp", "img/rotacion.webp", "audio/voces.json", "data/comunidades.json", "data/celdas.json.gz", "data/futuro.json.gz", "data/mundo.json.gz", "data/sitios.json",
  ...SITES.flatMap((s) => [`data/${s}.json`, `data/${s}_tec.json`]),
  "lottie/brote.json", "lottie/gota.json", "lottie/moneda.json", "lottie/escudo.json", "lottie/muyuy.json",
  "lottie/exito.json", "lottie/helada.json", "lottie/sol.json", "lottie/lluvia.json"];
const CDN = ["https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie_light.min.js"];
// la versión nueva entra apenas se descarga (sin esperar a que se cierren todas las pestañas); la página abierta no se interrumpe y se ve al volver a abrirla
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then(async (c) => {
  await Promise.all(FILES.map((f) => c.add(new Request(f, { cache: "reload" })).catch(() => {}))); // del servidor, no de la caché del navegador // un sitio sin datos no frena la instalación
  await Promise.all(CDN.map((u) => c.add(u).catch(() => {}))); // si no hay internet, la app sigue sin animaciones
}).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
// las consultas en vivo (NASA Power, Modis…) van directo a la red: si una tarda, no frena la llegada de una versión nueva
self.addEventListener("fetch", (e) => {
  const u = e.request.url;
  if (e.request.method !== "GET" || (!u.startsWith(self.location.origin) && !CDN.includes(u))) return;
  // la página, el código y los estilos: primero del servidor (siempre la versión nueva) y, sin internet, de la copia
  // guardada; los datos grandes, imágenes y audios: primero de la copia (rápido y sin gastar datos)
  const ruta = new URL(u).pathname, app = u.startsWith(self.location.origin) && (e.request.mode === "navigate" || /\.(html|js|css)$/.test(ruta) || ruta.endsWith("/") || /sitios\.json$/.test(ruta));
  if (app) {
    e.respondWith(fetch(e.request, { cache: "no-cache" }).then((r) => {
      if (r && r.ok) { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)).catch(() => {}); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("index.html"))));
    return;
  }
  // audios, datos e imágenes: lo que se baja una vez queda guardado (la visita siguiente no gasta datos y funciona sin internet)
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((x) => {
    if (x && x.ok && u.startsWith(self.location.origin)) { const copia = x.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)).catch(() => {}); }
    return x;
  })));
});
