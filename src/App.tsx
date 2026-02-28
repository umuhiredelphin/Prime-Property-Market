import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { User } from './types';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import PropertyDetails from './pages/PropertyDetails';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/sell/Dashboard';
import Profile from './pages/sell/Profile';
import Settings from './pages/sell/Settings';
import UserHome from './pages/user/UserHome';
import Help from './pages/Help';
import Admin from './pages/admin/Admin';
import Sell from './pages/sell/Sell';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, [token]);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <Router>
        <AppContent user={user} token={token} logout={logout} />
      </Router>
    </AuthContext.Provider>
  );
}

function AppContent({ user, token, logout }: { user: User | null, token: string | null, logout: () => void }) {
  const location = window.location.pathname; // This is not reactive, better use useLocation
  // But we are inside Router now, so we can use useLocation in a subcomponent
  return <AppRoutes user={user} token={token} logout={logout} />;
}



function AppRoutes({ user, token, logout }: { user: User | null, token: string | null, logout: () => void }) {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const isSeller = user?.role === 'seller' || user?.role === 'admin';
  const hideLayout = isDashboard && isSeller;

  return (
    <div className={`min-h-screen font-sans text-neutral-900 ${hideLayout ? 'bg-[#050505]' : 'bg-neutral-50'}`}>
      <Navbar />
      <main className={hideLayout ? '' : 'pt-16'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/help" element={<Help />} />
          <Route path="/sell" element={token ? <Sell /> : <Navigate to="/login" />} />
          <Route path="/user-home" element={token ? <UserHome /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/settings" element={token ? <Settings /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
        </Routes>
      </main>
      {!hideLayout && (
        <footer className="bg-white border-t border-neutral-200 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mb-4">Prime Property Market</h2>
                <p className="text-neutral-500 max-w-sm">
                  The leading platform for buying, selling, and renting premium properties. 
                  Find your dream home or commercial space with ease.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-neutral-500">
                  <li><a href="/search" className="hover:text-neutral-900">Search Properties</a></li>
                  <li><a href="/sell" className="hover:text-neutral-900">List Property</a></li>
                  <li><a href="/dashboard" className="hover:text-neutral-900">My Dashboard</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Contact</h3>
                <ul className="space-y-2 text-neutral-500">
                  <li>support@primeproperty.com</li>
                  <li>+1 (555) 000-0000</li>
                  <li>123 Real Estate Ave, NY</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-neutral-100 mt-12 pt-8 text-center text-neutral-400 text-sm">
              © {new Date().getFullYear()} Prime Property Market. All rights reserved.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
