import { CheckoutSession, type ICheckoutSession } from '../models/CheckoutSession.ts'
import { Cart } from '../models/Cart.ts'
import { Product } from '../models/Product.ts'
import { settingsService } from './settings.service.ts'
import mongoose from 'mongoose'

export class CheckoutService {
  private async getDefaultShipping(): Promise<{ price: number; currency: string }> {
    const settings = await settingsService.getSettings()
    const defaultMethod = settings.deliveryMethods.find((dm) => dm.isActive && dm.isDefault)
    if (defaultMethod) {
      return { price: defaultMethod.price, currency: defaultMethod.currency }
    }
    const firstActive = settings.deliveryMethods.find((dm) => dm.isActive)
    if (firstActive) {
      return { price: firstActive.price, currency: firstActive.currency }
    }
    return { price: 0, currency: 'AED' }
  }

  private async getDeliveryMethodPrice(deliveryOptionId: string): Promise<{ price: number; currency: string }> {
    const settings = await settingsService.getSettings()
    const method = settings.deliveryMethods.find((dm) => dm.id === deliveryOptionId && dm.isActive)
    if (method) {
      return { price: method.price, currency: method.currency }
    }
    return { price: 0, currency: 'AED' }
  }

  async initCheckout(userId: string): Promise<ICheckoutSession> {
    const cart = await Cart.findOne({ userId, status: 'active' })
    if (!cart || cart.items.length === 0) {
      throw new Error('Active cart is empty')
    }

    // Check availability and lock items
    for (const item of cart.items) {
      const product = await Product.findById(item.productId)
      if (!product) throw new Error('Product not found')
      if (product.inventory.status !== 'available' || product.inventory.quantityAvailable < item.quantity) {
        throw new Error(`Product ${product.title} is no longer available`)
      }
    }

    // Atomic Lock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $set: { 'inventory.status': 'available' }
      })
    }

    const defaultShipping = await this.getDefaultShipping()

    const session = new CheckoutSession({
      cartId: cart._id,
      userId: new mongoose.Types.ObjectId(userId),
      priceValidation: {
        currency: defaultShipping.currency,
        subtotal: cart.totals.subtotal,
        shipping: defaultShipping.price,
        tax: 0,
        grandTotal: cart.totals.subtotal + defaultShipping.price,
        validatedAt: new Date()
      }
    })

    await session.save()
    return session
  }

  async updateShipping(sessionId: string, userId: string, shippingData: any): Promise<ICheckoutSession | null> {
    const session = await CheckoutSession.findOne({ _id: sessionId, userId, status: 'in_progress' })
    if (!session) return null

    // Recalculate shipping if deliveryOption changed
    if (shippingData.deliveryOption) {
      const { price, currency } = await this.getDeliveryMethodPrice(shippingData.deliveryOption)
      session.shipping = shippingData
      session.priceValidation.shipping = price
      session.priceValidation.currency = currency
      session.priceValidation.grandTotal = session.priceValidation.subtotal + price + session.priceValidation.tax
      session.priceValidation.validatedAt = new Date()
    } else {
      session.shipping = shippingData
    }
    session.stepState.shippingCompleted = true
    await session.save()
    return session
  }

  async processMockPayment(sessionId: string, userId: string): Promise<ICheckoutSession | null> {
    const session = await CheckoutSession.findOne({ _id: sessionId, userId, status: 'in_progress' })
    if (!session) return null

    if (!session.stepState.shippingCompleted) {
      throw new Error('Shipping must be completed first')
    }

    // Simulate success
    session.payment = {
      provider: 'mock',
      paymentIntentId: 'mock_' + Math.random().toString(36).substr(2, 9),
      status: 'succeeded',
      methodSummary: { brand: 'visa', last4: '4242' }
    }
    session.stepState.paymentCompleted = true
    session.stepState.reviewReady = true
    await session.save()
    return session
  }
}

export const checkoutService = new CheckoutService()
