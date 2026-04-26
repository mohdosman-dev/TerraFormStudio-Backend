import mongoose, { Schema, Document } from 'mongoose'

export interface IOrder extends Document {
  orderNumber: string
  userId: mongoose.Types.ObjectId
  checkoutSessionId: mongoose.Types.ObjectId
  status: 'pending_payment' | 'paid' | 'failed' | 'cancelled' | 'refunded'
  paymentStatus: 'pending' | 'succeeded' | 'failed'
  fulfillmentStatus: 'processing' | 'packed' | 'shipped' | 'delivered' | 'returned'
  currency: string
  customer: {
    email: string
    fullName: string
  }
  shippingAddress: {
    addressLine1: string
    addressLine2?: string
    city: string
    country: string
    postalCode: string
  }
  items: Array<{
    productId: mongoose.Types.ObjectId
    slugSnapshot: string
    titleSnapshot: string
    artisanSnapshot: {
      artisanId: mongoose.Types.ObjectId
      displayName: string
    }
    imageSnapshot: string
    specificationSnapshot: {
      material?: string
      technique?: string
      glaze?: string
    }
    unitPrice: {
      amount: number
      currency: string
    }
    quantity: number
    lineTotal: number
  }>
  totals: {
    subtotal: number
    shipping: number
    tax: number
    grandTotal: number
  }
  placedAt: Date
  createdAt: Date
  updatedAt: Date
}

const OrderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, unique: true, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    checkoutSessionId: { type: Schema.Types.ObjectId, ref: 'CheckoutSession' },
    status: {
      type: String,
      enum: ['pending_payment', 'paid', 'failed', 'cancelled', 'refunded'],
      default: 'pending_payment'
    },
    paymentStatus: { type: String, enum: ['pending', 'succeeded', 'failed'], default: 'pending' },
    fulfillmentStatus: {
      type: String,
      enum: ['processing', 'packed', 'shipped', 'delivered', 'returned'],
      default: 'processing'
    },
    currency: { type: String, default: 'AED' },
    customer: {
      email: { type: String, required: true },
      fullName: { type: String, required: true }
    },
    shippingAddress: {
      addressLine1: { type: String, required: true },
      addressLine2: String,
      city: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true }
    },
    items: [{
      productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      slugSnapshot: String,
      titleSnapshot: String,
      artisanSnapshot: {
        artisanId: Schema.Types.ObjectId,
        displayName: String
      },
      imageSnapshot: String,
      specificationSnapshot: {
        material: String,
        technique: String,
        glaze: String
      },
      unitPrice: {
        amount: Number,
        currency: String
      },
      quantity: Number,
      lineTotal: Number
    }],
    totals: {
      subtotal: Number,
      shipping: Number,
      tax: Number,
      grandTotal: Number
    },
    placedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

export const Order = mongoose.model<IOrder>('Order', OrderSchema)
