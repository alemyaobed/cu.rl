const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = import.meta.env.DEV ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

const logger = {
  debug: (...args: any[]) => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.log("[DEBUG]", ...args);
    }
  },
  info: (...args: any[]) => {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.log("[INFO]", ...args);
    }
  },
  warn: (...args: any[]) => {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn("[WARN]", ...args);
    }
  },
  error: (...args: any[]) => {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      console.error("[ERROR]", ...args);
    }
  },
};

export default logger;
