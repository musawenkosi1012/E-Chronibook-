"use client";
import React, { useState, useEffect } from 'react';
import { FlaskConical, Search, Clock, CheckCircle, AlertCircle, LogOut, Plus, X, Loader2, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API = "http://127.0.0.1:8001";
function getAuth() {
    if (typeof window === 'undefined') return { token: '', user: null };
    return { token: localStorage.getItem("token") || "", user: JSON.parse(localStorage.getItem("user") || "null") };
}

export default function LaboratoryPortal() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("pending");
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [resultForm, setResultForm] = useState({ result_value: "", unit: "", reference_range: "", is_abnormal: "normal", notes: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { token, user } = getAuth();

    useEffect(() => {
        if (!token) { router.push("/signin"); return; }
        loadPending();
    }, []);

    const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

    async function loadPending() {
        try {
            const res = await fetch(`${API}/api/lab/orders/pending`, { headers });
            if (res.ok) setOrders(await res.json());
        } catch { }
    }

    async function enterResult(orderId: number) {
        setLoading(true); setError("");
        try {
            const res = await fetch(`${API}/api/lab/results/${orderId}`, { method: "POST", headers, body: JSON.stringify(resultForm) });
            if (!res.ok) throw new Error((await res.json()).detail);
            setSelectedOrder(null);
            setResultForm({ result_value: "", unit: "", reference_range: "", is_abnormal: "normal", notes: "" });
            await loadPending();
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    }

    const inputClass = "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all";

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center"><FlaskConical className="w-4 h-4 text-white" /></div>
                    <span className="font-black text-slate-800 text-lg">Laboratory Portal</span>
                    <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full font-bold">{user?.role}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 font-medium">{user?.full_name}</span>
                    <button onClick={() => { localStorage.clear(); router.push("/signin"); }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition"><LogOut className="w-4 h-4" /> Sign out</button>
                </div>
            </div>

            <div className="p-6 max-w-6xl mx-auto">
                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}

                <h2 className="text-xl font-black text-slate-800 mb-4">Pending Lab Orders</h2>
                {orders.length === 0 ? (
                    <div className="text-center py-16 text-slate-400"><CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-30" /><p className="font-bold">All lab orders processed</p></div>
                ) : (
                    <div className="space-y-3">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-black text-slate-800">{order.test_name}</span>
                                            {order.test_code && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">{order.test_code}</span>}
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${order.priority === "stat" ? "bg-red-50 text-red-700" : order.priority === "urgent" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>{order.priority}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700`}>{order.status}</span>
                                        </div>
                                        {order.clinical_indication && <p className="text-sm text-slate-500">Indication: {order.clinical_indication}</p>}
                                        <div className="text-xs text-slate-400 mt-1">Patient ID: {order.patient_id} • Ordered: {new Date(order.created_at).toLocaleString()}</div>
                                    </div>
                                    <button onClick={() => setSelectedOrder(order)} className="bg-cyan-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-cyan-700 transition-all flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Enter Result
                                    </button>
                                </div>
                                {order.results?.length > 0 && (
                                    <div className="mt-3 space-y-1">
                                        {order.results.map((r: any) => (
                                            <div key={r.id} className="flex items-center gap-2 text-sm">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.is_abnormal === "critical" ? "bg-red-50 text-red-700" : r.is_abnormal === "high" || r.is_abnormal === "low" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>{r.is_abnormal}</span>
                                                <span className="font-bold text-slate-700">{r.result_value} {r.unit}</span>
                                                {r.reference_range && <span className="text-slate-400">(ref: {r.reference_range})</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Enter Result Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Enter Lab Result</h3>
                                <p className="text-sm text-slate-500 mt-1">{selectedOrder.test_name} {selectedOrder.test_code && `(${selectedOrder.test_code})`}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-slate-600 uppercase">Result Value *</label><input value={resultForm.result_value} onChange={e => setResultForm({ ...resultForm, result_value: e.target.value })} className={inputClass} placeholder="e.g. 5.2" /></div>
                                <div><label className="text-xs font-bold text-slate-600 uppercase">Unit</label><input value={resultForm.unit} onChange={e => setResultForm({ ...resultForm, unit: e.target.value })} className={inputClass} placeholder="e.g. mmol/L" /></div>
                                <div><label className="text-xs font-bold text-slate-600 uppercase">Reference Range</label><input value={resultForm.reference_range} onChange={e => setResultForm({ ...resultForm, reference_range: e.target.value })} className={inputClass} placeholder="e.g. 3.5-5.5" /></div>
                                <div><label className="text-xs font-bold text-slate-600 uppercase">Interpretation</label>
                                    <select value={resultForm.is_abnormal} onChange={e => setResultForm({ ...resultForm, is_abnormal: e.target.value })} className={inputClass}>
                                        <option value="normal">Normal</option><option value="high">High</option><option value="low">Low</option><option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div><label className="text-xs font-bold text-slate-600 uppercase">Notes</label><textarea value={resultForm.notes} onChange={e => setResultForm({ ...resultForm, notes: e.target.value })} className={inputClass + " h-20"} placeholder="Additional observations..." /></div>
                            <button onClick={() => enterResult(selectedOrder.id)} disabled={loading} className="w-full bg-cyan-600 text-white py-3 rounded-xl font-bold hover:bg-cyan-700 disabled:opacity-50 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Result
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap'); .font-sans { font-family: 'Inter', sans-serif; }`}</style>
        </div>
    );
}
