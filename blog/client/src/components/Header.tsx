import React, { useState } from 'react';
import { Search, User, Plus, ArrowLeft } from 'lucide-react';
import { useBlog } from '../context/BlogContext';

const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    searchTerm, 
    setSearchTerm 
  } = useBlog();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {(activeTab === 'post-view' || activeTab === 'profile') && (
              <button
                onClick={() => setActiveTab('home')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <h1 
              onClick={() => setActiveTab('home')} 
              className="text-xl font-bold text-gray-900 cursor-pointer"
            >
              MiniBlog
            </h1>
          </div>
          
          {/* Search */}
          {activeTab === 'home' && (
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  aria-label="Search posts"
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            {/* Create Post Button */}
            <button
              onClick={() => setActiveTab('create')}
              className="flex items-center space-x-2 btn btn-primary"
              aria-label="Create new post"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Yeni Post</span>
            </button>

            {/* Profile */}
            <button
              onClick={() => setActiveTab('profile')}
              className="w-8 h-8 avatar"
              aria-label="View profile"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;