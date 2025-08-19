// src/components/Sidebar/Sidebar.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { toast } from 'react-toastify';

// Responsive hook
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
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();

  // Zustand state & actions
  const {
    currentUser,
    threads,
    currentThreadId,
    logout,
    newChat,
    setCurrentThread,
    fetchThreads,
    authToken
  } = useAuthStore();

  const handleToggle = useCallback(() => {
    if (typeof toggleSidebar === 'function') {
      toggleSidebar();
    }
  }, [toggleSidebar]);

  const handleNewChat = useCallback(() => {
    newChat();
    if (isMobile) handleToggle();
  }, [newChat, isMobile, handleToggle]);

  const handleThreadClick = useCallback((threadId) => {
    setCurrentThread(threadId);
    if (isMobile) handleToggle();
  }, [setCurrentThread, isMobile, handleToggle]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  // Fetch threads on mount and when user changes
  useEffect(() => {
    // Check if we have both user and auth token
    if (currentUser?.id && authToken) {
      const fetchThreadsSafe = async () => {
        try {
          await fetchThreads();
        } catch (error) {
          console.error('Error fetching threads:', error);
          toast.error('Failed to load chat history');
        }
      };
      
      fetchThreadsSafe();
    }
  }, [currentUser?.id, authToken, fetchThreads]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={handleToggle}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Toggle Sidebar"
        aria-expanded={isOpen}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        id="sidebar-navigation"
        className={`
          fixed md:relative md:translate-x-0 z-40 md:z-auto
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:w-16'}
          ${isOpen ? 'md:flex' : 'hidden md:flex'}
          bg-gray-900 text-white flex-col h-full transition-all duration-300
        `}
        role="navigation"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {isOpen && <h3 className="text-lg font-semibold">PDF Chat</h3>}
          <button
            onClick={handleToggle}
            className="p-2 rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle Sidebar"
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
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {/* New Chat */}
          <button
            onClick={handleNewChat}
            className={`
              flex items-center gap-3 rounded-lg transition
              ${isOpen ? 'w-full px-4 py-3 justify-start' : 'p-3 justify-center'}
              bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
            aria-label="Start a new chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {isOpen && <span>New Chat</span>}
          </button>

          {/* Chat History */}
          <div className="px-2">
            <h4 className="text-sm font-medium text-gray-400 mb-2 px-2">Chat History</h4>
            <div className="space-y-1">
              {threads.length === 0 ? (
                <p className="text-xs text-gray-500 px-3">No chats yet</p>
              ) : (
                threads.map((thread) => (
                  <button
                    key={thread.thread_id}
                    onClick={() => handleThreadClick(thread.thread_id)}
                    className={`
                      w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2
                      hover:bg-gray-800 truncate
                      ${currentThreadId === thread.thread_id ? 'bg-gray-800 font-medium' : ''}
                    `}
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z" />
                    </svg>
                    <span>{thread.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          {isOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUser?.username}</p>
                <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 text-gray-400 hover:text-white"
                aria-label="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-2 text-red-400 hover:bg-red-900 rounded transition"
              aria-label="Logout"
            >
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;