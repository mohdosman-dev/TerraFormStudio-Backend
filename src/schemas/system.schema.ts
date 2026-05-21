import { z } from "zod";
import { DateSchema, MongoIdSchema } from "./common.schema.ts";

export const DeliveryMethodSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(""),
  price: z.number(),
  currency: z.string().default("AED"),
  estimatedDays: z.string().default(""),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export const SystemSettingSchema = z.object({
  _id: MongoIdSchema.optional(),
  general: z.object({
    defaultCurrency: z.enum(["USD", "EUR", "GBP", "AED"]).default("AED"),
  }),
  payments: z.object({
    stripe: z.object({
      isActive: z.boolean().default(false),
      connectedAccount: z.string().optional().default(""),
    }),
    paypal: z.object({
      isActive: z.boolean().default(false),
      email: z.string().email().optional(),
    }),
    applePay: z.object({
      isActive: z.boolean().default(false),
      isVerified: z.boolean().default(false),
    }),
  }),
  deliveryMethods: z.array(DeliveryMethodSchema).default([]),
  legal: z.object({
    termsAndConditions: z.object({
      content: z.string().default(""),
      lastUpdated: DateSchema.optional(),
    }),
    privacyPolicy: z.object({
      content: z.string().default(""),
      lastUpdated: DateSchema.optional(),
    }),
  }),
  communication: z.object({
    emailTemplates: z.object({
      orderConfirmation: z.object({
        subject: z.string().default("Order Confirmation"),
        body: z.string().default(""),
      }),
      shippingUpdate: z.object({
        subject: z.string().default("Shipping Update"),
        body: z.string().default(""),
      }),
      welcomeEmail: z.object({
        subject: z.string().default("Welcome to Terra Form Studio"),
        body: z.string().default(""),
      }),
    }),
  }),
  updatedAt: DateSchema.optional(),
  __v: z.number().optional(),
});

export const DashboardOverviewSchema = z.object({
  stats: z.object({
    totalSales: z.number(),
    orderCount: z.number(),
    artisanCount: z.number(),
    activeProducts: z.number(),
  }),
  salesHistory: z.array(
    z.object({
      date: z.string(),
      amount: z.number(),
    }),
  ),
  recentOrders: z.array(z.any()), // Can be more specific if needed
});
