# Restaurant Project Full Stack

A comprehensive full-stack restaurant management system built with modern web technologies, featuring separate admin and customer applications with shared infrastructure.

## 🏗️ Architecture Overview

This is a **monorepo** built with **Turborepo** that contains multiple applications and shared packages:

```
Restaurant.Project.FullStack/
├── apps/
│   ├── admin/          # Restaurant management interface
│   └── customer/       # Customer ordering interface
├── packages/
│   ├── database/       # Shared Prisma database schema
│   ├── eslint-config/  # Shared ESLint configuration
│   ├── test/          # E2E testing with Playwright
│   └── typescript-config/ # Shared TypeScript configuration
└── docs/              # Project documentation
```

## 🚀 Applications

### 🔧 Admin Application (Port 3002)
The restaurant management interface for staff and administrators.

**Key Features:**
- **Menu Management**: Add, edit, delete menu items with rich details
- **Category Organization**: Organize menu items by categories
- **Advanced Search**: Filter items by name, category, and availability
- **Staff Authentication**: Secure login system for restaurant staff
- **Responsive Design**: Works seamlessly on desktop and mobile devices

[📖 View Admin Documentation](./apps/admin/README.md)

### 🛒 Customer Application (Port 3001)
The customer-facing ordering interface for restaurant patrons.

**Key Features:**
- **Menu Browsing**: Intuitive menu exploration with categories
- **Shopping Cart**: Advanced cart management with React Context
- **User Authentication**: Secure customer accounts with NextAuth.js
- **Order Management**: Complete order lifecycle from cart to confirmation
- **Responsive Design**: Mobile-first design for optimal user experience

[📖 View Customer Documentation](./apps/customer/README.md)

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.3.0 with App Router
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4.1.7
- **TypeScript**: 5.8.2 for type safety
- **Build Tool**: Turbopack for fast development

### Backend & Database
- **Database**: PostgreSQL
- **ORM**: Prisma for type-safe database operations
- **Authentication**: NextAuth.js with multiple providers
- **Password Security**: bcryptjs for secure password hashing

### Development & Deployment
- **Monorepo Management**: Turborepo 2.5.3
- **Package Manager**: pnpm 9.0.0
- **Testing**: Playwright for E2E testing
- **CI/CD**: GitHub Actions with comprehensive workflows
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

## 📊 Database Schema

The shared database includes the following main entities:

- **User**: Customer and admin user management
- **Category**: Menu item categorization
- **Item**: Restaurant menu items with pricing and details
- **Order**: Customer order tracking and management

[📖 View Database Documentation](./packages/database/README.md)

## 🚀 Quick Start

### Prerequisites

- **Node.js**: >= 18.0.0
- **pnpm**: 9.0.0 (recommended package manager)
- **PostgreSQL**: For database operations

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Restaurant.Project.FullStack
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment templates
   cp apps/admin/.env.example apps/admin/.env.local
   cp apps/customer/.env.example apps/customer/.env.local
   cp packages/database/.env.example packages/database/.env
   ```

4. **Configure your environment variables**
   ```bash
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/restaurant_db"
   
   # Authentication
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3001"  # For customer app
   
   # OAuth providers (optional)
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

5. **Set up the database**
   ```bash
   cd packages/database
   pnpm db:migrate
   pnpm db:seed  # Optional: populate with sample data
   ```

6. **Start the development servers**
   ```bash
   # From the root directory
   pnpm dev
   ```

   This will start:
   - **Customer App**: http://localhost:3001
   - **Admin App**: http://localhost:3002

## 📋 Available Commands

### Root Level Commands

```bash
# Development
pnpm dev                 # Start all applications in development mode
pnpm build              # Build all applications for production
pnpm lint               # Run ESLint across all packages
pnpm format             # Format code with Prettier
pnpm check-types        # Run TypeScript type checking

# Testing
pnpm test               # Run all tests
pnpm test:e2e          # Run E2E tests with Playwright
```

### Application-Specific Commands

```bash
# Admin application
cd apps/admin
pnpm dev               # Start admin app on port 3002
pnpm build             # Build admin app
pnpm start             # Start production build

# Customer application
cd apps/customer
pnpm dev               # Start customer app on port 3001
pnpm build             # Build customer app
pnpm start             # Start production build
```

### Database Commands

```bash
cd packages/database
pnpm db:migrate        # Run database migrations
pnpm db:reset          # Reset database
pnpm db:seed           # Seed database with sample data
pnpm db:studio         # Open Prisma Studio
```

## 🧪 Testing

### End-to-End Testing

The project includes comprehensive E2E tests using Playwright:

```bash
# Run all E2E tests
pnpm test:e2e

# Run tests for specific app
pnpm test:e2e:admin
pnpm test:e2e:customer

# Run tests in UI mode
pnpm test:e2e:ui
```

