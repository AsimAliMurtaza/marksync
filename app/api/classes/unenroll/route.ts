import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const courseId = BigInt(body.classId);
  const studentId = BigInt(session?.user?.id);

  await prisma.enrollments.deleteMany({
    where: {
      student_id: studentId,
      course_id: courseId,
    },
  });

  return NextResponse.json({ message: "Unenrolled successfully" });
}
