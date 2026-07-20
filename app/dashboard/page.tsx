import { seedDemoData, getDashboardStats, listEvents, getPendingSettlementCount } from '@/lib/db';
import Link from 'next/link';
import styles from './dashboard.module.css';
import { formatCents } from '@/lib/pinch';

import { SettleButton } from './SettleButton';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ eventId?: string }>;
};

import { Suspense } from 'react';
import { DashboardProvider } from './DashboardContext';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTransitionWrapper } from './DashboardTransitionWrapper';

export default async function DashboardPage({ searchParams }: PageProps) {
  const { eventId } = await searchParams;
  
  // Seed demo data if database is empty
  await seedDemoData();
  const events = await listEvents();
  
  // Use selected event or default to first active one
  const event = eventId ? events.find(e => e.id === eventId) || events[0] : events[0];
  const pendingCount = await getPendingSettlementCount();

  if (!event) {
    return <div className="page" style={{ padding: '40px', textAlign: 'center' }}>No events found. Create one to get started!</div>;
  }

  // Generate a skeleton for the fallback
  const fallbackSkeleton = <DashboardMainSkeleton event={{ ...event, name: 'Loading...', location: '...', commissionRate: 0, date: new Date() }} />;

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

      <DashboardProvider serverEventId={event.id}>
        <div className={styles.layout}>
          {/* ---- Sidebar (Client Component for instant highlight) ---- */}
          <DashboardSidebar events={events} />

          {/* ---- Main (Client Wrapper for instant skeleton) ---- */}
          <DashboardTransitionWrapper 
            serverEventId={event.id} 
            fallback={fallbackSkeleton}
          >
            <Suspense fallback={fallbackSkeleton}>
              <DashboardMain event={event} />
            </Suspense>
          </DashboardTransitionWrapper>
        </div>
      </DashboardProvider>
    </div>
  );
}

async function DashboardMain({ event }: { event: any }) {
  const stats = await getDashboardStats(event.id);
  
  if (!stats) return <main className={styles.main}>Error loading stats</main>;

  return (
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
  );
}

function Shimmer({ width = '100%', height = '20px', borderRadius = '8px' }: { width?: string; height?: string; borderRadius?: string }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
}

function DashboardMainSkeleton({ event }: { event: any }) {
  return (
    <main className={styles.main}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>{event.name}</h1>
          <p className={styles.headerSub}>
            📍 {event.location} · 📅 {new Date(event.date).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · 💰 {(event.commissionRate * 100).toFixed(0)}% commission
          </p>
        </div>
        <Shimmer width="140px" height="36px" borderRadius="8px" />
      </div>

      {/* Stats Grid */}
      <div className={`stats-grid ${styles.statsSection}`}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card stat-card">
            <Shimmer width="80px" height="12px" borderRadius="4px" />
            <Shimmer width="120px" height="32px" borderRadius="6px" />
            <Shimmer width="60px" height="12px" borderRadius="4px" />
          </div>
        ))}
      </div>

      {/* Two Columns */}
      <div className={styles.columns}>
        <div className="card" style={{ flex: 1.2 }}>
          <div className={styles.cardHeader}>
            <Shimmer width="140px" height="16px" borderRadius="4px" />
            <Shimmer width="50px" height="14px" borderRadius="4px" />
          </div>
          <div className={styles.feedList}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="feed-item" style={{ opacity: 0.6 }}>
                <Shimmer width="36px" height="36px" borderRadius="50%" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Shimmer width="120px" height="14px" borderRadius="4px" />
                  <Shimmer width="80px" height="10px" borderRadius="4px" />
                </div>
                <Shimmer width="60px" height="16px" borderRadius="4px" />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <div className={styles.cardHeader}>
            <Shimmer width="160px" height="16px" borderRadius="4px" />
          </div>
          <div className={styles.vendorList}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Shimmer width="100px" height="14px" borderRadius="4px" />
                  <Shimmer width="50px" height="10px" borderRadius="4px" />
                </div>
                <Shimmer width="100%" height="4px" borderRadius="100px" />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Shimmer width="70px" height="14px" borderRadius="4px" />
                  <Shimmer width="80px" height="12px" borderRadius="4px" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
