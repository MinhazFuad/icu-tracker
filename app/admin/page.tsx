import { getPendingRequests, getDashboardData, getActiveAdmissions, logoutUser } from '../actions';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import Link from 'next/link';
import AdminActions from './AdminActions';
import DischargeButton from './DischargeButton';

export default async function AdminDashboard() {
  const requests = await getPendingRequests();
  const wards = await getDashboardData();
  const admissions = await getActiveAdmissions();

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-slate-50 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <ShieldAlert className="text-red-500 w-8 h-8" /> Command Center
            </h1>
            <p className="text-slate-400 mt-1 font-medium">Triage queue and resource allocation</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold transition">
              <ArrowLeft className="w-4 h-4" /> Public Portal
            </Link>
            <form action={logoutUser}>
              <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-red-900 hover:bg-red-800 text-red-100 rounded-lg font-semibold transition">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </form>
          </div>
        </header>

        <h2 className="text-xl font-bold mb-4 text-slate-300">Pending Triage Requests</h2>
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl mb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold">Patient Name</th>
                <th className="p-5 font-semibold">Severity</th>
                <th className="p-5 font-semibold">Requested Ward</th>
                <th className="p-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {requests.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">No pending requests in queue.</td></tr>
              ) : (
                requests.map((req) => {
                  const targetWard = wards.find(w => w.id === req.ward_id);
                  const hasBeds = targetWard && targetWard.current_available_beds > 0;
                  return (
                    <tr key={req.id} className="hover:bg-slate-700/30 transition">
                      <td className="p-5 font-medium">{req.patient_name}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.severity_score >= 8 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                          Level {req.severity_score}
                        </span>
                      </td>
                      <td className="p-5 text-slate-300">
                        {req.ward_name} 
                        <span className={`ml-2 text-xs ${hasBeds ? 'text-emerald-400' : 'text-red-400'}`}>
                          ({targetWard?.current_available_beds} open)
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <AdminActions requestId={req.id} wardId={req.ward_id} patientName={req.patient_name} severityScore={req.severity_score} hasBeds={!!hasBeds} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold mb-4 text-slate-300">Active ICU Admissions</h2>
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold">Patient Name</th>
                <th className="p-5 font-semibold">Ward & Bed</th>
                <th className="p-5 font-semibold">Admitted On</th>
                <th className="p-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {admissions.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">No active admissions.</td></tr>
              ) : (
                admissions.map((adm) => (
                    <tr key={adm.id} className="hover:bg-slate-700/30 transition">
                      <td className="p-5 font-medium">{adm.patient_name}</td>
                      <td className="p-5 text-slate-300">{adm.ward_name} (Bed #{adm.bed_id})</td>
                      <td className="p-5 text-slate-400 text-sm">{new Date(adm.admission_time).toLocaleString()}</td>
                      <td className="p-5 text-right"><DischargeButton admissionId={adm.id} /></td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}