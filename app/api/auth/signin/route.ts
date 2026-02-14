import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signJwtToken } from "@/libs/jwt";
import { prisma } from "@/libs/prisma";

export async function POST(req: Request) {
  try {

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = signJwtToken({ id: user.id, email: user.email });

    return NextResponse.json(
      {
        message: "Login successful",
        user: { id: user.id, name: user.name, email: user.email },
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sign-in Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
