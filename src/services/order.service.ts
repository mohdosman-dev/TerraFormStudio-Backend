import { Order, type IOrder } from '../models/Order.ts'
import { CheckoutSession } from '../models/CheckoutSession.ts'
import { Cart } from '../models/Cart.ts'
import { Product } from '../models/Product.ts'
import { Counter } from '../models/Counter.ts'
import { User } from '../models/User.ts'
import mongoose from 'mongoose'

export class OrderService {
  async completeCheckout(sessionId: string, userId: string): Promise<IOrder> {
    const session = await CheckoutSession.findOne({ _id: sessionId, userId, status: 'in_progress' })
    if (!session || !session.stepState.reviewReady) {
      throw new Error('Checkout session not ready for completion')
    }

    const cart = await Cart.findById(session.cartId).populate('userId')
    if (!cart) throw new Error('Cart not found')

    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    // Generate Order Number
    const orderNumber = await this.generateOrderNumber()

    // Create Order items from cart snapshots
    const orderItems = cart.items.map(item => ({
      productId: item.productId,
      titleSnapshot: item.titleSnapshot,
      slugSnapshot: '', // would need to populate product or store in cart
      artisanSnapshot: item.artisanSnapshot,
      imageSnapshot: item.imageSnapshot,
      unitPrice: item.priceSnapshot,
      quantity: item.quantity,
      lineTotal: item.priceSnapshot.amount * item.quantity
    }))

    const order = new Order({
      orderNumber,
      userId: new mongoose.Types.ObjectId(userId),
      checkoutSessionId: session._id,
      status: 'paid',
      paymentStatus: 'succeeded',
      fulfillmentStatus: 'processing',
      currency: session.priceValidation.currency,
      customer: {
        email: user.email,
        fullName: `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() || user.email
      },
      shippingAddress: {
        addressLine1: session.shipping.addressLine1!,
        addressLine2: session.shipping.addressLine2,
        city: session.shipping.city!,
        country: session.shipping.country!,
        postalCode: session.shipping.postalCode!
      },
      items: orderItems,
      totals: {
        subtotal: session.priceValidation.subtotal,
        shipping: session.priceValidation.shipping,
        tax: session.priceValidation.tax,
        grandTotal: session.priceValidation.grandTotal
      }
    })

    // Atomic: Mark products as sold
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $set: { 'inventory.status': 'sold' },
        $inc: { 'inventory.quantityAvailable': -item.quantity }
      })
    }

    await order.save()

    // Finalize session and cart
    session.status = 'completed'
    await session.save()
    
    cart.status = 'completed'
    await cart.save()

    return order
  }

  async listUserOrders(userId: string): Promise<IOrder[]> {
    return Order.find({ userId }).sort({ createdAt: -1 })
  }

  async getOrderDetails(orderId: string, userId: string): Promise<IOrder | null> {
    return Order.findOne({ _id: orderId, userId })
  }

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const counter = await Counter.findOneAndUpdate(
      { name: 'orderNumber' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    )
    const seqString = counter.seq.toString().padStart(6, '0')
    return `TFS-${year}-${seqString}`
  }
}

export const orderService = new OrderService()
