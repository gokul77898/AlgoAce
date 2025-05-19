import { BotMessageSquare } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="bg-primary text-primary-foreground py-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center gap-3 px-4 md:px-6">
        <BotMessageSquare className="h-8 w-8 md:h-10 md:w-10" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AlgoAce</h1>
      </div>
    </header>
  );
}
