// Muyuy · el motor de rotaciones en segundo plano (Web Worker). El cálculo de todas las rotaciones de un lugar tarda
// varias décimas de segundo en un teléfono; aquí corre en otro hilo y la pantalla nunca se congela.
// Mensaje: {n, id, perfil, langs} → respuesta: {n, ok, r: {rotaciones, textos, anios, tmin_offset}, cultivos}.
// Si el lugar no tiene su archivo data/motor/<id>.bin (la chacra exacta guardada en el teléfono), responde ok: false
// y app.js calcula en el hilo principal.
"use strict";
importScripts("motor.js");
self.onmessage = async (e) => {
  const { n, id, perfil, langs, campanias } = e.data;
  try {
    await MOTOR.cargar(id);
    const r = MOTOR.calcular(id, perfil, langs);
    if (!campanias) delete r._campanias; // la vista del agricultor no lo usa y pesa; la vista técnica lo pide
    self.postMessage({ n, ok: true, r, cultivos: MOTOR.cultivos(id, perfil.riego_mm || 0) });
  } catch (err) {
    self.postMessage({ n, ok: false, error: String(err) });
  }
};
