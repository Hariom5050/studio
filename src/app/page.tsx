import { ChatInterface } from '@/components/chat-interface';
import { ChatHistory } from '@/components/chat-history';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Globe } from 'lucide-react';

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight font-headline text-foreground">
              KWS Ai
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <ChatHistory />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
          <header className="sticky top-0 z-10 flex items-center w-full p-4 border-b shadow-sm bg-background/90 backdrop-blur-sm">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground">
                KWS Ai
              </h1>
              <p className="text-sm text-muted-foreground">Your guide to a better world.</p>
            </div>
          </header>

          <ChatInterface />

          <footer className="p-4 mt-auto text-center text-sm text-muted-foreground">
            <p>KWS Ai can make mistakes, so double-check it.</p>
            <p>&copy; {new Date().getFullYear()} KWS Ai. All Rights Reserved.</p>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
