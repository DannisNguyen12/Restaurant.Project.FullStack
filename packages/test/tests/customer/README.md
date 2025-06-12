# Customer Test Suite

This directory contains comprehensive end-to-end tests for the customer-facing application of the restaurant ordering system. The tests use Playwright to simulate user interactions and validate the complete customer journey.

## Test Files Overview

### 📋 `customer-homepage.spec.ts`
Tests the main customer homepage functionality including:
- Menu item display and filtering
- Category navigation
- Item search functionality
- Add to cart interactions
- Basic navigation elements

### 🛒 `customer-cart.spec.ts`
Comprehensive cart functionality tests covering:
- Adding items to cart
- Quantity management (increase/decrease)
- Item removal from cart
- Cart persistence across page refreshes
- Clear cart functionality
- Empty cart states

### 💳 `customer-payment.spec.ts`
Complete payment flow and form validation tests including:
- **Authentication**: Redirect to signin when not authenticated
- **Cart Integration**: Order summary display, cart clearing after successful payment

### 📚 `customer-order-history.spec.ts`
Order history page functionality tests covering:
- **Authentication**: Redirect to signin when not authenticated, loading states
- **Empty State**: Display when no orders exist, navigation to menu
- **Order Display**: Correct order information, item details, status colors, date formatting

## Test Coverage Areas

### 🔐 Authentication & Authorization
- Redirect to signin when accessing protected pages
- Session handling and loading states
- Callback URL preservation for post-login navigation

### 🛍️ Shopping Experience
- Menu browsing and item discovery
- Search and filtering functionality
- Cart management and persistence
- Checkout process validation

### 💰 Payment Processing
- Comprehensive form validation
- Input formatting and user experience
- Error handling and user feedback
- Order creation and confirmation

### 📱 User Interface
- Responsive design testing
- Loading states and user feedback
- Error message display
- Navigation and routing

### 🔄 Data Persistence
- localStorage cart persistence
- Session management
- Order data handling

## Test Structure and Patterns

### Common Test Patterns

#### Setup and Cleanup
```typescript
test.beforeEach(async ({ page }) => {
  // Navigate to starting page
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Clear state
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});
```

#### API Mocking
```typescript
await page.route('/api/orders', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockData),
  });
});
```

#### Cart Setup
```typescript
await page.evaluate(() => {
  const cartItems = [
    {
      id: 1,
      name: 'Test Item',
      price: 15.99,
      quantity: 2,
      image: '/test-image.jpg'
    }
  ];
  localStorage.setItem('cart-items', JSON.stringify(cartItems));
});
```

### Test Organization

Tests are organized into logical groups using `test.describe()`:
- **Authentication/Authorization tests**
- **Form validation tests**
- **Happy path scenarios**
- **Error handling scenarios**
- **Edge cases and boundary conditions**

## Running the Tests

### All Customer Tests
```bash
npx playwright test tests/customer/
```

### Specific Test Files
```bash
# Homepage tests
npx playwright test tests/customer/customer-homepage.spec.ts

# Cart functionality tests
npx playwright test tests/customer/customer-cart.spec.ts

# Payment flow tests
npx playwright test tests/customer/customer-payment.spec.ts

# Order history tests
npx playwright test tests/customer/customer-order-history.spec.ts
```

### Running in Different Modes
```bash
# Headed mode (visible browser)
npx playwright test tests/customer/ --headed

# Debug mode (step through tests)
npx playwright test tests/customer/ --debug

# Specific browser
npx playwright test tests/customer/ --project=chromium
```

## Key Test Strategies

### 🔍 Reliable Element Selection
- Uses `data-testid` attributes for critical elements
- Falls back to role-based selectors for better accessibility testing
- Avoids fragile text-based selectors where possible

### ⏱️ Proper Wait Conditions
- Uses `waitForLoadState('networkidle')` for initial page loads
- Implements proper waiting for dynamic content
- Handles loading states and transitions

### 🎭 Comprehensive Mocking
- Mocks external API calls for predictable testing
- Simulates various response scenarios (success, error, slow responses)
- Tests both happy paths and error conditions

### 📱 Cross-Platform Testing
- Tests responsive design with different viewport sizes
- Validates mobile-specific interactions
- Ensures accessibility across devices

## Error Scenarios Covered

### Network and API Errors
- Connection failures
- Server errors (500, 400, etc.)
- Unauthorized access (401)
- Timeout scenarios

### User Input Validation
- Required field validation
- Format validation (email, phone, card numbers)
- Range validation (expiry dates, quantities)
- Real-time validation feedback

### State Management
- Cart persistence across page refreshes
- Session timeouts
- Data synchronization issues

## Best Practices Implemented

### 🧪 Test Isolation
- Each test starts with a clean state
- No dependencies between tests
- Proper cleanup after each test

### 🔄 DRY Principles
- Reusable helper functions for common actions
- Shared mock data and setup patterns
- Consistent error handling patterns

### 📝 Clear Test Names
- Descriptive test names that explain what is being tested
- Logical grouping of related tests
- Clear assertion messages

### 🚀 Performance Considerations
- Efficient use of page.route() for API mocking
- Proper wait strategies to avoid flaky tests
- Parallel test execution where possible

## Future Enhancements

### Additional Test Coverage
- Integration with real payment processors
- Performance testing under load
- Cross-browser compatibility testing
- Accessibility compliance testing

### Enhanced Mocking
- More sophisticated API response simulation
- Database state simulation
- Third-party service integration testing

### Reporting and Monitoring
- Test result analytics
- Performance metrics tracking
- Automated test failure analysis

## Troubleshooting Common Issues

### Test Timing Issues
- Increase timeout values for slow operations
- Use proper wait conditions instead of fixed delays
- Check for race conditions in async operations

### Element Selection Issues
- Verify element selectors in browser dev tools
- Check for dynamic content that might not be immediately available
- Use more specific selectors when dealing with similar elements

### API Mocking Issues
- Ensure route patterns match exactly
- Verify mock data structure matches API responses
- Check for proper content-type headers in mocked responses

This test suite provides comprehensive coverage of the customer application functionality, ensuring a reliable and user-friendly experience for restaurant customers.
