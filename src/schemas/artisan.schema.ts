import { z } from "zod";
import { DateSchema, ImageSchema, MongoIdSchema } from "./common.schema.ts";

export const ArtisanSchema = z.object({
  _id: MongoIdSchema.optional(),
  userId: MongoIdSchema,
  slug: z.string(),
  displayName: z.string(),
  brandName: z.string(),
  bioShort: z.string().optional(),
  bioLong: z.string().optional(),
  studioStory: z.object({
    philosophy: z.string().optional(),
    materials: z.array(z.string()).optional(),
    techniques: z.array(z.string()).optional(),
  }).optional(),
  heroImage: ImageSchema.optional(),
  gallery: z.array(ImageSchema).optional(),
  location: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  socialLinks: z.object({
    instagram: z.string().optional(),
  }).optional(),
  isSpotlight: z.boolean().default(false),
  status: z.enum(["pending", "published", "archived"]),
  createdAt: DateSchema.optional(),
  updatedAt: DateSchema.optional(),
  __v: z.number().optional(),
});

export const CreateArtisanSchema = z.object({
  displayName: z.string(),
  brandName: z.string(),
  bioShort: z.string().optional(),
  bioLong: z.string().optional(),
  studioStory: z.object({
    philosophy: z.string().optional(),
    materials: z.array(z.string()).optional(),
    techniques: z.array(z.string()).optional(),
  }).optional(),
  heroImage: ImageSchema.optional(),
  gallery: z.array(ImageSchema).optional(),
  location: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  socialLinks: z.object({
    instagram: z.string().optional(),
  }).optional(),
});

export const UpdateArtisanSchema = CreateArtisanSchema.partial().extend({
  status: z.enum(["pending", "published", "archived"]).optional(),
  isSpotlight: z.boolean().optional(),
});
