import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkoutService } from "../../services/checkout.service.ts";
import { orderService } from "../../services/order.service.ts";
import {
  CheckoutSessionSchema,
  SetShippingSchema,
} from "../../schemas/checkout.schema.ts";
import { OrderSchema } from "../../schemas/order.schema.ts";

const checkoutRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  fastify.post(
    "/start",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Checkout"],
        summary: "Start checkout from cart",
        security: [{ bearerAuth: [] }],
        response: {
          201: CheckoutSessionSchema,
        },
      },
    },
    async (request, reply) => {
      const user = request.user as any;
      const session = await checkoutService.initCheckout(user.id);
      return reply.status(201).send(session as any);
    },
  );

  fastify.post(
    "/shipping",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Checkout"],
        summary: "Set shipping details",
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          sessionId: z.string(),
        }),
        body: SetShippingSchema,
        response: {
          200: CheckoutSessionSchema,
        },
      },
    },
    async (request) => {
      const user = request.user as any;
      const session = await checkoutService.updateShipping(
        request.query.sessionId,
        user.id,
        request.body,
      );
      if (!session)
        throw fastify.httpErrors.notFound("Session not found or unauthorized");
      return session as any;
    },
  );

  fastify.post(
    "/complete",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Checkout"],
        summary: "Complete checkout (Mock payment)",
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          sessionId: z.string(),
        }),
        response: {
          201: OrderSchema,
        },
      },
    },
    async (request, reply) => {
      const user = request.user as any;
      // First process mock payment
      const session = await checkoutService.processMockPayment(
        request.query.sessionId,
        user.id,
      );
      if (!session)
        throw fastify.httpErrors.notFound("Session not found or unauthorized");

      // Then complete order
      const order = await orderService.completeCheckout(
        request.query.sessionId,
        user.id,
      );
      return reply.status(201).send(order as any);
    },
  );
};

export default checkoutRoutes;
