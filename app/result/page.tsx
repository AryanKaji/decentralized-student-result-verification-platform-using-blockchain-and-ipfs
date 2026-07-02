"use client";

import { useState } from "react";
import {
    ShieldCheck,
    ShieldAlert,
    GraduationCap,
    Search,
    User,
    Award,
    ExternalLink,
    Download,
    CheckCircle2,
    Hash,
    Building2
} from "lucide-react";

export default function ResultPage() {
    const [studentId, setStudentId] = useState("");
    const [result, setResult] = useState<any>(null);

    async function search() {
        const res = await fetch(`/api/results/${studentId}`);
        if (!res.ok) {
            alert("Result not found");
            return;
        }

        setResult(await res.json());
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col">
            {/* Academic Navigation Header */}
            <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
                <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-slate-900 tracking-tight">ABC University</h1>
                            <p className="text-xs text-indigo-600 font-semibold tracking-wider uppercase">Registry & Verification</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Blockchain Secured
                    </div>
                </div>
            </header>

            {/* Main Portal Content */}
            <main className="flex-1 mx-auto max-w-4xl w-full px-6 py-12">
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Academic Transcript Verification
                    </h2>
                    <p className="text-slate-500 mt-3 text-sm leading-relaxed">
                        Verify the authenticity of student credentials published on the Sepolia testnet. Enter a valid student ID to query the official blockchain registry.
                    </p>
                </div>

                {/* Search Bar Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md max-w-2xl mx-auto mb-8 transition hover:shadow-lg">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                            <input
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                placeholder="Enter Student ID (e.g. ST002)"
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium transition placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white"
                            />
                        </div>
                        <button
                            onClick={search}
                            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-7 py-3 rounded-xl text-sm font-semibold transition duration-150 shadow-md shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Search className="h-4 w-4" />
                            Verify Record
                        </button>
                    </div>
                </div>

                {/* Transcript / Verification Output Card */}
                {result && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Certificate Header Banner */}
                        <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                    <Award className="h-5 w-5" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Official Transcript</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                                    Academic Record
                                </h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-medium">Verification Status:</span>
                                {result.tampered ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
                                        <ShieldAlert className="h-3.5 w-3.5" />
                                        Mismatched
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 animate-pulse">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        Blockchain Verified
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Student Information Details */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mb-8">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 text-slate-400" />
                                        Student Name
                                    </p>
                                    <p className="text-base font-bold text-slate-800">{result.student.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Hash className="h-3.5 w-3.5 text-slate-400" />
                                        Student ID
                                    </p>
                                    <p className="text-base font-mono font-bold text-indigo-600">{result.student.studentId}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                        Class
                                    </p>
                                    <p className="text-base font-bold text-slate-800">{result.student.class}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Hash className="h-3.5 w-3.5 text-slate-400" />
                                        Roll Number
                                    </p>
                                    <p className="text-base font-bold text-slate-800">{result.student.roll}</p>
                                </div>
                            </div>

                            {/* Transcript Table */}
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                                Subject Assessment
                            </h4>
                            <div className="border border-slate-100 rounded-xl overflow-hidden mb-8">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-left">
                                            <th className="py-3 px-4">Subject</th>
                                            <th className="py-3 px-4 text-right">Marks (out of 100)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {result.published.subjects.map((s: any) => (
                                            <tr key={s.subject} className="hover:bg-slate-50/40 transition">
                                                <td className="py-3 px-4 font-semibold text-slate-700">{s.subject}</td>
                                                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{s.marks}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <div className="text-center sm:text-left sm:pl-4">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Marks</p>
                                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{result.published.total}</p>
                                </div>
                                <div className="text-center border-y sm:border-y-0 sm:border-x border-slate-200 py-3 sm:py-0">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Percentage</p>
                                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{result.published.percentage.toFixed(2)}%</p>
                                </div>
                                <div className="text-center sm:text-right sm:pr-4">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Grade Earned</p>
                                    <p className="text-2xl font-extrabold text-indigo-600 mt-1">{result.published.grade}</p>
                                </div>
                            </div>

                            {/* Verification Footnote and Action Bar */}
                            <div className="mt-8 border-t border-slate-150 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    {result.tampered ? (
                                        <div className="flex gap-3">
                                            <ShieldAlert className="h-6 w-6 text-rose-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-bold text-rose-700">
                                                    Tampering Detected
                                                </p>
                                                <p className="text-xs text-rose-500 leading-relaxed mt-0.5">
                                                    Warning: The database grades differ from the records verified on the blockchain.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3">
                                            <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">
                                                    Blockchain Integrity Verified
                                                </p>
                                                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                                                    Secure hash match validated on Ethereum Sepolia ledger.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {result.published.generatedBy && (
                                        <p className="text-[11px] text-slate-400 font-medium mt-3.5 flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            Authorized Publisher: <span className="font-mono text-slate-500">{result.published.generatedBy}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <a
                                        href={result.published.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Download PDF
                                    </a>

                                    {result.published.txHash && (
                                        <a
                                            href={`https://sepolia.etherscan.io/tx/${result.published.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-5 py-3 rounded-xl text-xs font-bold transition border border-indigo-100/50 cursor-pointer"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View Transaction
                                        </a>
                                    )}

                                    <a
                                        href={`/verify/${result.student.studentId}`}
                                        className="bg-emerald-600 text-white px-5 py-2 rounded-lg"
                                    >
                                        Verify History
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Academic Footer */}
            <footer className="bg-white border-t border-slate-200/80 py-8">
                <div className="mx-auto max-w-5xl px-6 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                        © {new Date().getFullYear()} ABC University. All rights reserved.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
                        Powered by Decentralized Student Result Verification Platform & IPFS
                    </p>
                </div>
            </footer>
        </div>
    );
}
