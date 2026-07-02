require("dotenv").config({
  path: ".env.local",
});

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

import crypto from "crypto";

import {
  PDFDocument,
  StandardFonts,
  rgb,
  PDFFont,
  PDFPage,
} from "pdf-lib";

import { PinataSDK } from "pinata";

import Student from "@/models/Student";
import Mark from "@/models/Mark";
import Result from "@/models/Result";

import { connectDB } from "@/lib/mongodb";
import { contract } from "@/lib/blockchain";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
});

function grade(p: number) {
  if (p >= 90) return "A+";
  if (p >= 80) return "A";
  if (p >= 70) return "B";
  if (p >= 60) return "C";
  if (p >= 40) return "D";
  return "F";
}

// PDF CONSTANTS
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;

const LEFT = 45;
const RIGHT = 550;

const HEADER = rgb(0.12, 0.35, 0.75);
const BLACK = rgb(0, 0, 0);
const GRAY = rgb(0.5, 0.5, 0.5);

// DRAW HELPERS
function text(
  page: PDFPage,
  font: PDFFont,
  value: string,
  x: number,
  y: number,
  size = 11
) {
  page.drawText(value, {
    x,
    y,
    size,
    font,
    color: BLACK,
  });
}

function center(
  page: PDFPage,
  font: PDFFont,
  value: string,
  y: number,
  size = 20
) {
  const width = font.widthOfTextAtSize(value, size);

  page.drawText(value, {
    x: (PAGE_WIDTH - width) / 2,
    y,
    size,
    font,
    color: HEADER,
  });
}

function line(
  page: PDFPage,
  y: number,
  thickness = 1
) {
  page.drawLine({
    start: { x: LEFT, y },
    end: { x: RIGHT, y },
    thickness,
    color: BLACK,
  });
}

function rectangle(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number
) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    borderWidth: 1,
    borderColor: BLACK,
  });
}

// STUDENT INFO ROW
function infoRow(
  page: PDFPage,
  font: PDFFont,
  bold: PDFFont,
  y: number,
  label: string,
  value: string
) {
  rectangle(page, LEFT, y - 18, 500, 22);

  page.drawLine({
    start: { x: 190, y: y - 18 },
    end: { x: 190, y: y + 4 },
    thickness: 1,
  });

  text(page, bold, label, 55, y - 10);
  text(page, font, value, 205, y - 10);
}

// SUBJECT TABLE HEADER
function subjectHeader(
  page: PDFPage,
  bold: PDFFont,
  y: number
) {
  rectangle(page, LEFT, y - 20, 500, 24);

  const cols = [80, 320, 430];

  cols.forEach((x) => {
    page.drawLine({
      start: { x, y: y - 20 },
      end: { x, y: y + 4 },
      thickness: 1,
    });
  });

  text(page, bold, "No", 58, y - 10);
  text(page, bold, "Subject", 100, y - 10);
  text(page, bold, "Marks", 340, y - 10);
  text(page, bold, "Grade", 455, y - 10);
}

// SUBJECT TABLE ROW
function subjectRow(
  page: PDFPage,
  font: PDFFont,
  y: number,
  index: number,
  subject: string,
  marks: number
) {
  rectangle(page, LEFT, y - 20, 500, 24);

  const cols = [80, 320, 430];

  cols.forEach((x) => {
    page.drawLine({
      start: { x, y: y - 20 },
      end: { x, y: y + 4 },
      thickness: 1,
    });
  });

  text(page, font, String(index), 58, y - 10);
  text(page, font, subject, 100, y - 10);
  text(page, font, `${marks}`, 350, y - 10);
  text(page, font, grade(marks), 455, y - 10);
}

// SUMMARY ROW
function summaryRow(
  page: PDFPage,
  font: PDFFont,
  bold: PDFFont,
  y: number,
  label: string,
  value: string
) {
  rectangle(page, LEFT, y - 18, 350, 22);

  page.drawLine({
    start: { x: 300, y: y - 18 },
    end: { x: 300, y: y + 4 },
    thickness: 1,
  });

  text(page, bold, label, 55, y - 10);
  text(page, font, value, 320, y - 10);
}


