import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { discoveryService } from "../../services/discovery.service.ts";
import {
  CreateHomeSectionSchema,
  HomeSectionSchema,
} from "../../schemas/home.schema.ts";

const discoveryAdminRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  // All routes here require admin authentication (already applied in parent index.ts)

  fastify.get(
    "/active",
    {
      schema: {
        tags: ["Admin"],
        summary: "Get active homepage configuration for editing",
        security: [{ bearerAuth: [] }],
        response: {
          200: HomeSectionSchema.nullable(),
        },
      },
    },
    async () => {
      const home = await discoveryService.getActiveHome();
      return (home as any) || null;
    },
  );

  fastify.patch(
    "/:id",
    {
      schema: {
        tags: ["Admin"],
        summary: "Update a homepage configuration",
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
        body: CreateHomeSectionSchema.partial(),
        response: {
          200: HomeSectionSchema,
        },
      },
    },
    async (request) => {
      const { id } = request.params as any;
      const home = await discoveryService.updateHomeConfiguration(id, request.body as any);
      if (!home) throw fastify.httpErrors.notFound("Configuration not found");
      return home as any;
    },
  );
};

export default discoveryAdminRoutes;
