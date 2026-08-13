import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signJwtToken } from "@/libs/jwt";
import { prisma } from "@/libs/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = signJwtToken({ id: user.id, email: user.email });

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sign-in Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
