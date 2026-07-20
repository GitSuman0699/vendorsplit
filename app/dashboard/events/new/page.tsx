'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './new-event.module.css';

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get('name') as string,
      description: form.get('description') as string,
      date: form.get('date') as string,
      location: form.get('location') as string,
      commissionRate: parseFloat(form.get('commissionRate') as string) / 100,
    };

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create event');
      }

      const result = await res.json();
      router.push(`/dashboard/events/${result.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <nav className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/dashboard" className={styles.topbarLogo}>
            <span>⚡</span>
            <span style={{ fontWeight: 800 }}>VendorSplit</span>
            <span style={{ margin: '0 8px', color: 'var(--color-slate)' }}>/</span>
            <span style={{ color: 'var(--color-slate-light)' }}>Organizer Portal</span>
          </Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.breadcrumb}>
          <Link href="/dashboard">Dashboard</Link>
          <span className={styles.sep}>→</span>
          <span>New Event</span>
        </div>

        <div className={styles.formWrap}>
          <div className={styles.formHeader}>
            <h1>Create Event</h1>
            <p>Set up your food truck festival, pop-up market, or event.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Event Name *</label>
              <input
                className="form-input"
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Sydney Street Eats Festival"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description</label>
              <textarea
                className="form-input"
                id="description"
                name="description"
                placeholder="Describe your event..."
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="date">Event Date *</label>
                <input
                  className="form-input"
                  id="date"
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="location">Location *</label>
                <input
                  className="form-input"
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g., The Rocks, Sydney"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="commissionRate">
                Commission Rate (%) *
              </label>
              <input
                className="form-input"
                id="commissionRate"
                name="commissionRate"
                type="number"
                min="0"
                max="50"
                step="0.5"
                defaultValue="10"
                required
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-slate)' }}>
                This percentage will be automatically deducted from each vendor payment as your commission.
              </span>
            </div>

            {error && (
              <div className={styles.error}>
                ⚠️ {error}
              </div>
            )}

            <div className={styles.actions}>
              <Link href="/dashboard" className="btn btn-ghost">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Event →'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
