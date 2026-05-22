/**
 * @file utils/device.js
 * Device identification + localStorage cache utilities.
 *
 * NOTE FOR ARCHITECTS: localStorage tokens can be cleared. A more robust
 * approach uses localStorage + a server-side fingerprint in Firestore,
 * validated via a Firebase Cloud Function. See ARCHITECTURE.md.
 */

const DEVICE_TOKEN_KEY = 'nysc_device_token';
const USER_CACHE_KEY   = 'nysc_user_cache';

/**
 * Returns the stored device token, or generates and persists a new one.
 * @returns {string}
 */
export const getOrGenerateDeviceToken = () => {
  let token = localStorage.getItem(DEVICE_TOKEN_KEY);
  if (!token) {
    token =
      'dev_' +
      Math.random().toString(36).substr(2, 9) +
      Date.now().toString(36);
    localStorage.setItem(DEVICE_TOKEN_KEY, token);
  }
  return token;
};

/**
 * Retrieves the cached user profile from localStorage.
 * @returns {object|null}
 */
export const getCachedUser = () => {
  try {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    localStorage.removeItem(USER_CACHE_KEY);
    return null;
  }
};

/**
 * Writes a user profile to the localStorage cache.
 * @param {object} userData
 */
export const setCachedUser = (userData) => {
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
};

/**
 * Clears all NYSC keys from localStorage. Called on sign-out.
 */
export const clearUserCache = () => {
  localStorage.removeItem(USER_CACHE_KEY);
};