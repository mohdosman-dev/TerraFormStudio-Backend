# Terra Form Studio — Backend Requirements

## Purpose

This document defines the backend architecture, main system behavior, and MongoDB data model for Terra Form Studio.

It is written to be **AI-friendly** and implementation-friendly. That means:
- entities are clearly named
- responsibilities are separated by domain
- field names are explicit and consistent
- relationships are easy to understand
- common backend flows are described in a step-by-step way
- MongoDB collections are documented with example shapes and indexes

The backend supports a premium marketplace for handmade ceramics and pottery. Its core responsibility is to manage artisans, products, editorial discovery, carts, checkout, orders, and future customer features such as wishlists and saved artisans.

## Backend Goals

The backend should support the following product goals:
- curated product discovery and artisan storytelling
- stable product and inventory management for mostly unique items
- friction-light cart and checkout flow
- secure order creation and payment processing
- future-ready support for wishlists, dashboards, and editorial content
- clean APIs and document structures that are easy for AI tools and developers to reason about

## Architecture Overview

Terra Form Studio can be implemented as a modular backend service with domain-based separation.

### Core backend modules

- **Auth Module** — customer accounts, artisan accounts, admin access, sessions, identity
- **User Module** — customer profile, saved preferences, future dashboard data
- **Artisan Module** — artisan profiles, studio story, profile publishing state
- **Catalog Module** — products, collections, categories, materials, techniques, glaze metadata
- **Discovery Module** — homepage curation, featured products, artisan spotlights, recommendation inputs
- **Cart Module** — active cart state, line items, pricing snapshots
- **Checkout Module** — shipping step, payment step, review step, order readiness validation
- **Order Module** — order creation, status tracking, payment result, fulfillment lifecycle
- **Content Module** — journal articles, studio stories, editorial blocks
- **Admin Module** — curation tools, product moderation, order operations, artisan management
- **Notification Module** — order emails, payment results, shipping updates

### Suggested API style

Use resource-oriented APIs with explicit nouns and predictable payloads. REST is a strong default for this project because it maps well to the main marketplace entities and is easy for both humans and AI tools to inspect.

Suggested route groups:
- `/auth/*`
- `/users/*`
- `/artisans/*`
- `/products/*`
- `/collections/*`
- `/home/*`
- `/cart/*`
- `/checkout/*`
- `/orders/*`
- `/journal/*`
- `/admin/*`

## Main System Functionality

## 1. Authentication and Identity

The system should support at least three identity types:
- **Guest customer** — can browse, add to cart, and potentially start checkout
- **Registered customer** — can place orders, view future order history, save artisans, maintain wishlist
- **Artisan** — can manage own profile, own products, and story content if the platform supports self-service tools
- **Admin / curator** — manages curation, products, publishing state, orders, and platform controls

### Auth capabilities

- sign up with email/password or social login if needed later
- sign in / sign out
- password reset
- role-based access control
- guest cart merge into authenticated cart after sign-in

## 2. Artisan Management

Artisans are a core storytelling entity, not just sellers.

Main capabilities:
- create artisan profile
- edit artisan biography, philosophy, materials, studio story, and hero imagery
- manage publishing status
- associate products with an artisan
- expose public artisan profile for customer browsing

An artisan profile should be able to exist even when no products are currently available.

## 3. Product Catalog

Products are the core commerce entity.

Main capabilities:
- create product
- update product details
- publish / unpublish product
- mark as sold, low stock, available, draft, archived, or made-to-order
- attach media gallery
- assign taxonomy fields such as material, technique, glaze, collection
- expose product detail data for the storefront

Because many products may be one-of-a-kind, the backend must treat inventory carefully and prevent double-selling.

## 4. Curated Discovery

The homepage should not be driven only by raw newest-first product listing.

Main capabilities:
- manage featured collections
- manage artisan spotlights
- manage hero sections
- mix editorial blocks with products
- return mobile-friendly homepage payloads in curated order
- support recommendation sources for PDP and cart modules

