import mongoose, { Schema, Document } from 'mongoose'

export interface IHomeSection extends Document {
  name: string
  status: 'published' | 'draft' | 'archived'
  sections: Array<{
    type: 'hero' | 'artisan_spotlight' | 'product_row' | 'collection_row' | 'editorial'
    title?: string
    subtitle?: string
    image?: {
      url: string
      alt: string
    }
    cta?: {
      label: string
      targetType: 'collection' | 'product' | 'artisan' | 'url'
      targetId?: string
      url?: string
    }
    artisanId?: mongoose.Types.ObjectId
    productIds?: mongoose.Types.ObjectId[]
    collectionIds?: mongoose.Types.ObjectId[]
    content?: string
    sortOrder: number
  }>
  createdAt: Date
  updatedAt: Date
}

const HomeSectionSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'draft'
    },
    sections: [{
      type: {
        type: String,
        enum: ['hero', 'artisan_spotlight', 'product_row', 'collection_row', 'editorial'],
        required: true
      },
      title: String,
      subtitle: String,
      image: {
        url: String,
        alt: String
      },
      cta: {
        label: String,
        targetType: {
          type: String,
          enum: ['collection', 'product', 'artisan', 'url']
        },
        targetId: Schema.Types.ObjectId,
        url: String
      },
      artisanId: { type: Schema.Types.ObjectId, ref: 'Artisan' },
      productIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
      collectionIds: [{ type: Schema.Types.ObjectId, ref: 'Collection' }],
      content: String,
      sortOrder: { type: Number, required: true }
    }]
  },
  { timestamps: true }
)

export const HomeSection = mongoose.model<IHomeSection>('HomeSection', HomeSectionSchema)
