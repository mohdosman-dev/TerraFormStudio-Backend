import { z } from "zod";
import { DateSchema, MongoIdSchema, PriceSchema } from "./common.schema.ts";

export const CartItemSchema = z.object({
  productId: MongoIdSchema,
  titleSnapshot: z.string().optional().default(""),
  artisanSnapshot: z.object({
    artisanId: MongoIdSchema.optional(),
    displayName: z.string().optional().default(""),
  }).optional(),
  imageSnapshot: z.string().optional().default(""),
  priceSnapshot: PriceSchema.optional(),
  quantity: z.number().int().positive().default(1),
  addedAt: DateSchema.optional(),
});

export const CartSchema = z.object({
  _id: MongoIdSchema.optional(),
  userId: MongoIdSchema,
  status: z.enum(["active", "completed", "abandoned"]),
  items: z.array(CartItemSchema),
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
