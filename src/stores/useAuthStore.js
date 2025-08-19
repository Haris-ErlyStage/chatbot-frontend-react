// src/stores/useAuthStore.js
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { api } from '../services/api'; // Import the updated api.js

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
      // Map of thread_id -> array of selected pdf_ids for that thread
      // This allows overriding the default PDFs used for a specific chat.
      threadPdfSelections: {},
      // IDs of PDFs selected globally (used for new chats or if no override)
      // This can be derived from `files` if needed, or managed separately.
      // For simplicity, we'll manage it separately for now.
      globalSelectedPdfIds: [],

      // --- Actions ---

      // --- Authentication Actions ---
      /**
       * Login action - sets user and token in state and localStorage
       * @param {Object} userData - Full user object from API response
       * @param {string} token - JWT access token from API response
       */
      login: (userData, token) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        set({ currentUser: userData, authToken: token });
      },

      /**
       * Logout action - clears all state and localStorage
       */
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
        // Optional: Redirect to login here if using window.location
        // if (window.location.pathname !== '/login') {
        //   window.location.href = '/login';
        // }
      },

      // --- Thread Actions ---
      /**
       * Fetches the list of chat threads for the current user
       */
      fetchThreads: async () => {
        if (!get().authToken) {
          console.warn("fetchThreads: No auth token, skipping.");
          return;
        }
        set({ isLoadingThreads: true });
        try {
          const data = await api.getThreads();
          console.log("Fetched threads data:", data);
          // Handle potential response structures
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

      /**
       * Creates a new temporary chat thread in the UI
       */
      newChat: () => {
        const tempThreadId = `temp_${Date.now()}`;
        console.log("Creating new temporary chat:", tempThreadId);
        set({
          currentThreadId: tempThreadId,
          messages: [],
          // Optionally, you might want to reset PDF selections for the new chat
          // Or inherit from global selections. Let's inherit for now.
        });
      },

      /**
       * Sets the current active thread and loads its messages
       * @param {string} threadId - The ID of the thread to activate
       */
      setCurrentThread: (threadId) => {
        console.log("Setting current thread to:", threadId);
        set({ currentThreadId: threadId, messages: [] }); // Clear messages immediately
        // Loading messages will be triggered by ChatInterface useEffect
      },

      /**
       * Updates the title of a thread
       * @param {string} threadId - The ID of the thread to update
       * @param {string} newTitle - The new title
       */
      updateThreadTitle: async (threadId, newTitle) => {
        if (!get().authToken || !threadId) return;
        try {
          const data = await api.updateThreadTitle(threadId, newTitle);
          console.log("Thread title updated:", data);
          // Update the thread in the local state
          set((state) => ({
            threads: state.threads.map(thread =>
              thread.id === threadId ? { ...thread, title: newTitle } : thread
            )
          }));
          // If it's the current thread, update the header (handled by component re-render)
        } catch (error) {
          console.error('Error updating thread title:', error);
          // Optionally, show an error to the user
        }
      },

      // --- Message Actions ---
      /**
       * Loads messages for a specific thread from the backend
       * @param {string} threadId - The ID of the thread to load messages for
       */
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
            currentThreadId: threadId, // Ensure it's set
            messages: data.messages || [],
            isLoadingMessages: false,
          });
        } catch (error) {
          console.error('Error loading thread messages:', error);
          set({ isLoadingMessages: false, messages: [] });
        }
      },

      /**
       * Sends a message to the backend and updates the local message list
       * @param {string} messageContent - The text content of the user's message
       */
      sendMessage: async (messageContent) => {
        if (!get().authToken || !messageContent.trim()) return;

        const currentThreadId = get().currentThreadId;
        const isNewThread = currentThreadId && currentThreadId.startsWith('temp_');
        const actualThreadIdToSend = isNewThread ? null : currentThreadId;

        // Get PDF IDs to send with the message
        let pdfIdsToSend = [];
        if (isNewThread) {
            // For new threads, use global selections or all files if none selected
            const globalSelections = get().globalSelectedPdfIds;
            if (globalSelections && globalSelections.length > 0) {
                pdfIdsToSend = globalSelections;
            } else {
                // If no global selections, maybe send all? Or none? Depends on backend.
                // Let's assume backend handles "all available" if pdf_ids is empty/null.
                // pdfIdsToSend = get().files.map(f => f.id); // Uncomment if needed
            }
        } else if (currentThreadId) {
            // For existing threads, check for specific selections
            const specificSelections = get().threadPdfSelections[currentThreadId];
            if (specificSelections && specificSelections.length > 0) {
                pdfIdsToSend = specificSelections;
            } else {
                // If no specific selections, maybe use global or all? Backend decides.
                // pdfIdsToSend = get().globalSelectedPdfIds; // Uncomment if needed
            }
        }
        // If pdfIdsToSend is empty, the backend should use its default logic.

        set({ isSendingMessage: true });

        try {
          // Optimistic update: add user message immediately
          const userMessage = {
            id: `temp_msg_${Date.now()}`,
            sender: 'user',
            content: messageContent,
            timestamp: new Date().toISOString(),
          };
          set((state) => ({ messages: [...state.messages, userMessage] }));

          console.log("Sending message:", { message: messageContent, thread_id: actualThreadIdToSend, pdf_ids: pdfIdsToSend.length > 0 ? pdfIdsToSend : 'default' });
          const data = await api.sendMessage(messageContent, actualThreadIdToSend);
          console.log("Received message response:", data);

          const aiMessage = {
            id: data.id || `ai_msg_${Date.now()}`,
            sender: 'assistant',
            content: data.ai_response || data.response || 'No response received.',
            timestamp: data.timestamp || new Date().toISOString(),
          };

          // If a new thread was created, update state with the real ID
          if (isNewThread && data.thread_id) {
            console.log("New thread created with ID:", data.thread_id);
            set({ currentThreadId: data.thread_id });
          }

          // Update messages: replace temp user msg, add AI msg
          set((state) => ({
            messages: [...state.messages.filter(m => m.id !== userMessage.id), userMessage, aiMessage],
            isSendingMessage: false,
          }));

          // Refresh thread list if a new one was created
          if (isNewThread || data.thread_id) {
            console.log("Refreshing thread list after sending message.");
            get().fetchThreads();
          }

        } catch (error) {
          console.error('Error sending message:', error);
          set({ isSendingMessage: false });
          // Optionally remove temp message or show error
        }
      },


      // --- File Actions ---
      /**
       * Fetches the list of uploaded PDF files for the current user
       */
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

          // Optional: Initialize globalSelectedPdfIds if it's empty
          // This could be based on a default selection logic or user preference
          // For now, we'll leave it to explicit user action or component logic
          // to set globalSelectedPdfIds.
        } catch (error) {
          console.error('Error fetching files:', error);
          set({ files: [], isLoadingFiles: false });
        }
      },

      /**
       * Uploads one or more PDF files
       * @param {FileList|File[]} files - The files to upload
       * @param {string|null} threadIdToAddTo - Optional thread ID to add files to
       */
      uploadFiles: async (files, threadIdToAddTo = null) => {
        if (!get().authToken) return;
        try {
          // api.uploadPDFs handles FormData creation
          const data = await api.uploadPDFs(files, threadIdToAddTo);
          console.log("Files uploaded:", data);
          // Refresh the file list to include the new ones
          await get().fetchFiles();
          // Optionally refresh threads if a new one was created or files were added
          if (threadIdToAddTo || data.thread_id) {
             get().fetchThreads();
          }
          return data; // Return data for potential use by caller
        } catch (error) {
          console.error('Error uploading files:', error);
          throw error; // Re-throw for caller to handle
        }
      },

      /**
       * Deletes a specific PDF file
       * @param {string} pdfId - The ID of the PDF to delete
       */
      deleteFile: async (pdfId) => {
        if (!get().authToken || !pdfId) return;
        try {
          const data = await api.deletePDF(pdfId);
          console.log("File deleted:", data);
          // Refresh the file list
          await get().fetchFiles();
          // Refresh threads as deletion might affect them
          get().fetchThreads();
          // Clean up any selections involving this PDF
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
          // Optionally show error to user
        }
      },

      // --- PDF Selection Actions ---
      /**
       * Sets the global list of selected PDF IDs (for new chats)
       * @param {string[]} pdfIds - Array of PDF IDs
       */
      setGlobalSelectedPdfIds: (pdfIds) => {
        console.log("Setting global selected PDF IDs:", pdfIds);
        set({ globalSelectedPdfIds: pdfIds });
      },

      /**
       * Sets the list of selected PDF IDs for a specific thread
       * @param {string} threadId - The ID of the thread
       * @param {string[]} pdfIds - Array of PDF IDs selected for this thread
       */
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

      /**
       * Toggles the selection state of a PDF ID in the global list
       * @param {string} pdfId - The ID of the PDF to toggle
       */
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

      /**
       * Toggles the selection state of a PDF ID for a specific thread
       * @param {string} threadId - The ID of the thread
       * @param {string} pdfId - The ID of the PDF to toggle
       */
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

      /**
       * Gets the currently selected PDF IDs for a given thread
       * Falls back to global selections if no specific selection exists.
       * @param {string} threadId - The ID of the thread
       * @returns {string[]} - Array of selected PDF IDs
       */
      getSelectedPdfIdsForThread: (threadId) => {
        const state = get();
        if (threadId && state.threadPdfSelections[threadId]) {
          return state.threadPdfSelections[threadId];
        }
        // Fallback to global selections
        return state.globalSelectedPdfIds;
      },

      /**
       * Revalidates a thread's PDF references (calls backend API)
       * @param {string} threadId - The ID of the thread to revalidate
       */
      revalidateThread: async (threadId) => {
        if (!get().authToken || !threadId) return;
        try {
          const data = await api.revalidateThread(threadId);
          console.log("Thread revalidated:", data);
          // Optionally refresh threads/messages if data changed
          // get().fetchThreads(); // Might be overkill
          return data;
        } catch (error) {
          console.error('Error revalidating thread:', error);
          throw error; // Re-throw for caller
        }
      }

    }),
    {
      name: 'auth-storage', // Name in localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist essential auth state
        currentUser: state.currentUser,
        authToken: state.authToken,
        // globalSelectedPdfIds: state.globalSelectedPdfIds, // Optional: persist global selections
        // Add other non-function, serializable state parts if needed
      }),
    }
  )
);

export { useAuthStore };
