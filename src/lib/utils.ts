/**
 * Utility Functions for ShopMatch Pro
 *
 * This file contains essential utility functions used throughout the application.
 * These utilities help with className merging and conditional styling.
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges class names intelligently
 *
 * This function serves as the core utility for conditional styling and className management
 * throughout the application. It combines clsx for conditional logic and tailwind-merge
 * to handle Tailwind CSS class conflicts properly.
 *
 * @param inputs - Variable number of class values (strings, conditionals, arrays, etc.)
 * @returns A single merged string of class names with conflicts resolved
 *
 * @example
 * ```tsx
 * // Simple usage
 * cn("text-red-500", "bg-blue-500") // "text-red-500 bg-blue-500"
 *
 * // With conditionals
 * cn("base-class", isActive && "active-class") // "base-class active-class" (if isActive is true)
 *
 * // With conflicts (tailwind-merge resolves them)
 * cn("text-red-500", "text-blue-500") // "text-blue-500" (last one wins)
 * ```
 *
 * @rationale
 * - clsx provides powerful conditional class logic
 * - tailwind-merge prevents CSS conflicts and reduces bundle size
 * - This pattern is used throughout the shadcn/ui ecosystem
 * - Essential for dynamic styling in React components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}