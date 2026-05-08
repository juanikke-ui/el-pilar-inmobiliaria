import { Client } from "basic-ftp";

export default async function handler(req, res) {
  const client = new Client();

  try {
    const host = process.env.IDEALISTA_FTP_HOST;
    const user = process.env.IDEALISTA_FTP_USER;
    const password = process.env.IDEALISTA_FTP_PASSWORD;
    const file = process.env.IDEALISTA_FTP_FILE;

    if (!host || !user || !password || !file) {
      return res.status(500).json({
        error: "Faltan variables de entorno de Idealista",
        listings: []
      });
    }

    await client.access({
      host,
      user,
      password,
      secure: false
    });

    return res.status(200).json({
      ok: true,
      message: "Conexión FTP correcta. Falta parsear visualmente el XML.",
      file,
      listings: []
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      listings: []
    });
  } finally {
    client.close();
  }
}
