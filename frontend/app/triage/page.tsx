"use client";
import React, { useState, useEffect } from 'react';
import { Activity, LogOut, Clock, Loader2, AlertCircle, Save, Users, Stethoscope, Briefcase, Zap, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API = "http://127.0.0.1:8001";

function getAuth() {
    if (typeof window === 'undefined') return { token: '', user: null };
    const token = localStorage.getItem("token") || "";
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return { token, user };
}

export default function TriagePortal() {
    const router = useRouter();
    const [encounters, setEncounters] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [selectedEncounter, setSelectedEncounter] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [patientHistory, setPatientHistory] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);
    const { token, user } = getAuth();

    // Assignment & Assessment form state
    const [assessment, setAssessment] = useState({
        chief_complaint: "",
        clinician_id: "",
        department: "General Medicine",
        urgency_level: "normal",
        vitals: {
            systolic_bp: "", diastolic_bp: "", heart_rate: "", temperature: "",
            respiratory_rate: "", spo2: "", weight_kg: "", height_cm: "",
            blood_glucose: "", pain_score: ""
        }
    });

    useEffect(() => {
        setMounted(true);
        if (!token) { router.push("/signin"); return; }
        fetchQueue();
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (selectedEncounter) {
            fetchPatientHistory(selectedEncounter.patient_id);
            setAssessment(prev => ({ ...prev, urgency_level: selectedEncounter.urgency_level || "normal" }));
        }
    }, [selectedEncounter]);

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

    async function fetchQueue() {
        try {
            const res = await fetch(`${API}/api/clinical/queue?status=queued_for_triage`, { headers });
            if (res.ok) {
                const data = await res.json();
                const enriched = await Promise.all(data.map(async (enc: any) => {
                    const pRes = await fetch(`${API}/api/patients/${enc.patient_id}`, { headers });
                    if (pRes.ok) return { ...enc, patient: await pRes.json() };
                    return enc;
                }));
                setEncounters(enriched);
            }
        } catch { }
    }

    async function fetchDoctors() {
        try {
            const res = await fetch(`${API}/api/auth/doctors`, { headers });
            if (res.ok) setDoctors(await res.json());
        } catch { }
    }

    async function assignPatient() {
        if (!selectedEncounter || !assessment.clinician_id) {
            setError("Please select a doctor for assignment.");
            return;
        }
        setLoading(true); setError(""); setSuccessMsg("");

        const body = {
            clinician_id: parseInt(assessment.clinician_id),
            department: assessment.department,
            chief_complaint: assessment.chief_complaint,
            urgency_level: assessment.urgency_level,
            vitals: Object.fromEntries(
                Object.entries(assessment.vitals).map(([k, v]) => [k, v ? parseFloat(v as string) : null])
            )
        };

        try {
            const res = await fetch(`${API}/api/clinical/${selectedEncounter.id}/assign`, {
                method: "PATCH",
                headers,
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error((await res.json()).detail);

            setSuccessMsg(`Patient assigned to ${doctors.find(d => d.id === body.clinician_id)?.full_name} successfully.`);
            setSelectedEncounter(null);
            setAssessment({
                chief_complaint: "", clinician_id: "", department: "General Medicine", urgency_level: "normal",
                vitals: { systolic_bp: "", diastolic_bp: "", heart_rate: "", temperature: "", respiratory_rate: "", spo2: "", weight_kg: "", height_cm: "", blood_glucose: "", pain_score: "" }
            });
            fetchQueue();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all";
    const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block";

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#007b46] flex items-center justify-center shadow-lg shadow-emerald-200">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-black text-slate-800 text-xl tracking-tight leading-none">Sister's Triage Hub</h1>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Institutional Assessment & Assignment</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-800 leading-none">{mounted ? user?.full_name : ''}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Senior Triage Sister</p>
                    </div>
                    <button onClick={() => { localStorage.clear(); router.push("/signin"); }} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Queue Sidebar */}
                <aside className="w-96 bg-white border-r border-slate-200 flex flex-col shadow-sm">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-600" /> Triage Queue
                            </h2>
                            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{mounted ? user?.role : ''}</span>
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                                {encounters.length} WAITING
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {encounters.map(enc => (
                            <button key={enc.id} onClick={() => { setSelectedEncounter(enc); setSuccessMsg(""); }}
                                className={`w-full text-left p-4 rounded-2xl border-2 transition-all group ${selectedEncounter?.id === enc.id ? 'bg-emerald-50 border-emerald-600 shadow-md' : 'bg-white border-slate-50 hover:border-emerald-200 shadow-sm'}`}>
                                <div className="flex justify-between items-start">
                                    <div className="font-black text-slate-800 group-hover:text-emerald-700 transition-colors uppercase text-xs tracking-tight">
                                        {enc.patient?.first_name} {enc.patient?.last_name}
                                    </div>
                                    <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                        #{enc.id}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mt-3">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Type</span>
                                        <span className="text-xs font-bold text-slate-600 capitalize">{enc.encounter_type}</span>
                                    </div>
                                    <div className="flex flex-col border-l border-slate-100 pl-4">
                                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Arrival</span>
                                        <span className="text-xs font-bold text-slate-600">{new Date(enc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                        {encounters.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 opacity-30">
                                <Users className="w-12 h-12 text-slate-300" />
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4">Queue Clear</p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Assessment Area */}
                <section className="flex-1 overflow-y-auto p-12">
                    {error && <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4"><AlertCircle className="w-5 h-5" /> {error}</div>}
                    {successMsg && <div className="max-w-4xl mx-auto mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm font-bold rounded-r-xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4"><Activity className="w-5 h-5" /> {successMsg}</div>}

                    {selectedEncounter ? (
                        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
                            {/* Patient Ribbon */}
                            <div className="bg-[#007b46] rounded-3xl p-8 text-white shadow-xl flex items-center justify-between relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-emerald-400/20 transition-all duration-700"></div>
                                <div className="relative z-10">
                                    <h2 className="text-4xl font-black tracking-tight">{selectedEncounter.patient?.first_name} {selectedEncounter.patient?.last_name}</h2>
                                    <div className="flex items-center gap-6 mt-3 opacity-90 text-sm font-bold uppercase tracking-widest">
                                        <span>National ID: {selectedEncounter.patient?.national_id || "PENDING"}</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                                        <span>DOB: {selectedEncounter.patient?.date_of_birth}</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                                        <span>Gender: {selectedEncounter.patient?.gender}</span>
                                    </div>
                                </div>
                                <div className="relative z-10 text-right">
                                    <div className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.2em] mb-1">Queue Ticket</div>
                                    <div className="text-5xl font-black leading-none opacity-40">#{selectedEncounter.id}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Vitals Card */}
                                <div className="bg-white rounded-[2rem] border border-slate-200 p-10 shadow-sm transition-all hover:shadow-md">
                                    <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-8 flex items-center gap-3">
                                        <Activity className="w-5 h-5" /> 1. Clinical Vitals
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        {[
                                            { key: "systolic_bp", label: "Systolic BP", ph: "mmHg" },
                                            { key: "diastolic_bp", label: "Diastolic BP", ph: "mmHg" },
                                            { key: "heart_rate", label: "Heart Rate", ph: "bpm" },
                                            { key: "temperature", label: "Temperature", ph: "°C" },
                                            { key: "respiratory_rate", label: "Resp Rate", ph: "/min" },
                                            { key: "spo2", label: "SpO₂", ph: "%" },
                                            { key: "weight_kg", label: "Weight", ph: "kg" },
                                            { key: "height_cm", label: "Height", ph: "cm" },
                                            { key: "blood_glucose", label: "Blood Glucose", ph: "mmol/L" },
                                            { key: "pain_score", label: "Pain Score", ph: "0-10" },
                                        ].map(f => (
                                            <div key={f.key}>
                                                <label className={labelClass}>{f.label}</label>
                                                <input type="number" step="0.1" value={(assessment.vitals as any)[f.key]}
                                                    onChange={e => setAssessment({ ...assessment, vitals: { ...assessment.vitals, [f.key]: e.target.value } })}
                                                    className={inputClass} placeholder={f.ph} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Assignment Card */}
                                <div className="space-y-8">
                                    <div className="bg-white rounded-[2rem] border border-slate-200 p-10 shadow-sm transition-all hover:shadow-md">
                                        <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-8 flex items-center gap-3">
                                            <Stethoscope className="w-5 h-5" /> 2. Assessment & Route
                                        </h3>
                                        <div className="space-y-6">
                                            <div>
                                                <label className={labelClass}>Chief Complaint *</label>
                                                <textarea rows={3} value={assessment.chief_complaint} onChange={e => setAssessment({ ...assessment, chief_complaint: e.target.value })}
                                                    className={`${inputClass} resize-none py-3`} placeholder="Enter patient's primary symptoms..." />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelClass}>Target Department</label>
                                                    <select value={assessment.department} onChange={e => setAssessment({ ...assessment, department: e.target.value })} className={inputClass}>
                                                        {["General Medicine", "Dental Surgery", "Pediatrics Oncology", "Antenatal Clinic", "Emergency Care", "Specialty Consult"].map(d => (
                                                            <option key={d} value={d}>{d}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Assign to Doctor *</label>
                                                    <select value={assessment.clinician_id} onChange={e => setAssessment({ ...assessment, clinician_id: e.target.value })} className={`${inputClass} font-bold text-emerald-800`}>
                                                        <option value="">Select Clinician</option>
                                                        {doctors.map(d => (
                                                            <option key={d.id} value={d.id}>
                                                                {d.full_name} ({d.department || "General"}) {d.is_online ? "🟢" : "⚪"}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button onClick={assignPatient} disabled={loading}
                                        className="w-full bg-[#007b46] hover:bg-[#006035] text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-emerald-200 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50">
                                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 text-emerald-300" />}
                                        Complete Triage & Dispatch
                                    </button>
                                </div>
                            </div>

                            {/* Longitudinal History Chain */}
                            <div className="bg-white rounded-[2rem] border border-slate-200 p-10 shadow-sm">
                                <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-8 flex items-center gap-3">
                                    <Clock className="w-5 h-5" /> 3. Patient Medical Journey (Longitudinal Chain)
                                </h3>
                                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                    {patientHistory.map((event, idx) => (
                                        <div key={idx} className="relative pl-10 pb-8 border-l-2 border-slate-100 last:pb-0 last:border-0 ml-4">
                                            <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-white border-4 border-emerald-500 shadow-sm z-10"></div>
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{new Date(event.timestamp).toLocaleDateString()}</span>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${event.event_type.includes('vitals') ? 'bg-blue-50 text-blue-600' :
                                                        event.event_type.includes('diagnosis') ? 'bg-red-50 text-red-600' :
                                                            event.event_type.includes('prescribed') ? 'bg-purple-50 text-purple-600' :
                                                                'bg-emerald-50 text-emerald-600'
                                                        }`}>
                                                        {event.event_type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{event.facility_name} • {event.department}</div>
                                            </div>
                                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                <div className="text-sm font-black text-slate-700 mb-1">{event.action}</div>
                                                <div className="text-xs text-slate-500 leading-relaxed font-medium">{event.content_summary}</div>
                                                <div className="mt-3 flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold">{event.provider_name.charAt(0)}</div>
                                                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">BY: {event.provider_name} ({event.provider_role})</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {patientHistory.length === 0 && (
                                        <div className="text-center py-10 opacity-30">
                                            <p className="text-xs font-bold uppercase tracking-widest">No previous clinical history found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center h-[60vh] text-slate-300">
                            <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
                                <Briefcase className="w-10 h-10 opacity-20" />
                            </div>
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Select Queue Item</h3>
                            <p className="text-sm font-medium text-slate-400 mt-2">Active triage required for awaiting patients in the sidebar</p>
                        </div>
                    )}
                </section>
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@900&family=Inter:wght@400;500;700;900&display=swap');
                .font-sans { font-family: 'Inter', sans-serif; }
            `}</style>
        </div>
    );
}
