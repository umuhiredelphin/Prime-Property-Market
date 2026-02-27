import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import PropertyDetails from './pages/PropertyDetails';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

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
        <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/auth" />} />
              <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
            </Routes>
          </main>
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
                    <li><a href="/auth" className="hover:text-neutral-900">List Property</a></li>
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
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
