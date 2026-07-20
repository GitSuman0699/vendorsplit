'use client';

import { useState } from 'react';
import styles from './event.module.css';

interface ChargeModalProps {
  vendorId: string;
  vendorName: string;
  eventId: string;
  onClose: () => void;
}

export function ChargeModal({ vendorId, vendorName, eventId, onClose }: ChargeModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    qrDataUrl: string;
    paymentLinkUrl: string;
    amountCents: number;
    applicationFeeCents: number;
  } | null>(null);

  const handleCharge = async () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed < 1.01) {
      setError('Enter at least $1.01');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, eventId, amount: parsed }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to create payment');
        return;
      }
      setResult(data.data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {!result ? (
          <>
            <h3 className={styles.modalTitle}>Charge Customer</h3>
            <p className={styles.modalSubtitle}>
              Create a payment QR for <strong>{vendorName}</strong>
            </p>

            <div className={styles.amountInputWrap}>
              <span className={styles.amountPrefix}>$</span>
              <input
                type="number"
                step="0.01"
                min="1.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={styles.amountInput}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCharge()}
              />
            </div>

            {/* Quick amount buttons */}
            <div className={styles.quickAmounts}>
              {[5, 10, 15, 20, 25, 50].map((q) => (
                <button
                  key={q}
                  className={styles.quickAmountBtn}
                  onClick={() => setAmount(q.toFixed(2))}
                >
                  ${q}
                </button>
              ))}
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            <div className={styles.modalActions}>
              <button onClick={onClose} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button
                onClick={handleCharge}
                disabled={loading}
                className="btn btn-primary btn-sm"
              >
                {loading ? 'Creating…' : 'Generate QR'}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className={styles.modalTitle}>Scan to Pay</h3>
            <p className={styles.modalSubtitle}>
              {vendorName} — ${(result.amountCents / 100).toFixed(2)}
            </p>

            <div className={styles.qrDisplay}>
              <img
                src={result.qrDataUrl}
                alt="Payment QR Code"
                className={styles.qrImage}
              />
            </div>

            <p className={styles.feeNote}>
              Commission: ${(result.applicationFeeCents / 100).toFixed(2)}
            </p>

            <div className={styles.modalActions}>
              <button onClick={onClose} className="btn btn-secondary btn-sm">
                Done
              </button>
              <a
                href={result.paymentLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                Open Link ↗
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface VendorCardActionsProps {
  vendorId: string;
  vendorName: string;
  eventId: string;
  paymentLinkUrl?: string;
}

export function VendorCardActions({ vendorId, vendorName, eventId, paymentLinkUrl }: VendorCardActionsProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`btn btn-primary btn-sm ${styles.chargeBtn}`}
      >
        💳 Charge Customer
      </button>

      {paymentLinkUrl && (
        <a
          href={paymentLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', textAlign: 'center' }}
        >
          Open Last Payment Link ↗
        </a>
      )}

      {showModal && (
        <ChargeModal
          vendorId={vendorId}
          vendorName={vendorName}
          eventId={eventId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
