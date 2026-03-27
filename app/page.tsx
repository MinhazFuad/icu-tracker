import Link from 'next/link';
import { Activity, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <nav className="w-full bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-600 w-8 h-8" />
          <span className="text-xl font-bold text-slate-900">LifeLine DBMS</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
            Log In
          </Link>
          <Link href="/register" className="px-5 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6 border border-blue-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Live Triage Operations
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mb-6">
          Centralized <span className="text-blue-600">ICU Tracking</span> & Resource Allocation
        </h1>
        
        <p className="text-lg text-slate-500 max-w-2xl mb-10">
          A high-performance database management solution for real-time critical care logistics. Secure hospital beds, allocate ventilators, and manage triage queues with ACID-compliant precision.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/register" className="flex items-center gap-2 px-8 py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-lg shadow-blue-600/20">
            Create Patient Account <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/login" className="flex items-center gap-2 px-8 py-4 text-lg font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition shadow-sm">
            Staff Portal Login
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mt-24 text-left">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <Clock className="w-10 h-10 text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Real-Time Availability</h3>
            <p className="text-slate-500 text-sm">Database triggers ensure ward capacities are updated to the millisecond, preventing overbooking.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <ShieldCheck className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Secure Transactions</h3>
            <p className="text-slate-500 text-sm">Pessimistic row-level locking guarantees that life-saving equipment is never double-allocated.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <Activity className="w-10 h-10 text-indigo-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Live Triage Queue</h3>
            <p className="text-slate-500 text-sm">Admins can review pending requests sorted dynamically by patient severity and wait time.</p>
          </div>
        </div>
      </main>
      
      <footer className="w-full text-center py-8 text-slate-400 text-sm">
        University DBMS Project • Built with Next.js & MySQL
      </footer>
    </div>
  );
}