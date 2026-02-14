import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { prisma } from "@/libs/prisma";
import { Decimal } from "@prisma/client/runtime/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      console.log("Unauthorized access attempt to admin classes");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
      const { searchParams } = new URL(req.url)
      const semester_id = searchParams.get("semester_id")

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

      return NextResponse.json(serializedClasses)
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching classes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const course = await prisma.courses.create({
    data: {
      semester_id: BigInt(body.semester_id),
      title: body.title,
      code: body.code,
      day_of_week: body.day_of_week,
      start_time: new Date(body.start_time),
      end_time: new Date(body.end_time),
      room: body.room,
      latitude: new Decimal(body.latitude),
      longitude: new Decimal(body.longitude),
      allowed_radius: body.allowed_radius,
      created_by: BigInt(body.created_by),
    },
  })

  const serializedCourse = {
    ...course,
    id: course.id.toString(),
    semester_id: course.semester_id.toString(),
    created_by: course.created_by.toString(),
  }
  return NextResponse.json(serializedCourse, { status: 201 })
}