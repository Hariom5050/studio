export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  pledgeIdeas?: string[];
  isLoading?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  pledges: string[];
  timestamp: string;
}
