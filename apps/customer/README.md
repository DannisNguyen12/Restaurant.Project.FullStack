# Restaurant Customer App

A modern customer-facing web application for the Restaurant Project Full Stack. This Next.js application provides customers with an intuitive interface to browse menus, place orders, and manage their dining experience.

## 🚀 Overview

The Customer App is part of the Restaurant Project Full Stack monorepo and provides essential features for restaurant customers:

- **Menu Browsing**: View and explore restaurant menu items organized by categories
- **Shopping Cart**: Add items to cart, manage quantities, and review orders
- **User Authentication**: Secure sign-up and sign-in functionality
- **Order Management**: Place orders and view order confirmations
- **Search Functionality**: Find specific dishes quickly and efficiently

## 📋 Features

### 🍽️ Menu Browsing
- Browse complete restaurant menu with detailed item information
- View items organized by categories (Appetizers, Main Course, Desserts, etc.)
- See item descriptions, ingredients, serving tips, and recommendations
- View pricing and availability information
- Responsive design for all device sizes

### 🛒 Shopping Cart
- Add items to cart with customizable quantities
- Review cart contents before checkout
- Update item quantities or remove items
- Calculate subtotals, tax, and total amounts
- Persistent cart across browser sessions

### 👤 User Authentication
- Create new customer accounts with secure registration
- Sign in with email and password
- Session management with NextAuth.js
- Protected user areas and order history

### 📱 Order Management
- Seamless checkout process
- Order confirmation and success pages
- Secure payment flow integration
- Order summary and receipt generation

### 🔍 Search & Discovery
- Real-time search functionality across menu items
- Filter items by categories
- Quick access to popular dishes
- Search by item names and descriptions

## 🛠️ Technology Stack

- **Framework**: Next.js 15.3.0 with App Router
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5.8.2
- **Styling**: Tailwind CSS 4.1.7
- **Authentication**: NextAuth.js 4.24.11
- **Database**: PostgreSQL with Prisma ORM
- **Build Tool**: Turbopack (Next.js 15 experimental)
- **Package Manager**: pnpm 9.0.0
- **State Management**: React Context API (Cart, Toast notifications)

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

# Start the customer development server
pnpm -F customer dev
```

The customer app will be available at [http://localhost:3001](http://localhost:3001)

### Environment Variables

Create a `.env` file in the customer directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/restaurant_db"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3001"
JWT_SECRET="your-jwt-secret"

# OAuth Providers (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 📁 Project Structure

```
apps/customer/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── categories/   # Category data
│   │   ├── items/        # Menu items
│   │   ├── orders/       # Order management
│   │   ├── search/       # Search functionality
│   │   └── signup/       # User registration
│   ├── checkout/         # Checkout process
│   ├── item/             # Individual item pages
│   │   └── [id]/         # Dynamic item detail pages
│   ├── order-success/    # Order confirmation
│   ├── payment/          # Payment processing
│   ├── signin/           # Authentication pages
│   ├── signup/           # User registration
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── component/             # Reusable components
│   ├── auth/             # Authentication components
│   │   ├── signin.tsx    # Sign-in form
│   │   └── signup.tsx    # Registration form
│   ├── cart/             # Shopping cart components
│   │   └── cart.tsx      # Cart summary and management
│   ├── home/             # Homepage content
│   ├── item/             # Item display components
│   ├── leftmenu/         # Navigation sidebar
│   ├── logo/             # Branding components
│   └── search/           # Search functionality
├── context/              # React contexts
│   ├── CartContext.tsx   # Shopping cart state
│   └── ToastContext.tsx  # Notification system
└── types/                # TypeScript definitions
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication
- `POST /api/signup` - User registration

### Categories
- `GET /api/categories` - List all menu categories
- `GET /api/categories/[id]` - Get category details
- `GET /api/categories/[id]/items` - Get items in category

### Menu Items
- `GET /api/items` - List all menu items
- `GET /api/items/[id]` - Get item details with full information

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's order history (authenticated)

### Search
- `GET /api/search?q={query}` - Search menu items and categories

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
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Prettier**: Code formatting (run from project root)
- **Tailwind CSS**: Utility-first styling with responsive design

### Development Guidelines

