# Contributing to Restaurant Project Full Stack

Thank you for your interest in contributing to our restaurant management system! This document provides guidelines and instructions for contributing.

## 🛠️ Development Environment Setup

1. **Fork the repository** to your GitHub account
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Restaurant.Project.FullStack.git
   cd Restaurant.Project.FullStack
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Set up your database**:

   ```bash
   # Create a .env file with your database connection
   echo "DATABASE_URL=postgresql://username:password@localhost:5432/restaurant_db" > .env

   # Push the schema to your database
   pnpm --filter database db:push

   # Seed the database with initial data
   pnpm --filter database db:seed
   ```

5. **Start the development servers**:

   ```bash
   # Run both customer and admin apps
   pnpm dev

   # Or run specific apps
   pnpm --filter customer dev
   pnpm --filter admin dev
   ```

## 🌿 Branching Strategy

- **`main`/`master`**: Production-ready code
- **`dev`**: Development branch, main integration branch
- **`feature/*`**: For new features
- **`bugfix/*`**: For bug fixes
- **`hotfix/*`**: For urgent production fixes

Example:

```bash
# Create a feature branch
git checkout -b feature/add-payment-integration

# Create a bugfix branch
git checkout -b bugfix/fix-cart-calculation
```

## 🧪 Testing

We use Playwright for end-to-end testing:

```bash
# Install Playwright browsers (first time only)
pnpm --filter test exec playwright install

# Run all tests
pnpm --filter test test

# Run specific tests
pnpm --filter test test tests/customer/item-detail.spec.ts

# Run tests in headed mode (to see the browser)
pnpm --filter test test:headed
```

Always ensure tests pass before submitting a pull request.

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear and structured commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code changes that neither fix bugs nor add features
- **test**: Adding or modifying tests
- **chore**: Changes to the build process or tooling

Examples:

```
feat(cart): add ability to save cart for later

fix(auth): resolve sign-in issue with Google provider

docs(readme): update installation instructions
```

## 🔄 Pull Request Process

1. **Create a new branch** from `dev` for your changes
2. **Make your changes** and commit them following our commit guidelines
3. **Write or update tests** for your changes
4. **Run the test suite** to ensure everything passes
5. **Push your branch** and create a pull request to the `dev` branch
6. **Fill out the PR template** with details about your changes
7. **Request reviews** from team members
8. **Address any feedback** from reviewers
9. Once approved, a maintainer will merge your PR

## 🚀 CI/CD Pipeline

Our GitHub Actions CI/CD pipeline will automatically:

1. Run linting and type checking
2. Build the applications
3. Run tests
4. Deploy to staging (for `dev` branch) or production (for `main`/`master` branch)

Make sure your code passes all CI checks before it can be merged.

## 📚 Code Style and Quality

We enforce code quality with:

- **ESLint**: For code quality rules
- **Prettier**: For code formatting
- **TypeScript**: With strict type checking
- **Husky**: For pre-commit hooks

To manually check your code:

```bash
# Run linting
pnpm lint

# Check types
pnpm check-types

# Format code
pnpm format
```

## 🙋‍♀️ Getting Help

If you need help, you can:

- Check the project documentation
- Create an issue with the "question" label
- Reach out to project maintainers

## 🎯 Picking an Issue

- Issues labeled `good first issue` are perfect for newcomers
- Issues labeled `help wanted` are actively seeking contributors
- Check the project roadmap for larger initiatives

Thank you for contributing to our project! 🍽️
