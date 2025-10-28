import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/libs/mongodb";
import Class from "@/models/Class";

interface Params {
  params: {
    id: string;
  };
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
  } catch (error: any) {
    console.error("Error fetching class:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await dbConnect();

    if (!params.id) {
      return NextResponse.json(
        { success: false, error: "Class ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const classData = await Class.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    }).populate("cr", "name email");

    if (!classData) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: classData });
  } catch (error: any) {
    console.error("Error updating class:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await dbConnect();

    if (!params.id) {
      return NextResponse.json(
        { success: false, error: "Class ID is required" },
        { status: 400 }
      );
    }

    const deletedClass = await Class.findByIdAndDelete(params.id);

    if (!deletedClass) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Class deleted successfully" },
    });
  } catch (error: any) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
