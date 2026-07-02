"use client";

import { useEffect, useState } from "react";
import {
    ShieldCheck,
    ShieldAlert,
    Clock,
    FileText,
    ExternalLink,
    History,
} from "lucide-react";

export default function VerifyPage({
    params,
}: {
    params: Promise<{ studentId: string }>;
}) {
    const [studentId, setStudentId] = useState("");
    const [verify, setVerify] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const p = await params;
            setStudentId(p.studentId);

            const [verifyRes, historyRes] = await Promise.all([
                fetch(`/api/verify/${p.studentId}`),
                fetch(`/api/history/${p.studentId}`),
            ]);

            const verifyData = await verifyRes.json();
            const historyData = await historyRes.json();

            setVerify(verifyData);
            setHistory(historyData);
            setLoading(false);
        }

        load();
    }, [params]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading Verification...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 py-10 px-6">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">
                    Blockchain Verification
                </h1>

                {/* Verification Status */}
                <div className="bg-white rounded-xl shadow p-8">
                    {verify.verified ? (
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="text-green-600 h-12 w-12" />
                            <div>
                                <h2 className="text-2xl font-bold text-green-600">
                                    VERIFIED
                                </h2>

                                <p className="text-slate-600">
                                    Database, Blockchain and IPFS are consistent.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <ShieldAlert className="text-red-600 h-12 w-12" />
                            <div>
                                <h2 className="text-2xl font-bold text-red-600">
                                    VERIFICATION FAILED
                                </h2>

                                <p className="text-slate-600">
                                    The published record has been modified or does
                                    not match the blockchain.
                                </p>
                            </div>
                        </div>
                    )}

                    <hr className="my-8" />

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="border rounded-lg p-5">
                            <h3 className="font-semibold mb-3">
                                Verification Checks
                            </h3>

                            <p>
                                Database :
                                <span
                                    className={`ml-2 font-semibold ${verify.databaseChanged
                                        ? "text-red-600"
                                        : "text-green-600"
                                        }`}
                                >
                                    {verify.databaseChanged
                                        ? "Changed"
                                        : "Verified"}
                                </span>
                            </p>

                            <p className="mt-2">
                                Blockchain :
                                <span
                                    className={`ml-2 font-semibold ${verify.blockchainChanged
                                        ? "text-red-600"
                                        : "text-green-600"
                                        }`}
                                >
                                    {verify.blockchainChanged
                                        ? "Mismatch"
                                        : "Verified"}
                                </span>
                            </p>

                            <p className="mt-2 break-all">
                                Current PDF Hash
                                <br />

                                <span className="text-xs font-mono">
                                    {verify.currentHash}
                                </span>
                            </p>

                            <p className="mt-4 break-all">
                                Blockchain Hash
                                <br />

                                <span className="text-xs font-mono">
                                    {verify.blockchainHash}
                                </span>
                            </p>
                        </div>

                        <div className="border rounded-lg p-5">
                            <h3 className="font-semibold mb-3">
                                Latest Published Version
                            </h3>

                            <p>
                                Version :
                                <strong className="ml-2">
                                    {verify.published.version}
                                </strong>
                            </p>

                            <p className="mt-2">
                                Grade :
                                <strong className="ml-2">
                                    {verify.published.grade}
                                </strong>
                            </p>

                            <p className="mt-2">
                                Total :
                                <strong className="ml-2">
                                    {verify.published.total}
                                </strong>
                            </p>

                            <p className="mt-2">
                                Uploaded By :
                                <strong className="ml-2">
                                    {verify.published.generatedBy}
                                </strong>
                            </p>

                            <p className="mt-2 flex items-center gap-2">
                                <Clock size={16} />

                                {new Date(
                                    verify.published.createdAt
                                ).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Version Timeline */}
                <div className="bg-white rounded-xl shadow mt-8 p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <History className="text-indigo-600" />
                        <h2 className="text-2xl font-bold">
                            Blockchain Audit Timeline
                        </h2>
                    </div>

                    <div className="relative border-l-4 border-indigo-300 ml-5">
                        {history.map((item, index) => (
                            <div
                                key={item._id}
                                className="relative ml-8 mb-10"
                            >
                                {/* Timeline Dot */}
                                <div
                                    className={`absolute -left-[46px] top-2 w-6 h-6 rounded-full border-4 ${item.isLatest
                                        ? "bg-green-600 border-green-200"
                                        : "bg-indigo-600 border-indigo-200"
                                        }`}
                                />

                                {/* Card */}
                                <div
                                    className={`rounded-xl border shadow-sm p-6 ${item.isLatest
                                        ? "border-green-500 bg-green-50"
                                        : "border-slate-200 bg-white"
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold">

                                                Version {item.version}

                                                {item.isLatest && (
                                                    <span className="ml-3 bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                                                        Current Version
                                                    </span>
                                                )}
                                            </h3>

                                            <p className="text-sm text-slate-500 mt-1">
                                                {new Date(item.createdAt).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm text-slate-500">
                                                Uploaded By
                                            </p>

                                            <p className="font-semibold">
                                                {item.generatedBy}
                                            </p>
                                        </div>
                                    </div>

                                    <hr className="my-5" />

                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div>
                                            <p className="font-semibold text-slate-700">
                                                IPFS CID
                                            </p>

                                            <p className="font-mono text-xs break-all text-slate-500 mt-1">
                                                {item.ipfsHash}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="font-semibold text-slate-700">
                                                PDF SHA-256 Hash
                                            </p>

                                            <p className="font-mono text-xs break-all text-slate-500 mt-1">
                                                {item.pdfHash}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid md:grid-cols-3 gap-4">
                                        <div className="rounded-lg bg-slate-100 p-4">
                                            <p className="text-xs text-slate-500">
                                                Total Marks
                                            </p>

                                            <p className="text-2xl font-bold">
                                                {item.total}
                                            </p>
                                        </div>

                                        <div className="rounded-lg bg-slate-100 p-4">
                                            <p className="text-xs text-slate-500">
                                                Percentage
                                            </p>

                                            <p className="text-2xl font-bold">
                                                {item.percentage.toFixed(2)}%
                                            </p>
                                        </div>

                                        <div className="rounded-lg bg-slate-100 p-4">
                                            <p className="text-xs text-slate-500">
                                                Grade
                                            </p>

                                            <p className="text-2xl font-bold">
                                                {item.grade}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <a
                                            href={item.pdfUrl}
                                            target="_blank"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                        >
                                            <FileText size={18} />
                                            Download PDF
                                        </a>

                                        <a
                                            href={`https://sepolia.etherscan.io/tx/${item.txHash}`}
                                            target="_blank"
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                        >
                                            <ExternalLink size={18} />
                                            View Transaction
                                        </a>

                                        <a
                                            href={`https://gateway.pinata.cloud/ipfs/${item.ipfsHash}`}
                                            target="_blank"
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                        >
                                            <ShieldCheck size={18} />
                                            View IPFS
                                        </a>
                                    </div>

                                    {index !== history.length - 1 && (
                                        <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
                                            <p className="font-semibold text-amber-700">
                                                Revision Notice
                                            </p>

                                            <p className="text-sm text-amber-600 mt-1">
                                                A newer version of this result was later published.
                                                This version remains permanently available because
                                                blockchain records are immutable and cannot be
                                                deleted.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
