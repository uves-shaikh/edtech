import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { generateToken, setAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/modules/auth/schemas/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    const where: Prisma.UserWhereUniqueInput = {
      email: validatedData.email,
    };

    const existingUser = await prisma.user.findUnique({
      where,
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const userRole = validatedData.role || "STUDENT";

    const userData: Prisma.UserCreateInput = {
      email: validatedData.email,
      password: hashedPassword,
      name: validatedData.name,
      role: userRole,
    };

    const user = await prisma.user.create({
      data: userData,
    });

    if (user.role === "CREATOR") {
      const creatorData: Prisma.CreatorCreateInput = {
        user: {
          connect: { id: user.id },
        },
      };

      await prisma.creator.create({
        data: creatorData,
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
