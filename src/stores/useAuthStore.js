// src/stores/useAuthStore.js
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { api } from '../services/api';

// ------------------------------
// SMART TITLE GENERATION HELPER
// ------------------------------
const generateThreadTitle = (messageContent) => {
  if (!messageContent || typeof messageContent !== 'string') return 'New Chat';

  let title = messageContent.trim();

  // Return generic title for very common greetings
  const genericInputs = ['hi', 'hello', 'hey', 'hello!', 'hi!', 'hey!', 'test'];
  if (genericInputs.includes(title.toLowerCase())) {
    return 'New Chat';
  }

  // Replace newlines and multiple spaces with single space
  title = title.replace(/\s+/g, ' ');

  // Convert to lowercase for prefix matching
  let lowerTitle = title.toLowerCase();

  // Common prefixes to remove
  const ignoredPrefixes = [
    'please ',
    'can you ',
    'could you ',
    'will you ',
    'would you ',
    'i want to ',
    'i need to ',
    'help me ',
    'can i ',
    'how do i ',
    'how can i ',
    'what is ',
    'what are ',
    'tell me ',
    'explain ',
    'summarize ',
    'give me ',
    'show me ',
    'find ',
    'search for ',
    'write ',
    'create ',
    'generate ',
    'translate ',
    'convert ',
  ];

  // Remove matching prefixes
  for (const prefix of ignoredPrefixes) {
    if (lowerTitle.startsWith(prefix)) {
      title = title.slice(prefix.length).trim();
      lowerTitle = title.toLowerCase(); // Update for possible nested prefixes
    }
  }

  // Trim again after prefix removal
  title = title.trim();

  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  // Smart truncation: avoid cutting words in the middle
  const maxTitleLength = 30;
  if (title.length > maxTitleLength) {
    let truncated = title.slice(0, maxTitleLength).trim();
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 15) { // Avoid very short titles
      truncated = truncated.slice(0, lastSpace);
    }
    title = truncated + '...';
  }

  // Final fallback
  if (!title || title === '...') {
    return 'New Chat';
  }

  return title;
};

