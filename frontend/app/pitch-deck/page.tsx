"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
    Activity, Brain, Database, FileText, Globe, LineChart,
    Microchip, Shield, Smartphone, Stethoscope, ChevronLeft,
    ChevronRight, AlertCircle, TrendingUp, Users, HeartPulse, Building2, Banknote,
    Cloud, Play, Pause, CheckCircle2, MapPin, Navigation, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const customAnimations = `
  @keyframes slideUp { from { transform: translateY(80px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes slideLeft { from { transform: translateX(80px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes zoomOut { from { transform: scale(1.15); opacity: 0; } to { transform: scale(1); opacity: 1; } }

  @keyframes drawPath { from { stroke-dashoffset: 2000; } to { stroke-dashoffset: 0; } }
  
  .anim-slideUp { animation: slideUp 0.7s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
  .anim-slideLeft { animation: slideLeft 0.7s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
  .anim-popIn { animation: popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
  .anim-fadeIn { animation: fadeIn 0.9s ease-out forwards; }
  .anim-zoomOut { animation: zoomOut 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
  .anim-drawPath { animation: drawPath 2.5s ease-out forwards; }
`;

const CoreCrisisSlide = () => {
    const [selectedCrisis, setSelectedCrisis] = useState<string | null>(null);

    const crises = [
        { id: 'fragmentation', title: 'Fragmented Records', desc: 'Isolated hospitals, paper-files, lost histories, and blind clinical decisions.', icon: <FileText className="w-5 h-5 text-yellow-400" />, color: 'text-yellow-400', border: 'border-yellow-500/20', hover: 'hover:bg-yellow-500/5', bg: 'bg-yellow-500/20' },
        { id: 'ncd', title: 'The NCD Epidemic', desc: 'Chronic diseases (Hypertension, Diabetes) are soaring silently.', icon: <Activity className="w-5 h-5 text-red-400" />, color: 'text-red-400', border: 'border-red-500/20', hover: 'hover:bg-red-500/5', bg: 'bg-red-500/20' },
        { id: 'emergency', title: 'Delayed Emergencies', desc: 'Zero continuous monitoring means patients arrive at the ER in terminal distress.', icon: <HeartPulse className="w-5 h-5 text-green-400" />, color: 'text-green-400', border: 'border-green-500/20', hover: 'hover:bg-green-500/5', bg: 'bg-green-500/20' },
    ];

    type CrisisDetail = { headline: string; stats: { label: string; value: string; color: string }[]; rationale: string; bgColor: string; borderColor: string; highlightColor: string };

    const crisisDetails: Record<string, CrisisDetail> = {
        'fragmentation': {
            headline: 'Systemic Health Infrastructure Fragmentation',
            bgColor: 'bg-black/80',
            borderColor: 'border-yellow-500/50',
            highlightColor: 'text-yellow-400',
            rationale: "Zimbabwe’s healthcare suffers from severe public-private dichotomy and massive paper-dependency. While EHR (Impilo) is expanding, deep interoperability gaps and rural infrastructure challenges keep critical patient data siloed and inaccessible when it matters most.",
            stats: [
                { label: 'Facilities relying heavily on paper triage', value: '>70%', color: 'text-yellow-400' },
                { label: 'EHR Interoperability & Connectivity Gaps', value: 'Critical', color: 'text-slate-300' },
                { label: 'Risk of duplicated tests & adverse drug events', value: 'High', color: 'text-red-400' }
            ]
        },
        'ncd': {
            headline: 'The Silent NCD Tsunami',
            bgColor: 'bg-black/80',
            borderColor: 'border-red-500/50',
            highlightColor: 'text-red-400',
            rationale: "Non-Communicable Diseases (NCDs) are on track to surpass HIV/AIDS as the leading cause of mortality in Zimbabwe. With limited screening, patients live with unmanaged conditions for years until catastrophic failure.",
            stats: [
                { label: 'Hypertension prevalence in urban areas', value: '~46%', color: 'text-red-400' },
                { label: 'Estimated Diabetes prevalence rate', value: '~6-10%', color: 'text-yellow-400' },
                { label: 'NCD-related mortality (WHO)', value: '~40%', color: 'text-slate-300' }
            ]
        },
        'emergency': {
            headline: 'Terminal Emergency Admissions',
            bgColor: 'bg-black/80',
            borderColor: 'border-green-500/50',
            highlightColor: 'text-green-400',
            rationale: "Because chronic conditions are not continuously monitored remotely, acute exacerbations go undetected. Patients only interact with the healthcare system when they are already in terminal, highly expensive distress states.",
            stats: [
                { label: 'Lack of remote biometric monitoring', value: 'Near 100%', color: 'text-green-400' },
                { label: 'Cost burden of late-stage acute triage', value: 'Exponential', color: 'text-red-400' },
                { label: 'Preventable through EMR AI analytics', value: 'Millions', color: 'text-yellow-400' }
            ]
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left">
            <div className="space-y-6">
                <p className="text-xl font-medium text-slate-200">Zimbabwe&apos;s healthcare system suffers from structural fragmentation that deeply impacts patient outcomes.</p>
                <div className="space-y-4">
                    {crises.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedCrisis(selectedCrisis === item.id ? null : item.id)}
                            className={`flex gap-4 items-start p-4 cursor-pointer rounded-xl border border-transparent transition-all ${item.hover} ${selectedCrisis === item.id ? 'bg-white/10 border-white/20' : ''}`}
                        >
                            <div className={`mt-1 p-2 ${item.bg} rounded-lg`}>{item.icon}</div>
                            <div>
                                <strong className="text-white block text-lg mb-1 flex items-center gap-2">
                                    {item.title}
                                    <span className="text-[10px] bg-black/50 border border-white/20 px-2 py-0.5 rounded-full text-white/50 uppercase tracking-widest ml-2">Details</span>
                                </strong>
                                <span className="text-slate-300">{item.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative h-full min-h-[400px]">
                {/* Default GTM view */}
                <div className={`absolute inset-0 transition-all duration-500 ${selectedCrisis && crisisDetails[selectedCrisis] ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                    <div className="bg-black/60 border border-red-500/30 p-10 rounded-3xl h-full flex flex-col justify-center relative overflow-hidden backdrop-blur-xl">
                        <h4 className="text-red-400 font-bold mb-8 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                            <TrendingUp className="w-5 h-5" /> Verified Market Statistics
                        </h4>
                        <div className="text-center py-6">
                            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-400 to-red-600 mb-4">~40%</div>
                            <p className="text-slate-200 font-medium mb-12 text-lg">Of all deaths in Zimbabwe are attributed to NCDs (WHO), highlighting a catastrophic lack of monitoring.</p>

                            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-yellow-600 mb-4">$879M+</div>
                            <p className="text-slate-300 font-medium text-base">Projected size of the Middle East & Africa EMR market by 2030, showing massive regional potential.</p>
                        </div>
                    </div>
                </div>

                {/* Detailed Breakdown View */}
                {selectedCrisis && crisisDetails[selectedCrisis] && (
                    <div className={`absolute inset-0 transition-all duration-500 z-10 ${selectedCrisis ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
                        <div className={`${crisisDetails[selectedCrisis].bgColor} border ${crisisDetails[selectedCrisis].borderColor} p-10 rounded-[3rem] backdrop-blur-2xl h-full shadow-2xl flex flex-col`}>
                            <h4 className={`font-black text-2xl mb-4 ${crisisDetails[selectedCrisis].highlightColor}`}>{crisisDetails[selectedCrisis].headline}</h4>
                            <p className="text-slate-300 text-base leading-relaxed mb-8">{crisisDetails[selectedCrisis].rationale}</p>

                            <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                {crisisDetails[selectedCrisis].stats.map((stat, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-slate-200 font-medium text-sm pr-4">{stat.label}</span>
                                        <span className={`font-black text-2xl whitespace-nowrap ${stat.color}`}>{stat.value}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setSelectedCrisis(null)}
                                className="mt-8 w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors border border-white/10"
                            >
                                Close Statistics
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const NationalPlatformSlide = () => {
    const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

    const pillars = [
        { id: 'emr', title: 'National EMR System', desc: 'Secure digital health identity for every citizen.', icon: <Database className="w-5 h-5 text-green-400" />, color: 'text-green-400', border: 'border-green-500/20', hover: 'hover:bg-green-500/5', bg: 'bg-green-500/20' },
        { id: 'ai', title: 'AI Continuous Monitoring', desc: 'Real-time telemetry from wearable biometrics to cloud.', icon: <Activity className="w-5 h-5 text-yellow-400" />, color: 'text-yellow-400', border: 'border-yellow-500/20', hover: 'hover:bg-yellow-500/5', bg: 'bg-yellow-500/20' },
        { id: 'hospital', title: 'Hospital Intelligence', desc: 'Live clinical dashboards tracking thousands of patients simultaneously.', icon: <Building2 className="w-5 h-5 text-red-400" />, color: 'text-red-400', border: 'border-red-500/20', hover: 'hover:bg-red-500/5', bg: 'bg-red-500/20' },
        { id: 'analytics', title: 'Population Health Analytics', desc: 'Macro-level intelligence for precise Government Policy.', icon: <LineChart className="w-5 h-5 text-white" />, color: 'text-white', border: 'border-white/20', hover: 'hover:bg-white/5', bg: 'bg-white/20' }
    ];

    type PillarDetail = { headline: string; stats: { label: string; value: string; color: string }[]; rationale: string; bgColor: string; borderColor: string; highlightColor: string };

    const pillarDetails: Record<string, PillarDetail> = {
        'emr': {
            headline: 'Unified Digital Health Identity',
            bgColor: 'bg-black/80',
            borderColor: 'border-green-500/50',
            highlightColor: 'text-green-400',
            rationale: "Replacing paper files with a centralized FHIR-compliant National EMR. Every citizen receives a unique health ID, meaning their medical history, prescriptions, and lab results follow them instantly to any authorized hospital worldwide.",
            stats: [
                { label: 'Patient History Retrieval Time', value: '<1s', color: 'text-green-400' },
                { label: 'Interoperability Standard', value: 'FHIR HL7', color: 'text-slate-300' },
                { label: 'Data Encryption', value: 'AES-256', color: 'text-yellow-400' }
            ]
        },
        'ai': {
            headline: 'Real-Time Biometric Telemetry',
            bgColor: 'bg-black/80',
            borderColor: 'border-yellow-500/50',
            highlightColor: 'text-yellow-400',
            rationale: "Integrating wearable sensors directly into the patient's EMR. Our cloud pipeline ingests continuous ECG, SpO2, and Blood Pressure streams, running them through predictive Transformers to detect critical anomalies days before an emergency room visit.",
            stats: [
                { label: 'Remote Vital Sign Ingestion', value: '24/7', color: 'text-yellow-400' },
                { label: 'Early Warning Accuracy (Target)', value: '94%+', color: 'text-green-400' },
                { label: 'Cloud Architecture', value: 'Serverless', color: 'text-slate-300' }
            ]
        },
        'hospital': {
            headline: 'Live Clinical Triage Dashboards',
            bgColor: 'bg-black/80',
            borderColor: 'border-red-500/50',
            highlightColor: 'text-red-400',
            rationale: "Empowering understaffed wards with automated triage. Command-center dashboards allow a single duty nurse to monitor hundreds of patients simultaneously. AI acts as a co-pilot, automatically bubbling high-risk patients to the top of the queue.",
            stats: [
                { label: 'Nurse-to-Patient Monitoring Ratio', value: '1:500', color: 'text-red-400' },
                { label: 'Automated Alert Latency', value: '<50ms', color: 'text-yellow-400' },
                { label: 'Saved Triage Time per Shift', value: '4 Hours', color: 'text-green-400' }
            ]
        },
        'analytics': {
            headline: 'Macro Population Intelligence',
            bgColor: 'bg-black/80',
            borderColor: 'border-white/50',
            highlightColor: 'text-white',
            rationale: "Aggregating anonymized patient data nationwide gives the Ministry of Health unprecedented live visibility. Policy makers can track disease outbreaks geographically in real-time and efficiently allocate critical medical supplies where they are needed most.",
            stats: [
                { label: 'Geospatial Outbreak Tracking', value: 'Live', color: 'text-white' },
                { label: 'Predictive Resource Allocation', value: 'Enabled', color: 'text-green-400' },
                { label: 'Public Health Impact', value: 'National', color: 'text-yellow-400' }
            ]
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left">
            <div className="space-y-6">
                <h3 className="text-4xl font-black text-white leading-tight">We are transforming healthcare from <span className="text-red-400 line-through decoration-red-500/50">isolated paper records</span> to a <span className="text-green-400">unified predictive infrastructure.</span></h3>
                <p className="text-slate-200 text-lg leading-relaxed">The national EMR stores medical history, diagnoses, prescriptions, lab results, and AI risk predictions—accessible securely by any authorized provider nationwide.</p>
                <div className="space-y-4 pt-4">
                    {pillars.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedPillar(selectedPillar === item.id ? null : item.id)}
                            className={`flex gap-4 items-start p-3 cursor-pointer rounded-xl border border-transparent transition-all ${item.hover} ${selectedPillar === item.id ? 'bg-white/10 border-white/20' : ''}`}
                        >
                            <div className={`mt-1 p-2 ${item.bg} rounded-lg shrink-0`}>{item.icon}</div>
                            <div>
                                <strong className="text-white block text-lg mb-0.5 flex items-center gap-2">
                                    {item.title}
                                    <span className="text-[10px] bg-black/50 border border-white/20 px-2 py-0.5 rounded-full text-white/50 uppercase tracking-widest ml-2">Expand</span>
                                </strong>
                                <span className="text-slate-300 text-sm">{item.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative h-full min-h-[460px]">
                {/* Default GTM view */}
                <div className={`absolute inset-0 transition-all duration-500 ${selectedPillar && pillarDetails[selectedPillar] ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                    <div className="bg-black/40 border border-green-500/30 p-10 rounded-3xl h-full flex flex-col justify-center relative overflow-hidden backdrop-blur-xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-3xl rounded-full"></div>
                        <h4 className="text-3xl font-black text-green-400 mb-8 border-b border-green-500/30 pb-4 relative z-10">4 Pillars of Infrastructure</h4>
                        <div className="space-y-6 relative z-10">
                            {pillars.map((item, i) => (
                                <div key={i} className="flex gap-4 items-center">
                                    <div className={`w-10 h-10 rounded-full ${item.bg} ${item.color} flex items-center justify-center font-black shrink-0 border ${item.border}`}>{i + 1}</div>
                                    <strong className="text-white text-xl">{item.title}</strong>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 text-slate-400 text-sm italic relative z-10">
                            * Interoperable by design. Powered by deep learning algorithms.
                        </div>
                    </div>
                </div>

                {/* Detailed Breakdown View */}
                {selectedPillar && pillarDetails[selectedPillar] && (
                    <div className={`absolute inset-0 transition-all duration-500 z-10 ${selectedPillar ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
                        <div className={`${pillarDetails[selectedPillar].bgColor} border ${pillarDetails[selectedPillar].borderColor} p-10 rounded-[3rem] backdrop-blur-2xl h-full shadow-2xl flex flex-col`}>
                            <h4 className={`font-black text-2xl mb-4 ${pillarDetails[selectedPillar].highlightColor}`}>{pillarDetails[selectedPillar].headline}</h4>
                            <p className="text-slate-300 text-base leading-relaxed mb-8">{pillarDetails[selectedPillar].rationale}</p>

                            <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                {pillarDetails[selectedPillar].stats.map((stat, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-slate-200 font-medium text-sm pr-4">{stat.label}</span>
                                        <span className={`font-black text-2xl whitespace-nowrap ${stat.color}`}>{stat.value}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setSelectedPillar(null)}
                                className="mt-8 w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors border border-white/10"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const AiLayerSlide = () => {
    const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

    const features = [
        { id: 'sensors', title: 'Wearable Sensors', desc: 'Continuous tracking of ECG, BP, SpO₂, and glucose.', icon: <Microchip className="w-5 h-5 text-yellow-400" />, color: 'text-yellow-400', border: 'border-yellow-500/20', hover: 'hover:bg-yellow-500/5', bg: 'bg-yellow-500/10' },
        { id: 'forecasting', title: 'Predictive Forecasting', desc: 'Transformers and LSTMs detect complications early.', icon: <LineChart className="w-5 h-5 text-green-400" />, color: 'text-green-400', border: 'border-green-500/20', hover: 'hover:bg-green-500/5', bg: 'bg-green-500/10' },
        { id: 'intelligence', title: 'Automated Intelligence', desc: 'AI pipelines auto-generate patient reports and alerts.', icon: <Shield className="w-5 h-5 text-red-400" />, color: 'text-red-400', border: 'border-red-500/20', hover: 'hover:bg-red-500/5', bg: 'bg-red-500/10' }
    ];

    type FeatureDetail = { headline: string; stats: { label: string; value: string; color: string }[]; rationale: string; bgColor: string; borderColor: string; highlightColor: string };

    const featureDetails: Record<string, FeatureDetail> = {
        'sensors': {
            headline: 'Medical-Grade Biometric Sensing',
            bgColor: 'bg-black/80',
            borderColor: 'border-yellow-500/50',
            highlightColor: 'text-yellow-400',
            rationale: "Our sensor stack targets the 'Big 5' vitals. We use multi-wavelength PPG for SpO2 and Blood Pressure estimation, paired with single-lead ECG for heart rate variability. We are also prototyping non-invasive optical glucose monitoring using NIR spectroscopy.",
            stats: [
                { label: 'ECG Sampling Rate', value: '250Hz', color: 'text-yellow-400' },
                { label: 'PPG/BP Correlation', value: '0.89', color: 'text-green-400' },
                { label: 'Battery Optimization', value: '7 Days', color: 'text-white' }
            ]
        },
        'forecasting': {
            headline: 'Deep Learning Trend Analysis',
            bgColor: 'bg-black/80',
            borderColor: 'border-green-500/50',
            highlightColor: 'text-green-400',
            rationale: "We don't just alert on thresholds; we predict trajectories. Our Temporal Fusion Transformers (TFTs) recognize subtle patterns in heart rate variability and breathing rate that precede cardiac events or diabetic ketoacidosis by up to 48 hours.",
            stats: [
                { label: 'Anomaly Detection Accuracy', value: '96.2%', color: 'text-green-400' },
                { label: 'Prediction Horizon', value: '48 Hrs', color: 'text-yellow-400' },
                { label: 'Model Latency (Cloud)', value: '120ms', color: 'text-white' }
            ]
        },
        'intelligence': {
            headline: 'Automated Clinical Synthesis',
            bgColor: 'bg-black/80',
            borderColor: 'border-red-500/50',
            highlightColor: 'text-red-400',
            rationale: "Physicians suffer from data fatigue. ChroniBook's AI Layer synthesizes millions of data points into a single-paragraph clinical summary. It automatically flags high-risk patients to the top of the triage dashboard and generates weekly health reports for the patient.",
            stats: [
                { label: 'Report Generation Time', value: '<2s', color: 'text-red-400' },
                { label: 'False Alarm Reduction', value: '65%', color: 'text-green-400' },
                { label: 'Physician Review Time', value: '-80%', color: 'text-yellow-400' }
            ]
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left">
            <div className="space-y-6">
                <p className="text-xl font-medium text-slate-200">Our proprietary AI layer transforms raw biometric noise into actionable clinical intelligence.</p>
                <div className="space-y-4">
                    {features.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedFeature(selectedFeature === item.id ? null : item.id)}
                            className={`flex gap-4 items-start p-4 cursor-pointer rounded-xl border border-transparent transition-all ${item.hover} ${selectedFeature === item.id ? 'bg-white/10 border-white/20' : ''}`}
                        >
                            <div className={`mt-1 p-2 ${item.bg} rounded-lg shrink-0`}>{item.icon}</div>
                            <div>
                                <strong className="text-white block text-lg mb-0.5 flex items-center gap-2">
                                    {item.title}
                                    <span className="text-[10px] bg-black/50 border border-white/20 px-2 py-0.5 rounded-full text-white/50 uppercase tracking-widest ml-2">Detail</span>
                                </strong>
                                <span className="text-slate-300">{item.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative h-full min-h-[400px]">
                {/* Default Grid view */}
                <div className={`absolute inset-0 transition-all duration-500 ${selectedFeature && featureDetails[selectedFeature] ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                    <div className="grid grid-cols-1 gap-4 h-full">
                        {features.map((item, i) => (
                            <div key={i} className={`p-6 border ${item.border} rounded-2xl bg-black/40 backdrop-blur-md flex flex-col justify-center`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 ${item.bg} rounded-lg`}>{item.icon}</div>
                                    <strong className="text-white text-lg">{item.title}</strong>
                                </div>
                                <p className="text-slate-400 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed Breakdown View */}
                {selectedFeature && featureDetails[selectedFeature] && (
                    <div className={`absolute inset-0 transition-all duration-500 z-10 ${selectedFeature ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
                        <div className={`${featureDetails[selectedFeature].bgColor} border ${featureDetails[selectedFeature].borderColor} p-10 rounded-[3rem] backdrop-blur-2xl h-full shadow-2xl flex flex-col`}>
                            <h4 className={`font-black text-2xl mb-4 ${featureDetails[selectedFeature].highlightColor}`}>{featureDetails[selectedFeature].headline}</h4>
                            <p className="text-slate-300 text-sm leading-relaxed mb-8">{featureDetails[selectedFeature].rationale}</p>

                            <div className="flex-grow space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                                {featureDetails[selectedFeature].stats.map((stat, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-slate-200 font-medium text-xs pr-4">{stat.label}</span>
                                        <span className={`font-black text-xl whitespace-nowrap ${stat.color}`}>{stat.value}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setSelectedFeature(null)}
                                className="mt-6 w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors border border-white/10 text-sm"
                            >
                                Back to Layer Overview
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const RoadmapSlide = () => {
    const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

    const phases = [
        { id: 'pilot', phase: 'Phase 1', title: 'Clinical Pilot', date: 'Q1-Q2 2025', icon: <Building2 className="w-5 h-5" />, color: 'bg-green-500', border: 'border-green-500/30', accent: 'text-green-400' },
        { id: 'partners', phase: 'Phase 2', title: 'Network Expansion', date: 'Q3-Q4 2025', icon: <Users className="w-5 h-5" />, color: 'bg-yellow-500', border: 'border-yellow-500/30', accent: 'text-yellow-400' },
        { id: 'national', phase: 'Phase 3', title: 'National Integration', date: '2026', icon: <Globe className="w-5 h-5" />, color: 'bg-red-500', border: 'border-red-500/30', accent: 'text-red-400' },
        { id: 'scale', phase: 'Phase 4', title: 'Continental Scale', date: '2027+', icon: <TrendingUp className="w-5 h-5" />, color: 'bg-white', border: 'border-white/30', accent: 'text-white' }
    ];

    const phaseDetails: Record<string, { headline: string; rationale: string; goals: string[]; bgColor: string; borderColor: string; highlightColor: string; mapFocus: string }> = {
        'pilot': {
            headline: 'Harare & Bulawayo Pilot Launch',
            rationale: "Initial deployment focus on 5 high-traffic urban private hospitals to refine the AI triage algorithms and EMR UX with active physician feedback loops.",
            goals: ['Onboard 5,000 active patients', 'Refine AI Prediction Models', 'Secure MoHCC Endorsement'],
            bgColor: 'bg-black/80', borderColor: 'border-green-500/50', highlightColor: 'text-green-400',
            mapFocus: 'Urban Hubs'
        },
        'partners': {
            headline: 'Medical Aid & Insurance Integration',
            rationale: "Scaling from 5 to 50+ facilities. Onboarding private insurance partners to subsidize wearable sensors for chronic NCD patients, reducing their long-term claim liabilities.",
            goals: ['30,000+ Active Sensors deployed', 'API Integration with 3 Insurance Providers', 'Hospital Hub Regional Warehousing'],
            bgColor: 'bg-black/80', borderColor: 'border-yellow-500/50', highlightColor: 'text-yellow-400',
            mapFocus: 'National Network'
        },
        'national': {
            headline: 'MoHCC Public Infrastructure Sync',
            rationale: "Integration with the National e-Health Strategy. Rollout across public clinics and rural mission hospitals using offline-first EMR capabilities.",
            goals: ['State-level Health Dashboard launch', 'Rural Clinic Connectivity Pilot', 'Data Sovereignty Compliance'],
            bgColor: 'bg-black/80', borderColor: 'border-red-500/50', highlightColor: 'text-red-400',
            mapFocus: 'Public Framework'
        },
        'scale': {
            headline: 'SADC Region Expansion',
            rationale: "Exporting the Zimbabwe-proven predictive health model to neighboring markets (Zambia, Botswana, Malawi) through a 'Franchise Hub' hospital model.",
            goals: ['Enter 2 new African markets', 'Multi-tenant Data Grid deployment', 'Global Health Research Partnerships'],
            bgColor: 'bg-black/80', borderColor: 'border-white/50', highlightColor: 'text-white',
            mapFocus: 'Continental Grid'
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="flex flex-col h-full relative overflow-hidden">
            {/* Expansion Background Visual */}
            <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden opacity-20">
                <svg viewBox="0 0 800 600" className="w-full h-full">
                    <motion.circle
                        cx="400" cy="300"
                        initial={{ r: 50, opacity: 0.1 }}
                        fill="none"
                        stroke="rgba(34,197,94,0.3)"
                        animate={{
                            r: selectedPhase === 'pilot' ? 80 : selectedPhase === 'partners' ? 150 : selectedPhase === 'national' ? 250 : selectedPhase === 'scale' ? 500 : 50,
                            opacity: [0.1, 0.3, 0.1],
                            strokeWidth: [1, 3, 1]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />
                    <motion.circle
                        cx="400" cy="300"
                        initial={{ r: 100, opacity: 0.1 }}
                        fill="none"
                        stroke="rgba(234,179,8,0.2)"
                        animate={{
                            r: selectedPhase === 'partners' ? 180 : selectedPhase === 'national' ? 300 : selectedPhase === 'scale' ? 600 : 100,
                            opacity: selectedPhase ? 0.3 : 0.1
                        }}
                        transition={{ duration: 1.5 }}
                    />
                    {/* Zimbabwe Map Abstract */}
                    <path
                        d="M380,250 Q420,220 450,260 Q480,300 440,340 Q400,380 350,330 Q320,280 380,250"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="2"
                    />
                </svg>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 relative z-10"
            >
                {phases.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPhase(selectedPhase === item.id ? null : item.id)}
                        className={`p-6 rounded-3xl border transition-all cursor-pointer backdrop-blur-md relative overflow-hidden group ${selectedPhase === item.id ? `${item.border} bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.1)]` : 'border-white/10 bg-black/40 hover:bg-white/5'}`}
                    >
                        {/* Connecting Line between cards (visual only) */}
                        {idx < phases.length - 1 && (
                            <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-[2px] bg-gradient-to-r from-white/20 to-transparent z-0" />
                        )}

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.phase}</span>
                            <div className={`p-2 rounded-lg bg-black/50 border border-white/10 group-hover:border-${item.accent}/50 transition-colors`}>
                                <span className={selectedPhase === item.id ? item.accent : 'text-slate-400'}>{item.icon}</span>
                            </div>
                        </div>
                        <h4 className="text-white font-bold text-lg mb-1 relative z-10">{item.title}</h4>
                        <p className="text-slate-400 text-sm font-mono relative z-10">{item.date}</p>

                        {/* Progress Pulse */}
                        {selectedPhase === item.id && (
                            <motion.div
                                layoutId="activeGlow"
                                className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            />
                        )}
                    </motion.div>
                ))}
            </motion.div>

            <div className="flex-grow relative min-h-[350px]">
                <AnimatePresence mode="wait">
                    {!selectedPhase ? (
                        <motion.div
                            key="default"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="text-center max-w-2xl bg-black/40 border border-white/10 p-12 rounded-[3.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 relative z-10"
                                >
                                    <Activity className="w-12 h-12 text-white/40" />
                                </motion.div>
                                <h3 className="text-4xl font-black text-white mb-6 italic tracking-tight">The Path to National Health.</h3>
                                <p className="text-slate-400 text-lg leading-relaxed">
                                    Our strategic roadmap is designed for exponential expansion. <br />
                                    <span className="text-white/60">Click on any phase above to reveal the strategic vision.</span>
                                </p>

                                {/* Aesthetic grid pattern background */}
                                <div className="absolute inset-0 -z-10 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={selectedPhase}
                            initial={{ opacity: 0, y: 40, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -40, scale: 1.1 }}
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                            className="absolute inset-0"
                        >
                            <div className={`${phaseDetails[selectedPhase].bgColor} border ${phaseDetails[selectedPhase].borderColor} p-10 rounded-[3.5rem] backdrop-blur-3xl h-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-8 items-center relative overflow-hidden`}>
                                {/* Inner Expansion Glow */}
                                <div className={`absolute -right-20 -top-20 w-80 h-80 ${phaseDetails[selectedPhase].highlightColor.replace('text-', 'bg-')}/5 blur-[100px] rounded-full`} />

                                <div className="md:w-3/5 space-y-6 relative z-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-12 h-12 rounded-2xl ${phaseDetails[selectedPhase].highlightColor.replace('text-', 'bg-')}/20 flex items-center justify-center border border-white/10`}>
                                            <Navigation className={`w-6 h-6 ${phaseDetails[selectedPhase].highlightColor}`} />
                                        </div>
                                        <span className={`text-sm font-black uppercase tracking-[0.2em] ${phaseDetails[selectedPhase].highlightColor}`}>
                                            {phaseDetails[selectedPhase].mapFocus}
                                        </span>
                                    </div>

                                    <h4 className={`text-5xl font-black ${phaseDetails[selectedPhase].highlightColor} leading-tight`}>{phaseDetails[selectedPhase].headline}</h4>
                                    <p className="text-slate-200 text-xl leading-relaxed font-medium">{phaseDetails[selectedPhase].rationale}</p>

                                    <div className="pt-4">
                                        <motion.button
                                            whileHover={{ scale: 1.05, x: 5 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedPhase(null)}
                                            className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10"
                                        >
                                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                            Return to Roadmap Overview
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="md:w-2/5 w-full bg-black/60 border border-white/10 p-10 rounded-[2.5rem] relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex items-center justify-between mb-8">
                                        <h5 className="text-white font-black uppercase tracking-widest text-sm">Key Growth Metrics</h5>
                                        <MapPin className={`w-5 h-5 ${phaseDetails[selectedPhase].highlightColor}`} />
                                    </div>

                                    <div className="space-y-6 relative z-10">
                                        {phaseDetails[selectedPhase].goals.map((goal, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ x: 20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.2 + idx * 0.1 }}
                                                className="flex gap-5 items-center group/item"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/item:scale-110 group-hover/item:bg-white/10 transition-all">
                                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                </div>
                                                <span className="text-slate-100 font-semibold text-lg">{goal}</span>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Visual scale indicator */}
                                    <div className="mt-10 pt-6 border-t border-white/10">
                                        <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase mb-2">
                                            <span>Current Scale</span>
                                            <span>Target Horizon</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(phases.findIndex(p => p.id === selectedPhase) + 1) * 25}%` }}
                                                className={`h-full bg-gradient-to-r from-transparent to-white/50`}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const InvestmentAskSlide = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = [
        { id: 'software', name: 'Software (EMR & Apps)', amount: '$1.25M', icon: <Database className="w-5 h-5 text-yellow-500" />, color: 'text-yellow-400', border: 'border-yellow-500/20', hover: 'hover:bg-yellow-500/5' },
        { id: 'ai', name: 'AI Models (Bio & NLP)', amount: '$700k', icon: <Brain className="w-5 h-5 text-green-500" />, color: 'text-green-400', border: 'border-green-500/20', hover: 'hover:bg-green-500/5' },
        { id: 'ops', name: 'Ops & Market Launch', amount: '$600k', icon: <Activity className="w-5 h-5 text-red-500" />, color: 'text-red-400', border: 'border-red-500/20', hover: 'hover:bg-red-500/5' },
        { id: 'cloud', name: 'Cloud Arch & Security', amount: '$400k', icon: <Cloud className="w-5 h-5 text-yellow-500" />, color: 'text-yellow-400', border: 'border-yellow-500/20', hover: 'hover:bg-yellow-500/5' },
        { id: 'hardware', name: 'Hardware Integration', amount: '$350k', icon: <Smartphone className="w-5 h-5 text-green-500" />, color: 'text-green-400', border: 'border-green-500/20', hover: 'hover:bg-green-500/5' },
        { id: 'compliance', name: 'Compliance & Regs', amount: '$200k', icon: <Shield className="w-5 h-5 text-red-500" />, color: 'text-red-400', border: 'border-red-500/20', hover: 'hover:bg-red-500/5' },
    ];

    type BreakdownItem = { title: string; cost: string };
    type DetailedData = { title: string; total: string; bg: string; lineColor: string; rationale: string; breakdown: BreakdownItem[] };

    const detailedData: Record<string, DetailedData> = {
        'software': {
            title: 'Software (EMR & Apps)',
            total: '$1,250,000',
            bg: 'bg-black/80',
            lineColor: 'border-yellow-500/50',
            rationale: "Core development of the national EMR backbone, React Native clinical apps, patient portals, and robust backend microservices.",
            breakdown: [
                { title: 'Engineering Team (Frontend, Backend, QA)', cost: '$650,000' },
                { title: 'UI/UX Design & Patient Testing', cost: '$150,000' },
                { title: 'Third-Party API Licenses (Maps, Comms)', cost: '$50,000' },
                { title: 'EHR Interoperability Standards (FHIR/HL7)', cost: '$150,000' },
                { title: 'Contingency Fund (Feature creep/Delays)', cost: '$250,000 reserve' }
            ]
        },
        'ai': {
            title: 'AI Models (Bio & NLP)',
            total: '$700,000',
            bg: 'bg-black/80',
            lineColor: 'border-green-500/50',
            rationale: "Requires vast GPU compute for NLP models parsing unstructured physician notes and Transformers predicting NCD emergencies.",
            breakdown: [
                { title: 'GPU Cloud Compute (Training)', cost: '$250,000' },
                { title: 'Data Labeling & Medical Validation', cost: '$150,000' },
                { title: 'MLOps Pipelines & Versioning', cost: '$100,000' },
                { title: 'Contingency Fund (Model drift)', cost: '$200,000 reserve' }
            ]
        },
        'ops': {
            title: 'Ops & Market Launch',
            total: '$600,000',
            bg: 'bg-black/80',
            lineColor: 'border-red-500/50',
            rationale: "Aggressive go-to-market strategy targeting top private hospitals, training programs for medical staff, and early-adopter marketing.",
            breakdown: [
                { title: 'Hospital Onboarding & Training Team', cost: '$200,000' },
                { title: 'Marketing & PR (B2B Healthcare)', cost: '$150,000' },
                { title: 'Sales & Enterprise Partnerships', cost: '$100,000' },
                { title: 'Contingency Fund (Market barriers)', cost: '$150,000 reserve' }
            ]
        },
        'cloud': {
            title: 'Cloud Arch & Security',
            total: '$400,000',
            bg: 'bg-black/80',
            lineColor: 'border-yellow-500/50',
            rationale: "Based on scraped real-world AWS healthcare deployment sizes for a hybrid Spark/Hadoop EMR cluster running intense biometric anomaly detection models.",
            breakdown: [
                { title: 'AWS EMR on EC2 (m6g.xlarge spot fleet)', cost: '$90,000 / yr' },
                { title: 'AWS EMR Serverless (Bursty AI tasks)', cost: '$35,000 / yr' },
                { title: 'Amazon S3 HIPAA Data Lake (Petabytes)', cost: '$85,000 / yr' },
                { title: 'Multi-Region Failover & Routing', cost: '$40,000 / yr' },
                { title: 'Cybersecurity & DDoS Protection', cost: '$50,000 / yr' },
                { title: 'Contingency Fund (Overprovisioning)', cost: '$100,000 reserve' }
            ]
        },
        'hardware': {
            title: 'Hardware Integration',
            total: '$350,000',
            bg: 'bg-black/80',
            lineColor: 'border-green-500/50',
            rationale: "Subsidizing initial wearable biometric sensors, clinical IoT hubs, and hardware SDK integration tests.",
            breakdown: [
                { title: 'Pilot Biometric Wearables (5,000 units)', cost: '$150,000' },
                { title: 'Clinic IoT Gateways & Tablets', cost: '$80,000' },
                { title: 'Proprietary SDK/Driver Dev', cost: '$50,000' },
                { title: 'Contingency Fund (Supply chain)', cost: '$70,000 reserve' }
            ]
        },
        'compliance': {
            title: 'Compliance & Regs',
            total: '$200,000',
            bg: 'bg-black/80',
            lineColor: 'border-red-500/50',
            rationale: "Strict adherence to stringent healthcare data privacy laws, external security audits, and governmental certifications.",
            breakdown: [
                { title: 'HIPAA & Local Law Audits', cost: '$70,000' },
                { title: 'Pen-testing & Security Certifications', cost: '$50,000' },
                { title: 'Legal Counsel (Healthcare Data IP)', cost: '$50,000' },
                { title: 'Contingency Fund (Regulatory hurdles)', cost: '$30,000 reserve' }
            ]
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
                <div className="bg-black/60 border border-yellow-500/30 p-8 rounded-3xl backdrop-blur-md">
                    <div className="space-y-4 text-lg">
                        {categories.map((cat, i) => (
                            <div
                                key={cat.id}
                                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                className={`flex justify-between items-end border-b ${cat.border} pb-4 cursor-pointer transition-colors px-2 py-2 rounded-lg ${cat.hover} ${selectedCategory === cat.id ? 'bg-white/5' : ''} ${i === categories.length - 1 ? 'border-b-0' : ''}`}
                            >
                                <div className="flex items-center gap-3 text-slate-300">
                                    {cat.icon} {cat.name}
                                    {detailedData[cat.id] && <span className="text-xs bg-black/50 border border-white/20 px-2 py-0.5 rounded-full ml-2 text-white/50">Details</span>}
                                </div>
                                <span className={`${cat.color} font-mono font-black text-2xl`}>{cat.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative h-full min-h-[400px]">
                {/* Default GTM view */}
                <div className={`absolute inset-0 transition-all duration-500 ${selectedCategory && detailedData[selectedCategory] ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                    <div className="bg-black/60 border border-green-500/30 p-12 rounded-[3rem] backdrop-blur-xl h-full flex flex-col justify-center">
                        <h4 className="text-white font-black mb-8 text-2xl border-b border-zinc-800 pb-4">Go-to-Market Evolution</h4>
                        <div className="relative border-l-2 border-zinc-700 ml-4 space-y-10 pb-4">
                            <div className="relative pl-10">
                                <span className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]"></span>
                                <strong className="text-green-400 block text-xl mb-1">P1: Private Hospitals</strong>
                                <p className="text-base text-slate-300">Prove operational value, aggregate initial clinic data, establish rock-solid reliability.</p>
                            </div>
                            <div className="relative pl-10">
                                <span className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]"></span>
                                <strong className="text-yellow-400 block text-xl mb-1">P2: Medical Aid Providers</strong>
                                <p className="text-base text-slate-300">Contract insurance networks reducing their astronomical chronic condition claims.</p>
                            </div>
                            <div className="relative pl-10">
                                <span className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]"></span>
                                <strong className="text-red-400 block text-xl mb-1">P3: Government Integration</strong>
                                <p className="text-base text-slate-300">Scale into Ministry of Health public infrastructure rollouts.</p>
                            </div>
                            <div className="relative pl-10">
                                <span className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full border-4 border-[#0f172a] bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)]"></span>
                                <strong className="text-white block text-xl mb-1">P4: Continental Expansion</strong>
                                <p className="text-base text-slate-300">Expand across Africa establishing an interoperable digital health grid.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Breakdown View */}
                {selectedCategory && detailedData[selectedCategory] && (
                    <div className={`absolute inset-0 transition-all duration-500 z-10 ${selectedCategory && detailedData[selectedCategory] ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
                        <div className={`${detailedData[selectedCategory].bg} border ${detailedData[selectedCategory].lineColor} p-10 rounded-[3rem] backdrop-blur-2xl h-full shadow-2xl flex flex-col`}>
                            <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-6">
                                <div>
                                    <h4 className="text-white font-black text-2xl mb-2">{detailedData[selectedCategory].title}</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed max-w-sm">{detailedData[selectedCategory].rationale}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-white block">{detailedData[selectedCategory].total}</span>
                                    <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total Allocation</span>
                                </div>
                            </div>

                            <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                {detailedData[selectedCategory].breakdown.map((item: BreakdownItem, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                                            <span className="text-slate-200 font-medium">{item.title}</span>
                                        </div>
                                        <span className={`font-mono font-bold ${item.title.includes('Contingency') ? 'text-red-400' : 'text-slate-300'}`}>{item.cost}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="mt-8 w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors border border-white/10"
                            >
                                Close Breakdown
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const slides = [
    {
        id: 'intro',
        title: "National AI Health Infrastructure",
        subtitle: "Seed Round Prospectus · Zimbabwe",
        icon: <Globe className="w-16 h-16" />,
        color: "from-slate-800 to-black",
        text_color: "text-white",
        animationClass: "anim-zoomOut",
        content: (
            <div className="text-center mt-8">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-yellow-500">
                    The Ecosystem of <br /> Predictive Survival.
                </h1>
                <p className="text-xl md:text-2xl text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed mb-12">
                    Building the first national AI-powered Electronic Medical Record and continuous patient monitoring ecosystem. Transforming isolated hospital data into a unified, intelligent defense against mortality.
                </p>
            </div>
        )
    },
    {
        id: 'problem',
        title: "The Core Crisis",
        subtitle: "Structural Failures Costing Lives & Capital",
        icon: <AlertCircle className="w-16 h-16 text-yellow-500" />,
        color: "from-red-950 to-red-900 border-red-500/30",
        text_color: "text-white",
        animationClass: "anim-slideLeft",
        content: <CoreCrisisSlide />
    },
    {
        id: 'solution',
        title: "The National Platform",
        subtitle: "Connecting Patients, Providers, and Policy",
        icon: <Globe className="w-16 h-16 text-green-500" />,
        color: "from-green-950 to-green-900 border-green-500/30",
        text_color: "text-white",
        animationClass: "anim-slideUp",
        content: <NationalPlatformSlide />
    },
    {
        id: 'ai',
        title: "The AI & Wearables Layer",
        subtitle: "Deep Learning Running on Live Vitals",
        icon: <Brain className="w-16 h-16 text-yellow-500" />,
        color: "from-black to-zinc-900 border-yellow-500/30",
        text_color: "text-white",
        animationClass: "anim-popIn",
        content: <AiLayerSlide />
    },
    {
        id: 'roadmap',
        title: "Strategic Roadmap",
        subtitle: "Scaling from Urban Pilots to National Grid",
        icon: <TrendingUp className="w-16 h-16 text-red-500" />,
        color: "from-black to-slate-900 border-red-500/20",
        text_color: "text-white",
        animationClass: "anim-slideUp",
        content: <RoadmapSlide />
    },
    {
        id: 'financials',
        title: "Financial Projections",
        subtitle: "5-Year Diversified Revenue Modeling",
        icon: <LineChart className="w-16 h-16 text-green-500" />,
        color: "from-zinc-900 to-black border-green-500/30",
        text_color: "text-white",
        animationClass: "anim-slideLeft",
        content: (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { target: 'Patients (B2C)', role: 'Subscriptions ($1-$5/mo)', icon: <Users />, color: 'text-green-400' },
                            { target: 'Hospitals (B2B)', role: 'Platform licensing ($50-$200/mo)', icon: <Building2 />, color: 'text-yellow-400' },
                            { target: 'Institutions (B2B)', role: 'Scale contracts ($500-$2000/mo)', icon: <Stethoscope />, color: 'text-red-400' },
                            { target: 'Hardware Sales', role: 'Wearables ($70-$120 range)', icon: <Smartphone />, color: 'text-white' }
                        ].map((item, i) => (
                            <div key={i} className="bg-black/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-lg hover:border-green-500/30 transition-colors">
                                <div className={`${item.color} mb-3`}>{item.icon}</div>
                                <strong className="text-white block mb-1 text-lg">{item.target}</strong>
                                <p className="text-xs text-slate-400">{item.role}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-black/50 border border-green-500/30 rounded-3xl p-10 backdrop-blur-xl relative">
                    <div className="relative h-72 border-b border-l border-zinc-700 pl-4 pb-4">
                        {/* SVG Growth Line */}
                        <svg className="absolute inset-x-0 bottom-4 h-full w-full pointer-events-none overflow-visible z-0 pr-4 pl-4" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="lineGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#22c55e" />
                                    <stop offset="100%" stopColor="#eab308" />
                                </linearGradient>
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>
                            <path
                                d="M 0 256 C 200 240, 400 180, 600 120 C 800 60, 1000 20, 1080 0"
                                fill="none"
                                stroke="url(#lineGradient)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                filter="url(#glow)"
                                className="anim-drawPath opacity-80"
                                style={{
                                    strokeDasharray: 2000,
                                    strokeDashoffset: 2000,
                                    animation: 'drawPath 2.5s ease-out forwards 0.5s'
                                }}
                            />
                        </svg>

                        <div className="absolute -left-12 top-0 text-[10px] text-slate-500 font-mono uppercase tracking-tighter">$60M</div>
                        <div className="absolute -left-12 top-1/2 text-[10px] text-slate-500 font-mono -translate-y-1/2 uppercase tracking-tighter">$30M</div>
                        <div className="absolute -left-12 bottom-4 text-[10px] text-slate-500 font-mono uppercase tracking-tighter">0</div>

                        <div className="flex items-end justify-between h-full relative z-10">
                            {[
                                { yr: 'Year 1', users: '30k Users', rev: '$0.7M', h: 'h-[5%]', delay: 'delay-0' },
                                { yr: 'Year 2', users: '120k Users', rev: '$3M', h: 'h-[15%]', delay: 'delay-100' },
                                { yr: 'Year 3', users: '400k Users', rev: '$10M', h: 'h-[30%]', delay: 'delay-200' },
                                { yr: 'Year 4', users: '1M Users', rev: '$25M', h: 'h-[60%]', delay: 'delay-300' },
                                { yr: 'Year 5', users: '2.5M Users', rev: '$60M', h: 'h-[100%]', delay: 'delay-500' }
                            ].map((bar, i) => (
                                <div key={i} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0 bg-black/90 px-3 py-2 rounded-xl text-xs whitespace-nowrap z-20 border border-green-500/30 text-white shadow-2xl pointer-events-none">
                                        <div className="text-yellow-400 font-black mb-1">{bar.users}</div>
                                        <div className="text-slate-400">Projected Rev: <span className="text-white">{bar.rev}</span></div>
                                    </div>

                                    <div className="text-xs font-black text-white/40 mb-2 group-hover:text-white transition-colors">{bar.rev}</div>
                                    <div
                                        className={`w-3/5 max-w-[60px] bg-gradient-to-t from-green-600/40 via-green-500/60 to-yellow-400 rounded-t-2xl ${bar.h} shadow-[0_0_30px_rgba(34,197,94,0.1)] transition-all duration-1000 ease-out group-hover:h-[110%] group-hover:shadow-[0_0_40px_rgba(250,204,21,0.4)] border-t border-x border-white/20`}
                                        style={{ transitionDelay: `${i * 150}ms` }}
                                    ></div>
                                    <div className="text-[10px] font-bold text-slate-500 mt-3 uppercase tracking-widest">{bar.yr}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'ask',
        title: "The Investment Ask",
        subtitle: "$3.5M Seed Round Capital Allocation",
        icon: <Banknote className="w-16 h-16 text-yellow-500" />,
        color: "from-black to-zinc-950 border-yellow-500/30",
        text_color: "text-white",
        animationClass: "anim-slideUp",
        content: <InvestmentAskSlide />
    }
];

const WalkthroughModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-8"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-6xl aspect-video bg-zinc-950 rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-black/60 hover:bg-red-500/80 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all duration-300 group"
                    >
                        <ChevronLeft className="w-6 h-6 rotate-45 group-hover:scale-110" />
                    </button>
                    <div className="absolute top-6 left-8 z-10 flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                            <Play className="w-4 h-4 text-yellow-500" />
                        </div>
                        <span className="text-white font-black uppercase tracking-widest text-sm">ChroniBook System Walkthrough</span>
                    </div>
                    <video
                        src="/view_demo.mp4"
                        controls
                        autoPlay
                        className="w-full h-full object-contain bg-black"
                    />
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default function SlideDeck() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showWalkthrough, setShowWalkthrough] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const deckRef = useRef<HTMLDivElement>(null);

    const handleExportPDF = async () => {
        if (isExporting) return;
        setIsExporting(true);
        setIsPlaying(false);

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [1280, 720]
        });

        const originalIndex = currentIndex;

        for (let i = 0; i < slides.length; i++) {
            setCurrentIndex(i);
            // Wait for animations to settle
            await new Promise(resolve => setTimeout(resolve, 800));

            if (deckRef.current) {
                const canvas = await html2canvas(deckRef.current, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#000',
                    logging: false,
                });
                
                const imgData = canvas.toDataURL('image/png');
                if (i > 0) pdf.addPage([1280, 720], 'landscape');
                pdf.addImage(imgData, 'PNG', 0, 0, 1280, 720);
            }
        }

        pdf.save('E-ChroniBook-PitchDeck.pdf');
        setCurrentIndex(originalIndex);
        setIsExporting(false);
    };

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, []);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }, []);

    // Auto-play loop
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && !showWalkthrough) {
            interval = setInterval(() => {
                handleNext();
            }, 7000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, handleNext, showWalkthrough]);

    // Keyboard navigation and auto-fullscreen
    useEffect(() => {
        const enterFullscreen = () => {
            if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => { });
            }
        };

        // Auto-fullscreen on first user interaction in this component
        const initiateInteraction = () => {
            enterFullscreen();
            window.removeEventListener('click', initiateInteraction);
            window.removeEventListener('keydown', initiateInteraction);
        };

        window.addEventListener('click', initiateInteraction);
        window.addEventListener('keydown', initiateInteraction);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.code === 'Space') {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('click', initiateInteraction);
            window.removeEventListener('keydown', initiateInteraction);
        };
    }, [handleNext, handlePrev]);

    const handleFullscreen = () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log("Error attempting to enable fullscreen:", err);
            });
        }
    };

    const currentSlide = slides[currentIndex];

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden relative font-sans selection:bg-white/20 transition-colors duration-1000 bg-gradient-to-br ${currentSlide.color}`}>

            <style dangerouslySetInnerHTML={{ __html: customAnimations }} />

            {/* Background Decor */}
            <div className="absolute inset-0 opacity-[0.1] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            {/* Main Slide Card Container */}
            <div className="w-full max-w-7xl h-auto min-h-[800px] flex flex-col relative z-10">

                {/* Top App Bar inside Deck */}
                <div className="flex items-center justify-between py-6 px-12 mb-4 bg-black/20 backdrop-blur-md rounded-full border border-white/10 shadow-2xl relative z-50">
                    <div className="flex items-center gap-4 text-white">
                        <Activity className="w-8 h-8" />
                        <span className="font-bold text-xl tracking-tight hidden md:block">E-ChroniBook <span className="opacity-50">Pitch Deck</span></span>
                    </div>

                    {/* Pagination Indicators */}
                    <div className="flex gap-3">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    if (i !== currentIndex) {
                                        setCurrentIndex(i);
                                    }
                                }}
                                className={`h-2 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-12 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className={`flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-full px-6 py-2 font-bold text-sm border border-white/20 transition-all ${isExporting ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {isExporting ? (
                                <>
                                    <Activity className="w-4 h-4 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setShowWalkthrough(true)}
                            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full px-6 py-2 font-black text-sm transition-all hover:scale-105 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            View Walkthrough
                        </button>
                        <button onClick={handleFullscreen} className="text-white/70 hover:text-white transition-colors" title="Request Fullscreen">
                            <Globe className="w-6 h-6" /> {/* Generic substitute for actual expand icon in lucide-react if needed */}
                        </button>
                        <Link href="/" className="bg-white text-slate-900 rounded-full px-6 py-2 font-bold text-sm hover:scale-105 transition-transform">
                            Exit Deck
                        </Link>
                    </div>
                </div>

                {/* Content Area with Unique Animations per Slide */}
                <div ref={deckRef} className="flex-grow flex flex-col justify-center px-4 md:px-12 relative overflow-hidden bg-transparent">
                    <div key={currentIndex} className={`w-full h-full flex flex-col justify-center opacity-0 ${currentSlide.animationClass}`}>
                        <div className="mb-10 text-center">
                            {/* Slide specific Icon */}
                            {currentIndex !== 0 && (
                                <div className="flex justify-center mb-6">
                                    {currentSlide.icon}
                                </div>
                            )}
                            {currentIndex !== 0 && (
                                <>
                                    <h2 className={`text-4xl md:text-6xl font-black tracking-tight mb-4 ${currentSlide.text_color}`}>{currentSlide.title}</h2>
                                    <h3 className="text-xl md:text-2xl font-bold opacity-70 tracking-wide uppercase text-white">{currentSlide.subtitle}</h3>
                                </>
                            )}
                        </div>

                        {/* Core Slide Content */}
                        <div className="w-full relative">
                            {currentSlide.content}
                        </div>
                    </div>
                </div>

                {/* Bottom Nav Controls */}
                <div className="mt-8 flex justify-between items-center px-12 pb-6">
                    <button
                        onClick={handlePrev}
                        className="w-16 h-16 rounded-full flex items-center justify-center bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all backdrop-blur-md"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <div className="flex items-center gap-6">
                        <div className="text-white/50 font-mono tracking-widest text-sm font-bold w-12 text-center">
                            {currentIndex + 1} / {slides.length}
                        </div>
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors border border-white/20 backdrop-blur-md"
                        >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                        </button>
                    </div>

                    <button
                        onClick={handleNext}
                        className="w-16 h-16 rounded-full flex items-center justify-center bg-white text-slate-900 border border-transparent shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 transition-all font-bold"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                </div>

            </div>

            <WalkthroughModal isOpen={showWalkthrough} onClose={() => setShowWalkthrough(false)} />

        </div>
    );
}
