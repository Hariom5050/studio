"use client"

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
import { Suspense } from 'react';
import Logo from '@/components/logo';

function ChatPageContent() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-center gap-2 p-2">
            <Logo />
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
            <div className="flex items-center flex-1 gap-2 text-center md:text-left">
              <div className="md:hidden">
                <Logo />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground">
                  KWS AI
                </h1>
                <p className="text-sm text-muted-foreground">Your guide to a better world.</p>
              </div>
            </div>
          </header>

          <ChatInterface />

          <footer className="p-4 mt-auto text-center text-sm text-muted-foreground">
            <p>KWS AI may display inaccurate information. Please verify important details.</p>
            <p>The KWS AI is created and designed by Hariom Singh and Akshit Khare.</p>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function ChatPageFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-semibold text-muted-foreground">Loading KWS AI...</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<ChatPageFallback />}>
      <ChatPageContent />
    </Suspense>
  );
}
