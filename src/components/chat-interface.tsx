"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import type { Message, Conversation } from "@/lib/types";
import { friendlyGreeting } from "@/ai/flows/friendly-greeting";
import { getLocalizedSustainabilityTip } from "@/ai/flows/localized-sustainability-tip";
import { contextualAwareness } from "@/ai/flows/contextual-awareness";
import { encouragePledge } from "@/ai/flows/pledge-encouragement";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendHorizonal, LoaderCircle, Search } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { PledgeDisplay } from "./pledge-display";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSearchParams, useRouter } from 'next/navigation';

const CONVERSATION_KEY_PREFIX = 'conversation_';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pledges, setPledges] = useState<string[]>([]);
  const [pledgeOffered, setPledgeOffered] = useState(false);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get('id');

  const initChat = async (convoId: string | null) => {
    setIsLoading(true);
    setInput("");
    setPledges([]);
    setPledgeOffered(false);
    
    if (convoId) {
      // Load existing conversation
      const storedConvo = localStorage.getItem(`${CONVERSATION_KEY_PREFIX}${convoId}`);
      if (storedConvo) {
        const conversation: Conversation = JSON.parse(storedConvo);
        setMessages(conversation.messages);
        setPledges(conversation.pledges || []);
        setCurrentConversationId(convoId);
        setIsLoading(false);
        return;
      }
    }

    // Start a new conversation
    const newConvoId = crypto.randomUUID();
    setCurrentConversationId(newConvoId);
    setMessages([]);
    router.push(`/?id=${newConvoId}`, { scroll: false });
    
    try {
      const greeting = await friendlyGreeting();
      addMessage(newConvoId, 'assistant', greeting.greeting, undefined, true);
      addMessage(newConvoId, 'assistant', 'For a better experience, please allow location permissions when prompted.');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const location = `lat: ${latitude}, lon: ${longitude}`;
          try {
            const tip = await getLocalizedSustainabilityTip({ location });
            addMessage(newConvoId, 'assistant', tip.tip);
          } catch (error) {
            console.error("Error getting sustainability tip:", error);
            addMessage(newConvoId, 'assistant', "I couldn't fetch a local tip, but here's a general one: Remember to reduce, reuse, and recycle!");
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.warn("Geolocation denied:", error.message);
          addMessage(newConvoId, 'assistant', "Since location is not available, here's a general tip: Remember to reduce, reuse, and recycle!");
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Error initializing chat:", error);
      addMessage(newConvoId, 'assistant', "I'm having trouble getting started. Please try refreshing the page.", undefined, true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initChat(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const saveConversation = (id: string, updatedMessages: Message[], updatedPledges: string[]) => {
     if (!id) return;
    const conversation: Conversation = {
        id: id,
        title: updatedMessages.find(m => m.role === 'user')?.content.substring(0, 40) || 'New Conversation',
        messages: updatedMessages,
        pledges: updatedPledges,
        timestamp: new Date().toISOString(),
    };
    localStorage.setItem(`${CONVERSATION_KEY_PREFIX}${id}`, JSON.stringify(conversation));
    window.dispatchEvent(new Event('storage')); // Notify other components of the change
  };


  const addMessage = (convoId: string | null, role: 'user' | 'assistant', content: string, pledgeIdeas?: string[], reset = false) => {
    setMessages(prev => {
      const newMessage: Message = { id: crypto.randomUUID(), role, content, pledgeIdeas };
      const newMessages = reset ? [newMessage] : [...prev, newMessage];
      if (convoId) {
        saveConversation(convoId, newMessages, pledges);
      }
      return newMessages;
    });
  };

  const handlePledgeSelect = (pledge: string) => {
    const updatedPledges = [...pledges, pledge];
    setPledges(updatedPledges);
    const updatedMessages = messages.filter(m => !m.pledgeIdeas);
    setMessages(updatedMessages);

    const confirmationMessage: Message = { id: crypto.randomUUID(), role: 'assistant', content: "That's a wonderful pledge! Thank you for your commitment. Every small action makes a big difference."};
    const finalMessages = [...updatedMessages, confirmationMessage];
    setMessages(finalMessages);
    
    if (currentConversationId) {
      saveConversation(currentConversationId, finalMessages, updatedPledges);
    }
    toast({
      title: "Pledge Made!",
      description: "You're making the world a better place.",
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentConversationId) return;

    const userInput = input;
    addMessage(currentConversationId, 'user', userInput);
    setInput("");
    setIsLoading(true);

    const userMessageCount = messages.filter(m => m.role === 'user').length + 1;

    try {
      const conversationHistory = messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      
      if(userMessageCount === 3 && !pledgeOffered) {
        setPledgeOffered(true);
        const pledgeResponse = await encouragePledge({ conversationHistory: JSON.stringify(conversationHistory) });
        addMessage(currentConversationId, 'assistant', pledgeResponse.encouragement, pledgeResponse.pledgeIdeas);
      } else {
        const response = await contextualAwareness({ message: userInput, conversationHistory, webSearchEnabled: isWebSearchEnabled });
        addMessage(currentConversationId, 'assistant', response.response);
      }
    } catch (error) {
      console.error("Error with AI flow:", error);
      addMessage(currentConversationId, 'assistant', "I'm having a little trouble connecting. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full max-w-2xl mx-auto">
      <ScrollArea className="flex-1 p-4 pr-6" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} onPledgeSelect={handlePledgeSelect} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="sticky bottom-0 bg-background">
        <PledgeDisplay pledges={pledges} />

        <div className="p-4">
          <form onSubmit={handleSubmit} className="flex items-start gap-2">
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
          </form>
          <div className="flex items-center justify-end pt-2 space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="web-search-toggle" className="text-sm text-muted-foreground">
                Web Search
              </Label>
              <Switch
                id="web-search-toggle"
                checked={isWebSearchEnabled}
                onCheckedChange={setIsWebSearchEnabled}
                disabled={isLoading}
              />
            </div>
        </div>
      </div>
    </div>
  );
}
