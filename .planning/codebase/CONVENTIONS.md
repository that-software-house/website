# Coding Conventions

**Analysis Date:** 2026-02-25

## Naming Patterns

**Files:**
- React components: PascalCase with `.jsx` extension (e.g., `Header.jsx`, `ContentForgeApp.jsx`)
- Utility/service files: camelCase with `.js` extension (e.g., `openai.js`, `chatService.js`)
- Page components: PascalCase with `.jsx` extension stored in `src/pages/` (e.g., `Privacy.jsx`, `About.jsx`)
- UI component files: PascalCase with `.jsx` extension in `src/components/ui/` (e.g., `button.jsx`, `card.jsx`)

**Functions:**
- React components: PascalCase (e.g., `ContentForgeApp`, `Header`, `AuthProvider`)
- Utility functions: camelCase (e.g., `generateContent`, `parseJsonSafe`, `getAuthHeaders`)
- Event handlers: camelCase with `handle` prefix (e.g., `handleGenerate`, `handleSignOut`, `handleScroll`)
- Custom hooks: camelCase with `use` prefix (e.g., `useAuth`, `useSEO`)

**Variables:**
- State variables: camelCase (e.g., `isMenuOpen`, `isGenerating`, `sourceType`)
- Constants: camelCase (e.g., `API_BASE`, `USAGE_UPDATED_EVENT`, `DOC_API_BASE`)
- React props and context values: camelCase (e.g., `isVisible`, `setIsMenuOpen`, `user`)

**Types:**
- Type/interface names would use PascalCase (though most code uses JSDoc comments for documentation)
- Context names: PascalCase (e.g., `AuthContext`)

## Code Style

**Formatting:**
- Single quotes for strings (e.g., `'text'`, `'https://example.com'`)
- Semicolons used at end of statements
- 2-space indentation (inferred from codebase)
- No Prettier config detected; formatting appears manual but consistent

**Linting:**
- ESLint configured in `eslint.config.js`
- Uses flat config format (ESLint 9+)
- Extends: `js.configs.recommended`, `reactHooks.configs['recommended-latest']`, `reactRefresh.configs.vite`
- Custom rule: `'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }]` - allows unused vars starting with uppercase or underscore

## Import Organization

**Order:**
1. React and React-related imports (e.g., `import React, { useState, useEffect } from 'react'`)
2. External libraries (e.g., `import { Sparkles } from 'lucide-react'`, `import { motion } from 'framer-motion'`)
3. Internal utilities and services (e.g., `import { cn } from '@/lib/utils'`, `import { generateContent } from '@/services/openai'`)
4. CSS imports (e.g., `import './Header.css'`)

**Path Aliases:**
- `@/` alias used for imports from `src/` root level (e.g., `@/lib/utils`, `@/services/openai`, `@/hooks/useSEO`, `@/lib/supabase`)
- Makes imports cleaner and codebase-wide references work across different nesting levels

## Error Handling

**Patterns:**
- Try/catch blocks for async operations
- Catch blocks typically log errors to console: `console.error('Error message:', err)`
- Errors caught and re-thrown with user-friendly messages when appropriate
- In service functions (e.g., `src/services/openai.js`), errors are thrown as `Error` objects with descriptive messages
- In components, errors set to state for UI display (e.g., `setError(err.message || 'An error occurred...')`)
- Graceful degradation in some cases: catch blocks may return `null` or empty objects instead of throwing
  - Example: `parseJsonSafe()` returns `null` instead of throwing on JSON parse failure
  - Example: `getAuthHeaders()` catches errors silently and continues without auth header
- Promise rejection handling with `.catch()` for fire-and-forget operations
  - Example: `refreshUserProfile().catch(() => {})` in components

## Logging

**Framework:** `console` object
- `console.error()` for error logging
- No structured logging library detected

**Patterns:**
- Errors logged to console with context: `console.error('Operation name:', err)`
- Limited logging in production code; logs used mainly for debugging
- No specific log levels or structured log format enforced

## Comments

**When to Comment:**
- JSDoc-style comments for functions with parameters and return types
- Inline comments for non-obvious logic or workarounds
- Example in `src/services/openai.js`:
  ```javascript
  /**
   * Generate content for multiple platforms
   * @param {string} content - The source content to transform
   * @param {string[]} formats - Array of formats: 'linkedin', 'twitter', 'carousel'
   * @param {string} sourceType - The type of source: 'text', 'url', 'youtube', 'file'
   * @returns {Promise<{results: Object, errors: Object}>}
   */
  export async function generateContent(content, formats, sourceType = 'text') { ... }
  ```

**JSDoc/TSDoc:**
- JSDoc comments document public API functions
- Parameters documented with `@param {type} name - description`
- Return types documented with `@returns {type} description`
- Not consistently applied to all functions; mainly used for service/utility functions

## Function Design

**Size:** No hard limit enforced; functions typically 10-30 lines for components, up to 50+ lines for complex handlers

**Parameters:**
- Destructured props commonly used in functional components
- Event handlers receive event as parameter (e.g., `(e) => { ... }`)
- Async functions accept data parameters and return Promise

**Return Values:**
- React components return JSX
- Service functions return Promise (async)
- Some utility functions return objects or primitives directly
- Handlers return void or side effects only
- Event listener callbacks typically return void

## Module Design

**Exports:**
- Named exports: `export function name()`, `export const value = ...`
- Default exports: `export default Component` or `export default { ...object }`
- Mixed usage: some modules use both default and named exports
- Example from `src/services/openai.js`: multiple named exports + default export with all functions

**Barrel Files:**
- Not extensively used in current codebase
- Example in `src/services/openai.js` exports all functions both as named exports and in default object
- Allows both `import { generateContent }` and `import openai` patterns

## React Patterns

**Functional Components:**
- All components are functional components with hooks
- No class components detected

**Hooks:**
- `useState` for local state management
- `useEffect` for side effects with proper cleanup
- `useContext` for consuming context (e.g., `useAuth()` hook)
- Custom hooks created for reusable logic (e.g., `useSEO()` in `src/hooks/useSEO.js`)

**Props and State:**
- Props destructured in function parameters when multiple props
- State updates using setter functions from `useState`
- Conditional rendering using ternary operators and logical AND

**Dependencies:**
- `useEffect` dependency arrays properly specified
- `useCallback` and `useMemo` not heavily used; used where needed for optimization

## API Communication

**Base URLs:**
- Constants defined at module top: `const API_BASE = '/api/content'`
- Separate endpoints for different features (e.g., `DOC_API_BASE`, `TONE_API_BASE`, `VIDEO_ANALYZER_API_BASE`)
- Relative URLs to backend API (e.g., `/api/content/generate`)

**Request Pattern:**
- Fetch API used (no axios or other library)
- Headers object created with `'Content-Type': 'application/json'`
- Auth header added conditionally: `headers['Authorization'] = `Bearer ${token}``
- Error handling: check `response.ok` and throw with user message on failure

**Response Handling:**
- Safe JSON parsing with `parseJsonSafe()` function
- Usage metrics extracted from response headers (e.g., `X-RateLimit-*` headers)
- Custom events emitted for usage updates: `window.dispatchEvent(new CustomEvent(...))`

## State Management

**React Context:**
- `AuthContext` in `src/context/AuthContext.jsx` manages auth state globally
- Context provider wraps entire app in `src/main.jsx`
- Custom hook `useAuth()` provides typed access to context

**Local State:**
- Components manage their own state with `useState`
- No Redux or other state management library detected
- Event listeners used for inter-component communication (e.g., usage updates via custom events)

---

*Convention analysis: 2026-02-25*
