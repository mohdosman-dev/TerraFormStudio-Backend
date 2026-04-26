import fp from 'fastify-plugin'
import fastifyStatic from '@fastify/static'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default fp(async (fastify) => {
  fastify.register(fastifyStatic, {
    root: join(__dirname, '../../uploads'),
    prefix: '/uploads/', // URL prefix for static files
    decorateReply: false // To avoid conflict with other plugins if any
  })
})
