"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { 
  FileText, 
  Database,
  Users,
  Award,
  TrendingUp,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  X
} from "lucide-react";

export default function Admin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [uploadSuccessData, setUploadSuccessData] = useState<any>(null);
  const [copiedCid, setCopiedCid] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);

  const copyToClipboard = async (text: string, type: 'cid' | 'tx') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'cid') {
        setCopiedCid(true);
        setTimeout(() => setCopiedCid(false), 2000);
      } else {
        setCopiedTx(true);
        setTimeout(() => setCopiedTx(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  async function load() {
    const r = await fetch("/api/results");
    setResults(await r.json());
  }

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role === "admin") {
        load();
      } else {
        router.push("/dashboard");
      }
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, router]);

  async function pdf(studentId: string) {
    try {
      setPublishingId(studentId);
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error creating PDF: ${errorData.error || res.statusText}`);
        return;
      }

      const data = await res.json();
      load();
      setUploadSuccessData(data);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setPublishingId(null);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-gray-500">Loading admin panel...</div>
      </div>
    );
  }

  if (status === "authenticated" && session?.user?.role !== "admin") {
    return null;
  }

  if (status === "unauthenticated") {
    return null;
  }

  // Calculate high-level stats
  const totalStudents = results.length;
  const classAvg = totalStudents > 0 
    ? (results.reduce((sum, r) => sum + Number(r.percentage), 0) / totalStudents).toFixed(1) 
    : "0";
  const topScore = totalStudents > 0 
    ? Math.max(...results.map(r => Number(r.total))) 
    : 0;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 antialiased font-sans flex flex-col">
      <Navbar />
      
      <div className="flex-1 mx-auto max-w-5xl w-full px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Control Panel</h1>
            <p className="text-sm text-slate-550 mt-1">
              Manage student marks database, generate cryptographically signed PDF transcripts, and publish them to IPFS blockchain registry.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200/80 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 shadow-xs flex items-center gap-2">
              <Database className="h-4 w-4 text-indigo-500" />
              <span>System Status: <strong className="text-emerald-600 font-bold">Online</strong></span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Registered Students</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalStudents}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class Average</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{classAvg}%</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Score</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{topScore} <span className="text-xs font-normal text-slate-400">/ 700</span></p>
            </div>
          </div>
        </div>

        {/* Results Registry Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-base">Student Assessment Database</h2>
            <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-1 rounded-md">
              {totalStudents} Records Loaded
            </span>
          </div>
          
          {totalStudents === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileText className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold">No student records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-450 uppercase tracking-wider text-xs font-semibold">
                  <tr>
                    <th className="py-4 px-6">Roll No</th>
                    <th className="py-4 px-6">Student Name</th>
                    <th className="py-4 px-6 text-center">Total Marks</th>
                    <th className="py-4 px-6 text-center">Percentage</th>
                    <th className="py-4 px-6 text-center">Grade</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((r: any) => (
                    <tr key={r.student.studentId} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 font-mono font-bold text-indigo-600">{r.student.roll}</td>
                      <td className="py-4 px-6 font-semibold text-slate-800">{r.student.name}</td>
                      <td className="py-4 px-6 text-center font-bold text-slate-900">{r.total}</td>
                      <td className="py-4 px-6 text-center font-mono font-semibold text-slate-650">{r.percentage}%</td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {r.grade}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => pdf(r.student.studentId)}
                          disabled={publishingId !== null}
                          className={`bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition duration-150 shadow-xs hover:shadow-md cursor-pointer inline-flex items-center gap-1.5 ${publishingId !== null ? "opacity-55 cursor-not-allowed" : ""}`}
                        >
                          {publishingId === r.student.studentId ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Publishing...
                            </>
                          ) : (
                            <>
                              <FileText className="h-3.5 w-3.5" />
                              Publish to IPFS
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upload Success Modal */}
      {uploadSuccessData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full shadow-2xl p-6 relative overflow-hidden flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setUploadSuccessData(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Success Icon Header */}
            <div className="flex flex-col items-center text-center mt-2">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-4">Transcript Published!</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">
                The transcript has been successfully signed, stored on IPFS, and registered on-chain.
              </p>
            </div>

            {/* Student & Results Details */}
            {(() => {
              const studentInfo = results.find(
                (r) => r.student.studentId === uploadSuccessData.studentId
              )?.student;
              return (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 border-b border-slate-200/60 pb-3">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Student Name</p>
                      <p className="text-slate-800 text-sm font-bold mt-0.5">{studentInfo?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Roll Number / ID</p>
                      <p className="text-slate-800 text-sm font-bold mt-0.5">{studentInfo?.roll || "N/A"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Percentage</p>
                      <p className="text-slate-800 text-sm font-bold mt-0.5">{uploadSuccessData.percentage?.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Final Grade</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 w-fit">
                        {uploadSuccessData.grade}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* IPFS & Tx Info */}
            <div className="flex flex-col gap-3 text-xs">
              {/* IPFS Hash */}
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-slate-500">IPFS Hash (CID)</span>
                <div className="flex items-center gap-2 bg-slate-100/80 px-3 py-2 rounded-xl border border-slate-200/40">
                  <span className="font-mono text-slate-700 truncate flex-1">{uploadSuccessData.cid}</span>
                  <button
                    onClick={() => copyToClipboard(uploadSuccessData.cid, 'cid')}
                    className="text-slate-500 hover:text-indigo-600 p-1 rounded-md hover:bg-slate-200 transition cursor-pointer flex items-center gap-1 font-semibold text-[10px]"
                  >
                    {copiedCid ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Transaction Hash */}
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-slate-500">Transaction Hash</span>
                <div className="flex items-center gap-2 bg-slate-100/80 px-3 py-2 rounded-xl border border-slate-200/40">
                  <span className="font-mono text-slate-700 truncate flex-1">{uploadSuccessData.txHash}</span>
                  <button
                    onClick={() => copyToClipboard(uploadSuccessData.txHash, 'tx')}
                    className="text-slate-500 hover:text-indigo-600 p-1 rounded-md hover:bg-slate-200 transition cursor-pointer flex items-center gap-1 font-semibold text-[10px]"
                  >
                    {copiedTx ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-2 border-t border-slate-100 pt-4">
              <a
                href={uploadSuccessData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-center py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="h-4 w-4" />
                View PDF
              </a>
              <button
                onClick={() => setUploadSuccessData(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition duration-150 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
