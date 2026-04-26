import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { build } from '../helper.ts'

describe('Discovery & Cart Routes', () => {
  let app: any
  let authToken: string
  let productId: string

  beforeAll(async () => {
    app = await build()
    
    // Setup: Create user and login
    await app.inject({
      method: 'POST',
      url: '/auth/signup',
      payload: { email: 'cart-user@example.com', password: 'password123' }
    })
    const loginRes = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'cart-user@example.com', password: 'password123' }
    })
    authToken = JSON.parse(loginRes.payload).token

    // Setup: Create an artisan and a published product
    // Note: In a real test we'd need to approve the artisan first, 
    // but we'll use a direct artisan creation if possible or simulate admin.
    // For this integration test, let's assume we have a way to get a product.
    
    // Apply as artisan
    const artisanRes = await app.inject({
      method: 'POST',
      url: '/artisans/apply',
      headers: { authorization: `Bearer ${authToken}` },
      payload: { displayName: 'Cart Artist', brandName: 'Cart Studio' }
    })
    const artisan = JSON.parse(artisanRes.payload)
    
    // Create product
    const productRes = await app.inject({
      method: 'POST',
      url: '/products',
      headers: { authorization: `Bearer ${authToken}` },
      payload: {
        title: 'Cart Item',
        price: { amount: 100 }
      }
    })
    const product = JSON.parse(productRes.payload)
    productId = product._id

    // Publish product
    await app.inject({
      method: 'PATCH',
      url: `/products/${productId}`,
      headers: { authorization: `Bearer ${authToken}` },
      payload: { status: 'published' }
    })
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Discovery', () => {
    it('should return 404 if no active home config exists', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/home'
      })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('Cart', () => {
    it('should get an empty cart for new user', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/cart',
        headers: { authorization: `Bearer ${authToken}` }
      })
      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.payload)
      expect(body.items.length).toBe(0)
    })

    it('should add an item to the cart', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/cart/items',
        headers: { authorization: `Bearer ${authToken}` },
        payload: { productId, quantity: 2 }
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.payload)
      expect(body.items.length).toBe(1)
      expect(body.items[0].quantity).toBe(2)
      expect(body.totals.subtotal).toBe(200)
    })

    it('should remove an item from the cart', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/cart/items/${productId}`,
        headers: { authorization: `Bearer ${authToken}` }
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.payload)
      expect(body.items.length).toBe(0)
      expect(body.totals.subtotal).toBe(0)
    })
  })
})
