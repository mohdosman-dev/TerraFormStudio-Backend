import { z } from "zod";
import { DateSchema, MongoIdSchema } from "./common.schema.ts";
import { RelatedProductSchema } from "./product.schema.ts";

// Internal / DB shape (productId as ObjectId)
export const CartItemSchema = z.object({
  productId: MongoIdSchema,
  quantity: z.number().int().positive().default(1),
  addedAt: DateSchema.optional(),
});

// Response shape (productId populated with full product)
export const PopulatedCartItemSchema = z.object({
  productId: RelatedProductSchema,
  quantity: z.number().int().positive().default(1),
  addedAt: DateSchema.optional(),
});

export const CartSchema = z.object({
  _id: MongoIdSchema.optional(),
  userId: MongoIdSchema.optional(),
  guestId: z.string().optional(),
  status: z.enum(["active", "completed", "abandoned"]),
  items: z.array(PopulatedCartItemSchema),
  totals: z.object({
    subtotal: z.number().nonnegative().default(0),
    estimatedShipping: z.number().nonnegative().default(0),
    tax: z.number().nonnegative().default(0),
    grandTotal: z.number().nonnegative().default(0),
  }),
  expiresAt: DateSchema.optional(),
  createdAt: DateSchema.optional(),
  updatedAt: DateSchema.optional(),
  __v: z.number().optional(),
});

export const AddToCartSchema = z.object({
  productId: MongoIdSchema,
  quantity: z.number().int().positive().default(1),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().nonnegative(),
});

export const MergeCartSchema = z.object({
  guestId: z.string(),
});
