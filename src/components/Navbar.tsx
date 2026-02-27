import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Home, Search, User, LogOut, PlusCircle, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-neutral-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900 hidden sm:block">
              Prime Property
            </span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/search" className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 transition-colors">
              <Search className="w-4 h-4" />
              <span className="text-sm font-medium">Search</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-4 sm:gap-6">
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 transition-colors">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">Admin</span>
                  </Link>
                )}
                
                {(user.role === 'seller' || user.role === 'admin') && (
                  <Link to="/sell" className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 transition-colors">
                    <PlusCircle className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">List Property</span>
                  </Link>
                )}

                <Link to="/dashboard" className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 transition-colors">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                </Link>

                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="flex items-center gap-1 text-neutral-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/auth" 
                className="bg-neutral-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
