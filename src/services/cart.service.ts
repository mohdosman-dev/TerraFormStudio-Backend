import { Cart, type ICart } from '../models/Cart.ts'
import { Product } from '../models/Product.ts'
import mongoose from 'mongoose'

export class CartService {
  async getOrCreateCart(userId: string): Promise<ICart> {
    let cart = await Cart.findOne({ userId, status: 'active' })
    if (!cart) {
      cart = new Cart({ userId: new mongoose.Types.ObjectId(userId) })
      await cart.save()
    }
    return cart
  }

  async addItem(userId: string, productId: string, quantity: number = 1): Promise<ICart> {
    const cart = await this.getOrCreateCart(userId)
    const product = await Product.findById(productId).populate('artisanId')
    
    if (!product || product.status !== 'published') {
      throw new Error('Product not available')
    }

    const artisan = product.artisanId as any

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId)

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity
      cart.items[itemIndex].priceSnapshot = {
        amount: product.price.amount,
        currency: product.price.currency
      }
    } else {
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        titleSnapshot: product.title,
        artisanSnapshot: {
          artisanId: artisan._id,
          displayName: artisan.displayName
        },
        imageSnapshot: product.media[0]?.url || '',
        priceSnapshot: {
          amount: product.price.amount,
          currency: product.price.currency
        },
        quantity,
        addedAt: new Date()
      })
    }

    this.calculateTotals(cart)
    await cart.save()
    return cart
  }

  async removeItem(userId: string, productId: string): Promise<ICart | null> {
    const cart = await Cart.findOne({ userId, status: 'active' })
    if (!cart) return null

    cart.items = (cart.items as any).filter((item: any) => item.productId.toString() !== productId)
    
    this.calculateTotals(cart)
    await cart.save()
    return cart
  }

  private calculateTotals(cart: ICart) {
    const subtotal = cart.items.reduce((sum, item) => sum + (item.priceSnapshot.amount * item.quantity), 0)
    cart.totals.subtotal = subtotal
    cart.totals.grandTotal = subtotal + cart.totals.estimatedShipping + cart.totals.tax
  }
}

export const cartService = new CartService()
