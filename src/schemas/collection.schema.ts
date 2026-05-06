import { z } from "zod";
import { DateSchema, ImageSchema, MongoIdSchema } from "./common.schema.ts";

export const CollectionSchema = z.object({
  _id: MongoIdSchema.optional(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional().default(""),
  heroImage: ImageSchema.optional(),
  productIds: z.array(MongoIdSchema).optional(),
  status: z.enum(["draft", "published", "archived"]),
  sortOrder: z.number().int().default(0),
  createdAt: DateSchema.optional(),
  updatedAt: DateSchema.optional(),
  __v: z.number().optional(),
});

export const CreateCollectionSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  heroImage: ImageSchema.optional(),
  productIds: z.array(MongoIdSchema).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  sortOrder: z.number().int().optional(),
});

export const UpdateCollectionSchema = CreateCollectionSchema.partial();
