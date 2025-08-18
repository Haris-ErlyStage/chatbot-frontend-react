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

    // Simulate AI response
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
      <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-3xl rounded-lg p-4 ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user' ? 'bg-blue-700' : 'bg-gray-300'}`}>
              {message.type === 'user' ? (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m0 16v-1M5.686 9h4.672M19 12h-4.672M5.686 15h4.672M21 17h-4.672M7.5 9h.01M7.5 12h.01M7.5 15h.01M21 9l-3.75 3.75-3.75-3.75" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className=" p-4 bg-white flex items-center justify-between">

        {/* Left side (ChatBot + Model Selector) */}
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

        {/* Right side (Uploaded Files button) */}
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m0 16v-1M5.686 9h4.672M19 12h-4.672M5.686 15h4.672M21 17h-4.672M7.5 9h.01M7.5 12h.01M7.5 15h.01M21 9l-3.75 3.75-3.75-3.75" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to PDF Chat!</h3>
            <p className="text-gray-600 max-w-md">
              Start a conversation with your PDF documents. Ask questions and get instant answers.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <React.Fragment key={message.id}>
                {renderMessage(message)}
              </React.Fragment>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="max-w-3xl rounded-lg p-4 bg-gray-100 text-gray-800">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m0 16v-1M5.686 9h4.672M19 12h-4.672M5.686 15h4.672M21 17h-4.672M7.5 9h.01M7.5 12h.01M7.5 15h.01M21 9l-3.75 3.75-3.75-3.75" />
                      </svg>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white flex flex-col items-center">
        <div className="w-full max-w-xl relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your PDFs..."
            className="w-full px-12 py-3 border border-gray-300 rounded-full resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            rows="1"
            disabled={isLoading}
          />

          {/* Plus button - left inside */}
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="absolute left-3 top-4/9 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Send button - right inside */}
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-3 top-4/9 -translate-y-1/2 text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>

          {/* Dropdown for file upload */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute bottom-14 left-3 bg-white border border-gray-200 rounded-lg shadow-lg w-56 p-4 z-50"
            >
              <label
                htmlFor="fileUpload"
                className="flex items-center gap-3 cursor-pointer border border-dashed border-gray-300 rounded-lg p-3 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition"
              >
                {/* File icon */}
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828m-3.586-2.828L19 9.828M7 17h.01"
                  />
                </svg>
                <span className="text-sm font-medium">Add photo & attachment</span>
              </label>
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files.length > 0) {
                    console.log("Selected file:", e.target.files[0]);
                    setShowDropdown(false); // close after selection
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Footer hint (closer like ChatGPT) */}
        <div className="mt-1 text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line • Powered by AI</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
