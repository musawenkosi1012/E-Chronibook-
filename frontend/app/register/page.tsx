"use client";
import React, { useState } from 'react';
import { Building2, Mail, Phone, MapPin, ShieldCheck, ArrowRight, ChevronLeft, ChevronDown, CheckCircle2, UserCircle, Briefcase, FileCode2, Zap, Network, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterInstitution() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        facility_name: '',
        facility_type: '',
        ownership: '',
        mohcc_reg_no: '',
        province: '',
        official_email: '',
        primary_phone: '',
        physical_address: '',
        internet_availability: '',
        power_backup: '',
        current_record_system: '',
        admin_name: '',
        admin_contact: '',
        admin_password: '',
        consent_given: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        try {
            const res = await fetch('http://127.0.0.1:8001/api/institutions/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.detail || 'Registration failed. Please try again.');
            } else {
                // Store auth data from registration response
                if (data.access_token) {
                    localStorage.setItem('token', data.access_token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                // Success! Redirect to the IT Admin dashboard
                router.push('/hospital-dashboard');
            }
        } catch (error) {
            console.error(error);
            setErrorMsg('Network error. Unable to connect to the E-ChroniBook spine.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 flex flex-col items-center py-12 px-4">
            {/* Header */}
            <div className="w-full max-w-5xl mx-auto flex items-center justify-between mb-8">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 font-bold transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Home
                </Link>
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <ShieldCheck className="w-5 h-5" /> Secure Onboarding
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden flex flex-col md:flex-row">

                {/* Left Side: Info */}
                <div className="bg-[#007b46] text-white p-10 md:w-4/12 flex flex-col justify-between">
                    <div>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 mb-6 shadow-inner">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-black mb-4 tracking-tight leading-tight">National EMR Network.</h2>
                        <p className="text-emerald-50 mb-8 text-sm leading-relaxed opacity-90">
                            Register your healthcare facility to join the unified national health intelligence grid. Complete this vetted onboarding form to initiate your integration.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-3">
                                <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-emerald-300" /></div>
                                <div>
                                    <h4 className="font-bold text-sm text-emerald-50">Facility Verification</h4>
                                    <p className="text-xs text-emerald-100/70 mt-1">We verify your MoHCC credentials before granting federated access.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-emerald-300" /></div>
                                <div>
                                    <h4 className="font-bold text-sm text-emerald-50">Data Security</h4>
                                    <p className="text-xs text-emerald-100/70 mt-1">End-to-end encryption compliant with national data privacy laws.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-emerald-300" /></div>
                                <div>
                                    <h4 className="font-bold text-sm text-emerald-50">Rapid Deployment</h4>
                                    <p className="text-xs text-emerald-100/70 mt-1">Our technical team evaluates your constraints for a seamless rollout.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-emerald-600/50 text-[10px] text-emerald-200/80 uppercase tracking-widest font-black">
                        Step 1: Institutional Profiling
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="p-8 md:p-10 md:w-8/12 bg-white">
                    <div className="mb-8 border-b border-slate-100 pb-6">
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Facility Registration Profile</h3>
                        <p className="text-sm text-slate-500 mt-2">Comprehensive onboarding evaluation for administrative and technical readiness.</p>

                        {errorMsg && (
                            <div className="mt-4 p-4 bg-red-50 text-red-700 text-sm font-bold rounded-xl border border-red-200 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-red-500" /> {errorMsg}
                            </div>
                        )}
                    </div>

                    <form className="space-y-8" onSubmit={handleSubmit}>

                        {/* Section 1: Demographics */}
                        <section className="space-y-5">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#007b46] flex items-center gap-2">
                                <Building2 className="w-4 h-4" /> 1. Facility Demographics
                            </h4>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Official Facility Name *</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="facility_name"
                                        value={formData.facility_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
                                        placeholder="e.g. Parirenyatwa Group of Hospitals"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Facility Type *</label>
                                    <div className="relative">
                                        <select
                                            name="facility_type"
                                            value={formData.facility_type}
                                            onChange={handleChange}
                                            required
                                            className="appearance-none w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
                                        >
                                            <option value="" disabled>Select facility type</option>
                                            <option value="hospital_central">Central/Provincial Hospital</option>
                                            <option value="hospital_district">District Hospital</option>
                                            <option value="clinic_rural">Rural Health Centre / Clinic</option>
                                            <option value="pharmacy">Registered Pharmacy</option>
                                            <option value="laboratory">Diagnostic Laboratory</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Ownership Structure *</label>
                                    <div className="relative">
                                        <select
                                            name="ownership"
                                            value={formData.ownership}
                                            onChange={handleChange}
                                            required
                                            className="appearance-none w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
                                        >
                                            <option value="" disabled>Select ownership</option>
                                            <option value="public">Public / Government (MoHCC)</option>
                                            <option value="private">Private For-Profit</option>
                                            <option value="mission">Mission / Church Affiliated</option>
                                            <option value="ngo">NGO / Non-Profit</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Legal & Contact */}
                        <section className="space-y-5">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#007b46] flex items-center gap-2">
                                <Briefcase className="w-4 h-4" /> 2. Legal & Contact Info
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">MoHCC Registration No. *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FileCode2 className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="mohcc_reg_no"
                                            value={formData.mohcc_reg_no}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
                                            placeholder="Health Ministry ID"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Facility Province *</label>
                                    <div className="relative">
                                        <select
                                            name="province"
                                            value={formData.province}
                                            onChange={handleChange}
                                            required
                                            className="appearance-none w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
                                        >
                                            <option value="" disabled>Select province</option>
                                            <option value="harare">Harare Metropolitan</option>
                                            <option value="bulawayo">Bulawayo Metropolitan</option>
                                            <option value="manicaland">Manicaland</option>
                                            <option value="mash_central">Mashonaland Central</option>
                                            <option value="mash_east">Mashonaland East</option>
                                            <option value="mash_west">Mashonaland West</option>
                                            <option value="masvingo">Masvingo</option>
                                            <option value="mat_north">Matabeleland North</option>
                                            <option value="mat_south">Matabeleland South</option>
                                            <option value="midlands">Midlands</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Official Email *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="email"
                                            name="official_email"
                                            value={formData.official_email}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
                                            placeholder="admin@hospital.co.zw"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Primary Phone *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="primary_phone"
                                            value={formData.primary_phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
                                            placeholder="+263 77 000 0000"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Physical Address *</label>
                                <div className="relative">
                                    <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                                        <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                                    </div>
                                    <textarea
                                        rows={2}
                                        name="physical_address"
                                        value={formData.physical_address}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium resize-none"
                                        placeholder="Full street address, City"
                                    ></textarea>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Technical Readiness */}
                        <section className="space-y-5">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#007b46] flex items-center gap-2">
                                <Network className="w-4 h-4" /> 3. Technical Readiness
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Internet Availability *</label>
                                    <div className="relative">
                                        <select
                                            name="internet_availability"
                                            value={formData.internet_availability}
                                            onChange={handleChange}
                                            required
                                            className="appearance-none w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
                                        >
                                            <option value="" disabled>Select status</option>
                                            <option value="reliable">Fiber / Reliable VSAT</option>
                                            <option value="unreliable">Mobile Data (Intermittent)</option>
                                            <option value="none">No Internet (Needs Offline Node)</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Power Backup / Solar *</label>
                                    <div className="relative">
                                        <select
                                            name="power_backup"
                                            value={formData.power_backup}
                                            onChange={handleChange}
                                            required
                                            className="appearance-none w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
                                        >
                                            <option value="" disabled>Select status</option>
                                            <option value="yes">Yes (Solar / Generator backup)</option>
                                            <option value="no">No (Grid dependent only)</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Current Record System *</label>
                                    <div className="relative">
                                        <select
                                            name="current_record_system"
                                            value={formData.current_record_system}
                                            onChange={handleChange}
                                            required
                                            className="appearance-none w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
                                        >
                                            <option value="" disabled>Select current system</option>
                                            <option value="paper">100% Paper Based</option>
                                            <option value="hybrid">Hybrid (Paper + some Excel/Access)</option>
                                            <option value="ehr">Using an existing EHR (requires migration)</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 4: Lead Contact */}
                        <section className="space-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#007b46] flex items-center gap-2">
                                <UserCircle className="w-4 h-4" /> IT/Admin Lead Contact Person
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="admin_name"
                                            value={formData.admin_name}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 px-4 py-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
                                            placeholder="Administrator Name"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserCircle className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Direct Email / Username *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="admin_contact"
                                            value={formData.admin_contact}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 px-4 py-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
                                            placeholder="admin@hospital.gov.zw"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Primary Admin Password *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="admin_password"
                                            value={formData.admin_password}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
                                            placeholder="Create a strong password for IT Admin Dashboard"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">This will be used to access the Hospital IT Dashboard after registration.</p>
                                </div>
                            </div>
                        </section>

                        <div className="flex items-start gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <input
                                type="checkbox"
                                name="consent_given"
                                checked={formData.consent_given}
                                onChange={handleChange}
                                id="consent"
                                required
                                className="mt-1 w-5 h-5 text-[#007b46] border-emerald-300 rounded focus:ring-[#007b46]"
                            />
                            <label htmlFor="consent" className="text-sm font-medium text-slate-700 leading-snug">
                                I confirm accuracy of this facility data and provide explicit <span className="font-bold text-emerald-800">Ministry of Health (MoHCC) Digital Data Protection Consent</span>. I agree that patient health metrics will be cryptographically secured under the <span className="font-bold text-emerald-800">Zimbabwe Cyber and Data Protection Act</span> framework.
                            </label>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#007b46] hover:bg-[#006035] disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none text-white py-4.5 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 animate-pulse" /> Establishing Secure Node...
                                    </span>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 text-emerald-300" />
                                        Submit Institutional Profile <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
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
