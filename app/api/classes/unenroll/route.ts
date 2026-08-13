import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
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

    await prisma.enrollment.deleteMany({
      where: {
        studentId,
        courseId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Unenrolled successfully",
      isEnrolled: false,
    });
  } catch (error) {
    console.error("Unenrollment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unenroll from class" },
      { status: 500 }
    );
  }
}