// ------------------------------
// ZUSTAND STORE
// ------------------------------
const useAuthStore = create(
  persist(
    (set, get) => ({
      // --- Authentication State ---
      currentUser: null, // Stores full user object from login/signup response
      authToken: null,   // Stores JWT access token

      // --- Chat State ---
      threads: [],              // List of all chat threads fetched from backend
      currentThreadId: null,    // ID of the currently active thread (real or temporary)
      messages: [],             // Messages for the currently active thread
      isLoadingThreads: false,  // Loading state for thread list
      isLoadingMessages: false, // Loading state for messages
      isSendingMessage: false,  // Sending state for messages

      // --- File State ---
      files: [],             // List of all PDFs fetched from backend
      isLoadingFiles: false, // Loading state for file list

      // --- Thread-Specific PDF Selection State ---
      threadPdfSelections: {},
      globalSelectedPdfIds: [],

      // --- Actions ---

      // --- Authentication Actions ---
      login: (userData, token) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        set({ currentUser: userData, authToken: token });
      },

      logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        set({
          currentUser: null,
          authToken: null,
          threads: [],
          currentThreadId: null,
          messages: [],
          files: [],
          threadPdfSelections: {},
          globalSelectedPdfIds: [],
          isLoadingThreads: false,
          isLoadingMessages: false,
          isSendingMessage: false,
          isLoadingFiles: false,
        });
      },

      // --- Thread Actions ---
      fetchThreads: async () => {
        if (!get().authToken) {
          console.warn("fetchThreads: No auth token, skipping.");
          return;
        }
        set({ isLoadingThreads: true });
        try {
          const data = await api.getThreads();
          console.log("Fetched threads data:", data);
          let threadsArray = [];
          if (Array.isArray(data)) {
            threadsArray = data;
          } else if (data && typeof data === 'object' && Array.isArray(data.threads)) {
            threadsArray = data.threads;
          } else {
            console.warn("Unexpected /threads response structure:", data);
          }
          set({ threads: threadsArray, isLoadingThreads: false });
        } catch (error) {
          console.error('Error fetching threads:', error);
          set({ threads: [], isLoadingThreads: false });
        }
      },

      newChat: () => {
        const tempThreadId = `temp_${Date.now()}`;
        console.log("Creating new temporary chat:", tempThreadId);
        set({
          currentThreadId: tempThreadId,
          messages: [],
          threadPdfSelections: {},
          globalSelectedPdfIds: [],
        });
      },

      setCurrentThread: (threadId) => {
        console.log("Setting current thread to:", threadId);
        set({ 
          currentThreadId: threadId, 
          messages: [],
          threadPdfSelections: {},
          globalSelectedPdfIds: [],
        });
      },

      updateThreadTitle: async (threadId, newTitle) => {
        if (!get().authToken || !threadId) return;
        try {
          const data = await api.updateThreadTitle(threadId, newTitle);
          console.log("Thread title updated:", data);
          set((state) => ({
            threads: state.threads.map(thread =>
              thread.thread_id === threadId ? { ...thread, title: newTitle } : thread
            )
          }));
        } catch (error) {
          console.error('Error updating thread title:', error);
        }
      },

      // --- Message Actions ---
      loadThreadMessages: async (threadId) => {
        if (!get().authToken || !threadId || threadId.startsWith('temp_')) {
          console.log("loadThreadMessages: Skipping for temp/new thread or no auth.");
          return;
        }
        set({ isLoadingMessages: true, messages: [] });
        try {
          const data = await api.getThreadMessages(threadId);
          console.log(`Loaded messages for thread ${threadId}:`, data);
          set({
            currentThreadId: threadId,
            messages: data.messages || [],
            isLoadingMessages: false,
            // Clear selections when loading a thread
            threadPdfSelections: {},
            globalSelectedPdfIds: [],
          });
        } catch (error) {
          console.error('Error loading thread messages:', error);
          set({ isLoadingMessages: false, messages: [] });
        }
      },

      sendMessage: async (messageContent) => {
        if (!get().authToken || !get().currentUser) {
          console.warn("No auth token or user");
          return;
        }

        const currentThreadId = get().currentThreadId;
        const isNewThread = currentThreadId?.startsWith('temp_');
        const actualThreadIdToSend = isNewThread ? null : currentThreadId;

        const userMessage = {
          id: `user_msg_${Date.now()}`,
          sender: 'user',
          content: messageContent,
          timestamp: new Date().toISOString(),
        };

        set({ isSendingMessage: true });

        try {
          const data = await api.sendMessage(messageContent, actualThreadIdToSend);
          console.log("Received message response:", data);

          const aiMessage = {
            id: data.id || `ai_msg_${Date.now()}`,
            sender: 'assistant',
            content: data.ai_response || data.response || 'No response received.',
            timestamp: data.timestamp || new Date().toISOString(),
          };

          if (isNewThread && data.thread_id) {
            console.log("New thread created with ID:", data.thread_id);
            set({ currentThreadId: data.thread_id });
          }

          const finalThreadId = data.thread_id || currentThreadId;

          if (isNewThread && finalThreadId && !finalThreadId.startsWith('temp_')) {
            const title = generateThreadTitle(messageContent);

            try {
              await api.updateThreadTitle(finalThreadId, title);
              set((state) => ({
                threads: state.threads.map(thread =>
                  thread.thread_id === finalThreadId
                    ? { ...thread, title }
                    : thread
                )
              }));
            } catch (err) {
              console.warn("Failed to update thread title:", err);
              set((state) => ({
                threads: state.threads.map(thread =>
                  thread.thread_id === finalThreadId
                    ? { ...thread, title }
                    : thread
                )
              }));
            }
          }

          set((state) => ({
            messages: [...state.messages, userMessage, aiMessage],
            isSendingMessage: false,
          }));

          if (isNewThread || data.thread_id) {
            console.log("Refreshing thread list after sending message.");
            get().fetchThreads();
          }
        } catch (error) {
          console.error('Error sending message:', error);
          set({ isSendingMessage: false });
        }
      },

      // --- File Actions ---
      fetchFiles: async () => {
        if (!get().authToken) {
          console.warn("fetchFiles: No auth token, skipping.");
          return;
        }
        set({ isLoadingFiles: true });
        try {
          const data = await api.listPDFs();
          console.log("Fetched files data:", data);
          set({ files: data.pdfs || [], isLoadingFiles: false });
        } catch (error) {
          console.error('Error fetching files:', error);
          set({ files: [], isLoadingFiles: false });
        }
      },

      uploadFiles: async (files, threadIdToAddTo = null) => {
        if (!get().authToken) return;
        try {
          const data = await api.uploadPDFs(files, threadIdToAddTo);
          console.log("Files uploaded:", data);
          await get().fetchFiles();
          
          // Clear selections after upload
          if (threadIdToAddTo) {
            // If uploading to specific thread, clear global selections
            set({ globalSelectedPdfIds: [] });
          } else if (data.thread_id) {
            // If new thread was created, clear global selections
            set({ globalSelectedPdfIds: [] });
          }
          
          if (threadIdToAddTo || data.thread_id) {
            get().fetchThreads();
          }
          return data;
        } catch (error) {
          console.error('Error uploading files:', error);
          throw error;
        }
      },

      deleteFile: async (pdfId) => {
        if (!get().authToken || !pdfId) return;
        try {
          const data = await api.deletePDF(pdfId);
          console.log("File deleted:", data);
          await get().fetchFiles();
          get().fetchThreads();
          set((state) => {
            const updatedThreadSelections = { ...state.threadPdfSelections };
            Object.keys(updatedThreadSelections).forEach(threadId => {
              updatedThreadSelections[threadId] = updatedThreadSelections[threadId].filter(id => id !== pdfId);
            });
            const updatedGlobalSelections = state.globalSelectedPdfIds.filter(id => id !== pdfId);
            return { threadPdfSelections: updatedThreadSelections, globalSelectedPdfIds: updatedGlobalSelections };
          });
        } catch (error) {
          console.error('Error deleting file:', error);
        }
      },

      // --- PDF Selection Actions ---
      setGlobalSelectedPdfIds: (pdfIds) => {
        console.log("Setting global selected PDF IDs:", pdfIds);
        set({ globalSelectedPdfIds: pdfIds });
      },

      setThreadSelectedPdfIds: (threadId, pdfIds) => {
        if (!threadId) return;
        console.log(`Setting selected PDF IDs for thread ${threadId}:`, pdfIds);
        set((state) => ({
          threadPdfSelections: {
            ...state.threadPdfSelections,
            [threadId]: pdfIds,
          }
        }));
      },

      toggleGlobalPdfSelection: (pdfId) => {
        set((state) => {
          const currentSelections = state.globalSelectedPdfIds;
          const isSelected = currentSelections.includes(pdfId);
          let newSelections;
          if (isSelected) {
            newSelections = currentSelections.filter(id => id !== pdfId);
          } else {
            newSelections = [...currentSelections, pdfId];
          }
          console.log("Toggled global PDF selection:", pdfId, "New selections:", newSelections);
          return { globalSelectedPdfIds: newSelections };
        });
      },

      toggleThreadPdfSelection: (threadId, pdfId) => {
        if (!threadId) return;
        set((state) => {
          const currentThreadSelections = state.threadPdfSelections[threadId] || [];
          const isSelected = currentThreadSelections.includes(pdfId);
          let newSelections;
          if (isSelected) {
            newSelections = currentThreadSelections.filter(id => id !== pdfId);
          } else {
            newSelections = [...currentThreadSelections, pdfId];
          }
          console.log(`Toggled PDF selection for thread ${threadId}:`, pdfId, "New selections:", newSelections);
          return {
            threadPdfSelections: {
              ...state.threadPdfSelections,
              [threadId]: newSelections,
            }
          };
        });
      },

      getSelectedPdfIdsForThread: (threadId) => {
        const state = get();
        if (threadId && state.threadPdfSelections[threadId]) {
          return state.threadPdfSelections[threadId];
        }
        return state.globalSelectedPdfIds;
      },

      revalidateThread: async (threadId) => {
        if (!get().authToken || !threadId) return;
        try {
          const data = await api.revalidateThread(threadId);
          console.log("Thread revalidated:", data);
          return data;
        } catch (error) {
          console.error('Error revalidating thread:', error);
          throw error;
        }
      }

    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        authToken: state.authToken,
      }),
    }
  )
);

export { useAuthStore };