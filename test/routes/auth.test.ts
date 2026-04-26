import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { build } from '../helper'
import mongoose from 'mongoose'

describe('Auth Routes', () => {
  let app: any

  beforeAll(async () => {
    app = await build()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should signup a new user', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/signup',
      payload: {
        email: 'test@example.com',
        password: 'password123'
      }
    })

    expect(res.statusCode).toBe(201)
    const body = JSON.parse(res.payload)
    expect(body.user.email).toBe('test@example.com')
  })

  it('should login an existing user', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'test@example.com',
        password: 'password123'
      }
    })

    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.payload)
    expect(body.token).toBeDefined()
  })

  it('should get current user profile', async () => {
    // First login to get token
    const loginRes = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'test@example.com',
        password: 'password123'
      }
    })
    const { token } = JSON.parse(loginRes.payload)

    const res = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.payload)
    expect(body.user.email).toBe('test@example.com')
  })
})
