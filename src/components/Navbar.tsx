import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import supabase from '../supabaseClient';
import { Sun, Moon, LogOut, PenSquare, User as UserIcon, UserX } from 'lucide-react';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isDeleting, setIsDeleting] = useState(false);

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
    await supabase.auth.signOut();
    dispatch(logout());
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
                setIsDeleting(true);
                try {
                  // Call RPC function to delete user and their data
                  const { error } = await supabase.rpc('delete_user_account');
                  
                  if (error) throw error;
                  
                  dispatch(logout());
                  toast.success('Account deleted successfully');
                  navigate('/register');
                } catch (error: any) {
                  console.error('Error deleting account:', error);
                  toast.error(error.message || 'Failed to delete account');
                } finally {
                  setIsDeleting(false);
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
    <nav className="bg-white dark:bg-gray-900 shadow-md transition-colors duration-300 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-gray-800 dark:text-white transition-colors">
            <img 
              src="/SimplyStated.png" 
              alt="Simply Stated Logo" 
              className="w-10 h-10 rounded-lg object-contain" 
            />
            <span>Simply Stated</span>
          </Link>
          
          <div className="flex items-center space-x-4">
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
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link 
                  to="/create-post" 
                  className="flex items-center space-x-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
                >
                  <PenSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Write</span>
                </Link>
                
                <div className="flex items-center space-x-3 border-l border-gray-200 dark:border-gray-700 pl-4">
                  <div className="flex flex-col text-right hidden md:flex">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.user_metadata?.username || user.email?.split('@')[0]}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                       Author
                    </span>
                  </div>
                  
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                      <UserIcon className="w-5 h-5" />
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete Account"
                  >
                    <UserX className="w-5 h-5" />
                  </button>
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

