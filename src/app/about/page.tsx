import { ShieldCheck, Zap, Layers, BrainCircuit, Mail, MessageSquare, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo, LogoIcon } from '@/components/logo';

const features = [
  {
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    title: 'Platform-Aware AI Assistant',
    description: "Engage with Sasha, an AI that has a deep, real-time understanding of your entire CRM. Ask complex questions like 'What are my team's highest-value leads?' or 'Summarize our progress with Innovate Inc.' and get instant, data-driven answers to accelerate decision-making.",
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Intelligent Automation',
    description: 'Automate repetitive tasks from lead creation to task assignment. Our AI analyzes patterns to predict lead ROI and assess risks, freeing your team to focus on strategic growth and closing high-value deals.',
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: 'Instant Team Sync',
    description: 'A centralized hub for real-time communication. The integrated group chat ensures your entire team is aligned, allowing for instant feedback, file sharing, and quick decisions without ever switching context.',
  },
  {
    icon: <Video className="h-8 w-8 text-primary" />,
    title: 'Integrated HD Conferencing',
    description: 'Seamlessly transition from chat to a face-to-face video conference. Conduct strategy sessions, client calls, or daily stand-ups with high-definition video directly within the platform, keeping all communication in one place.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: 'Uncompromising Security',
    description: 'Built on a foundation of enterprise-grade security. From a mandatory verification gate to a powerful, granular data security model, your data is encrypted, isolated, and protected at every layer.',
  },
];

const upcomingFeatures = [
    { title: 'Predictive Lead Scoring', description: 'AI will automatically score new leads based on their likelihood to convert, allowing your team to prioritize efforts with precision.' },
    { title: 'Automated Email Sequences', description: 'Nurture leads with intelligent, automated email campaigns triggered by custom events and actions directly from within the CRM.' },
    { title: 'Deeper AI Analytics', description: 'Gain even deeper insights with advanced AI-driven reports on team performance, sales forecasting, and emerging market trends.' },
];

export default function AboutPage() {
  return (
    <div className="dark bg-background text-foreground min-h-screen">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      </div>
      
      <header className="py-6 px-4 md:px-8">
        <Logo />
      </header>

      <main className="container mx-auto px-4 py-16 text-center">
        <LogoIcon className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-6xl font-headline tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary">
          The Future of Intelligent CRM
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
          SashaLeads AI is not just a CRM; it's an intelligent growth engine. We fuse cutting-edge AI automation with a sleek, intuitive interface to empower your team, streamline your workflow, and amplify your results.
        </p>
      </main>

      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-headline text-center mb-12">Core Pillars of SashaLeads AI</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-card/50 backdrop-blur-sm border-border/50 text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="font-semibold text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-headline text-center mb-12">On the Horizon</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {upcomingFeatures.map((feature, index) => (
            <div key={index} className="p-6 border border-dashed border-border/30 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/50 py-24 mt-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-headline">Ready to Elevate Your Workflow?</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Request a personalized demo or apply for early access to experience the future of sales and task management.
          </p>
          <div className="mt-8">
            <a href="mailto:alimirabrar@gmail.com">
                <Button size="lg" className="group">
                    Contact Us
                    <Mail className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
            </a>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} SashaLeads AI. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
