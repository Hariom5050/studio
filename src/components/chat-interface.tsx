
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
import { conversationGuidance } from "@/ai/flows/conversation-guidance";

const CONVERSATION_KEY_PREFIX = 'conversation_';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pledges, setPledges] = useState<string[]>([]);
  const [pledgeOffered, setPledgeOffered] = useState(false);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isTitleGenerating = useRef(false);

  const saveConversation = useCallback((id: string, updatedMessages: Message[], updatedPledges?: string[], title?: string) => {
    if (!id || typeof window === 'undefined') return;
    let currentTitle = title;
    
    const existingConvoRaw = localStorage.getItem(`${CONVERSATION_KEY_PREFIX}${id}`);
    if (existingConvoRaw) {
       try {
           const existingConvo = JSON.parse(existingConvoRaw);
           if (existingConvo.title && !title) {
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
       pledges: updatedPledges || pledges,
       timestamp: new Date().toISOString(),
   };
   localStorage.setItem(`${CONVERSATION_KEY_PREFIX}${id}`, JSON.stringify(conversation));
  }, [pledges]);


  const startNewChat = useCallback((newConvoId: string) => {
    setIsLoading(true);
    setCurrentConversationId(newConvoId);
    
    const greeting = "Hi! I'm KWS AI – your guide to a better world 🌍";
    const initialMessages: Message[] = [
        { id: crypto.randomUUID(), role: 'assistant', content: greeting },
        { id: crypto.randomUUID(), role: 'assistant', content: 'To optimize your experience, kindly enable location services when prompted.'}
    ];
    setMessages(initialMessages);
    setPledges([]);
    setPledgeOffered(false);
    saveConversation(newConvoId, initialMessages, []);

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            const location = `lat: ${latitude}, lon: ${longitude}`;
            try {
                const tip = await getLocalizedSustainabilityTip({ location, webSearchEnabled: isWebSearchEnabled });
                setMessages(prev => {
                    const updated = [...prev, { id: crypto.randomUUID(), role: 'assistant', content: tip.tip }];
                    saveConversation(newConvoId, updated, []);
                    return updated;
                });
            } catch (error) {
                console.error("Error getting sustainability tip:", error);
                setMessages(prev => {
                    const updated = [...prev, { id: crypto.randomUUID(), role: 'assistant', content: "I'm having a little trouble connecting to my knowledge base right now. Please try again in a moment." }];
                    saveConversation(newConvoId, updated, []);
                    return updated;
                });
            } finally {
                setIsLoading(false);
            }
        },
        (error) => {
            console.warn("Geolocation denied:", error.message);
            // Silently fail if location is denied, the user can still chat.
             setMessages(prev => {
                const updated = [...prev];
                saveConversation(newConvoId, updated, []);
                return updated;
            });
            setIsLoading(false);
        }
    );
  }, [saveConversation, isWebSearchEnabled]);

  useEffect(() => {
    const conversationIdFromUrl = searchParams.get('id');

    if (conversationIdFromUrl) {
      if (conversationIdFromUrl !== currentConversationId) {
        const storedConvoRaw = localStorage.getItem(`${CONVERSATION_KEY_PREFIX}${conversationIdFromUrl}`);
        if (storedConvoRaw) {
          try {
            const storedConvo: Conversation = JSON.parse(storedConvoRaw);
            setCurrentConversationId(storedConvo.id);
            setMessages(storedConvo.messages);
            setPledges(storedConvo.pledges || []);
            setPledgeOffered(storedConvo.messages.some(m => m.pledgeIdeas));
            setIsLoading(false);
            setInput('');
          } catch (error) {
            console.error("Failed to parse conversation, starting new chat.", error);
            startNewChat(conversationIdFromUrl);
          }
        } else {
          startNewChat(conversationIdFromUrl);
        }
      }
    } else {
      const newId = crypto.randomUUID();
      router.replace(`/?id=${newId}`);
    }
  }, [searchParams, currentConversationId, startNewChat, router]);


  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);


  const handlePledgeSelect = (pledge: string) => {
    if (!currentConversationId) return;
    const updatedPledges = [...pledges, pledge];
    setPledges(updatedPledges);
    const updatedMessages = messages.filter(m => !m.pledgeIdeas);
    setMessages(updatedMessages);

    const confirmationMessage: Message = { id: crypto.randomUUID(), role: 'assistant', content: "That's a wonderful pledge! Thank you for your commitment. Every small action makes a big difference."};
    const finalMessages = [...updatedMessages, confirmationMessage];
    setMessages(finalMessages);
    
    saveConversation(currentConversationId, finalMessages, updatedPledges);

    toast({
      title: "Pledge Made!",
      description: "You're making the world a better place.",
    });
  };

  const generateTitle = async (convoId: string, convoMessages: Message[]) => {
    if (isTitleGenerating.current) return;
    const existingConvoRaw = localStorage.getItem(`${CONVERSATION_KEY_PREFIX}${convoId}`);
    if (existingConvoRaw) {
       try {
           const existingConvo = JSON.parse(existingConvoRaw);
           if (existingConvo.title && existingConvo.title !== 'New Conversation') {
               return; // Title already exists
           }
       } catch (error) { /* continue */ }
    }
    
    isTitleGenerating.current = true;
    try {
        const { title } = await summarizeConversation(convoMessages);
        saveConversation(convoId, convoMessages, pledges, title);
    } catch (error) {
        console.error("Failed to generate conversation title", error);
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
    const loadingAssistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: "Thank you for your patience! Your response is being generated.",
      isLoading: true,
    };
    const newMessages = [...messages, tempUserMessage, loadingAssistantMessage];
    setMessages(newMessages);

    saveConversation(currentConversationId, newMessages, pledges);

    const userMessageCount = newMessages.filter(m => m.role === 'user').length;
    
    if (userMessageCount === 1) {
        generateTitle(currentConversationId, newMessages);
    }

    try {
      const conversationHistoryForContext = newMessages
        .filter(m => !m.isLoading) // Exclude our placeholder from history
        .map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }));
      
      let responseContent = '';
      let responsePledgeIdeas: string[] | undefined;

      if(userMessageCount === 3 && !pledgeOffered) {
        setPledgeOffered(true);
        const pledgeResponse = await encouragePledge({ conversationHistory: JSON.stringify(conversationHistoryForContext), webSearchEnabled: isWebSearchEnabled });
        responseContent = pledgeResponse.encouragement;
        responsePledgeIdeas = pledgeResponse.pledgeIdeas;
      } else {
        const response = await contextualAwareness({ message: userInput, conversationHistory: conversationHistoryForContext, webSearchEnabled: isWebSearchEnabled });
        responseContent = response.response;
      }
      
      setMessages(prevMessages => {
        const finalMessages = prevMessages.map(msg => 
          msg.id === loadingAssistantMessage.id 
            ? { ...msg, content: responseContent, pledgeIdeas: responsePledgeIdeas, isLoading: false }
            : msg
        );
        saveConversation(currentConversationId, finalMessages, pledges);
        return finalMessages;
      });

    } catch (error) {
      console.error("Error with AI flow:", error);
      const errorMessageContent = "I'm having a little trouble connecting to my knowledge base right now. This could be due to a missing or invalid API key. Please check your configuration and try again.";
      setMessages(prevMessages => {
        const finalMessages = prevMessages.map(msg => 
          msg.id === loadingAssistantMessage.id 
            ? { ...msg, content: errorMessageContent, isLoading: false }
            : msg
        );
        saveConversation(currentConversationId, finalMessages, pledges);
        return finalMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full max-w-2xl mx-auto">
      <ScrollArea className="flex-1 p-4 pr-6" viewportRef={viewportRef}>
        <div className="space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} onPledgeSelect={handlePledgeSelect} />
          ))}
          {isLoading && !messages.some(m => m.isLoading) && (
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
              placeholder="How's the weather report"
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
