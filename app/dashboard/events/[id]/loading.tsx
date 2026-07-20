import styles from './event.module.css';

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
      <Shimmer width="100px" height="28px" borderRadius="6px" />
    </div>
  );
}

function VendorCardSkeleton() {
  return (
    <div className={`card ${styles.vendorCard}`}>
      <div className={styles.vendorHeader}>
        <Shimmer width="48px" height="48px" borderRadius="50%" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Shimmer width="120px" height="16px" borderRadius="4px" />
          <Shimmer width="60px" height="20px" borderRadius="100px" />
        </div>
      </div>
      <div className={styles.vendorStats}>
        <div className={styles.vendorStatItem}>
          <Shimmer width="40px" height="8px" borderRadius="3px" />
          <Shimmer width="60px" height="16px" borderRadius="4px" />
        </div>
        <div className={styles.vendorStatItem}>
          <Shimmer width="50px" height="8px" borderRadius="3px" />
          <Shimmer width="60px" height="16px" borderRadius="4px" />
        </div>
        <div className={styles.vendorStatItem}>
          <Shimmer width="60px" height="8px" borderRadius="3px" />
          <Shimmer width="30px" height="16px" borderRadius="4px" />
        </div>
      </div>
      <div className={styles.qrSection}>
        <Shimmer width="100%" height="40px" borderRadius="8px" />
      </div>
    </div>
  );
}

export default function EventDetailLoading() {
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

      <main className={styles.main}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Shimmer width="80px" height="14px" borderRadius="4px" />
          <span className={styles.breadcrumbSep}>→</span>
          <Shimmer width="160px" height="14px" borderRadius="4px" />
        </div>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <Shimmer width="300px" height="32px" borderRadius="6px" />
            <div style={{ marginTop: '8px' }}>
              <Shimmer width="420px" height="16px" borderRadius="4px" />
            </div>
          </div>
          <Shimmer width="120px" height="40px" borderRadius="8px" />
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Vendors heading */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <Shimmer width="120px" height="24px" borderRadius="6px" />
        </div>

        {/* Vendor cards grid */}
        <div className="vendors-grid">
          <VendorCardSkeleton />
          <VendorCardSkeleton />
          <VendorCardSkeleton />
        </div>
      </main>
    </div>
  );
}
