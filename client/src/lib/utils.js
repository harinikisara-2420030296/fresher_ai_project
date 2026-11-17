/**
 * Utility helpers shared across the Fresher.AI client.
 * Kept intentionally small – only things used in multiple components.
 */

/**
 * Merge class names, filtering out falsy values.
 * Useful for conditional Tailwind classes.
 * @param {...string} classes
 * @returns {string}
 */
export const cn = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Format a JS Date (or ISO string) into a human-readable date string.
 * e.g. "2 Nov 2026"
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/**
 * Format a JS Date (or ISO string) into a relative time string.
 * e.g. "3 days ago", "just now"
 * @param {Date|string} date
 * @returns {string}
 */
export const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

/**
 * Clamp a number between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Truncate a string to maxLength characters, appending "…" if truncated.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (str, maxLength = 80) =>
  str.length > maxLength ? str.slice(0, maxLength) + '…' : str;

/**
 * Capitalise the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export const capitalise = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

/**
 * Convert seconds to a mm:ss display string.
 * @param {number} totalSeconds
 * @returns {string}
 */
export const secondsToMMSS = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

