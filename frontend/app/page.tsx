"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Play, Pause, ChevronRight, ChevronLeft, Activity, Brain, ShieldCheck, FileText, Heart, Zap, Globe, Stethoscope, Database, Smartphone, AlertCircle, X, Info, ArrowRight, BarChart3, TrendingUp, BookOpen, Lock, Users, Shield, Presentation
} from 'lucide-react';

const SLIDE_DURATION = 10000; // 10 seconds per slide

const slides = [
  {
    id: 1,
    title: "E-ChroniBook",
    subtitle: "Evidence-Based Health Intelligence",
    icon: <Globe className="w-16 h-16" />,
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-100",
    summary: "A national-scale response to Zimbabwe's rising chronic disease burden. Moving from paper-based records to data-driven survival.",
    details: "E-ChroniBook is a ground-breaking platform designed to unify Zimbabwe's fragmented health data. Available data shows that non-communicable diseases (NCDs) such as hypertension and diabetes now account for roughly 39–40% of all deaths in Zimbabwe. Earlier WHO estimates of 31% have risen steadily, indicating a silent epidemic that requires immediate intervention. Our mission is to provide every citizen with a secure, lifelong health identity that is accessible by authorized professionals nationwide, turning high-level research signals into local clinical action. This system ensures that healthcare delivery is no longer reactive but proactive and informed.",
    layout: "center"
  },
  {
    id: 2,
    title: "The Crisis of Monitoring",
    subtitle: "The 40% NCD Mortality Pool",
    icon: <BarChart3 className="w-16 h-16" />,
    color: "text-red-600",
    bg: "bg-red-50 border-red-100",
    summary: "Chronic diseases account for 40% of national deaths. Monitoring failures are a dominant determinant of this mortality.",
    details: "Research and public health reports consistently note that a vast number of Zimbabwean patients remain undiagnosed for hypertension and diabetes until life-threatening complications occur. While a single statistic for 'deaths due to poor monitoring' does not exist, epidemiological practice identifies monitoring as a core health-system determinant. Late follow-ups and weak primary-care tracking are primary contributors to worse outcomes. E-ChroniBook treats monitoring as a factor influencing the entire 40% NCD mortality pool. By closing the monitoring gap, we directly influence the outcome of nearly half the nation's total mortality causes, preventing complications before they reach the hospital.",
    layout: "split"
  },
  {
    id: 3,
    title: "Medication Harm & Errors",
    subtitle: "Undercounted Clinical Risks",
    icon: <AlertCircle className="w-16 h-16" />,
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-100",
    summary: "Adverse drug reactions account for 4.7% of reported cases. Systemic information failure is the hidden killer.",
    details: "Zimbabwe's pharmacovigilance reports have recorded deaths in approximately 4.7% of reported adverse-reaction cases. However, since paper-based reporting systems capture only a small fraction of real incidents, the true burden is significantly higher. Regional African hospital data suggests that up to 16% of hospital deaths may involve medication harm in specific settings. Without an EMR like E-ChroniBook, there is no reliable way to track improper medication issuing or dosage errors. Our system provides automated interaction checks and dispensing logs, targeting the systematic information failures that researchers agree are a dominant contributor to preventable patient mortality.",
    layout: "center"
  },
  {
    id: 4,
    title: "The 86% Care Failure",
    subtitle: "Maternal Health & Systemic Delays",
    icon: <TrendingUp className="w-16 h-16" />,
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-100",
    summary: "86% of maternal deaths are linked to care delays, errors, and poor monitoring. This is an EMR-fixable crisis.",
    details: "Zimbabwe-specific mortality analyses reveal a staggering reality: 86% of maternal deaths are linked to delays or failures in receiving proper care. These include clinical decision errors, poor vital sign monitoring, and shortages of information. These are the exact categories that EMRs and clinical tracking systems are engineered to eliminate. While not always framed as an 'EMR problem,' these deaths stem from information failures. E-ChroniBook provides the real-time data flow and decision support needed to ensure that 'delays' are replaced with 'instant insights,' potentially saving thousands of mothers and newborns who currently fall through the cracks of a fragmented system.",
    layout: "split"
  },
  {
    id: 5,
    title: "Predictive Survival Brain",
    subtitle: "Beyond Basic Record Keeping",
    icon: <Brain className="w-16 h-16" />,
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-100",
    summary: "AI models that analyze 'Research Signals' to predict clinical deterioration 20 minutes before it happens.",
    details: "Attributing mortality requires causal modeling. E-ChroniBook uses Deep Learning (CNN/LSTM) to treat monitoring as a predictive variable. By analyzing subtle shifts in RR intervals and ST-segments, our AI provides predictive clinical decision support. This is designed to counteract the 'delayed diagnosis' statistics identified in national research. By providing a 20-minute early warning lead-time, we provide doctors with the information they currently lack, transforming the clinical workflow from a reactive, fatigue-heavy search for files into a high-speed, AI-assisted life-saving operation. This is the hardware-software bridge that paper records cannot provide.",
    layout: "center"
  },
  {
    id: 6,
    title: "The Wearable Guardian",
    subtitle: "Closing the Adherence Gap",
    icon: <Activity className="w-16 h-16" />,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-100",
    summary: "24/7 Biometric tracking to solve the treatment adherence gaps and rural health access challenges.",
    details: "Rural health access and treatment adherence gaps are major health determinants in Zimbabwe. E-ChroniBook utilizes wearable sensors (HR, BP, SpO2) to maintain a constant connection between the patient and the health system. This provides the 'longitudinal monitoring' that researchers identify as missing in current NCD care. By tracking vitals outside the clinic, we solve the problem of patients being undiagnosed until a crisis occurs. This data flows into the National EMR, ensuring that even if a patient is far from a hospital, their 'Digital Twin' is being monitored by our AI, triggering interventions based on biological thresholds rather than waiting for a physical visit.",
    layout: "split"
  },
  {
    id: 7,
    title: "NLP: Clinical Intelligence",
    subtitle: "Structuring Unstructured Notes",
    icon: <FileText className="w-16 h-16" />,
    color: "text-slate-700",
    bg: "bg-slate-50 border-slate-200",
    summary: "Converting millions of handwritten notes into a standardized, searchable health intelligence database.",
    details: "Zimbabwe's reliance on paper leads to illegible entries and data fragmentation. E-ChroniBook uses BioBERT-based NLP to read unstructured clinical notes and extract standardized ICD-10 and LOINC codes. This solves the 'search for files' inefficiency that burns out clinicians and compromises care quality. By automating the conversion of text to structured data, we provide health authorities with the real-time aggregation they need for strategic policy decisions. This turns anecdotal evidence of health system failures into a quantifiable, actionable dashboard, allowing for proactive resource allocation and accurate national statistics for the first time in history.",
    layout: "center"
  },
  {
    id: 8,
    title: "A Sovereign Vision",
    subtitle: "Health Intelligence for Zimbabwe",
    icon: <ShieldCheck className="w-16 h-16" />,
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-100",
    summary: "Addressing system failures through a unified, resilient digital infrastructure. Data-driven sovereignty for all.",
    details: "The bottom line is clear: thousands of deaths annually in Zimbabwe are preventable through better data flow and decision support. E-ChroniBook addresses the infrastructure limitations—power, connectivity, and digital literacy—through an offline-first, modular architecture. We are not just building software; we are building a resilient digital health system that ensures continuity of care and patient empowerment. By addressing the 86% care-failure rate and the 40% NCD mortality pool, we establish the foundation for a modern, responsive, and equitable healthcare delivery system. Healthy Citizens. Powerful Nation. Built for the people of Zimbabwe.",
    layout: "center"
  }
];

