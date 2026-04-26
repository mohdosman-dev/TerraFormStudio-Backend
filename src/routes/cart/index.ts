import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { cartService } from '../../services/cart.service.ts'

const cartRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  fastify.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      response: {
        200: z.any()
      }
    }
  }, async (request) => {
    const user = request.user as any
    return cartService.getOrCreateCart(user.id)
  })

  fastify.post('/items', {
    onRequest: [fastify.authenticate],
    schema: {
      body: z.object({
        productId: z.string(),
        quantity: z.number().int().positive().default(1)
      }),
      response: {
        200: z.any()
      }
    }
  }, async (request) => {
    const user = request.user as any
    const { productId, quantity } = request.body
    try {
      return await cartService.addItem(user.id, productId, quantity)
    } catch (err: any) {
      throw fastify.httpErrors.badRequest(err.message)
    }
  })

  fastify.delete('/items/:productId', {
    onRequest: [fastify.authenticate],
    schema: {
      params: z.object({ productId: z.string() }),
      response: {
        200: z.any()
      }
    }
  }, async (request) => {
    const user = request.user as any
    const cart = await cartService.removeItem(user.id, request.params.productId)
    if (!cart) throw fastify.httpErrors.notFound('Cart not found')
    return cart
  })
}

export default cartRoutes
