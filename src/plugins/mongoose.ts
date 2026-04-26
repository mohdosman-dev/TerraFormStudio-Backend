import fp from 'fastify-plugin'
import mongoose from 'mongoose'
import 'dotenv/config'

export interface MongoosePluginOptions {
  uri?: string
}

export default fp<MongoosePluginOptions>(async (fastify, opts) => {
  const uri = opts.uri || process.env.MONGODB_URI

  if (!uri) {
    fastify.log.error('MONGODB_URI is not defined')
    throw new Error('MONGODB_URI is not defined')
  }

  try {
    const connection = await mongoose.connect(uri)
    fastify.decorate('mongoose', connection)
    
    fastify.log.info('MongoDB connected successfully')

    fastify.addHook('onClose', async () => {
      await mongoose.connection.close()
      fastify.log.info('MongoDB connection closed')
    })
  } catch (err) {
    fastify.log.error('MongoDB connection error:', err)
    throw err
  }
})

declare module 'fastify' {
  export interface FastifyInstance {
    mongoose: typeof mongoose
  }
}
