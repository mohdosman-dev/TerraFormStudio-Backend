import { Artisan, type IArtisan } from "../models/Artisan.ts";
import { Product, type IProduct } from "../models/Product.ts";
import mongoose from "mongoose";

export class ArtisanService {
  async apply(userId: string, data: Partial<IArtisan>): Promise<IArtisan> {
    const artisan = new Artisan({
      ...data,
      userId: new mongoose.Types.ObjectId(userId),
      status: "pending",
    });
    await artisan.save();
    return artisan;
  }

  async findBySlug(slug: string): Promise<IArtisan | null> {
    return Artisan.findOne({ slug, status: "published" });
  }

  async findBySlugWithProducts(
    slug: string,
  ): Promise<{ artisan: IArtisan | null; products: IProduct[] }> {
    const artisan = await Artisan.findOne({ slug, status: "published" });
    if (!artisan) return { artisan: null, products: [] };

    const products = await Product.find(
      {
        artisanId: artisan._id,
        status: "published",
      },
      { artisanId: 0 },
    ).sort({ createdAt: -1 });

    return { artisan, products };
  }

  async listPublished(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: IArtisan[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Artisan.find({ status: "published" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Artisan.countDocuments({ status: "published" }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateArtisan(
    id: string,
    userId: string,
    data: Partial<IArtisan>,
    isAdmin: boolean,
  ): Promise<IArtisan | null> {
    const query = isAdmin ? { _id: id } : { _id: id, userId };
    const artisan = await Artisan.findOne(query);

    if (!artisan) return null;

    // If not admin, restrict to "additional information" only
    if (!isAdmin) {
      // Basic info fields that only Admin can edit
      const basicInfoFields = [
        "displayName",
        "brandName",
        "slug",
        "status",
        "userId",
      ];
      basicInfoFields.forEach((field) => {
        delete (data as any)[field];
      });
    }

    Object.assign(artisan, data);
    await artisan.save();
    return artisan;
  }

  async approve(id: string): Promise<IArtisan | null> {
    return Artisan.findByIdAndUpdate(
      id,
      { status: "published" },
      { new: true },
    );
  }
}

export const artisanService = new ArtisanService();
