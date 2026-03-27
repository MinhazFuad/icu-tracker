'use client'

import { registerUser } from '../actions';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function RegisterPage() {
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        startTransition(async () => {
            const res = await registerUser(formData);
            if (res?.error) setError(res.error);
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-emerald-600"><Activity className="w-12 h-12" /></div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Create Patient Account</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-200">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">{error}</div>}
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Full Name</label>
                            <input name="name" type="text" required className="mt-1 block w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email address</label>
                            <input name="email" type="email" required className="mt-1 block w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Password</label>
                            <input name="password" type="password" required className="mt-1 block w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <button type="submit" disabled={isPending} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none disabled:bg-emerald-400 transition mt-6">
                            {isPending ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center text-sm text-slate-600">
                        Already have an account? <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">Sign in here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}