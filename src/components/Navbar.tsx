import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { logoutUser, resetAuth } from '../features/auth/authSlice';
import { authService } from '../services/authService';
import { Sun, Moon, LogOut, PenSquare, User as UserIcon, UserX, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    
    toast(
      ({ closeToast }) => (
        <div className="min-w-[200px]">
          <p className="mb-3 text-sm font-medium text-gray-800">
            Permanently delete your account?
          </p>
          <p className="mb-3 text-xs text-red-500">
            This cannot be undone. All your posts will be removed.
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={closeToast}
              className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                closeToast();
                try {
                  // Call Service to delete user and their data
                  await authService.deleteAccount();
                  
                  dispatch(resetAuth());
                  toast.success('Account deleted successfully');
                  navigate('/register');
                } catch (error: any) {
                  console.error('Error deleting account:', error);
                  toast.error(error.message || 'Failed to delete account');
                }
              }}
              className="px-3 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        hideProgressBar: true,
      }
    );
  };

  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md transition-all duration-300 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-gray-800 dark:text-white transition-colors">
            <img 
              src="/SimplyStated.png" 
              alt="Simply Stated Logo" 
              width="40"
              height="40"
              className="w-10 h-10 rounded-lg object-contain shadow-sm" 
            />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">Simply Stated</span>
          </Link>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3 sm:gap-4">
                <Link 
                  to="/create-post" 
                  className="flex items-center space-x-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium hover:shadow-md"
                >
                  <PenSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Write</span>
                </Link>
                
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none group"
                  >
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-blue-600 dark:text-blue-300 ring-2 ring-transparent group-hover:ring-blue-200 dark:group-hover:ring-blue-900 transition-all shadow-sm border border-white dark:border-gray-700">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div className="hidden md:flex flex-col text-right">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {user.user_metadata?.username || user.email?.split('@')[0]}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50 transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 md:hidden">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.user_metadata?.username || user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => {
                          handleLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-gray-400" />
                        Sign Out
                      </button>
                      
                      <div className="my-1 border-t border-gray-100 dark:border-gray-700"></div>
                      
                      <button 
                        onClick={() => {
                          handleDeleteAccount();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                      >
                        <UserX className="w-4 h-4" />
                        Delete Account
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

