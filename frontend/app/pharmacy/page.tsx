"use client";
import React, { useState, useEffect } from 'react';
import { Pill, Search, Clock, CheckCircle, AlertCircle, LogOut, Package, Plus, X, Loader2, Stethoscope } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API = "http://127.0.0.1:8001";
function getAuth() {
    if (typeof window === 'undefined') return { token: '', user: null };
    return { token: localStorage.getItem("token") || "", user: JSON.parse(localStorage.getItem("user") || "null") };
}

export default function PharmacyPortal() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("pending");
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [medications, setMedications] = useState<any[]>([]);
    const [medSearch, setMedSearch] = useState("");
    const [showAddMed, setShowAddMed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { token, user } = getAuth();

    const [medForm, setMedForm] = useState({ generic_name: "", brand_name: "", form: "tablet", strength: "", category: "", stock_quantity: 0 });

    useEffect(() => {
        if (!token) { router.push("/signin"); return; }
        loadPending();
    }, []);

    const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

    async function loadPending() {
        try {
            const res = await fetch(`${API}/api/pharmacy/prescriptions/pending`, { headers });
            if (res.ok) setPrescriptions(await res.json());
        } catch { }
    }

    async function searchMeds(q: string) {
        try {
            const res = await fetch(`${API}/api/pharmacy/medications/search?q=${encodeURIComponent(q)}`, { headers });
            if (res.ok) setMedications(await res.json());
        } catch { }
    }

    async function dispense(id: number) {
        try {
            const res = await fetch(`${API}/api/pharmacy/prescriptions/${id}/dispense`, { method: "PATCH", headers });
            if (res.ok) await loadPending();
        } catch { }
    }

    async function addMedication() {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/pharmacy/medications/add`, { method: "POST", headers, body: JSON.stringify(medForm) });
            if (!res.ok) throw new Error((await res.json()).detail);
            setShowAddMed(false);
            setMedForm({ generic_name: "", brand_name: "", form: "tablet", strength: "", category: "", stock_quantity: 0 });
            searchMeds(medSearch);
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    }

    const inputClass = "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all";

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center"><Pill className="w-4 h-4 text-white" /></div>
                    <span className="font-black text-slate-800 text-lg">Pharmacy Portal</span>
                    <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold">{user?.role}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 font-medium">{user?.full_name}</span>
                    <button onClick={() => { localStorage.clear(); router.push("/signin"); }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition"><LogOut className="w-4 h-4" /> Sign out</button>
                </div>
            </div>

            <div className="bg-white border-b border-slate-200 px-6">
                <div className="flex gap-1">
                    {[
                        { id: "pending", label: "Pending Prescriptions", icon: Clock },
                        { id: "inventory", label: "Medication Inventory", icon: Package },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.id === "inventory") searchMeds(""); else loadPending(); }}
                            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold transition-all border-b-2 ${activeTab === tab.id ? 'border-rose-500 text-rose-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 max-w-6xl mx-auto">
                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}

                {activeTab === "pending" && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-black text-slate-800">Prescriptions Awaiting Dispensing</h2>
                        {prescriptions.length === 0 ? (
                            <div className="text-center py-16 text-slate-400"><CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-30" /><p className="font-bold">All prescriptions dispensed</p></div>
                        ) : (
                            <div className="space-y-3">
                                {prescriptions.map(rx => (
                                    <div key={rx.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-black text-slate-800">{rx.medication_name}</span>
                                                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">Pending</span>
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                <span className="font-bold">{rx.dosage}</span> • {rx.frequency} • {rx.duration} {rx.route && `• ${rx.route}`}
                                            </div>
                                            {rx.instructions && <p className="text-xs text-slate-400 mt-1">{rx.instructions}</p>}
                                            <div className="text-xs text-slate-400 mt-1">Patient ID: {rx.patient_id} • Qty: {rx.quantity} • {new Date(rx.created_at).toLocaleString()}</div>
                                        </div>
                                        <button onClick={() => dispense(rx.id)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> Dispense
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "inventory" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-800">Medication Inventory</h2>
                            <button onClick={() => setShowAddMed(true)} className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-700"><Plus className="w-4 h-4" /> Add Medication</button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input value={medSearch} onChange={(e) => { setMedSearch(e.target.value); searchMeds(e.target.value); }} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="Search medications..." />
                        </div>
                        <div className="space-y-2">
                            {medications.map(med => (
                                <div key={med.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-slate-800">{med.generic_name} {med.brand_name && <span className="text-slate-400 font-normal">({med.brand_name})</span>}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{med.form} • {med.strength} {med.category && `• ${med.category}`}</div>
                                    </div>
                                    <span className={`text-sm font-black px-3 py-1 rounded-full ${med.stock_quantity > 10 ? 'bg-green-50 text-green-700' : med.stock_quantity > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                                        {med.stock_quantity} units
                                    </span>
                                </div>
                            ))}
                            {medications.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">Search or add medications to manage inventory</div>}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Medication Modal */}
            {showAddMed && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-800">Add Medication</h3>
                            <button onClick={() => setShowAddMed(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-slate-600 uppercase">Generic Name *</label><input value={medForm.generic_name} onChange={e => setMedForm({ ...medForm, generic_name: e.target.value })} className={inputClass} /></div>
                                <div><label className="text-xs font-bold text-slate-600 uppercase">Brand Name</label><input value={medForm.brand_name} onChange={e => setMedForm({ ...medForm, brand_name: e.target.value })} className={inputClass} /></div>
                                <div><label className="text-xs font-bold text-slate-600 uppercase">Form *</label>
                                    <select value={medForm.form} onChange={e => setMedForm({ ...medForm, form: e.target.value })} className={inputClass}>
                                        <option value="tablet">Tablet</option><option value="capsule">Capsule</option><option value="injection">Injection</option><option value="syrup">Syrup</option><option value="topical">Topical</option>
                                    </select>
                                </div>
                                <div><label className="text-xs font-bold text-slate-600 uppercase">Strength *</label><input value={medForm.strength} onChange={e => setMedForm({ ...medForm, strength: e.target.value })} className={inputClass} placeholder="e.g. 500mg" /></div>
                                <div><label className="text-xs font-bold text-slate-600 uppercase">Category</label><input value={medForm.category} onChange={e => setMedForm({ ...medForm, category: e.target.value })} className={inputClass} placeholder="e.g. Antihypertensive" /></div>
                                <div><label className="text-xs font-bold text-slate-600 uppercase">Stock Quantity</label><input type="number" value={medForm.stock_quantity} onChange={e => setMedForm({ ...medForm, stock_quantity: parseInt(e.target.value) || 0 })} className={inputClass} /></div>
                            </div>
                            <button onClick={addMedication} disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Add to Inventory
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap'); .font-sans { font-family: 'Inter', sans-serif; }`}</style>
        </div>
    );
}
