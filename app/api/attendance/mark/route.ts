import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/libs/prisma";
import { isWithinRadius, calculateDistance } from "@/libs/locationUtils";
import { AttendanceStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      class: rawClassId,
      classId: altClassId,
      userLat,
      userLon,
      deviceInfo,
    } = body;
    const targetClassId = Number(altClassId || rawClassId);

    if (!targetClassId || userLat === undefined || userLon === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields (class, userLat, userLon)",
        },
        { status: 400 },
      );
    }

    const userId = Number(session.user.id);

    const course = await prisma.course.findUnique({
      where: { id: targetClassId },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 },
      );
    }

    const isEnrolled = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId: targetClassId,
        },
      },
    });

    if (!isEnrolled) {
      return NextResponse.json(
        { success: false, error: "You are not enrolled in this class" },
        { status: 403 },
      );
    }

    const today = new Date();
    const currentDayName = today.toLocaleString("en-US", { weekday: "long" });
    if (
      course.dayOfWeek &&
      course.dayOfWeek.toLowerCase() !== currentDayName.toLowerCase()
    ) {
      return NextResponse.json({
        success: false,
        error: `Attendance for this class is scheduled on ${course.dayOfWeek}. Today is ${currentDayName}.`,
      });
    }

    if (course.startTime && course.endTime) {
      const [startHour, startMin] = course.startTime.split(":").map(Number);
      const [endHour, endMin] = course.endTime.split(":").map(Number);

      const classStart = new Date(today);
      classStart.setHours(startHour, startMin, 0, 0);

      const classEnd = new Date(today);
      classEnd.setHours(endHour, endMin, 0, 0);

      const now = new Date();

      if (now < classStart || now > classEnd) {
        return NextResponse.json({
          success: false,
          error: `Attendance can only be marked between ${course.startTime} and ${course.endTime}.`,
        });
      }
    }

    const courseLat = Number(course.latitude);
    const courseLon = Number(course.longitude);
    const radius = course.allowedRadius || 30;

    const distanceMeters = Math.round(
      calculateDistance(userLat, userLon, courseLat, courseLon),
    );

    if (!isWithinRadius(userLat, userLon, courseLat, courseLon, radius)) {
      return NextResponse.json({
        success: false,
        error: `You are ${distanceMeters}m away from the class location. Allowed radius is ${radius}m.`,
      });
    }

    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        studentId: userId,
        courseId: targetClassId,
        date: startOfToday,
      },
    });

    if (existingAttendance) {
      return NextResponse.json({
        success: false,
        error: "You have already marked attendance for this class today.",
      });
    }

    const attendanceRecord = await prisma.attendance.create({
      data: {
        studentId: userId,
        courseId: targetClassId,
        date: startOfToday,
        timestamp: new Date(),
        status: AttendanceStatus.PRESENT,
        latitude: userLat,
        longitude: userLon,
        deviceInfo: deviceInfo || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Attendance marked successfully!",
      data: attendanceRecord,
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Failed to mark attendance",
      },
      { status: 500 },
    );
  }
}
