import sharp from "sharp";

/**
 * Process an uploaded image buffer.
 * - "avatar" → center-crop to 512x512 square WebP
 * - default → resize to max 1200px width, WebP
 */
export async function processImage(
  buffer: Buffer,
  type?: string,
): Promise<Buffer> {
  if (type === "avatar") {
    return sharp(buffer)
      .resize(512, 512, { fit: "cover", position: "centre" })
      .webp({ quality: 85 })
      .toBuffer();
  }

  return sharp(buffer)
    .resize(1200, undefined, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}
