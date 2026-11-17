// Structured Logger for Fresher.AI microservices

const getTimestamp = () => new Date().toISOString();

export const logger = {
  info: (msg, meta = {}) => {
    console.log(`\x1b[36m[INFO]\x1b[0m [${getTimestamp()}] ${msg}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  },
  warn: (msg, meta = {}) => {
    console.warn(`\x1b[33m[WARN]\x1b[0m [${getTimestamp()}] ${msg}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  },
  error: (msg, err = {}) => {
    console.error(`\x1b[31m[ERROR]\x1b[0m [${getTimestamp()}] ${msg}`, err?.stack || err?.message || err);
  },
  debug: (msg, meta = {}) => {
    if (process.env.DEBUG === 'true') {
      console.log(`\x1b[35m[DEBUG]\x1b[0m [${getTimestamp()}] ${msg}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
    }
  }
};

