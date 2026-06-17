import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { createSessionToken, setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(`login:${ip}`);

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

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos" },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  // Mensagem de erro genérica para não revelar se o email existe (anti user-enumeration)
  const genericError = NextResponse.json(
    { error: "Email ou senha inválidos" },
    { status: 401 }
  );

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return genericError;

  const validPassword = await verifyPassword(user.passwordHash, password);
  if (!validPassword) return genericError;

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
  });
  await setSessionCookie(token);

  return NextResponse.json({ success: true }, { status: 200 });
}
