export const metadata = { title: 'Disclaimer – VirtuEx' };

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

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Disclaimer</h1>
        <p className="text-muted-foreground text-sm mb-12">
          Last updated: January 2025
        </p>

        <Section title="Educational Purpose Only">
          <p>
            VirtuEx is a virtual trading simulation platform created as a
            final-year software engineering exam project (vizsgaremek). It is
            intended purely for educational and demonstration purposes.
          </p>
          <p>
            Nothing on VirtuEx constitutes financial advice, investment advice,
            trading advice, or any other type of advice. You should not treat
            any information displayed on the platform as a basis for real
            investment decisions.
          </p>
        </Section>

        <Section title="No Real Money">
          <p>
            All currency balances, asset holdings, and transactions on VirtuEx
            are entirely simulated. No real money is deposited, held, or
            transferred at any point. The USD balance in your wallet has no
            real-world monetary value.
          </p>
        </Section>

        <Section title="Market Data">
          <p>
            Price data displayed on VirtuEx is sourced from Yahoo Finance and is
            provided for informational and educational use only. Data accuracy,
            completeness, or timeliness is not guaranteed. Past performance of
            any asset shown on this platform does not indicate future results.
          </p>
        </Section>

        <Section title="Not a Licensed Service">
          <p>
            VirtuEx is not a licensed broker, exchange, financial institution,
            or investment service. The platform is not regulated by any
            financial authority. Users should seek qualified professional advice
            before making any real investment decisions.
          </p>
        </Section>

        <Section title="Limitation of Liability">
          <p>
            The VirtuEx development team accepts no liability for decisions made
            based on information obtained through this platform, nor for any
            technical errors, interruptions, or inaccuracies in market data.
          </p>
        </Section>

        <Section title="Third-Party Content">
          <p>
            VirtuEx may display data, charts, or links from third-party sources
            (e.g. Yahoo Finance, TradingView). We are not responsible for the
            content, accuracy, or availability of third-party services.
          </p>
        </Section>

        <div className="p-4 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
          <strong className="text-foreground">Summary:</strong> VirtuEx is a
          student project. All trading is simulated. Do not use this platform as
          a basis for real financial decisions. Not financial advice.
        </div>
      </div>
    </div>
  );
}
