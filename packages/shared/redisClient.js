import Redis from 'ioredis';
import { logger } from './logger.js';

class InMemoryFallbackRedis {
  constructor() {
    this.store = new Map();
    this.expirations = new Map();
    this.status = 'fallback_ready';
  }

  _isExpired(key) {
    const expireTime = this.expirations.get(key);
    if (expireTime && Date.now() > expireTime) {
      this.store.delete(key);
      this.expirations.delete(key);
      return true;
    }
    return false;
  }

  async get(key) {
    if (this._isExpired(key)) return null;
    return this.store.get(key) ?? null;
  }

  async set(key, value, mode, duration) {
    this.store.set(key, String(value));
    if (mode === 'EX' && duration) {
      this.expirations.set(key, Date.now() + duration * 1000);
    } else if (mode === 'PX' && duration) {
      this.expirations.set(key, Date.now() + duration);
    } else {
      this.expirations.delete(key);
    }
    return 'OK';
  }

  async del(...keys) {
    let count = 0;
    for (const key of keys) {
      if (this.store.delete(key)) count++;
      this.expirations.delete(key);
    }
    return count;
  }

  async incr(key) {
    if (this._isExpired(key)) this.store.delete(key);
    const val = parseInt(this.store.get(key) || '0', 10) + 1;
    this.store.set(key, String(val));
    return val;
  }

  async expire(key, seconds) {
    if (!this.store.has(key)) return 0;
    this.expirations.set(key, Date.now() + seconds * 1000);
    return 1;
  }

  async ttl(key) {
    if (!this.store.has(key) || this._isExpired(key)) return -2;
    const exp = this.expirations.get(key);
    if (!exp) return -1;
    return Math.max(0, Math.floor((exp - Date.now()) / 1000));
  }

  on() { return this; }
  quit() { return Promise.resolve('OK'); }
}

export function createRedisClient(url = process.env.REDIS_URL || 'redis://127.0.0.1:6379') {
  let isConnected = false;
  const memoryFallback = new InMemoryFallbackRedis();

  const redis = new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => {
      if (times > 3) {
        logger.warn(`Redis connection retry limit reached. Operating in high-performance memory fallback mode.`);
        return null; // Stop retrying and fallback
      }
      return Math.min(times * 200, 1000);
    },
    lazyConnect: true
  });

  redis.on('connect', () => {
    isConnected = true;
    logger.info(`Redis connected successfully to ${url}`);
  });

  redis.on('error', (err) => {
    logger.warn(`Redis encountered connection notice: ${err.message}. Memory cache active.`);
  });

  // Attempt initial connect asynchronously
  redis.connect().catch((err) => {
    logger.warn(`Redis not available (${err.message}). Using in-memory fallback cache for development.`);
  });

  // Proxy object that forwards to live Redis if connected, otherwise fallback
  return new Proxy(redis, {
    get(target, prop) {
      if (prop === 'isFallback') return !isConnected;
      if (prop === 'status') return isConnected ? target.status : 'fallback';

      if (typeof target[prop] === 'function') {
        return async (...args) => {
          if (isConnected && target.status === 'ready') {
            try {
              return await target[prop](...args);
            } catch (err) {
              logger.warn(`Redis command '${String(prop)}' failed, redirecting to memory store: ${err.message}`);
              if (typeof memoryFallback[prop] === 'function') {
                return await memoryFallback[prop](...args);
              }
              return null;
            }
          }
          if (typeof memoryFallback[prop] === 'function') {
            return await memoryFallback[prop](...args);
          }
          return null;
        };
      }
      return target[prop];
    }
  });
}

