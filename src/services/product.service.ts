import { Product, type IProduct } from '../models/Product.ts'
import mongoose from 'mongoose'

export class ProductService {
  async create(artisanId: string, data: Partial<IProduct>): Promise<IProduct> {
    const product = new Product({
      ...data,
      artisanId: new mongoose.Types.ObjectId(artisanId)
    })
    await product.save()
    return product
  }

  async findBySlug(slug: string): Promise<IProduct | null> {
    return Product.findOne({ slug, status: 'published' }).populate('artisanId')
  }

  async listPublished(filters: any = {}): Promise<IProduct[]> {
    const query = { status: 'published', ...filters }
    return Product.find(query).sort({ createdAt: -1 }).populate('artisanId')
  }

  async update(id: string, artisanId: string, data: Partial<IProduct>, isAdmin: boolean): Promise<IProduct | null> {
    const query = isAdmin ? { _id: id } : { _id: id, artisanId }
    const product = await Product.findOne(query)
    
    if (!product) return null

    Object.assign(product, data)
    await product.save()
    return product
  }

  async softDelete(id: string, artisanId: string, isAdmin: boolean): Promise<boolean> {
    const query = isAdmin ? { _id: id } : { _id: id, artisanId }
    const result = await Product.updateOne(query, { status: 'archived' })
    return result.modifiedCount > 0
  }
}

export const productService = new ProductService()
