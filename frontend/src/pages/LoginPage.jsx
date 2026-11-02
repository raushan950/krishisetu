import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(result.error);
    }
  };

  const handleDemoFill = (demoRole) => {
    if (demoRole === 'FARMER') {
      setEmail('ramesh.farmer@example.com');
      setPassword('FarmerPassword@123');
    } else if (demoRole === 'BUYER') {
      setEmail('sharma.traders@example.com');
      setPassword('BuyerPassword@123');
    } else if (demoRole === 'ADMIN') {
      setEmail('admin@krishisetu.gov.in');
      setPassword('AdminPassword@123');
    }
    setErrorMsg('');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 p-6 text-white text-center">
          <div className="inline-flex p-3 bg-emerald-600/60 rounded-xl mb-3 shadow-inner">
            <Sprout className="w-8 h-8 text-amber-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">KrishiSetu Portal</h1>
          <p className="text-emerald-100 text-xs mt-1">Sign in to access price discovery & market linkages</p>
        </div>

        {/* Demo Account Quick-Fill Pills */}
        <div className="p-4 bg-emerald-50/60 border-b border-emerald-100">
          <p className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Hackathon Demo Quick-Fill
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('FARMER')}
              className="text-xs bg-white hover:bg-emerald-100/70 border border-emerald-300 text-emerald-800 py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer text-center shadow-2xs"
            >
              🧑‍🌾 Farmer
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('BUYER')}
              className="text-xs bg-white hover:bg-emerald-100/70 border border-emerald-300 text-emerald-800 py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer text-center shadow-2xs"
            >
              🏪 Buyer
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('ADMIN')}
              className="text-xs bg-white hover:bg-emerald-100/70 border border-emerald-300 text-emerald-800 py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer text-center shadow-2xs"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-600 pt-2">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-800 underline">
              Register as Farmer or Buyer
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
