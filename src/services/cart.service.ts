import { Cart, type ICart } from '../models/Cart.ts'
import { Product } from '../models/Product.ts'
import mongoose from 'mongoose'

export class CartService {
  async getOrCreateCart(identifier: { userId?: string; guestId?: string }): Promise<ICart> {
    const query = identifier.userId
      ? { userId: new mongoose.Types.ObjectId(identifier.userId), status: 'active' as const }
      : { guestId: identifier.guestId, status: 'active' as const }

    const update: any = {
      $setOnInsert: {
        status: 'active',
        items: []
      }
    }

    if (identifier.userId) {
      update.$setOnInsert.userId = new mongoose.Types.ObjectId(identifier.userId)
    }
    if (identifier.guestId) {
      update.$setOnInsert.guestId = identifier.guestId
    }

    const cart = await Cart.findOneAndUpdate(query, update, { upsert: true, new: true })
    await cart.populate('items.productId')
    return cart
  }

  async addItem(
    identifier: { userId?: string; guestId?: string },
    productId: string,
    quantity: number = 1,
  ): Promise<ICart> {
    const cart = await this.getOrCreateCart(identifier)
    const product = await Product.findById(productId)

    if (!product || product.status !== 'published') {
      throw new Error('Product not available')
    }

    const itemIndex = cart.items.findIndex(item => {
      const itemProductId = (item.productId as any)?._id ?? item.productId
      return itemProductId.toString() === productId
    })

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity
    } else {
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        quantity,
        addedAt: new Date(),
      })
    }

    await this.calculateTotals(cart)
    await cart.save()
    return cart.populate('items.productId')
  }

  async removeItem(
    identifier: { userId?: string; guestId?: string },
    productId: string,
  ): Promise<ICart | null> {
    const query = identifier.userId
      ? { userId: new mongoose.Types.ObjectId(identifier.userId), status: 'active' as const }
      : { guestId: identifier.guestId, status: 'active' as const }

    const cart = await Cart.findOne(query)
    if (!cart) return null

    cart.items = (cart.items as any).filter((item: any) => {
      const itemProductId = item.productId?._id ?? item.productId
      return itemProductId.toString() !== productId
    })

    await this.calculateTotals(cart)
    await cart.save()
    return cart.populate('items.productId')
  }

  async mergeGuestCart(guestId: string, userId: string): Promise<ICart> {
    const session = await mongoose.startSession()

    return await session.withTransaction(async () => {
      const guestCart = await Cart.findOne({ guestId, status: 'active' }).session(session)

      // Check idempotency: skip if already merged
      if (guestCart && (guestCart as any).mergedToUserId) {
        const userCart = await this.getOrCreateCart({ userId })
        return userCart
      }

      const userCart = await Cart.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        status: 'active'
      }).session(session)

      if (!userCart) {
        // Create user cart if it doesn't exist
        const newUserCart = await this.getOrCreateCart({ userId })
        return newUserCart
      }

      if (!guestCart || guestCart.items.length === 0) return userCart

      for (const guestItem of guestCart.items) {
        const guestProductId = (guestItem.productId as any)?._id ?? guestItem.productId
        const existingIndex = userCart.items.findIndex(item => {
          const itemProductId = (item.productId as any)?._id ?? item.productId
          return itemProductId.toString() === guestProductId.toString()
        })

        if (existingIndex > -1) {
          userCart.items[existingIndex].quantity += guestItem.quantity
        } else {
          userCart.items.push(guestItem)
        }
      }

      // Mark guest cart as merged for idempotency
      guestCart.status = 'completed';
      (guestCart as any).mergedToUserId = new mongoose.Types.ObjectId(userId);
      (guestCart as any).mergedAt = new Date()
      await guestCart.save({ session })

      await this.calculateTotals(userCart)
      await userCart.save({ session })

      await userCart.populate('items.productId')
      return userCart
    }).finally(() => session.endSession())
  }

  async updateItemQuantity(
    identifier: { userId?: string; guestId?: string },
    productId: string,
    quantity: number,
  ): Promise<ICart | null> {
    const query = identifier.userId
      ? { userId: new mongoose.Types.ObjectId(identifier.userId), status: 'active' as const }
      : { guestId: identifier.guestId, status: 'active' as const }

    const cart = await Cart.findOne(query)
    if (!cart) return null

    const item = cart.items.find(item => {
      const itemProductId = (item.productId as any)?._id ?? item.productId
      return itemProductId.toString() === productId
    })
    if (!item) return null

    if (quantity <= 0) {
      cart.items = (cart.items as any).filter((item: any) => {
        const itemProductId = item.productId?._id ?? item.productId
        return itemProductId.toString() !== productId
      })
    } else {
      item.quantity = quantity
    }

    await this.calculateTotals(cart)
    await cart.save()
    return cart.populate('items.productId')
  }

  private async calculateTotals(cart: ICart) {
    const productIds = [...new Set(cart.items.map(item => item.productId.toString()))]
    const products = await Product.find({ _id: { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) } })
    const priceMap = new Map(products.map(p => [p._id.toString(), p.price.amount]))

    const subtotal = cart.items.reduce(
      (sum, item) => sum + (priceMap.get(item.productId.toString()) || 0) * item.quantity,
      0,
    )
    cart.totals.subtotal = subtotal
    cart.totals.grandTotal = subtotal + cart.totals.estimatedShipping + cart.totals.tax
  }
}

export const cartService = new CartService()
