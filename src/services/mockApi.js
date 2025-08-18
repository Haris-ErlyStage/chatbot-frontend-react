// src/services/mockApi.js
import { v4 as uuidv4 } from 'uuid';

// Mock data storage
let mockUsers = [
  {
    id: 'user_12345',
    username: 'haris',
    email: 'haris@erlystage.com',
    password: 'Password@123',
    created_at: '2023-12-01T10:30:00Z'
  }
];

let mockPDFs = [
  {
    id: 'pdf_12345',
    filename: 'sample_document.pdf',
    size: 1024000,
    pages: 25,
    uploaded_at: '2023-12-01T10:30:00Z',
    stats: {
      text_length: 5000,
      table_count: 3,
      image_count: 2,
      chunks_stored: 150
    }
  },
  {
    id: 'pdf_67890',
    filename: 'research_paper.pdf',
    size: 2048000,
    pages: 40,
    uploaded_at: '2023-12-01T11:15:00Z',
    stats: {
      text_length: 8000,
      table_count: 5,
      image_count: 4,
      chunks_stored: 250
    }
  }
];

let mockThreads = [
  {
    id: 'thread_12345',
    title: 'Document Analysis',
    created_at: '2023-12-01T10:30:00Z',
    last_message: 'What are the key findings?',
    last_updated: '2023-12-01T12:05:00Z'
  },
  {
    id: 'thread_67890',
    title: 'Research Paper Review',
    created_at: '2023-12-01T11:15:00Z',
    last_message: 'Can you summarize the methodology?',
    last_updated: '2023-12-01T11:45:00Z'
  },
  {
    id: 'thread_122345',
    title: 'Document Analysis',
    created_at: '2023-12-01T10:30:00Z',
    last_message: 'What are the key findings?',
    last_updated: '2023-12-01T12:05:00Z'
  },
  {
    id: 'thread_673890',
    title: 'Research Paper Review',
    created_at: '2023-12-01T11:15:00Z',
    last_message: 'Can you summarize the methodology?',
    last_updated: '2023-12-01T11:45:00Z'
  },
  {
    id: 'thread_123145',
    title: 'Document Analysis',
    created_at: '2023-12-01T10:30:00Z',
    last_message: 'What are the key findings?',
    last_updated: '2023-12-01T12:05:00Z'
  },
  {
    id: 'thread_677890',
    title: 'Research Paper Review',
    created_at: '2023-12-01T11:15:00Z',
    last_message: 'Can you summarize the methodology?',
    last_updated: '2023-12-01T11:45:00Z'
  },
  {
    id: 'thread_123455',
    title: 'Document Analysis',
    created_at: '2023-12-01T10:30:00Z',
    last_message: 'What are the key findings?',
    last_updated: '2023-12-01T12:05:00Z'
  },
  {
    id: 'thread_678390',
    title: 'Research Paper Review',
    created_at: '2023-12-01T11:15:00Z',
    last_message: 'Can you summarize the methodology?',
    last_updated: '2023-12-01T11:45:00Z'
  },
  {
    id: 'thread_12333455',
    title: 'Document Analysis',
    created_at: '2023-12-01T10:30:00Z',
    last_message: 'What are the key findings?',
    last_updated: '2023-12-01T12:05:00Z'
  },
  {
    id: 'thread_67823390',
    title: 'Research Paper Review',
    created_at: '2023-12-01T11:15:00Z',
    last_message: 'Can you summarize the methodology?',
    last_updated: '2023-12-01T11:45:00Z'
  },
  {
    id: 'thread_11223455',
    title: 'Document Analysis',
    created_at: '2023-12-01T10:30:00Z',
    last_message: 'What are the key findings?',
    last_updated: '2023-12-01T12:05:00Z'
  },
  {
    id: 'thread_62378390',
    title: 'Research Paper Review',
    created_at: '2023-12-01T11:15:00Z',
    last_message: 'Can you summarize the methodology?',
    last_updated: '2023-12-01T11:45:00Z'
  }
];

let mockMessages = [
  {
    thread_id: 'thread_12345',
    messages: [
      {
        type: 'user',
        content: 'What is this document about?',
        timestamp: '2023-12-01T12:00:00Z'
      },
      {
        type: 'assistant',
        content: 'This document discusses the implementation of machine learning algorithms for document classification. It covers various techniques including neural networks and support vector machines.',
        timestamp: '2023-12-01T12:00:05Z'
      }
    ]
  }
];