1. **Components**: Create reusable components in the `component/` directory
2. **API Routes**: Follow RESTful conventions in `app/api/`
3. **Context**: Use React Context for global state (Cart, Notifications)
4. **Types**: Define TypeScript interfaces in `types/`
5. **Authentication**: Use NextAuth.js for secure user management

## 🛒 Shopping Cart System

### Cart Context Features
- **Add to Cart**: Add items with quantity selection
- **Update Quantities**: Modify item quantities in real-time
- **Remove Items**: Remove individual items from cart
- **Calculate Totals**: Automatic calculation of subtotals, tax, and total
- **Persistent State**: Cart maintains state across page refreshes
- **Item Count**: Display total number of items in cart

### Cart Operations
```typescript
// Add item to cart
addToCart(item, quantity);

// Update item quantity
updateQuantity(itemId, newQuantity);

// Remove item from cart
removeFromCart(itemId);

// Clear entire cart
clearCart();

// Get cart totals
getCartTotal();
getCartSubtotal();
getCartTax();
```

## 🔐 Authentication & Security

### Customer Authentication
- Secure user registration with email validation
- Password hashing with bcryptjs
- Session management with NextAuth.js
- JWT tokens for API authentication

### Security Features
- Protected routes for authenticated users
- Secure session handling
- CSRF protection
- Environment-based configuration
- Secure cookie management

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach optimized for all devices
- **Real-time Cart Updates**: Instant feedback when adding/removing items
- **Toast Notifications**: User-friendly feedback for all actions
- **Loading States**: Smooth loading indicators during data fetching
- **Error Handling**: Graceful error management with user feedback
- **Intuitive Navigation**: Easy-to-use category browsing and search
- **Accessibility**: ARIA labels and keyboard navigation support

## 📱 User Experience

### Customer Journey
1. **Browse Menu**: Explore items by category or search
2. **View Details**: See detailed item information and recommendations
3. **Add to Cart**: Select items and quantities
4. **Review Cart**: Check order details and totals
5. **Checkout**: Proceed through secure checkout process
6. **Payment**: Complete payment securely
7. **Confirmation**: Receive order confirmation and receipt

### Key User Features
- **Guest Browsing**: Browse menu without authentication
- **Account Creation**: Quick and easy registration process
- **Order History**: View past orders (authenticated users)
- **Favorites**: Save favorite items for quick reordering
- **Search**: Find dishes quickly with real-time search

## 🚀 Deployment

### Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Environment Setup

1. Set up PostgreSQL database with proper schema
2. Configure environment variables for production
3. Set up authentication providers (optional)
4. Configure payment processing (if implemented)
5. Deploy to your preferred platform (Vercel, Railway, etc.)

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and DATABASE_URL is correct
2. **Authentication**: Verify NEXTAUTH_SECRET and NEXTAUTH_URL are properly set
3. **Port Conflicts**: Customer app runs on port 3001 by default
4. **Cart Issues**: Check browser local storage if cart state is lost
5. **Build Errors**: Run `pnpm check-types` to identify TypeScript issues

### Getting Help

- Check the [CI/CD Documentation](../../docs/CICD.md)
- Review the monorepo README for setup instructions
- Check database schema in `packages/database/`
- Verify API endpoints are responding correctly

## 🧪 Testing

The customer app includes comprehensive testing:

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: End-to-end user journey testing with Playwright
- **Cart Testing**: Shopping cart functionality validation
- **Authentication Testing**: User registration and login flows

## 🤝 Contributing

1. Follow the existing code style and conventions
2. Run tests before submitting pull requests
3. Update documentation for new features
4. Ensure TypeScript compliance with strict mode
5. Test on multiple browsers and device sizes
6. Follow accessibility best practices

## 📊 Performance Optimization

- **Next.js 15**: Latest framework with Turbopack for fast development
- **Image Optimization**: Automatic image optimization for menu items
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: Efficient API response caching
- **Bundle Optimization**: Tree shaking and bundle analysis

## 📄 License

This project is part of the Restaurant Project Full Stack and follows the same licensing terms.

---

**Customer App** - Part of Restaurant Project Full Stack Monorepo

*Serving delicious experiences, one order at a time* 🍽️
