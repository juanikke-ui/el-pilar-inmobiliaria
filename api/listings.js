import ftp from 'basic-ftp';
import { XMLParser } from 'fast-xml-parser';

export const config = { runtime: 'nodejs' };

const CACHE_TTL_MS = 1000 * 60 * 30;
let cache = { at: 0, data: [] };

function pick(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
}

function flatten(value, out = []) {
  if (!value) return out;
  if (Array.isArray(value)) value.forEach((v) => flatten(v, out));
  else if (typeof value === 'object') {
    const looksLikeListing = ['id', 'reference', 'ref', 'price', 'title', 'operation', 'propertyType', 'url', 'pictures', 'images'].some((k) => k in value);
    if (looksLikeListing) out.push(value);
    Object.values(value).forEach((v) => flatten(v, out));
  }
  return out;
}

function firstImage(item) {
  const direct = pick(item, ['image', 'mainImage', 'main_image', 'thumbnail', 'picture', 'photo']);
  if (typeof direct === 'string') return direct;
  const groups = [item.images, item.pictures, item.photos, item.fotos, item.imagenes];
  for (const group of groups) {
    if (!group) continue;
    const arr = Array.isArray(group) ? group : Object.values(group).flat();
    for (const entry of arr) {
      if (typeof entry === 'string') return entry;
      if (entry?.url) return entry.url;
      if (entry?.src) return entry.src;
      if (entry?.href) return entry.href;
    }
  }
  return '';
}

function formatPrice(price) {
  if (!price) return 'Consultar';
  const n = Number(String(price).replace(/[^0-9.,]/g, '').replace(',', '.'));
  if (Number.isFinite(n) && n > 0) return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  return String(price);
}

function normalize(raw) {
  return flatten(raw)
    .map((item, index) => {
      const title = pick(item, ['title', 'titulo', 'propertyTitle', 'headline', 'tipo', 'propertyType']) || 'Inmueble en Toledo';
      const city = pick(item, ['city', 'ciudad', 'municipality', 'municipio', 'town']);
      const zone = pick(item, ['zone', 'zona', 'district', 'barrio', 'address', 'direccion']);
      const rooms = pick(item, ['rooms', 'bedrooms', 'habitaciones', 'dormitorios']);
      const baths = pick(item, ['bathrooms', 'banos', 'baños']);
      const area = pick(item, ['area', 'surface', 'm2', 'metros', 'constructedArea']);
      const detailParts = [];
      if (rooms) detailParts.push(`${rooms} hab.`);
      if (baths) detailParts.push(`${baths} baños`);
      if (area) detailParts.push(`${area} m²`);
      return {
        id: pick(item, ['id', 'propertyId', 'reference', 'referencia', 'ref']) || `idealista-${index}`,
        title: String(title),
        location: [city || 'Toledo', zone].filter(Boolean).join(' · '),
        price: formatPrice(pick(item, ['price', 'precio', 'amount', 'importe'])),
        detail: detailParts.length ? detailParts.join(' · ') : 'Inmueble activo en Idealista',
        badge: pick(item, ['operation', 'operacion']) || 'Idealista',
        image: firstImage(item),
        url: pick(item, ['url', 'link', 'idealistaUrl', 'web']) || 'https://www.idealista.com/pro/inmobiliaria-el-pilar/'
      };
    })
    .filter((item, idx, arr) => item.title && arr.findIndex((x) => x.id === item.id) === idx)
    .slice(0, 60);
}

async function readFtpFile() {
  const host = (process.env.IDEALISTA_FTP_HOST || '').replace(/^ftp:\/\//, '');
  const user = process.env.IDEALISTA_FTP_USER;
  const password = process.env.IDEALISTA_FTP_PASSWORD;
  const filePath = process.env.IDEALISTA_FTP_FILE;
  if (!host || !user || !password) throw new Error('Faltan variables FTP de Idealista en Vercel');

  const client = new ftp.Client(15000);
  client.ftp.verbose = false;
  try {
    await client.access({ host, user, password, secure: false });
    let target = filePath;
    if (!target) {
      const list = await client.list();
      const file = list.find((f) => f.isFile && /\.(json|xml)$/i.test(f.name));
      if (!file) throw new Error('No se encontró ningún fichero XML/JSON en el FTP');
      target = file.name;
    }
    const chunks = [];
    const writable = new (await import('stream')).Writable({
      write(chunk, encoding, callback) { chunks.push(Buffer.from(chunk)); callback(); }
    });
    await client.downloadTo(writable, target);
    return { content: Buffer.concat(chunks).toString('utf8'), filename: target };
  } finally {
    client.close();
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
  try {
    if (Date.now() - cache.at < CACHE_TTL_MS && cache.data.length) {
      return res.status(200).json({ source: 'cache', listings: cache.data });
    }
    const { content, filename } = await readFtpFile();
    let parsed;
    if (/\.json$/i.test(filename) || content.trim().startsWith('{') || content.trim().startsWith('[')) {
      parsed = JSON.parse(content);
    } else {
      parsed = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', textNodeName: 'text' }).parse(content);
    }
    const listings = normalize(parsed);
    cache = { at: Date.now(), data: listings };
    return res.status(200).json({ source: filename, count: listings.length, listings });
  } catch (error) {
    return res.status(500).json({ error: error.message, listings: [] });
  }
}
