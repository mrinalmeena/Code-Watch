#!/usr/bin/env node
// startup.js - Entry point with clear error reporting for production
process.on('uncaughtException', (err) => {
  console.error('=== STARTUP CRASH ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('=== UNHANDLED REJECTION ===');
  console.error('Reason:', reason);
  process.exit(1);
});

// Now import the actual server
import('./server/src/index.js').catch((err) => {
  console.error('=== FAILED TO LOAD SERVER ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});
