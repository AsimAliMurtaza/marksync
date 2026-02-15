import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/libs/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const id = params.id;

    if (!session || session.user?.role !== "student") {
      console.log("Unauthorized access attempt to student classes");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }   
    
      const semester_id = id ? BigInt(id) : null;

      if (!semester_id) {
        return new Response("semester_id required", { status: 400 })
      }

      const classes = await prisma.courses.findMany({
        where: { semester_id: BigInt(semester_id) },
        orderBy: { start_time: "asc" },
      })

      const serializedClasses = classes.map(cls => ({
        ...cls,
        id: cls.id.toString(),
        semester_id: cls.semester_id.toString(),
        created_by: cls.created_by.toString(),
      }))
      console.log("Fetched classes:", serializedClasses);
      return NextResponse.json(serializedClasses)
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching classes" },
      { status: 500 }
    );
  }
}
