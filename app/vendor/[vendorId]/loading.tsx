import styles from './vendor.module.css';

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

function TableRowSkeleton() {
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
      <td style={{ padding: 'var(--space-sm) var(--space-md)' }}>
        <Shimmer width="50px" height="14px" borderRadius="4px" />
      </td>
      <td style={{ padding: 'var(--space-sm) var(--space-md)' }}>
        <Shimmer width="60px" height="14px" borderRadius="4px" />
      </td>
      <td style={{ padding: 'var(--space-sm) var(--space-md)' }}>
        <Shimmer width="60px" height="14px" borderRadius="4px" />
      </td>
      <td style={{ padding: 'var(--space-sm) var(--space-md)' }}>
        <Shimmer width="70px" height="22px" borderRadius="100px" />
      </td>
    </tr>
  );
}

export default function VendorLoading() {
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
            <Shimmer width="240px" height="36px" borderRadius="6px" />
            <div style={{ marginTop: '8px' }}>
              <Shimmer width="200px" height="18px" borderRadius="4px" />
            </div>
          </div>
        </div>

        <div className={styles.layoutGrid}>
          {/* POS Column Skeleton */}
          <div className={styles.posColumn}>
            <div className={`card ${styles.posCard}`}>
              <div className={styles.posIcon}>🍔</div>
              <Shimmer width="140px" height="24px" borderRadius="6px" />
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <Shimmer width="100%" height="44px" borderRadius="8px" />
                <Shimmer width="100%" height="44px" borderRadius="8px" />
                <Shimmer width="100%" height="44px" borderRadius="8px" />
              </div>
            </div>
          </div>

          {/* Stats Column Skeleton */}
          <div className={styles.statsColumn}>
            {/* Stats */}
            <div className={styles.statsGrid}>
              <div className="card stat-card">
                <Shimmer width="70px" height="12px" borderRadius="4px" />
                <Shimmer width="100px" height="28px" borderRadius="6px" />
              </div>
              <div className="card stat-card">
                <Shimmer width="90px" height="12px" borderRadius="4px" />
                <Shimmer width="80px" height="28px" borderRadius="6px" />
                <Shimmer width="120px" height="10px" borderRadius="3px" />
              </div>
            </div>

            {/* Transactions Table */}
            <div style={{ marginTop: 'var(--space-2xl)' }}>
              <Shimmer width="180px" height="20px" borderRadius="6px" />
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 'var(--space-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
                    <th style={{ padding: 'var(--space-sm) var(--space-md)', color: 'var(--color-slate)', fontSize: '0.8rem' }}>Time</th>
                    <th style={{ padding: 'var(--space-sm) var(--space-md)', color: 'var(--color-slate)', fontSize: '0.8rem' }}>Amount</th>
                    <th style={{ padding: 'var(--space-sm) var(--space-md)', color: 'var(--color-slate)', fontSize: '0.8rem' }}>Net</th>
                    <th style={{ padding: 'var(--space-sm) var(--space-md)', color: 'var(--color-slate)', fontSize: '0.8rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2, 3].map((i) => (
                    <TableRowSkeleton key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
