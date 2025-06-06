# E2E Testing Documentation

This package contains comprehensive end-to-end (E2E) tests for the Restaurant Project Full Stack using Playwright. The tests cover both admin and customer applications with cross-browser support and mobile testing.

## 🧪 Testing Architecture

```
packages/test/
├── admin/                  # Admin application tests
│   └── admin.spec.ts      # Admin E2E test suite
├── customer/              # Customer application tests
│   └── customer.spec.ts   # Customer E2E test suite
├── setup/                 # Test setup and utilities
│   ├── global-setup.ts    # Global test setup
│   └── global-teardown.ts # Global test cleanup
├── playwright.config.ts   # Playwright configuration
├── package.json          # Test dependencies
└── .env.example          # Environment configuration template
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm package manager
- Both admin and customer applications running locally
- PostgreSQL database for test data

### Setup

1. **Install dependencies**
   ```bash
   cd packages/test
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your test database configuration
   ```

3. **Install Playwright browsers**
   ```bash
   pnpm exec playwright install
   ```

4. **Start applications**
   ```bash
   # From project root
   pnpm dev
   ```

5. **Run tests**
   ```bash
   # Run all tests
   pnpm test

   # Run specific test suite
   pnpm test:admin
   pnpm test:customer

   # Run tests with UI
   pnpm test:ui
   ```

## 📋 Available Commands

```bash
# Run all E2E tests
pnpm test

# Run admin tests only
pnpm test:admin

# Run customer tests only
pnpm test:customer

# Run tests with Playwright UI
pnpm test:ui

# Run tests in headed mode (visible browser)
pnpm test:headed

# Run tests in debug mode
pnpm test:debug

# Generate test report
pnpm test:report

# Update Playwright browsers
pnpm exec playwright install
```

## 🧩 Test Suites

### Admin Application Tests (`admin/admin.spec.ts`)

**Authentication Tests:**
- Login with valid admin credentials
- Error handling for invalid credentials
- Logout functionality
- Session persistence

**Menu Management Tests:**
- Display menu items
- Add new menu items
- Edit existing menu items
- Delete menu items
- Search functionality
- Category filtering
- Availability toggle

**Category Management Tests:**
- Display categories
- Add new categories
- Edit categories
- Delete categories

**Dashboard Tests:**
- Display dashboard metrics
- Navigation between sections
- Responsive design

**Responsive Design Tests:**
- Mobile viewport testing
- Tablet viewport testing
- Touch interaction support

### Customer Application Tests (`customer/customer.spec.ts`)

**Authentication Tests:**
- Public access to menu
- Login/logout functionality
- User registration
- Session management

**Menu Browsing Tests:**
- Display menu items
- Item detail views
- Category filtering
- Search functionality
- No results handling

**Shopping Cart Tests:**
- Add items to cart
- Update item quantities
- Remove items from cart
- Total calculation
- Cart persistence across reloads

**Checkout Process Tests:**
- Authentication requirement
- Order form validation
- Order completion
- Order confirmation

**Order History Tests:**
- Display order history
- Order detail views
- Empty state handling

**User Profile Tests:**
- Display profile information
- Update profile details
- Change password

**Performance Tests:**
- Page load times
- Cart responsiveness with many items

## 🔧 Configuration

### Playwright Configuration (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './admin',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      dependencies: ['setup'],
    },
  ],
});
```

### Environment Variables

```bash
# Test Database
DATABASE_URL="postgresql://username:password@localhost:5432/restaurant_test_db"

# Application URLs
ADMIN_BASE_URL="http://localhost:3002"
CUSTOMER_BASE_URL="http://localhost:3001"

# Test User Credentials
TEST_ADMIN_EMAIL="admin@restaurant.test"
TEST_ADMIN_PASSWORD="admin123"
TEST_USER_EMAIL="user@restaurant.test"
TEST_USER_PASSWORD="user123"

# Test Configuration
HEADLESS="true"
SLOW_MO="0"
TIMEOUT="30000"
```

## 🔍 Test Data Management

### Global Setup (`setup/global-setup.ts`)

The global setup script runs before all tests and:

