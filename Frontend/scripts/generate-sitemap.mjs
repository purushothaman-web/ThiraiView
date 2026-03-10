import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

function normalizeBaseUrl(rawUrl) {
  if (!rawUrl) {
    throw new Error(
      "Missing VITE_SITE_URL. Set it to your canonical production URL, e.g. https://devdesk.example.com"
    );
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new Error(`Invalid VITE_SITE_URL: "${rawUrl}". Expected an absolute URL, e.g. https://devdesk.example.com`);
  }

  const normalizedPath = parsedUrl.pathname.replace(/\/+$/, "");
  const normalized = `${parsedUrl.origin}${normalizedPath}`;
  return normalized.replace(/\/+$/, "");
}

function xmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function main() {
  const baseUrl = normalizeBaseUrl(process.env.VITE_SITE_URL);
  const lastmod = new Date().toISOString().split("T")[0];

  const urls = PUBLIC_ROUTES.map((route) => {
    const absoluteUrl = route === "/" ? `${baseUrl}/` : `${baseUrl}${route}`;
    return [
      "  <url>",
      `    <loc>${xmlEscape(absoluteUrl)}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      "  </url>",
    ].join("\n");
  }).join("\n");

  const sitemapXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");

  const robotsTxt = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${baseUrl}/sitemap.xml`,
    "",
  ].join("\n");

  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const publicDir = join(scriptDir, "..", "public");
  await mkdir(publicDir, { recursive: true });

  await Promise.all([
    writeFile(join(publicDir, "sitemap.xml"), sitemapXml, "utf8"),
    writeFile(join(publicDir, "robots.txt"), robotsTxt, "utf8"),
  ]);

  console.log(`Generated sitemap and robots.txt for ${baseUrl}`);
}

main().catch((error) => {
  console.error(`Sitemap generation failed: ${error.message}`);
  process.exit(1);
});
