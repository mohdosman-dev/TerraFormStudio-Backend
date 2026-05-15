import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { build } from '../helper.ts'
import FormData from 'form-data'

describe('Upload Routes', () => {
  let app: any
  let authToken: string

  beforeAll(async () => {
    app = await build()
    
    // Setup: Create user and login
    await app.inject({
      method: 'POST',
      url: '/auth/signup',
      payload: { email: 'upload-user@example.com', password: 'password123' }
    })
    const loginRes = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'upload-user@example.com', password: 'password123' }
    })
    authToken = JSON.parse(loginRes.payload).token
  })

  afterAll(async () => {
    await app.close()
  })

  it('should upload an image via base64', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/upload?model=product',
      headers: { authorization: `Bearer ${authToken}` },
      payload: {
        filename: 'test.jpg',
        base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' // Tiny valid PNG in base64
      }
    })

    expect(res.statusCode).toBe(201)
    const body = JSON.parse(res.payload)
    expect(body.url).toMatch(/^\/uploads\/products\/.+\.jpg$/)
  })

  it('should upload an image via multipart', async () => {
    const form = new FormData()
    form.append('file', Buffer.from('fake-image-content'), {
      filename: 'test-multi.png',
      contentType: 'image/png'
    })

    const res = await app.inject({
      method: 'POST',
      url: '/upload?model=artisan',
      headers: {
        ...form.getHeaders(),
        authorization: `Bearer ${authToken}`
      },
      payload: form.getBuffer()
    })

    expect(res.statusCode).toBe(201)
    const body = JSON.parse(res.payload)
    expect(body.url).toMatch(/^\/uploads\/artisans\/.+\.png$/)
  })

  it('should return error for invalid file type', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/upload',
      headers: { authorization: `Bearer ${authToken}` },
      payload: {
        filename: 'test.txt',
        base64: 'YWJjZA=='
      }
    })

    expect(res.statusCode).toBe(400)
    const body = JSON.parse(res.payload)
    expect(body.message).toContain('Invalid file type')
  })
})
