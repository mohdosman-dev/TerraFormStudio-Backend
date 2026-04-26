import mongoose, { Schema, Document } from 'mongoose'
import slugify from 'slugify'

export interface IProduct extends Document {
  artisanId: mongoose.Types.ObjectId
  slug: string
  title: string
  subtitle: string
  descriptionShort: string
  descriptionLong: string
  price: {
    amount: number
    currency: string
  }
  media: Array<{
    url: string
    alt: string
    type: 'image' | 'video'
    sortOrder: number
  }>
  specifications: {
    material: string
    technique: string
    glaze: string
    dimensions: {
      widthCm?: number
      heightCm?: number
      weightGrams?: number
    }
    care: string
  }
  inventory: {
    mode: 'unique' | 'regular'
    quantityAvailable: number
    status: 'available' | 'sold' | 'unavailable' | 'made_to_order'
  }
  discovery: {
    collectionIds: mongoose.Types.ObjectId[]
    tags: string[]
    relatedProductIds: mongoose.Types.ObjectId[]
  }
  seo: {
    title: string
    description: string
  }
  status: 'draft' | 'published' | 'archived'
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ProductSchema: Schema = new Schema(
  {
    artisanId: { type: Schema.Types.ObjectId, ref: 'Artisan', required: true, index: true },
    slug: { type: String, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: String,
    descriptionShort: String,
    descriptionLong: String,
    price: {
      amount: { type: Number, required: true },
      currency: { type: String, default: 'AED' }
    },
    media: [{
      url: String,
      alt: String,
      type: { type: String, enum: ['image', 'video'], default: 'image' },
      sortOrder: Number
    }],
    specifications: {
      material: String,
      technique: String,
      glaze: String,
      dimensions: {
        widthCm: Number,
        heightCm: Number,
        weightGrams: Number
      },
      care: String
    },
    inventory: {
      mode: { type: String, enum: ['unique', 'regular'], default: 'unique' },
      quantityAvailable: { type: Number, default: 1 },
      status: {
        type: String,
        enum: ['available', 'sold', 'unavailable', 'made_to_order'],
        default: 'available'
      }
    },
    discovery: {
      collectionIds: [{ type: Schema.Types.ObjectId, ref: 'Collection' }],
      tags: [String],
      relatedProductIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
    },
    seo: {
      title: String,
      description: String
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    publishedAt: Date
  },
  { timestamps: true }
)

// Auto-generate slug from title if not provided
ProductSchema.pre<IProduct>('save', function () {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true })
  }
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date()
  }
})

export const Product = mongoose.model<IProduct>('Product', ProductSchema)
