#!/usr/bin/env node
// server/startup.js - Entry point with clear error reporting for production
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

// Import server from same directory
import('./src/index.js').catch((err) => {
  console.error('=== FAILED TO LOAD SERVER ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});
