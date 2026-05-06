import { z } from "zod";
import { DateSchema, MongoIdSchema } from "./common.schema.ts";

export const CheckoutSessionSchema = z.object({
  _id: MongoIdSchema.optional(),
  cartId: MongoIdSchema,
  userId: MongoIdSchema,
  status: z.enum(["in_progress", "completed", "expired", "cancelled"]),
  stepState: z.object({
    shippingCompleted: z.boolean().default(false),
    paymentCompleted: z.boolean().default(false),
    reviewReady: z.boolean().default(false),
  }),
  shipping: z.object({
    fullName: z.string().optional(),
    phone: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    deliveryOption: z.string().optional(),
  }).optional(),
  payment: z.object({
    provider: z.string().default("mock"),
    paymentIntentId: z.string().optional(),
    status: z.enum(["pending", "succeeded", "failed"]).default("pending"),
    methodSummary: z.object({
      brand: z.string().optional(),
      last4: z.string().optional(),
    }).optional(),
  }).optional(),
  priceValidation: z.object({
    currency: z.string().default("AED"),
    subtotal: z.number().default(0),
    shipping: z.number().default(0),
    tax: z.number().default(0),
    grandTotal: z.number().default(0),
    validatedAt: DateSchema.optional(),
  }),
  expiresAt: DateSchema.optional(),
  createdAt: DateSchema.optional(),
  updatedAt: DateSchema.optional(),
  __v: z.number().optional(),
});

export const SetShippingSchema = z.object({
  fullName: z.string(),
  phone: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  country: z.string(),
  postalCode: z.string(),
  deliveryOption: z.string().optional(),
});
