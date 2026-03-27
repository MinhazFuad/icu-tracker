'use client'

import { approveRequest, rejectRequest } from '../actions';
import { useTransition } from 'react';

export default function AdminActions({ requestId, wardId, patientName, severityScore, hasBeds }: any) {
    const [isPending, startTransition] = useTransition();

    const handleApprove = () => {
        startTransition(async () => {
            const res = await approveRequest(requestId, wardId, patientName, severityScore);
            if (!res.success) alert(res.message);
        });
    };

    const handleReject = () => {
        startTransition(async () => {
            await rejectRequest(requestId);
        });
    };

    return (
        <div className="flex justify-end gap-3">
            <button 
                onClick={handleReject} disabled={isPending}
                className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition disabled:opacity-50"
            >Reject</button>
            <button 
                onClick={handleApprove} disabled={!hasBeds || isPending}
                className="px-4 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:bg-slate-700 disabled:text-slate-500"
            >
                {hasBeds ? (isPending ? 'Processing...' : 'Approve & Allocate') : 'No Resources'}
            </button>
        </div>
    );
}