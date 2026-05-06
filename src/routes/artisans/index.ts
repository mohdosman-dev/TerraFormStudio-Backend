import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { artisanService } from "../../services/artisan.service.ts";
import {
  ArtisanSchema,
  CreateArtisanSchema,
  UpdateArtisanSchema,
} from "../../schemas/artisan.schema.ts";

const artisanRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  // Public routes
  fastify.get(
    "/",
    {
      schema: {
        tags: ["Artisans"],
        summary: "List all published artisans",
        response: {
          200: z.array(ArtisanSchema),
        },
      },
    },
    async () => {
      const artisans = await artisanService.listPublished();
      return artisans as any;
    },
  );

  fastify.get(
    "/:slug",
    {
      schema: {
        tags: ["Artisans"],
        summary: "Get artisan details by slug",
        params: z.object({ slug: z.string() }),
        response: {
          200: ArtisanSchema,
        },
      },
    },
    async (request) => {
      const artisan = await artisanService.findBySlug(request.params.slug);
      if (!artisan) throw fastify.httpErrors.notFound("Artisan not found");
      return artisan as any;
    },
  );

  // Protected routes
  fastify.post(
    "/apply",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Artisans"],
        summary: "Apply to become an artisan",
        security: [{ bearerAuth: [] }],
        body: CreateArtisanSchema,
        response: {
          201: ArtisanSchema,
        },
      },
    },
    async (request, reply) => {
      const user = request.user as any;
      const artisan = await artisanService.apply(user.id, request.body as any);
      return reply.status(201).send(artisan as any);
    },
  );

  fastify.patch(
    "/:id",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Artisans"],
        summary: "Update artisan profile",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string() }),
        body: UpdateArtisanSchema,
        response: {
          200: ArtisanSchema,
        },
      },
    },
    async (request) => {
      const user = request.user as any;
      const isAdmin = user.roles.includes("admin");
      const artisan = await artisanService.updateArtisan(
        request.params.id,
        user.id,
        request.body as any,
        isAdmin,
      );
      if (!artisan)
        throw fastify.httpErrors.notFound("Artisan not found or unauthorized");
      return artisan as any;
    },
  );

  fastify.post(
    "/:id/approve",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Artisans"],
        summary: "Approve an artisan application (Admin only)",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string() }),
        response: {
          200: ArtisanSchema,
        },
      },
    },
    async (request) => {
      const user = request.user as any;
      if (!user.roles.includes("admin")) {
        throw fastify.httpErrors.forbidden("Only admins can approve artisans");
      }
      const artisan = await artisanService.approve(request.params.id);
      if (!artisan) throw fastify.httpErrors.notFound("Artisan not found");
      return artisan as any;
    },
  );
};

export default artisanRoutes;
