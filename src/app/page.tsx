import { ChatInterface } from '@/components/chat-interface';
import { Globe } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="sticky top-0 z-10 flex items-center justify-center w-full p-4 border-b shadow-sm bg-background/90 backdrop-blur-sm">
        <Globe className="w-8 h-8 mr-3 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-center font-headline text-foreground">
          KWS AI: Global Compass
        </h1>
      </header>
      
      <ChatInterface />
      
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} KWS AI. Your guide to a better world.</p>
      </footer>
    </div>
  );
}
