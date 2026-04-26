import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { build } from '../helper.ts'

describe('Checkout & Order Routes', () => {
  let app: any
  let authToken: string
  let productId: string
  let sessionId: string

  beforeAll(async () => {
    app = await build()
    
    // Setup: Create user and login
    await app.inject({
      method: 'POST',
      url: '/auth/signup',
      payload: { email: 'checkout-user@example.com', password: 'password123' }
    })
    const loginRes = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'checkout-user@example.com', password: 'password123' }
    })
    authToken = JSON.parse(loginRes.payload).token

    // Setup: Create artisan and a published product
    await app.inject({
      method: 'POST',
      url: '/artisans/apply',
      headers: { authorization: `Bearer ${authToken}` },
      payload: { displayName: 'Order Artist', brandName: 'Order Studio' }
    })
    
    const productRes = await app.inject({
      method: 'POST',
      url: '/products',
      headers: { authorization: `Bearer ${authToken}` },
      payload: {
        title: 'Order Item',
        price: { amount: 200 }
      }
    })
    const product = JSON.parse(productRes.payload)
    productId = product._id

    // Publish
    await app.inject({
      method: 'PATCH',
      url: `/products/${productId}`,
      headers: { authorization: `Bearer ${authToken}` },
      payload: { status: 'published' }
    })

    // Add to cart
    await app.inject({
      method: 'POST',
      url: '/cart/items',
      headers: { authorization: `Bearer ${authToken}` },
      payload: { productId, quantity: 1 }
    })
  })

  afterAll(async () => {
    await app.close()
  })

  it('should initialize a checkout session', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/checkout',
      headers: { authorization: `Bearer ${authToken}` }
    })

    expect(res.statusCode).toBe(201)
    const body = JSON.parse(res.payload)
    expect(body.status).toBe('in_progress')
    expect(body.priceValidation.subtotal).toBe(200)
    sessionId = body._id
  })

  it('should update shipping info', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/checkout/${sessionId}/shipping`,
      headers: { authorization: `Bearer ${authToken}` },
      payload: {
        fullName: 'Lina Haddad',
        phone: '+971500000000',
        addressLine1: 'Al Rashidiya',
        city: 'Ajman',
        country: 'AE',
        postalCode: '00000'
      }
    })

    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.payload)
    expect(body.stepState.shippingCompleted).toBe(true)
  })

  it('should process mock payment', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/checkout/${sessionId}/payment`,
      headers: { authorization: `Bearer ${authToken}` }
    })

    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.payload)
    expect(body.stepState.paymentCompleted).toBe(true)
  })

  it('should complete checkout and create order', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/checkout/${sessionId}/complete`,
      headers: { authorization: `Bearer ${authToken}` }
    })

    expect(res.statusCode).toBe(201)
    const body = JSON.parse(res.payload)
    expect(body.orderNumber).toMatch(/^TFS-\d{4}-\d{6}$/)
    expect(body.status).toBe('paid')
  })

  it('should list user orders', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/orders',
      headers: { authorization: `Bearer ${authToken}` }
    })

    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.payload)
    expect(body.length).toBe(1)
  })
})
