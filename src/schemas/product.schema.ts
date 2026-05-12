import { z } from "zod";
import { DateSchema, MediaSchema, MongoIdSchema, PriceSchema } from "./common.schema.ts";
import { ArtisanSchema } from "./artisan.schema.ts";

export const RelatedProductSchema = z.object({
  _id: MongoIdSchema,
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  price: PriceSchema,
  media: z.array(MediaSchema).optional(),
});

const DiscoverySchema = z.object({
  collectionIds: z.array(MongoIdSchema).optional(),
  tags: z.array(z.string()).optional(),
  relatedProductIds: z.array(MongoIdSchema).optional(),
}).optional();

const DiscoveryDetailSchema = z.object({
  collectionIds: z.array(MongoIdSchema).optional(),
  tags: z.array(z.string()).optional(),
  relatedProductIds: z.array(RelatedProductSchema).optional(),
}).optional();

const ProductFields = {
  _id: MongoIdSchema.optional(),
  artisanId: ArtisanSchema.optional(),
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
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  status: z.enum(["draft", "published", "archived"]),
  publishedAt: DateSchema.optional(),
  createdAt: DateSchema.optional(),
  updatedAt: DateSchema.optional(),
  __v: z.number().optional(),
} as const;

export const ProductSchema = z.object({
  ...ProductFields,
  discovery: DiscoverySchema,
});

export const ProductDetailResponseSchema = z.object({
  ...ProductFields,
  discovery: DiscoveryDetailSchema,
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
