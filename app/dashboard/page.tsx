import { seedDemoData, getDashboardStats, listEvents, getPendingSettlementCount } from '@/lib/db';
import Link from 'next/link';
import styles from './dashboard.module.css';
import { formatCents } from '@/lib/pinch';

import { SettleButton } from './SettleButton';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ eventId?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const { eventId } = await searchParams;
  
  // Seed demo data if database is empty
  await seedDemoData();
  const events = await listEvents();
  
  // Use selected event or default to first active one
  const event = eventId ? events.find(e => e.id === eventId) || events[0] : events[0];
  const stats = event ? await getDashboardStats(event.id) : null;
  const pendingCount = await getPendingSettlementCount();

  if (!event || !stats) {
    return <div className="page" style={{ padding: '40px', textAlign: 'center' }}>No events found. Create one to get started!</div>;
  }

  return (
    <div className="page">
      {/* ---- Top Bar ---- */}
      <nav className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/" className={styles.topbarLogo}>
            <span>⚡</span>
            <span style={{ fontWeight: 800 }}>VendorSplit</span>
            <span style={{ margin: '0 8px', color: 'var(--color-slate)' }}>/</span>
            <span style={{ color: 'var(--color-slate-light)' }}>Organizer Portal</span>
          </Link>
          <div className={styles.topbarRight} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <SettleButton pendingCount={pendingCount} />
            <span className={styles.modeBadge}>
              🧪 Sandbox Mode
            </span>
          </div>
        </div>
      </nav>

      <div className={styles.layout}>
        {/* ---- Sidebar ---- */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h4 className={styles.sidebarLabel}>Your Events</h4>
            {events.map((ev) => (
              <Link
                key={ev.id}
                href={`?eventId=${ev.id}`}
                className={`${styles.sidebarItem} ${ev.id === event.id ? styles.sidebarItemActive : ''}`}
              >
                <span className={styles.sidebarItemDot} />
                <span>{ev.name}</span>
              </Link>
            ))}
          </div>
          <div className={styles.sidebarSection}>
            <Link href="/dashboard/events/new" className="btn btn-primary" style={{ width: '100%' }}>
              + Create Event
            </Link>
          </div>
        </aside>

        {/* ---- Main ---- */}
        <main className={styles.main}>
          {/* Event Header */}
          <div className={styles.header}>
            <div>
              <h1>{event.name}</h1>
              <p className={styles.headerSub}>
                📍 {event.location} · 📅 {new Date(event.date).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · 💰 {(event.commissionRate * 100).toFixed(0)}% commission
              </p>
            </div>
            <Link href={`/dashboard/events/${event.id}`} className="btn btn-secondary btn-sm">
              Manage Vendors →
            </Link>
          </div>

          {/* Stats Grid */}
          <div className={`stats-grid ${styles.statsSection} stagger`}>
            <div className="card stat-card">
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value">{formatCents(stats.totalRevenue)}</span>
              <span className="stat-sub">{stats.transactionCount} transactions</span>
            </div>
            <div className="card stat-card">
              <span className="stat-label">Your Commission</span>
              <span className="stat-value">{formatCents(stats.totalCommission)}</span>
              <span className="stat-sub">{(event.commissionRate * 100).toFixed(0)}% rate</span>
            </div>
            <div className="card stat-card">
              <span className="stat-label">Active Vendors</span>
              <span className="stat-value">{stats.activeVendors}</span>
              <span className="stat-sub">{stats.activeVendors} total</span>
            </div>
            <div className="card stat-card">
              <span className="stat-label">Avg. Transaction</span>
              <span className="stat-value">
                {stats.transactionCount > 0
                  ? formatCents(Math.round(stats.totalRevenue / stats.transactionCount))
                  : '$0.00'}
              </span>
              <span className="stat-sub">per sale</span>
            </div>
          </div>

          {/* Two-column: Feed + Vendor Breakdown */}
          <div className={styles.columns}>
            {/* Live Payment Feed */}
            <div className="card" style={{ flex: 1.2 }}>
              <div className={styles.cardHeader}>
                <h3>Live Payment Feed</h3>
                <span className={styles.liveDot}>● Live</span>
              </div>
              <div className={styles.feedList}>
                {stats.recentTransactions.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No transactions yet. Payments will appear here in real time.</p>
                  </div>
                ) : (
                  stats.recentTransactions.map((tx, i) => {
                    const vendor = stats.vendorBreakdown.find((v) => v.vendorId === tx.vendorId);
                    const colors = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ec4899'];
                    const color = colors[i % colors.length];
                    return (
                      <div key={tx.id} className="feed-item" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div
                          className="feed-avatar"
                          style={{ background: `${color}22`, color }}
                        >
                          {(vendor?.vendorName || '?').charAt(0)}
                        </div>
                        <div className="feed-details">
                          <div className="feed-vendor">{vendor?.vendorName || 'Unknown'}</div>
                          <div className="feed-time">
                            {tx.customerName && `${tx.customerName} · `}
                            {tx.paymentMethod === 'credit-card' ? '💳' : '🏦'}{' '}
                            {new Date(tx.createdAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="feed-amount">+{formatCents(tx.amount)}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Vendor Breakdown */}
            <div className="card" style={{ flex: 1 }}>
              <div className={styles.cardHeader}>
                <h3>Vendor Breakdown</h3>
              </div>
              <div className={styles.vendorList}>
                {stats.vendorBreakdown.map((v, i) => {
                  const pct = stats.totalRevenue > 0
                    ? ((v.totalSales / stats.totalRevenue) * 100).toFixed(0)
                    : '0';
                  return (
                    <div key={v.vendorId} className={styles.vendorRow} style={{ animationDelay: `${i * 0.08}s` }}>
                      <div className={styles.vendorInfo}>
                        <span className={styles.vendorName}>{v.vendorName}</span>
                        <span className={styles.vendorTxCount}>
                          {v.transactionCount} sale{v.transactionCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className={styles.vendorBarWrap}>
                        <div
                          className={styles.vendorBar}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className={styles.vendorAmount}>
                        <span className={styles.vendorSales}>{formatCents(v.totalSales)}</span>
                        <span className={styles.vendorCommission}>
                          -{formatCents(v.totalCommission)} fee
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
