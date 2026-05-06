import { z } from "zod";
import { DateSchema, MediaSchema, MongoIdSchema, PriceSchema } from "./common.schema.ts";

export const ProductSchema = z.object({
  _id: MongoIdSchema.optional(),
  artisanId: MongoIdSchema,
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  descriptionShort: z.string().optional().default(""),
  descriptionLong: z.string().optional().default(""),
  price: PriceSchema,
  media: z.array(MediaSchema).optional(),
  specifications: z.object({
    material: z.string().optional(),
    technique: z.string().optional(),
    glaze: z.string().optional(),
    dimensions: z.object({
      widthCm: z.number().optional(),
      heightCm: z.number().optional(),
      weightGrams: z.number().optional(),
    }).optional(),
    care: z.string().optional(),
  }).optional(),
  inventory: z.object({
    mode: z.enum(["unique", "regular"]),
    quantityAvailable: z.number().default(0),
    status: z.enum(["available", "sold", "unavailable", "made_to_order"]),
  }),
  discovery: z.object({
    collectionIds: z.array(MongoIdSchema).optional(),
    tags: z.array(z.string()).optional(),
    relatedProductIds: z.array(MongoIdSchema).optional(),
  }).optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  status: z.enum(["draft", "published", "archived"]),
  publishedAt: DateSchema.optional(),
  createdAt: DateSchema.optional(),
  updatedAt: DateSchema.optional(),
  __v: z.number().optional(),
});

export const CreateProductSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  descriptionShort: z.string().optional(),
  descriptionLong: z.string().optional(),
  price: PriceSchema,
  media: z.array(MediaSchema).optional(),
  specifications: z.object({
    material: z.string().optional(),
    technique: z.string().optional(),
    glaze: z.string().optional(),
    dimensions: z.object({
      widthCm: z.number().optional(),
      heightCm: z.number().optional(),
      weightGrams: z.number().optional(),
    }).optional(),
    care: z.string().optional(),
  }).optional(),
  inventory: z.object({
    mode: z.enum(["unique", "regular"]),
    quantityAvailable: z.number().optional(),
  }).optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  status: z.enum(["draft", "published", "archived"]).optional(),
});
