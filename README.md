# Terra Form Studio - Backend

Fastify-powered API server for the Terra Form Studio platform.

## Features

- **Schema-first Validation**: Every route is strictly validated using Zod.
- **Swagger Documentation**: Automated OpenAPI documentation available at `/docs`.
- **Artisan Lifecycle**: Support for artisan applications, profiles, and product management.
- **E-commerce Core**: Cart management, pricing validation, and order processing.
- **Admin APIs**: System settings configuration and dashboard analytics.
- **Media Support**: Multipart and Base64 image upload capabilities.

## Tech Stack

- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Validation**: Zod (via fastify-type-provider-zod)
- **Documentation**: Swagger/OpenAPI

## Project Structure

- `src/models/`: Mongoose schemas and TypeScript interfaces.
- `src/routes/`: Fastify route definitions grouped by domain.
- `src/schemas/`: Reusable Zod validation schemas.
- `src/services/`: Business logic layer.
- `src/plugins/`: Fastify plugins (Auth, Static files, etc.).

## Setup and Installation

### Prerequisites
- Node.js (v18+)
- MongoDB instance

### Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the environment requirements (MONGODB_URI, JWT_SECRET, etc.).

### Running the Server
- **Development**:
  ```bash
   npm run dev
   ```
- **Build**:
  ```bash
   npm run build:ts
   ```
- **Seeding**:
  ```bash
   npm run seed
   ```

## API Documentation
Once the server is running, visit `http://localhost:3000/docs` to view the interactive Swagger UI.
