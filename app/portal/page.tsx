import { getDashboardData, submitBookingRequest, logoutUser } from '../actions';
import { Activity, Bed, UserPlus, LogOut } from 'lucide-react';

export default async function UserPortal() {
  const wards = await getDashboardData();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      
      {/* Minimalist Centered Navbar */}
      <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <Activity className="text-blue-600 w-7 h-7" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900">LifeLine</span>
        </div>
        <form action={logoutUser}>
          <button type="submit" className="text-sm font-bold text-slate-400 hover:text-red-600 transition-colors flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </form>
      </nav>

      <main className="flex flex-col items-center justify-center pt-12 pb-24">
        
        {/* Symmetrical Hero Section */}
        <div className="text-center max-w-2xl mx-auto px-6 mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-widest mb-6 border border-blue-100">
            Live Tracking Active
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5 text-slate-900">
            ICU Resource Portal
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Monitor real-time bed availability across all intensive care units and submit priority admission requests to triage.
          </p>
        </div>

        {/* Centered Wards Grid */}
        <div className="w-full max-w-6xl mx-auto px-6 mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wards.map((ward) => {
              const hasBeds = ward.current_available_beds > 0;
              return (
                <div key={ward.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${hasBeds ? 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100' : 'bg-red-50 text-red-500 group-hover:bg-red-100'}`}>
                    <Bed className="w-8 h-8" />
                  </div>
                  <span className={`text-6xl font-black tracking-tighter mb-3 ${hasBeds ? 'text-emerald-500' : 'text-red-500'}`}>
                    {ward.current_available_beds}
                  </span>
                  <h3 className="font-bold text-slate-800 text-lg">{ward.name}</h3>
                  <p className="text-sm text-slate-400 font-medium mt-1">{ward.hospital_name}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cohesive Booking Form */}
        <div className="w-full max-w-2xl mx-auto px-6">
          <div className="bg-white p-10 md:p-12 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
            
            {/* Decorative Top Accent */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

            <div className="text-center mb-10">
               <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-blue-600">
                 <UserPlus className="w-7 h-7" />
               </div>
               <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Request Admission</h2>
               <p className="text-slate-500 text-sm font-medium mt-2">Submit patient details directly to the administrative queue.</p>
            </div>

            <form action={submitBookingRequest} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 text-center">Patient Full Name</label>
                <input 
                  type="text" 
                  name="patientName" 
                  required 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-4 text-center text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" 
                  placeholder="e.g. John Doe"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 text-center">Severity Score (1-10)</label>
                  <input 
                    type="number" 
                    name="severityScore" 
                    min="1" max="10" 
                    required 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-4 text-center text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    placeholder="10 = Critical"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 text-center">Required Ward</label>
                  <select 
                    name="wardId" 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-4 text-center text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    {wards.map(w => (
                       <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold text-lg py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
}