Curation data should be versionable and easy to edit without changing product records.

## 5. Cart Management

The cart holds purchase intent before checkout.

Main capabilities:
- create cart for guest or signed-in user
- add product to cart
- remove product from cart
- validate availability on every critical cart mutation
- store pricing snapshot at line-item level for consistency during checkout
- support cart expiration or cleanup for stale guest carts

For unique pieces, the cart does **not** guarantee ownership forever. Final validation must happen again during checkout and order placement.

## 6. Checkout Flow

Checkout is a 3-step process:
- **Step 1: Shipping**
- **Step 2: Payment**
- **Step 3: Review**

Main backend responsibilities:
- persist step progress
- validate shipping address
- validate line items and price snapshot
- create payment intent with payment provider
- revalidate inventory before final order placement
- convert cart into order only when payment and inventory checks pass

## 7. Order Management

Orders are the final confirmed commerce record.

Main capabilities:
- create order from validated checkout session
- store purchased item snapshots permanently
- store payment result
- track fulfillment status
- expose confirmation and order lookup data
- support future customer dashboard history

Orders should never depend on live product records for core purchased-item display. Order line items must preserve a snapshot of product title, price, images, and artisan name at purchase time.

## 8. Editorial and Journal Content

The platform includes future content features such as journal articles and studio stories.

Main capabilities:
- create and publish journal articles
- link journal content to artisans, collections, or products
- expose curated editorial content on home and artisan pages
- support SEO-friendly slugs and publish dates

## 9. Recommendations and Cross-Sell Logic

Recommendations should feel curated, not noisy.

The backend should support recommendation inputs based on:
- same artisan
- same material
- same technique
- same glaze family
- same collection
- manually curated related products
- fallback trending or featured logic

A manual curation override should always be possible.

## Core Flows

## Browse Product Flow

1. User opens home screen
2. Backend returns curated homepage sections
3. User opens artisan profile or product detail
4. Backend returns full artisan or product payload
5. Recommendation inputs are included with product detail response

## Add to Cart Flow

1. User taps add to cart
2. Backend loads product and validates that it is purchasable
3. Backend creates cart if needed
4. Backend adds a line item snapshot
5. Backend returns updated cart totals and item list

## Checkout Flow

1. User starts checkout from cart
2. Backend creates or resumes checkout session
3. User saves shipping info
4. Backend validates shipping payload and stores step state
5. User enters payment info or chooses express checkout
6. Backend creates payment intent and stores payment method summary
7. User reviews order
8. Backend revalidates inventory, price, and checkout completeness
9. Backend creates final order if payment succeeds
10. Backend marks purchased inventory as sold or unavailable
11. Backend returns order confirmation payload

## Order Confirmation Flow

1. Order is successfully created
2. Confirmation payload returns order id, items, totals, and tracking placeholder or tracking data
3. Notification module sends confirmation email
4. Customer can continue shopping or view future order history

## MongoDB Design Principles

Because MongoDB is the primary database, the schema should optimize for document-read patterns used by the storefront.

### General MongoDB rules for this project

- keep frequently-read customer-facing documents compact and predictable
- embed small immutable snapshots when useful
- reference large or independently managed entities
- avoid deeply nested unpredictable structures
- use consistent field names across collections
- use timestamps on every collection
- use soft-delete or archive flags where business history matters
- store denormalized display fields where they reduce expensive joins or repeated lookups

### Common base fields

Most collections should include:
- `_id`
- `createdAt`
- `updatedAt`
- `createdBy` when relevant
- `status` when lifecycle matters
- `isDeleted` or `archivedAt` when soft delete matters

## Collection Overview

Suggested primary collections:
- `users`
- `sessions` or auth provider collection as needed
- `artisans`
- `products`
- `collections`
- `home_sections`
- `carts`
- `checkout_sessions`
- `orders`
- `journal_articles`
- `saved_artisans`
- `wishlists`
- `notifications`
- `audit_logs`

