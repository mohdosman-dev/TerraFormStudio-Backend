import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { collectionService } from "../../services/collection.service.ts";
import {
  CollectionSchema,
  CreateCollectionSchema,
  UpdateCollectionSchema,
} from "../../schemas/collection.schema.ts";

const collectionRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  // Public routes
  fastify.get(
    "/",
    {
      schema: {
        tags: ["Collections"],
        summary: "List all published collections",
        response: {
          200: z.array(CollectionSchema),
        },
      },
    },
    async () => {
      const collections = await collectionService.listPublished();
      return collections as any;
    },
  );

  fastify.get(
    "/:slug",
    {
      schema: {
        tags: ["Collections"],
        summary: "Get collection details by slug",
        params: z.object({ slug: z.string() }),
        response: {
          200: CollectionSchema,
        },
      },
    },
    async (request) => {
      const collection = await collectionService.findBySlug(
        request.params.slug,
      );
      if (!collection) throw fastify.httpErrors.notFound("Collection not found");
      return collection as any;
    },
  );

  // Protected Admin routes
  fastify.post(
    "/",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Collections"],
        summary: "Create a new collection (Admin only)",
        security: [{ bearerAuth: [] }],
        body: CreateCollectionSchema,
        response: {
          201: CollectionSchema,
        },
      },
    },
    async (request, reply) => {
      const user = request.user as any;
      if (!user.roles.includes("admin")) {
        throw fastify.httpErrors.forbidden("Only admins can create collections");
      }
      const collection = await collectionService.create(request.body as any);
      return reply.status(201).send(collection as any);
    },
  );

  fastify.patch(
    "/:id",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Collections"],
        summary: "Update a collection (Admin only)",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string() }),
        body: UpdateCollectionSchema,
        response: {
          200: CollectionSchema,
        },
      },
    },
    async (request) => {
      const user = request.user as any;
      if (!user.roles.includes("admin")) {
        throw fastify.httpErrors.forbidden("Only admins can update collections");
      }
      const collection = await collectionService.update(
        request.params.id,
        request.body as any,
      );
      if (!collection) throw fastify.httpErrors.notFound("Collection not found");
      return collection as any;
    },
  );
};

export default collectionRoutes;
