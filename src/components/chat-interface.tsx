"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import type { Message } from "@/lib/types";
import { friendlyGreeting } from "@/ai/flows/friendly-greeting";
import { getLocalizedSustainabilityTip } from "@/ai/flows/localized-sustainability-tip";
import { contextualAwareness } from "@/ai/flows/contextual-awareness";
import { encouragePledge } from "@/ai/flows/pledge-encouragement";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendHorizonal, LoaderCircle, RotateCw } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { PledgeDisplay } from "./pledge-display";
import { useToast } from "@/hooks/use-toast";

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pledges, setPledges] = useState<string[]>([]);
  const [pledgeOffered, setPledgeOffered] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const initChat = async () => {
    setIsLoading(true);
    setMessages([]);
    setInput("");
    setPledges([]);
    setPledgeOffered(false);

    try {
      const greeting = await friendlyGreeting();
      addMessage('assistant', greeting.greeting, undefined, true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const location = `lat: ${latitude}, lon: ${longitude}`;
          try {
            const tip = await getLocalizedSustainabilityTip({ location });
            addMessage('assistant', tip.tip);
          } catch (error) {
            console.error("Error getting sustainability tip:", error);
            addMessage('assistant', "I couldn't fetch a local tip, but here's a general one: Remember to reduce, reuse, and recycle!");
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.warn("Geolocation denied:", error.message);
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Error initializing chat:", error);
      addMessage('assistant', "I'm having trouble getting started. Please try refreshing the page.", undefined, true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (role: 'user' | 'assistant', content: string, pledgeIdeas?: string[], reset = false) => {
    setMessages(prev => {
      const newMessage = { id: crypto.randomUUID(), role, content, pledgeIdeas };
      return reset ? [newMessage] : [...prev, newMessage];
    });
  };

  const handlePledgeSelect = (pledge: string) => {
    setPledges((prev) => [...prev, pledge]);
    setMessages(prev => prev.filter(m => !m.pledgeIdeas));
    addMessage('assistant', "That's a wonderful pledge! Thank you for your commitment. Every small action makes a big difference.");
    toast({
      title: "Pledge Made!",
      description: "You're making the world a better place.",
    });
  };

  const handleReset = () => {
    initChat();
    toast({
      title: "Chat Reset",
      description: "The conversation has been cleared.",
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input;
    addMessage('user', userInput);
    setInput("");
    setIsLoading(true);

    const userMessageCount = messages.filter(m => m.role === 'user').length + 1;

    try {
      const conversationHistory = messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      
      if(userMessageCount === 3 && !pledgeOffered) {
        setPledgeOffered(true);
        const pledgeResponse = await encouragePledge({ conversationHistory: JSON.stringify(conversationHistory) });
        addMessage('assistant', pledgeResponse.encouragement, pledgeResponse.pledgeIdeas);
      } else {
        const response = await contextualAwareness({ message: userInput, conversationHistory });
        addMessage('assistant', response.response);
      }
    } catch (error) {
      console.error("Error with AI flow:", error);
      addMessage('assistant', "I'm having a little trouble connecting. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full max-w-2xl mx-auto">
      <ScrollArea className="flex-1 h-[calc(100vh-200px)] p-4 pr-6" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} onPledgeSelect={handlePledgeSelect} />
          ))}
          {isLoading && messages.length > 0 && (
            <div className="flex justify-start">
              <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      </ScrollArea>

      <PledgeDisplay pledges={pledges} />

      <div className="p-4 bg-background">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your thoughts..."
            rows={1}
            className="flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <SendHorizonal className="w-4 h-4" />}
            <span className="sr-only">Send</span>
          </Button>
          <Button type="button" size="icon" variant="outline" onClick={handleReset} disabled={isLoading}>
            <RotateCw className="w-4 h-4" />
            <span className="sr-only">Reset Chat</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
