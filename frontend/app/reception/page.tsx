"use client";
import React, { useState, useEffect } from 'react';
import { Search, UserPlus, FileText, LogOut, Users, Heart, ClipboardList, ChevronRight, Loader2, AlertCircle, Plus, X, Clock, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API = "http://127.0.0.1:8001";

function getAuth() {
    if (typeof window === 'undefined') return { token: '', user: null };
    const token = localStorage.getItem("token") || "";
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return { token, user };
}

import IncrementalPatientSearch from '@/components/IncrementalSearch';

export default function ReceptionPortal() {
    const router = useRouter();
    const [patients, setPatients] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [showNewPatient, setShowNewPatient] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [mounted, setMounted] = useState(false);
    const { token, user } = getAuth();

    // New patient form state
    const [patientForm, setPatientForm] = useState({
        national_id: "", first_name: "", last_name: "", date_of_birth: "",
        gender: "male", blood_type: "", phone: "", email: "", address: "", province: "",
        allergies: "", chronic_conditions: "", emergency_contact_name: "", emergency_contact_phone: ""
    });

    // Queue form state
    const [encounterType, setEncounterType] = useState("outpatient");
    const [urgencyLevel, setUrgencyLevel] = useState("normal");

    const [patientHistory, setPatientHistory] = useState<any[]>([]);
    const [confirmationPreview, setConfirmationPreview] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        if (!token) { router.push("/signin"); return; }
        searchPatients("");
    }, []);

    const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

    async function fetchPatientHistory(patientId: number) {
        try {
            const res = await fetch(`${API}/api/clinical/patients/${patientId}/timeline`, { headers });
            if (res.ok) {
                const data = await res.json();
                setPatientHistory(data.reverse());
            }
        } catch { }
    }

    async function fetchConfirmationPreview(patientId: number) {
        try {
            const res = await fetch(`${API}/api/clinical/patients/${patientId}/confirmation-preview`, { headers });
            if (res.ok) setConfirmationPreview(await res.json());
        } catch { }
    }

    async function searchPatients(q: string) {
        try {
            const res = await fetch(`${API}/api/patients/search?q=${encodeURIComponent(q)}`, { headers });
            if (res.ok) setPatients(await res.json());
        } catch { }
    }

    async function registerPatient() {
        setLoading(true); setError(""); setSuccessMsg("");
        try {
            const res = await fetch(`${API}/api/patients/register`, { method: "POST", headers, body: JSON.stringify(patientForm) });
            if (!res.ok) throw new Error((await res.json()).detail);
            const newPatient = await res.json();
            setShowNewPatient(false);
            setPatientForm({ national_id: "", first_name: "", last_name: "", date_of_birth: "", gender: "male", blood_type: "", phone: "", email: "", address: "", province: "", allergies: "", chronic_conditions: "", emergency_contact_name: "", emergency_contact_phone: "" });
            await searchPatients("");
            setSelectedPatient(newPatient);
            setSuccessMsg("Patient registered successfully.");
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    }

    async function sendToTriage() {
        if (!selectedPatient) return;
        setLoading(true); setError(""); setSuccessMsg("");
        try {
            const body = {
                patient_id: selectedPatient.id,
                encounter_type: encounterType,
                urgency_level: urgencyLevel,
                status: "queued_for_triage"
            };
            const res = await fetch(`${API}/api/clinical/create`, { method: "POST", headers, body: JSON.stringify(body) });
            if (!res.ok) throw new Error((await res.json()).detail);
            setSuccessMsg(`${selectedPatient.first_name} has been added to the Triage Queue.`);
            setSelectedPatient(null);
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    }

    const inputClass = "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all";
    const labelClass = "text-xs font-bold text-slate-600 uppercase tracking-wider";

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Top Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center"><ClipboardList className="w-4 h-4 text-white" /></div>
                    <span className="font-black text-slate-800 text-lg">Reception Portal</span>
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{mounted ? user?.role : ''}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 font-medium">{mounted ? user?.full_name : ''}</span>
                    <button onClick={() => { localStorage.clear(); router.push("/signin"); }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign out
                    </button>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <div className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-52px)] p-4 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100">
                        <Users className="w-5 h-5" /> Patient Lookup
                    </button>

                    {selectedPatient && (
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-emerald-500" /> Recent History
                            </h4>
                            <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
                                {patientHistory.slice(0, 5).map((event: any) => (
                                    <div key={event.id} className="relative pl-4 pb-4 border-l-2 border-slate-100 last:border-0">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 shadow-sm"></div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase">{new Date(event.timestamp).toLocaleDateString()}</div>
                                        <div className="text-[11px] font-bold text-slate-700 leading-tight mt-0.5">{event.action}</div>
                                        <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{event.facility_name}</div>
                                    </div>
                                ))}
                                {patientHistory.length === 0 && <p className="text-[10px] text-slate-400 italic">No history available</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6">
                    {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
                    {successMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {successMsg}</div>}

                    {/* Patient Search & List */}
                    <div className="flex gap-6">
                        <div className="w-96 space-y-4">
                            <div className="flex items-center gap-3">
                                <IncrementalPatientSearch
                                    token={token}
                                    onSelect={(p) => {
                                        setSelectedPatient(p);
                                        setSuccessMsg("");
                                        fetchConfirmationPreview(p.id);
                                        fetchPatientHistory(p.id);
                                    }}
                                />
                                <button onClick={() => setShowNewPatient(true)} className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 shrink-0" title="Register Patient">
                                    <UserPlus className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Search Guidelines</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1"></div>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Type at least 2 characters for national identity matching.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1"></div>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Numeric inputs are prioritized as **Patient IDs**.</p>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Patient Detail + Queue Action */}
                        <div className="flex-1">
                            {selectedPatient ? (
                                <div className="space-y-6">
                                    {/* Identity Confirmation Card - Requested Feature */}
                                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Clock className="w-4 h-4" /> Patient Identity Confirmation
                                                </h3>
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600">Verification Step</span>
                                            </div>

                                            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                                                Ask the patient to recall their most recent visits to confirm their identity:
                                            </p>

                                            <div className="space-y-4">
                                                {confirmationPreview.map((visit, i) => (
                                                    <div key={visit.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                                                            {i + 1}
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-black text-emerald-400 uppercase mb-0.5">{new Date(visit.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                                            <div className="text-xs font-black text-white">{visit.facility}</div>
                                                            <div className="text-[10px] text-slate-400 font-medium italic mt-0.5">{visit.reason}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {confirmationPreview.length === 0 && (
                                                    <div className="py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                                                        <p className="text-xs font-bold text-slate-500 uppercase">No recent visit history found for this patient</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Patient Header */}
                                    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-100 transition-all"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">{selectedPatient.first_name} {selectedPatient.last_name}</h2>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded uppercase tracking-widest">
                                                            ID: {selectedPatient.national_id || "PENDING"}
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-bold">•</span>
                                                        <span className="text-xs text-slate-500 font-bold">{selectedPatient.gender}</span>
                                                        <span className="text-xs text-slate-400 font-bold">•</span>
                                                        <span className="text-xs text-slate-500 font-bold">Age: {new Date().getFullYear() - new Date(selectedPatient.date_of_birth).getFullYear()}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Last Visit</div>
                                                    <div className="text-sm font-black text-slate-400 mt-1">{patientHistory[0] ? new Date(patientHistory[0].timestamp).toLocaleDateString() : 'New Patient'}</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-4">
                                                {[
                                                    { label: "Phone", value: selectedPatient.phone || "N/A", color: "text-blue-600" },
                                                    { label: "Province", value: selectedPatient.province || "N/A", color: "text-slate-600" },
                                                    { label: "Allergies", value: selectedPatient.allergies ? selectedPatient.allergies.split(',').map((s: string) => s.trim()).join(', ') : "None", color: selectedPatient.allergies ? "text-red-600" : "text-slate-400" },
                                                    { label: "Chronic", value: selectedPatient.chronic_conditions ? selectedPatient.chronic_conditions.split(',').map((s: string) => s.trim()).join(', ') : "None", color: "text-slate-600" }
                                                ].map((item, i) => (
                                                    <div key={i} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
                                                        <div className={`text-xs font-black mt-1 ${item.color} truncate`}>{item.value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action to Queue */}
                                    <div className="bg-white rounded-3xl border border-emerald-100 p-8 shadow-xl shadow-emerald-500/5 relative overflow-hidden group">
                                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mb-32 blur-3xl"></div>
                                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                                            <Plus className="w-5 h-5 text-emerald-600" /> Triage Queue Assignment
                                        </h3>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <button
                                                onClick={() => setUrgencyLevel("normal")}
                                                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${urgencyLevel === 'normal' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-100 bg-slate-50 opacity-60'}`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${urgencyLevel === 'normal' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                    <Users className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Standard Case</div>
                                                    <div className="text-sm font-black text-slate-700 uppercase">Normal Visit</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => setUrgencyLevel("emergency")}
                                                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${urgencyLevel === 'emergency' ? 'border-red-500 bg-red-50 shadow-lg shadow-red-200' : 'border-slate-100 bg-slate-50 opacity-60'}`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${urgencyLevel === 'emergency' ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                    <AlertTriangle className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-red-400">Urgent Action</div>
                                                    <div className="text-sm font-black text-slate-700 uppercase">Emergency</div>
                                                </div>
                                            </button>
                                        </div>

                                        <div className="flex items-end gap-6 relative z-10">
                                            <div className="flex-1">
                                                <label className={labelClass}>Visit Classification</label>
                                                <select value={encounterType} onChange={e => setEncounterType(e.target.value)} className={`${inputClass} mt-2 h-14 font-bold text-slate-700 bg-white shadow-inner appearance-none`}>
                                                    <option value="outpatient">General Outpatient</option>
                                                    <option value="inpatient">Inpatient Admission</option>
                                                    <option value="emergency">Emergency / Trauma</option>
                                                    <option value="maternal">Maternal & Neonatal</option>
                                                    <option value="follow_up">Chronic Follow-Up</option>
                                                </select>
                                            </div>
                                            <button onClick={sendToTriage} disabled={loading} className="w-1/2 bg-emerald-600 text-white h-14 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-200">
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />} Dispatch to Sister
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-[50vh] text-slate-400">
                                    <div className="text-center"><ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-30" /><p className="font-bold">Select a patient to view details</p></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* New Patient Modal */}
            {showNewPatient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-800">Register New Patient</h3>
                            <button onClick={() => setShowNewPatient(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelClass}>First Name *</label><input value={patientForm.first_name} onChange={e => setPatientForm({ ...patientForm, first_name: e.target.value })} className={inputClass} /></div>
                                <div><label className={labelClass}>Last Name *</label><input value={patientForm.last_name} onChange={e => setPatientForm({ ...patientForm, last_name: e.target.value })} className={inputClass} /></div>
                                <div><label className={labelClass}>National ID</label><input value={patientForm.national_id} onChange={e => setPatientForm({ ...patientForm, national_id: e.target.value })} className={inputClass} /></div>
                                <div><label className={labelClass}>Date of Birth *</label><input type="date" value={patientForm.date_of_birth} onChange={e => setPatientForm({ ...patientForm, date_of_birth: e.target.value })} className={inputClass} /></div>
                                <div><label className={labelClass}>Gender *</label>
                                    <select value={patientForm.gender} onChange={e => setPatientForm({ ...patientForm, gender: e.target.value })} className={inputClass}>
                                        <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                                    </select>
                                </div>
                                <div><label className={labelClass}>Blood Type</label>
                                    <select value={patientForm.blood_type} onChange={e => setPatientForm({ ...patientForm, blood_type: e.target.value })} className={inputClass}>
                                        <option value="">Select</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
                                    </select>
                                </div>
                                <div><label className={labelClass}>Phone</label><input value={patientForm.phone} onChange={e => setPatientForm({ ...patientForm, phone: e.target.value })} className={inputClass} /></div>
                                <div><label className={labelClass}>Province</label><input value={patientForm.province} onChange={e => setPatientForm({ ...patientForm, province: e.target.value })} className={inputClass} /></div>
                            </div>
                            <div><label className={labelClass}>Address</label><input value={patientForm.address} onChange={e => setPatientForm({ ...patientForm, address: e.target.value })} className={inputClass} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelClass}>Allergies</label><input value={patientForm.allergies} onChange={e => setPatientForm({ ...patientForm, allergies: e.target.value })} className={inputClass} placeholder="e.g. Penicillin, Peanuts" /></div>
                                <div><label className={labelClass}>Chronic Conditions</label><input value={patientForm.chronic_conditions} onChange={e => setPatientForm({ ...patientForm, chronic_conditions: e.target.value })} className={inputClass} placeholder="e.g. Hypertension, Diabetes" /></div>
                                <div><label className={labelClass}>Emergency Contact Name</label><input value={patientForm.emergency_contact_name} onChange={e => setPatientForm({ ...patientForm, emergency_contact_name: e.target.value })} className={inputClass} /></div>
                                <div><label className={labelClass}>Emergency Contact Phone</label><input value={patientForm.emergency_contact_phone} onChange={e => setPatientForm({ ...patientForm, emergency_contact_phone: e.target.value })} className={inputClass} /></div>
                            </div>
                            <button onClick={registerPatient} disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Register Patient
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap'); .font-sans { font-family: 'Inter', sans-serif; }`}</style>
        </div>
    );
}
