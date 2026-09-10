import dotenv from "dotenv";
import {
  buildProductDetailsMediaManifestFromAzure,
  findDuplicateProductSlugs,
} from "./product-details-media-manifest";

for (const envFile of [".env.imports", ".env", ".env.local"]) {
  dotenv.config({ path: envFile, override: true, quiet: true });
}

const tenantId = process.env.AZURE_TENANT_ID || process.env.TENANT_ID || "";
const clientId = process.env.AZURE_CLIENT_ID || process.env.CLIENT_ID || "";
const clientSecret = process.env.AZURE_CLIENT_SECRET || process.env.CLIENT_SECRET || "";
const storageAccount = process.env.AZURE_STORAGE_ACCOUNT || "webcms";
const containerName = process.env.AZURE_STORAGE_CONTAINER || "media";

const required = [
  ["AZURE_TENANT_ID", tenantId],
  ["AZURE_CLIENT_ID", clientId],
  ["AZURE_CLIENT_SECRET", clientSecret],
  ["AZURE_STORAGE_ACCOUNT", storageAccount],
  ["AZURE_STORAGE_CONTAINER", containerName],
].filter(([, value]) => !value);

if (required.length) {
  console.error(
    `Faltan variables de entorno: ${required.map(([name]) => name).join(", ")}`
  );
  process.exit(1);
}

async function main() {
  const { manifest, totalScanned } = await buildProductDetailsMediaManifestFromAzure({
    tenantId,
    clientId,
    clientSecret,
    storageAccount,
    containerName,
    prefix: "product/",
  });

  const entries = Object.values(manifest.products).flat();
  const prefixes = [...new Set(
    entries.map((entry) => `product/${entry.categoryPath}/details/${entry.productSlug}/`)
  )].sort((a, b) => a.localeCompare(b));
  const duplicateProductSlugs = findDuplicateProductSlugs(
    Object.keys(manifest.products).map((slug) => ({ slug }))
  );

  console.log(JSON.stringify({
    storageAccount,
    containerName,
    scannedPrefix: manifest.source.prefix,
    totalProductBlobsScanned: totalScanned,
    totalDetailsImages: entries.length,
    totalProductsWithDetailsImages: Object.keys(manifest.products).length,
    first20DetailsPaths: entries.slice(0, 20).map((entry) => entry.blobPath),
    first20DetailPrefixes: prefixes.slice(0, 20),
    duplicateProductSlugs,
    productsWithDetailsImages: Object.keys(manifest.products),
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
