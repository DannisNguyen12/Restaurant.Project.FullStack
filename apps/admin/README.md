# Restaurant Admin Dashboard

A powerful administrative dashboard for managing the Restaurant Project Full Stack. This Next.js application provides comprehensive tools for restaurant staff to manage menu items, categories, orders, and customer data.

## 🚀 Overview

The Admin Dashboard is part of the Restaurant Project Full Stack monorepo and provides essential tools for managing restaurant menu content:

- **Menu Management**: Create, edit, and organize menu items and categories
- **Content Management**: Manage item descriptions, pricing, and details
- **Category Organization**: Organize menu items into logical categories
- **Search Functionality**: Search and filter menu items efficiently

## 📋 Features

### 🍽️ Menu Management
- Create new menu items with detailed descriptions
- Edit existing menu items and update their information
- Organize items into categories (Appetizers, Main Course, Desserts, etc.)
- Set pricing and detailed descriptions
- Manage item ingredients, serving tips, and recommendations

### 📂 Category Management
- Create and manage menu categories
- View all items within specific categories
- Organize menu structure efficiently

### 🔍 Search & Filtering
- Real-time search functionality for menu items
- Filter items by categories
- Quick access to specific menu items
- Search across item names and descriptions

## 🛠️ Technology Stack

- **Framework**: Next.js 15.3.0 with App Router
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5.8.2
- **Styling**: Tailwind CSS 4.1.7
- **Authentication**: NextAuth.js 4.24.11
- **Database**: PostgreSQL with Prisma ORM
- **Build Tool**: Turbopack (Next.js 15 experimental)
- **Package Manager**: pnpm 9.0.0

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm 9.0.0
- PostgreSQL database
- Environment variables configured (see `.env.example`)

### Installation

From the project root:

```bash
# Install dependencies for all packages
pnpm install

# Start the admin development server
pnpm -F admin dev
```

The admin dashboard will be available at [http://localhost:3002](http://localhost:3002)

### Environment Variables

Create a `.env` file in the admin directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/restaurant_db"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3002"
JWT_SECRET="your-jwt-secret"

# OAuth Providers (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 📁 Project Structure

```
apps/admin/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── categories/   # Category management
│   │   ├── items/        # Menu item management
│   │   └── search/       # Search functionality
│   ├── item/             # Item management pages
│   │   ├── [id]/         # Edit item page
│   │   └── create/       # Create new item
│   ├── signin/           # Authentication pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Dashboard home
├── component/             # Reusable components
│   ├── auth/             # Authentication components
│   ├── home/             # Dashboard content
│   ├── item/             # Item management
│   ├── leftmenu/         # Navigation sidebar
│   └── search/           # Search components
├── context/              # React contexts
│   └── ToastContext.tsx  # Notification system
└── types/                # TypeScript definitions
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create new category
- `GET /api/categories/[id]` - Get category details
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category
- `GET /api/categories/[id]/items` - Get items in category

### Menu Items
- `GET /api/items` - List all items
- `POST /api/items` - Create new item
- `GET /api/items/[id]` - Get item details
- `PUT /api/items/[id]` - Update item
- `DELETE /api/items/[id]` - Delete item

### Search
- `GET /api/search?q={query}` - Search items and categories

## 🏗️ Development

### Available Scripts

```bash
# Development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Type checking
pnpm check-types
```

### Code Quality

- **ESLint**: Configured with zero warnings policy
- **TypeScript**: Strict mode enabled
- **Prettier**: Code formatting (run from project root)
- **Tailwind CSS**: Utility-first styling

### Development Guidelines

1. **Components**: Create reusable components in the `component/` directory
2. **API Routes**: Follow RESTful conventions in `app/api/`
3. **Types**: Define TypeScript interfaces in `types/`
4. **Authentication**: Use NextAuth.js for secure authentication
5. **Database**: Use Prisma ORM for database operations

## 🔐 Authentication & Security

### Admin Access
- Secure authentication with NextAuth.js
- Protected admin routes and API endpoints
- Session management for admin users
- Password hashing with bcryptjs

### Security Features
- JWT tokens for API authentication
- Secure session handling
- Protected API routes
- Environment-based configuration

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Search**: Instant search results as you type
- **Toast Notifications**: User feedback system for actions
- **Loading States**: Smooth user experience during data fetching
- **Error Handling**: Graceful error management and user feedback
- **Intuitive Navigation**: Easy-to-use sidebar navigation

## 🚀 Deployment

### Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Environment Setup

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy to your preferred platform (Vercel, Railway, etc.)

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and DATABASE_URL is correct
2. **Authentication**: Verify NEXTAUTH_SECRET and NEXTAUTH_URL are set
3. **Port Conflicts**: Admin runs on port 3002 by default
4. **Build Errors**: Check TypeScript errors with `pnpm check-types`

### Getting Help

- Check the [CI/CD Documentation](../../docs/CICD.md)
- Review the monorepo README
- Check database schema in `packages/database/`

## 🤝 Contributing

1. Follow the existing code style
2. Run tests before submitting PRs
3. Update documentation for new features
4. Ensure TypeScript compliance
5. Test on multiple browsers/devices

## 📄 License

This project is part of the Restaurant Project Full Stack and follows the same licensing terms.

---

**Admin Dashboard** - Part of Restaurant Project Full Stack Monorepo
