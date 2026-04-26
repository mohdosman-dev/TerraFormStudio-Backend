import { Collection, type ICollection } from '../models/Collection.ts'

export class CollectionService {
  async create(data: Partial<ICollection>): Promise<ICollection> {
    const collection = new Collection(data)
    await collection.save()
    return collection
  }

  async findBySlug(slug: string): Promise<ICollection | null> {
    return Collection.findOne({ slug, status: 'published' }).populate('productIds')
  }

  async listPublished(): Promise<ICollection[]> {
    return Collection.find({ status: 'published' }).sort({ sortOrder: 1 })
  }

  async update(id: string, data: Partial<ICollection>): Promise<ICollection | null> {
    return Collection.findByIdAndUpdate(id, data, { new: true })
  }
}

export const collectionService = new CollectionService()
