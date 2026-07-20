'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './dashboard.module.css';

export function DashboardSidebar({ events, defaultEventId }: { events: any[], defaultEventId: string }) {
  const searchParams = useSearchParams();
  const queryEventId = searchParams.get('eventId');
  const activeEventId = queryEventId || defaultEventId;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarSection}>
        <h4 className={styles.sidebarLabel}>Your Events</h4>
        {events.map((ev) => (
          <Link
            key={ev.id}
            href={`?eventId=${ev.id}`}
            className={`${styles.sidebarItem} ${ev.id === activeEventId ? styles.sidebarItemActive : ''}`}
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
  );
}
