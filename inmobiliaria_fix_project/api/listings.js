import { Client } from "basic-ftp";
import fs from "fs/promises";

export const config = { maxDuration: 30 };

function clean(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\btrue\b/gi, "")
    .replace(/\bfalse\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function valid(value) {
  const v = clean(value);
  return v && v !== "0" && v !== "-" && v !== "null" && v !== "undefined";
}

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
  return m ? m[1] : "";
}

function blocks(xml, name) {
  return [...xml.matchAll(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "gi"))].map(m => m[1]);
}

function spanishComment(ad) {
  const comments = blocks(ad, "adComments");
  const spanish = comments.find(c => clean(tag(c, "language")) === "0") || comments[0] || "";
  return clean(tag(spanish, "propertyComment"));
}

function firstPrice(ad) {
  const saleMatch = ad.match(/<SALE>[\s\S]*?<price[^>]*>([\s\S]*?)<\/price>/i);
  const rentMatch = ad.match(/<RENT>[\s\S]*?<price[^>]*>([\s\S]*?)<\/price>/i);
  const raw = saleMatch?.[1] || rentMatch?.[1] || "";

  const number = Number(String(raw).replace(/[^\d.,]/g, "").replace(",", "."));

  if (!Number.isFinite(number) || number <= 0) return "Consultar";

  return (
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(number) + (rentMatch ? "/mes" : "")
  );
}

function parseAd(ad) {
  const id = clean(tag(ad, "id"));
  const comment = spanishComment(ad);

  const pictures = blocks(ad, "pictures")
    .map(p => clean(tag(p, "multimediaPath")))
    .filter(Boolean);

  const area = clean(tag(ad, "propertyArea"));
  const rooms = clean(tag(ad, "roomNumber"));
  const baths = clean(tag(ad, "bathNumber"));

  const detail = [
    valid(rooms) ? `${rooms} hab.` : "",
    valid(baths) ? `${baths} baños` : "",
    valid(area) ? `${area} m²` : ""
  ].filter(Boolean).join(" · ");

  const zone = clean(tag(tag(ad, "location"), "name"));

  const titleBase = clean(comment.split(/[.!?]/)[0]);

  return {
    id,
    title: valid(titleBase) ? titleBase.slice(0, 95) : "Inmueble en Toledo",
    description: valid(comment) ? comment.slice(0, 220) + (comment.length > 220 ? "…" : "") : "",
    price: firstPrice(ad),
    location: valid(zone) ? zone : "Toledo",
    detail,
    badge: ad.includes("<RENT>") ? "Alquiler" : "Venta",
    image: pictures[0] || "",
    pictures,
    url: `https://www.idealista.com/inmueble/${id}/`
  };
}

export default async function handler(req, res) {
  const client = new Client();
  const tmpPath = "/tmp/idealista-feed.xml";

  try {
    await client.access({
      host: process.env.IDEALISTA_FTP_HOST,
      user: process.env.IDEALISTA_FTP_USER,
      password: process.env.IDEALISTA_FTP_PASSWORD,
      secure: false
    });

    await client.downloadTo(tmpPath, process.env.IDEALISTA_FTP_FILE);

    const xml = await fs.readFile(tmpPath, "utf8");
    const ads = blocks(xml.replace(/^\uFEFF/, ""), "ad");

    const listings = ads.map(parseAd).filter(x => x.id);

    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json({
      ok: true,
      count: listings.length,
      listings
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
      listings: []
    });
  } finally {
    client.close();
  }
}
