'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SettleButtonProps {
  pendingCount: number;
}

export function SettleButton({ pendingCount }: SettleButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const hasSettleable = pendingCount > 0;

  const handleSettle = async () => {
    if (!hasSettleable) return;

    if (!confirm(`This will simulate the overnight bank settlement for ${pendingCount} pending transaction${pendingCount !== 1 ? 's' : ''}. Continue?`)) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/settle', { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        alert(data.message);
        router.refresh();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Failed to simulate settlement');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !hasSettleable;

  return (
    <button 
      onClick={handleSettle}
      disabled={isDisabled}
      title={hasSettleable ? `${pendingCount} transaction${pendingCount !== 1 ? 's' : ''} ready to settle` : 'No pending transactions to settle'}
      style={{
        background: hasSettleable
          ? 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))'
          : 'rgba(255, 255, 255, 0.05)',
        border: hasSettleable
          ? '1px solid rgba(34,197,94,0.4)'
          : '1px solid rgba(255, 255, 255, 0.1)',
        color: hasSettleable
          ? '#4ade80'
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
        boxShadow: hasSettleable ? '0 0 12px rgba(34,197,94,0.15)' : 'none',
      }}
    >
      {loading
        ? '⏳ Simulating...'
        : hasSettleable
          ? `⏱️ Simulate Settlement (${pendingCount})`
          : '⏱️ Nothing to Settle'}
    </button>
  );
}
