import { Cart, type ICart } from '../models/Cart.ts'
import { Product } from '../models/Product.ts'
import mongoose from 'mongoose'

export class CartService {
  async getOrCreateCart(identifier: { userId?: string; guestId?: string }): Promise<ICart> {
    const query = identifier.userId
      ? { userId: new mongoose.Types.ObjectId(identifier.userId), status: 'active' as const }
      : { guestId: identifier.guestId, status: 'active' as const }

    let cart = await Cart.findOne(query)
    if (!cart) {
      const doc: any = { status: 'active', items: [] }
      if (identifier.userId) doc.userId = new mongoose.Types.ObjectId(identifier.userId)
      if (identifier.guestId) doc.guestId = identifier.guestId
      cart = new Cart(doc)
      await cart.save()
    }
    cart = await cart.populate('items.productId')
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

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId)

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

    cart.items = (cart.items as any).filter((item: any) => item.productId.toString() !== productId)

    await this.calculateTotals(cart)
    await cart.save()
    return cart.populate('items.productId')
  }

  async mergeGuestCart(guestId: string, userId: string): Promise<ICart> {
    const guestCart = await Cart.findOne({ guestId, status: 'active' })
    const userCart = await this.getOrCreateCart({ userId })

    if (!guestCart || guestCart.items.length === 0) return userCart

    for (const guestItem of guestCart.items) {
      const existingIndex = userCart.items.findIndex(
        item => item.productId.toString() === guestItem.productId.toString(),
      )

      if (existingIndex > -1) {
        userCart.items[existingIndex].quantity += guestItem.quantity
      } else {
        userCart.items.push(guestItem)
      }
    }

    guestCart.status = 'completed'
    await guestCart.save()

    await this.calculateTotals(userCart)
    await userCart.save()
    return userCart.populate('items.productId')
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

    const item = cart.items.find(item => item.productId.toString() === productId)
    if (!item) return null

    if (quantity <= 0) {
      cart.items = (cart.items as any).filter((item: any) => item.productId.toString() !== productId)
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
