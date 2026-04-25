/**
 * api.js — Robust API client with timeout, retry, and error handling.
 * Used across all frontend pages for consistent network behavior.
 */

const DEFAULT_TIMEOUT = 8000; // 8 seconds
const MAX_RETRIES = 2;

/**
 * Fetch wrapper with timeout support.
 */
async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw error;
  }
}

/**
 * API call with automatic retry for GET requests and important mutations.
 * 
 * @param {string} url — API endpoint
 * @param {object} options — fetch options
 * @param {object} config — { retries, timeout, retryOn }
 * @returns {Promise<any>} — parsed JSON response
 */
export async function apiCall(url, options = {}, config = {}) {
  const { retries = MAX_RETRIES, timeout = DEFAULT_TIMEOUT } = config;
  const method = (options.method || 'GET').toUpperCase();
  
  // Only retry GET and idempotent requests by default
  const shouldRetry = method === 'GET' || config.forceRetry;
  let lastError;

  for (let attempt = 0; attempt <= (shouldRetry ? retries : 0); attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeout);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed (${response.status})`);
      }

      return data;
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.message?.includes('(4')) break;
      
      // Wait before retry (exponential backoff)
      if (attempt < retries && shouldRetry) {
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}

/**
 * Shorthand helpers
 */
export const api = {
  get: (url, config) => apiCall(url, {}, config),
  
  post: (url, body, config) => apiCall(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, config),

  patch: (url, body, config) => apiCall(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, config),

  delete: (url, config) => apiCall(url, { method: 'DELETE' }, config),
};

/**
 * File upload validation helpers
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export function validateImageFile(file) {
  if (!file) return { valid: false, error: 'No file selected.' };
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed.' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` };
  }
  return { valid: true };
}

/**
 * Email format validation
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Transaction ID format validation (alphanumeric, 8-30 chars)
 */
export function isValidTransactionId(txnId) {
  if (!txnId) return true; // optional
  return /^[a-zA-Z0-9]{8,30}$/.test(txnId.trim());
}

/**
 * Profile completeness calculator
 */
export function calculateProfileCompleteness(user) {
  if (!user) return { percentage: 0, missing: [], complete: [] };
  
  const fields = [
    { key: 'name', label: 'Full Name' },
    { key: 'roll_number', label: 'Roll Number' },
    { key: 'branch', label: 'Branch / Course' },
    { key: 'year', label: 'Academic Year' },
    { key: 'section', label: 'Section' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'email', label: 'Email Address' },
  ];

  const missing = [];
  const complete = [];

  fields.forEach(f => {
    if (user[f.key] && String(user[f.key]).trim()) {
      complete.push(f.label);
    } else {
      missing.push(f.label);
    }
  });

  const percentage = Math.round((complete.length / fields.length) * 100);
  return { percentage, missing, complete, isComplete: percentage === 100 };
}

/**
 * Payment confidence scorer
 */
export function scorePaymentConfidence({ screenshotUploaded, transactionId, amountMatches }) {
  let score = 0;
  if (screenshotUploaded) score += 40;
  if (transactionId && isValidTransactionId(transactionId)) score += 30;
  if (amountMatches) score += 30;

  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}
