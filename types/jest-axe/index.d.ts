import type { AxeResults, RunOptions } from "axe-core";

declare module "jest-axe" {
  export function axe(
    element: Element | Document,
    options?: RunOptions,
  ): Promise<AxeResults>;

  export interface AxeMatchers {
    toHaveNoViolations(): { pass: boolean; message(): string };
  }

  export const toHaveNoViolations: () => {
    pass: boolean;
    message(): string;
  };
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}
