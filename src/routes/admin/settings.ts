import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { settingsService } from '../../services/settings.service.ts'

const settingsRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  fastify.get('/', {
    schema: {
      tags: ['Admin'],
      summary: 'Get system settings',
      security: [{ bearerAuth: [] }],
      response: {
        200: z.any()
      }
    }
  }, async () => {
    return settingsService.getSettings()
  })

  fastify.patch('/', {
    schema: {
      tags: ['Admin'],
      summary: 'Update system settings',
      security: [{ bearerAuth: [] }],
      body: z.object({
        general: z.object({
          defaultCurrency: z.enum(['USD', 'EUR', 'GBP'])
        }).optional(),
        payments: z.object({
          stripe: z.object({
            isActive: z.boolean(),
            connectedAccount: z.string()
          }).optional(),
          paypal: z.object({
            isActive: z.boolean(),
            email: z.string().optional()
          }).optional(),
          applePay: z.object({
            isActive: z.boolean(),
            isVerified: z.boolean()
          }).optional()
        }).optional(),
        legal: z.object({
          termsAndConditions: z.object({
            content: z.string()
          }).optional(),
          privacyPolicy: z.object({
            content: z.string()
          }).optional()
        }).optional(),
        communication: z.object({
          emailTemplates: z.object({
            orderConfirmation: z.object({
              subject: z.string(),
              body: z.string()
            }).optional(),
            shippingUpdate: z.object({
              subject: z.string(),
              body: z.string()
            }).optional(),
            welcomeEmail: z.object({
              subject: z.string(),
              body: z.string()
            }).optional()
          }).optional()
        }).optional()
      }),
      response: {
        200: z.any()
      }
    }
  }, async (request) => {
    return settingsService.updateSettings(request.body)
  })
}

export default settingsRoutes
