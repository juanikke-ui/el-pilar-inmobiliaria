import { Client } from "basic-ftp";
import fs from "fs/promises";

export const config = {
  maxDuration: 30
};

function cleanText(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function getTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1] : "";
}

function getBlocks(xml, tag) {
  return [...xml.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi"))].map(m => m[1]);
}

function parseAd(ad) {
  const id = cleanText(getTag(ad, "id"));
  const comment = cleanText(getTag(ad, "propertyComment"));
  const price = cleanText(getTag(ad, "price"));
  const area = cleanText(getTag(ad, "propertyArea"));
  const rooms = cleanText(getTag(ad, "roomNumber"));
  const baths = cleanText(getTag(ad, "bathNumber"));
  const images = getBlocks(ad, "picture")
    .map(p => cleanText(getTag(p, "multimediaPath")))
    .filter(Boolean);

  return {
    id,
    title: comment ? comment.slice(0, 90) : "Inmueble en Toledo",
    description: comment,
    price,
    area,
    rooms,
    baths,
    image: images[0] || "",
    pictures: images,
    idealistaUrl: `https://www.idealista.com/inmueble/${id}/`
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
    const ads = getBlocks(xml, "ad");

    const listings = ads
      .map(parseAd)
      .filter(item => item.id);

    return res.status(200).json({
      ok: true,
      count: listings.length,
      listings
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
      stack: error.stack,
      listings: []
    });
  } finally {
    client.close();
  }
}