## 1. users

Stores customer, artisan, and admin identity records.

### Purpose
- account identity
- role management
- profile basics
- future dashboard ownership

### Example document

```json
{
  "_id": "user_001",
  "email": "collector@example.com",
  "passwordHash": "hashed_value",
  "roles": ["customer"],
  "profile": {
    "firstName": "Lina",
    "lastName": "Haddad",
    "phone": "+971500000000",
    "avatarUrl": "https://..."
  },
  "preferences": {
    "currency": "AED",
    "locale": "en-AE"
  },
  "status": "active",
  "createdAt": "2026-04-26T00:00:00.000Z",
  "updatedAt": "2026-04-26T00:00:00.000Z"
}
```

### Notes
- one user can have multiple roles if needed
- artisan users may also have a linked artisan profile
- sensitive auth data should remain separate from public profile data in responses

### Suggested indexes
- `email` unique
- `roles`
- `status`

## 2. artisans

Stores public and internal artisan information.

### Purpose
- artisan storytelling
- public profile rendering
- linking products to maker identity

### Example document

```json
{
  "_id": "artisan_001",
  "userId": "user_010",
  "slug": "mariam-al-haddad-studio",
  "displayName": "Mariam Al Haddad",
  "brandName": "Mariam Studio",
  "bioShort": "Wheel-thrown stoneware inspired by coastal forms.",
  "bioLong": "Full artisan story here.",
  "studioStory": {
    "philosophy": "Quiet objects for daily rituals.",
    "materials": ["stoneware", "porcelain"],
    "techniques": ["wheel-thrown", "hand-finished"]
  },
  "heroImage": {
    "url": "https://...",
    "alt": "Artisan in studio"
  },
  "gallery": [
    { "url": "https://...", "alt": "Studio shelf" }
  ],
  "location": {
    "city": "Dubai",
    "country": "AE"
  },
  "socialLinks": {
    "instagram": "https://instagram.com/..."
  },
  "status": "published",
  "createdAt": "2026-04-26T00:00:00.000Z",
  "updatedAt": "2026-04-26T00:00:00.000Z"
}
```

### Suggested indexes
- `slug` unique
- `userId`
- `status`
- `displayName`

## 3. products

Stores sellable ceramic pieces.

### Purpose
- storefront catalog
- PDP rendering
- recommendation metadata
- inventory state

### Example document

```json
{
  "_id": "product_001",
  "slug": "ash-glaze-serving-bowl",
  "artisanId": "artisan_001",
  "title": "Ash Glaze Serving Bowl",
  "subtitle": "Wheel-thrown stoneware bowl",
  "descriptionShort": "A shallow bowl for shared table settings.",
  "descriptionLong": "Long tactile product story here.",
  "price": {
    "amount": 320,
    "currency": "AED"
  },
  "media": [
    {
      "url": "https://...",
      "alt": "Ash glaze serving bowl front view",
      "type": "image",
      "sortOrder": 1
    }
  ],
  "specifications": {
    "material": "stoneware",
    "technique": "wheel-thrown",
    "glaze": "ash glaze",
    "dimensions": {
      "widthCm": 28,
      "heightCm": 7,
      "weightGrams": 980
    },
    "care": "Hand wash recommended"
  },
  "inventory": {
    "mode": "unique",
    "quantityAvailable": 1,
    "status": "available"
  },
  "discovery": {
    "collectionIds": ["collection_001"],
    "tags": ["serving", "earth-tone", "tableware"],
    "relatedProductIds": ["product_002", "product_003"]
  },
  "seo": {
    "title": "Ash Glaze Serving Bowl | Terra Form Studio",
    "description": "Handmade wheel-thrown stoneware bowl"
  },
  "status": "published",
  "publishedAt": "2026-04-26T00:00:00.000Z",
  "createdAt": "2026-04-26T00:00:00.000Z",
  "updatedAt": "2026-04-26T00:00:00.000Z"
}
```

