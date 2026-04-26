import { Artisan, type IArtisan } from '../models/Artisan.ts'
import mongoose from 'mongoose'

export class ArtisanService {
  async apply(userId: string, data: Partial<IArtisan>): Promise<IArtisan> {
    const artisan = new Artisan({
      ...data,
      userId: new mongoose.Types.ObjectId(userId),
      status: 'pending'
    })
    await artisan.save()
    return artisan
  }

  async findBySlug(slug: string): Promise<IArtisan | null> {
    return Artisan.findOne({ slug, status: 'published' })
  }

  async listPublished(): Promise<IArtisan[]> {
    return Artisan.find({ status: 'published' }).sort({ createdAt: -1 })
  }

  async updateArtisan(id: string, userId: string, data: Partial<IArtisan>, isAdmin: boolean): Promise<IArtisan | null> {
    const query = isAdmin ? { _id: id } : { _id: id, userId }
    const artisan = await Artisan.findOne(query)
    
    if (!artisan) return null

    // If not admin, restrict to "additional information" only
    if (!isAdmin) {
      // Basic info fields that only Admin can edit
      const basicInfoFields = ['displayName', 'brandName', 'slug', 'status', 'userId']
      basicInfoFields.forEach(field => {
        delete (data as any)[field]
      })
    }

    Object.assign(artisan, data)
    await artisan.save()
    return artisan
  }

  async approve(id: string): Promise<IArtisan | null> {
    return Artisan.findByIdAndUpdate(id, { status: 'published' }, { new: true })
  }
}

export const artisanService = new ArtisanService()
