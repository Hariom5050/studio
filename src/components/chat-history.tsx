
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const CONVERSATION_KEY_PREFIX = 'conversation_';

export function ChatHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeConversationId = searchParams.get('id');

  const loadConversations = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
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
    } catch (error) {
        console.error("Failed to load conversations from local storage", error);
        setConversations([]);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations, activeConversationId]);

  const handleNewChat = () => {
    setSelectedConversations(new Set());
    // The chat interface will handle creating the new ID and navigating
    router.push('/');
  };
  
  const handleSelectChat = (id: string) => {
    router.push(`/?id=${id}`);
  };

  const handleToggleSelection = (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    const newSelection = new Set(selectedConversations);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedConversations(newSelection);
  }

  const handleSelectAll = () => {
    if (selectedConversations.size === conversations.length) {
      setSelectedConversations(new Set());
    } else {
      const allIds = new Set(conversations.map(c => c.id));
      setSelectedConversations(allIds);
    }
  }

  const handleDeleteSelected = () => {
    const idsToDelete = Array.from(selectedConversations);
    idsToDelete.forEach(id => {
      localStorage.removeItem(`${CONVERSATION_KEY_PREFIX}${id}`);
    });

    // Check if the currently active chat was deleted
    if (activeConversationId && selectedConversations.has(activeConversationId)) {
        // If so, navigate to a new chat page to "comeback"
        router.push('/');
    }
    
    // Manually trigger a reload of conversations state from the updated local storage
    loadConversations();
    setSelectedConversations(new Set());
    setDeleteDialogOpen(false);
  }

  return (
    <div className="flex flex-col h-full p-2">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" className="flex-1" onClick={handleNewChat}>
          <PlusCircle className="w-4 h-4 mr-2" />
          New Chat
        </Button>
        {selectedConversations.size > 0 && (
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete {selectedConversations.size} conversation(s).
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
      </div>

       {conversations.length > 0 && (
        <div className="flex items-center px-2 py-2 mb-2 space-x-2 border rounded-md">
            <Checkbox
              id="select-all"
              checked={selectedConversations.size > 0 && selectedConversations.size === conversations.length}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="flex-1 text-sm font-medium">
              {selectedConversations.size > 0 ? `${selectedConversations.size} selected` : 'Select All'}
            </Label>
        </div>
       )}

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2 pr-2">
          {conversations.map(convo => (
            <div
              key={convo.id}
              className={cn(
                "w-full flex items-center gap-2 pr-2 rounded-md transition-colors cursor-pointer group",
                convo.id === activeConversationId ? "bg-accent text-accent-foreground" : "hover:bg-muted"
              )}
              onClick={() => handleSelectChat(convo.id)}
            >
              <Checkbox
                className={cn(
                    "ml-2 my-2 transition-opacity",
                    convo.id === activeConversationId ? "border-accent-foreground" : "",
                    selectedConversations.has(convo.id) ? "opacity-100" : "opacity-40 group-hover:opacity-100"
                )}
                checked={selectedConversations.has(convo.id)}
                onClick={(e) => handleToggleSelection(convo.id, e)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        handleToggleSelection(convo.id, e)
                    }
                }}
              />
              <Button
                variant="ghost"
                className="flex-1 w-full h-auto px-2 py-2 text-left justify-start whitespace-normal bg-transparent hover:bg-transparent"
              >
                {convo.title}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
