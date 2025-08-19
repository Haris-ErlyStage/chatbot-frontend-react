// src/components/Sidebar/Sidebar.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import { api } from "../../services/api";

// Custom hook for responsive window size
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        isMobile: window.innerWidth < 768,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { currentUser, setCurrentPage, logout, newChat } = useAuthStore();
  const [threads, setThreads] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isMobile } = useWindowSize();

  const handleToggle = useCallback(() => {
    if (typeof toggleSidebar === "function") {
      toggleSidebar();
    }
  }, [toggleSidebar]);

  // Fetch chat history using the real API
  const fetchThreads = useCallback(async () => {
    if (currentUser?.id) {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getThreads();
        setThreads(response.threads || []);
      } catch (err) {
        console.error("Failed to fetch threads:", err);
        setError("Failed to load chat history");
        setThreads([]);
      } finally {
        setLoading(false);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const handleNewChat = useCallback(() => {
    newChat();
    if (isMobile) handleToggle();
  }, [newChat, isMobile, handleToggle]);

  const handleThreadClick = useCallback((threadId) => {
    setCurrentPage(`thread_${threadId}`);
    if (isMobile) handleToggle();
  }, [setCurrentPage, isMobile, handleToggle]);

  const handleProfileClick = useCallback(() => {
    setCurrentPage("profile");
    setShowDropdown(false);
  }, [setCurrentPage]);

  const handleLogout = useCallback(() => {
    logout();
    setShowDropdown(false);
  }, [logout]);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={handleToggle}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Toggle Sidebar"
        aria-expanded={isOpen}
        aria-controls="sidebar-navigation"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        id="sidebar-navigation"
        className={`${isOpen ? "translate-x-0" : "-translate-x-full"}
          fixed md:relative md:translate-x-0 z-40 md:z-auto
          ${isOpen ? "w-64" : "md:w-16 w-64"}
          ${isOpen ? "md:flex" : "hidden md:flex"} 
          bg-gray-900 text-white flex-col h-full transition-all duration-300`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Top */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {(isOpen || isMobile) && isOpen && (
            <h3 className="text-lg font-semibold">PDF Chat</h3>
          )}
          <button
            onClick={handleToggle}
            className="p-2 rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle Sidebar"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Main */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3 sidebar-scroll">
          {/* New Chat */}
          <button
            onClick={handleNewChat}
            className={`flex items-center gap-3 rounded-lg transition 
              ${isOpen || isMobile ? "w-full px-4 py-3 justify-start" : "p-3 justify-center"} 
              bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            aria-label="Start a new chat"
          >
            <svg className={`${isOpen || isMobile ? "w-5 h-5" : "w-6 h-6"} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {(isOpen || isMobile) && <span className="text-white font-medium">New Chat</span>}
          </button>

          {/* Chats */}
          <div className="mt-4">
            {(isOpen || isMobile) && (
              <>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Chats</h4>
                {loading ? (
                  <div className="text-center py-2 text-sm text-gray-400">Loading chats...</div>
                ) : error ? (
                  <div className="text-center py-2 text-sm text-red-400">
                    {error}
                    <button 
                      onClick={fetchThreads}
                      className="ml-2 text-blue-400 hover:text-blue-300 focus:outline-none"
                      aria-label="Retry loading chats"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2" role="list" aria-label="Chat threads">
                    {threads.length > 0 ? (
                      threads.map((thread) => (
                        <button
                          key={thread.id}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition justify-start focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={() => handleThreadClick(thread.id)}
                          aria-label={`Open chat: ${thread.title || 'Untitled Chat'}`}
                        >
                          <svg
                            className="w-5 h-5 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                            />
                          </svg>
                          <span className="text-sm truncate">{thread.title || 'Untitled Chat'}</span>
                        </button>
                      ))
                    ) : (
                      <div className="text-center p-4">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-300">No chat history yet</h3>
                        <p className="mt-1 text-sm text-gray-400">
                          Start a new chat to begin your conversation
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer (Profile dropdown) */}
        <div className="relative px-3 py-2 border-t border-gray-800">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 w-full rounded-lg p-1.5 hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-expanded={showDropdown}
            aria-haspopup="true"
            aria-controls="user-menu"
            aria-label="User menu"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {currentUser?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            {(isOpen || isMobile) && (
              <p className="text-sm font-medium truncate">{currentUser?.username || "User"}</p>
            )}
          </button>

          {showDropdown && (
            <div 
              id="user-menu"
              className="absolute bottom-12 left-3 right-3 bg-gray-800 rounded-lg shadow-lg border border-gray-700 flex flex-col"
              role="menu"
            >
              <button
                onClick={handleProfileClick}
                className="px-3 py-1.5 text-left text-sm text-white hover:bg-gray-700 rounded-t-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                role="menuitem"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-left text-sm text-red-400 hover:bg-gray-700 rounded-b-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                role="menuitem"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
