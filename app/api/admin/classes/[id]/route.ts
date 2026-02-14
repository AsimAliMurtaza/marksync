import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma"


export async function PUT(
  req: NextRequest,
  { params }: { params: { semester_id: string } }
) {
  const body = await req.json()

  const course = await prisma.courses.update({
    where: { id: BigInt(params.semester_id) },
    data: {
      title: body.title,
      code: body.code,
      day_of_week: body.day_of_week,
      start_time: body.start_time ? new Date(body.start_time) : undefined,
      end_time: body.end_time ? new Date(body.end_time) : undefined,
      room: body.room,
      latitude: body.latitude,
      longitude: body.longitude,
      allowed_radius: body.allowed_radius,
    },
  })

  return NextResponse.json(course)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.courses.delete({
    where: { id: BigInt(params.id) },
  })

  return new NextResponse(null, { status: 204 })
}
