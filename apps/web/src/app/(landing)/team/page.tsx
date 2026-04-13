import { Card, CardContent } from '@/components/ui/card';
import { SiGithub } from '@icons-pack/react-simple-icons';

export const metadata = { title: 'Team – VirtuEx' };

const TEAM = [
  {
    name: 'TheClashFruit',
    role: 'Full-Stack Developer',
    bio: 'Responsible for the core trading engine, API architecture, and database design. Focused on building a reliable, high-precision order system.',
    github: 'https://github.com/TheClashFruit'
  },
  {
    name: 'ItsMeHaxMaster',
    role: 'Full-Stack Developer',
    bio: 'Built the market page, interactive charts, and the mobile-responsive UI. Passionate about clean interfaces and smooth user experience.',
    github: 'https://github.com/ItsMeHaxMaster'
  },
  {
    name: 'HerBenHub',
    role: 'Full-Stack Developer',
    bio: 'Designed the authentication flow, subscription system, and wallet top-up logic. Focused on security, data integrity, and API correctness.',
    github: 'https://github.com/HerBenHub'
  }
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="container mx-auto px-6 py-16 text-center max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Meet the{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
            Team
          </span>
        </h1>
        <p className="text-muted-foreground text-lg">
          VirtuEx was built by a small team of software engineering students for
          their graduation exam project. We combined our skills in frontend
          development, backend architecture, and system design to deliver a
          polished, end-to-end trading simulation platform.
        </p>
      </section>

      {/* Team Cards */}
      <section className="container mx-auto px-6 pb-24 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEAM.map((member) => (
            <Card
              key={member.name}
              className="p-6 border-border bg-card hover:border-primary transition-colors duration-300 flex flex-col"
            >
              <CardContent className="p-0 flex flex-col flex-1">
                {/* Avatar placeholder */}
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-2xl font-bold text-primary">
                  {member.name.charAt(0)}
                </div>
                <h2 className="text-lg font-semibold mb-0.5">{member.name}</h2>
                <p className="text-sm text-primary font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
                  {member.bio}
                </p>
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <SiGithub className="w-4 h-4" />
                  GitHub
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
