import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/mongodb";
import Attendance from "@/models/Attendance";
import Class from "@/models/Class";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json({ success: false, error: "Missing classId" });
    }

    await dbConnect();

    // ✅ Verify class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return NextResponse.json({ success: false, error: "Class not found" });
    }

    // ✅ Get all attendance records for this class
    const attendances = await Attendance.find({ class: classId })
      .populate("student", "name email")
      .lean();

    if (!attendances.length) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No attendance records found for this class.",
      });
    }

    // ✅ Extract unique students
    const studentsMap = new Map();
    attendances.forEach((a) => {
      if (a.student?._id) {
        studentsMap.set(a.student._id.toString(), a.student);
      }
    });
    const students = Array.from(studentsMap.values());

    // ✅ Build unique dates list
        const dates = Array.from(
          new Set(
            attendances.map((a) => new Date(a.createdAt).toDateString())
          )
        ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
        // ✅ Generate attendance matrix
    const report = students.map((student) => {
      const row: Record<string, string> = {
        Student: student.name,
        Email: student.email,
      };

      dates.forEach((date) => {
        const record = attendances.find(
          (a) =>
            a.student._id.toString() === student._id.toString() &&
            new Date(a.createdAt).toDateString() === date
        );
        row[date] = record ? "Present" : "Absent";
      });

      return row;
    });

    return NextResponse.json({
      success: true,
      data: { report, dates },
    });
  } catch (err) {
    console.error("Error generating report:", err);
    return NextResponse.json({ success: false, error: (err as Error).message });
  }
}
 