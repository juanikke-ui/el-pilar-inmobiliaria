import ftp from 'basic-ftp';
import { XMLParser } from 'fast-xml-parser';

export const config = { runtime: 'nodejs' };

const CACHE_TTL_MS = 1000 * 60 * 30;
let cache = { at: 0, data: [] };

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object' && 'text' in value) return text(value.text);
  return String(value).trim();
}

function first(...values) {
  for (const value of values) {
    const v = text(value);
    if (v) return v;
  }
  return '';
}

function formatPrice(value, suffix = '') {
  const raw = text(value);
  if (!raw) return 'Consultar';
  const number = Number(raw.replace(/[^0-9.,]/g, '').replace(',', '.'));
  if (Number.isFinite(number) && number > 0) {
    const formatted = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(number);
    return suffix ? `${formatted}${suffix}` : formatted;
  }
  return raw;
}

function cleanDescription(value) {
  return text(value)
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function spanishComment(ad) {
  const comments = asArray(ad?.comments?.adComments);
  const spanish = comments.find((comment) => text(comment?.language) === '0') || comments[0];
  return cleanDescription(spanish?.propertyComment);
}

function imageFromAd(ad) {
  const pictures = asArray(ad?.multimedias?.pictures)
    .sort((a, b) => Number(text(a?.position) || 999) - Number(text(b?.position) || 999));
  return first(...pictures.map((picture) => picture?.multimediaPath));
}

function propertyTypeLabel(ad) {
  const typology = text(ad?.property?.typology);
  const propertyType = text(ad?.property?.propertyType);
  const trading = ad?.property?.trading;

  if (trading && Object.values(trading).some((v) => text(v))) return 'Local / Oficina';

  const labels = {
    '0': 'Piso',
    '1': 'Casa / Chalet',
    '2': 'Garaje',
    '3': 'Terreno',
    '4': 'Trastero',
    '5': 'Local comercial'
  };

  return labels[typology] || labels[propertyType] || 'Inmueble';
}

function operationInfo(ad) {
  const sale = first(ad?.prices?.byOperation?.SALE?.price);
  const rent = first(ad?.prices?.byOperation?.RENT?.price);
  if (rent) return { badge: 'Alquiler', price: formatPrice(rent, '/mes') };
  if (sale) return { badge: 'Venta', price: formatPrice(sale) };
  return { badge: 'Idealista', price: 'Consultar' };
}

function locationFromAd(ad) {
  const locationName = first(ad?.property?.location?.name, ad?.property?.address?.location?.name);
  const street = first(ad?.property?.listingAddress?.street?.value?.name, ad?.property?.address?.streetName, ad?.property?.myAddress?.street?.name);
  const postalCode = first(ad?.property?.address?.postalCode, ad?.property?.myAddress?.postalCode, ad?.property?.listingAddress?.postalCode?.value);
  const base = locationName || 'Toledo';
  return [base, postalCode].filter(Boolean).join(' · ');
}

function detailsFromAd(ad) {
  const housing = ad?.property?.housing || {};
  const trading = ad?.property?.trading || {};
  const area = first(housing.propertyArea, trading.propertyArea, trading.usableArea, ad?.property?.land?.propertyArea, ad?.property?.building?.propertyArea);
  const rooms = first(housing.roomNumber, housing.bedroomNumber, trading.warehouse?.roomNumber);
  const baths = first(housing.bathNumber, trading.bathNumber);
  const parts = [];
  if (rooms) parts.push(`${rooms} hab.`);
  if (baths) parts.push(`${baths} baños`);
  if (area) parts.push(`${area} m²`);
  if (text(housing.hasLift) === 'true') parts.push('Ascensor');
  if (text(housing.parkingSpace?.hasParkingSpace) === 'true') parts.push('Garaje');
  return parts.join(' · ') || 'Inmueble activo publicado en Idealista';
}

function titleFromAd(ad) {
  const description = spanishComment(ad);
  const firstSentence = description.split(/[.!?]/)[0]?.slice(0, 90).trim();
  const type = propertyTypeLabel(ad);
  const loc = first(ad?.property?.location?.name, 'Toledo');
  if (firstSentence && firstSentence.length > 12) return firstSentence;
  return `${type} en ${loc}`;
}

function normalizeIdealista(parsed) {
  const ads = asArray(parsed?.ads?.ad);
  return ads.map((ad, index) => {
    const id = first(ad?.id, ad?.extras?.ADID) || `idealista-${index}`;
    const operation = operationInfo(ad);
    const description = spanishComment(ad);
    return {
      id,
      title: titleFromAd(ad),
      location: locationFromAd(ad),
      price: operation.price,
      detail: detailsFromAd(ad),
      description: description ? `${description.slice(0, 180)}${description.length > 180 ? '…' : ''}` : '',
      badge: operation.badge,
      image: imageFromAd(ad) || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      url: `https://www.idealista.com/inmueble/${id}/`,
      reference: first(ad?.externalReference) || id
    };
  }).filter((item) => item.id);
}

async function readFtpFile() {
  const host = (process.env.IDEALISTA_FTP_HOST || '').replace(/^ftp:\/\//, '');
  const user = process.env.IDEALISTA_FTP_USER;
  const password = process.env.IDEALISTA_FTP_PASSWORD;
  const filePath = process.env.IDEALISTA_FTP_FILE;

  if (!host || !user || !password) {
    throw new Error('Faltan variables FTP de Idealista en Vercel');
  }

  const client = new ftp.Client(20000);
  client.ftp.verbose = false;

  try {
    await client.access({ host, user, password, secure: false });
    let target = filePath;

    if (!target) {
      const list = await client.list();
      const file = list.find((f) => f.isFile && /\.xml$/i.test(f.name) && !/^_/.test(f.name))
        || list.find((f) => f.isFile && /\.(json|xml)$/i.test(f.name));
      if (!file) throw new Error('No se encontró ningún fichero XML/JSON en el FTP');
      target = file.name;
    }

    const chunks = [];
    const { Writable } = await import('stream');
    const writable = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      }
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
      return res.status(200).json({ source: 'cache', count: cache.data.length, listings: cache.data });
    }

    const { content, filename } = await readFtpFile();
    let parsed;

    if (/\.json$/i.test(filename) || content.trim().startsWith('{') || content.trim().startsWith('[')) {
      parsed = JSON.parse(content);
      // Si Idealista cambia a JSON en el futuro, intentamos mantener el mismo contrato.
      const listings = Array.isArray(parsed?.listings) ? parsed.listings : Array.isArray(parsed) ? parsed : [];
      cache = { at: Date.now(), data: listings };
      return res.status(200).json({ source: filename, count: listings.length, listings });
    }

    parsed = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: 'text',
      trimValues: true,
      parseTagValue: false
    }).parse(content.replace(/^\uFEFF/, ''));

    const listings = normalizeIdealista(parsed);
    cache = { at: Date.now(), data: listings };
    return res.status(200).json({ source: filename, count: listings.length, listings });
  } catch (error) {
    return res.status(500).json({ error: error.message, listings: [] });
  }
}
