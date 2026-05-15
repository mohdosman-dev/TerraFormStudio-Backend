import { describe, it, expect } from 'vitest'
import Fastify from 'fastify'
import Support from '../../src/plugins/support.ts'

describe('support works standalone', () => {
  it('should decorate fastify instance', async () => {
    const fastify = Fastify()
    void fastify.register(Support)
    await fastify.ready()
    expect(fastify.someSupport()).toBe('hugs')
  })
})
