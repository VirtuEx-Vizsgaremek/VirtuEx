/**
 * Utility Functions
 *
 * Common utility functions for class name composition and other helpers.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine and merge Tailwind CSS class names
 *
 * Intelligently merges Tailwind CSS class names, preventing conflicts
 * when the same property is specified multiple times.
 *
 * Uses clsx for conditional class composition and tailwind-merge
 * to resolve conflicting utility classes.
 *
 * @param inputs - Variable number of class values (strings, arrays, objects)
 * @returns Merged class string without conflicts
 *
 * Example:
 * cn("px-2 py-1", "px-4")  // Returns "py-1 px-4" (px-4 overrides px-2)
 * cn("text-red-500", condition && "text-blue-500")  // Conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
