// Chat and Group types

export interface ChatItem {
  id: string; // keep it string
  name: string;
  avatar?: string;
  initial?: string;
  online?: boolean;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  isTyping?: boolean;
}

export interface GroupItem {
  id: string; // keep it string
  name: string;
  initial: string;
  badge?: string;
  unreadCount?: number;
}
