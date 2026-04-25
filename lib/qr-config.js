/**
 * Centralized QR Code Configuration
 * 
 * This module provides the default QR code path and a helper
 * to resolve which QR code to display for any given event.
 * 
 * Usage:
 *   import { getPaymentQR, DEFAULT_QR } from '@/lib/qr-config';
 *   const qrUrl = getPaymentQR(event);
 */

// Default QR code stored in public/assets/
export const DEFAULT_QR = '/assets/default-qr.png';

/**
 * Returns the effective QR code URL for a given event.
 * Falls back to the default QR if none is set on the event.
 * 
 * @param {Object} event - The event object
 * @param {string} [event.payment_qrcode] - Custom QR URL (optional)
 * @returns {string} The QR code URL to display
 */
export function getPaymentQR(event) {
  if (event?.payment_qrcode && event.payment_qrcode.trim()) {
    return event.payment_qrcode;
  }
  return DEFAULT_QR;
}

/**
 * Returns true if the event is using the default QR (no custom one set).
 */
export function isDefaultQR(event) {
  return !event?.payment_qrcode || !event.payment_qrcode.trim();
}