**Test Coverage:**
- User authentication flows
- Menu browsing and search
- Shopping cart operations
- Order placement and management
- Admin menu management
- Cross-browser testing (Chrome, Firefox, Safari)

[📖 View Testing Documentation](./packages/test/README.md)

## 🚦 CI/CD

The project includes robust CI/CD pipelines with GitHub Actions:

### Workflows
- **Main CI/CD Pipeline**: Automated testing, building, and deployment
- **Database Migration**: Safe database schema updates
- **Security Scanning**: Dependency vulnerability checks
- **Code Quality**: Automated linting and type checking

### Deployment Strategies
- **Staging Environment**: Automatic deployment for testing
- **Production Environment**: Manual approval required
- **Blue-Green Deployment**: Zero-downtime deployments
- **Database Migrations**: Automated with rollback capabilities

[📖 View CI/CD Documentation](./docs/CICD.md)

## 🏗️ Project Structure

```
├── .github/                 # GitHub Actions workflows
│   └── workflows/
├── apps/
│   ├── admin/              # Admin application
│   │   ├── src/
│   │   │   ├── app/        # Next.js App Router pages
│   │   │   ├── components/ # React components
│   │   │   └── lib/        # Utility functions
│   │   └── package.json
│   └── customer/           # Customer application
│       ├── src/
│       │   ├── app/        # Next.js App Router pages
│       │   ├── components/ # React components
│       │   ├── context/    # React Context providers
│       │   └── lib/        # Utility functions
│       └── package.json
├── packages/
│   ├── database/           # Shared database package
│   │   ├── prisma/         # Prisma schema and migrations
│   │   └── src/            # Database utilities
│   ├── eslint-config/      # Shared ESLint configuration
│   ├── test/               # E2E testing suite
│   │   ├── admin/          # Admin app tests
│   │   ├── customer/       # Customer app tests
│   │   └── setup/          # Test setup and utilities
│   └── typescript-config/  # Shared TypeScript configuration
├── docs/                   # Project documentation
└── turbo.json             # Turborepo configuration
```

## 🔒 Security Features

- **Authentication**: NextAuth.js with multiple provider support
- **Password Security**: bcryptjs hashing with salt rounds
- **Input Validation**: Server-side validation for all endpoints
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: NextAuth.js CSRF tokens
- **Environment Variables**: Secure configuration management

## 🌐 Environment Configuration

### Development Environment
- **Hot Reload**: Enabled for all applications
- **Source Maps**: Available for debugging
- **Type Checking**: Real-time TypeScript validation
- **Database**: Local PostgreSQL instance

### Production Environment
- **Optimized Builds**: Minified and tree-shaken bundles
- **Caching**: Static asset caching with CDN
- **Monitoring**: Application performance monitoring
- **Logging**: Structured logging for debugging

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Install dependencies**: `pnpm install`
4. **Make your changes**
5. **Run tests**: `pnpm test`
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Development Guidelines

- **Code Style**: Use Prettier for formatting
- **Linting**: All code must pass ESLint checks
- **Type Safety**: Maintain strict TypeScript compliance
- **Testing**: Write tests for new features
- **Documentation**: Update relevant documentation

## 🐛 Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check database connection
cd packages/database
pnpm db:studio
```

**Port Conflicts**
```bash
# Check if ports are in use
lsof -i :3001  # Customer app
lsof -i :3002  # Admin app
```

**Dependencies Issues**
```bash
# Clean and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

**Build Issues**
```bash
# Clean Turbo cache
pnpm turbo clean
pnpm build
```

## 📈 Performance

- **Build Time**: ~30 seconds for full build
- **Hot Reload**: <200ms for development changes
- **Bundle Size**: Optimized with tree-shaking
- **Database Queries**: Optimized with Prisma
- **Caching**: Multi-level caching strategy

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support, please:
1. Check the [documentation](./docs/)
2. Search existing [issues](../../issues)
3. Create a new issue with detailed information

## 🗺️ Roadmap

- [ ] **Mobile Apps**: React Native applications
- [ ] **Real-time Updates**: WebSocket integration
- [ ] **Analytics Dashboard**: Business intelligence features
- [ ] **Multi-tenant Support**: Multiple restaurant locations
- [ ] **Payment Integration**: Stripe/PayPal integration
- [ ] **Inventory Management**: Stock tracking system

## 🔗 Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines:

```bash
# Authenticate with Vercel
npx turbo login

# Link your Turborepo to Remote Cache
npx turbo link
```

## 📚 Useful Links

Learn more about the technologies used:

- [Turborepo Documentation](https://turborepo.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Playwright Documentation](https://playwright.dev/)

---

**Made with ❤️ for the restaurant industry**
