"use client";
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Heart, Activity, Building2, Users, Pill, FlaskConical, LogOut, Globe, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API = "http://127.0.0.1:8001";
function getAuth() {
    if (typeof window === 'undefined') return { token: '', user: null };
    return { token: localStorage.getItem("token") || "", user: JSON.parse(localStorage.getItem("user") || "null") };
}

export default function NationalDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    const [overview, setOverview] = useState<any>(null);
    const [ncdData, setNcdData] = useState<any>(null);
    const [maternalData, setMaternalData] = useState<any>(null);
    const [trends, setTrends] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { token, user } = getAuth();

    useEffect(() => {
        if (!token) { router.push("/signin"); return; }
        loadData();
    }, []);

    const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

    async function loadData() {
        try {
            const [ov, ncd, mat, tr] = await Promise.all([
                fetch(`${API}/api/analytics/national/overview`, { headers }).then(r => r.json()),
                fetch(`${API}/api/analytics/national/ncd-burden`, { headers }).then(r => r.json()),
                fetch(`${API}/api/analytics/national/maternal-health`, { headers }).then(r => r.json()),
                fetch(`${API}/api/analytics/national/disease-trends`, { headers }).then(r => r.json()),
            ]);
            setOverview(ov); setNcdData(ncd); setMaternalData(mat); setTrends(tr);
        } catch { }
        setLoading(false);
    }

    const MetricCard = ({ icon: Icon, label, value, color, sub }: any) => (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}><Icon className="w-5 h-5 text-white" /></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
            </div>
            <div className="text-3xl font-black text-slate-800">{value ?? "—"}</div>
            {sub && <div className="text-xs text-slate-400 mt-1 font-medium">{sub}</div>}
        </div>
    );

    const ProgressBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-700">{label}</span><span className="text-sm font-black text-slate-800">{value}%</span></div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width: `${Math.min(value, 100)}%` }} /></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Top bar */}
            <div className="bg-[#005a30] text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center"><Globe className="w-4 h-4 text-white" /></div>
                    <span className="font-black text-lg">MoHCC National Dashboard</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">NATIONAL</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm opacity-80">{user?.full_name}</span>
                    <button onClick={() => { localStorage.clear(); router.push("/signin"); }} className="flex items-center gap-1.5 text-sm opacity-80 hover:opacity-100 transition"><LogOut className="w-4 h-4" /> Sign out</button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-slate-200 px-6">
                <div className="flex gap-1">
                    {[
                        { id: "overview", label: "National Overview", icon: BarChart3 },
                        { id: "ncd", label: "NCD Burden", icon: Activity },
                        { id: "maternal", label: "Maternal Health", icon: Heart },
                        { id: "trends", label: "Disease Trends", icon: TrendingUp },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold transition-all border-b-2 ${activeTab === tab.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-slate-400"><div className="text-center"><div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4" /><p>Loading national data...</p></div></div>
                ) : (
                    <>
                        {activeTab === "overview" && overview && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-black text-slate-800">National Health System Overview</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <MetricCard icon={Building2} label="Institutions" value={overview.total_institutions} color="bg-blue-500" sub="Registered facilities" />
                                    <MetricCard icon={Users} label="Total Patients" value={overview.total_patients?.toLocaleString()} color="bg-emerald-500" sub="National patient registry" />
                                    <MetricCard icon={Activity} label="Encounters" value={overview.total_encounters?.toLocaleString()} color="bg-purple-500" sub="Clinical encounters" />
                                    <MetricCard icon={Users} label="Staff" value={overview.total_staff} color="bg-orange-500" sub="Healthcare workers" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <MetricCard icon={Pill} label="Prescriptions" value={overview.total_prescriptions?.toLocaleString()} color="bg-rose-500" sub="Total prescriptions issued" />
                                    <MetricCard icon={FlaskConical} label="Lab Orders" value={overview.total_lab_orders?.toLocaleString()} color="bg-cyan-500" sub="Laboratory tests ordered" />
                                </div>

                                {/* Province Distribution */}
                                {overview.institutions_by_province?.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                        <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-emerald-600" /> Institutions by Province</h3>
                                        <div className="space-y-3">
                                            {overview.institutions_by_province.map((p: any) => (
                                                <div key={p.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <span className="text-sm font-bold text-slate-700">{p.label}</span>
                                                    <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">{p.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "ncd" && ncdData && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-black text-slate-800">NCD Burden Analysis</h2>
                                    <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold">40% of National Mortality</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <MetricCard icon={Activity} label="Hypertension Readings" value={ncdData.hypertension_readings} color="bg-red-500" sub={`${ncdData.hypertension_rate}% of all vital readings`} />
                                    <MetricCard icon={Activity} label="Diabetes Readings" value={ncdData.diabetes_readings} color="bg-amber-500" sub={`${ncdData.diabetes_rate}% of all vital readings`} />
                                    <MetricCard icon={Activity} label="Obesity Readings" value={ncdData.obesity_readings} color="bg-orange-500" sub={`${ncdData.obesity_rate}% of all vital readings`} />
                                </div>
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                    <h3 className="text-lg font-black text-slate-800 mb-4">NCD Prevalence Rates</h3>
                                    <div className="space-y-4">
                                        <ProgressBar label="Hypertension (BP ≥ 140/90)" value={ncdData.hypertension_rate} max={100} color="bg-red-500" />
                                        <ProgressBar label="Diabetes (Glucose > 11.1 mmol/L)" value={ncdData.diabetes_rate} max={100} color="bg-amber-500" />
                                        <ProgressBar label="Obesity (BMI ≥ 30)" value={ncdData.obesity_rate} max={100} color="bg-orange-500" />
                                    </div>
                                </div>
                                {ncdData.top_diagnoses?.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                        <h3 className="text-lg font-black text-slate-800 mb-4">Top 10 Diagnoses</h3>
                                        <div className="space-y-2">
                                            {ncdData.top_diagnoses.map((d: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">{i + 1}</span><span className="text-sm font-bold text-slate-700">{d.name}</span></div>
                                                    <span className="text-sm font-black text-slate-800">{d.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "maternal" && maternalData && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-black text-slate-800">Maternal Health Monitoring</h2>
                                    <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-xs font-bold">86% of deaths from care delays</span>
                                </div>
                                <MetricCard icon={Heart} label="Maternal Encounters" value={maternalData.total_maternal_encounters} color="bg-rose-500" sub="Total maternal care encounters nationally" />
                                {maternalData.maternal_encounters_by_province?.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                        <h3 className="text-lg font-black text-slate-800 mb-4">Maternal Encounters by Province</h3>
                                        <div className="space-y-2">
                                            {maternalData.maternal_encounters_by_province.map((p: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <span className="text-sm font-bold text-slate-700">{p.province || p[0]}</span>
                                                    <span className="text-sm font-black text-rose-700 bg-rose-50 px-3 py-1 rounded-full">{p.count || p[1]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "trends" && trends && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-black text-slate-800">Disease Trends & Patterns</h2>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                        <h3 className="text-lg font-black text-slate-800 mb-4">Severity Distribution</h3>
                                        <div className="space-y-2">
                                            {trends.severity_distribution?.map((s: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${s.severity === 'critical' ? 'bg-red-100 text-red-700' : s.severity === 'severe' ? 'bg-orange-100 text-orange-700' : s.severity === 'moderate' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{s.severity}</span>
                                                    <span className="text-sm font-black text-slate-800">{s.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                        <h3 className="text-lg font-black text-slate-800 mb-4">Encounter Types</h3>
                                        <div className="space-y-2">
                                            {trends.encounter_types?.map((e: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <span className="text-sm font-bold text-slate-700 capitalize">{e.type}</span>
                                                    <span className="text-sm font-black text-slate-800">{e.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap'); .font-sans { font-family: 'Inter', sans-serif; }`}</style>
        </div>
    );
}
