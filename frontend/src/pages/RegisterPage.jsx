import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Tractor, ShoppingCart, User, Mail, Phone, Lock, MapPin, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

const RegisterPage = () => {
  const [role, setRole] = useState('FARMER');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirm: '',
    // Farmer specific
    village: '',
    district: 'Neemuch',
    state: 'Madhya Pradesh',
    farm_size_acres: '10.0',
    // Buyer specific
    business_name: '',
    buyer_type: 'WHOLESALER',
    gstin: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuickFill = (targetRole) => {
    setRole(targetRole);
    const rand = Math.floor(1000 + Math.random() * 9000);
    const randPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

    if (targetRole === 'FARMER') {
      setFormData({
        full_name: `Kisan Ramesh ${rand}`,
        email: `kisan.${rand}@krishisetu.in`,
        phone: randPhone,
        password: 'KisanPassword@123',
        password_confirm: 'KisanPassword@123',
        village: 'Pipliya Mandi',
        district: 'Neemuch',
        state: 'Madhya Pradesh',
        farm_size_acres: '8.5',
        business_name: '',
        buyer_type: 'WHOLESALER',
        gstin: '',
      });
    } else {
      setFormData({
        full_name: `Trader Suresh ${rand}`,
        email: `trader.${rand}@krishisetu.in`,
        phone: randPhone,
        password: 'BuyerPassword@123',
        password_confirm: 'BuyerPassword@123',
        village: '',
        district: 'Indore',
        state: 'Madhya Pradesh',
        farm_size_acres: '',
        business_name: `Agro Commercials ${rand} Ltd`,
        buyer_type: 'WHOLESALER',
        gstin: '23ABCDE1234F1Z5',
      });
    }
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Pre-flight validation
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (/^\d+$/.test(formData.password)) {
      setErrorMsg('Password cannot be entirely numeric.');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const cleanPhone = formData.phone.trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);

    // Build role-isolated payload to match Django serializers cleanly
    const payload = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: cleanPhone,
      password: formData.password,
      password_confirm: formData.password_confirm,
      role,
      district: formData.district.trim(),
      state: formData.state.trim(),
    };

    if (role === 'FARMER') {
      payload.village = formData.village.trim();
      payload.farm_size_acres = formData.farm_size_acres ? parseFloat(formData.farm_size_acres) : null;
    } else if (role === 'BUYER') {
      payload.business_name = formData.business_name.trim();
      payload.buyer_type = formData.buyer_type;
      payload.gstin = formData.gstin.trim();
    }

    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 p-6 text-white text-center">
          <div className="inline-flex p-3 bg-emerald-600/60 rounded-xl mb-3 shadow-inner">
            <Sprout className="w-8 h-8 text-amber-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create KrishiSetu Account</h1>
          <p className="text-emerald-100 text-xs mt-1">Select your role to start trading with fair prices</p>
        </div>

        {/* SIH Hackathon Quick-Fill Bar */}
        <div className="p-3.5 bg-emerald-50/70 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Hackathon Evaluation Quick-Fill:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('FARMER')}
              className="text-xs bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 py-1 px-2.5 rounded-lg font-medium cursor-pointer transition-colors shadow-2xs"
            >
              🧑‍🌾 Test Farmer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('BUYER')}
              className="text-xs bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 py-1 px-2.5 rounded-lg font-medium cursor-pointer transition-colors shadow-2xs"
            >
              🏪 Test Buyer
            </button>
          </div>
        </div>

        {/* Role Selection Tabs */}
        <div className="p-6 pb-2 border-b border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center">
            Step 1: Choose Your Platform Role
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('FARMER')}
              className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 ${
                role === 'FARMER'
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`p-2 rounded-lg ${role === 'FARMER' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Tractor className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">Farmer / Producer</div>
                <div className="text-xs text-slate-500 mt-0.5">List harvests, discover mandi prices & estimate net profit</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('BUYER')}
              className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 ${
                role === 'BUYER'
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`p-2 rounded-lg ${role === 'BUYER' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">Buyer / Trader</div>
                <div className="text-xs text-slate-500 mt-0.5">Source verified farm lots, place offers & track consignments</div>
              </div>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder={role === 'FARMER' ? 'Ramesh Patel' : 'Suresh Sharma'}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  name="phone"
                  required
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9812345678"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="user@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters (not all numbers)"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Must be at least 6 characters, alphanumeric.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  name="password_confirm"
                  required
                  value={formData.password_confirm}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Role Specific Fields */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              {role === 'FARMER' ? 'Farm Location & Landholding' : 'Business & Trade Registration'}
            </h3>

            {role === 'FARMER' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Village</label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="Pipliya Mandi"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">District *</label>
                  <input
                    type="text"
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="Neemuch"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Farm Size (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="farm_size_acres"
                    value={formData.farm_size_acres}
                    onChange={handleChange}
                    placeholder="10.0"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Business Name *</label>
                  <input
                    type="text"
                    name="business_name"
                    required
                    value={formData.business_name}
                    onChange={handleChange}
                    placeholder="Sharma Grain Merchants"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Buyer Category</label>
                  <select
                    name="buyer_type"
                    value={formData.buyer_type}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden bg-white"
                  >
                    <option value="WHOLESALER">Wholesaler</option>
                    <option value="RETAILER">Retailer</option>
                    <option value="PROCESSOR">Food Processor / Mill</option>
                    <option value="COMMISSION_AGENT">Commission Agent (Arhatiya)</option>
                    <option value="EXPORTER">Exporter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                    placeholder="23ABCDE1234F1Z5"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Complete Registration & Launch Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-600 pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800 underline">
              Sign In here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
