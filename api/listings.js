import { Client } from "basic-ftp";
import { Writable } from "stream";

function textBetween(source, tag) {
  const match = source.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].trim() : "";
}

function allBlocks(source, tag) {
  return [...source.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi"))].map(m => m[1]);
}

function cleanText(value = "") {
  return value
    .replace(/<!\\[CDATA\\[/g, "")
    .replace(/\\]\\]>/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\\s+/g, " ")
    .trim();
}

async function downloadXml() {
  const client = new Client();

  try {
    await client.access({
      host: process.env.IDEALISTA_FTP_HOST,
      user: process.env.IDEALISTA_FTP_USER,
      password: process.env.IDEALISTA_FTP_PASSWORD,
      secure: false
    });

    let xml = "";

    const writable = new Writable({
      write(chunk, encoding, callback) {
        xml += chunk.toString();
        callback();
      }
    });

    await client.downloadTo(writable, process.env.IDEALISTA_FTP_FILE);
    return xml;
  } finally {
    client.close();
  }
}

function parseListing(adXml) {
  const id = cleanText(textBetween(adXml, "id"));

  const spanishComment =
    allBlocks(adXml, "adComments")
      .map(block => ({
        language: cleanText(textBetween(block, "language")),
        comment: cleanText(textBetween(block, "propertyComment"))
      }))
      .find(item => item.language === "0")?.comment || "";

  const pictures = allBlocks(adXml, "pictures")
    .map(block => cleanText(textBetween(block, "multimediaPath")))
    .filter(Boolean);

  const rentPrice = cleanText(textBetween(textBetween(adXml, "RENT"), "price"));
  const salePrice = cleanText(textBetween(textBetween(adXml, "SALE"), "price"));
  const price = salePrice || rentPrice || "";

  const property = textBetween(adXml, "property");
  const housing = textBetween(property, "housing");
  const location = textBetween(property, "location");
  const myAddress = textBetween(property, "myAddress");

  const zone = cleanText(textBetween(location, "name"));
  const streetName = cleanText(textBetween(textBetween(myAddress, "street"), "name"));
  const postalCode = cleanText(textBetween(myAddress, "postalCode"));

  const area = cleanText(textBetween(housing, "propertyArea"));
  const rooms = cleanText(textBetween(housing, "roomNumber"));
  const baths = cleanText(textBetween(housing, "bathNumber"));

  const operation = cleanText(textBetween(adXml, "operations")) === "1" ? "Alquiler" : "Venta";

  return {
    id,
    title: spanishComment.split(".")[0]?.replace(/\*/g, "") || "Inmueble en Toledo",
    description: spanishComment,
    image: pictures[0] || "",
    pictures,
    price,
    operation,
    zone,
    address: [streetName, postalCode].filter(Boolean).join(" · "),
    area,
    rooms,
    baths,
    idealistaUrl: `https://www.idealista.com/inmueble/${id}/`
  };
}

export default async function handler(req, res) {
  try {
    if (
      !process.env.IDEALISTA_FTP_HOST ||
      !process.env.IDEALISTA_FTP_USER ||
      !process.env.IDEALISTA_FTP_PASSWORD ||
      !process.env.IDEALISTA_FTP_FILE
    ) {
      return res.status(500).json({
        error: "Faltan variables de entorno",
        listings: []
      });
    }

    const xml = await downloadXml();
    const ads = allBlocks(xml, "ad");

    const listings = ads
      .map(parseListing)
      .filter(item => item.id);

    return res.status(200).json({
      ok: true,
      count: listings.length,
      listings
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      listings: []
    });
  }
}
