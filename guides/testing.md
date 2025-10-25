# Testing Guide

This document outlines the testing strategy and practices for the Zap Studio monorepo, which uses [Vitest](https://vitest.dev/) for unit and integration testing.

## Overview

We use Vitest because it's:
- **Fast** - Lightning-fast test execution with smart parallelization
- **Modern** - First-class TypeScript and ESM support
- **Compatible** - Jest-compatible API, easy migration path
- **Integrated** - Works seamlessly with Vite and our build tools

## Project Structure

```
packages/
  your-package/
    src/
      index.ts
      utils.ts
      types/
    tests/
      index.test.ts
      utils.test.ts
    vitest.config.ts
    coverage/
```

## Configuration

### Package-Level Config

Each package has a `vitest.config.ts`:

```typescript
import { config } from "@zap-studio/vitest-config";
import { defineConfig } from "vitest/config";

export default defineConfig({
  ...config,
  // Add package-specific overrides here
});
```

### Shared Config

The shared Vitest config is in `configs/vitest-config/src/index.ts`:

```typescript
export const config = {
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.config.ts",
        "**/*.test.ts",
      ],
    },
  },
};
```

## Running Tests

### Run All Tests

From the monorepo root:

```bash
pnpm test
```

This uses Turborepo to run tests across all packages in parallel.

### Run Tests for a Specific Package

```bash
cd packages/your-package
pnpm test
```

### Watch Mode

Run tests in watch mode for active development:

```bash
# From root
pnpm test:watch

# From package
cd packages/your-package
pnpm test:watch
```

### Run Tests with Coverage

```bash
pnpm test -- --coverage
# or
pnpm test:coverage # from root
```

Coverage reports are generated in each package's `coverage/` directory.

## Best Practices

### 1. Test Behavior, Not Implementation

**Good:**
```typescript
it("should add user to waitlist", async () => {
  const result = await waitlist.add("user@example.com");
  expect(result.success).toBe(true);
});
```

**Bad:**
```typescript
it("should call internal _addToDatabase method", async () => {
  const spy = vi.spyOn(waitlist, "_addToDatabase");
  await waitlist.add("user@example.com");
  expect(spy).toHaveBeenCalled();
});
```

### 2. Use Descriptive Test Names

**Good:**
```typescript
it("should throw FetchError when API returns 404", () => {
  // test
});
```

**Bad:**
```typescript
it("error test", () => {
  // test
});
```

### 3. Arrange-Act-Assert Pattern

```typescript
it("should calculate total price with discount", () => {
  // Arrange
  const cart = new ShoppingCart();
  cart.addItem({ price: 100, quantity: 2 });
  const discount = 0.1;

  // Act
  const total = cart.calculateTotal(discount);

  // Assert
  expect(total).toBe(180); // 200 - 10% = 180
});
```

### 4. Test Edge Cases

Always test:
- Empty inputs
- Null/undefined values
- Boundary conditions
- Error conditions

```typescript
describe("divide", () => {
  it("should divide two positive numbers", () => {
    expect(divide(10, 2)).toBe(5);
  });

  it("should handle negative numbers", () => {
    expect(divide(-10, 2)).toBe(-5);
  });

  it("should throw when dividing by zero", () => {
    expect(() => divide(10, 0)).toThrow("Cannot divide by zero");
  });

  it("should handle decimal results", () => {
    expect(divide(10, 3)).toBeCloseTo(3.333, 2);
  });
});
```

### 5. Keep Tests Independent

Each test should be independent and not rely on other tests:

```typescript
// Bad - tests depend on execution order
describe("counter", () => {
  let count = 0;

  it("should increment", () => {
    count++;
    expect(count).toBe(1);
  });

  it("should increment again", () => {
    count++;
    expect(count).toBe(2); // Breaks if tests run out of order
  });
});

// Good - tests are independent
describe("counter", () => {
  it("should increment from zero", () => {
    const counter = new Counter();
    counter.increment();
    expect(counter.value).toBe(1);
  });

  it("should increment from any value", () => {
    const counter = new Counter(5);
    counter.increment();
    expect(counter.value).toBe(6);
  });
});
```

### 6. Use beforeEach for Setup

```typescript
describe("database operations", () => {
  let db: Database;

  beforeEach(() => {
    db = new Database();
    db.connect();
  });

  afterEach(() => {
    db.disconnect();
  });

  it("should insert records", async () => {
    await db.insert({ id: 1, name: "Test" });
    // test
  });
});
```

### 7. Mock External Dependencies

Don't make real API calls or database queries in tests:

```typescript
import { vi } from "vitest";

// Mock the entire module
vi.mock("./api", () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: "Test User" }),
}));

// Or mock individual functions
const mockFetch = vi.fn();
global.fetch = mockFetch;
```

### 8. Test Async Code Properly

```typescript
// Using async/await
it("should fetch data asynchronously", async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});

// Using promises
it("should reject with error", () => {
  return expect(fetchData()).rejects.toThrow("Network error");
});
```

## Coverage Goals

We aim for:
- **80%+ overall coverage** - Minimum threshold
- **90%+ for critical paths** - Core business logic
- **100% for utility functions** - Pure functions should be fully tested

### Viewing Coverage Reports

After running tests with coverage:

```bash
# Generate coverage
pnpm test:coverage

# Open HTML report
open coverage/index.html
```

## Testing Checklist

Before submitting a PR, ensure:

- [ ] All new code has accompanying tests
- [ ] Tests pass locally (`pnpm test`)
- [ ] Coverage hasn't decreased
- [ ] Edge cases are covered
- [ ] Tests are independent and can run in any order
- [ ] Mocks are cleaned up after each test
- [ ] Test names clearly describe what is being tested
- [ ] No flaky tests (tests that randomly fail)

## References

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Jest to Vitest Migration](https://vitest.dev/guide/migration.html)

## Questions?

If you have questions about testing:
1. Check this guide first
2. Look at existing test files in the monorepo
3. Review Vitest documentation
4. Ask in team discussions
