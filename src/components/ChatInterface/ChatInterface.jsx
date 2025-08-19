// src/components/ChatInterface/ChatInterface.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChatInterface = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [showDropdown, setShowDropdown] = useState(false);
  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Zustand state & actions
  const {
    currentUser,
    messages,
    currentThreadId,
    isSendingMessage,
    isLoadingMessages,
    loadThreadMessages,
    sendMessage,
    uploadFiles,
  } = useAuthStore();

  // Safely parse user from localStorage
  useEffect(() => {
    let user = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) user = JSON.parse(userStr);
      if (!user || !useAuthStore.getState().authToken) {
        navigate('/login');
      }
    } catch (err) {
      toast.error('Invalid session. Please log in again.');
      navigate('/login');
    }
  }, [navigate]);

  // Load messages when thread changes
  useEffect(() => {
    if (!currentThreadId) return;

    if (currentThreadId.startsWith('temp_')) {
      // New chat: messages already cleared
    } else {
      loadThreadMessages(currentThreadId);
    }
  }, [currentThreadId, loadThreadMessages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle file upload with progress
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      await uploadFiles(files, currentThreadId, (progress) => {
        console.log(`Upload progress: ${Math.round(progress)}%`);
      });
      toast.success(`Uploaded ${files.length} file(s)!`);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.message || 'Failed to upload files');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Send message
  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !currentUser) {
      if (!currentUser) toast.error('Not logged in');
      return;
    }

    sendMessage(trimmed);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Render message
  const renderMessage = (message) => {
    const type = message.type || message.sender || 'user';
    const isError = message.isError || false;

    return (
      <div
        key={message.id}
        className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-3xl rounded-2xl px-4 py-3 ${
            type === 'user'
              ? 'bg-blue-600 text-white'
              : isError
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
            {message.content}
          </p>

          {message.sources && message.sources.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Sources:</p>
              <ul className="text-xs space-y-1">
                {message.sources.map((source, index) => (
                  <li key={index} className="text-blue-600 hover:underline">
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.title || `Source ${index + 1}`}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-1 text-right">
            <span className="text-xs opacity-70">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        {(isSendingMessage || isLoadingMessages) && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isSendingMessage}
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              title="Upload PDFs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            <div className="relative flex-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full border border-gray-300 rounded-2xl py-2 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="1"
                style={{ minHeight: '44px', maxHeight: '200px' }}
                disabled={isSendingMessage}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isSendingMessage}
                className={`absolute right-2 bottom-2 p-1 rounded-full ${
                  inputValue.trim() && !isSendingMessage
                    ? 'text-blue-500 hover:bg-blue-50'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>

          {/* Model Selector */}
          <div className="flex justify-end mt-2">
            <div className="relative inline-block text-left" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {selectedModel}
                <svg className="-mr-1 ml-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  {['gpt-4', 'gpt-3.5-turbo'].map((model) => (
                    <button
                      key={model}
                      onClick={() => {
                        setSelectedModel(model);
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      {model}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        multiple
        accept=".pdf,.txt,.doc,.docx"
      />
    </div>
  );
};

export default ChatInterface;