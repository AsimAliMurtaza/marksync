import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/mongodb";
import Class from "@/models/Class";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "cr") {
      console.log("Unauthorized access attempt to admin classes");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const uid = session.user?.id;
    if (!uid) {
      return NextResponse.json(
        { success: false, error: "User ID not found in session" },
        { status: 400 }
      );
    }
    await dbConnect();
    //the createdBy has an objectID of the user who created the class
    const classes = await Class.find({ createdBy: uid }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: classes });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      name,
      code,
      location,
      allowedRadius,
      schedule,
      createdBy
    } = body;

    if (
      !name ||
      !code ||
      !location?.latitude ||
      !location?.longitude ||
      !schedule?.dayOfWeek ||
      !schedule?.startTime ||
      !schedule?.endTime ||
      !schedule?.room ||
      !createdBy
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newClass = await Class.create({
      name,
      code,
      location,
      allowedRadius,
      schedule,
      createdBy
    });

    return NextResponse.json({ success: true, data: newClass });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
