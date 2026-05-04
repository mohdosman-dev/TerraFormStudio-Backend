import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { checkoutService } from '../../services/checkout.service.ts'
import { orderService } from '../../services/order.service.ts'

const checkoutRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Checkout'],
      summary: 'Initialize a checkout session',
      security: [{ bearerAuth: [] }],
      response: {
        201: z.any()
      }
    }
  }, async (request, reply) => {
    const user = request.user as any
    try {
      const session = await checkoutService.initCheckout(user.id)
      return reply.status(201).send(session)
    } catch (err: any) {
      throw fastify.httpErrors.badRequest(err.message)
    }
  })

  fastify.put('/:id/shipping', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Checkout'],
      summary: 'Update shipping details for a checkout session',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      body: z.object({
        fullName: z.string(),
        addressLine1: z.string(),
        addressLine2: z.string().optional(),
        city: z.string(),
        country: z.string(),
        postalCode: z.string()
      }),
      response: {
        200: z.any()
      }
    }
  }, async (request) => {
    const user = request.user as any
    const session = await checkoutService.updateShipping(request.params.id, user.id, request.body)
    if (!session) throw fastify.httpErrors.notFound('Checkout session not found')
    return session
  })

  fastify.put('/:id/payment', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Checkout'],
      summary: 'Process payment for a checkout session (Mock)',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      response: {
        200: z.any()
      }
    }
  }, async (request) => {
    const user = request.user as any
    try {
      const session = await checkoutService.processMockPayment(request.params.id, user.id)
      if (!session) throw fastify.httpErrors.notFound('Checkout session not found')
      return session
    } catch (err: any) {
      throw fastify.httpErrors.badRequest(err.message)
    }
  })

  fastify.post('/:id/complete', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Checkout'],
      summary: 'Complete a checkout session and create an order',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      response: {
        201: z.any()
      }
    }
  }, async (request, reply) => {
    const user = request.user as any
    try {
      const order = await orderService.completeCheckout(request.params.id, user.id)
      return reply.status(201).send(order)
    } catch (err: any) {
      throw fastify.httpErrors.badRequest(err.message)
    }
  })
}

export default checkoutRoutes
