export const metadata = { title: 'Privacy Policy – VirtuEx' };

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="text-muted-foreground text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-12">
          Last updated: January 2025
        </p>

        <Section title="1. Introduction">
          <p>
            VirtuEx (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the
            platform&rdquo;) is an educational virtual trading simulation built
            as an exam project. This Privacy Policy explains what personal data
            we collect, how we use it, and your rights regarding that data.
          </p>
          <p>
            By registering for or using VirtuEx you agree to the practices
            described in this document.
          </p>
        </Section>

        <Section title="2. Data We Collect">
          <p>When you create an account we collect:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Email address and username</li>
            <li>Hashed password (we never store plain-text passwords)</li>
            <li>Optional profile avatar</li>
            <li>Subscription and billing-period preferences</li>
          </ul>
          <p>During normal use we also record:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Virtual trade orders and transaction history</li>
            <li>Wallet asset balances</li>
            <li>Audit log entries for security purposes</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Data">
          <p>We use your data solely to operate VirtuEx:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Authenticating you and keeping your session secure</li>
            <li>Maintaining your virtual portfolio and trade history</li>
            <li>Sending account activation and password-reset emails</li>
            <li>Enforcing plan limits (asset caps, top-up cooldowns)</li>
          </ul>
          <p>
            We do not sell, rent, or share your personal data with any third
            party for marketing purposes.
          </p>
        </Section>

        <Section title="4. Data Retention">
          <p>
            Your account data is retained for as long as your account is active.
            If you request account deletion we will remove your personal
            information within 30 days, except where retention is required by
            law.
          </p>
        </Section>

        <Section title="5. Cookies">
          <p>
            VirtuEx uses a small number of essential cookies to maintain your
            authentication session and remember your theme preference. We do not
            use advertising or tracking cookies. See our{' '}
            <a
              href="/legal/cookie-policy"
              className="text-primary hover:underline"
            >
              Cookie Policy
            </a>{' '}
            for details.
          </p>
        </Section>

        <Section title="6. Security">
          <p>
            All passwords are stored as bcrypt hashes. Communication between
            your browser and our servers is encrypted over HTTPS. We support
            optional two-factor authentication (TOTP) to further protect your
            account.
          </p>
        </Section>

        <Section title="7. Your Rights">
          <p>
            You may request access to, correction of, or deletion of your
            personal data at any time by contacting us at{' '}
            <a href="/contact" className="text-primary hover:underline">
              our contact page
            </a>
            .
          </p>
        </Section>

        <Section title="8. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Significant
            changes will be communicated via the platform. Your continued use of
            VirtuEx after such changes constitutes acceptance of the updated
            policy.
          </p>
        </Section>

        <p className="text-xs text-muted-foreground border-t border-border pt-8 mt-8">
          VirtuEx is an educational exam project and is not a licensed financial
          service.
        </p>
      </div>
    </div>
  );
}