// Helper function to generate fake AI responses
const generateAIResponse = (query, pdfIds = []) => {
  const responses = [
    `Based on the documents you've uploaded, I found relevant information about "${query}". The key points are: 1) Important concept mentioned 2) Supporting evidence 3) Practical applications`,
    `Regarding "${query}", here's what I discovered from your documents: The main theme focuses on advanced methodologies. Key findings include: - Detailed explanation - Supporting data - Conclusion`,
    `After analyzing your documents, I can tell you that "${query}" relates to several important aspects. The documents discuss: 1) Core principles 2) Implementation strategies 3) Best practices`,
    `From your uploaded materials, I found several references to "${query}". The documents indicate that: 1) Primary focus area 2) Secondary considerations 3) Future implications`
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  return randomResponse;
};

// Mock API service
export const mockApi = {
  // Auth endpoints
  login: async (email, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find user by email
    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.password !== password) {
      throw new Error('Invalid email or password');
    }

    return {
      status: 'success',
      message: 'Login successful.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      }
    };
  },

  signup: async (fullName, email, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser = {
      id: `user_${Date.now()}`,
      username: fullName,
      email: email,
      password: password,
      created_at: new Date().toISOString()
    };

    mockUsers.push(newUser);

    return {
      status: 'created',
      message: 'User created successfully.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        created_at: newUser.created_at
      }
    };
  },

  // Chat endpoints
  getChatHistory: async (userId) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      threads: mockThreads
    };
  },

  loadThread: async (userId, threadId) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const threadData = mockMessages.find(m => m.thread_id === threadId);

    if (threadData) {
      return {
        thread_id: threadId,
        messages: threadData.messages
      };
    }

    return {
      thread_id: threadId,
      messages: []
    };
  },

  sendMessage: async (userId, threadId, message, pdfIds) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate AI response
    const aiResponse = generateAIResponse(message, pdfIds);

    // Return mock response
    return {
      user_id: userId,
      username: 'haris',
      pdf_id: pdfIds && pdfIds.length > 0 ? pdfIds[0] : null,
      selected_pdf_ids: pdfIds || [],
      thread_id: threadId || `thread_${Date.now()}`,
      user_message: message,
      ai_response: aiResponse,
      timestamp: new Date().toISOString(),
      vector_database_path: pdfIds && pdfIds.length > 0 ? `vector_db_${pdfIds[0]}` : 'unified_vector_database'
    };
  },

  // File endpoints
  uploadFiles: async (userId, files) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const successful = files.length;
    const results = [];

    files.forEach((file, index) => {
      const newPdf = {
        id: `pdf_${Date.now()}_${index}`,
        filename: file.name,
        size: file.size,
        pages: Math.floor(Math.random() * 50) + 10,
        uploaded_at: new Date().toISOString(),
        stats: {
          text_length: Math.floor(Math.random() * 10000) + 1000,
          table_count: Math.floor(Math.random() * 10),
          image_count: Math.floor(Math.random() * 5),
          chunks_stored: Math.floor(Math.random() * 300) + 50
        }
      };

      mockPDFs.push(newPdf);
      results.push({
        filename: file.name,
        pdf_id: newPdf.id,
        status: 'processed',
        processing_time: '2023-12-01T10:30:00Z'
      });
    });

    return {
      successful: successful,
      failed: 0,
      details: results
    };
  },

  listFiles: async (userId) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      pdfs: mockPDFs
    };
  },

  deleteFile: async (userId, fileId) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Remove file from mock data
    const index = mockPDFs.findIndex(pdf => pdf.id === fileId);
    if (index !== -1) {
      mockPDFs.splice(index, 1);
    }

    return {
      message: 'PDF deleted successfully',
      pdf_id: fileId
    };
  },

  // Additional endpoints
  healthCheck: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  },

  // New endpoints based on the backend documentation
  listVectorDbs: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      total_databases: mockPDFs.length,
      vector_databases: mockPDFs.map(pdf => ({
        pdf_id: pdf.id,
        directory: `vector_db_${pdf.id}`,
        source: pdf.filename,
        total_chunks: pdf.stats.chunks_stored,
        processing_time: pdf.uploaded_at,
        timestamp: pdf.uploaded_at
      }))
    };
  },

  searchVectorDatabase: async (pdfId, query, topK = 5) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const results = [];
    const sampleSnippets = [
      `Relevant content about "${query}" found in document`,
      `Important information regarding "${query}" in this section`,
      `Key points related to "${query}" from the document`,
      `Detailed explanation of "${query}" in the text`
    ];

    for (let i = 0; i < Math.min(topK, mockPDFs.length); i++) {
      results.push({
        pdf_id: mockPDFs[i].id,
        filename: mockPDFs[i].filename,
        content_snippet: sampleSnippets[i % sampleSnippets.length],
        similarity_score: (0.7 + Math.random() * 0.3).toFixed(2),
        page_number: Math.floor(Math.random() * 100) + 1
      });
    }

    return {
      query: query,
      results_count: results.length,
      vector_database_path: `vector_db_${pdfId}`,
      results: results
    };
  },

  // Multi-PDF chat endpoint
  chatWithMultiplePDFs: async (userId, threadId, message, pdfIds) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate AI response for multi-PDF scenario
    const aiResponse = `I've analyzed ${pdfIds.length} documents for your query: "${message}". The key findings are: 1) Common themes identified across documents 2) Contrasting viewpoints 3) Supporting evidence from multiple sources`;

    return {
      user_id: userId,
      username: 'haris',
      pdf_id: null,
      selected_pdf_ids: pdfIds,
      thread_id: threadId || `thread_${Date.now()}`,
      user_message: message,
      ai_response: aiResponse,
      timestamp: new Date().toISOString(),
      vector_database_path: 'unified_vector_database'
    };
  }
};

// Export the mock API for use in your application
export const api = mockApi;