import { cn } from '@/lib/utils';

const GraphIcon = ({ className }: { className?: string }) => (
    <svg 
        className={className} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M3 3v18h18" />
        <path d="M7 14v4" />
        <path d="M12 10v8" />
        <path d="M17 6v12" />
    </svg>
);


export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <GraphIcon className="h-7 w-7 text-primary" />
      <h1 className="text-xl font-bold tracking-tighter text-foreground font-headline">SashaLeads AI</h1>
    </div>
  );
}

export function LogoIcon({ className }: { className?: string }) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <GraphIcon className="h-7 w-7 text-primary" />
      </div>
    );
  }
