import { getVendor, listTransactionsForVendor, getEvent } from '@/lib/db';
import { formatCents } from '@/lib/pinch';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { VendorPOS } from './VendorPOS';
import styles from './vendor.module.css';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ vendorId: string }>;
};

export default async function VendorDashboardPage({ params }: PageProps) {
  const { vendorId } = await params;
  const vendor = await getVendor(vendorId);
  
  if (!vendor) {
    return notFound();
  }

  const event = await getEvent(vendor.eventId);
  if (!event) return notFound();

  const transactions = await listTransactionsForVendor(vendorId);

  return (
    <div className="page">
      {/* Top Bar */}
      <nav className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div className={styles.topbarLogo}>
            <span>⚡</span>
            <span style={{ fontWeight: 800 }}>VendorSplit</span>
            <span style={{ margin: '0 8px', color: 'var(--color-slate)' }}>/</span>
            <span style={{ color: 'var(--color-slate-light)' }}>Vendor Portal</span>
          </div>
          <span className={styles.modeBadge}>🧪 Sandbox Mode</span>
        </div>
      </nav>

      <main className={styles.main}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1>{vendor.name}</h1>
            <p className={styles.headerMeta}>
              Selling at <strong>{event.name}</strong>
            </p>
          </div>
        </div>

        <div className={styles.layoutGrid}>
          {/* Left Column: Point of Sale */}
          <div className={styles.posColumn}>
            <div className={`card ${styles.posCard}`}>
              <div className={styles.posIcon}>🍔</div>
              <h2>Point of Sale</h2>
              <VendorPOS 
                vendorId={vendor.id} 
                vendorName={vendor.name} 
                eventId={event.id}
              />
            </div>
          </div>

          {/* Right Column: Stats & History */}
          <div className={styles.statsColumn}>
            {/* Quick Stats */}
            <div className={styles.statsGrid}>
              <div className="card stat-card">
                <span className="stat-label">Total Sales</span>
                <span className="stat-value">{formatCents(vendor.totalSales)}</span>
              </div>
              <div className="card stat-card">
                <span className="stat-label">Your Net Payout</span>
                <span className="stat-value" style={{ color: 'var(--color-success)' }}>
                  {formatCents(vendor.totalNet)}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-slate)', marginTop: '4px', display: 'block' }}>
                  Commission paid: {formatCents(vendor.totalCommission)}
                </span>
              </div>
            </div>

            {/* Transactions */}
            <h3 style={{ marginTop: 'var(--space-2xl)', marginBottom: 'var(--space-md)' }}>Recent Transactions</h3>
            {transactions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                <p style={{ color: 'var(--color-slate)' }}>No transactions yet.</p>
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
                      <th style={{ padding: 'var(--space-sm) var(--space-md)', color: 'var(--color-slate)', fontSize: '0.8rem' }}>Time</th>
                      <th style={{ padding: 'var(--space-sm) var(--space-md)', color: 'var(--color-slate)', fontSize: '0.8rem' }}>Amount</th>
                      <th style={{ padding: 'var(--space-sm) var(--space-md)', color: 'var(--color-slate)', fontSize: '0.8rem' }}>Net</th>
                      <th style={{ padding: 'var(--space-sm) var(--space-md)', color: 'var(--color-slate)', fontSize: '0.8rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: '0.85rem' }}>
                          {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: 'var(--space-sm) var(--space-md)', fontWeight: 600 }}>
                          {formatCents(tx.amount)}
                        </td>
                        <td style={{ padding: 'var(--space-sm) var(--space-md)', color: 'var(--color-success)', fontWeight: 600 }}>
                          {formatCents(tx.netAmount)}
                        </td>
                        <td style={{ padding: 'var(--space-sm) var(--space-md)' }}>
                          <span className={`badge ${tx.status === 'success' ? 'badge-success' : 'badge-neutral'}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
