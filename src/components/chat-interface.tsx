
"use client";

import { useState, useEffect, useRef, type FormEvent, useCallback } from "react";
import type { Message, Conversation } from "@/lib/types";
import { getLocalizedSustainabilityTip } from "@/ai/flows/localized-sustainability-tip";
import { contextualAwareness } from "@/ai/flows/contextual-awareness";
import { encouragePledge } from "@/ai/flows/pledge-encouragement";
import { summarizeConversation } from "@/ai/flows/summarize-conversation";
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
  const isTitleGenerating = useRef(false);

  const saveConversation = useCallback((id: string, updatedMessages: Message[], updatedPledges: string[], title?: string) => {
    if (!id) return;
    let currentTitle = title;
    
    // Check if conversation already exists to preserve its title
    const existingConvoRaw = localStorage.getItem(`${CONVERSATION_KEY_PREFIX}${id}`);
    if (existingConvoRaw) {
       try {
           const existingConvo = JSON.parse(existingConvoRaw);
           if (existingConvo.title && existingConvo.title !== 'New Conversation') {
               currentTitle = existingConvo.title;
           }
       } catch (error) {
           console.error("Could not parse existing conversation", error)
       }
    }
    
   const conversation: Conversation = {
       id: id,
       title: currentTitle || 'New Conversation',
       messages: updatedMessages,
       pledges: updatedPledges,
       timestamp: new Date().toISOString(),
   };
   localStorage.setItem(`${CONVERSATION_KEY_PREFIX}${id}`, JSON.stringify(conversation));
   // Manually trigger a re-render of history if needed via prop changes
  }, []);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string, pledgeIdeas?: string[], reset = false) => {
    setMessages(prev => {
      const newMessage: Message = { id: crypto.randomUUID(), role, content, pledgeIdeas };
      const newMessages = reset ? [newMessage] : [...prev, newMessage];
      if (currentConversationId) {
        saveConversation(currentConversationId, newMessages, pledges);
      }
      return newMessages;
    });
  }, [currentConversationId, pledges, saveConversation]);


  const initChat = useCallback(async (convoId: string | null) => {
    setIsLoading(true);
    setInput("");
    setPledges([]);
    setPledgeOffered(false);
    
    if (convoId) {
      // Load existing conversation
      try {
        const storedConvo = localStorage.getItem(`${CONVERSATION_KEY_PREFIX}${convoId}`);
        if (storedConvo) {
          const conversation: Conversation = JSON.parse(storedConvo);
          setMessages(conversation.messages);
          setPledges(conversation.pledges || []);
          setCurrentConversationId(convoId);
          setIsLoading(false);
          return;
        } else {
          // If conversation not found, start a new one with this ID.
          setCurrentConversationId(convoId);
          setMessages([]);
        }
      } catch (error) {
        console.error("Failed to load conversation", error);
        // Fallback to new chat if loading fails
      }
    } else {
       // Start a new conversation
      const newConvoId = crypto.randomUUID();
      router.push(`/?id=${newConvoId}`, { scroll: false });
      return; // Let the useEffect handle the new ID
    }

    try {
      const greeting = "Hi! I'm KWS AI – your guide to a better world 🌍";
      addMessage('assistant', greeting, undefined, true);
      addMessage('assistant', 'For a better experience, please allow location permissions when prompted.');

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
          addMessage('assistant', "Since location is not available, here's a general tip: Remember to reduce, reuse, and recycle!");
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Error initializing chat:", error);
      addMessage('assistant', "I'm having trouble getting started. Please try refreshing the page.", undefined, true);
      setIsLoading(false);
    }
  }, [router, addMessage]);

  useEffect(() => {
    initChat(conversationId);
  }, [conversationId, initChat]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);


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

  const generateTitle = async (convoId: string, convoMessages: Message[]) => {
    if (isTitleGenerating.current) return;
    isTitleGenerating.current = true;
    try {
        const { title } = await summarizeConversation(convoMessages);
        saveConversation(convoId, convoMessages, pledges, title);
        // Force a history refresh by navigating to the same URL
        router.push(`/?id=${convoId}`, { scroll: false });
    } catch (error) {
        console.error("Failed to generate conversation title", error);
        // Save with a default title if summarization fails
        saveConversation(convoId, convoMessages, pledges, "Chat");
    } finally {
        isTitleGenerating.current = false;
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentConversationId) return;

    const userInput = input;
    setInput("");
    setIsLoading(true);

    const tempUserMessage: Message = { id: crypto.randomUUID(), role: 'user', content: userInput };
    const newMessages = [...messages, tempUserMessage];
    setMessages(newMessages);

    // Save conversation with user message immediately
    saveConversation(currentConversationId, newMessages, pledges);

    const userMessageCount = newMessages.filter(m => m.role === 'user').length;
    
    // Generate title after the first user message
    if (userMessageCount === 1) {
        generateTitle(currentConversationId, newMessages);
    }

    try {
      const conversationHistory = newMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      
      let responseContent = '';
      let responsePledgeIdeas: string[] | undefined;

      if(userMessageCount === 3 && !pledgeOffered) {
        setPledgeOffered(true);
        const pledgeResponse = await encouragePledge({ conversationHistory: JSON.stringify(conversationHistory) });
        responseContent = pledgeResponse.encouragement;
        responsePledgeIdeas = pledgeResponse.pledgeIdeas;
      } else {
        const response = await contextualAwareness({ message: userInput, conversationHistory, webSearchEnabled: isWebSearchEnabled });
        responseContent = response.response;
      }

      const assistantMessage: Message = { id: crypto.randomUUID(), role: 'assistant', content: responseContent, pledgeIdeas: responsePledgeIdeas };
      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      saveConversation(currentConversationId, finalMessages, pledges);

    } catch (error) {
      console.error("Error with AI flow:", error);
      const errorMessage: Message = { id: crypto.randomUUID(), role: 'assistant', content: "I'm having a little trouble connecting. Please try again in a moment." };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      saveConversation(currentConversationId, finalMessages, pledges);
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
