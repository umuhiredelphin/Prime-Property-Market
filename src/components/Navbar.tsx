import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  Home, Search, User, LogOut, PlusCircle, ShieldCheck, 
  Settings, Bell, LayoutGrid, HelpCircle 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSeller = user?.role === 'seller' || user?.role === 'admin';

  // Hide navbar on dashboard for sellers/admins
  if (isSeller && location.pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className={`fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl backdrop-blur-2xl border z-50 rounded-[2rem] shadow-2xl ${
      isSeller 
        ? 'bg-black border-white/10 shadow-emerald-500/5' 
        : 'bg-white/70 border-white/20 shadow-neutral-900/5'
    }`}>
      <div className="px-6 sm:px-10">
        <div className="flex justify-between h-20 items-center">
          <Link to={isSeller ? "/dashboard" : "/"} className="flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 ${
              isSeller ? 'bg-emerald-500' : 'bg-neutral-900'
            }`}>
              <Home className={`w-6 h-6 ${isSeller ? 'text-black' : 'text-white'}`} />
            </div>
            <span className={`text-2xl font-black tracking-tighter hidden sm:block ${
              isSeller ? 'text-white' : 'text-neutral-900'
            }`}>
              PRIME<span className={isSeller ? 'text-emerald-500' : 'text-neutral-400'}>PROPERTY</span>
            </span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6 lg:gap-10">
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {!isSeller && (
                <Link to="/search" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-all font-bold text-sm uppercase tracking-widest">
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </Link>
              )}
              {!isSeller && (
                <Link to="/search" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-all font-bold text-sm uppercase tracking-widest">
                  <LayoutGrid className="w-4 h-4" />
                  <span>Categories</span>
                </Link>
              )}
              <Link to="/help" className={`flex items-center gap-2 transition-all font-bold text-sm uppercase tracking-widest ${
                isSeller ? 'text-neutral-400 hover:text-emerald-400' : 'text-neutral-500 hover:text-neutral-900'
              }`}>
                <HelpCircle className="w-4 h-4" />
                <span>Help</span>
              </Link>
            </div>

            {user ? (
              <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
                <div className="hidden lg:flex items-center gap-6">
                  {!isSeller && (
                    <Link to="/user-home" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-all font-bold text-sm uppercase tracking-widest">
                      <Home className="w-4 h-4" />
                      <span>Home</span>
                    </Link>
                  )}
                  {isSeller && (
                    <Link to="/dashboard" className="flex items-center gap-2 text-emerald-400 hover:text-white transition-all font-bold text-sm uppercase tracking-widest">
                      <LayoutGrid className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                </div>

                {!isSeller && (
                  <div className="flex items-center gap-2 sm:gap-4">
                    <button className="relative w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors">
                      <Bell className="w-5 h-5" />
                      <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
                    </button>
                    
                    <Link to="/settings" className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors">
                      <Settings className="w-5 h-5" />
                    </Link>
                  </div>
                )}

                <div className={`h-8 w-px hidden sm:block ${isSeller ? 'bg-white/10' : 'bg-neutral-200'}`} />

                <div className="flex items-center gap-4">
                  {user.role === 'admin' && !isSeller && (
                    <Link to="/admin" className="hidden lg:flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-all font-bold text-sm uppercase tracking-widest">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Admin</span>
                    </Link>
                  )}
                  
                  {!isSeller && (
                    <Link to="/profile" className="flex items-center gap-2 text-neutral-900 font-black text-sm uppercase tracking-widest bg-neutral-100 px-5 py-2.5 rounded-2xl hover:bg-neutral-200 transition-all">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                    </Link>
                  )}

                  <button 
                    onClick={() => { logout(); navigate('/'); }}
                    className={`w-10 h-10 flex items-center justify-center transition-colors ${
                      isSeller ? 'text-neutral-500 hover:text-emerald-400' : 'text-neutral-400 hover:text-red-500'
                    }`}
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-neutral-900 text-white px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-neutral-800 transition-all active:scale-95 shadow-xl shadow-neutral-900/10"
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
