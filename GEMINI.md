# Terra Form Studio - Backend Guidelines

## Project Overview

Terra Form Studio is a premium marketplace for handmade ceramics. This backend serves as the core engine for artisan storytelling, product discovery, and a secure checkout lifecycle.

## Tech Stack Mandates

- **Runtime:** Node.js
- **Framework:** Fastify (using Fastify CLI conventions)
- **Database:** MongoDB
- **Authentication:** JWT Bearer Tokens
- **Architecture:** Domain-based modularity (Auth, Users, Artisans, Catalog, Discovery, Cart, Checkout, Orders)

## Git Workflow & Engineering Standards

- **Feature Branches:** Create a new branch for each feature (e.g., `feature/catalog-api`).
- **Commits:** Write meaningful, descriptive git commit messages.
- **Review Protocol:** Ask the user to review all changes before merging into the `main` branch.
- **Surgical Implementation:** Follow the Research -> Strategy -> Execution cycle.
- **Verification:** Write automated tests for every feature implemented.
- **Test Execution:** DO NOT run tests automatically. Only execute test suites when explicitly asked by the user.

## Development Principles

- **Resource-Oriented APIs:** Use explicit nouns and predictable payloads (REST-style).
- **Data Integrity:** Use snapshots in Carts and Orders to preserve historical price/product state.
- **Inventory Safety:** Implement atomic updates for unique ceramic pieces to prevent double-selling.
- **AI-Friendly Code:** Use explicit naming (e.g., `artisanId` instead of `aid`), stable response shapes, and comprehensive type definitions.

## Project Structure (Fastify CLI)

- `/plugins`: Shared logic (Auth, DB connection).
- `/routes`: Domain-specific API endpoints grouped by module.
- `/services`: Business logic and MongoDB interactions.
- `/schemas`: Schema validation (Zod/TypeBox) and documentation.
- `/test`: Unit and integration tests for each feature.

## Operational Mandate

- **No Automatic Execution:** DO NOT build, run, or test the project automatically. Only execute these operations when explicitly requested by the user.

## Collection Overview

- Primary: `users`, `artisans`, `products`, `collections`, `home_sections`, `carts`, `checkout_sessions`, `orders`.
- Secondary: `journal_articles`, `wishlists`, `saved_artisans`, `notifications`.
