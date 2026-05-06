import { z } from "zod";
import mongoose from "mongoose";

export const MongoIdSchema = z.union([
  z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  z.instanceof(mongoose.Types.ObjectId).transform((id) => id.toString()),
  z.object({ _id: z.any() }).transform((obj: any) => obj._id.toString()),
  z
    .any()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid ObjectId")
    .transform((val) => val.toString()),
]);

export const DateSchema = z.union([
  z.iso.datetime(),
  z.instanceof(Date).transform((d) => d.toISOString()),
]);

export const ImageSchema = z.object({
  url: z.string(),
  alt: z.string().optional().default(""),
});

export const MediaSchema = z.object({
  url: z.string(),
  alt: z.string().optional().default(""),
  type: z.enum(["image", "video"]).default("image"),
  sortOrder: z.number().int().default(0),
});

export const PriceSchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.string().default("AED"),
});
