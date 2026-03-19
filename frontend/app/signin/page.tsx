"use client";
import React, { useState, useEffect } from 'react';
import { Lock, Mail, ChevronLeft, ShieldCheck, HeartPulse, Stethoscope, ArrowRight, Activity, Eye, EyeOff, Building2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API = "http://127.0.0.1:8001";

export default function StaffSignin() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Login failed");

            // Store auth data
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Role-based routing
            const role = data.user.role;
            if (role === "national_super_user" || role === "ministry_official") {
                router.push("/national-dashboard");
            } else if (role === "institution_it_admin") {
                router.push("/hospital-dashboard");
            } else if (role === "nurse") {
                router.push("/triage");
            } else if (role === "doctor") {
                router.push("/clinical");
            } else if (role === "pharmacist") {
                router.push("/pharmacy");
            } else if (role === "lab_tech") {
                router.push("/laboratory");
            } else if (role === "receptionist") {
                router.push("/reception");
            } else {
                router.push("/hospital-dashboard");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 flex flex-col items-center py-12 px-4">
            <div className="w-full max-w-5xl mx-auto flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 font-bold transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                    <ChevronLeft className="w-4 h-4" /> Back to Home
                </Link>
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <ShieldCheck className="w-5 h-5" /> Authorized Access
                </div>
            </div>

            <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden flex flex-col md:flex-row">
                <div className="bg-[#007b46] text-white p-10 md:w-5/12 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Activity className="w-48 h-48" />
                    </div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 mb-6 shadow-inner">
                            <HeartPulse className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-black mb-4 tracking-tight leading-tight">Welcome to the Frontline.</h2>
                        <p className="text-emerald-50 mb-8 text-sm leading-relaxed opacity-90">
                            You are accessing the National EMR Network. This portal provides secure, high-speed access to patient life-lines and unified clinical intelligence.
                        </p>
                        <div className="space-y-6">
                            <div className="flex items-start gap-3">
                                <div className="mt-1"><Stethoscope className="w-5 h-5 text-emerald-300" /></div>
                                <div>
                                    <h4 className="font-bold text-sm text-emerald-50">Clinical Command</h4>
                                    <p className="text-xs text-emerald-100/70 mt-1">Instant retrieval of allergy, medical history, and predictive lab models.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1"><ShieldCheck className="w-5 h-5 text-emerald-300" /></div>
                                <div>
                                    <h4 className="font-bold text-sm text-emerald-50">Role-Based Access</h4>
                                    <p className="text-xs text-emerald-100/70 mt-1">Doctors, nurses, pharmacists, and lab techs each get tailored dashboards.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10 mt-12 pt-8 border-t border-emerald-600/50 flex items-center justify-between">
                        <div className="text-[10px] text-emerald-200/80 uppercase tracking-widest font-black">
                            Staff Authentication Gateway
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-12 md:w-7/12 bg-white flex flex-col justify-center">
                    <div className="mb-10 text-center md:text-left">
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">Staff Signin</h3>
                        <p className="text-sm text-slate-500 mt-2 font-medium">Enter your credentials to access your role-specific dashboard.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                                    placeholder="e.g. dr.j.doe@hospital.gov.zw"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password *</label>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-slate-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                                    placeholder="••••••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#007b46] hover:bg-[#006035] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating...</> : <>Authenticate Profile <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></>}
                            </button>
                            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium text-center">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Secure 256-bit Connection
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@900&family=Inter:wght@400;500;700;900&display=swap');
                .font-sans { font-family: 'Inter', sans-serif; }
            `}</style>
        </div>
    );
}
