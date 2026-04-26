import fastify from 'fastify'
import fp from 'fastify-plugin'
import App from '../src/app.ts'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongod: MongoMemoryServer

async function build(t?: any) {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()

  const app = fastify()
  
  // Register the app with testing options
  void app.register(fp(App), {
    uri // Pass the memory server URI to the mongoose plugin
  })

  if (t && typeof t.after === 'function') {
    t.after(() => app.close())
  }

  return app
}

export { build }
