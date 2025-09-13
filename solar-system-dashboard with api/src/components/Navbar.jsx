import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { MoonIcon, SunIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Navbar = ({ onLogout, isConnected, isAuthenticated, username }) => {
  const { darkMode, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2.5 fixed w-full z-10 h-16">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center justify-start">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            太陽能系統監控
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Connection status indicator - 只在登入狀態顯示 */}
          {isAuthenticated && (
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">
                {isConnected ? '已連接' : '未連接'}
              </span>
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            title={darkMode ? '切換到亮色模式' : '切換到暗色模式'}
          >
            {darkMode ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>
          
          {/* 用戶信息和登出按鈕 */}
          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <UserCircleIcon className="w-6 h-6" />
                <span className="text-sm font-medium">{username || '用戶'}</span>
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{username || '用戶'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">登入時間: {new Date(localStorage.getItem('loginTime') || Date.now()).toLocaleString()}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="flex items-center w-full p-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                      <span>登出系統</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              登入
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
