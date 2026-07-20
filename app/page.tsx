import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className="page">
      {/* ---- Nav ---- */}
      <nav className={styles.nav}>
        <div className={`container ${styles.navInner}`}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            <span className={styles.logoText}>VendorSplit</span>
          </div>
          <div className={styles.navLinks}>
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Launch Dashboard →
            </Link>
          </div>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              Built on Pinch Payments
            </div>
            <h1 className={styles.heroTitle}>
              Payments that{" "}
              <span className={styles.heroGradient}>split themselves</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Automate vendor payment splitting for food truck festivals, pop-up
              markets, and events. Onboard vendors in seconds, collect payments
              via QR, and settle commissions automatically.
            </p>
            <div className={styles.heroCta}>
              <Link href="/dashboard" className="btn btn-primary btn-lg">
                Get Started — It&apos;s Free
              </Link>
              <Link href="#how-it-works" className="btn btn-secondary btn-lg">
                How It Works
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className={styles.socialProof}>
            <div className={styles.proofStat}>
              <span className={styles.proofValue}>10,000+</span>
              <span className={styles.proofLabel}>Markets & events in Australia</span>
            </div>
            <div className={styles.proofDivider} />
            <div className={styles.proofStat}>
              <span className={styles.proofValue}>$2.3B</span>
              <span className={styles.proofLabel}>Market industry size</span>
            </div>
            <div className={styles.proofDivider} />
            <div className={styles.proofStat}>
              <span className={styles.proofValue}>&lt; 60s</span>
              <span className={styles.proofLabel}>Vendor onboarding time</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section className={styles.howItWorks} id="how-it-works">
        <div className="container">
          <h2 className={styles.sectionTitle}>Three steps. Zero spreadsheets.</h2>
          <div className={styles.stepsGrid}>
            <div className={`card ${styles.step}`}>
              <div className={styles.stepNumber}>01</div>
              <h3>Create Your Event</h3>
              <p>
                Name your event, set your commission rate, and you&apos;re ready. Takes
                30 seconds.
              </p>
            </div>
            <div className={`card ${styles.step}`}>
              <div className={styles.stepNumber}>02</div>
              <h3>Onboard Vendors</h3>
              <p>
                Add vendors with their bank details. Each gets a unique QR payment
                code instantly — powered by Pinch Managed Merchants.
              </p>
            </div>
            <div className={`card ${styles.step}`}>
              <div className={styles.stepNumber}>03</div>
              <h3>Collect & Split</h3>
              <p>
                Customers scan and pay. Your commission is automatically
                deducted. Vendors see their sales in real time and get paid
                directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Built for event organizers</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>📱</div>
              <h4>QR Code Payments</h4>
              <p>Every vendor gets a unique QR code. Customers scan and pay on a secure Pinch-hosted checkout page.</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>💰</div>
              <h4>Automatic Commission</h4>
              <p>Set your commission rate once. Pinch deducts it from every payment automatically via Application Fees.</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>📊</div>
              <h4>Live Dashboard</h4>
              <p>Watch payments stream in across all vendors in real time. Know exactly how your event is performing.</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🏦</div>
              <h4>Direct Settlement</h4>
              <p>Vendors get paid directly to their bank account. No manual transfers, no reconciliation spreadsheets.</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🔒</div>
              <h4>Secure by Default</h4>
              <p>Pinch handles all payment processing and PCI compliance. You never touch card data.</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>⚡</div>
              <h4>60-Second Setup</h4>
              <p>Create an event and onboard your first vendor in under a minute. No paperwork, no waiting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Pricing ---- */}
      <section className={styles.pricing}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Simple pricing</h2>
          <p style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            No monthly fees. Pay only when you run events.
          </p>
          <div className={styles.pricingGrid}>
            <div className={`card ${styles.pricingCard}`}>
              <h3>Starter</h3>
              <div className={styles.price}>
                <span className={styles.priceAmount}>$49</span>
                <span className={styles.pricePeriod}>/ event</span>
              </div>
              <ul className={styles.pricingFeatures}>
                <li>Up to 20 vendors</li>
                <li>QR code payments</li>
                <li>Live dashboard</li>
                <li>Automatic settlement</li>
              </ul>
            </div>
            <div className={`card ${styles.pricingCard} ${styles.pricingFeatured}`}>
              <div className={styles.pricingBadge}>Popular</div>
              <h3>Pro</h3>
              <div className={styles.price}>
                <span className={styles.priceAmount}>$99</span>
                <span className={styles.pricePeriod}>/ event</span>
              </div>
              <ul className={styles.pricingFeatures}>
                <li>Up to 100 vendors</li>
                <li>Everything in Starter</li>
                <li>Vendor self-onboarding</li>
                <li>End-of-day reconciliation reports</li>
                <li>Priority support</li>
              </ul>
            </div>
            <div className={`card ${styles.pricingCard}`}>
              <h3>Organizer</h3>
              <div className={styles.price}>
                <span className={styles.priceAmount}>$149</span>
                <span className={styles.pricePeriod}>/ month</span>
              </div>
              <ul className={styles.pricingFeatures}>
                <li>Unlimited events & vendors</li>
                <li>Everything in Pro</li>
                <li>Multi-event management</li>
                <li>Custom branding</li>
                <li>API access</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <span className={styles.logoIcon}>⚡</span>
              <span className={styles.logoText}>VendorSplit</span>
            </div>
            <p className={styles.footerText}>
              Built with ❤️ for the Pinch Me! Hackathon 2026 · Powered by{" "}
              <a href="https://getpinch.com.au" target="_blank" rel="noopener noreferrer">
                Pinch Payments
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
