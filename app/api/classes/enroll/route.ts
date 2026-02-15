import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const courseId = BigInt(body.classId);
  const studentId = BigInt(session?.user?.id);

  if (!courseId) {
    return NextResponse.json({ error: "classId is required" }, { status: 400 });
  }

  // Check if already enrolled
  const existing = await prisma.enrollments.findUnique({
    where: {
      student_id_course_id: {
        student_id: studentId,
        course_id: courseId,
      },
    },
  });

  const serializedExisting = existing
    ? {
        ...existing,
        student_id: existing.student_id.toString(),
        course_id: existing.course_id.toString(),
      }
    : null;

  if (serializedExisting) {
    return NextResponse.json({ message: "Already enrolled" });
  }

  // Create the enrollment row
  const enrollment = await prisma.enrollments.create({
    data: {
      student_id: studentId,
      course_id: courseId,
    },
  });


  return NextResponse.json(
    { message: "Enrolled successfully", isEnrolled: true },
    { status: 201 }
  );
}
