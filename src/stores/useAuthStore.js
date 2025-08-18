// src/stores/useAuthStore.js
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // User state
      currentUser: null,
      
      // Chat state
      chatHistory: [],
      currentThreadId: null,
      messages: [],
      
      // File state
      files: [],
      
      // Actions
      setCurrentUser: (user) => set({ currentUser: user }),
      setChatHistory: (history) => set({ chatHistory: history }),
      setCurrentThreadId: (threadId) => set({ currentThreadId: threadId }),
      setMessages: (messages) => set({ messages }),
      setFiles: (files) => set({ files }),
      
      login: (user) => {
        set({ currentUser: user });
      },
      
      logout: () => {
        set({ 
          currentUser: null,
          chatHistory: [],
          currentThreadId: null,
          messages: [],
          files: []
        });
      },

      newChat: () => {
        set({
          currentThreadId: Date.now().toString(), // or use uuid
          messages: [],
        });
      },  

      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message]
        }));
      },
      
      addFile: (file) => {
        set((state) => ({
          files: [...state.files, file]
        }));
      },
      
      removeFile: (fileId) => {
        set((state) => ({
          files: state.files.filter(file => file.id !== fileId)
        }));
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export { useAuthStore };