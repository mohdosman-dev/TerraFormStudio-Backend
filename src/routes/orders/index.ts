import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { orderService } from "../../services/order.service.ts";
import { OrderSchema } from "../../schemas/order.schema.ts";

const orderRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  fastify.get(
    "/",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Orders"],
        summary: "List current user orders",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.array(OrderSchema),
        },
      },
    },
    async (request) => {
      const user = request.user as any;
      const orders = await orderService.listUserOrders(user.id);
      return orders as any;
    },
  );

  fastify.get(
    "/:id",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Orders"],
        summary: "Get order details by id",
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string() }),
        response: {
          200: OrderSchema,
        },
      },
    },
    async (request) => {
      const user = request.user as any;
      const order = await orderService.getOrderDetails(
        request.params.id,
        user.id,
      );
      if (!order) throw fastify.httpErrors.notFound("Order not found");
      return order as any;
    },
  );
};

export default orderRoutes;
