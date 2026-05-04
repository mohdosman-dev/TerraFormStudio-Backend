import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { discoveryService } from '../../services/discovery.service.ts'

const discoveryRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  fastify.get('/', {
    schema: {
      tags: ['Discovery'],
      summary: 'Get active homepage configuration',
      response: {
        200: z.any()
      }
    }
  }, async () => {
    const config = await discoveryService.getActiveHome()
    if (!config) throw fastify.httpErrors.notFound('Active homepage configuration not found')
    return config
  })

  // Admin routes
  fastify.post('/sections', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Discovery'],
      summary: 'Create a new homepage configuration (Admin only)',
      security: [{ bearerAuth: [] }],
      body: z.object({
        name: z.string(),
        status: z.enum(['published', 'draft', 'archived']),
        sections: z.array(z.any())
      }),
      response: {
        201: z.any()
      }
    }
  }, async (request, reply) => {
    const user = request.user as any
    if (!user.roles.includes('admin')) throw fastify.httpErrors.forbidden()
    
    const config = await discoveryService.createHomeConfiguration(request.body)
    return reply.status(201).send(config)
  })
}

export default discoveryRoutes
