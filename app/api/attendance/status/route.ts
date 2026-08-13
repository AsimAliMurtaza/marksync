import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/libs/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const classIdParam = searchParams.get("classId") || searchParams.get("courseId");

    if (!classIdParam) {
      return NextResponse.json(
        { success: false, error: "Missing classId parameter" },
        { status: 400 }
      );
    }

    const courseId = Number(classIdParam);
    const studentId = Number(session.user.id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: {
        courseId,
        studentId,
        date: today,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        isPresent: !!attendance,
        record: attendance || null,
      },
    });
  } catch (error) {
    console.error("Error checking attendance status:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
