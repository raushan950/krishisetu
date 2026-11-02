import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, LogOut, User, ShieldCheck, ShoppingCart, Tractor } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isFarmer, isBuyer, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-emerald-600 rounded-lg group-hover:bg-emerald-500 transition-colors">
            <Sprout className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight flex items-center gap-1.5">
              KrishiSetu
              <span className="text-xs bg-amber-400 text-emerald-950 font-bold px-1.5 py-0.5 rounded">SIH26132</span>
            </div>
            <p className="text-[10px] text-emerald-200 leading-tight">Farmer-Buyer Market Intelligence</p>
          </div>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-sm font-medium text-emerald-100 hover:text-white transition-colors"
              >
                Dashboard
              </Link>

              {/* Role Indicator Badge */}
              <div className="flex items-center gap-2 bg-emerald-900/80 border border-emerald-700/60 rounded-full px-3 py-1">
                {isFarmer && <Tractor className="w-4 h-4 text-emerald-300" />}
                {isBuyer && <ShoppingCart className="w-4 h-4 text-blue-300" />}
                {isAdmin && <ShieldCheck className="w-4 h-4 text-amber-300" />}
                <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                  {user?.role}
                </span>
                <span className="text-xs text-emerald-300 border-l border-emerald-700 pl-2">
                  {user?.full_name?.split(' ')[0]}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs bg-emerald-700/80 hover:bg-red-600/90 text-white px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer"
                title="Sign out of KrishiSetu"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-emerald-100 hover:text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700/50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-amber-400 hover:bg-amber-300 text-emerald-950 px-4 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
