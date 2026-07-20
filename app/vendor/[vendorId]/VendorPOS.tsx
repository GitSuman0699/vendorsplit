'use client';

import { useState } from 'react';
import styles from '@/app/dashboard/events/[id]/event.module.css';

interface VendorPOSProps {
  vendorId: string;
  vendorName: string;
  eventId: string;
}

export function VendorPOS({ vendorId, vendorName, eventId }: VendorPOSProps) {
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

  const resetPOS = () => {
    setResult(null);
    setAmount('');
  };

  if (result) {
    return (
      <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Scan to Pay</h3>
        <p style={{ color: 'var(--color-slate-light)', marginBottom: 'var(--space-md)' }}>
          ${(result.amountCents / 100).toFixed(2)}
        </p>

        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', display: 'inline-block', marginBottom: 'var(--space-md)' }}>
          <img
            src={result.qrDataUrl}
            alt="Payment QR Code"
            style={{ width: '200px', height: '200px', display: 'block' }}
          />
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--color-slate)', marginBottom: 'var(--space-lg)' }}>
          Customer scans this code to open Pinch Checkout.
        </p>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button onClick={resetPOS} className="btn btn-secondary btn-sm">
            New Charge
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
      </div>
    );
  }

  return (
    <div style={{ marginTop: 'var(--space-lg)', textAlign: 'left' }}>
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
          onKeyDown={(e) => e.key === 'Enter' && handleCharge()}
        />
      </div>

      <div className={styles.quickAmounts} style={{ marginBottom: 'var(--space-md)' }}>
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

      {error && <p className={styles.errorText} style={{ marginBottom: 'var(--space-md)' }}>{error}</p>}

      <button
        onClick={handleCharge}
        disabled={loading}
        className="btn btn-primary"
        style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
      >
        {loading ? 'Creating…' : 'Generate QR Code'}
      </button>
    </div>
  );
}
