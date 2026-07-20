import styles from './dashboard.module.css';

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

function StatCardSkeleton() {
  return (
    <div className="card stat-card">
      <Shimmer width="80px" height="12px" borderRadius="4px" />
      <Shimmer width="120px" height="32px" borderRadius="6px" />
      <Shimmer width="60px" height="12px" borderRadius="4px" />
    </div>
  );
}

function FeedItemSkeleton() {
  return (
    <div className="feed-item" style={{ opacity: 0.6 }}>
      <Shimmer width="36px" height="36px" borderRadius="50%" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Shimmer width="120px" height="14px" borderRadius="4px" />
        <Shimmer width="80px" height="10px" borderRadius="4px" />
      </div>
      <Shimmer width="60px" height="16px" borderRadius="4px" />
    </div>
  );
}

function VendorRowSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
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
  );
}

export default function DashboardLoading() {
  return (
    <div className="page">
      {/* Top Bar */}
      <nav className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div className={styles.topbarLogo}>
            <span>⚡</span>
            <span style={{ fontWeight: 800 }}>VendorSplit</span>
            <span style={{ margin: '0 8px', color: 'var(--color-slate)' }}>/</span>
            <span style={{ color: 'var(--color-slate-light)' }}>Organizer Portal</span>
          </div>
          <span className={styles.modeBadge}>🧪 Sandbox Mode</span>
        </div>
      </nav>

      <div className={styles.layout}>
        {/* Sidebar Skeleton */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h4 className={styles.sidebarLabel}>Your Events</h4>
            <Shimmer width="100%" height="38px" borderRadius="8px" />
            <Shimmer width="100%" height="38px" borderRadius="8px" />
          </div>
          <div className={styles.sidebarSection}>
            <Shimmer width="100%" height="40px" borderRadius="8px" />
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className={styles.main}>
          {/* Header */}
          <div className={styles.header}>
            <div>
              <Shimmer width="280px" height="28px" borderRadius="6px" />
              <div style={{ marginTop: '8px' }}>
                <Shimmer width="400px" height="16px" borderRadius="4px" />
              </div>
            </div>
            <Shimmer width="140px" height="36px" borderRadius="8px" />
          </div>

          {/* Stats Grid */}
          <div className={`stats-grid ${styles.statsSection}`}>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          {/* Two Columns */}
          <div className={styles.columns}>
            {/* Feed */}
            <div className="card" style={{ flex: 1.2 }}>
              <div className={styles.cardHeader}>
                <Shimmer width="140px" height="16px" borderRadius="4px" />
                <Shimmer width="50px" height="14px" borderRadius="4px" />
              </div>
              <div className={styles.feedList}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <FeedItemSkeleton key={i} />
                ))}
              </div>
            </div>

            {/* Vendor Breakdown */}
            <div className="card" style={{ flex: 1 }}>
              <div className={styles.cardHeader}>
                <Shimmer width="160px" height="16px" borderRadius="4px" />
              </div>
              <div className={styles.vendorList}>
                {[0, 1, 2].map((i) => (
                  <VendorRowSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
