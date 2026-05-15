import fp from 'fastify-plugin'
import { v4 as uuidv4 } from 'uuid'

export default fp(async (fastify) => {
  fastify.addHook('onRequest', async (request, reply) => {
    const headerToken = request.headers['x-guest-token'] as string | undefined
    let guestId = request.cookies.guestId || headerToken

    if (!guestId) {
      guestId = uuidv4()
      reply.setCookie('guestId', guestId, {
        path: '/',
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 // 30 days
      })
    }

    request.guestId = guestId
  })
})

declare module 'fastify' {
  export interface FastifyRequest {
    guestId: string
  }
}
