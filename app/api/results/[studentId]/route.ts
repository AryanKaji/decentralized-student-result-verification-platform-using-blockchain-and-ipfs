import { NextResponse } from "next/server";

import Student from "@/models/Student";
import Result from "@/models/Result";
import Mark from "@/models/Mark";

import { connectDB } from "@/lib/mongodb";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ studentId: string }> }
) {
    await connectDB();
    const { studentId } = await params;

    const student = await Student.findOne({ studentId });
    if (!student) {
        return NextResponse.json(
            { error: "Student not found" },
            { status: 404 }
        );
    }

    const result = await Result.findOne({ studentId, isLatest: true });
    if (!result) {
        return NextResponse.json(
            { error: "Result not published" },
            { status: 404 }
        );
    }

    const currentMarks = await Mark.find({ studentId });

    const currentTotal = currentMarks.reduce(
        (sum, mark) => sum + mark.marks,
        0
    );

    const currentPercentage =
        currentMarks.length > 0
            ? (currentTotal / (currentMarks.length * 100)) * 100
            : 0;

    const tampered =
        currentTotal !== result.total ||
        currentMarks.some((mark: any) => {
            const original = result.subjects.find(
                (s: any) => s.subject === mark.subject
            );

            return !original || original.marks !== mark.marks;
        });

    return NextResponse.json({
        student,

        published: result,

        current: {
            subjects: currentMarks,
            total: currentTotal,
            percentage: currentPercentage,
        },

        tampered,
    });
}
