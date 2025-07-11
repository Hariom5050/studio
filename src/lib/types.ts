export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  pledgeIdeas?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  pledges: string[];
  timestamp: string;
}
