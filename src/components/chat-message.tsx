
"use client";

import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Leaf, Bird, ShieldCheck, Globe2, HeartHandshake, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  message: Message;
  onPledgeSelect: (pledge: string) => void;
}

const getIconForPledge = (pledge: string) => {
  const lowerPledge = pledge.toLowerCase();
  if (lowerPledge.includes('sustainab') || lowerPledge.includes('eco') || lowerPledge.includes('enviro')) return <Leaf className="w-4 h-4 mr-2" />;
  if (lowerPledge.includes('peace') || lowerPledge.includes('unity') || lowerPledge.includes('kindness')) return <Bird className="w-4 h-4 mr-2" />;
  if (lowerPledge.includes('digital') || lowerPledge.includes('online') || lowerPledge.includes('respect')) return <ShieldCheck className="w-4 h-4 mr-2" />;
  if (lowerPledge.includes('cultur') || lowerPledge.includes('global')) return <Globe2 className="w-4 h-4 mr-2" />;
  return <HeartHandshake className="w-4 h-4 mr-2" />;
};


export function ChatMessage({ message, onPledgeSelect }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-full animate-in fade-in",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-xl p-3 px-4 shadow-md",
          isAssistant
            ? "bg-card rounded-tl-none"
            : "bg-secondary rounded-tr-none text-secondary-foreground"
        )}
      >
        {message.isLoading ? (
          <div className="flex items-center gap-2">
            <LoaderCircle className="w-4 h-4 animate-spin text-primary" />
            <p className="leading-relaxed whitespace-pre-wrap font-body text-muted-foreground animate-pulse">{message.content}</p>
          </div>
        ) : (
          <p className="leading-relaxed whitespace-pre-wrap font-body">{message.content}</p>
        )}
        
        {message.pledgeIdeas && message.pledgeIdeas.length > 0 && (
          <div className="mt-4 space-y-2">
            {message.pledgeIdeas.map((idea, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full justify-start text-left h-auto whitespace-normal"
                onClick={() => onPledgeSelect(idea)}
              >
                {getIconForPledge(idea)}
                {idea}
              </Button>
            ))}
          </div>
        )}
      </div>
      {!isAssistant && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-accent text-accent-foreground">
            <User className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
