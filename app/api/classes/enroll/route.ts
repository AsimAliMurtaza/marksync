import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const classId = body.classId || body.courseId;

    if (!classId) {
      return NextResponse.json({ success: false, error: "classId is required" }, { status: 400 });
    }

    const courseId = Number(classId);
    const studentId = Number(session.user.id);

    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ success: true, message: "Already enrolled", isEnrolled: true });
    }

    await prisma.enrollment.create({
      data: {
        studentId,
        courseId,
      },
    });

    return NextResponse.json(
      { success: true, message: "Enrolled successfully", isEnrolled: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to enroll in class" },
      { status: 500 }
    );
  }
}
