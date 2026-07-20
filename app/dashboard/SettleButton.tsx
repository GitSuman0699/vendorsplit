'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SettleButtonProps {
  pendingCount: number;
}

export function SettleButton({ pendingCount }: SettleButtonProps) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  const hasSettleable = pendingCount > 0;

  const handleSettle = async () => {
    if (!hasSettleable || loading) return;

    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    
    setConfirming(false);
    setLoading(true);
    try {
      const res = await fetch('/api/settle', { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        router.refresh();
      } else {
        console.error('Error: ' + data.error);
      }
    } catch (err) {
      console.error('Failed to simulate settlement');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !hasSettleable;

  return (
    <button 
      onClick={handleSettle}
      disabled={isDisabled}
      title={hasSettleable ? `${pendingCount} transactions ready to settle` : 'No pending transactions to settle'}
      style={{
        background: hasSettleable
          ? (confirming ? 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(234,179,8,0.1))' : 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))')
          : 'rgba(255, 255, 255, 0.05)',
        border: hasSettleable
          ? (confirming ? '1px solid rgba(234,179,8,0.4)' : '1px solid rgba(34,197,94,0.4)')
          : '1px solid rgba(255, 255, 255, 0.1)',
        color: hasSettleable
          ? (confirming ? '#eab308' : '#4ade80')
          : 'var(--color-slate)',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '0.8rem',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: hasSettleable ? 1 : 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease',
        boxShadow: hasSettleable ? (confirming ? '0 0 12px rgba(234,179,8,0.15)' : '0 0 12px rgba(34,197,94,0.15)') : 'none',
      }}
    >
      {loading
        ? '⏳ Settling...'
        : confirming 
          ? '⚠️ Click to Confirm'
          : hasSettleable
            ? `⏱️ Simulate Settlement (${pendingCount})`
            : '⏱️ Nothing to Settle'}
    </button>
  );
}
