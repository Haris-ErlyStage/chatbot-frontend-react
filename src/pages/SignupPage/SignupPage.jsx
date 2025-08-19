// src/components/SignupPage/SignupPage.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

/**
 * Generates a random username based on the full name.
 * - Takes the full name, splits it by spaces.
 * - Takes the first two parts (first and last name).
 * - Converts to lowercase and removes non-alphanumeric characters.
 * - Joins them with an underscore.
 * - Appends a random number between 100000 and 999999.
 * @param {string} fullName - The user's full name.
 * @returns {string} - The generated username.
 */
const generateUsername = (fullName) => {
  if (!fullName) return '';

  // Split the full name into parts
  const nameParts = fullName.trim().split(/\s+/); // Split by one or more spaces and trim
  
  if (nameParts.length === 0) return '';

  // Take the first part (first name)
  const firstName = nameParts[0];
  
  // Sanitize first name: lowercase, remove non-alphanumeric chars
  const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  let baseUsername = cleanFirstName;

  // If there's a second part (last name), include it
  if (nameParts.length > 1) {
    const lastName = nameParts[1];
    // Sanitize last name: lowercase, remove non-alphanumeric chars
    const cleanLastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Combine first and last name with an underscore
    baseUsername = `${cleanFirstName}_${cleanLastName}`;
  }

  // Ensure the base username part is not empty
  if (!baseUsername) {
    // Fallback if the first name was all non-alphanumeric
    baseUsername = 'user'; 
  }

  // Generate a random number suffix (6 digits)
  const randomNumber = Math.floor(Math.random() * 900000) + 100000; // 100000 to 999999
  return `${baseUsername}${randomNumber}`;
};

const SignupPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // States for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Generate username based on full name
    const generatedUsername = generateUsername(fullName);

    try {
      // Call the API with the correct parameters: full_name, email, username, password
      const response = await api.signup(fullName, email, generatedUsername, password);
      if (response.user) {
        login(response.user, response.access_token);
        navigate('/home'); // Redirect to home after successful signup
      } else {
        setError(response.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err); // Log the full error for debugging
      // Display a more user-friendly error message based on the error object if possible
      if (err && typeof err === 'object' && err.detail) {
        // Backend often returns errors in a 'detail' field
        setError(err.detail);
      } else if (err && typeof err === 'object' && err.message) {
        setError(err.message);
      } else if (err && typeof err === 'object' && Object.keys(err).length > 0) {
        // If it's an object with keys (likely backend error data), show a generic message or parse it
        setError('Signup failed. Please check your details and try again.');
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600 text-sm mt-1">Join our community to start chatting with PDFs</p>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-xs font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                placeholder="Bruce Martin"
                required
              />
            </div>

            <div>
              <label htmlFor="signupEmail" className="block text-xs font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="signupEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="signupPassword" className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="signupPassword"
                  type={showPassword ? "text" : "password"} // Toggle type based on state
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm" // Added pr-10 for icon space
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"} // Toggle type based on state
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm" // Added pr-10 for icon space
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;