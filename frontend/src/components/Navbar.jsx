import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCurrentUser } from "../api/users.api";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (token) {
      loadUser();
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const res = await getCurrentUser(token);
      setCurrentUser(res.data);
    } catch (error) {
      console.error("Failed to load user:", error);
      
      // If token is invalid or expired (401), clear it and redirect to login
      if (error.response?.status === 401) {
        console.log("Token expired or invalid, logging out...");
        localStorage.removeItem("token");
        setCurrentUser(null);
        navigate("/login");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Main Nav */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition">
              {/* DevTrack Logo SVG */}
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-10 sm:h-10">
                <rect width="40" height="40" rx="8" fill="url(#gradient)"/>
                <path d="M12 10h6c4.4 0 8 3.6 8 8s-3.6 8-8 8h-6V10z" fill="white"/>
                <circle cx="24" cy="18" r="3" fill="white"/>
                <circle cx="20" cy="28" r="2" fill="#3B82F6"/>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3B82F6"/>
                    <stop offset="1" stopColor="#8B5CF6"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-lg sm:text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DevTrack
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            {token && (
              <nav className="hidden md:flex items-center space-x-2">
                <Link
                  to="/projects"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition"
                >
                  Projects
                </Link>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition"
                >
                  Dashboard
                </Link>
              </nav>
            )}
          </div>

          {/* Search Bar - Hidden on mobile */}
          {token && (
            <div className="hidden lg:block flex-1 max-w-xl mx-8">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                >
                  <path d="M32 30.586l-10.845-10.845c1.771-2.092 2.845-4.791 2.845-7.741 0-6.617-5.383-12-12-12s-12 5.383-12 12c0 6.617 5.383 12 12 12 2.949 0 5.649-1.074 7.741-2.845l10.845 10.845 1.414-1.414zM12 22c-5.514 0-10-4.486-10-10s4.486-10 10-10c5.514 0 10 4.486 10 10s-4.486 10-10 10z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search projects, tickets..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
                />
              </div>
            </div>
          )}

          {/* Right Side - User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {token ? (
              <>
                {/* Notifications Icon - Hidden on mobile */}
                <button className="hidden sm:block p-2 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md transition relative">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showMobileMenu ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>

                {/* User Avatar & Dropdown - Desktop */}
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 px-2 py-2 rounded-md transition"
                  >
                    <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white shadow-md">
                      {currentUser?.name?.charAt(0).toUpperCase() || currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                      fill="currentColor"
                      viewBox="0 0 32 32"
                    >
                      <path d="M16 21l-13-13h-3l16 16 16-16h-3l-13 13z" />
                    </svg>
                  </button>

                  {/* Desktop Dropdown */}
                  {showDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                      />
                      
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">
                            {currentUser?.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {currentUser?.email}
                          </p>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/projects"
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            onClick={() => setShowDropdown(false)}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                            </svg>
                            <span>Your Projects</span>
                          </Link>

                          <Link
                            to="/settings"
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            onClick={() => setShowDropdown(false)}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                            </svg>
                            <span>Settings</span>
                          </Link>
                        </div>

                        <div className="border-t border-gray-200 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 cursor-pointer hover:bg-red-50 transition w-full text-left"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 32 32">
                              <path d="M3 0h22c0.553 0 1 0 1 0.553l-0 3.447h-2v-2h-20v28h20v-2h2l0 3.447c0 0.553-0.447 0.553-1 0.553h-22c-0.553 0-1-0.447-1-1v-30c0-0.553 0.447-1 1-1z" />
                              <path d="M21.879 21.293l1.414 1.414 6.707-6.707-6.707-6.707-1.414 1.414 4.293 4.293h-14.172v2h14.172l-4.293 4.293z" />
                            </svg>
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition px-3 sm:px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-3 sm:px-5 py-2 text-sm font-medium rounded-md hover:bg-blue-700 transition shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && token && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            <Link
              to="/dashboard"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
              onClick={() => setShowMobileMenu(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
              onClick={() => setShowMobileMenu(false)}
            >
              Projects
            </Link>
            <Link
              to="/settings"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
              onClick={() => setShowMobileMenu(false)}
            >
              Settings
            </Link>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="px-4 py-2">
                <p className="text-sm font-semibold text-gray-900">{currentUser?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
