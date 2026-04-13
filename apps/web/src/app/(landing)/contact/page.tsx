import { Card, CardContent } from '@/components/ui/card';
import { SiGithub } from '@icons-pack/react-simple-icons';
import { Mail, MessageSquare } from 'lucide-react';

export const metadata = { title: 'Contact – VirtuEx' };

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="container mx-auto px-6 py-16 text-center max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Get in{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
            Touch
          </span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Have a question, found a bug, or want to give feedback? We'd love to
          hear from you. VirtuEx is an exam project, so our response times may
          vary — but we read everything.
        </p>
      </section>

      {/* Contact options */}
      <section className="container mx-auto px-6 pb-24 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6 border-border bg-card">
            <CardContent className="p-0 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <SiGithub className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">GitHub Issues</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  The best way to report bugs or request features is to open an
                  issue on our GitHub repository.
                </p>
                <a
                  href="https://github.com/VirtuEx-Vizsgaremek/VirtuEx/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Open an issue →
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6 border-border bg-card">
            <CardContent className="p-0 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For general enquiries or anything not suited for a public
                  issue tracker, you can reach the team by email.
                </p>
                <a
                  href="mailto:contact@virtuex.example"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  contact@virtuex.example
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message form — static placeholder */}
        <Card className="p-6 md:p-8 border-border bg-card">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Send a Message</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell us what's on your mind…"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This form is a placeholder and does not currently send messages.
                Please use GitHub Issues or email to reach us.
              </p>
              <button
                disabled
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium opacity-50 cursor-not-allowed"
              >
                Send Message
              </button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
