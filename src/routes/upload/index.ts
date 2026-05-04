import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { uploadService, type UploadModel } from '../../services/upload.service.ts'

const uploadRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['System'],
      summary: 'Upload a file (Multipart or Base64)',
      security: [{ bearerAuth: [] }],
      querystring: z.object({
        model: z.enum(['artisan', 'product', 'collection', 'general']).default('general')
      }),
      response: {
        201: z.object({
          url: z.string()
        })
      }
    }
  }, async (request, reply) => {
    const model = request.query.model as UploadModel

    // Check if it's multipart
    const isMultipart = request.isMultipart()

    if (isMultipart) {
      const data = await request.file()
      if (!data) throw fastify.httpErrors.badRequest('No file uploaded')
      
      try {
        const url = await uploadService.uploadMultipart(data, model)
        return reply.status(201).send({ url })
      } catch (err: any) {
        throw fastify.httpErrors.badRequest(err.message)
      }
    } else {
      // Assume JSON with base64
      const body = request.body as any
      if (!body.base64 || !body.filename) {
        throw fastify.httpErrors.badRequest('Provide base64 and filename for non-multipart uploads')
      }

      try {
        const url = await uploadService.uploadBase64(body.base64, model, body.filename)
        return reply.status(201).send({ url })
      } catch (err: any) {
        throw fastify.httpErrors.badRequest(err.message)
      }
    }
  })
}

export default uploadRoutes