1. **Database Preparation**
   - Connects to test database
   - Runs migrations
   - Seeds test data

2. **Test User Creation**
   - Creates admin test user
   - Creates customer test user
   - Sets up test menu items and categories

3. **Application Health Check**
   - Verifies both applications are running
   - Confirms database connectivity

### Global Teardown (`setup/global-teardown.ts`)

The global teardown script runs after all tests and:

1. **Database Cleanup**
   - Removes test data
   - Resets database state
   - Closes database connections

2. **Resource Cleanup**
   - Clears temporary files
   - Releases system resources

## 📊 Browser Coverage

The test suite runs across multiple browsers and devices:

### Desktop Browsers
- **Chromium** (Latest Chrome)
- **Firefox** (Latest Firefox)
- **WebKit** (Safari engine)

### Mobile Devices
- **Mobile Chrome** (Pixel 5 viewport)
- **Mobile Safari** (iPhone 12 viewport)

### Viewport Testing
- **Desktop**: 1280x720
- **Tablet**: 768x1024
- **Mobile**: 375x667

## 🎯 Test Strategies

### Page Object Model
Tests use a structured approach with:
- Reusable page components
- Centralized selectors
- Shared utilities

### Data-Driven Testing
- Dynamic test data generation
- Database state verification
- Cross-browser compatibility

### Visual Testing
- Screenshot comparisons
- Layout validation
- Responsive design verification

## 🚨 Error Handling

### Retry Strategy
- **CI Environment**: 2 retries per test
- **Local Development**: No retries
- **Flaky Test Detection**: Automatic retry on failure

### Debugging Features
- **Trace Collection**: On first retry
- **Video Recording**: On failure
- **Screenshot Capture**: On test failure
- **Console Logs**: Always captured

### Timeout Management
- **Global Timeout**: 30 seconds
- **Action Timeout**: 10 seconds
- **Navigation Timeout**: 15 seconds

## 📈 Performance Testing

### Metrics Tracked
- **Page Load Time**: < 3 seconds
- **Cart Response Time**: < 1 second
- **Search Response**: < 500ms
- **Navigation Speed**: < 200ms

### Load Testing
- Multiple items in cart
- Concurrent user simulation
- Database query optimization

## 🔒 Security Testing

### Authentication Tests
- Session management
- Unauthorized access prevention
- Password security
- CSRF protection

### Input Validation
- XSS prevention
- SQL injection protection
- Form validation
- File upload security

## 📋 Test Reporting

### HTML Reports
Generated automatically with:
- Test execution summary
- Failure screenshots
- Video recordings
- Trace files

### CI/CD Integration
- GitHub Actions integration
- Slack notifications
- Test result artifacts
- Coverage reports

## 🛠️ Maintenance

### Regular Tasks
- Update Playwright browsers
- Review test stability
- Update test data
- Performance optimization

### Best Practices
- Keep tests independent
- Use meaningful test names
- Maintain test data isolation
- Regular cleanup routines

## 🤝 Contributing

### Adding New Tests
1. Follow existing test structure
2. Use descriptive test names
3. Include both positive and negative cases
4. Add mobile viewport tests

### Test Guidelines
- Tests should be deterministic
- Avoid hard-coded waits
- Use proper assertions
- Clean up test data

### Code Review
- Peer review for all test changes
- Performance impact assessment
- Cross-browser compatibility check
- Documentation updates

## 🐛 Troubleshooting

### Common Issues

**Tests timing out:**
```bash
# Increase timeout in playwright.config.ts
timeout: 60000
```

**Browser installation issues:**
```bash
# Reinstall browsers
pnpm exec playwright install --force
```

**Database connection errors:**
```bash
# Check database is running
pg_isready -h localhost -p 5432

# Verify environment variables
cat .env
```

**Application not running:**
```bash
# Verify applications are accessible
curl http://localhost:3001
curl http://localhost:3002
```

### Debug Mode
```bash
# Run specific test in debug mode
pnpm exec playwright test customer.spec.ts --debug

# Run with visible browser
pnpm exec playwright test --headed

# Generate trace
pnpm exec playwright test --trace on
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Test Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)

---

**Happy Testing! 🧪**