export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    const { studentId } = await req.json();

    const student = await Student.findOne({ studentId });
    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const marks = await Mark.find({ studentId });
    if (marks.length === 0) {
      return NextResponse.json(
        { error: "No marks found." },
        { status: 400 }
      );
    }

    const total = marks.reduce((a, b) => a + b.marks, 0);
    const percentage =
      marks.length > 0
        ? (total / (marks.length * 100)) * 100
        : 0;

    const g = grade(percentage);

    // CREATE PDF
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    let y = PAGE_HEIGHT - 50;

    // HEADER
    center(page, bold, "ABC UNIVERSITY", y, 22);

    y -= 28;

    center(page, bold, "STUDENT RESULT REPORT", y, 16);

    y -= 18;

    line(page, y);

    y -= 35;

    // STUDENT INFORMATION
    text(page, bold, "Student Information", LEFT, y, 14);

    y -= 25;

    infoRow(page, font, bold, y, "Student Name", student.name);

    y -= 25;

    infoRow(page, font, bold, y, "Student ID", student.studentId);

    y -= 25;

    infoRow(page, font, bold, y, "Class", student.class);

    y -= 25;

    infoRow(page, font, bold, y, "Roll No", String(student.roll));

    y -= 45;

    //  SUBJECT TABLE
    text(page, bold, "Subject Marks", LEFT, y, 14);

    y -= 25;

    subjectHeader(page, bold, y);

    y -= 24;

    marks.forEach((m: any, index: number) => {
      subjectRow(page, font, y, index + 1, m.subject, m.marks);
      y -= 24;
    });

    y -= 30;

    // SUMMARY
    text(page, bold, "Result Summary", LEFT, y, 14);

    y -= 25;

    summaryRow(page, font, bold, y, "Total Marks", String(total));

    y -= 25;

    summaryRow(page, font, bold, y, "Percentage", `${percentage.toFixed(2)} %`);

    y -= 25;

    summaryRow(page, font, bold, y, "Final Grade", g);

    y -= 60;

    //  SIGNATURE SECTION
    page.drawLine({
      start: { x: LEFT, y },
      end: { x: LEFT + 150, y },
      thickness: 1,
      color: BLACK,
    });

    page.drawLine({
      start: { x: RIGHT - 150, y },
      end: { x: RIGHT, y },
      thickness: 1,
      color: BLACK,
    });

    text(page, font, "Teacher Signature", LEFT + 20, y - 18, 10);

    text(page, font, "Principal Signature", RIGHT - 135, y - 18, 10);

    // FOOTER
    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    line(page, 60);

    text(page, font, `Generated on: ${today}`, LEFT, 40, 10);

    text(
      page,
      font,
      `Student ID: ${student.studentId}`,
      250,
      40,
      10
    );

    text(page, font, "Powered by Student Result System", 400, 40, 10);

    // SAVE PDF
    const bytes = await pdf.save();
    const buffer = Buffer.from(bytes);

    const pdfHash = crypto
      .createHash("sha256")
      .update(buffer)
      .digest("hex");

    const file = new File(
      [buffer],
      `${studentId}.pdf`,
      { type: "application/pdf" }
    );

    // UPLOAD TO PINATA
    const uploaded = await pinata.upload.public.file(file);
    const url = `https://gateway.pinata.cloud/ipfs/${uploaded.cid}`;

    const tx = await contract.storeResult(
      studentId,
      uploaded.cid,
      pdfHash
    );

    const receipt = await tx.wait();
    if (receipt?.status !== 1) {
      throw new Error("Blockchain transaction failed.");
    }

    const latest = await Result.findOne({ studentId })
      .sort({ version: -1 });

    const version = latest ? latest.version + 1 : 1;

    await Result.updateMany(
      { studentId, isLatest: true },
      { isLatest: false }
    );

    // SAVE RESULT
    await Result.create({
      studentId,

      version,

      subjects: marks,

      total,
      percentage,
      grade: g,

      pdfUrl: url,
      ipfsHash: uploaded.cid,

      pdfHash,
      txHash: tx.hash,

      generatedBy: session?.user?.email,

      contractAddress: process.env.CONTRACT_ADDRESS,

      isLatest:true,
    });

    // RESPONSE
    return NextResponse.json({
      success: true,

      studentId,

      total,
      percentage,
      grade: g,

      cid: uploaded.cid,

      pdfHash,

      txHash: tx.hash,

      url,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "PDF failed" },
      { status: 500 }
    );
  }
}
