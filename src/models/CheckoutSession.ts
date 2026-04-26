import mongoose, { Schema, Document } from 'mongoose'

export interface ICheckoutSession extends Document {
  cartId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  status: 'in_progress' | 'completed' | 'expired' | 'cancelled'
  stepState: {
    shippingCompleted: boolean
    paymentCompleted: boolean
    reviewReady: boolean
  }
  shipping: {
    fullName?: string
    phone?: string
    addressLine1?: string
    addressLine2?: string
    city?: string
    country?: string
    postalCode?: string
    deliveryOption?: string
  }
  payment: {
    provider: string
    paymentIntentId?: string
    status: 'pending' | 'succeeded' | 'failed'
    methodSummary?: {
      brand?: string
      last4?: string
    }
  }
  priceValidation: {
    currency: string
    subtotal: number
    shipping: number
    tax: number
    grandTotal: number
    validatedAt: Date
  }
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const CheckoutSessionSchema: Schema = new Schema(
  {
    cartId: { type: Schema.Types.ObjectId, ref: 'Cart', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'expired', 'cancelled'],
      default: 'in_progress'
    },
    stepState: {
      shippingCompleted: { type: Boolean, default: false },
      paymentCompleted: { type: Boolean, default: false },
      reviewReady: { type: Boolean, default: false }
    },
    shipping: {
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      country: String,
      postalCode: String,
      deliveryOption: String
    },
    payment: {
      provider: { type: String, default: 'mock' },
      paymentIntentId: String,
      status: { type: String, enum: ['pending', 'succeeded', 'failed'], default: 'pending' },
      methodSummary: {
        brand: String,
        last4: String
      }
    },
    priceValidation: {
      currency: { type: String, default: 'AED' },
      subtotal: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      grandTotal: { type: Number, default: 0 },
      validatedAt: { type: Date, default: Date.now }
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 minutes lock
      index: { expires: 0 } // TTL index
    }
  },
  { timestamps: true }
)

export const CheckoutSession = mongoose.model<ICheckoutSession>('CheckoutSession', CheckoutSessionSchema)