export default function App() {
  const [showHome, setShowHome] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const progressInterval = useRef<number>(0);
  const startTime = useRef<number>(0);
  const elapsedTime = useRef<number>(0);

  const resetProgress = () => {
    elapsedTime.current = 0;
    startTime.current = Date.now();
    setProgress(0);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      resetProgress();
      setIsAnimating(false);
    }, 400);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
      resetProgress();
      setIsAnimating(false);
    }, 400);
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const animate = () => {
      if (!isPlaying || showDetails || showHome) return;
      if (startTime.current === 0) startTime.current = Date.now() - elapsedTime.current;

      const now = Date.now();
      elapsedTime.current = now - startTime.current;
      const currentProgress = Math.min((elapsedTime.current / SLIDE_DURATION) * 100, 100);
      setProgress(currentProgress);

      if (elapsedTime.current >= SLIDE_DURATION) {
        handleNext();
      } else {
        progressInterval.current = requestAnimationFrame(animate);
      }
    };

    if (isPlaying && !showDetails && !showHome) {
      progressInterval.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(progressInterval.current);
      startTime.current = 0;
    }

    return () => cancelAnimationFrame(progressInterval.current);
  }, [isPlaying, currentIndex, showDetails, showHome]);

  const startPresentation = () => {
    setShowHome(false);
    resetProgress();
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log("Error attempting to enable fullscreen:", err);
      });
    }
  };

  const exitPresentation = () => {
    setShowHome(true);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.log("Error attempting to exit fullscreen:", err);
      });
    }
  };

  if (showHome) {
    return (
      <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-emerald-100 flex flex-col items-center py-16 px-4">
        {/* Navbar / Top */}
        <div className="flex justify-between items-center w-full max-w-6xl mx-auto mb-10 mt-8 px-4">
          <div className="hidden md:block w-40"></div> {/* Spacer for centering on desktop */}
          <div className="flex items-center justify-center gap-2 border border-emerald-500/30 bg-white text-emerald-800 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            NATIONAL HEALTHCARE INFRASTRUCTURE
          </div>
          <div className="w-40 flex justify-end">
            <Link
              href="/signin"
              className="bg-[#007b46] hover:bg-[#006035] text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-md hover:shadow-emerald-500/30 flex items-center gap-2 whitespace-nowrap"
            >
              <Lock className="w-4 h-4" /> Staff Signin
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center max-w-4xl mx-auto mb-20 px-4">
          <h1 className="text-5xl md:text-[5rem] font-black text-[#005a30] tracking-tighter leading-[0.9] mb-8 font-display">
            Unifying Health Data for<br />a Healthier Zimbabwe.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto font-medium">
            The leading National EMR platform bridging the gap between clinical excellence and digital sovereignty. Secure, lightweight, and built for national scale.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="bg-[#007b46] hover:bg-[#006035] text-white px-8 py-3.5 rounded-lg font-bold transition-all shadow-lg hover:shadow-emerald-500/30 w-full sm:w-auto flex items-center justify-center"
            >
              Get Started <ChevronRight className="inline-block w-4 h-4 ml-1" />
            </Link>
            <button
              onClick={startPresentation}
              className="bg-white hover:bg-slate-50 text-slate-800 px-8 py-3.5 rounded-lg font-bold border border-slate-200 transition-all shadow-sm w-full sm:w-auto"
            >
              BACKED BY RESEARCH
            </button>
            <Link
              href="/pitch-deck"
              className="bg-emerald-50 hover:bg-emerald-100 text-[#007b46] px-8 py-3.5 rounded-lg font-bold border border-emerald-200 transition-all shadow-sm w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Presentation className="w-5 h-5" /> Pitch Deck
            </Link>
          </div>
        </div>

        {/* Problem / Solution Cards */}
        <div className="flex flex-col md:flex-row gap-6 max-w-4xl w-full mx-auto mb-28 px-4">
          <div className="bg-white border-l-4 border-red-500 border-y border-r border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] p-8 md:p-10 rounded-2xl flex-1">
            <div className="flex items-center gap-2 text-red-500 font-bold mb-4 uppercase tracking-widest text-xs">
              <AlertCircle className="w-4 h-4" /> The Problem
            </div>
            <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed">
              Fragmented paper records lead to data loss, medication errors, and slow clinical decision-making across healthcare tiers.
            </p>
          </div>
          <div className="bg-white border-l-4 border-emerald-500 border-y border-r border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] p-8 md:p-10 rounded-2xl flex-1">
            <div className="flex items-center gap-2 text-[#007b46] font-bold mb-4 uppercase tracking-widest text-xs">
              <ShieldCheck className="w-4 h-4" /> The Solution
            </div>
            <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed">
              A federated, role-aware EMR that synchronizes local clinical workflows with national health metrics in real-time.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-800">Everything you need for <span className="text-[#007b46] font-black text-3xl">Modern Care</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-32 px-4">
          {[
            { icon: <BookOpen />, title: "Digital Registry", desc: "Longitudinal patient histories at your fingertips." },
            { icon: <Activity />, title: "Remote Monitoring", desc: "Sync vitals from mobile devices directly to the clinic." },
            { icon: <Zap />, title: "Rapid Ingestion", desc: "Low-bandwidth optimized data entry for busy wards." },
            { icon: <Users />, title: "Role Isolation", desc: "Granular access for Doctors, Nurses, and Pharmacists." },
            { icon: <Globe />, title: "National Sync", desc: "Automated reporting to central health registries." },
            { icon: <Shield />, title: "Encrypted Cloud", desc: "Top-tier security for sensitive medical attachments." }
          ].map((feature, i) => (
            <div key={i} className="bg-white border border-slate-100 p-8 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col items-center text-center transition hover:shadow-xl hover:border-emerald-100 cursor-default">
              <div className="text-[#007b46] mb-5">
                {React.cloneElement(feature.icon, { className: "w-6 h-6" })}
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Bottom */}
        <div className="w-full max-w-3xl mx-auto bg-white rounded-[3rem] p-12 md:p-16 text-center border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-6 tracking-tight">Ready to modernize your faculty?</h2>
          <p className="text-slate-500 mb-10 max-w-md mx-auto text-sm leading-relaxed">
            Join 50+ institutions already leveraging E-ChroniBook for clinical data sovereignty.
          </p>
          <Link
            href="/register"
            className="inline-block bg-[#007b46] hover:bg-[#006035] text-white px-8 py-3.5 rounded-lg font-bold shadow-lg shadow-emerald-500/20 transition-transform hover:scale-105"
          >
            Register Your Institution Now
          </Link>
        </div>

        <div className="text-center text-[10px] text-slate-400 mt-auto pb-4 uppercase tracking-widest font-bold">
          &copy; 2026 E-ChroniBook (Pvt) Ltd. All rights reserved. | Built for the Ministry of Health.
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@900&family=Inter:wght@400;500;700;900&display=swap');
          .font-display { font-family: 'Urbanist', sans-serif; }
          .font-sans { font-family: 'Inter', sans-serif; }
        `}</style>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-4 overflow-hidden relative font-sans selection:bg-emerald-200 selection:text-emerald-900">

      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-emerald-100/50 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div
        className={`w-full max-w-7xl h-[760px] bg-white border border-slate-200 rounded-[48px] overflow-hidden relative shadow-[0_20px_80px_-20px_rgba(0,0,0,0.1)] flex flex-col cursor-pointer transition-all duration-700 ${!isPlaying ? 'ring-4 ring-emerald-500/20' : ''}`}
        onClick={() => togglePlay()}
      >

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 z-50">
          <div
            className="h-full bg-[#007b46] shadow-[0_0_10px_rgba(0,123,70,0.4)] transition-all duration-100 linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Navigation back to home */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            exitPresentation();
          }}
          className="absolute top-8 left-8 z-50 flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-xs uppercase tracking-widest transition-colors bg-white/80 p-3 rounded-full shadow-sm border border-slate-100 backdrop-blur-md"
        >
          <X className="w-4 h-4" /> Exit
        </button>

        {/* Status Indicator */}
        {!isPlaying && !showDetails && (
          <div className="absolute top-8 right-8 z-50 flex items-center gap-3 bg-emerald-100 text-[#007b46] px-6 py-3 rounded-full font-black animate-bounce text-xs uppercase tracking-widest border border-emerald-200 shadow-sm">
            <Pause size={18} fill="currentColor" /> Paused
          </div>
        )}

        {/* Slide Content */}
        <div className={`flex-grow p-12 lg:p-24 flex flex-col justify-center relative transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>

          {currentSlide.layout === "center" ? (
            <div className="text-center flex flex-col items-center max-w-4xl mx-auto">
              <div className={`mb-12 p-10 bg-white border rounded-[48px] shadow-sm transition-all duration-1000 ${currentSlide.color} ${currentSlide.bg} animate-float`}>
                {currentSlide.icon}
              </div>
              <h1 className="text-6xl lg:text-7xl font-black font-display mb-8 tracking-tighter leading-none text-slate-800">
                {currentSlide.title.includes("E-Chroni") ? (
                  <>E-Chroni<span className="text-[#007b46]">Book</span></>
                ) : currentSlide.title}
              </h1>
              <h2 className="text-2xl lg:text-3xl text-emerald-600 font-black mb-12 uppercase tracking-[0.4em]">
                {currentSlide.subtitle}
              </h2>
              <p className="text-xl lg:text-2xl text-slate-600 leading-relaxed font-medium mb-16 max-w-3xl">
                {currentSlide.summary}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div>
                <h1 className="text-5xl lg:text-6xl font-black mb-8 tracking-tighter leading-tight text-slate-800">
                  {currentSlide.title}
                </h1>
                <h2 className="text-xl lg:text-2xl text-emerald-600 font-black mb-10 uppercase tracking-[0.3em]">
                  {currentSlide.subtitle}
                </h2>
                <div className="bg-slate-50 border-l-4 border-emerald-500 p-12 rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-xl lg:text-2xl text-slate-700 leading-relaxed font-medium">
                    {currentSlide.summary}
                  </p>
                </div>
              </div>
              <div className="flex justify-center relative">
                <div className="absolute inset-0 bg-emerald-100 rounded-full blur-[120px] animate-pulse" />
                <div className={`relative p-16 bg-white border rounded-[64px] shadow-xl transition-all duration-1000 ${currentSlide.color} ${currentSlide.bg} animate-float`}>
                  {React.cloneElement(currentSlide.icon, { className: "w-32 h-32 lg:w-56 lg:h-56" })}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Evidence Trigger & Next Slide Button */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); setShowDetails(true); }}
              className="group flex items-center gap-4 bg-white hover:bg-slate-50 text-slate-800 px-10 py-5 rounded-full border border-slate-200 transition-all duration-300 shadow-sm active:scale-95 w-full sm:w-auto text-center justify-center"
            >
              <Info size={22} className="text-emerald-600" />
              <span className="font-black tracking-[0.2em] uppercase text-xs">View Research Evidence</span>
            </button>

            <button
              onClick={handleNext}
              className="group flex items-center gap-4 bg-[#007b46] hover:bg-[#006035] text-white px-10 py-5 rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95 w-full sm:w-auto text-center justify-center"
            >
              <span className="font-black tracking-[0.2em] uppercase text-xs">Next Slide</span>
              <ArrowRight size={22} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Master Navigation Bar */}
        <div className="p-10 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-6">
            <button
              onClick={handlePrev}
              className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-white transition-all bg-white shadow-sm"
            >
              <ChevronLeft size={28} />
            </button>

            <button
              onClick={togglePlay}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg active:scale-90 ${isPlaying ? 'bg-white text-[#007b46] border border-slate-200' : 'bg-[#007b46] text-white shadow-emerald-500/30 border-transparent'}`}
            >
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>

            <button
              onClick={handleNext}
              className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-white transition-all bg-white shadow-sm"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-full border border-slate-200 shadow-sm">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Research Data</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <span className="text-xl font-black font-mono text-slate-800">
              {currentIndex + 1 < 10 ? `0${currentIndex + 1}` : currentIndex + 1}
            </span>
            <span className="text-slate-300 text-sm font-bold">/</span>
            <span className="text-sm font-bold text-slate-400">{slides.length}</span>
          </div>
        </div>
      </div>

      {/* Detail Overlay Modal */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 transition-all duration-500 ${showDetails ? 'opacity-100 pointer-events-auto backdrop-blur-sm' : 'opacity-0 pointer-events-none backdrop-blur-none'}`}>
        <div className="absolute inset-0 bg-slate-800/40" onClick={() => setShowDetails(false)} />

        <div className={`relative w-full max-w-5xl bg-white border border-slate-200 rounded-[56px] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500 transform ${showDetails ? 'translate-y-0 scale-100' : 'translate-y-20 scale-90'}`}>

          <div className="p-12 lg:p-20">
            <div className="flex items-start justify-between mb-12">
              <div className="flex items-center gap-8">
                <div className={`p-6 bg-white border rounded-3xl ${currentSlide.color} ${currentSlide.bg} shadow-sm`}>
                  {React.cloneElement(currentSlide.icon, { className: "w-12 h-12" })}
                </div>
                <div>
                  <h3 className="text-4xl lg:text-5xl font-black tracking-tighter mb-2 text-slate-800">{currentSlide.title}</h3>
                  <p className="text-emerald-600 font-black uppercase tracking-[0.3em] text-xs">Statistical Context & Evidence</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="w-16 h-16 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center transition-all group border border-slate-200"
              >
                <X size={32} className="group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-12">
              <div className="bg-emerald-50/50 p-12 rounded-[40px] border border-emerald-100 relative overflow-hidden group">
                <div className="absolute -right-20 -bottom-20 opacity-[0.03] transition-transform group-hover:scale-110 duration-1000">
                  {React.cloneElement(currentSlide.icon, { className: "w-96 h-96", fill: "currentColor" })}
                </div>
                <h4 className="text-emerald-700 font-black uppercase tracking-[0.4em] text-[10px] mb-8 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                  Detailed Research Analysis
                </h4>
                <p className="text-2xl text-slate-700 leading-[1.6] font-medium relative z-10">
                  {currentSlide.details}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['Evidence-Based', 'Research Driven', 'Systemic Focus', 'Life Saving'].map((tag) => (
                  <div key={tag} className="bg-white border border-slate-200 p-6 rounded-3xl text-center shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">{tag}</p>
                    <p className="text-xs text-slate-400 font-bold">Signal Verified</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowDetails(false)}
            className="w-full bg-[#007b46] hover:bg-[#006035] text-white font-black py-8 uppercase tracking-[0.5em] text-sm transition-all flex items-center justify-center gap-4"
          >
            Return to Presentation
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@900&family=Inter:wght@400;500;700&display=swap');
        
        .font-display { font-family: 'Urbanist', sans-serif; }
        .font-sans { font-family: 'Inter', sans-serif; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(3deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .linear { transition-timing-function: linear; }

        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
