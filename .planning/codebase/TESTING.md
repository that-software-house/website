# Testing Patterns

**Analysis Date:** 2026-02-25

## Test Framework

**Status:** No test framework configured

- No Jest, Vitest, Mocha, or other testing library found in `package.json`
- No test configuration files detected (no `jest.config.js`, `vitest.config.js`, etc.)
- No test files found in codebase (no `*.test.js`, `*.test.jsx`, `*.spec.js`, `*.spec.jsx`)
- **Note:** One TODO comment found in `src/components/Footer.jsx`: `// TODO: Implement newsletter subscription` (not test-related)

**Current State:**
- Testing not implemented in this codebase
- All validation occurs through manual testing during development
- Production safety relies on TypeScript checks via ESLint and manual code review

## Development/Preview Scripts

While testing framework is absent, the `package.json` includes these development commands:

```bash
npm run dev              # Run Vite dev server
npm run dev:all         # Run Vite + backend server concurrently
npm run dev:netlify     # Run Netlify dev environment
npm run server          # Run backend Express server
npm run build           # Build for production with Vite
npm run lint            # Run ESLint
npm run preview         # Preview production build locally
npm run deploy          # Deploy to Netlify
```

## Code Quality Tools

**Linting:**
- ESLint configured in `eslint.config.js` (flat config format)
- Extends: `js.configs.recommended`, React Hooks plugin, React Refresh plugin
- Can be run with `npm run lint` to check code quality
- Custom rule enforces unused variable detection with exceptions

**No Other Tools:**
- Prettier not configured
- Type checking (TypeScript) not enabled
- Pre-commit hooks not detected

## Testing Opportunities / What Should Be Tested

Based on codebase analysis, these areas would benefit from test coverage:

**Service Functions** (`src/services/openai.js`, `src/services/chatService.js`):
- API request/response handling
- Error handling for failed requests
- Usage metric parsing from response headers
- Safe JSON parsing with null responses
- Auth header injection
- Different content format generation
- Rate limit tracking

**Context and Hooks** (`src/context/AuthContext.jsx`, `src/hooks/useSEO.js`):
- Authentication state management
- User session changes
- Usage state updates
- SEO metadata injection
- Window event listeners cleanup

**Components** (various `.jsx` files):
- Component rendering with different prop states
- Event handler execution
- Form submission
- Error display/handling
- Conditional rendering based on state
- Navigation interactions

**Utility Functions** (`src/lib/utils.js`):
- `cn()` function for className merging

**API Communication:**
- Fetch requests with proper headers
- Response parsing and error handling
- Custom event emission and listening

## Recommended Testing Stack

If testing were to be implemented:

```json
{
  "devDependencies": {
    "vitest": "^1.x",              // Test runner (Vite-native, faster)
    "@vitest/ui": "^1.x",          // UI dashboard for test results
    "@testing-library/react": "^15.x",    // Component testing utilities
    "@testing-library/jest-dom": "^6.x",  // Custom assertions
    "jsdom": "^24.x",              // DOM implementation for tests
    "msw": "^2.x"                  // API mocking for fetch tests
  }
}
```

## Test File Organization Structure (Recommended)

**Proposed Structure:**

```
src/
├── services/
│   ├── openai.js
│   └── openai.test.js           # Co-located with source
├── components/
│   ├── Header.jsx
│   └── Header.test.jsx          # Co-located with source
├── context/
│   ├── AuthContext.jsx
│   └── AuthContext.test.jsx     # Co-located with source
├── hooks/
│   ├── useSEO.js
│   └── useSEO.test.js           # Co-located with source
└── lib/
    ├── utils.js
    └── utils.test.js            # Co-located with source
```

Or alternatively in a separate `tests/` directory:

```
tests/
├── services/
│   └── openai.test.js
├── components/
│   └── Header.test.jsx
├── context/
│   └── AuthContext.test.jsx
├── hooks/
│   └── useSEO.test.js
└── lib/
    └── utils.test.js
```

## Example Test Patterns (Recommended)

### Service Function Testing

```javascript
// src/services/openai.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateContent, parseJsonSafe } from './openai';

describe('OpenAI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseJsonSafe', () => {
    it('should parse valid JSON response', async () => {
      const response = {
        json: vi.fn().mockResolvedValue({ success: true })
      };
      const result = await parseJsonSafe(response);
      expect(result).toEqual({ success: true });
    });

    it('should return null on JSON parse error', async () => {
      const response = {
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
      };
      const result = await parseJsonSafe(response);
      expect(result).toBeNull();
    });
  });

  describe('generateContent', () => {
    it('should throw error with user-friendly message on 4xx response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: 'Invalid format' })
      });

      await expect(generateContent('test', ['linkedin']))
        .rejects
        .toThrow('Invalid format');
    });

    it('should emit usage update event on success', async () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn((header) => {
            const values = {
              'X-RateLimit-Limit': '10',
              'X-RateLimit-Remaining': '5'
            };
            return values[header];
          })
        },
        json: vi.fn().mockResolvedValue({ results: { linkedin: 'Generated post' } })
      });

      await generateContent('test', ['linkedin']);

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'usage:updated' })
      );
    });
  });
});
```

### Component Testing

```javascript
// src/components/Header.test.jsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  it('should render navigation links', () => {
    renderWithRouter(<Header />);

    expect(screen.getByText('AI Solutions')).toBeInTheDocument();
    expect(screen.getByText('Custom Software')).toBeInTheDocument();
  });

  it('should open mobile menu when menu button is clicked', () => {
    renderWithRouter(<Header />);

    const menuButton = screen.getByLabelText('Toggle navigation');
    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('should close mobile menu on route change', () => {
    const { rerender } = renderWithRouter(<Header />);

    const menuButton = screen.getByLabelText('Toggle navigation');
    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    // Simulate route change by rerendering
    rerender(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });
});
```

### Hook Testing

```javascript
// src/context/AuthContext.test.jsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

describe('useAuth Hook', () => {
  it('should provide initial unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle sign up', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.signUp('test@example.com', 'password123');
    });

    // Assert based on mocked Supabase response
  });
});
```

### Utility Function Testing

```javascript
// src/lib/utils.test.js
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('should merge class names', () => {
    const result = cn('px-4', 'py-2', 'bg-blue-500');
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
    expect(result).toContain('bg-blue-500');
  });

  it('should handle Tailwind conflicts', () => {
    const result = cn('px-4', 'px-8');
    expect(result).toContain('px-8');
    expect(result).not.toContain('px-4');
  });
});
```

## Coverage Goals (Recommended)

```
Statements   : > 80%
Branches     : > 75%
Functions    : > 80%
Lines        : > 80%
```

Priority order for testing:
1. **Critical path:** Auth, API services, core utilities
2. **High impact:** Frequently used components, data transformations
3. **Risky areas:** Error handling, edge cases, rate limiting
4. **Nice to have:** UI components with simple rendering

## Current Testing Reality

- **No automated tests**: All testing is manual/exploratory
- **Lint checks only**: ESLint provides code quality checks via `npm run lint`
- **Build validation**: Vite build process catches some errors during `npm run build`

---

*Testing analysis: 2026-02-25*
