import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/mongodb";
import Attendance from "@/models/Attendance";
import Class from "@/models/Class";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { isWithinRadius } from "@/libs/locationUtils";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { class: classId, userLat, userLon, deviceInfo } = body;

    if (!classId || !userLat || !userLon || !deviceInfo) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Fetch user and class
    const user = await User.findOne({ email: session.user?.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );
    }

    // ✅ 1. Check if current day matches class day
    const today = new Date();
    const currentDay = today.toLocaleString("en-US", { weekday: "long" }); // e.g. "Monday"
    if (classData.schedule.dayOfWeek !== currentDay) {
      return NextResponse.json({
        success: false,
        error: `Attendance can only be marked on ${classData.schedule.dayOfWeek} during class hours.`,
      });
    }

    // ✅ 2. Parse start and end times
    const [startHour, startMinute] = classData.schedule.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = classData.schedule.endTime
      .split(":")
      .map(Number);

    const classStart = new Date(today);
    classStart.setHours(startHour, startMinute, 0, 0);

    const classEnd = new Date(today);
    classEnd.setHours(endHour, endMinute, 0, 0);

    const now = new Date();

    // ✅ 3. Restrict marking outside of class time
    if (now < classStart || now > classEnd) {
      return NextResponse.json({
        success: false,
        error: "Attendance can only be marked during class hours.",
      });
    }

    // ✅ 4. Check if user is within allowed location radius
    if (
      classData.location &&
      !isWithinRadius(
        userLat,
        userLon,
        classData.location.latitude,
        classData.location.longitude,
        classData.allowedRadius || 30
      )
    ) {
      return NextResponse.json({
        success: false,
        error: "You are not within the allowed class location radius.",
      });
    }

    // ✅ 5. Check if already marked today
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const alreadyMarked = await Attendance.findOne({
      class: classId,
      student: user._id,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (alreadyMarked) {
      return NextResponse.json({
        success: false,
        error: "You have already marked attendance for this class today.",
      });
    }

    // ✅ 6. Save attendance record
    const attendance = await Attendance.create({
      student: user._id,
      class: classId,
      location: { latitude: userLat, longitude: userLon },
      deviceInfo,
      status: "present",
    });

    return NextResponse.json({
      success: true,
      message: "Attendance marked successfully!",
      data: attendance,
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
