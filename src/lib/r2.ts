import { AwsClient } from "aws4fetch";

// ── Cloudflare R2 (storage S3-compatível) ────────────────────────────────────
// Usado pro upload de logo do cliente. A logo precisa ser PÚBLICA pra leitura,
// porque o next/og (Satori) busca a imagem por URL ao renderizar o carrossel.
//
// Env vars (setar local em .env.local e na Vercel):
//   R2_ACCOUNT_ID         — ID da conta Cloudflare
//   R2_ACCESS_KEY_ID      — token R2 (Access Key ID)
//   R2_SECRET_ACCESS_KEY  — token R2 (Secret Access Key)
//   R2_BUCKET             — nome do bucket
//   R2_PUBLIC_BASE_URL    — URL pública do bucket (ex: https://pub-xxxx.r2.dev), sem barra no fim

export const LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
export const LOGO_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBase: string;
};

// Lê e valida a config só quando precisa — erro claro se faltar env var.
function getConfig(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicBase = process.env.R2_PUBLIC_BASE_URL;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBase) {
    throw new Error("R2 não configurado: defina R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL");
  }
  return { accountId, accessKeyId, secretAccessKey, bucket, publicBase: publicBase.replace(/\/$/, "") };
}

export function isR2Configured(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET &&
    process.env.R2_PUBLIC_BASE_URL
  );
}

function client(cfg: R2Config): AwsClient {
  return new AwsClient({
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
    service: "s3",
    region: "auto",
  });
}

function endpoint(cfg: R2Config, key: string): string {
  return `https://${cfg.accountId}.r2.cloudflarestorage.com/${cfg.bucket}/${key}`;
}

// Sobe um objeto e devolve a URL pública pra renderizar.
export async function putObject(
  key: string,
  body: ArrayBuffer | Uint8Array,
  contentType: string
): Promise<string> {
  const cfg = getConfig();
  const res = await client(cfg).fetch(endpoint(cfg, key), {
    method: "PUT",
    body: body as BodyInit,
    headers: { "Content-Type": contentType },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`R2 PUT ${res.status}: ${txt.slice(0, 200)}`);
  }
  return `${cfg.publicBase}/${key}`;
}

// Remove um objeto pela URL pública (best-effort — não derruba o fluxo se falhar).
export async function deleteByPublicUrl(url: string): Promise<void> {
  if (!isR2Configured()) return;
  const cfg = getConfig();
  if (!url.startsWith(cfg.publicBase + "/")) return;
  const key = url.slice(cfg.publicBase.length + 1);
  try {
    await client(cfg).fetch(endpoint(cfg, key), { method: "DELETE" });
  } catch {
    // ignora: limpeza de storage não deve quebrar a request do usuário
  }
}
