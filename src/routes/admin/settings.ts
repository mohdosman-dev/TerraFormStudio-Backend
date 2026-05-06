import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { settingsService } from "../../services/settings.service.ts";
import { SystemSettingSchema } from "../../schemas/system.schema.ts";

const settingsRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  fastify.get(
    "/",
    {
      schema: {
        tags: ["Admin"],
        summary: "Get system settings",
        security: [{ bearerAuth: [] }],
        response: {
          200: SystemSettingSchema,
        },
      },
    },
    async () => {
      const settings = await settingsService.getSettings();
      fastify.log.info("Fetched system settings: " + JSON.stringify(settings));
      return settings as any;
    },
  );

  fastify.patch(
    "/",
    {
      schema: {
        tags: ["Admin"],
        summary: "Update system settings",
        security: [{ bearerAuth: [] }],
        body: SystemSettingSchema.partial(),
        response: {
          200: SystemSettingSchema,
        },
      },
    },
    async (request) => {
      const settings = await settingsService.updateSettings(
        request.body as any,
      );
      return settings as any;
    },
  );
};

export default settingsRoutes;
