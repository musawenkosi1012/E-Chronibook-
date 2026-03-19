"use client";
import React, { useState, useEffect } from 'react';
import { FileText, LogOut, Clock, Loader2, AlertCircle, Save, Stethoscope, Activity, FileCheck, AlertTriangle, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API = "http://127.0.0.1:8001";

function getAuth() {
    if (typeof window === 'undefined') return { token: '', user: null };
    const token = localStorage.getItem("token") || "";
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return { token, user };
}

export default function ClinicalPortal() {
    const router = useRouter();
    const [encounters, setEncounters] = useState<any[]>([]);
    const [selectedEncounter, setSelectedEncounter] = useState<any>(null);
    const [patientHistory, setPatientHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [mounted, setMounted] = useState(false);
    const { token, user } = getAuth();

    // Clinical form state
    const [clinicalForm, setClinicalForm] = useState({
        clinical_notes: "",
        diagnosis_description: "", icd10_code: "", severity: "moderate",
        urgency_level: "normal"
    });

    useEffect(() => {
        setMounted(true);
        if (!token) { router.push("/signin"); return; }
        fetchQueue();
    }, []);

    const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

    async function fetchQueue() {
        try {
            const res = await fetch(`${API}/api/clinical/queue?status=queued_for_doctor`, { headers });
            if (res.ok) {
                const data = await res.json();

                const enriched = await Promise.all(data.map(async (enc: any) => {
                    const pRes = await fetch(`${API}/api/patients/${enc.patient_id}`, { headers });
                    if (pRes.ok) {
                        const pData = await pRes.json();
                        return { ...enc, patient: pData };
                    }
                    return enc;
                }));
                setEncounters(enriched);
            }
        } catch { }
    }

    async function fetchPatientHistory(patientId: number) {
        try {
            const res = await fetch(`${API}/api/clinical/patient/${patientId}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setPatientHistory(data.filter((e: any) => e.status === "completed"));
            }
        } catch { }
    }

    async function selectEncounter(enc: any) {
        setSelectedEncounter(enc);
        setSuccessMsg("");
        setError("");
        setClinicalForm(prev => ({ ...prev, urgency_level: enc.urgency_level || "normal" }));
        fetchPatientHistory(enc.patient_id);
    }

    async function submitConsultation() {
        if (!selectedEncounter) return;
        setLoading(true); setError(""); setSuccessMsg("");

        const diagnoses = clinicalForm.diagnosis_description ? [{
            description: clinicalForm.diagnosis_description,
            icd10_code: clinicalForm.icd10_code || undefined,
            severity: clinicalForm.severity || "moderate"
        }] : undefined;

        const body = {
            clinical_notes: clinicalForm.clinical_notes || undefined,
            diagnoses: diagnoses,
            urgency_level: clinicalForm.urgency_level
        };

        try {
            const res = await fetch(`${API}/api/clinical/${selectedEncounter.id}/clinical`, {
                method: "PATCH",
                headers,
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error((await res.json()).detail);

            setSuccessMsg("Consultation completed successfully.");
            setSelectedEncounter(null);
            setClinicalForm({ clinical_notes: "", diagnosis_description: "", icd10_code: "", severity: "moderate", urgency_level: "normal" });
            fetchQueue();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all";
    const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-wider";

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Top Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center"><Stethoscope className="w-4 h-4 text-white" /></div>
                    <span className="font-black text-slate-800 text-lg">Doctor's Consultation</span>
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
                {/* Sidebar Queue */}
                <div className="w-80 bg-white border-r border-slate-200 min-h-[calc(100vh-52px)] p-4 flex flex-col">
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600" /> Waiting List ({encounters.length})
                    </h3>
                    <div className="space-y-2 overflow-y-auto flex-1">
                        {encounters.map(enc => (
                            <button
                                key={enc.id}
                                onClick={() => selectEncounter(enc)}
                                className={`w-full text-left p-6 rounded-3xl transition-all border-2 relative overflow-hidden group ${selectedEncounter?.id === enc.id
                                    ? (enc.urgency_level === 'emergency' ? 'border-red-500 bg-red-50' : 'border-[#007b46] bg-emerald-50')
                                    : (enc.urgency_level === 'emergency' ? 'border-red-100 bg-white hover:border-red-200' : 'border-slate-100 bg-white hover:border-slate-200')
                                    }`}
                            >
                                {enc.urgency_level === 'emergency' && (
                                    <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-xl flex items-center gap-1">
                                        <AlertTriangle className="w-2.5 h-2.5" /> Emergency
                                    </div>
                                )}
                                <div className="font-bold text-sm text-slate-800">{enc.patient?.first_name} {enc.patient?.last_name}</div>
                                <div className="text-xs text-slate-500 mt-1 capitalize">{enc.encounter_type} Visit</div>
                                <div className="text-[10px] text-slate-400 mt-1">{new Date(enc.created_at).toLocaleTimeString()}</div>
                            </button>
                        ))}
                        {encounters.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">No patients waiting</div>}
                    </div>
                </div>

                {/* Main Content - Consultation Form */}
                <div className="flex-1 p-6 flex flex-col xl:flex-row gap-6">
                    <div className="flex-1">
                        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
                        {successMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {successMsg}</div>}

                        {selectedEncounter ? (
                            <div className="space-y-6">
                                {/* Current Vitals & Patient Header */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800">
                                                {selectedEncounter.patient?.first_name} {selectedEncounter.patient?.last_name}
                                            </h2>
                                            <p className="text-sm text-slate-500 mt-1">
                                                ID: {selectedEncounter.patient?.national_id || "N/A"} • DOB: {selectedEncounter.patient?.date_of_birth} • Gender: {selectedEncounter.patient?.gender}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded">{selectedEncounter.encounter_type} Visit</span>
                                        </div>
                                    </div>

                                    {/* Allergies & Chronic Conditions */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <div className={labelClass}>Allergies</div>
                                            <div className="text-sm font-bold text-red-600 mt-1">{selectedEncounter.patient?.allergies || "None recorded"}</div>
                                        </div>
                                        <div>
                                            <div className={labelClass}>Chronic Conditions</div>
                                            <div className="text-sm font-bold text-slate-700 mt-1">{selectedEncounter.patient?.chronic_conditions || "None recorded"}</div>
                                        </div>
                                    </div>

                                    {/* Latest Vitals */}
                                    {selectedEncounter.vitals && selectedEncounter.vitals.length > 0 && (
                                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                            <h4 className="text-[10px] font-black uppercase text-emerald-800 mb-2 flex items-center gap-1"><Activity className="w-3 h-3" /> Latest Vitals</h4>
                                            <div className="flex flex-wrap gap-3">
                                                {(() => {
                                                    const v = selectedEncounter.vitals[selectedEncounter.vitals.length - 1];
                                                    return (
                                                        <>
                                                            {v.systolic_bp && <div className="bg-white px-2 py-1 rounded shadow-sm text-xs font-bold text-blue-700 border border-blue-100">BP: {v.systolic_bp}/{v.diastolic_bp}</div>}
                                                            {v.heart_rate && <div className="bg-white px-2 py-1 rounded shadow-sm text-xs font-bold text-red-700 border border-red-100">HR: {v.heart_rate}</div>}
                                                            {v.temperature && <div className="bg-white px-2 py-1 rounded shadow-sm text-xs font-bold text-orange-700 border border-orange-100">Temp: {v.temperature}°C</div>}
                                                            {v.spo2 && <div className="bg-white px-2 py-1 rounded shadow-sm text-xs font-bold text-purple-700 border border-purple-100">SpO₂: {v.spo2}%</div>}
                                                            {v.weight_kg && <div className="bg-white px-2 py-1 rounded shadow-sm text-xs font-bold text-green-700 border border-green-100">Weight: {v.weight_kg}kg</div>}
                                                            {v.blood_glucose && <div className="bg-white px-2 py-1 rounded shadow-sm text-xs font-bold text-amber-700 border border-amber-100">Glucose: {v.blood_glucose}</div>}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Consultation Details */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                    <h4 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                        <FileText className="w-4 h-4 text-emerald-600" /> Clinical Notes & Diagnosis
                                    </h4>

                                    <div className="p-10 space-y-8 bg-[#fdfdfd]">
                                        {/* Urgency Final Stamp Stage 3 */}
                                        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <AlertTriangle className={`w-4 h-4 ${clinicalForm.urgency_level === 'emergency' ? 'text-red-500' : 'text-slate-300'}`} /> Final Urgency Classification
                                                </h4>
                                                <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">Stage 3: Doctor Stamp</span>
                                            </div>
                                            <div className="flex gap-4">
                                                {['normal', 'emergency'].map(level => (
                                                    <button
                                                        key={level}
                                                        onClick={() => setClinicalForm({ ...clinicalForm, urgency_level: level })}
                                                        className={`flex-1 py-4 rounded-2xl border-2 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${clinicalForm.urgency_level === level
                                                            ? (level === 'emergency' ? 'border-red-500 bg-red-50 text-red-700' : 'border-[#007b46] bg-emerald-50 text-emerald-700')
                                                            : 'border-slate-100 bg-slate-50 text-slate-400 opacity-60'
                                                            }`}
                                                    >
                                                        {level === 'emergency' ? <AlertTriangle className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                                                        {level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 block">Clinical Consultation Notes</label>
                                            <textarea rows={4} value={clinicalForm.clinical_notes} onChange={e => setClinicalForm({ ...clinicalForm, clinical_notes: e.target.value })} className={inputClass} placeholder="Enter findings, physical examination notes, etc." />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-2">
                                                <label className={labelClass}>Primary Diagnosis Description</label>
                                                <input type="text" value={clinicalForm.diagnosis_description} onChange={e => setClinicalForm({ ...clinicalForm, diagnosis_description: e.target.value })} className={inputClass} placeholder="e.g., Acute Bronchitis" />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Severity</label>
                                                <select value={clinicalForm.severity} onChange={e => setClinicalForm({ ...clinicalForm, severity: e.target.value })} className={inputClass}>
                                                    <option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option><option value="critical">Critical</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-3">
                                                <label className={labelClass}>ICD-10 Code (Optional)</label>
                                                <input type="text" value={clinicalForm.icd10_code} onChange={e => setClinicalForm({ ...clinicalForm, icd10_code: e.target.value })} className={inputClass} placeholder="e.g., J20.9" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-100">
                                        <button onClick={submitConsultation} disabled={loading} className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileCheck className="w-5 h-5" />} Complete Consultation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-[50vh] text-slate-400">
                                <div className="text-center"><Stethoscope className="w-16 h-16 mx-auto mb-4 opacity-30" /><p className="font-bold">Select a patient from the waiting list</p></div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Patient Longitudinal History Timeline */}
                    {selectedEncounter && (
                        <div className="w-96 bg-white border border-slate-200 rounded-[2.5rem] p-6 hidden xl:flex flex-col h-full max-h-[calc(100vh-120px)] shadow-2xl shadow-slate-200/50">
                            <h3 className="font-black text-slate-800 text-base uppercase tracking-widest mb-6 border-b border-slate-100 pb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-emerald-600" /> Longitudinal Chain
                                </div>
                                <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-400 font-black">{patientHistory.length} Events</span>
                            </h3>

                            <div className="overflow-y-auto flex-1 pr-4 relative custom-scrollbar">
                                <div className="absolute left-[20px] top-4 bottom-4 w-1 bg-gradient-to-b from-emerald-500 via-blue-500 to-purple-500 rounded-full opacity-10"></div>

                                <div className="space-y-8 relative">
                                    {patientHistory.map((event: any, index) => (
                                        <div key={`${event.event_type}-${event.id}`} className="relative pl-10 group">
                                            {/* Vertical Line Connector */}
                                            <div className="absolute left-0 top-2 w-[40px] h-full flex flex-col items-center">
                                                <div className={`w-4 h-4 rounded-full border-4 border-white shadow-lg transition-all transform group-hover:scale-125 z-10 ${event.event_type === 'encounter_start' ? 'bg-emerald-600' :
                                                    event.event_type === 'clinical_diagnosis' ? 'bg-red-500' :
                                                        event.event_type === 'lab_request' ? 'bg-amber-500' :
                                                            event.event_type === 'medication_prescribed' ? 'bg-purple-600' : 'bg-slate-400'
                                                    }`}></div>
                                            </div>

                                            <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:border-emerald-100 border-l-4 border-l-transparent hover:border-l-emerald-500">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                        {new Date(event.timestamp).toLocaleDateString()} • {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>

                                                <h4 className="font-black text-slate-800 text-sm mb-1 leading-tight uppercase group-hover:text-emerald-700 transition-colors">
                                                    {event.action}
                                                </h4>

                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                                        {event.facility_name}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                                        {event.department}
                                                    </span>
                                                </div>

                                                <div className="text-xs text-slate-600 font-medium bg-slate-50 p-3 rounded-xl border border-slate-50">
                                                    {event.content_summary}
                                                </div>

                                                <div className="mt-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 uppercase">
                                                            {event.provider_name?.charAt(0) || 'S'}
                                                        </div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase">
                                                            {event.provider_name || 'System Provider'} <span className="text-[8px] opacity-60">({event.provider_role || 'System'})</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                                                        #ENC-{event.encounter_id}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {patientHistory.length === 0 && (
                                        <div className="text-center py-12 px-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                                <Clock className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <p className="font-bold text-slate-400 text-sm">Longitudinal Chain Empty</p>
                                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">No historical interactions linked</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap'); .font-sans { font-family: 'Inter', sans-serif; }`}</style>
        </div>
    );
}
