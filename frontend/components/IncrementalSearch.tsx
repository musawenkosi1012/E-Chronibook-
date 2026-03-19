"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, User, SearchIcon } from 'lucide-react';

const API = "http://127.0.0.1:8000";

interface Patient {
    id: number;
    national_id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
}

interface Props {
    onSelect: (patient: Patient) => void;
    placeholder?: string;
    token: string;
}

// Custom debounce to avoid dependencies
function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export default function IncrementalPatientSearch({ onSelect, placeholder = "Search by Name, National ID or Patient ID...", token }: Props) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const performSearch = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API}/api/patients/search?q=${encodeURIComponent(searchTerm)}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setResults(data);
                setShowResults(true);
            }
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearch = useCallback(
        debounce((searchTerm: string) => performSearch(searchTerm), 300),
        [token]
    );

    useEffect(() => {
        debouncedSearch(query);
    }, [query, debouncedSearch]);

    return (
        <div className="relative w-full">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm font-medium text-slate-700"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim() && setShowResults(true)}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    {loading ? (
                        <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" />
                    ) : (
                        <div className="px-2 py-1 bg-emerald-50 rounded-lg text-[9px] font-black text-emerald-600 uppercase tracking-widest shadow-sm">
                            Live
                        </div>
                    )}
                </div>
            </div>

            {showResults && query.trim() && (
                <div className="absolute z-[100] mt-3 w-full bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-2">
                    {results.length > 0 ? (
                        <ul className="max-h-80 overflow-y-auto space-y-1">
                            {results.map((patient) => (
                                <li key={patient.id}>
                                    <button
                                        onClick={() => {
                                            onSelect(patient);
                                            setShowResults(false);
                                            setQuery("");
                                        }}
                                        className="w-full text-left px-5 py-4 hover:bg-emerald-50 rounded-2xl transition-all flex items-center gap-5 group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-all shadow-sm">
                                            <User className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-800 truncate uppercase tracking-tight">
                                                {patient.first_name} {patient.last_name}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">NAT ID: {patient.national_id || "NONE"}</span>
                                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">PLATFORM ID: #{patient.id}</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-600 transition-all">
                                                <SearchIcon className="h-4 w-4 text-slate-300 group-hover:text-white" />
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : !loading && (
                        <div className="px-6 py-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <SearchIcon className="h-8 w-8 text-slate-200" />
                            </div>
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Matches Found</p>
                            <p className="text-xs text-slate-400 mt-2">Try searching by National ID for exact match</p>
                        </div>
                    )}
                    <div className="bg-slate-50/50 px-6 py-3 border-t border-slate-100 mt-2 rounded-b-[1.8rem] flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Zimbabwe MoHCC National EMR</span>
                        <button onClick={() => setShowResults(false)} className="text-[10px] font-black text-emerald-600 uppercase hover:text-emerald-800 transition-colors">Dismiss</button>
                    </div>
                </div>
            )}

            {showResults && (
                <div
                    className="fixed inset-0 z-[90]"
                    onClick={() => setShowResults(false)}
                />
            )}
        </div>
    );
}
