import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { discoveryService } from '../../services/discovery.service.ts'

const discoveryAdminRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  // All routes here require admin authentication (already applied in parent index.ts)
  
  fastify.get('/active', {
    schema: {
      response: {
        200: z.any()
      }
    }
  }, async () => {
    return discoveryService.getActiveHome()
  })

  fastify.patch('/:id', {
    schema: {
      params: z.object({
        id: z.string()
      }),
      body: z.object({
        name: z.string().optional(),
        status: z.enum(['published', 'draft', 'archived']).optional(),
        sections: z.array(z.any()).optional()
      }),
      response: {
        200: z.any()
      }
    }
  }, async (request) => {
    const { id } = request.params as any
    return discoveryService.updateHomeConfiguration(id, request.body)
  })
}

export default discoveryAdminRoutes
