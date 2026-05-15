import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { cartService } from "../../services/cart.service.ts";
import {
  AddToCartSchema,
  CartSchema,
  MergeCartSchema,
  UpdateCartItemSchema,
} from "../../schemas/cart.schema.ts";

/**
 * Resolve a cart identifier from the request for either an authenticated user or a guest.
 *
 * @param request - Incoming request object which may contain `user.id` (authenticated) or `guestId` (guest)
 * @returns An object containing `userId` when the request carries an authenticated user, or `guestId` when a guest identifier is present
 * @throws Error when neither `user.id` nor `guestId` is available on the request
 */
function getIdentifier(request: any): { userId?: string; guestId?: string } {
  const user = request.user as any;
  if (user?.id) return { userId: user.id };
  if (request.guestId) return { guestId: request.guestId };
  throw new Error("Authentication required");
}

const cartRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  // Optional-auth preHandler for cart endpoints
  fastify.addHook("onRequest", async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        await request.jwtVerify();
      } catch {
        // token invalid — continue as guest
      }
    }
  });

  fastify.get(
    "/",
    {
      schema: {
        tags: ["Cart"],
        summary: "Get current cart (auth or guest)",
        security: [{ bearerAuth: [] }],
        response: { 200: CartSchema },
      },
    },
    async (request) => {
      const identifier = getIdentifier(request);
      const cart = await cartService.getOrCreateCart(identifier);
      fastify.log.info(
        `Cart retrieved for ${identifier.userId ? "user " + identifier.userId : "guest " + identifier.guestId}`,
      );
      fastify.log.info(`Cart is ${JSON.stringify(cart)}`);
      return cart as any;
    },
  );

  fastify.post(
    "/items",
    {
      schema: {
        tags: ["Cart"],
        summary: "Add an item to the cart",
        security: [{ bearerAuth: [] }],
        body: AddToCartSchema,
        response: { 200: CartSchema },
      },
    },
    async (request) => {
      const identifier = getIdentifier(request);
      const { productId, quantity } = request.body;
      try {
        const cart = await cartService.addItem(identifier, productId, quantity);
        return cart as any;
      } catch (err: any) {
        throw fastify.httpErrors.badRequest(err.message);
      }
    },
  );

  fastify.patch(
    "/items/:productId",
    {
      schema: {
        tags: ["Cart"],
        summary: "Update item quantity",
        security: [{ bearerAuth: [] }],
        params: z.object({ productId: z.string() }),
        body: UpdateCartItemSchema,
        response: { 200: CartSchema },
      },
    },
    async (request) => {
      const identifier = getIdentifier(request);
      const cart = await cartService.updateItemQuantity(
        identifier,
        request.params.productId,
        request.body.quantity,
      );
      if (!cart) throw fastify.httpErrors.notFound("Cart not found");
      return cart as any;
    },
  );

  fastify.delete(
    "/items/:productId",
    {
      schema: {
        tags: ["Cart"],
        summary: "Remove an item from the cart",
        security: [{ bearerAuth: [] }],
        params: z.object({ productId: z.string() }),
        response: { 200: CartSchema },
      },
    },
    async (request) => {
      const identifier = getIdentifier(request);
      const cart = await cartService.removeItem(
        identifier,
        request.params.productId,
      );
      if (!cart) throw fastify.httpErrors.notFound("Cart not found");
      return cart as any;
    },
  );

  fastify.post(
    "/merge",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Cart"],
        summary: "Merge guest cart into user cart on login",
        security: [{ bearerAuth: [] }],
        body: MergeCartSchema,
        response: { 200: CartSchema },
      },
    },
    async (request) => {
      const user = request.user as any;
      const { guestId } = request.body;
      const cart = await cartService.mergeGuestCart(guestId, user.id);
      return cart as any;
    },
  );
};

export default cartRoutes;