### Product status values
- `draft`
- `published`
- `archived`
- `sold`
- `made_to_order`
- `unavailable`

### Suggested indexes
- `slug` unique
- `artisanId`
- `status`
- `inventory.status`
- `discovery.collectionIds`
- `specifications.material`
- `specifications.technique`
- `specifications.glaze`
- compound index for discovery filters, for example `status + material + technique`

## 4. collections

Stores curated product groupings.

### Purpose
- homepage editorial grouping
- themed discovery pages
- seasonal or material-based collections

### Example document

```json
{
  "_id": "collection_001",
  "slug": "earth-tone-table",
  "title": "Earth-Tone Table",
  "description": "Warm serving pieces for shared meals.",
  "heroImage": {
    "url": "https://...",
    "alt": "Curated earth-tone ceramics"
  },
  "productIds": ["product_001", "product_005"],
  "status": "published",
  "sortOrder": 1,
  "createdAt": "2026-04-26T00:00:00.000Z",
  "updatedAt": "2026-04-26T00:00:00.000Z"
}
```

### Suggested indexes
- `slug` unique
- `status`
- `sortOrder`

## 5. home_sections

Stores curated homepage structure separately from catalog data.

### Purpose
- homepage hero management
- featured artisan modules
- editorial sequence control
- flexible curated blocks

### Example document

```json
{
  "_id": "home_2026_spring",
  "name": "Spring Home Layout",
  "status": "published",
  "sections": [
    {
      "type": "hero",
      "title": "Objects for quiet rituals",
      "subtitle": "A curated edit of handmade ceramics.",
      "image": { "url": "https://...", "alt": "Hero pottery scene" },
      "cta": { "label": "Explore Collection", "targetType": "collection", "targetId": "collection_001" },
      "sortOrder": 1
    },
    {
      "type": "artisan_spotlight",
      "artisanId": "artisan_001",
      "sortOrder": 2
    },
    {
      "type": "product_row",
      "title": "New Arrivals",
      "productIds": ["product_001", "product_002"],
      "sortOrder": 3
    }
  ],
  "createdAt": "2026-04-26T00:00:00.000Z",
  "updatedAt": "2026-04-26T00:00:00.000Z"
}
```

### Suggested indexes
- `status`
- `name`

## 6. carts

Stores current cart state for guest or signed-in user.

### Purpose
- active shopping state
- checkout source of truth before order creation

### Example document

```json
{
  "_id": "cart_001",
  "userId": "user_001",
  "guestToken": null,
  "status": "active",
  "currency": "AED",
  "items": [
    {
      "productId": "product_001",
      "titleSnapshot": "Ash Glaze Serving Bowl",
      "artisanSnapshot": {
        "artisanId": "artisan_001",
        "displayName": "Mariam Al Haddad"
      },
      "imageSnapshot": "https://...",
      "priceSnapshot": {
        "amount": 320,
        "currency": "AED"
      },
      "quantity": 1,
      "availabilityStatus": "available",
      "addedAt": "2026-04-26T00:00:00.000Z"
    }
  ],
  "totals": {
    "subtotal": 320,
    "estimatedShipping": 0,
    "tax": 0,
    "grandTotal": 320
  },
  "expiresAt": "2026-05-03T00:00:00.000Z",
  "createdAt": "2026-04-26T00:00:00.000Z",
  "updatedAt": "2026-04-26T00:00:00.000Z"
}
```

### Notes
- cart uses snapshots to preserve stable display during checkout
- stale carts can be expired or archived
- guest carts use `guestToken`

### Suggested indexes
- `userId`
- `guestToken`
- `status`
- `expiresAt`

## 7. checkout_sessions

Stores the in-progress state of the 3-step checkout.

### Purpose
- resume checkout
- preserve shipping and payment step progress
- validate before order creation

### Example document

