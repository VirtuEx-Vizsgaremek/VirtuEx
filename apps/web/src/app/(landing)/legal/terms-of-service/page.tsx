export const metadata = { title: 'Terms of Service – VirtuEx' };

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

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-12">
          Last updated: January 2025
        </p>

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using VirtuEx you agree to be bound by these Terms
            of Service. If you do not agree, please do not use the platform.
          </p>
        </Section>

        <Section title="2. Nature of the Service">
          <p>
            VirtuEx is a virtual trading simulation platform built as an
            educational exam project. All funds, assets, and transactions on the
            platform are simulated and have no real monetary value. VirtuEx is
            not a licensed broker, exchange, or financial service provider.
          </p>
        </Section>

        <Section title="3. Account Registration">
          <p>
            You must be at least 16 years old to create an account. You are
            responsible for maintaining the security of your credentials. Notify
            us immediately if you suspect unauthorised access to your account.
          </p>
          <p>
            You agree not to create accounts with false identities, share access
            credentials, or use the platform for any purpose other than personal
            educational use.
          </p>
        </Section>

        <Section title="4. Subscriptions and Virtual Payments">
          <p>
            Paid subscription plans (Standard and Pro) are priced in USD and
            charged to your virtual USD wallet balance within the platform. No
            real money is transferred. Plan fees are deducted from your
            in-platform balance at the time of subscription.
          </p>
          <p>
            You may cancel or change your plan at any time. Downgrades take
            effect at the end of the current billing period. We reserve the
            right to modify plan pricing with reasonable notice.
          </p>
        </Section>

        <Section title="5. Acceptable Use">
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>
              Attempt to manipulate platform data or exploit technical
              vulnerabilities
            </li>
            <li>Use automated scripts or bots to interact with the platform</li>
            <li>
              Reverse engineer or copy any part of the VirtuEx codebase without
              permission
            </li>
            <li>
              Use the platform in a way that disrupts service for other users
            </li>
          </ul>
        </Section>

        <Section title="6. Intellectual Property">
          <p>
            The VirtuEx source code is available on GitHub. Contributions and
            forks are welcome under the terms of the applicable open-source
            licence. The VirtuEx name and logo are the property of the project
            team.
          </p>
        </Section>

        <Section title="7. Disclaimer of Warranties">
          <p>
            VirtuEx is provided &ldquo;as is&rdquo; without warranty of any
            kind. We do not guarantee continuous availability, accuracy of
            market data, or fitness for any particular purpose. Use the platform
            at your own discretion.
          </p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, the VirtuEx team shall not
            be liable for any direct, indirect, incidental, or consequential
            damages arising from your use of the platform.
          </p>
        </Section>

        <Section title="9. Changes to Terms">
          <p>
            We may update these Terms at any time. Continued use of VirtuEx
            after changes are posted constitutes your acceptance of the revised
            Terms.
          </p>
        </Section>

        <p className="text-xs text-muted-foreground border-t border-border pt-8 mt-8">
          Questions? Visit our{' '}
          <a href="/contact" className="text-primary hover:underline">
            contact page
          </a>
          .
        </p>
      </div>
    </div>
  );
}
