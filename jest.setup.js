// jest.setup.js
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import 'whatwg-fetch';  // Polyfill for fetch (required by Firebase Auth in Jest)

expect.extend(toHaveNoViolations);

// Mock Firebase to prevent initialization errors during tests
jest.mock('@/lib/firebase/client', () => ({
  auth: {},
  db: {},
  googleProvider: {},
}));

// Global TextEncoder/TextDecoder polyfill for Jest environment
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
