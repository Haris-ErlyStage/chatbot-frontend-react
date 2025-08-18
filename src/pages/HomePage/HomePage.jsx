// src/components/HomePage/HomePage.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import Sidebar from '../../components/Sidebar/Sidebar';
import ChatInterface from '../../components/ChatInterface/ChatInterface';

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser } = useAuthStore();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
};

export default HomePage;