import mongoose, { Schema, Document } from 'mongoose'

export interface IDeliveryMethod {
  id: string
  name: string
  description: string
  price: number
  currency: string
  estimatedDays: string
  isActive: boolean
  isDefault: boolean
}

export interface ISystemSetting extends Document {
  general: {
    defaultCurrency: 'USD' | 'EUR' | 'GBP' | 'AED'
  }
  payments: {
    stripe: {
      isActive: boolean
      connectedAccount: string
    }
    paypal: {
      isActive: boolean
      email?: string
    }
    applePay: {
      isActive: boolean
      isVerified: boolean
    }
  }
  deliveryMethods: IDeliveryMethod[]
  legal: {
    termsAndConditions: {
      content: string
      lastUpdated: Date
    }
    privacyPolicy: {
      content: string
      lastUpdated: Date
    }
  }
  communication: {
    emailTemplates: {
      orderConfirmation: {
        subject: string
        body: string
      }
      shippingUpdate: {
        subject: string
        body: string
      }
      welcomeEmail: {
        subject: string
        body: string
      }
    }
  }
  updatedAt: Date
}

const DeliveryMethodSchema: Schema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    currency: { type: String, default: 'AED' },
    estimatedDays: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false }
  },
  { _id: false }
)

const SystemSettingSchema: Schema = new Schema(
  {
    general: {
      defaultCurrency: { type: String, enum: ['USD', 'EUR', 'GBP', 'AED'], default: 'USD' }
    },
    payments: {
      stripe: {
        isActive: { type: Boolean, default: false },
        connectedAccount: { type: String, default: '' }
      },
      paypal: {
        isActive: { type: Boolean, default: false },
        email: { type: String }
      },
      applePay: {
        isActive: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false }
      }
    },
    deliveryMethods: { type: [DeliveryMethodSchema], default: [] },
    legal: {
      termsAndConditions: {
        content: { type: String, default: '' },
        lastUpdated: { type: Date, default: Date.now }
      },
      privacyPolicy: {
        content: { type: String, default: '' },
        lastUpdated: { type: Date, default: Date.now }
      }
    },
    communication: {
      emailTemplates: {
        orderConfirmation: {
          subject: { type: String, default: 'Order Confirmation' },
          body: { type: String, default: '' }
        },
        shippingUpdate: {
          subject: { type: String, default: 'Shipping Update' },
          body: { type: String, default: '' }
        },
        welcomeEmail: {
          subject: { type: String, default: 'Welcome to Terra Form Studio' },
          body: { type: String, default: '' }
        }
      }
    }
  },
  { timestamps: { createdAt: false, updatedAt: true } }
)

export const SystemSetting = mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema)
