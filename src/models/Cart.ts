import mongoose, { Schema, Document } from 'mongoose'

export interface ICart extends Document {
  userId?: mongoose.Types.ObjectId
  guestId?: string
  status: 'active' | 'completed' | 'abandoned'
  items: Array<{
    productId: mongoose.Types.ObjectId
    quantity: number
    addedAt: Date
  }>
  totals: {
    subtotal: number
    estimatedShipping: number
    tax: number
    grandTotal: number
  }
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const CartSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    guestId: { type: String, required: false, index: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active'
    },
    items: [{
      productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1 },
      addedAt: { type: Date, default: Date.now }
    }],
    totals: {
      subtotal: { type: Number, default: 0 },
      estimatedShipping: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      grandTotal: { type: Number, default: 0 }
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  },
  { timestamps: true }
)

CartSchema.index(
  { userId: 1 },
  {
    unique: true,
    partialFilterExpression: { userId: { $type: 'objectId' } }
  }
)

export const Cart = mongoose.model<ICart>('Cart', CartSchema)
