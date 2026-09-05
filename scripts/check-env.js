#!/usr/bin/env node

/**
 * scripts/check-env.js
 *
 * Fail-fast environment check executed on container boot before launching Next.js server.
 * Ensures critical secrets and environment variables are present and non-empty.
 */

const authSecret = process.env.AUTH_SECRET;

if (!authSecret || !authSecret.trim()) {
  console.error('\n' + '='.repeat(70));
  console.error('[FATAL] AUTH_SECRET is not set or is empty!');
  console.error('NextAuth requires AUTH_SECRET to encrypt JWT sessions.');
  console.error('Without this variable, authentication routes will fail with MissingSecret.');
  console.error('Please define AUTH_SECRET in your environment or .env file before starting.');
  console.error('='.repeat(70) + '\n');
  process.exit(1);
}

console.log('[check-env] AUTH_SECRET is configured. Proceeding with application boot.');
process.exit(0);
