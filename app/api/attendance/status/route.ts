import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/mongodb";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = session.user?.email;
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json(
        { success: false, error: "Missing classId parameter" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Define date range for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // ✅ Correct query fields (based on your schema)
    const attendance = await Attendance.findOne({
      class: classId,
      student: user._id,
      createdAt: { $gte: today, $lt: tomorrow },
    });

    return NextResponse.json({
      success: true,
      data: {
        isPresent: !!attendance,
        record: attendance || null,
      },
    });
  } catch (error) {
    console.error("Error checking attendance:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
