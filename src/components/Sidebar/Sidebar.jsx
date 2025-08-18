// src/components/Sidebar/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import { mockApi } from "../../services/mockApi";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { currentUser, setCurrentPage, logout } = useAuthStore();
  const [threads, setThreads] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleToggle = () => {
    if (typeof toggleSidebar === "function") {
      toggleSidebar();
    }
  };

  // Fetch chat history
  useEffect(() => {
    if (currentUser?.id) {
      mockApi.getChatHistory(currentUser.id).then((res) => {
        setThreads(res.threads);
      });
    }
  }, [currentUser]);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={handleToggle}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        title="Toggle Sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`${isOpen ? "translate-x-0" : "-translate-x-full"}
          fixed md:relative md:translate-x-0 z-40 md:z-auto
          ${isOpen ? "w-64" : "md:w-16 w-64"}
          ${isOpen ? "md:flex" : "hidden md:flex"} 
          bg-gray-900 text-white flex-col h-full transition-all duration-300`}
      >
        {/* Top */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {(isOpen || window.innerWidth >= 768) && isOpen && (
            <h3 className="text-lg font-semibold">PDF Chat</h3>
          )}
          <button
            onClick={handleToggle}
            className="p-2 rounded hover:bg-gray-800"
            title="Toggle Sidebar"
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
            onClick={() => {
              useAuthStore.getState().newChat(); // reset messages & create new thread
              if (window.innerWidth < 768) handleToggle();
            }}
            className={`flex items-center gap-3 rounded-lg transition 
    ${isOpen || window.innerWidth < 768 ? "w-full px-4 py-3 justify-start" : "p-3 justify-center"} 
    bg-blue-600 hover:bg-blue-700`}
            title="New Chat"
          >
            <svg className={`${isOpen || window.innerWidth < 768 ? "w-5 h-5" : "w-6 h-6"} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {(isOpen || window.innerWidth < 768) && <span className="text-white font-medium">New Chat</span>}
          </button>

          {/* Chats */}
          <div className="mt-4">
            {(isOpen || window.innerWidth < 768) && (
              <>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Chats</h4>
                <div className="space-y-2">
                  {threads.map((thread) => (
                    <button
                      key={thread.id}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition justify-start"
                      onClick={() => {
                        setCurrentPage(`thread_${thread.id}`);
                        if (window.innerWidth < 768) handleToggle();
                      }}
                    >
                      <svg
                        className="w-5 h-5 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      <span className="text-sm truncate">{thread.title}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer (Profile dropdown) */}
        <div className="relative px-3 py-2 border-t border-gray-800">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 w-full rounded-lg p-1.5 hover:bg-gray-800 transition"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {currentUser?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            {(isOpen || window.innerWidth < 768) && (
              <p className="text-sm font-medium truncate">{currentUser?.username || "User"}</p>
            )}
          </button>

          {showDropdown && (
            <div className="absolute bottom-12 left-3 right-3 bg-gray-800 rounded-lg shadow-lg border border-gray-700 flex flex-col">
              <button
                onClick={() => {
                  setCurrentPage("profile");
                  setShowDropdown(false);
                }}
                className="px-3 py-1.5 text-left text-sm text-white hover:bg-gray-700 rounded-t-lg"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
                className="px-3 py-1.5 text-left text-sm text-red-400 hover:bg-gray-700 rounded-b-lg"
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
