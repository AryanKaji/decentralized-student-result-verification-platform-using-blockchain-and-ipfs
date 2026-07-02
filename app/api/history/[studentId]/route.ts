import { NextResponse } from "next/server";

import Result from "@/models/Result";
import { connectDB } from "@/lib/mongodb";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ studentId: string }> }
) {
    await connectDB();

    const { studentId } = await params;

    const history = await Result.find({ studentId })
        .sort({ version: -1 });

    return NextResponse.json(history);
}
