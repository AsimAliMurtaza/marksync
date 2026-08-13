import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/libs/prisma";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role");

    const users = await prisma.user.findMany({
      where: roleParam ? { role: roleParam.toUpperCase() as Role } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gender: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            taughtCourses: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, role, name } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (userId, role)" },
        { status: 400 }
      );
    }

    const targetUserId = Number(userId);
    const assignedRole = role.toUpperCase() as Role;

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        role: assignedRole,
        ...(name && { name: name.trim() }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 });
  }
}
