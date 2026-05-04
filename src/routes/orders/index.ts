import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { orderService } from '../../services/order.service.ts'

const orderRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  fastify.addHook('onRequest', fastify.authenticate)

  fastify.get('/', {
    schema: {
      tags: ['Orders'],
      summary: 'List current user orders',
      security: [{ bearerAuth: [] }],
      response: {
        200: z.array(z.any())
      }
    }
  }, async (request) => {
    const user = request.user as any
    return orderService.listUserOrders(user.id)
  })

  fastify.get('/:id', {
    schema: {
      tags: ['Orders'],
      summary: 'Get order details',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      response: {
        200: z.any()
      }
    }
  }, async (request) => {
    const user = request.user as any
    const order = await orderService.getOrderDetails(request.params.id, user.id)
    if (!order) throw fastify.httpErrors.notFound('Order not found')
    return order
  })
}

export default orderRoutes
