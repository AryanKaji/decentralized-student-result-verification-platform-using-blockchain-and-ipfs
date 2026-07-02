import { NextResponse } from "next/server";
import crypto from "crypto";

import { connectDB } from "@/lib/mongodb";
import { contract } from "@/lib/blockchain";

import Student from "@/models/Student";
import Mark from "@/models/Mark";
import Result from "@/models/Result";

function grade(p: number) {
    if (p >= 90) return "A+";
    if (p >= 80) return "A";
    if (p >= 70) return "B";
    if (p >= 60) return "C";
    if (p >= 40) return "D";
    return "F";
}

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

    const published = await Result.findOne({
        studentId,
        isLatest: true,
    });
    if (!published) {
        return NextResponse.json(
            { error: "Result not published" },
            { status: 404 }
        );
    }

    // Current Marks
    const currentMarks = await Mark.find({ studentId });

    const total = currentMarks.reduce((sum, m) => sum + m.marks, 0);

    const percentage =
        currentMarks.length > 0
            ? (total / (currentMarks.length * 100)) * 100
            : 0;

    const finalGrade = grade(percentage);

    // Create fresh hash
    const currentData = JSON.stringify({
        studentId,
        subjects: currentMarks.map((m) => ({
            subject: m.subject,
            marks: m.marks,
        })),
        total,
        percentage,
        grade: finalGrade,
    });

    const currentHash = crypto
        .createHash("sha256")
        .update(currentData)
        .digest("hex");

    // Blockchain
    const blockchain = await contract.getLatestResult(studentId);

    const blockchainPdfHash = blockchain[2];
    const blockchainCid = blockchain[1];

    const databaseChanged =
        total !== published.total ||
        published.subjects.some((oldSub: any) => {
            const latest = currentMarks.find(
                (m: any) => m.subject === oldSub.subject
            );

            return !latest || latest.marks !== oldSub.marks;
        });

    const blockchainChanged =
        blockchainPdfHash.toLowerCase() !== published.pdfHash.toLowerCase() ||
        blockchainCid !== published.ipfsHash;

    const verified =
        !databaseChanged &&
        !blockchainChanged;

    return NextResponse.json({
        verified,

        databaseChanged,
        blockchainChanged,

        currentHash,
        publishedHash: published.pdfHash,
        blockchainHash: blockchainPdfHash,

        currentCid: published.ipfsHash,
        blockchainCid,

        publishedAt: published.createdAt,

        current: {
            subjects: currentMarks,
            total,
            percentage,
            grade: finalGrade,
        },

        published,
    });
}
