import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { collectionService } from '../../services/collection.service.ts'

const collectionRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  // Public routes
  fastify.get('/', {
    schema: {
      tags: ['Collections'],
      summary: 'List all published collections',
      response: {
        200: z.array(z.any())
      }
    }
  }, async () => {
    return collectionService.listPublished()
  })

  fastify.get('/:slug', {
    schema: {
      tags: ['Collections'],
      summary: 'Get collection details by slug',
      params: z.object({ slug: z.string() }),
      response: {
        200: z.any()
      }
    }
  }, async (request) => {
    const collection = await collectionService.findBySlug(request.params.slug)
    if (!collection) throw fastify.httpErrors.notFound('Collection not found')
    return collection
  })

  // Protected Admin routes
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Collections'],
      summary: 'Create a new collection (Admin only)',
      security: [{ bearerAuth: [] }],
      body: z.object({
        title: z.string(),
        description: z.string().optional(),
        heroImage: z.object({
          url: z.string(),
          alt: z.string()
        }).optional(),
        sortOrder: z.number().optional()
      }),
      response: {
        201: z.any()
      }
    }
  }, async (request, reply) => {
    const user = request.user as any
    if (!user.roles.includes('admin')) {
      throw fastify.httpErrors.forbidden('Only admins can create collections')
    }
    const collection = await collectionService.create(request.body)
    return reply.status(201).send(collection)
  })

  fastify.patch('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Collections'],
      summary: 'Update a collection (Admin only)',
      security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string() }),
      body: z.any(),
      response: {
        200: z.any()
      }
    }
  }, async (request) => {
    const user = request.user as any
    if (!user.roles.includes('admin')) {
      throw fastify.httpErrors.forbidden('Only admins can update collections')
    }
    const collection = await collectionService.update(request.params.id, request.body)
    if (!collection) throw fastify.httpErrors.notFound('Collection not found')
    return collection
  })
}

export default collectionRoutes
