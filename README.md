# FoodHub Backend

A full workable backend for the **FoodHub 🍱 meal ordering platform** based on the assignment requirements. The project brief describes a 3-role platform with Customer, Provider, and Admin permissions, meal browsing, order flow, reviews, and moderation features. fileciteturn0file0L1-L85

## Core Features Included
- JWT authentication
- Role-based authorization: `CUSTOMER`, `PROVIDER`, `ADMIN`
- Admin seeded automatically via Prisma seed
- Provider profile creation during provider registration
- Public meals and provider browsing
- Provider meal CRUD
- Customer order creation, view, and cancel
- Provider order management and status update
- Admin user management
- Admin category management
- Customer review system for delivered meals only
- Zod validation + centralized error handling

## Tech Stack
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT
- Zod

## Folder Structure
```bash
foodhub-backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── .env.example
├── package.json
└── tsconfig.json
```

## Database Models
- Users
- ProviderProfiles
- Categories
- Meals
- Orders
- OrderItems
- Reviews

## Setup Instructions
### 1. Install dependencies
```bash
npm install
```

### 2. Copy environment file
```bash
cp .env.example .env
```

### 3. Update your PostgreSQL database URL in `.env`
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/foodhub?schema=public"
```

### 4. Generate Prisma client
```bash
npm run prisma:generate
```

### 5. Run migration
```bash
npx prisma migrate dev --name init
```

### 6. Seed admin and categories
```bash
npm run seed
```

### 7. Start server
```bash
npm run dev
```

Server base URL:
```bash
http://localhost:5000/api
```

## Seeded Admin Credentials
```text
Admin Email: admin@foodhub.com
Admin Password: admin123
```

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Meals
- `GET /api/meals`
- `GET /api/meals/:id`
- `POST /api/meals` (Provider)
- `PUT /api/meals/:id` (Provider)
- `DELETE /api/meals/:id` (Provider)
- `POST /api/meals/:id/reviews` (Customer)

### Providers
- `GET /api/providers`
- `GET /api/providers/:id`
- `GET /api/providers/dashboard/me` (Provider)
- `GET /api/providers/dashboard/orders/me` (Provider)
- `PATCH /api/providers/dashboard/orders/:id/status` (Provider)

### Orders
- `POST /api/orders` (Customer)
- `GET /api/orders` (Customer)
- `GET /api/orders/:id` (Customer/Provider/Admin)
- `PATCH /api/orders/:id/cancel` (Customer)

### Admin
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/status`
- `GET /api/admin/orders`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`

## Sample Register Payloads
### Customer Register
```json
{
  "name": "Rahim",
  "email": "rahim@example.com",
  "password": "123456",
  "role": "CUSTOMER",
  "phone": "01700000000",
  "address": "Dhaka"
}
```

### Provider Register
```json
{
  "name": "Kacchi House",
  "email": "provider@example.com",
  "password": "123456",
  "role": "PROVIDER",
  "phone": "01800000000",
  "address": "Dhaka",
  "providerProfile": {
    "restaurant": "Kacchi House",
    "description": "Best kacchi in town",
    "cuisine": "Bengali"
  }
}
```

## Important Notes
- Payment is intentionally skipped, because the assignment says all orders are **Cash on Delivery**.
- Admin is **seeded**, because the brief explicitly says admin accounts should be seeded. fileciteturn0file0L8-L18
- Public, customer, provider, and admin route ideas were implemented based on the provided project guideline and route examples. fileciteturn0file0L19-L58

## Recommended Next Step
Build the frontend in Next.js App Router and connect it using the provided endpoints.
