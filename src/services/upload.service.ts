import fs from "node:fs/promises";
import { join, extname } from "node:path";
import { v4 as uuidv4 } from "uuid";
import { pipeline } from "node:stream/promises";
import fsSync from "node:fs";

const UPLOADS_ROOT = join(process.cwd(), "uploads");

export type UploadModel = "artisan" | "product" | "collection" | "general";

export class UploadService {
  private allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

  async ensureDirectory(model: UploadModel): Promise<string> {
    const dir = join(UPLOADS_ROOT, `${model}s`);
    if (!fsSync.existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
    return dir;
  }

  async uploadMultipart(filePart: any, model: UploadModel): Promise<string> {
    const ext = extname(filePart.filename).toLowerCase();
    if (!this.allowedExtensions.includes(ext)) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
      );
    }

    const dir = await this.ensureDirectory(model);
    const filename = `${uuidv4()}${ext}`;
    const filepath = join(dir, filename);

    await pipeline(filePart.file, fsSync.createWriteStream(filepath));

    return `/uploads/${model}s/${filename}`;
  }

  async uploadBase64(
    base64Data: string,
    model: UploadModel,
    originalFilename: string,
  ): Promise<string> {
    const ext = extname(originalFilename).toLowerCase() || ".jpg";
    if (!this.allowedExtensions.includes(ext)) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
      );
    }

    // Extract base64 content if it has data:image/xxx;base64, prefix
    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    const buffer = matches
      ? Buffer.from(matches[2], "base64")
      : Buffer.from(base64Data, "base64");

    if (buffer.length > 5 * 1024 * 1024) {
      throw new Error("File size exceeds 5MB limit.");
    }

    const dir = await this.ensureDirectory(model);
    const filename = `${uuidv4()}${ext}`;
    const filepath = join(dir, filename);

    await fs.writeFile(filepath, buffer);

    return `/uploads/${model}s/${filename}`;
  }
}

export const uploadService = new UploadService();
