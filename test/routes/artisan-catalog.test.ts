import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { build } from '../helper.ts'

describe('Artisan & Catalog Routes', () => {
  let app: any
  let authToken: string
  let adminToken: string
  let artisanId: string
  let productSlug: string

  beforeAll(async () => {
    app = await build()
    
    // Create a regular user
    await app.inject({
      method: 'POST',
      url: '/auth/signup',
      payload: { email: 'artisan@example.com', password: 'password123' }
    })
    const loginRes = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'artisan@example.com', password: 'password123' }
    })
    authToken = JSON.parse(loginRes.payload).token

    // Create an admin user (Simulate by manually updating the DB or using a shortcut)
    // For simplicity in this test, we'll assume the first user can be an admin if we wanted to
    // But let's just test the artisan flow for now
  })

  afterAll(async () => {
    await app.close()
  })

  it('should apply for an artisan profile', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/artisans/apply',
      headers: { authorization: `Bearer ${authToken}` },
      payload: {
        displayName: 'Test Artist',
        brandName: 'Test Studio',
        bioShort: 'A short bio'
      }
    })

    expect(res.statusCode).toBe(201)
    const body = JSON.parse(res.payload)
    expect(body.status).toBe('pending')
    expect(body.slug).toBe('test-studio')
    artisanId = body._id
  })

  it('should not list pending artisans publicly', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/artisans'
    })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.payload)
    expect(body.length).toBe(0)
  })

  it('should allow artisan to create a product', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/products',
      headers: { authorization: `Bearer ${authToken}` },
      payload: {
        title: 'Handmade Bowl',
        price: { amount: 150 },
        inventory: { mode: 'unique' }
      }
    })

    expect(res.statusCode).toBe(201)
    const body = JSON.parse(res.payload)
    expect(body.title).toBe('Handmade Bowl')
    expect(body.slug).toBe('handmade-bowl')
    productSlug = body.slug
  })

  it('should not find a draft product publicly', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/products/${productSlug}`
    })
    expect(res.statusCode).toBe(404)
  })
})
