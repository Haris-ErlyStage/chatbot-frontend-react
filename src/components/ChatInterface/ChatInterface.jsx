// src/components/ChatInterface/ChatInterface.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

const ChatInterface = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const { messages, addMessage, currentUser } = useAuthStore();
  const dropdownRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || !currentUser) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    addMessage(userMessage);
    setInputValue('');
    setIsLoading(true);

    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `This is a simulated response to your query: "${inputValue}". In a real implementation, this would come from the AI API.`,
        timestamp: new Date()
      };
      addMessage(aiMessage);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessage = (message) => {
    return (
      <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className={`max-w-2xl rounded-2xl px-4 py-2 ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
          <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-800">ChatBot</h1>
          <select
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
            defaultValue="gpt-4"
            onChange={(e) => console.log("Selected model:", e.target.value)}
          >
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-3.5">GPT-3.5</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>
        <div>
          <button
            onClick={() => navigate('/files')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
            Uploaded Files
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col flex-1 items-center justify-center px-4">
            <p className="text-gray-500 mb-6">Start chatting with your PDF assistant...</p>
            <div className="w-full max-w-3xl relative">
              <div className="relative flex items-center">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about your PDFs..."
                  className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-full resize-none focus:outline-none transition"
                  rows="1"
                  disabled={isLoading}
                />
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                {showDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute left-0 bottom-full mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                  >
                    <button
                      onClick={() => {
                        console.log("Attach files & photos clicked");
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828l6.586-6.586a4 4 0 00-5.656-5.656l-6.586 6.586a6 6 0 008.485 8.485l6.586-6.586" />
                      </svg>
                      Attach files & photos
                    </button>
                    <button
                      onClick={() => {
                        console.log("Deep research clicked");
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5v-2m0-4v-2m-3 3h6" />
                      </svg>
                      Deep research
                    </button>
                  </div>
                )}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
                  <button className="text-gray-500 hover:text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1a3 3 0 00-3 3v7a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v1a7 7 0 11-14 0v-1M12 19v4m-4 0h8" />
                    </svg>
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line • Powered by AI</span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((message) => (
                  <React.Fragment key={message.id}>{renderMessage(message)}</React.Fragment>
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="max-w-2xl rounded-2xl px-4 py-2 bg-gray-100 text-gray-800 flex items-center gap-2">
                      <p className="text-sm md:text-base text-gray-800 flex items-center">
                        AI is thinking
                        <span className="dot ml-1">.</span>
                        <span className="dot">.</span>
                        <span className="dot">.</span>
                      </p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="p-4 bg-white flex flex-col items-center">
              <div className="w-full max-w-3xl relative">
                <div className="relative flex items-center">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about your PDFs..."
                    className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-full resize-none focus:outline-none transition"
                    rows="1"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => setShowDropdown((prev) => !prev)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  {showDropdown && (
                    <div
                      ref={dropdownRef}
                      className="absolute left-0 bottom-full mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                    >
                      <button
                        onClick={() => {
                          console.log("Attach files & photos clicked");
                          setShowDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828l6.586-6.586a4 4 0 00-5.656-5.656l-6.586 6.586a6 6 0 008.485 8.485l6.586-6.586" />
                        </svg>
                        Attach files & photos
                      </button>
                      <button
                        onClick={() => {
                          console.log("Deep research clicked");
                          setShowDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5v-2m0-4v-2m-3 3h6" />
                        </svg>
                        Deep research
                      </button>
                    </div>
                  )}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex itemsZ gap-3">
                    <button className="text-gray-500 hover:text-gray-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1a3 3 0 00-3 3v7a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v1a7 7 0 11-14 0v-1M12 19v4m-4 0h8" />
                      </svg>
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim() || isLoading}
                      className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                <span>Press Enter to send, Shift+Enter for new line • Powered by AI</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;