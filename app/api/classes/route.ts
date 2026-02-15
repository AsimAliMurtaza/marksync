import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const studentId = BigInt(session?.user?.id);

  const data = await prisma.enrollments.findMany({
    where: { student_id: studentId },
    include: { courses: true },
  });

  const serializedData = data.map((enrollment) => ({
    ...enrollment,
    student_id: enrollment.student_id.toString(),
    id: enrollment.id.toString(),
    course_id: enrollment.course_id.toString(),
    courses : {
      ...enrollment.courses,
      id: enrollment.courses.id.toString(),
        semester_id: enrollment.courses.semester_id.toString(),
        created_by: enrollment.courses.created_by.toString(),
    }
  }));

  return NextResponse.json(serializedData);
}