```json
{
  "_id": "checkout_001",
  "cartId": "cart_001",
  "userId": "user_001",
  "status": "in_progress",
  "stepState": {
    "shippingCompleted": true,
    "paymentCompleted": false,
    "reviewReady": false
  },
  "shipping": {
    "fullName": "Lina Haddad",
    "phone": "+971500000000",
    "addressLine1": "Al Rashidiya",
    "addressLine2": "Apartment 202",
    "city": "Ajman",
    "country": "AE",
    "postalCode": "00000",
    "deliveryOption": "standard"
  },
  "payment": {
    "provider": "stripe",
    "paymentIntentId": "pi_123",
    "methodType": "card",
    "methodSummary": {
      "brand": "visa",
      "last4": "4242"
    },
    "status": "pending"
  },
  "priceValidation": {
    "currency": "AED",
    "subtotal": 320,
    "shipping": 20,
    "tax": 0,
    "grandTotal": 340,
    "validatedAt": "2026-04-26T00:00:00.000Z"
  },
  "expiresAt": "2026-04-26T01:00:00.000Z",
  "createdAt": "2026-04-26T00:00:00.000Z",
  "updatedAt": "2026-04-26T00:00:00.000Z"
}
```

### Suggested indexes
- `cartId`
- `userId`
- `status`
- `expiresAt`

## 8. orders

Stores final confirmed purchase records.

### Purpose
- legal and business purchase record
- customer confirmation source
- fulfillment source

### Example document

```json
{
  "_id": "order_001",
  "orderNumber": "TFS-2026-000001",
  "userId": "user_001",
  "checkoutSessionId": "checkout_001",
  "status": "paid",
  "paymentStatus": "succeeded",
  "fulfillmentStatus": "processing",
  "currency": "AED",
  "customer": {
    "email": "collector@example.com",
    "fullName": "Lina Haddad"
  },
  "shippingAddress": {
    "addressLine1": "Al Rashidiya",
    "addressLine2": "Apartment 202",
    "city": "Ajman",
    "country": "AE",
    "postalCode": "00000"
  },
  "items": [
    {
      "productId": "product_001",
      "slugSnapshot": "ash-glaze-serving-bowl",
      "titleSnapshot": "Ash Glaze Serving Bowl",
      "artisanSnapshot": {
        "artisanId": "artisan_001",
        "displayName": "Mariam Al Haddad"
      },
      "imageSnapshot": "https://...",
      "specificationSnapshot": {
        "material": "stoneware",
        "technique": "wheel-thrown",
        "glaze": "ash glaze"
      },
      "unitPrice": {
        "amount": 320,
        "currency": "AED"
      },
      "quantity": 1,
      "lineTotal": 320
    }
  ],
  "totals": {
    "subtotal": 320,
    "shipping": 20,
    "tax": 0,
    "grandTotal": 340
  },
  "tracking": {
    "carrier": null,
    "trackingNumber": null,
    "trackingUrl": null
  },
  "placedAt": "2026-04-26T00:00:00.000Z",
  "createdAt": "2026-04-26T00:00:00.000Z",
  "updatedAt": "2026-04-26T00:00:00.000Z"
}
```

### Order status values
- `pending_payment`
- `paid`
- `failed`
- `cancelled`
- `refunded`

### Fulfillment status values
- `processing`
- `packed`
- `shipped`
- `delivered`
- `returned`

### Suggested indexes
- `orderNumber` unique
- `userId`
- `status`
- `paymentStatus`
- `fulfillmentStatus`
- `placedAt`

## 9. journal_articles

Stores long-form editorial content.

### Purpose
- journal section
- care guides
- artisan interviews
- linked content discovery

### Example document

