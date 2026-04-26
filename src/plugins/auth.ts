import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import 'dotenv/config'

export default fp(async (fastify) => {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'super-secret-key'
  })

  fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || 'cookie-secret',
    hook: 'onRequest'
  })

  fastify.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })
})

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: any
  }
}
