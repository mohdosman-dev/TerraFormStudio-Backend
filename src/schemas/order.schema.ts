import { z } from "zod";
import { DateSchema, MongoIdSchema, PriceSchema } from "./common.schema.ts";

export const OrderItemSchema = z.object({
  productId: MongoIdSchema,
  slugSnapshot: z.string().optional().default(""),
  titleSnapshot: z.string().optional().default(""),
  artisanSnapshot: z.object({
    artisanId: MongoIdSchema.optional(),
    displayName: z.string().optional().default(""),
  }).optional(),
  imageSnapshot: z.string().optional().default(""),
  specificationSnapshot: z.object({
    material: z.string().optional(),
    technique: z.string().optional(),
    glaze: z.string().optional(),
  }).optional(),
  unitPrice: PriceSchema,
  quantity: z.number().int().positive(),
  lineTotal: z.number().nonnegative(),
});

export const OrderSchema = z.object({
  _id: MongoIdSchema.optional(),
  orderNumber: z.string(),
  userId: MongoIdSchema,
  checkoutSessionId: MongoIdSchema.optional(),
  status: z.enum(["pending_payment", "paid", "failed", "cancelled", "refunded"]),
  paymentStatus: z.enum(["pending", "succeeded", "failed"]),
  fulfillmentStatus: z.enum(["processing", "packed", "shipped", "delivered", "returned"]),
  currency: z.string().default("AED"),
  customer: z.object({
    email: z.string().email(),
    fullName: z.string(),
  }),
  shippingAddress: z.object({
    addressLine1: z.string(),
    addressLine2: z.string().optional(),
    city: z.string(),
    country: z.string(),
    postalCode: z.string(),
  }),
  items: z.array(OrderItemSchema),
  totals: z.object({
    subtotal: z.number().nonnegative(),
    shipping: z.number().nonnegative(),
    tax: z.number().nonnegative(),
    grandTotal: z.number().nonnegative(),
  }),
  placedAt: DateSchema.optional(),
  createdAt: DateSchema.optional(),
  updatedAt: DateSchema.optional(),
  __v: z.number().optional(),
});
