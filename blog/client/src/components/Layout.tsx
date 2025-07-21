import React, { ReactNode } from 'react';
import Header from './Header';
import AuthModal from './AuthModal';
import { useBlog } from '../context/BlogContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { showAuth } = useBlog();
  
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
      {showAuth && <AuthModal />}
    </>
  );
};

export default Layout;