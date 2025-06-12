# Admin Application Test Suite

This directory contains end-to-end tests for the Restaurant Admin application using Playwright.

## Test Structure

### Authentication Tests (`admin-auth.spec.ts`)
- **Purpose**: Validates admin authentication flow and access control
- **Coverage**:
  - Admin sign-in functionality
  - Authentication redirect handling
  - Session persistence
  - Protected route access

### Categories Management Tests (`admin-categories.spec.ts`)
- **Purpose**: Tests category filtering and navigation functionality
- **Coverage**:
  - Category list display
  - Category filtering by selection
  - Item filtering by category
  - "All Categories" functionality

### Items Management Tests (`admin-items-page.spec.ts`)
- **Purpose**: Tests item management operations and navigation
- **Coverage**:
  - Item list display and navigation
  - Item details page access
  - Edit item functionality
  - Dynamic item ID handling

### Search Functionality Tests (`admin-search.spec.ts`)
- **Purpose**: Validates search capabilities across the admin interface
- **Coverage**:
  - Search input functionality
  - Search result filtering
  - Search field behavior and validation

### Create Item Tests (`admin-create.spec.ts`)
- **Purpose**: Tests item creation workflow and form validation
- **Coverage**:
  - Create item button navigation
  - Form field validation and error handling
  - Item creation submission
  - Delete item functionality with confirmation dialogs
  - Real-time form validation

## Key Features Tested

### Robust Selectors
- Uses `data-testid` attributes for reliable element selection
- Fallback selectors for elements without test IDs
- Dynamic ID extraction for database-generated content

### Error Handling
- Comprehensive timeout handling
- Graceful failure recovery
- Detailed error logging and debugging

### Form Validation
- Client-side validation testing
- Real-time error feedback
- Field-specific validation rules
- Character limits and data type validation

### Authentication Flow
- OAuth integration testing
- Session management validation
- Protected route access verification

## Test Configuration

### Prerequisites
- Admin application running on expected port
- Test database seeded with sample data
- Authentication provider configured

### Test Data Dependencies
- Categories: At least 4 categories including "Main Dishes", "Appetizers", "Desserts"
- Items: Multiple items across different categories
- Admin user credentials configured

### Reliability Features
- Network idle waiting for complete page loads
- Element visibility confirmation before interaction
- Proper wait conditions for dynamic content
- Screenshot capture on test failures

## Running Tests

```bash
# Run all admin tests
npx playwright test tests/admin

# Run specific test file
npx playwright test tests/admin/admin-auth.spec.ts

# Run tests with UI mode
npx playwright test tests/admin --ui

# Run tests with debug mode
npx playwright test tests/admin --debug
```

## Best Practices

1. **Wait Strategies**: Always wait for network idle and element visibility before interactions
2. **Dynamic Content**: Use dynamic selectors for database-generated content
3. **Error Recovery**: Implement proper error handling and retry mechanisms
4. **Test Isolation**: Each test starts with a clean state
5. **Meaningful Assertions**: Use descriptive expect statements with proper timeouts

## Troubleshooting

### Common Issues
- **Element Not Found**: Check if `data-testid` attributes are present in components
- **Timeout Errors**: Increase timeout values for slow-loading content
- **Authentication Failures**: Verify OAuth configuration and callback URLs
- **Dynamic Content**: Ensure proper wait conditions for database-loaded content

### Debug Tips
- Use `--headed` flag to see browser interactions
- Add `page.pause()` for interactive debugging
- Check console logs for application errors
- Verify test data seeding before running tests
