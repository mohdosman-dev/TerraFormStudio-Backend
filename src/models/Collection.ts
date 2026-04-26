import mongoose, { Schema, Document } from 'mongoose'
import slugify from 'slugify'

export interface ICollection extends Document {
  slug: string
  title: string
  description: string
  heroImage: {
    url: string
    alt: string
  }
  productIds: mongoose.Types.ObjectId[]
  status: 'draft' | 'published' | 'archived'
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

const CollectionSchema: Schema = new Schema(
  {
    slug: { type: String, unique: true, index: true },
    title: { type: String, required: true },
    description: String,
    heroImage: {
      url: String,
      alt: String
    },
    productIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
)

// Auto-generate slug from title if not provided
CollectionSchema.pre<ICollection>('save', function () {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true })
  }
})

export const Collection = mongoose.model<ICollection>('Collection', CollectionSchema)
