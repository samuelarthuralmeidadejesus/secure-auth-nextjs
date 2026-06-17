import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { createSessionToken, setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(`register:${ip}`);

  if (!limit.success) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em breve." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "Email já cadastrado" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, email: true },
  });

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
  });
  await setSessionCookie(token);

  return NextResponse.json({ success: true }, { status: 201 });
}
