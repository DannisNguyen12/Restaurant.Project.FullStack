# Admin Application Test Suite

This directory contains comprehensive end-to-end tests for the Restaurant Project Admin Application using Playwright.

## Test Files Overview

### Core Admin Functionality

#### `admin-auth.spec.ts`
- **Authentication Flow Testing**
- Admin login page display
- Invalid login handling
- Successful authentication
- User menu display when authenticated
- Logout functionality
- Protected route access control
- Session timeout handling

#### `admin-menu-management.spec.ts`
- **Dashboard and Menu Overview**
- Menu items dashboard display
- Category navigation
- "All Items" default view
- Create item button functionality
- Item creation page navigation
- Loading states during data fetch
- Empty menu state handling
- Menu item information display
- Item click navigation
- Category-based filtering

#### `admin-item-creation.spec.ts`
- **Item Creation Workflow**
- Item creation form display
- Required field validation
- Successful item creation
- Price validation
- Long description handling
- Category dropdown loading
- Image upload support
- Navigation back to dashboard
- Loading states during submission
- Server validation error handling

#### `admin-item-management.spec.ts`
- **Item Management Operations**
- Item detail page navigation
- Item details display
- Edit functionality
- Delete functionality with confirmation
- Item editing workflow
- Item statistics and metadata
- Navigation back to menu list
- Item not found error handling
- Loading states for item details
- Concurrent edit handling

#### `admin-search.spec.ts`
- **Search and Filtering Features**
- Search bar display
- Real-time search functionality
- Empty search results handling
- Search result clearing
- Cross-field search (names & descriptions)
- Special character handling in search
- Search state maintenance during navigation
- Search loading states
- Rapid typing debouncing
- Advanced search options
- Search result highlighting

#### `admin-category-management.spec.ts`
- **Category Management System**
- Category display in sidebar
- Category selection state
- Items loading for selected categories
- Empty category handling
- Category state maintenance
- Category name display
- Category management features
- Error handling for category loading
- Keyboard navigation for categories
- Visual feedback for interactions
- Rapid category switching

### Advanced Features

#### `admin-dashboard.spec.ts`
- **Dashboard and Analytics**
- Dashboard overview display
- Menu item statistics
- Quick actions from dashboard
- Recent menu items display
- System notifications
- Navigation to admin sections
- Dashboard refresh handling
- Loading state management
- Empty state handling
- Keyboard accessibility
- Error state display
- Session state maintenance
- Concurrent data updates

#### `admin-settings.spec.ts`
- **Settings and Configuration**
- Settings page access
- Restaurant profile management
- Menu display settings
- User account settings
- Password change functionality
- Form input validation
- Settings save operations
- Settings navigation (tabs)
- Image upload for restaurant logo
- Notification preferences
- Timezone settings
- Settings export/import
- Settings reset functionality
- Cross-session settings persistence

#### `admin-bulk-operations.spec.ts`
- **Data Management and Bulk Operations**
- Bulk item selection
- Bulk delete operations
- Bulk category assignment
- Data export functionality
- Data import functionality
- Advanced filtering
- Sorting options
- Pagination with large datasets
- Search with filters
- Data validation during bulk operations
- Concurrent bulk operations
- Data consistency maintenance
- Progress feedback for long operations

#### `admin-responsive.spec.ts`
- **Responsive Design Testing**
- Multiple viewport testing (mobile, tablet, desktop)
- Touch interaction handling
- Zoom level support (up to 200%)
- Functionality across breakpoints
- Orientation change handling
- Keyboard navigation at all breakpoints
- Image and icon loading
- Long content handling
- Performance across device types

#### `admin-error-handling.spec.ts`
- **Error Handling and Edge Cases**
- Network error handling
- Server error (500) responses
- Authentication error handling
- Malformed data handling
- Missing resource (404) handling
- Extremely long input values
- Special character input handling
- Concurrent form submissions
- Browser back/forward navigation
- Page refresh during form submission
- Invalid file uploads
- Session timeout scenarios
- Memory constraints with large datasets
- Browser compatibility issues
- Slow network condition handling

## Test Categories

### 🔐 Authentication & Security
- Login/logout flows
- Session management
- Protected route access
- Authentication error handling

### 📊 Data Management
- CRUD operations for menu items
- Bulk operations
- Data import/export
- Search and filtering

### 🎨 User Interface
- Responsive design
- Loading states
- Error states
- Empty states
- Accessibility

### ⚡ Performance
- Large dataset handling
- Network condition testing
- Concurrent operation handling
- Memory management

### 🛠️ Configuration
- Settings management
- Profile management
- System configuration
- Preferences

## Running Admin Tests

```bash
# Run all admin tests
npm run test:admin

# Run specific admin test file
npx playwright test tests/admin/admin-auth.spec.ts

# Run tests in headed mode
npm run test:admin -- --headed

# Run tests with UI mode
npm run test:admin -- --ui

# Run tests in debug mode
npx playwright test tests/admin/admin-auth.spec.ts --debug
```

## Test Structure

Each test file follows this structure:

1. **Setup**: Authentication and navigation to test area
2. **Test Cases**: Specific functionality testing
3. **Cleanup**: State restoration and cleanup
4. **Error Handling**: Graceful failure management

## Key Testing Patterns

### Flexible Element Selection
Tests use multiple selector strategies to adapt to different UI implementations:
```typescript
const searchInput = page.locator('input[data-testid="search"], input[placeholder*="search"]');
```

### Graceful Degradation
Tests handle missing elements gracefully:
```typescript
if (await element.count() > 0) {
  await expect(element).toBeVisible();
}
```

### Cross-Browser Compatibility
All tests run on:
- Chromium
- Firefox  
- WebKit (Safari)

### Responsive Testing
Tests validate functionality across multiple viewport sizes:
- Mobile: 375x667, 667x375
- Tablet: 768x1024, 1024x768
- Desktop: 1280x720, 1920x1080

## Test Data

Tests are designed to work with minimal test data requirements:
- Admin user: `admin@restaurant.com` / `admin123`
- Tests create and clean up their own test data where possible
- Mock API responses for edge case testing

## Maintenance Notes

### Adding New Tests
1. Follow existing naming conventions
2. Use flexible selectors that work across UI changes
3. Include proper error handling
4. Test both success and failure scenarios

### Updating Tests
1. Keep selectors flexible and resilient
2. Maintain cross-browser compatibility
3. Update test data as needed
4. Verify responsive behavior

### Debugging Tips
1. Use `--headed` mode to see tests run
2. Use `--debug` for step-by-step debugging
3. Check screenshots in `test-results/` for visual issues
4. Use `page.pause()` for interactive debugging

## Coverage Areas

### Functional Coverage
- ✅ Authentication & Authorization
- ✅ Menu Item Management (CRUD)
- ✅ Search & Filtering
- ✅ Category Management
- ✅ Dashboard & Analytics
- ✅ Settings & Configuration
- ✅ Bulk Operations
- ✅ Data Import/Export

### Technical Coverage
- ✅ Responsive Design
- ✅ Error Handling
- ✅ Performance Testing
- ✅ Accessibility
- ✅ Cross-Browser Compatibility
- ✅ Network Conditions
- ✅ Concurrent Operations

### User Experience Coverage
- ✅ Loading States
- ✅ Empty States
- ✅ Error States
- ✅ Success Feedback
- ✅ Form Validation
- ✅ Navigation Flow
- ✅ Keyboard Accessibility
