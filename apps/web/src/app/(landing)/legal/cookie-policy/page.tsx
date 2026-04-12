export const metadata = { title: 'Cookie Policy – VirtuEx' };

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

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-muted-foreground text-sm mb-12">
          Last updated: January 2025
        </p>

        <Section title="1. What Are Cookies?">
          <p>
            Cookies are small text files stored in your browser when you visit a
            website. They allow the site to remember certain information about
            your visit, such as whether you are logged in or which theme you
            have selected.
          </p>
        </Section>

        <Section title="2. Cookies We Use">
          <p>
            VirtuEx uses only essential cookies necessary for the platform to
            function:
          </p>

          <table className="w-full text-xs border border-border rounded-lg overflow-hidden mt-2">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">Cookie</th>
                <th className="text-left px-3 py-2 font-semibold">Purpose</th>
                <th className="text-left px-3 py-2 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono">session</td>
                <td className="px-3 py-2">
                  Keeps you logged in between page loads
                </td>
                <td className="px-3 py-2">Session / 7 days</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono">theme</td>
                <td className="px-3 py-2">
                  Remembers your light/dark mode preference
                </td>
                <td className="px-3 py-2">1 year</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="3. Cookies We Do Not Use">
          <p>
            We do not use advertising, analytics tracking, or third-party
            marketing cookies. VirtuEx does not integrate with ad networks or
            behavioural tracking services.
          </p>
        </Section>

        <Section title="4. Local Storage">
          <p>
            In addition to cookies, VirtuEx uses browser local storage to save
            chart preferences (such as your selected chart type and mock data)
            between visits. This data never leaves your device and is not
            transmitted to our servers.
          </p>
        </Section>

        <Section title="5. Managing Cookies">
          <p>
            You can clear or block cookies via your browser settings at any
            time. Note that disabling the session cookie will prevent you from
            staying logged in. Clearing local storage will reset your chart
            preferences.
          </p>
        </Section>

        <Section title="6. Changes to This Policy">
          <p>
            We may update this Cookie Policy as the platform evolves. Any
            significant changes will be noted on this page with a revised
            &ldquo;Last updated&rdquo; date.
          </p>
        </Section>

        <p className="text-xs text-muted-foreground border-t border-border pt-8 mt-8">
          See also:{' '}
          <a
            href="/legal/privacy-policy"
            className="text-primary hover:underline"
          >
            Privacy Policy
          </a>{' '}
          ·{' '}
          <a
            href="/legal/terms-of-service"
            className="text-primary hover:underline"
          >
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}
