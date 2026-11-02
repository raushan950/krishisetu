import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Tractor, ShoppingCart, TrendingUp, ShieldCheck, ArrowRight, MapPin, Calculator } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex-1 bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-700/80 border border-emerald-500/40 text-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Sprout className="w-4 h-4" />
            Smart India Hackathon • Problem ID: SIH26132
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Strengthening Market Linkages & <br className="hidden sm:inline" />
            <span className="text-amber-400">Price Discovery for Farmers</span>
          </h1>

          <p className="text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto font-normal leading-relaxed">
            KrishiSetu empowers Indian agricultural producers to discover real mandi prices, compare effective net returns after transport costs, and connect directly with verified commercial buyers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Tractor className="w-4 h-4" />
              <span>Register as Farmer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-200" />
              <span>Join as Verified Buyer</span>
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center justify-center text-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            How KrishiSetu Transforms Agricultural Trade
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Engineered specifically to solve the core challenges identified in SIH26132
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Transparent Mandi Intelligence
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct ingestion of daily minimum, maximum, and modal prices across APMC mandis. Unit normalization and clearly stamped data provenance.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-4">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Net-Return Decision Engine
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Don't be misled by headline prices. We compute exact freight distance, vehicle tonnage rates, and mandi cess to rank where you truly profit the most.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Traceable Marketplace & Bidding
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verified commercial buyers submit formal bids against farmer crop listings. Accepted bids instantly generate binding transaction orders and printable receipts.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
