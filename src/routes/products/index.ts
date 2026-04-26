import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { productService } from '../../services/product.service.ts'
import { Artisan } from '../../models/Artisan.ts'

const productRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  // Public routes
  fastify.get('/', {
    schema: {
      querystring: z.object({
        material: z.string().optional(),
        technique: z.string().optional()
      }),
      response: {
        200: z.array(z.any())
      }
    }
  }, async (request) => {
    return productService.listPublished(request.query)
  })

  fastify.get('/:slug', {
    schema: {
      params: z.object({ slug: z.string() }),
      response: {
        200: z.any()
      }
    }
  }, async (request) => {
    const product = await productService.findBySlug(request.params.slug)
    if (!product) throw fastify.httpErrors.notFound('Product not found')
    return product
  })

  // Protected routes
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        price: z.object({
          amount: z.number()
        }),
        inventory: z.object({
          mode: z.enum(['unique', 'regular']),
          quantityAvailable: z.number().optional()
        }).optional()
      }),
      response: {
        201: z.any()
      }
    }
  }, async (request, reply) => {
    const user = request.user as any
    // Find the artisan profile for this user
    const artisan = await Artisan.findOne({ userId: user.id })
    if (!artisan) throw fastify.httpErrors.forbidden('User does not have an artisan profile')
    
    const product = await productService.create(artisan._id as string, request.body)
    return reply.status(201).send(product)
  })

  fastify.patch('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: z.object({ id: z.string() }),
      body: z.any(),
      response: {
        200: z.any()
      }
    }
  }, async (request) => {
    const user = request.user as any
    const isAdmin = user.roles.includes('admin')
    const artisan = await Artisan.findOne({ userId: user.id })
    
    const product = await productService.update(
      request.params.id, 
      artisan?._id as string || '', 
      request.body, 
      isAdmin
    )
    
    if (!product) throw fastify.httpErrors.notFound('Product not found or unauthorized')
    return product
  })

  fastify.delete('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: z.object({ id: z.string() }),
      response: {
        200: z.object({ success: z.boolean() })
      }
    }
  }, async (request) => {
    const user = request.user as any
    const isAdmin = user.roles.includes('admin')
    const artisan = await Artisan.findOne({ userId: user.id })
    
    const success = await productService.softDelete(
      request.params.id, 
      artisan?._id as string || '', 
      isAdmin
    )
    
    if (!success) throw fastify.httpErrors.notFound('Product not found or unauthorized')
    return { success: true }
  })
}

export default productRoutes
