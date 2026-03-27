'use client'

import { dischargePatient } from '../actions';
import { useTransition } from 'react';

export default function DischargeButton({ admissionId }: { admissionId: number }) {
    const [isPending, startTransition] = useTransition();

    const handleDischarge = () => {
        if (!confirm("Are you sure you want to discharge this patient? This frees the bed and equipment.")) return;
        startTransition(async () => {
            const res = await dischargePatient(admissionId);
            if(res.message) alert(res.message);
        });
    };

    return (
        <button 
            onClick={handleDischarge} disabled={isPending}
            className="px-4 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition disabled:opacity-50"
        >
            {isPending ? 'Processing...' : 'Discharge Patient'}
        </button>
    );
}