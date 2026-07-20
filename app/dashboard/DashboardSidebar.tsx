'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import styles from './dashboard.module.css';
import { useDashboard } from './DashboardContext';

export function DashboardSidebar({ events }: { events: any[] }) {
  const router = useRouter();
  const { optimisticEventId, setOptimisticEventId } = useDashboard();
  const [isPending, startTransition] = useTransition();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarSection}>
        <h4 className={styles.sidebarLabel}>Your Events</h4>
        {events.map((ev) => (
          <a
            key={ev.id}
            href={`?eventId=${ev.id}`}
            onClick={(e) => {
              e.preventDefault();
              // Update context instantly for 0ms delay UI transition
              setOptimisticEventId(ev.id);
              // Background network request to fetch the new page
              startTransition(() => {
                router.push(`?eventId=${ev.id}`);
              });
            }}
            className={`${styles.sidebarItem} ${ev.id === optimisticEventId ? styles.sidebarItemActive : ''}`}
          >
            <span className={styles.sidebarItemDot} />
            <span>{ev.name}</span>
          </a>
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
