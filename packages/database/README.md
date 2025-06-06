# Database Package

The shared database package for the Restaurant Project Full Stack, built with Prisma ORM and PostgreSQL. This package provides type-safe database operations, schema management, and utilities shared across all applications.

## 🏗️ Architecture

```
packages/database/
├── prisma/
│   └── schema.prisma       # Database schema definition
├── generated/
│   └── prisma/            # Generated Prisma Client
├── src/
│   ├── index.ts           # Main database client export
│   ├── seed.ts            # Database seeding script
│   └── encrypt.ts         # Password encryption utilities
├── package.json           # Package configuration
└── tsconfig.json         # TypeScript configuration
```

## 📊 Database Schema

### Core Entities

The database schema includes the following main entities optimized for restaurant operations:

#### **Category**
Represents menu categories for organizing items.

```prisma
model Category {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  items Item[]
}
```

**Fields:**
- `id`: Primary key, auto-incrementing integer
- `name`: Unique category name (e.g., "Appetizer", "Main Course", "Dessert")
- `createdAt/updatedAt`: Automatic timestamps

#### **Item**
Represents dishes/products on the restaurant menu.

```prisma
model Item {
  id              Int         @id @default(autoincrement())
  name            String
  description     String?
  fullDescription String?
  price           Float
  image           String?
  ingredients     Json        // Array of strings or objects
  servingTips     Json
  recommendations Json
  categoryId      Int?
  category        Category?   @relation(fields: [categoryId], references: [id])
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  likes      Like[]
  orderItems OrderItem[]
}
```

**Fields:**
- `id`: Primary key
- `name`: Item name (e.g., "Pho Bo", "Spring Rolls")
- `description`: Short description for menu display
- `fullDescription`: Detailed description for item pages
- `price`: Item price as decimal
- `image`: Optional image URL
- `ingredients`: JSON array of ingredients
- `servingTips`: JSON object with serving recommendations
- `recommendations`: JSON object with pairing suggestions
- `categoryId`: Foreign key to Category

#### **User**
Represents both customers and admin users.

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  password  String
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  orders Order[]
  likes  Like[]
}

