'use client';
import { useState } from 'react';

export default function StaticSidebar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const categories = [
    { id: 1, name: 'Dashboard', icon: '📊' },
    { id: 2, name: 'Projects', icon: '📁' },
    { id: 3, name: 'Tasks', icon: '✅' },
    { id: 4, name: 'Reports', icon: '📈' },
    { id: 5, name: 'Settings', icon: '⚙️' },
  ];

  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <div className="h-screen w-64 bg-gray-800 text-white flex flex-col">
      {/* Logo Section */}
      <div className="flex items-center p-6 h-16 border-b border-gray-700">
        <span className="text-indigo-500 text-2xl">⚡</span>
        <span className="ml-2 text-xl font-bold">MyApp</span>
      </div>

      {/* Categories Section */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="px-2 space-y-1">
          {categories.map((category) => (
            <li key={category.id}>
              <a
                href="#"
                className="flex items-center w-full px-4 py-2 text-sm rounded-lg text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <span className="mr-3">{category.icon}</span>
                <span>{category.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-700">
        {isLoggedIn ? (
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center w-full p-2 rounded-lg hover:bg-gray-700 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-sm">
                JD
              </div>
              <div className="ml-3 flex-1 text-left">
                <p className="text-sm font-medium">Jane Doe</p>
                <p className="text-xs text-gray-400">jane@example.com</p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserMenu && (
                <button 
                  onClick={toggleLogin}
                  className="w-full text-left block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-600 rounded"
                >
                  Sign out
                </button>
            )}
          </div>
        ) : (
          <button 
            onClick={toggleLogin}
            className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            <span className="text-sm font-medium">Sign In</span>
          </button>
        )}
      </div>
    </div>
  );
}