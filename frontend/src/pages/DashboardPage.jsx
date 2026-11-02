import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import {
  Tractor,
  ShoppingCart,
  ShieldCheck,
  MapPin,
  CheckCircle,
  Clock,
  RefreshCw,
  Layers,
  Database,
  Building,
  AlertCircle
} from 'lucide-react';

const DashboardPage = () => {
  const { user, isFarmer, isBuyer, isAdmin } = useAuth();
  const [profileData, setProfileData] = useState(user);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());
  const [syncError, setSyncError] = useState('');

  const refreshProfile = async () => {
    setIsRefreshing(true);
    setSyncError('');
    try {
      const res = await axiosClient.get('/auth/me/');
      setProfileData(res.data);
      setLastSynced(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to reload profile:', err);
      setSyncError('Could not sync latest profile from backend.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setProfileData(user);
  }, [user]);

  // Robust profile resolution: supports both role-specific and unified profile keys
  const farmerProfile = profileData?.farmer_profile || (isFarmer ? profileData?.profile : null);
  const buyerProfile = profileData?.buyer_profile || (isBuyer ? profileData?.profile : null);

  return (
    <div className="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {syncError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{syncError}</span>
          </div>
        )}

        {/* Welcome Top Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl ${
              isFarmer ? 'bg-emerald-100 text-emerald-800' :
              isBuyer ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {isFarmer && <Tractor className="w-8 h-8" />}
              {isBuyer && <ShoppingCart className="w-8 h-8" />}
              {isAdmin && <ShieldCheck className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Welcome, {profileData?.full_name || 'User'}!
                </h1>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isFarmer ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                  isBuyer ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                  'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {profileData?.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span>{profileData?.email}</span>
                <span>•</span>
                <span>{profileData?.phone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshProfile}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Sync Status</span>
            </button>
            <div className="text-[11px] text-slate-400">
              Synced: <span className="font-mono text-slate-600">{lastSynced}</span>
            </div>
          </div>
        </div>

        {/* Phase 1 Verification Status Banner */}
        <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-800/90 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-md mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Phase 1 Active: Authentication & Core Architecture Verified
              </div>
              <h2 className="text-lg font-bold text-white">
                PostgreSQL & Stateless SimpleJWT Handshake Active
              </h2>
              <p className="text-xs text-emerald-200 mt-1 max-w-2xl leading-relaxed">
                Your user session is validated with JWT tokens and role-based permissions.
                Profile synchronization between Django REST Framework and React is operational.
              </p>
            </div>
            <div className="bg-emerald-800/60 border border-emerald-700 p-3 rounded-xl text-center min-w-[160px]">
              <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">User UUID</div>
              <div className="text-xs font-mono text-amber-200 mt-0.5 truncate max-w-[160px]">
                {profileData?.id}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details & Role Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Verified Profile Details
            </h3>

            {isFarmer && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Village</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{farmerProfile?.village || 'Not specified'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">District</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{farmerProfile?.district || 'Neemuch'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">State</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{farmerProfile?.state || 'Madhya Pradesh'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Farm Size</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{farmerProfile?.farm_size_acres ? `${farmerProfile.farm_size_acres} Acres` : 'N/A'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Language</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{farmerProfile?.preferred_language?.toUpperCase() || 'EN'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Account Status</div>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5">Active & Verified</div>
                </div>
              </div>
            )}

            {isBuyer && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Business Name</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{buyerProfile?.business_name || profileData?.full_name}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Buyer Type</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{buyerProfile?.buyer_type || 'WHOLESALER'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">GSTIN</div>
                  <div className="text-sm font-bold font-mono text-slate-800 mt-0.5">{buyerProfile?.gstin || 'Unregistered'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Operating District</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{buyerProfile?.district || 'Indore'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Operating State</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{buyerProfile?.state || 'Madhya Pradesh'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Market Tier</div>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5">Verified Commercial</div>
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Role Type</div>
                  <div className="text-sm font-bold text-amber-800 mt-0.5">Platform Administrator</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Staff Access</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">Enabled (Django Admin)</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Superuser Status</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">Active</div>
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Phase Modules Indicator */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Next Phase Roadmap
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Upcoming modules to be connected upon Phase 1 sign-off:
              </p>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2 text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                  <span><strong>Phase 2:</strong> Crop Listings & Buyer Offers</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                  <span><strong>Phase 3:</strong> Mandi Prices & Net-Return AI</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                  <span><strong>Phase 4:</strong> Governance & Deployment</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
              KrishiSetu • Smart India Hackathon 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
