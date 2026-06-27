import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FileText, Home, List } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/editor', label: '编辑简历', icon: FileText },
    { path: '/my-resumes', label: '我的简历', icon: List },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-primary transition-colors">
            <span className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <FileText size={18} className="text-white" />
            </span>
            <span>呼风简历</span>
          </Link>
          <nav className="flex items-center gap-0.5">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-primary text-white shadow-sm shadow-primary/25'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main><Outlet /></main>
    </div>
  );
}
