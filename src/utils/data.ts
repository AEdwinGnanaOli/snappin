// Type definitions
export interface Chat {
  id: number;
  name: string;
  avatar: string | null;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  online: boolean;
  type: "user" | "group";
  initial?: string;
  isTyping?: boolean;
}

export interface Group {
  id: number;
  name: string;
  initial: string;
  unreadCount: number;
  type: "group";
  badge?: string;
}

export interface Message {
  id: number;
  sender: string;
  avatar: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  images?: string[];
}

export interface Contact {
  id: number;
  name: string;
  avatar: string;
}

export interface MessagesMap {
  [chatId: number]: Message[];
}

// Data exports
export const dummyChats: Chat[] = [
  {
    id: 1,
    name: "Patrick Hendricks",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastMessage: "hey! there I'm available",
    timestamp: "02:50 PM",
    unreadCount: 0,
    online: true,
    type: "user",
  },
  {
    id: 2,
    name: "Mark Messer",
    avatar: "https://i.pravatar.cc/150?img=33",
    lastMessage: "Images",
    timestamp: "10:30 AM",
    unreadCount: 2,
    online: false,
    type: "user",
  },
  {
    id: 3,
    name: "General",
    avatar: null,
    lastMessage: "This theme is Awesome!",
    timestamp: "2:06 min",
    unreadCount: 0,
    online: false,
    type: "group",
    initial: "G",
  },
  {
    id: 4,
    name: "Doris Brown",
    avatar: "https://i.pravatar.cc/150?img=45",
    lastMessage: "typing...",
    timestamp: "10:05 PM",
    unreadCount: 0,
    online: true,
    type: "user",
    isTyping: true,
  },
];

export const dummyGroups: Group[] = [
  {
    id: 101,
    name: "#General",
    initial: "G",
    unreadCount: 0,
    type: "group",
  },
  {
    id: 102,
    name: "#Reporting",
    initial: "R",
    unreadCount: 23,
    type: "group",
  },
  {
    id: 103,
    name: "#Designer",
    initial: "D",
    badge: "New",
    unreadCount: 0,
    type: "group",
  },
  {
    id: 104,
    name: "#Developers",
    initial: "D",
    unreadCount: 0,
    type: "group",
  },
  {
    id: 105,
    name: "#Project-alpha",
    initial: "P",
    badge: "New",
    unreadCount: 0,
    type: "group",
  },
  {
    id: 106,
    name: "#Snacks",
    initial: "S",
    unreadCount: 0,
    type: "group",
  },
];

export const dummyMessages: MessagesMap = {
  4: [
    {
      id: 1,
      sender: "Doris Brown",
      avatar: "https://i.pravatar.cc/150?img=45",
      text: "& Next meeting tomorrow 10.00AM",
      timestamp: "10:05",
      isOwn: false,
    },
    {
      id: 2,
      sender: "Patricia Smith",
      avatar: "https://i.pravatar.cc/150?img=20",
      text: "Wow that's great",
      timestamp: "10:06",
      isOwn: true,
    },
    {
      id: 3,
      sender: "Doris Brown",
      avatar: "https://i.pravatar.cc/150?img=45",
      text: "Images",
      timestamp: "10:07",
      isOwn: false,
      images: [
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400",
      ],
    },
  ],
  1: [
    {
      id: 1,
      sender: "Patrick Hendricks",
      avatar: "https://i.pravatar.cc/150?img=12",
      text: "hey! there I'm available",
      timestamp: "02:50",
      isOwn: false,
    },
  ],
  2: [
    {
      id: 1,
      sender: "Mark Messer",
      avatar: "https://i.pravatar.cc/150?img=33",
      text: "Check out these images",
      timestamp: "10:30",
      isOwn: false,
    },
  ],
};

export const dummyContacts: Contact[] = [
  {
    id: 1,
    name: "Patrick Hendricks",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: 2,
    name: "Doris Brown",
    avatar: "https://i.pravatar.cc/150?img=45",
  },
  {
    id: 3,
    name: "Emily Chen",
    avatar: "https://i.pravatar.cc/150?img=25",
  },
  {
    id: 4,
    name: "Steve Wilson",
    avatar: "https://i.pravatar.cc/150?img=33",
  },
  {
    id: 5,
    name: "Patricia Smith",
    avatar: "https://i.pravatar.cc/150?img=20",
  },
];
