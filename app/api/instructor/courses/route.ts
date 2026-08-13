import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/libs/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const instructorId = Number(session.user.id);
    const isAdmin = session.user.role === "ADMIN";

    const courses = await prisma.course.findMany({
      where: isAdmin
        ? undefined
        : {
            OR: [
              { instructorId },
              { createdBy: instructorId },
            ],
          },
      include: {
        semester: true,
        instructor: { select: { id: true, name: true, email: true } },
        _count: {
          select: {
            enrollments: true,
            attendances: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: courses });
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch instructor courses" },
      { status: 500 }
    );
  }
}
