import { NextResponse } from "next/server";
import dbConnect from "@/libs/mongodb";
import Class from "@/models/Class";
import User from "@/models/User";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    await dbConnect();
    const classes = await Class.find();

    console.log("Classes fetched:", classes.length);

    return NextResponse.json({ success: true, data: classes });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const classData = await Class.create(body);
    return NextResponse.json(
      { success: true, data: classData },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