```json
{
  "_id": "journal_001",
  "slug": "caring-for-handmade-stoneware",
  "title": "Caring for Handmade Stoneware",
  "excerpt": "How to preserve everyday ceramic pieces.",
  "coverImage": {
    "url": "https://...",
    "alt": "Stoneware care scene"
  },
  "body": [
    {
      "type": "paragraph",
      "content": "Article content here"
    }
  ],
  "relatedArtisanIds": ["artisan_001"],
  "relatedProductIds": ["product_001"],
  "status": "published",
  "publishedAt": "2026-04-26T00:00:00.000Z",
  "createdAt": "2026-04-26T00:00:00.000Z",
  "updatedAt": "2026-04-26T00:00:00.000Z"
}
```

### Suggested indexes
- `slug` unique
- `status`
- `publishedAt`
- `relatedArtisanIds`

## 10. wishlists

Future-facing customer saved items collection.

### Example document

```json
{
  "_id": "wishlist_001",
  "userId": "user_001",
  "productIds": ["product_001", "product_004"],
  "createdAt": "2026-04-26T00:00:00.000Z",
  "updatedAt": "2026-04-26T00:00:00.000Z"
}
```

### Suggested indexes
- `userId` unique

## 11. saved_artisans

Future-facing customer saved artisan relationships.

### Example document

```json
{
  "_id": "saved_artisans_001",
  "userId": "user_001",
  "artisanIds": ["artisan_001", "artisan_005"],
  "createdAt": "2026-04-26T00:00:00.000Z",
  "updatedAt": "2026-04-26T00:00:00.000Z"
}
```

### Suggested indexes
- `userId` unique

## 12. notifications

Stores notification and messaging history.

### Example document

```json
{
  "_id": "notification_001",
  "userId": "user_001",
  "type": "order_confirmation",
  "channel": "email",
  "status": "sent",
  "payloadSummary": {
    "orderId": "order_001"
  },
  "sentAt": "2026-04-26T00:00:00.000Z",
  "createdAt": "2026-04-26T00:00:00.000Z",
  "updatedAt": "2026-04-26T00:00:00.000Z"
}
```

## Relationships Summary

| Entity | Main Relationships |
|--------|--------------------|
| User | Owns carts, checkout sessions, orders, wishlist, saved artisans |
| Artisan | Linked to user, owns products, appears in home sections and journal relations |
| Product | Belongs to artisan, may belong to collections, may appear in carts, orders, journal relations |
| Collection | References products |
| Cart | Belongs to user or guest, contains product snapshots |
| Checkout Session | Belongs to cart and optionally user |
| Order | Created from checkout session, contains immutable item snapshots |
| Journal Article | Can reference artisans and products |

## Inventory Strategy

Because Terra may sell one-of-a-kind pieces, inventory rules are critical.

### Recommended rules
- unique pieces should use `quantityAvailable = 1`
- adding to cart does not permanently reserve the item unless a reservation system is introduced later
- final inventory check happens before order creation
- after successful payment, product inventory should become `sold` or `unavailable`
- race conditions should be handled with atomic update logic

### Safe purchase pattern

At final order placement:
1. verify product status is purchasable
2. atomically decrement or mark sold
3. if update fails, stop order creation
4. return a clean out-of-stock message to the user

## Validation Rules

### Product validation
- title is required
- slug is required and unique
- artisanId is required
- at least one primary media asset is required for published products
- price amount must be greater than zero
- published products require inventory status

### Cart validation
- product must be purchasable
- quantity must not exceed allowed inventory rules
- line item snapshots must be refreshed on critical updates

### Checkout validation
- shipping fields required for shippable items
- payment intent must be valid before final review
- cart must not be empty
- products must still be available
- final totals must match validated totals

### Order validation
- order can only be created from a valid checkout session
- immutable item snapshots must be stored before completion
- payment result must be stored

## API Payload Design Rules

To keep the backend AI-friendly, payloads should follow these rules:
- use explicit names like `displayName`, `descriptionShort`, `quantityAvailable`
- avoid ambiguous names like `data`, `meta1`, `value`, `info`
- keep response objects stable across endpoints
- separate public display data from internal admin-only fields
- return nested objects only when they have clear meaning
- use enums for statuses rather than free-text strings
- keep date fields in ISO 8601 format
- keep monetary values in structured objects, not plain strings

