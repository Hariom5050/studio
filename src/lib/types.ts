export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  pledgeIdeas?: string[];
}