enum UserRole {
  USER
  ADMIN
}
```

**Fields:**
- `id`: Primary key
- `email`: Unique email address for authentication
- `name`: User's display name
- `password`: Encrypted password using bcryptjs
- `role`: USER (customer) or ADMIN (staff)

#### **Order**
Represents customer orders with status tracking.

```prisma
model Order {
  id           Int          @id @default(autoincrement())
  customerName String
  tableNumber  Int?
  total        Float
  status       OrderStatus  @default(COMPLETED)
  items        OrderItem[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  userId       Int?
  user         User?        @relation(fields: [userId], references: [id])
}

enum OrderStatus {
  PENDING
  PREPARING
  READY
  COMPLETED
  CANCELLED
}
```

**Fields:**
- `id`: Primary key
- `customerName`: Name for the order
- `tableNumber`: Optional table assignment
- `total`: Order total amount
- `status`: Current order status
- `userId`: Optional link to registered user

#### **OrderItem**
Junction table for order items with quantities.

```prisma
model OrderItem {
  id       Int    @id @default(autoincrement())
  quantity Int
  itemId   Int
  item     Item   @relation(fields: [itemId], references: [id])
  orderId  Int
  order    Order  @relation(fields: [orderId], references: [id])
}
```

#### **Like**
User preferences for menu items.

```prisma
model Like {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  itemId    Int
  item      Item     @relation(fields: [itemId], references: [id])
  type      LikeType
  createdAt DateTime @default(now())

  @@unique([userId, itemId])
}

enum LikeType {
  LIKE
  DISLIKE
}
```

## 🚀 Quick Start

### Prerequisites

- **PostgreSQL**: Database server running locally or remotely
- **Node.js**: >= 18.0.0
- **pnpm**: Package manager

### Setup

1. **Install dependencies**
   ```bash
   cd packages/database
   pnpm install
   ```

2. **Configure environment variables**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Edit .env with your database configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/restaurant_db"
   BCRYPT_COST_FACTOR="12"
   ```

3. **Generate Prisma Client**
   ```bash
   pnpm prisma generate
   ```

4. **Run database migrations**
   ```bash
   pnpm prisma migrate dev
   ```

5. **Seed the database** (optional)
   ```bash
   pnpm db:seed
   ```

## 📋 Available Commands

```bash
# Generate Prisma Client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# Deploy migrations to production
pnpm prisma migrate deploy

# Reset database (development only)
pnpm prisma migrate reset

# Open Prisma Studio (GUI)
pnpm prisma studio

# Seed database with sample data
pnpm db:seed

# Create new migration
pnpm prisma migrate dev --name "migration_name"

# Validate schema
pnpm prisma validate

# Format schema file
pnpm prisma format
```

## 🔧 Usage

### Basic Database Operations

```typescript
import { prisma } from 'database';

// Create a new category
const category = await prisma.category.create({
  data: {
    name: 'Appetizers'
  }
});

// Get all menu items with category
const items = await prisma.item.findMany({
  include: {
    category: true,
    likes: true
  }
});

// Create a new order
const order = await prisma.order.create({
  data: {
    customerName: 'John Doe',
    total: 25.99,
    status: 'PENDING',
    items: {
      create: [
        {
          quantity: 2,
          itemId: 1
        }
      ]
    }
  },
  include: {
    items: {
      include: {
        item: true
      }
    }
  }
});

// Search items by name
const searchResults = await prisma.item.findMany({
  where: {
    name: {
      contains: 'pho',
      mode: 'insensitive'
    }
  },
  include: {
    category: true
  }
});
```

### User Authentication

```typescript
import { encryptPassword } from 'database/src/encrypt';

// Create new user with encrypted password
const hashedPassword = await encryptPassword('userpassword');
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    password: hashedPassword,
    role: 'USER'
  }
});

// Find user by email for authentication
const user = await prisma.user.findUnique({
  where: {
    email: 'user@example.com'
  }
});
```

### Complex Queries

```typescript
// Get popular items (most liked)
const popularItems = await prisma.item.findMany({
  include: {
    likes: {
      where: {
        type: 'LIKE'
      }
    },
    category: true,
    _count: {
      select: {
        likes: {
          where: {
            type: 'LIKE'
          }
        }
      }
    }
  },
  orderBy: {
    likes: {
      _count: 'desc'
    }
  },
  take: 10
});

// Get user's order history
const userOrders = await prisma.order.findMany({
  where: {
    userId: userId
  },
  include: {
    items: {
      include: {
        item: {
          include: {
            category: true
          }
        }
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
});

// Get category with item count
const categoriesWithCount = await prisma.category.findMany({
  include: {
    _count: {
      select: {
        items: true
      }
    }
  }
});
```

## 🌱 Database Seeding

The database includes a comprehensive seeding script that populates the database with sample data for development and testing.

### Seeded Data

**Categories:**
- Appetizer
- Main Course
- Dessert

**Sample Items:**
- **Pho Bo**: Traditional Vietnamese beef noodle soup
- **Spring Rolls**: Fresh vegetables wrapped in rice paper
- **Banh Mi**: Vietnamese sandwich with various fillings
- **Che Ba Mau**: Traditional tri-color dessert

**Test Users:**
- **Admin User**: `admin@restaurant.test` (password: `admin123`)
- **Customer User**: `user@restaurant.test` (password: `user123`)

### Running the Seed Script

```bash
# Seed database with sample data
pnpm db:seed

# The script will:
# 1. Clear existing data (development only)
# 2. Create categories
# 3. Create sample menu items
# 4. Create test users
# 5. Create sample orders and likes
```

## 🔒 Security Features

### Password Encryption

The database package includes secure password hashing using bcryptjs:

```typescript
// encrypt.ts
export async function encryptPassword(password: string): Promise<string> {
  const saltRounds = parseInt(process.env.BCRYPT_COST_FACTOR!);
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}
```

**Security Configuration:**
- **Salt Rounds**: Configurable via `BCRYPT_COST_FACTOR` environment variable
- **Recommended Value**: 12 for production (balance of security and performance)
- **Password Validation**: Server-side validation before hashing

### Environment Variables

```bash
# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/restaurant_db"

# Security settings
BCRYPT_COST_FACTOR="12"  # Higher = more secure but slower

# Optional: Database pool settings
DATABASE_POOL_SIZE="10"
DATABASE_TIMEOUT="30000"
```

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   # Production database URL
   DATABASE_URL="postgresql://username:password@prod-host:5432/restaurant_prod"
   
   # Security settings
   BCRYPT_COST_FACTOR="14"  # Higher for production
   ```

2. **Deploy Migrations**
   ```bash
   pnpm prisma migrate deploy
   ```

3. **Generate Client for Production**
   ```bash
   pnpm prisma generate
   ```

### Database Backup

```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql $DATABASE_URL < backup_file.sql
```

## 📈 Performance Optimization

### Database Indexes

The schema includes optimized indexes for common queries:

```prisma
// Automatic indexes on:
// - Primary keys (id fields)
// - Unique constraints (email, category name)
// - Foreign keys (categoryId, userId, etc.)

// Additional indexes for performance:
@@index([categoryId])     // Item filtering by category
@@index([createdAt])      // Order sorting
@@index([email])          // User authentication
@@index([status])         // Order status filtering
```

### Query Optimization

```typescript
// Use select to limit returned fields
const items = await prisma.item.findMany({
  select: {
    id: true,
    name: true,
    price: true,
    category: {
      select: {
        name: true
      }
    }
  }
});

// Use cursor-based pagination for large datasets
const items = await prisma.item.findMany({
  take: 20,
  skip: 1,
  cursor: {
    id: lastItemId
  },
  orderBy: {
    id: 'asc'
  }
});
```

### Connection Pooling

```typescript
// Configure connection pool in production
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Use connection pooling for serverless
const prisma = new PrismaClient().$extends(withAccelerate());
```

## 🧪 Testing

### Test Database Setup

```bash
# Create test database
createdb restaurant_test_db

# Set test environment
DATABASE_URL="postgresql://username:password@localhost:5432/restaurant_test_db"

# Run migrations for test database
pnpm prisma migrate dev

# Seed test data
pnpm db:seed
```

### Integration Testing

```typescript
// Example test helper
export async function setupTestData() {
  // Clear test database
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.like.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  
  // Create test data
  const category = await prisma.category.create({
    data: { name: 'Test Category' }
  });
  
  return { category };
}

export async function cleanupTestData() {
  // Clean up after tests
  await prisma.$disconnect();
}
```

## 🔍 Monitoring

### Database Health Checks

```typescript
// Health check endpoint
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}
```

### Query Logging

```typescript
// Enable query logging in development
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Custom logging
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});
```

## 🐛 Troubleshooting

### Common Issues

**Connection Errors:**
```bash
# Check database is running
pg_isready -h localhost -p 5432

# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

**Migration Issues:**
```bash
# Reset migrations (development only)
pnpm prisma migrate reset

# Check migration status
pnpm prisma migrate status

# Fix migration conflicts
pnpm prisma migrate resolve --applied "migration_name"
```

**Schema Validation:**
```bash
# Validate schema
pnpm prisma validate

# Check for drift between schema and database
pnpm prisma db pull
```

**Performance Issues:**
```bash
# Analyze slow queries
EXPLAIN ANALYZE SELECT * FROM "Item" WHERE "name" ILIKE '%search%';

# Check database statistics
psql $DATABASE_URL -c "SELECT * FROM pg_stat_user_tables;"
```

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Database Security Guidelines](https://www.prisma.io/docs/guides/database/database-security)

## 🤝 Contributing

### Schema Changes

1. **Modify schema.prisma**
2. **Create migration**: `pnpm prisma migrate dev --name "descriptive_name"`
3. **Update seed script** if needed
4. **Regenerate client**: `pnpm prisma generate`
5. **Update documentation**

### Best Practices

- **Use descriptive migration names**
- **Test migrations on staging first**
- **Backup before production migrations**
- **Document breaking changes**
- **Update TypeScript types**

---

**Database Package - The foundation of Restaurant Project Full Stack** 🗄️