## Recommended Response Shapes

### Public product response

```json
{
  "id": "product_001",
  "slug": "ash-glaze-serving-bowl",
  "title": "Ash Glaze Serving Bowl",
  "artisan": {
    "id": "artisan_001",
    "displayName": "Mariam Al Haddad"
  },
  "price": {
    "amount": 320,
    "currency": "AED"
  },
  "primaryImage": "https://...",
  "availability": "available"
}
```

### Public order confirmation response

```json
{
  "orderId": "order_001",
  "orderNumber": "TFS-2026-000001",
  "status": "paid",
  "totals": {
    "grandTotal": 340,
    "currency": "AED"
  },
  "tracking": null,
  "items": [
    {
      "title": "Ash Glaze Serving Bowl",
      "image": "https://..."
    }
  ]
}
```

## Security Requirements

- all traffic must use SSL/TLS
- passwords must be hashed with a strong password hashing algorithm
- payment data must never be stored raw if handled by a third-party processor
- use role-based authorization checks on admin and artisan endpoints
- validate and sanitize user input on every write endpoint
- sensitive internal fields must never be exposed in public responses
- audit important admin and order actions

## Performance Considerations

- optimize product and artisan responses for read-heavy mobile traffic
- use image metadata and CDN-backed media storage
- cache curated homepage responses when appropriate
- add indexes for product discovery filters and slugs
- paginate catalog and journal endpoints
- keep large text or media arrays controlled to avoid oversized documents

## Future Expansion

The backend design should allow future additions without major schema rewrites.

Future-ready additions:
- reservation window for rare items during checkout
- multi-currency pricing
- artisan self-service dashboards
- review and rating system
- event-based recommendation engine
- warehouse and shipment events
- advanced analytics and conversion tracking

## AI-Friendly Implementation Notes

This backend spec is designed to work well with AI coding tools.

### Conventions to keep
- keep collection names plural and lowercase
- keep ids explicit and stable in examples
- define enums in one shared file in the codebase
- define MongoDB schema models close to this document structure
- create one service per domain module
- create one validator per major write payload
- keep controller names aligned with module names
- avoid hidden side effects in model hooks when business logic is important
- keep order creation logic in a dedicated service with transactional safeguards where possible

### Good code organization example
- `modules/auth/*`
- `modules/users/*`
- `modules/artisans/*`
- `modules/products/*`
- `modules/cart/*`
- `modules/checkout/*`
- `modules/orders/*`
- `modules/content/*`
- `shared/types/*`
- `shared/constants/*`
- `shared/validators/*`

### Naming conventions
- collection names: `products`, `orders`, `checkout_sessions`
- variable names: `productId`, `artisanId`, `checkoutSessionId`
- enums: `ProductStatus`, `OrderStatus`, `FulfillmentStatus`
- timestamps: `createdAt`, `updatedAt`, `publishedAt`, `placedAt`

## Minimum Viable Backend Scope

For version 1, the backend must support:
- user accounts
- artisan profiles
- product catalog
- curated home sections
- cart
- 3-step checkout session
- order creation
- order confirmation

The following can be delayed to later phases:
- wishlist
- saved artisans
- journal
- advanced recommendation engine
- artisan self-service analytics

## Edge Cases

- guest adds item to cart, then signs in: merge carts carefully
- item sells out between PDP and checkout: return availability error gracefully
- payment succeeds but final inventory update fails: trigger manual recovery workflow and admin alert
- checkout session expires mid-flow: allow restart with cart preserved
- artisan is unpublished but product snapshots already exist in orders: keep historical order integrity
- product metadata changes after purchase: order snapshots remain unchanged
- empty curated homepage sections: hide invalid sections instead of returning broken blocks
- duplicate webhook delivery from payment provider: order creation must be idempotent
