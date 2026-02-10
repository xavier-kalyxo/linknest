import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!; // e.g. https://pub-xxx.r2.dev

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export { r2 as r2Client };

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Generate a presigned URL for direct client upload to R2.
 */
export async function createPresignedUploadUrl(params: {
  workspaceId: string;
  filename: string;
  contentType: string;
  contentLength: number;
}): Promise<{ url: string; key: string } | { error: string }> {
  if (!ALLOWED_MIME_TYPES.has(params.contentType)) {
    return { error: "File type not allowed. Use JPEG, PNG, WebP, GIF, or SVG." };
  }

  if (params.contentLength > MAX_FILE_SIZE) {
    return { error: "File too large. Maximum size is 5MB." };
  }

  // Namespace R2 keys by workspace
  const ext = params.filename.split(".").pop() ?? "bin";
  const key = `${params.workspaceId}/${crypto.randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: params.contentType,
    ContentLength: params.contentLength,
  });

  const url = await getSignedUrl(r2, command, { expiresIn: 300 }); // 5 min

  return { url, key };
}

/**
 * Get the public URL for an R2 object.
 */
export function getR2PublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Delete an object from R2.
 */
export async function deleteR2Object(key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    }),
  );
}
