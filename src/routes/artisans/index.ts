import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { artisanService } from '../../services/artisan.service.ts'

const artisanRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  // Public routes
  fastify.get('/', {
    schema: {
      tags: ['Artisans'],
      summary: 'List all published artisans',
      response: {
        200: z.array(z.any())
      }
    }
  }, async () => {
    return artisanService.listPublished()
  })

  fastify.get('/:slug', {
    schema: {
      tags: ['Artisans'],
      summary: 'Get artisan details by slug',
      params: z.object({ slug: z.string() }),
      response: {
        200: z.any()
      }
    }
  }, async (request) => {
    const artisan = await artisanService.findBySlug(request.params.slug)
    if (!artisan) throw fastify.httpErrors.notFound('Artisan not found')
    return artisan
  })

  // Protected routes
  fastify.post('/apply', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Artisans'],
      summary: 'Apply to become an artisan',
      security: [{ bearerAuth: [] }],
      body: z.object({
        displayName: z.string(),
        brandName: z.string(),
        bioShort: z.string().optional(),
        bioLong: z.string().optional(),
        heroImage: z.object({
          url: z.string(),
          alt: z.string()
        }).optional(),
        gallery: z.array(z.object({
          url: z.string(),
          alt: z.string()
        })).optional()
      }),
      response: {
        201: z.any()
      }
    }
  }, async (request, reply) => {
    const user = request.user as any
    const artisan = await artisanService.apply(user.id, request.body)
    return reply.status(201).send(artisan)
  })

  fastify.patch('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Artisans'],
      summary: 'Update artisan profile',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      body: z.any(),
      response: {
        200: z.any()
      }
    }
  }, async (request) => {
    const user = request.user as any
    const isAdmin = user.roles.includes('admin')
    const artisan = await artisanService.updateArtisan(request.params.id, user.id, request.body, isAdmin)
    if (!artisan) throw fastify.httpErrors.notFound('Artisan not found or unauthorized')
    return artisan
  })

  fastify.post('/:id/approve', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Artisans'],
      summary: 'Approve an artisan application (Admin only)',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      response: {
        200: z.any()
      }
    }
  }, async (request) => {
    const user = request.user as any
    if (!user.roles.includes('admin')) {
      throw fastify.httpErrors.forbidden('Only admins can approve artisans')
    }
    const artisan = await artisanService.approve(request.params.id)
    if (!artisan) throw fastify.httpErrors.notFound('Artisan not found')
    return artisan
  })
}

export default artisanRoutes
