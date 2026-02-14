import { NextResponse } from "next/server"
import {prisma} from "@/libs/prisma"

export async function GET(_: Request, { params }: any) {
  try {
    const id = BigInt(params.id)

    const semester = await prisma.semesters.findUnique({
      where: { id }
    })

    if (!semester)
      return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({
      ...semester,
      id: semester.id.toString(),
      created_by: semester.created_by.toString(),
    })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: any) {
  try {
    const id = BigInt(params.id)
    const body = await req.json()

    const { name, start_date, end_date } = body

    const updated = await prisma.semesters.update({
      where: { id },
      data: {
        name,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      }
    })

    return NextResponse.json({
      ...updated,
      id: updated.id.toString(),
      created_by: updated.created_by.toString(),
    })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: any) {
  try {
    const id = BigInt(params.id)

    await prisma.semesters.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
