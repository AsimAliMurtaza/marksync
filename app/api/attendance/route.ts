import { NextResponse } from "next/server";
import dbConnect from "@/libs/mongodb";
import Attendance from "@/models/Attendance";
import Class from "@/models/Class";
import User from "@/models/User";
import { isWithinRadius } from "@/libs/locationUtils";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();
    const attendance = await Attendance.find()
      .populate("student", "name email")
      .populate("class", "name code")
      .sort({ timestamp: -1 });

    return NextResponse.json({ success: true, data: attendance });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { student, class: classId, userLat, userLon } = body;

    console.log("Attendance request received:", {
      student,
      classId,
      userLat,
      userLon,
    });

    // Validate required fields
    if (
      !student ||
      !classId ||
      userLat === undefined ||
      userLon === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: student, class, userLat, userLon",
        },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(student)) {
      return NextResponse.json(
        { success: false, error: "Invalid student ID format" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json(
        { success: false, error: "Invalid class ID format" },
        { status: 400 }
      );
    }

    // Check if student exists
    const studentExists = await User.findById(student);
    if (!studentExists) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    // Get class details to check location
    const classData = await Class.findById(classId);
    if (!classData) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );
    }

    // Check if class has location data
    if (
      !classData.location ||
      !classData.location.latitude ||
      !classData.location.longitude
    ) {
      return NextResponse.json(
        { success: false, error: "Class location is not configured" },
        { status: 400 }
      );
    }

    // Check if user is within allowed radius
    const withinRadius = isWithinRadius(
      userLat,
      userLon,
      classData.location.latitude,
      classData.location.longitude,
      classData.allowedRadius || 30 // Default to 30m if not set
    );

    if (!withinRadius) {
      return NextResponse.json(
        {
          success: false,
          error: `You are outside the allowed radius. Please be within ${
            classData.allowedRadius || 30
          }m of the class location.`,
        },
        { status: 400 }
      );
    }

    // Check if attendance already marked for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await Attendance.findOne({
      student,
      class: classId,
      timestamp: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        {
          success: false,
          error: "Attendance already marked for today",
        },
        { status: 400 }
      );
    }

    // Create attendance record
    const attendanceData = await Attendance.create({
      student,
      class: classId,
      location: { latitude: userLat, longitude: userLon },
      status: "present",
    });

    const populatedAttendance = await Attendance.findById(attendanceData._id)
      .populate("student", "name email")
      .populate("class", "name code");

    return NextResponse.json(
      {
        success: true,
        data: populatedAttendance,
        message: "Attendance marked successfully!",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in attendance POST:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
