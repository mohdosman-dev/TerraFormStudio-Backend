import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { cartService } from "../../services/cart.service.ts";
import {
  AddToCartSchema,
  CartSchema,
} from "../../schemas/cart.schema.ts";

const cartRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  fastify.get(
    "/",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Cart"],
        summary: "Get current user cart",
        security: [{ bearerAuth: [] }],
        response: {
          200: CartSchema,
        },
      },
    },
    async (request) => {
      const user = request.user as any;
      const cart = await cartService.getOrCreateCart(user.id);
      return cart as any;
    },
  );

  fastify.post(
    "/items",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Cart"],
        summary: "Add an item to the cart",
        security: [{ bearerAuth: [] }],
        body: AddToCartSchema,
        response: {
          200: CartSchema,
        },
      },
    },
    async (request) => {
      const user = request.user as any;
      const { productId, quantity } = request.body;
      try {
        const cart = await cartService.addItem(user.id, productId, quantity);
        return cart as any;
      } catch (err: any) {
        throw fastify.httpErrors.badRequest(err.message);
      }
    },
  );

  fastify.delete(
    "/items/:productId",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Cart"],
        summary: "Remove an item from the cart",
        security: [{ bearerAuth: [] }],
        params: z.object({ productId: z.string() }),
        response: {
          200: CartSchema,
        },
      },
    },
    async (request) => {
      const user = request.user as any;
      const cart = await cartService.removeItem(
        user.id,
        request.params.productId,
      );
      if (!cart) throw fastify.httpErrors.notFound("Cart not found");
      return cart as any;
    },
  );
};

export default cartRoutes;
