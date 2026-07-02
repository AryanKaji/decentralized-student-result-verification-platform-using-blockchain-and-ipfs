import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";

import User from "@/models/User";
import Mark from "@/models/Mark";

export async function GET() {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json([], {
      status: 401,
    });
  }

  const teacher = await User.findOne({ email: session.user?.email });
  if (!teacher) {
    return NextResponse.json([], {
      status: 404,
    });
  }

  const marks = await Mark.find({ subject: teacher.subject }).sort({
    studentId: 1,
  });

  return NextResponse.json(marks);
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.studentId) {
      return NextResponse.json({ error: "Select a student" }, { status: 400 });
    }

    const marks = Number(body.marks);
    if (isNaN(marks) || marks < 0 || marks > 100) {
      return NextResponse.json(
        { error: "Marks must be between 0 and 100" },
        { status: 400 },
      );
    }

    const teacher = await User.findOne({ email: session.user?.email });
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const data = await Mark.create({
      studentId: body.studentId,
      marks,
      subject: teacher.subject,
      teacher: teacher.email,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.log(err);

    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Marks already submitted for this student" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to save marks" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  const body = await req.json();

  await connectDB();

  await Mark.findByIdAndUpdate(body.id, { marks: body.marks });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const body = await req.json();

  await connectDB();

  await Mark.findByIdAndDelete(body.id);

  return NextResponse.json({ ok: true });
}
