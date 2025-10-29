import { BotMessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <BotMessageSquare className="h-7 w-7 text-primary" />
      <h1 className="text-xl font-bold text-foreground">SashaLeads AI</h1>
    </div>
  );
}

export function LogoIcon({ className }: { className?: string }) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <BotMessageSquare className="h-7 w-7 text-primary" />
      </div>
    );
  }
