"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { getPaymentQR, isDefaultQR } from '../lib/qr-config';
import { validateImageFile, isValidTransactionId, scorePaymentConfidence } from '../lib/api';
import { HelpTooltip } from './HelpSystem';

/**
 * PaymentQRModal v2 — Enhanced payment modal with:
 * - Smart file validation (type + size < 2MB)
 * - Optional transaction ID input
 * - Amount confirmation
 * - Payment confidence scoring
 * - Contextual help tooltips
 * 
 * Props:
 *   event       — The event object
 *   onSubmit    — async ({ screenshotDataUrl, transactionId, paymentAmount, confidence }) => void
 *   onClose     — () => void
 *   submitting  — boolean
 */
export default function PaymentQRModal({ event, onSubmit, onClose, submitting = false }) {
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [qrError, setQrError] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [txnIdError, setTxnIdError] = useState('');

  const qrUrl = getPaymentQR(event);
  const usingDefault = isDefaultQR(event);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setScreenshotPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleTxnIdChange = (val) => {
    setTransactionId(val);
    if (val && !isValidTransactionId(val)) {
      setTxnIdError('Transaction ID should be 8-30 alphanumeric characters');
    } else {
      setTxnIdError('');
    }
  };

  const amountMatches = paymentAmount && parseInt(paymentAmount) === event.entry_fee;
  const confidence = scorePaymentConfidence({
    screenshotUploaded: !!screenshotPreview,
    transactionId,
    amountMatches,
  });

  const confidenceConfig = {
    high: { label: 'High Confidence', color: 'text-green-400 bg-green-500/10 border-green-500/20', icon: 'verified' },
    medium: { label: 'Medium Confidence', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: 'shield' },
    low: { label: 'Low Confidence', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: 'warning' },
  };
  const confCfg = confidenceConfig[confidence];

  const handleSubmit = () => {
    if (!screenshotPreview) {
      toast.error('Please upload a payment screenshot.');
      return;
    }
    if (txnIdError) {
      toast.error('Please fix the transaction ID format.');
      return;
    }
    onSubmit({
      screenshotDataUrl: screenshotPreview,
      transactionId: transactionId.trim() || null,
      paymentAmount: paymentAmount ? parseInt(paymentAmount) : null,
      confidence,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-container-high border border-outline-variant/20 rounded-[32px] w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto modal-scroll-target">
        {/* Accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-t-[32px]" />

        <div className="p-8 pt-10">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <span className="material-symbols-outlined text-primary text-4xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>
              qr_code_2
            </span>
            <h3 className="text-2xl font-headline font-black italic uppercase tracking-tighter">
              Complete <span className="text-primary">Payment</span>
            </h3>
            <p className="text-on-surface-variant text-sm mt-1">
              Entry fee for <strong>{event.name}</strong> is{' '}
              <strong className="text-primary text-lg">₹{event.entry_fee}</strong>
            </p>
          </div>

          {/* QR Code Display */}
          <div className="mb-6 bg-white rounded-2xl p-6 flex flex-col items-center border border-outline-variant/10 shadow-inner relative overflow-hidden">
            <span className={`absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
              usingDefault
                ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30'
                : 'bg-green-500/20 text-green-600 border-green-500/30'
            }`}>
              {usingDefault ? 'DEFAULT QR' : 'EVENT QR'}
            </span>

            {!qrError ? (
              <img
                src={qrUrl}
                alt="Payment QR Code"
                className="w-52 h-52 object-contain rounded-xl mb-3"
                onError={() => setQrError(true)}
              />
            ) : (
              <div className="w-52 h-52 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 mb-3">
                <span className="material-symbols-outlined text-5xl mb-2">broken_image</span>
                <p className="text-xs font-bold uppercase">QR Failed to Load</p>
              </div>
            )}

            <p className="text-[11px] font-headline font-black uppercase tracking-widest text-gray-600 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">qr_code_scanner</span>
              Scan this QR to Pay ₹{event.entry_fee}
            </p>
          </div>

          {/* Instructions */}
          <div className="mb-6 bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <h4 className="text-[10px] font-headline font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">info</span>
              Payment Instructions
            </h4>
            <ol className="text-[11px] text-on-surface-variant space-y-1.5 list-decimal list-inside font-bold">
              <li>Open any UPI app (Google Pay, PhonePe, Paytm)</li>
              <li>Scan the QR code shown above</li>
              <li>Pay exactly <span className="text-primary font-black">₹{event.entry_fee}</span></li>
              <li>Take a <span className="text-primary font-black">screenshot</span> of the payment confirmation</li>
              <li>Upload the screenshot & enter details below</li>
            </ol>
          </div>

          {/* Coordinator Contact */}
          {(event.coordinator_name || event.coordinator_contact) && (
            <div className="mb-6 flex items-center gap-3 bg-surface-container-highest/60 rounded-xl px-4 py-3 border border-outline-variant/10">
              <span className="material-symbols-outlined text-secondary text-lg">support_agent</span>
              <div>
                <p className="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-widest">Payment Issues? Contact</p>
                <p className="text-xs font-bold text-on-surface">
                  {event.coordinator_name || 'Coordinator'}{event.coordinator_contact ? ` — ${event.coordinator_contact}` : ''}
                </p>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2">
              Upload Payment Screenshot *
              <HelpTooltip text="Upload a clear screenshot of your payment confirmation screen showing the amount and transaction status." position="right" />
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageUpload}
              className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all font-body cursor-pointer"
            />
            <p className="text-[9px] text-on-surface-variant/40 font-bold mt-1">JPEG, PNG, GIF, or WebP • Max 2MB</p>
            {screenshotPreview && (
              <div className="mt-3 relative rounded-2xl overflow-hidden border-2 border-primary/30 h-36 shadow-lg">
                <img src={screenshotPreview} alt="Screenshot preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setScreenshotPreview(null)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-error transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}
          </div>

          {/* Transaction ID (Optional) */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2">
              Transaction ID (Optional)
              <HelpTooltip text="Enter the UPI transaction ID from your payment app. This helps verify your payment faster. You can find it in your payment history." position="right" />
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => handleTxnIdChange(e.target.value)}
              placeholder="e.g. UPI123456789012"
              className={`w-full bg-surface-container-highest px-4 py-3 rounded-xl font-mono text-sm border outline-none transition-all ${
                txnIdError ? 'border-error focus:border-error' : 'border-outline-variant/20 focus:border-primary'
              }`}
            />
            {txnIdError && <p className="text-[10px] text-error mt-1 font-bold">{txnIdError}</p>}
          </div>

          {/* Payment Amount Confirmation */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2">
              Amount Paid (₹)
              <HelpTooltip text="Enter the exact amount you paid. This should match the event entry fee of ₹{event.entry_fee} for faster verification." position="right" />
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={String(event.entry_fee)}
                className={`w-full bg-surface-container-highest pl-8 pr-4 py-3 rounded-xl font-headline font-bold text-sm border outline-none transition-all ${
                  paymentAmount && !amountMatches ? 'border-yellow-500 focus:border-yellow-500' : 'border-outline-variant/20 focus:border-primary'
                }`}
              />
            </div>
            {paymentAmount && !amountMatches && (
              <p className="text-[10px] text-yellow-400 mt-1 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">warning</span>
                Amount doesn't match entry fee (₹{event.entry_fee})
              </p>
            )}
            {amountMatches && (
              <p className="text-[10px] text-green-400 mt-1 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Amount matches entry fee
              </p>
            )}
          </div>

          {/* Confidence Indicator */}
          {screenshotPreview && (
            <div className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border ${confCfg.color}`}>
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{confCfg.icon}</span>
              <div>
                <p className="text-[10px] font-headline font-black uppercase tracking-widest">{confCfg.label}</p>
                <p className="text-[9px] opacity-60 font-bold">
                  {confidence === 'high' ? 'All details provided — faster verification likely' :
                   confidence === 'medium' ? 'Add transaction ID & amount for faster approval' :
                   'Provide more details for better verification'}
                </p>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !screenshotPreview}
            className="w-full py-4 rounded-2xl font-headline font-black italic text-lg bg-primary text-on-primary shadow-[0_10px_30px_rgba(184,253,55,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-300"
          >
            {submitting ? (
              <>
                <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                PROCESSING...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                SUBMIT PAYMENT & REGISTER
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
