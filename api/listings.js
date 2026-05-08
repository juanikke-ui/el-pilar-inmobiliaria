export default async function handler(req, res) {
  return res.status(200).json({
    prueba: "ARCHIVO NUEVO EJECUTADO",
    fecha: new Date().toISOString()
  });
}
