"use client";

import { useEffect, useState } from "react";
import { 
  GraduationCap, 
  Save, 
  Pencil, 
  Trash2, 
  Users, 
  CheckCircle, 
  TrendingUp, 
  Database,
  AlertTriangle
} from "lucide-react";

export default function Dashboard() {
  const [rows, setRows] = useState<any[]>([]);
  const [confirmType, setConfirmType] = useState<"update" | "delete" | null>(
    null,
  );
  const [selectedRow, setSelectedRow] = useState<any>(null);

  async function load() {
    const students = await fetch("/api/students").then((r) => r.json());
    const marks = await fetch("/api/marks").then((r) => r.json());

    const merged = students.map((student: any) => {
      const mark = marks.find((m: any) => m.studentId === student.studentId);

      return {
        ...student,
        markId: mark?._id || null,
        marks: mark?.marks ?? "",
      };
    });

    setRows(merged);
  }

  useEffect(() => {
    load();
  }, []);

  function changeMarks(studentId: string, value: string) {
    const num = Number(value);
    if (num > 100) return;

    setRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, marks: value } : r)),
    );
  }

  async function save(row: any) {
    if (row.marks === "") {
      return alert("Enter marks");
    }

    if (!row.markId) {
      await fetch("/api/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: row.studentId,
          marks: Number(row.marks),
        }),
      });

      load();
      return;
    }

    setSelectedRow(row);
    setConfirmType("update");
  }

  async function confirmAction() {
    if (!selectedRow) return;

    if (confirmType === "update") {
      await fetch("/api/marks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedRow.markId,
          marks: Number(selectedRow.marks),
        }),
      });
    }

    if (confirmType === "delete") {
      await fetch("/api/marks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedRow.markId }),
      });
    }

    setConfirmType(null);
    setSelectedRow(null);
    load();
  }

  // Calculate statistics
  const totalStudents = rows.length;
  const submittedRecords = rows.filter((r) => r.markId !== null && r.marks !== "").length;
  const rowsWithMarks = rows.filter((r) => r.markId !== null && r.marks !== "");
  const classAvg = rowsWithMarks.length > 0 
    ? (rowsWithMarks.reduce((sum, r) => sum + Number(r.marks), 0) / rowsWithMarks.length).toFixed(1) 
    : "N/A";

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 antialiased font-sans flex flex-col">
      <div className="flex-1 mx-auto max-w-6xl w-full px-6 py-8">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assigned Subjects Ledger</h1>
            <p className="text-sm text-slate-500 mt-1">
              Input and modify external examination results. Keep records up-to-date prior to administrator blockchain publishing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200/80 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 shadow-xs flex items-center gap-2">
              <Database className="h-4 w-4 text-indigo-500" />
              <span>Session: <strong className="text-indigo-600 font-bold">Active</strong></span>
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
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Students Assigned</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalStudents}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Marks Submitted</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {submittedRecords} <span className="text-xs font-normal text-slate-400">/ {totalStudents}</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject Average</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{classAvg === "N/A" ? "N/A" : `${classAvg}%`}</p>
            </div>
          </div>
        </div>

        {/* Grades Registry Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-base">Grading Assessment Form</h2>
            <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-1 rounded-md">
              Subject Specific Entries
            </span>
          </div>

          {totalStudents === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <GraduationCap className="h-10 w-10 mx-auto mb-3 text-slate-300 animate-pulse" />
              <p className="text-sm font-semibold">No assigned student records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-xs font-semibold">
                  <tr>
                    <th className="py-4 px-6">Student ID</th>
                    <th className="py-4 px-6">Roll No</th>
                    <th className="py-4 px-6">Student Name</th>
                    <th className="py-4 px-6">Class</th>
                    <th className="py-4 px-6">Obtain Marks (0-100)</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.studentId} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 font-mono font-bold text-slate-500">{row.studentId}</td>
                      <td className="py-4 px-6 font-semibold text-indigo-600">{row.roll}</td>
                      <td className="py-4 px-6 font-semibold text-slate-800">{row.name}</td>
                      <td className="py-4 px-6 text-slate-500 font-medium">{row.class}</td>
                      <td className="py-4 px-6">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={row.marks}
                          onChange={(e) =>
                            changeMarks(row.studentId, e.target.value)
                          }
                          placeholder="0-100"
                          className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold transition text-center focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-2.5">
                          <button
                            onClick={() => save(row)}
                            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition duration-150 cursor-pointer shadow-xs hover:shadow-md
                              ${
                                row.markId
                                  ? "bg-amber-500 hover:bg-amber-600 active:bg-amber-700"
                                  : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"
                              }
                            `}
                          >
                            {row.markId ? (
                              <>
                                <Pencil size={14} />
                                Update
                              </>
                            ) : (
                              <>
                                <Save size={14} />
                                Save
                              </>
                            )}
                          </button>

                          {row.markId && (
                            <button
                              onClick={() => {
                                setSelectedRow(row);
                                setConfirmType("delete");
                              }}
                              className="flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 px-4 py-2.5 text-xs font-bold transition duration-150 cursor-pointer shadow-xs"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-500 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {confirmType === "update" ? "Confirm Grade Update?" : "Delete Mark Record?"}
              </h2>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed">
              {confirmType === "update"
                ? `Confirm modifying the score for ${selectedRow?.name || "the student"} to ${selectedRow?.marks || "0"} marks? This action is reversible but updates existing records.`
                : `Are you sure you want to permanently delete the score record for ${selectedRow?.name || "this student"}? This record will be blank.`}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmType(null);
                  setSelectedRow(null);
                }}
                className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={confirmAction}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white transition cursor-pointer shadow-xs
                  ${confirmType === "update" ? "bg-amber-500 hover:bg-amber-600 active:bg-amber-700" : "bg-rose-600 hover:bg-rose-700 active:bg-rose-800"}
                `}
              >
                {confirmType === "update" ? "Confirm Update" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
