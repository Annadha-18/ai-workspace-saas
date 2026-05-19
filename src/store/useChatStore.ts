import { create } from "zustand";

interface ChatStore {
  messages: any[];
  addMessage: (msg: any) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),
}));