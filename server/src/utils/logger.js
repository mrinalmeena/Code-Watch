const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

function formatMessage(level, message, data) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data && { data }),
  };
  return JSON.stringify(entry);
}

const logger = {
  debug(message, data) {
    if (MIN_LEVEL <= LEVELS.debug) console.debug(formatMessage('debug', message, data));
  },
  info(message, data) {
    if (MIN_LEVEL <= LEVELS.info) console.info(formatMessage('info', message, data));
  },
  warn(message, data) {
    if (MIN_LEVEL <= LEVELS.warn) console.warn(formatMessage('warn', message, data));
  },
  error(message, data) {
    if (MIN_LEVEL <= LEVELS.error) console.error(formatMessage('error', message, data));
  },
};

export default logger;
