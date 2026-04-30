import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { adminService } from '../../services/admin.service.ts'
import settingsRoutes from './settings.ts'
import discoveryAdminRoutes from './discovery.ts'

const adminRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  // All routes here require admin authentication
  fastify.addHook('onRequest', fastify.authenticate)
  fastify.addHook('onRequest', async (request) => {
    const user = request.user as any
    if (!user.roles.includes('admin')) {
      throw fastify.httpErrors.forbidden('Access denied. Admins only.')
    }
  })

  fastify.register(settingsRoutes, { prefix: '/settings' })
  fastify.register(discoveryAdminRoutes, { prefix: '/discovery' })

  fastify.get('/dashboard/overview', {
    schema: {
      querystring: z.object({
        range: z.enum(['6months', '1year']).default('6months')
      }),
      response: {
        200: z.any()
      }
    }
  }, async (request) => {
    return adminService.getDashboardOverview(request.query.range as '6months' | '1year')
  })
}

export default adminRoutes
