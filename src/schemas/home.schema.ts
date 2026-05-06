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
  title: z.string().optional().default(""),
  subtitle: z.string().optional().default(""),
  image: ImageSchema.optional(),
  cta: z.object({
    label: z.string().optional().default(""),
    targetType: z.enum(["collection", "product", "artisan", "url"]).optional(),
    targetId: MongoIdSchema.optional(),
    url: z.string().optional().default(""),
  }).optional(),
  artisanId: z.any().optional(), // Allow populated object or ID
  productIds: z.array(z.any()).optional(), // Allow populated objects or IDs
  collectionIds: z.array(z.any()).optional(), // Allow populated objects or IDs
  content: z.string().optional().default(""),
  sortOrder: z.number().int(),
  _id: MongoIdSchema.optional(),
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
  sections: z.array(HomeSectionItemSchema.omit({ sortOrder: true }).extend({
    sortOrder: z.number().int().optional(),
  })),
});
