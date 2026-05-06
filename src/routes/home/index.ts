import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { discoveryService } from "../../services/discovery.service.ts";
import {
  CreateHomeSectionSchema,
  HomeSectionSchema,
} from "../../schemas/home.schema.ts";

const homeRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  // Public route to get published homepage content
  fastify.get(
    "/",
    {
      schema: {
        tags: ["Home"],
        summary: "Get published homepage configuration",
        response: {
          200: HomeSectionSchema,
        },
      },
    },
    async () => {
      const home = await discoveryService.getActiveHome();
      if (!home) throw fastify.httpErrors.notFound("No published homepage found");
      return home as any;
    },
  );

  // Admin route to create or update homepage config
  fastify.post(
    "/",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Home"],
        summary: "Create or update homepage configuration (Admin only)",
        security: [{ bearerAuth: [] }],
        body: CreateHomeSectionSchema,
        response: {
          201: HomeSectionSchema,
        },
      },
    },
    async (request, reply) => {
      const user = request.user as any;
      if (!user.roles.includes("admin")) {
        throw fastify.httpErrors.forbidden("Only admins can manage home layout");
      }

      const home = await discoveryService.createHomeConfiguration(request.body as any);
      return reply.status(201).send(home as any);
    },
  );
};

export default homeRoutes;
