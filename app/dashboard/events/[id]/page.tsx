import { getEvent, listVendorsForEvent, getDashboardStats } from '@/lib/db';
import { formatCents } from '@/lib/pinch';
import Link from 'next/link';
import styles from './event.module.css';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return notFound();

  const vendors = await listVendorsForEvent(id);
  const stats = await getDashboardStats(id);
  const vendorStatsMap = new Map(stats.vendorBreakdown.map(v => [v.vendorId, v]));

  return (
    <div className="page">
      {/* Top Bar */}
      <nav className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/dashboard" className={styles.topbarLogo}>
            <span>⚡</span>
            <span style={{ fontWeight: 800 }}>VendorSplit</span>
            <span style={{ margin: '0 8px', color: 'var(--color-slate)' }}>/</span>
            <span style={{ color: 'var(--color-slate-light)' }}>Organizer Portal</span>
          </Link>
          <span className={styles.modeBadge}>🧪 Sandbox Mode</span>
        </div>
      </nav>

      <main className={styles.main}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/dashboard">Dashboard</Link>
          <span className={styles.breadcrumbSep}>→</span>
          <span>{event.name}</span>
        </div>

        {/* Event Header */}
        <div className={styles.header}>
          <div>
            <h1>{event.name}</h1>
            <p className={styles.headerMeta}>
              📍 {event.location} · 📅{' '}
              {new Date(event.date).toLocaleDateString('en-AU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}{' '}
              · 💰 {(event.commissionRate * 100).toFixed(0)}% commission
            </p>
          </div>
          <Link href={`/dashboard/events/${id}/vendors/new`} className="btn btn-primary">
            + Add Vendor
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid stagger" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="card stat-card">
            <span className="stat-label">Total Sales</span>
            <span className="stat-value">{formatCents(stats.totalRevenue)}</span>
          </div>
          <div className="card stat-card">
            <span className="stat-label">Commission Earned</span>
            <span className="stat-value">{formatCents(stats.totalCommission)}</span>
          </div>
          <div className="card stat-card">
            <span className="stat-label">Transactions</span>
            <span className="stat-value">{stats.transactionCount}</span>
          </div>
        </div>

        {/* Vendors Grid */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <h2>Vendors ({vendors.length})</h2>
        </div>
        {vendors.length === 0 ? (
          <div className={`card ${styles.emptyState}`}>
            <div className={styles.emptyIcon}>🍔</div>
            <h3>No vendors yet</h3>
            <p style={{ color: 'var(--color-slate-light)' }}>
              Add a vendor to automatically create their dedicated Point of Sale portal.
            </p>
            <Link href={`/dashboard/events/${id}/vendors/new`} className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
              + Add First Vendor
            </Link>
          </div>
        ) : (
          <div className="vendors-grid stagger">
            {vendors.map((vendor) => {
              const vStats = vendorStatsMap.get(vendor.id) || { totalSales: 0, totalCommission: 0, transactionCount: 0 };
              return (
              <div key={vendor.id} className={`card ${styles.vendorCard}`}>
                <div className={styles.vendorHeader}>
                  <div className={styles.vendorAvatar}>
                    {vendor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className={styles.vendorName}>{vendor.name}</h3>
                    <span className={`badge ${vendor.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                      {vendor.status}
                    </span>
                  </div>
                </div>

                {vendor.description && (
                  <p className={styles.vendorDesc}>{vendor.description}</p>
                )}

                <div className={styles.vendorStats}>
                  <div className={styles.vendorStatItem}>
                    <span className={styles.vendorStatLabel}>Sales</span>
                    <span className={styles.vendorStatValue}>{formatCents(vStats.totalSales)}</span>
                  </div>
                  <div className={styles.vendorStatItem}>
                    <span className={styles.vendorStatLabel}>Commission</span>
                    <span className={styles.vendorStatValue}>{formatCents(vStats.totalCommission)}</span>
                  </div>
                  <div className={styles.vendorStatItem}>
                    <span className={styles.vendorStatLabel}>Transactions</span>
                    <span className={styles.vendorStatValue}>{vStats.transactionCount}</span>
                  </div>
                </div>

                {/* Vendor Portal Links */}
                <div className={styles.qrSection}>
                  <Link
                    href={`/vendor/${vendor.id}`}
                    target="_blank"
                    className="btn btn-primary"
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    Open Vendor Portal ↗
                  </Link>
                </div>

                <div className={styles.vendorMeta}>
                  <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--color-slate)' }}>
                    {vendor.pinchMerchantId}
                  </span>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
