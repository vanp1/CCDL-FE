import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    analysis?: {
        uaw?: {
            simple?: number;
            average?: number;
            complex?: number;
            total?: number;
        };
        uucw?: {
            simple?: number;
            average?: number;
            complex?: number;
            total?: number;
        };
        tcf?: {
            factors?: {
                id: number;
                value: number;
            }[];
        };
        ef?: {
            factors?: {
                id: number;
                value: number;
            }[];
        };
        explanation?: string;
    };
}

interface ChatState {
    messages: ChatMessage[];
    addMessage: (message: Omit<ChatMessage, 'timestamp'>) => void;
    clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set) => ({
            messages: [],
            addMessage: (message) => set((state) => ({
                messages: [...state.messages, { ...message, timestamp: Date.now() }]
            })),
            clearMessages: () => set({ messages: [] })
        }),
        {
            name: 'chat-history',
        }
    )
); 