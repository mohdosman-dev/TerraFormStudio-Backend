import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { artisanService } from "../../services/artisan.service.ts";
import {
  ArtisanSchema,
  CreateArtisanSchema,
  UpdateArtisanSchema,
} from "../../schemas/artisan.schema.ts";
import { ProductSchema } from "../../schemas/product.schema.ts";

const ArtisanProfileResponseSchema = ArtisanSchema.extend({
  products: z.array(ProductSchema),
});

const artisanRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  const PaginatedArtisansSchema = z.object({
    data: z.array(ArtisanSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  });

  // Public routes
  fastify.get(
    "/",
    {
      schema: {
        tags: ["Artisans"],
        summary: "List all published artisans (paginated)",
        querystring: z.object({
          page: z.coerce.number().int().positive().default(1),
          limit: z.coerce.number().int().positive().max(50).default(10),
        }),
        response: {
          200: PaginatedArtisansSchema,
        },
      },
    },
    async (request) => {
      const { page, limit } = request.query;
      return await artisanService.listPublished(page, limit) as any;
    },
  );

  fastify.get(
    "/:slug",
    {
      schema: {
        tags: ["Artisans"],
        summary: "Get artisan details by slug with available works",
        params: z.object({ slug: z.string() }),
        response: {
          200: ArtisanProfileResponseSchema,
        },
      },
    },
    async (request) => {
      const { artisan, products } = await artisanService.findBySlugWithProducts(
        request.params.slug,
      );
      fastify.log.info(
        `Artisan slug: ${request.params.slug}, found: ${artisan}, products count: ${products.length}`,
      );
      if (!artisan) throw fastify.httpErrors.notFound("Artisan not found");
      return { ...artisan.toObject(), products } as any;
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
