'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './new-vendor.module.css';
import { use } from 'react';

export default function NewVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const data = {
      eventId,
      name: form.get('name') as string,
      email: form.get('email') as string,
      phone: form.get('phone') as string,
      description: form.get('description') as string,
      bankBsb: form.get('bankBsb') as string,
      bankAccountNumber: form.get('bankAccountNumber') as string,
      bankAccountName: form.get('bankAccountName') as string,
      contactFirstName: form.get('contactFirstName') as string,
      contactLastName: form.get('contactLastName') as string,
    };

    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add vendor');
      }

      router.push(`/dashboard/events/${eventId}`);
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
          <Link href={`/dashboard/events/${eventId}`}>Event</Link>
          <span className={styles.sep}>→</span>
          <span>Add Vendor</span>
        </div>

        <div className={styles.formWrap}>
          <div className={styles.formHeader}>
            <h1>Add Vendor</h1>
            <p>
              Onboard a food truck or vendor. We&apos;ll create a Pinch Managed Merchant
              and generate their unique payment QR code.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Business Info */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Business Details</legend>

              <div className="form-group">
                <label className="form-label" htmlFor="name">Business Name *</label>
                <input
                  className="form-input"
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., Smokin' BBQ Bros"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Business Email *</label>
                <input
                  className="form-input"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="vendor@example.com"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone</label>
                  <input
                    className="form-input"
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="04XX XXX XXX"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description</label>
                  <input
                    className="form-input"
                    id="description"
                    name="description"
                    type="text"
                    placeholder="e.g., Wood-fired pizza"
                  />
                </div>
              </div>
            </fieldset>

            {/* Contact Person */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Primary Contact</legend>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="contactFirstName">First Name *</label>
                  <input
                    className="form-input"
                    id="contactFirstName"
                    name="contactFirstName"
                    type="text"
                    placeholder="First name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contactLastName">Last Name *</label>
                  <input
                    className="form-input"
                    id="contactLastName"
                    name="contactLastName"
                    type="text"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
            </fieldset>

            {/* Bank Details */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Bank Account (for payouts)</legend>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-slate)', marginBottom: 'var(--space-md)' }}>
                This is where the vendor will receive their payments, minus your commission.
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="bankAccountName">Account Name *</label>
                <input
                  className="form-input"
                  id="bankAccountName"
                  name="bankAccountName"
                  type="text"
                  placeholder="Account holder name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="bankBsb">BSB *</label>
                  <input
                    className="form-input"
                    id="bankBsb"
                    name="bankBsb"
                    type="text"
                    placeholder="000-000"
                    pattern="[0-9\-]{6,7}"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="bankAccountNumber">Account Number *</label>
                  <input
                    className="form-input"
                    id="bankAccountNumber"
                    name="bankAccountNumber"
                    type="text"
                    placeholder="000000000"
                    pattern="[0-9]{3,9}"
                    required
                  />
                </div>
              </div>
            </fieldset>

            {error && (
              <div className={styles.error}>
                ⚠️ {error}
              </div>
            )}

            <div className={styles.actions}>
              <Link href={`/dashboard/events/${eventId}`} className="btn btn-ghost">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Merchant...' : 'Add Vendor & Generate QR →'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
