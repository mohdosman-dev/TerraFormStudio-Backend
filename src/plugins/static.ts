import fp from "fastify-plugin";
import fastifyStatic from "@fastify/static";
import { join } from "node:path";

export default fp(async (fastify) => {
  fastify.register(fastifyStatic, {
    root: join(process.cwd(), "uploads"),
    prefix: "/uploads/", // URL prefix for static files
    decorateReply: false, // To avoid conflict with other plugins if any
  });
});
