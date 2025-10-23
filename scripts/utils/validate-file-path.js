/**
 * Shared Path Validation Utility for CI Scripts
 *
 * This module provides secure file path validation to prevent path traversal attacks
 * in CI/CD scripts that accept file paths as arguments.
 *
 * Security Features:
 * - Multi-layer validation against path traversal attempts
 * - Ensures paths remain within project root directory
 * - Verifies target is a file (not directory)
 * - Clear error messages for debugging
 *
 * Usage:
 * ```javascript
 * const { validateFilePath } = require('./utils/validate-file-path')
 *
 * try {
 *   const validatedPath = validateFilePath(process.argv[2])
 *   const contents = fs.readFileSync(validatedPath, 'utf-8')
 * } catch (error) {
 *   console.error(error.message)
 *   process.exit(1)
 * }
 * ```
 *
 * @see docs/SECURITY.md for security architecture
 * @see scripts/ci/measure-first-load.mjs for example usage
 */

import { resolve, relative, sep } from 'node:path'
import { statSync } from 'node:fs'

/**
 * Validates a file path to prevent path traversal attacks
 *
 * Performs four layers of validation:
 * 1. Checks for parent directory references (..)
 * 2. Ensures resolved path is within project root
 * 3. Confirms target exists
 * 4. Verifies target is a file (not directory)
 *
 * @param {string} filePath - The file path to validate (absolute or relative)
 * @param {string} [workingDir=process.cwd()] - The working directory to validate against
 * @returns {string} The validated absolute file path
 * @throws {Error} If path validation fails for any reason
 *
 * @example
 * // Valid path
 * validateFilePath('.next/static/chunks/main.js')
 * // Returns: '/Users/you/project/.next/static/chunks/main.js'
 *
 * @example
 * // Invalid path (traversal attempt)
 * validateFilePath('../../../etc/passwd')
 * // Throws: Error('Invalid file path (parent directory references are not allowed)')
 */
export function validateFilePath(filePath, workingDir = process.cwd()) {
  if (!filePath) {
    throw new Error('File path is required')
  }

  // Normalize working directory and target path
  const cwd = resolve(workingDir)
  const resolvedPath = resolve(cwd, filePath)
  const relativePath = relative(cwd, resolvedPath)

  // Layer 1: Reject paths that traverse outside the repo root
  if (relativePath.startsWith('..') || relativePath.split(sep).includes('..')) {
    throw new Error(
      'Invalid file path (parent directory references are not allowed)\n' +
      `  Attempted path: ${filePath}\n` +
      `  Working directory: ${cwd}\n` +
      'This prevents path traversal attacks that could read sensitive files outside the project.'
    )
  }

  // Layer 2: Ensure the resolved path is within the project directory
  if (!resolvedPath.startsWith(cwd)) {
    throw new Error(
      'File path must be within the current working directory\n' +
      `  Attempted path: ${filePath}\n` +
      `  Resolved to: ${resolvedPath}\n` +
      `  Working directory: ${cwd}\n` +
      'This ensures all file operations stay within the project boundary.'
    )
  }

  // Layer 3: Verify the file exists
  let stats
  try {
    stats = statSync(resolvedPath)
  } catch (error) {
    throw new Error(
      `Unable to read file at ${filePath}\n` +
      `  Resolved to: ${resolvedPath}\n` +
      `  Error: ${error instanceof Error ? error.message : String(error)}`
    )
  }

  // Layer 4: Ensure the target is a file (not a directory)
  if (!stats.isFile()) {
    throw new Error(
      'Provided path must point to a file, not a directory\n' +
      `  Path: ${filePath}\n` +
      `  Resolved to: ${resolvedPath}`
    )
  }

  return resolvedPath
}

/**
 * Validates multiple file paths in a single call
 *
 * Useful when a script accepts multiple file arguments.
 * Returns an array of validated absolute paths.
 *
 * @param {string[]} filePaths - Array of file paths to validate
 * @param {string} [workingDir=process.cwd()] - The working directory to validate against
 * @returns {string[]} Array of validated absolute file paths
 * @throws {Error} If any path validation fails
 *
 * @example
 * validateFilePaths([
 *   '.next/static/chunks/main.js',
 *   '.next/static/chunks/polyfills.js'
 * ])
 */
export function validateFilePaths(filePaths, workingDir = process.cwd()) {
  if (!Array.isArray(filePaths)) {
    throw new Error('File paths must be an array')
  }

  return filePaths.map(path => validateFilePath(path, workingDir))
}

/**
 * Checks if a path is safe without throwing an error
 *
 * Useful for conditional logic where you want to check validity
 * without exception handling overhead.
 *
 * @param {string} filePath - The file path to check
 * @param {string} [workingDir=process.cwd()] - The working directory to validate against
 * @returns {boolean} True if path is valid, false otherwise
 *
 * @example
 * if (isValidFilePath(userInput)) {
 *   processFile(userInput)
 * } else {
 *   console.log('Invalid path provided')
 * }
 */
export function isValidFilePath(filePath, workingDir = process.cwd()) {
  try {
    validateFilePath(filePath, workingDir)
    return true
  } catch {
    return false
  }
}
