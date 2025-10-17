// jest.setup.js
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import './src/__tests__/setup';

expect.extend(toHaveNoViolations);
