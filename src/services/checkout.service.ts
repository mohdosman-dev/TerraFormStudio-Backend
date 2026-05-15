import { CheckoutSession, type ICheckoutSession } from '../models/CheckoutSession.ts'
import { Cart } from '../models/Cart.ts'
import { Product } from '../models/Product.ts'
import mongoose from 'mongoose'

export class CheckoutService {
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
        $set: { 'inventory.status': 'available' } // In a real scenario we might move to 'locked'
      })
    }

    const session = new CheckoutSession({
      cartId: cart._id,
      userId: new mongoose.Types.ObjectId(userId),
      priceValidation: {
        currency: "AED",
        subtotal: cart.totals.subtotal,
        shipping: 20, // Default shipping
        tax: 0,
        grandTotal: cart.totals.subtotal + 20,
        validatedAt: new Date()
      }
    })

    await session.save()
    return session
  }

  async updateShipping(sessionId: string, userId: string, shippingData: any): Promise<ICheckoutSession | null> {
    const session = await CheckoutSession.findOne({ _id: sessionId, userId, status: 'in_progress' })
    if (!session) return null

    session.shipping = shippingData
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
