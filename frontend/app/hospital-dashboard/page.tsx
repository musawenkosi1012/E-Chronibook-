"use client";
import React, { useState, useEffect } from 'react';
import { Users, Building2, Activity, FileText, Plus, X, LogOut, Shield, Loader2, AlertCircle, BarChart3, Settings, UserPlus, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API = "http://127.0.0.1:8001";
function getAuth() {
    if (typeof window === 'undefined') return { token: '', user: null };
    return { token: localStorage.getItem("token") || "", user: JSON.parse(localStorage.getItem("user") || "null") };
}

export default function HospitalDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    const [staff, setStaff] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [facilities, setFacilities] = useState<any[]>([]);
    const [showAddStaff, setShowAddStaff] = useState(false);
    const [showAddFacility, setShowAddFacility] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { token, user } = getAuth();

    const [staffForm, setStaffForm] = useState({ full_name: "", email: "", role: "doctor", department: "General", specialty: "", password: "" });
    const [facilityForm, setFacilityForm] = useState({ name: "", facility_type: "clinic", province: "", district: "", address: "", phone: "" });

    useEffect(() => {
        if (!token) { router.push("/signin"); return; }
        loadData();
    }, []);

    const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

    async function loadData() {
        try {
            const [s, sum, f] = await Promise.all([
                fetch(`${API}/api/auth/staff`, { headers }).then(r => r.json()),
                user?.institution_id ? fetch(`${API}/api/analytics/institution/${user.institution_id}/summary`, { headers }).then(r => r.json()) : Promise.resolve(null),
                user?.institution_id ? fetch(`${API}/api/institutions/${user.institution_id}/facilities`, { headers }).then(r => r.json()) : Promise.resolve([]),
            ]);
            setStaff(s); setSummary(sum); setFacilities(f);
        } catch { }
    }

    async function addStaff() {
        setLoading(true); setError("");
        try {
            const res = await fetch(`${API}/api/auth/register-staff`, {
                method: "POST", headers,
                body: JSON.stringify({ ...staffForm, institution_id: user?.institution_id })
            });
            if (!res.ok) {
                const data = await res.json();
                const msg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
                throw new Error(msg);
            }
            setShowAddStaff(false);
            setStaffForm({ full_name: "", email: "", role: "doctor", department: "General", specialty: "", password: "" });
            await loadData();
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    }

    async function addFacility() {
        setLoading(true); setError("");
        try {
            const res = await fetch(`${API}/api/institutions/${user?.institution_id}/facilities`, {
                method: "POST", headers,
                body: JSON.stringify(facilityForm)
            });
            if (!res.ok) {
                const data = await res.json();
                const msg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
                throw new Error(msg);
            }
            setShowAddFacility(false);
            setFacilityForm({ name: "", facility_type: "clinic", province: "", district: "", address: "", phone: "" });
            await loadData();
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    }

    const inputClass = "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all";

    const roleLabels: Record<string, string> = {
        national_super_user: "National Super User", ministry_official: "Ministry Official",
        institution_it_admin: "Institution IT Admin", doctor: "Doctor", nurse: "Nurse",
        pharmacist: "Pharmacist", lab_tech: "Lab Technician", receptionist: "Receptionist"
    };

    const roleBadge = (role: string) => {
        const colors: Record<string, string> = {
            institution_it_admin: "bg-purple-50 text-purple-700", doctor: "bg-blue-50 text-blue-700",
            nurse: "bg-pink-50 text-pink-700", pharmacist: "bg-rose-50 text-rose-700",
            lab_tech: "bg-cyan-50 text-cyan-700", receptionist: "bg-amber-50 text-amber-700"
        };
        return <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${colors[role] || "bg-slate-100 text-slate-700"}`}>{roleLabels[role] || role}</span>;
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
                    <span className="font-black text-slate-800 text-lg">Institution IT Dashboard</span>
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">IT Admin</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 font-medium">{user?.full_name}</span>
                    <button onClick={() => { localStorage.clear(); router.push("/signin"); }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition"><LogOut className="w-4 h-4" /> Sign out</button>
                </div>
            </div>

            <div className="flex">
                <div className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-52px)] p-4 space-y-1">
                    {[
                        { id: "overview", icon: BarChart3, label: "Overview" },
                        { id: "staff", icon: Users, label: "Manage Staff" },
                        { id: "facilities", icon: Building2, label: "Sub-Facilities" },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <tab.icon className="w-5 h-5" /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 p-6">
                    {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}

                    {activeTab === "overview" && summary && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-slate-800">Institution Overview</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    { label: "Patients", value: summary.total_patients, icon: Users, color: "bg-emerald-500" },
                                    { label: "Encounters", value: summary.total_encounters, icon: FileText, color: "bg-blue-500" },
                                    { label: "Staff", value: summary.total_staff, icon: Users, color: "bg-purple-500" },
                                    { label: "Sub-Facilities", value: summary.total_facilities, icon: Building2, color: "bg-orange-500" },
                                    { label: "Pending Rx", value: summary.pending_prescriptions, icon: Activity, color: "bg-rose-500" },
                                    { label: "Pending Labs", value: summary.pending_lab_orders, icon: Activity, color: "bg-cyan-500" },
                                ].map((m, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center`}><m.icon className="w-5 h-5 text-white" /></div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{m.label}</span>
                                        </div>
                                        <div className="text-3xl font-black text-slate-800">{m.value ?? 0}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "staff" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-800">Staff Management</h2>
                                <button onClick={() => setShowAddStaff(true)} className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-700"><UserPlus className="w-4 h-4" /> Provision Staff</button>
                            </div>
                            <div className="space-y-2">
                                {staff.map(s => (
                                    <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2"><span className="font-bold text-slate-800">{s.full_name}</span>{roleBadge(s.role)}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{s.email} • Joined {new Date(s.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${s.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{s.is_active ? "Active" : "Inactive"}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "facilities" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-800">Sub-Facilities (Clinics & Hospitals)</h2>
                                <button onClick={() => setShowAddFacility(true)} className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-700"><Plus className="w-4 h-4" /> Register Facility</button>
                            </div>
                            {facilities.length === 0 ? (
                                <div className="text-center py-16 text-slate-400"><Building2 className="w-16 h-16 mx-auto mb-4 opacity-30" /><p className="font-bold">No sub-facilities registered yet</p><p className="text-sm mt-1">Register clinics and hospitals under your institution</p></div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {facilities.map(f => (
                                        <div key={f.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                            <div className="flex items-center gap-2 mb-2"><span className="font-black text-slate-800">{f.name}</span><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold capitalize">{f.facility_type}</span></div>
                                            <div className="text-sm text-slate-500 space-y-0.5">
                                                {f.province && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {f.province}{f.district && `, ${f.district}`}</div>}
                                                {f.phone && <div>{f.phone}</div>}
                                                {f.address && <div>{f.address}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Staff Modal */}
            {showAddStaff && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-8">
                        <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-black text-slate-800">Provision New Staff</h3><button onClick={() => setShowAddStaff(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button></div>
                        <div className="space-y-4">
                            <div><label className="text-xs font-bold text-slate-600 uppercase">Full Name *</label><input value={staffForm.full_name} onChange={e => setStaffForm({ ...staffForm, full_name: e.target.value })} className={inputClass} /></div>
                            <div><label className="text-xs font-bold text-slate-600 uppercase">Email *</label><input type="email" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} className={inputClass} /></div>
                            <div><label className="text-xs font-bold text-slate-600 uppercase">Role *</label>
                                <select value={staffForm.role} onChange={e => setStaffForm({ ...staffForm, role: e.target.value })} className={inputClass}>
                                    <option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="pharmacist">Pharmacist</option><option value="lab_tech">Lab Technician</option><option value="receptionist">Receptionist</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-slate-600 uppercase">Department</label><input value={staffForm.department} onChange={e => setStaffForm({ ...staffForm, department: e.target.value })} className={inputClass} placeholder="e.g. Surgery" /></div>
                                <div><label className="text-xs font-bold text-slate-600 uppercase">Specialty</label><input value={staffForm.specialty} onChange={e => setStaffForm({ ...staffForm, specialty: e.target.value })} className={inputClass} placeholder="e.g. Cardiology" /></div>
                            </div>
                            <button onClick={addStaff} disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Create Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Facility Modal */}
            {showAddFacility && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-8">
                        <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-black text-slate-800">Register Sub-Facility</h3><button onClick={() => setShowAddFacility(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button></div>
                        <div className="space-y-4">
                            <div><label className="text-xs font-bold text-slate-600 uppercase">Facility Name *</label><input value={facilityForm.name} onChange={e => setFacilityForm({ ...facilityForm, name: e.target.value })} className={inputClass} /></div>
                            <div><label className="text-xs font-bold text-slate-600 uppercase">Type *</label>
                                <select value={facilityForm.facility_type} onChange={e => setFacilityForm({ ...facilityForm, facility_type: e.target.value })} className={inputClass}>
                                    <option value="clinic">Clinic</option><option value="hospital">Hospital</option><option value="health_centre">Health Centre</option><option value="pharmacy">Pharmacy</option><option value="laboratory">Laboratory</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-slate-600 uppercase">Province</label><input value={facilityForm.province} onChange={e => setFacilityForm({ ...facilityForm, province: e.target.value })} className={inputClass} /></div>
                                <div><label className="text-xs font-bold text-slate-600 uppercase">District</label><input value={facilityForm.district} onChange={e => setFacilityForm({ ...facilityForm, district: e.target.value })} className={inputClass} /></div>
                            </div>
                            <div><label className="text-xs font-bold text-slate-600 uppercase">Address</label><input value={facilityForm.address} onChange={e => setFacilityForm({ ...facilityForm, address: e.target.value })} className={inputClass} /></div>
                            <div><label className="text-xs font-bold text-slate-600 uppercase">Phone</label><input value={facilityForm.phone} onChange={e => setFacilityForm({ ...facilityForm, phone: e.target.value })} className={inputClass} /></div>
                            <button onClick={addFacility} disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Register Facility
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap'); .font-sans { font-family: 'Inter', sans-serif; }`}</style>
        </div>
    );
}
