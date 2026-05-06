import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { productService } from "../../services/product.service.ts";
import { Artisan } from "../../models/Artisan.ts";
import {
  CreateProductSchema,
  ProductSchema,
  UpdateProductSchema,
} from "../../schemas/product.schema.ts";

const productRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  // Public routes
  fastify.get(
    "/",
    {
      schema: {
        tags: ["Products"],
        summary: "List all published products",
        querystring: z.object({
          material: z.string().optional(),
          technique: z.string().optional(),
        }),
        response: {
          200: z.array(ProductSchema),
        },
      },
    },
    async (request) => {
      const products = await productService.listPublished(request.query);
      return products as any;
    },
  );

  fastify.get(
    "/:slug",
    {
      schema: {
        tags: ["Products"],
        summary: "Get product details by slug",
        params: z.object({ slug: z.string() }),
        response: {
          200: ProductSchema,
        },
      },
    },
    async (request) => {
      const product = await productService.findBySlug(request.params.slug);
      fastify.log.info(
        `Product slug: ${request.params.slug}, found: ${product}`,
      );
      if (!product) throw fastify.httpErrors.notFound("Product not found");
      return product as any;
    },
  );

  // Protected routes
  fastify.post(
    "/",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Products"],
        summary: "Create a new product (Artisan only)",
        security: [{ bearerAuth: [] }],
        body: CreateProductSchema,
        response: {
          201: ProductSchema,
        },
      },
    },
    async (request, reply) => {
      const user = request.user as any;
      // Find the artisan profile for this user
      const artisan = await Artisan.findOne({ userId: user.id });
      if (!artisan)
        throw fastify.httpErrors.forbidden(
          "User does not have an artisan profile",
        );

      const product = await productService.create(
        (artisan._id as any).toString(),
        request.body as any,
      );
      return reply.status(201).send(product as any);
    },
  );

  fastify.patch(
    "/:id",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Products"],
        summary: "Update a product",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string() }),
        body: UpdateProductSchema,
        response: {
          200: ProductSchema,
        },
      },
    },
    async (request) => {
      const user = request.user as any;
      const isAdmin = user.roles.includes("admin");
      const artisan = await Artisan.findOne({ userId: user.id });

      const product = await productService.update(
        request.params.id,
        artisan?._id ? (artisan._id as any).toString() : "",
        request.body as any,
        isAdmin,
      );

      if (!product)
        throw fastify.httpErrors.notFound("Product not found or unauthorized");
      return product as any;
    },
  );

  fastify.delete(
    "/:id",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Products"],
        summary: "Soft delete (archive) a product",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string() }),
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request) => {
      const user = request.user as any;
      const isAdmin = user.roles.includes("admin");
      const artisan = await Artisan.findOne({ userId: user.id });

      const success = await productService.softDelete(
        request.params.id,
        artisan?._id ? (artisan._id as any).toString() : "",
        isAdmin,
      );

      if (!success)
        throw fastify.httpErrors.notFound("Product not found or unauthorized");
      return { success: true };
    },
  );
};

export default productRoutes;
