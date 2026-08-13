import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/libs/prisma";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists with this email" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole =
      role === "ADMIN" || role === "admin"
        ? Role.ADMIN
        : role === "INSTRUCTOR" || role === "instructor"
          ? Role.INSTRUCTOR
          : Role.STUDENT;

    const newUser = await prisma.user.create({
      data: {
        name: name || cleanEmail.split("@")[0],
        email: cleanEmail,
        passwordHash: hashedPassword,
        role: assignedRole,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
