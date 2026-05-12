import { z } from "zod";
import { DateSchema, ImageSchema, MongoIdSchema } from "./common.schema.ts";

export const HomeSectionItemSchema = z.object({
  type: z.enum([
    "hero",
    "artisan_spotlight",
    "product_row",
    "collection_row",
    "editorial",
  ]),
  title: z.string().nullable().optional().default(""),
  subtitle: z.string().nullable().optional().default(""),
  image: ImageSchema.nullable().optional(),
  cta: z
    .object({
      label: z.string().nullable().optional().default(""),
      targetType: z
        .enum(["collection", "product", "artisan", "url"])
        .nullable()
        .optional(),
      targetId: MongoIdSchema,
      url: z.string().nullable().optional().default(""),
    })
    .nullable()
    .optional(),
  artisanId: z.any().nullable().optional(),
  productIds: z.array(z.any()).nullable().optional().default([]),
  collectionIds: z.array(z.any()).nullable().optional().default([]),
  content: z.string().nullable().optional().default(""),
  sortOrder: z.number().int().default(0),
  _id: MongoIdSchema,
});

export const HomeSectionSchema = z.object({
  _id: MongoIdSchema.optional(),
  name: z.string(),
  status: z.enum(["published", "draft", "archived"]),
  sections: z.array(HomeSectionItemSchema),
  createdAt: DateSchema.optional(),
  updatedAt: DateSchema.optional(),
  __v: z.number().optional(),
});

export const CreateHomeSectionSchema = z.object({
  name: z.string(),
  status: z.enum(["published", "draft", "archived"]).optional(),
  sections: z.array(
    HomeSectionItemSchema.omit({ sortOrder: true }).extend({
      sortOrder: z.number().int().optional(),
    }),
  ),
});
