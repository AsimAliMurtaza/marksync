import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/mongodb";
import Class from "@/models/Class";

interface Params {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    await dbConnect();

    // Validate ID parameter
    if (!params.id) {
      return NextResponse.json(
        { success: false, error: "Class ID is required" },
        { status: 400 }
      );
    }

    const classData = await Class.findOne({ _id: params.id });
    console.log("Fetching class with ID:", classData);
    if (!classData) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );
    }

    console.log("Class fetched:", classData.name);

    return NextResponse.json({ success: true, data: classData });
  } catch (error) {
    console.error("Error fetching class:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id } = params;

    const updated = await Class.findByIdAndUpdate(id, body, { new: true });

    if (!updated)
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { id } = params;

    const deleted = await Class.findByIdAndDelete(id);

    if (!deleted)
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );

    return NextResponse.json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
