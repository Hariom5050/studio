
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { Conversation } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const CONVERSATION_KEY_PREFIX = 'conversation_';

export function ChatHistory({ activeConversationId }: { activeConversationId: string | null }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const router = useRouter();

  const loadConversations = useCallback(() => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(CONVERSATION_KEY_PREFIX));
    const convos = keys.map(key => {
        try {
            return JSON.parse(localStorage.getItem(key) as string) as Conversation;
        } catch {
            return null;
        }
    }).filter((c): c is Conversation => c !== null);

    convos.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setConversations(convos);
  }, []);

  useEffect(() => {
    loadConversations();
    // Add a storage event listener to update history across tabs/windows
    window.addEventListener('storage', loadConversations);
    return () => {
      window.removeEventListener('storage', loadConversations);
    };
  }, [loadConversations]);

  const handleNewChat = () => {
    router.push('/');
  };
  
  const handleSelectChat = (id: string) => {
    router.push(`/?id=${id}`);
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem(`${CONVERSATION_KEY_PREFIX}${id}`);
    
    if (activeConversationId === id) {
      router.push('/');
      // A hard reload might be necessary if state isn't resetting properly across components.
      // window.location.href = '/'; 
    }
    // Manually trigger a re-load of conversations after deletion
    loadConversations();
  }

  return (
    <div className="flex flex-col h-full p-2">
      <Button variant="outline" className="mb-4" onClick={handleNewChat}>
        <PlusCircle className="w-4 h-4 mr-2" />
        New Chat
      </Button>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2 pr-2">
          {conversations.map(convo => (
            <div key={convo.id} className="relative group">
              <Button
                variant="ghost"
                className={cn(
                    "w-full justify-start text-left h-auto whitespace-normal pr-8",
                    convo.id === activeConversationId && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleSelectChat(convo.id)}
              >
                {convo.title}
              </Button>
               <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                   </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this conversation.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => handleDeleteChat(convo.id, e)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
