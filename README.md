<div align="center">

# 💰 Dynamic Pricing

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern dynamic pricing platform that helps you optimize your product pricing based on market demand and geographic data.

[Key Features](#key-features) • [Getting Started](#getting-started) • [Tech Stack](#tech-stack) • [Documentation](#documentation)

</div>

## 🌟 Key Features

- 🔐 **Secure Authentication** - User management with Clerk
- 📊 **Analytics Dashboard** - Track views by country and PPP groups
- 🌍 **Geographic Pricing** - Set prices based on country groups
- 📈 **Real-time Tracking** - Monitor product views and engagement
- 🎨 **Custom Banners** - Generate dynamic product banners
- 🔄 **Cache System** - Optimized performance with Next.js caching

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database
- Clerk account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/dynamic-pricing.git
   cd dynamic-pricing
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```
   Fill in your environment variables:
   ```env
   DATABASE_URL=your_database_url
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

4. Run database migrations
   ```bash
   npm run db:migrate
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14
- **UI**: Tailwind CSS, shadcn/ui
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Next.js App Router
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **Authentication**: Clerk
- **Caching**: Next.js Cache

## 📖 Documentation

### Data Models

#### Product
```typescript
interface Product {
  id: UUID
  name: string
  description?: string
  price: number
  userId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### ProductView
```typescript
interface ProductView {
  id: UUID
  productId: UUID
  countryId: UUID
  visitedAt: Date
}
```

### API Routes

- `GET /api/products` - List user's products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `GET /api/products/:id/banner` - Get product banner
- `GET /api/analytics` - Get analytics data

## 🔧 Scripts

```bash
# Development
npm run dev         # Start development server
npm run build      # Build for production
npm run start      # Start production server

# Database
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio

# Testing
npm run lint       # Run ESLint
```

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with `git push` to main branch

### Environment Variables

Required variables for deployment:
```env
DATABASE_URL
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
NEXT_PUBLIC_SERVER_URL
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.dev/)
- [PostgreSQL](https://www.postgresql.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
