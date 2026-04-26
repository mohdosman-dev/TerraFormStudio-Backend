import * as path from 'node:path'
import { afterAll, beforeAll } from 'vitest'
import fastify from 'fastify'
import fp from 'fastify-plugin'
import App from '../src/app'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongod: MongoMemoryServer

async function build() {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()

  const app = fastify()
  
  // Register the app with testing options
  void app.register(fp(App), {
    uri // Pass the memory server URI to the mongoose plugin
  })

  return app
}

export { build }
