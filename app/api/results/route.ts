import { NextResponse } from "next/server";


import Student from "@/models/Student";
import Mark from "@/models/Mark";
import Result from "@/models/Result";

import { connectDB } from "@/lib/mongodb";

function grade(p: number) {
  if (p >= 90) return "A+";
  if (p >= 80) return "A";
  if (p >= 70) return "B";
  if (p >= 60) return "C";
  if (p >= 40) return "D";
  return "F";
}

export async function GET() {
  await connectDB();

  const students = await Student.find().sort({ roll: 1 });

  const results = await Promise.all(
    students.map(async (student) => {
      const marks = await Mark.find({
        studentId: student.studentId,
      });

      const total = marks.reduce((a, b) => a + b.marks, 0);

      const percentage = marks.length
        ? (total / (marks.length * 100)) * 100
        : 0;

      return {
        student,
        subjects: marks,
        total,
        percentage: percentage.toFixed(2),
        grade: grade(percentage),
      };
    }),
  );

  return NextResponse.json(results);
}
