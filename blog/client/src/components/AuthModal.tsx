import React from 'react';
import { Mail, Lock, UserPlus } from 'lucide-react';
import { useBlog } from '../context/BlogContext';

const AuthModal: React.FC = () => {
  const { 
    authMode, 
    setAuthMode, 
    authData, 
    setAuthData, 
    handleAuth, 
    setShowAuth 
  } = useBlog();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div 
        className="bg-white rounded-lg p-8 w-full max-w-md animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {authMode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
        </h2>

        <div className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label htmlFor="username\" className="block text-sm font-medium text-gray-700 mb-2">Kullanıcı Adı</label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="username"
                  type="text"
                  value={authData.username || ''}
                  onChange={(e) => setAuthData({...authData, username: e.target.value})}
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="kullaniciadi"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                value={authData.email}
                onChange={(e) => setAuthData({...authData, email: e.target.value})}
                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="ornek@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                type="password"
                value={authData.password}
                onChange={(e) => setAuthData({...authData, password: e.target.value})}
                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            onClick={handleAuth}
            className="w-full btn btn-primary py-3 mt-2"
          >
            {authMode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {authMode === 'login' ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="ml-1 text-blue-500 hover:text-blue-700"
              >
                {authMode === 'login' ? 'Kayıt Olun' : 'Giriş Yapın'}
              </button>
            </p>
          </div>
        </div>

        <button 
          onClick={() => setShowAuth(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 p-2"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AuthModal;