import { NextResponse } from "next/server";

import Student from "@/models/Student";

import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    const students = await Student.find(
      {},
      {
        _id: 0,
        studentId: 1,
        name: 1,
        class: 1,
        roll: 1,
      },
    )
      .sort({
        class: 1,
        roll: 1,
      })
      .lean();

    return NextResponse.json(students, { status: 200 });
  } catch (err) {
    console.error("Student fetch error:", err);

    return NextResponse.json(
      { error: "Failed to load students" },
      { status: 500 },
    );
  }
}
