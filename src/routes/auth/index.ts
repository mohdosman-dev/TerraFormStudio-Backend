import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authService } from '../../services/auth.service.ts'

const auth: FastifyPluginAsyncZod = async (fastify, _opts) => {
  fastify.post('/signup', {
    schema: {
      tags: ['Authentication'],
      summary: 'Register a new user',
      body: z.object({
        email: z.string().email(),
        password: z.string().min(8)
      }),
      response: {
        201: z.object({
          message: z.string(),
          user: z.object({
            id: z.string(),
            email: z.string()
          })
        })
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body
    
    const existingUser = await authService.findByEmail(email)
    if (existingUser) {
      throw fastify.httpErrors.conflict('User already exists')
    }

    const user = await authService.register(email, password)
    
    return reply.status(201).send({
      message: 'User created successfully',
      user: {
        id: user._id.toString(),
        email: user.email
      }
    })
  })

  fastify.post('/login', {
    schema: {
      tags: ['Authentication'],
      summary: 'Login with email and password',
      body: z.object({
        email: z.string().email(),
        password: z.string()
      }),
      response: {
        200: z.object({
          token: z.string(),
          user: z.object({
            id: z.string(),
            email: z.string(),
            roles: z.array(z.string())
          })
        })
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body
    
    const user = await authService.findByEmail(email)
    if (!user || !(await user.comparePassword(password))) {
      throw fastify.httpErrors.unauthorized('Invalid email or password')
    }

    const token = fastify.jwt.sign({
      id: user._id.toString(),
      email: user.email,
      roles: user.roles
    })

    return reply.send({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        roles: user.roles
      }
    })
  })

  fastify.get('/me', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Authentication'],
      summary: 'Get current user profile',
      security: [{ bearerAuth: [] }],
      response: {
        200: z.object({
          user: z.object({
            id: z.string(),
            email: z.string(),
            roles: z.array(z.string())
          })
        })
      }
    }
  }, async (request, _reply) => {
    const user = request.user as any
    return {
      user: {
        id: user.id || user._id.toString(),
        email: user.email,
        roles: user.roles
      }
    }
  })
}

export default auth
