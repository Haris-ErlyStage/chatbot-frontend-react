// src/components/FileManager/FileManager.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const { currentUser } = useAuthStore();

  // Mock dummy data
  const mockFiles = [
    {
      id: "pdf_12345",
      filename: "research_paper.pdf",
      upload_time: "2023-12-01T10:30:00Z",
      text_length: 15420,
      table_count: 8,
      image_count: 3,
      chunks_stored: 120,
    },
    {
      id: "pdf_67890",
      filename: "technical_document.pdf",
      upload_time: "2023-12-01T11:15:00Z",
      text_length: 8765,
      table_count: 5,
      image_count: 2,
      chunks_stored: 85,
    },
    {
      id: "pdf_54321",
      filename: "annual_report.pdf",
      upload_time: "2023-12-01T09:45:00Z",
      text_length: 28910,
      table_count: 12,
      image_count: 7,
      chunks_stored: 210,
    },
    {
      id: "pdf_98765",
      filename: "user_manual.pdf",
      upload_time: "2023-12-01T14:20:00Z",
      text_length: 4230,
      table_count: 3,
      image_count: 1,
      chunks_stored: 45,
    },
  ];

  useEffect(() => {
    if (currentUser) {
      setFiles(mockFiles);
    }
  }, [currentUser]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const handleDelete = (fileId) => {
    setFiles(files.filter((file) => file.id !== fileId));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Uploaded Files</h2>
        {/* Back to Chat button */}
        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
        >
          Back to Chat
        </Link>
      </div>

      {files.length === 0 ? (
        <p className="text-gray-600">No files available</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filename</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Upload Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Text Length</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tables</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Images</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chunks</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{file.filename}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(file.upload_time)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{file.text_length}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{file.table_count}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{file.image_count}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{file.chunks_stored}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
