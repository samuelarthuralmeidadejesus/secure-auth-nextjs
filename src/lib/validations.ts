import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(80, "Nome muito longo"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Email inválido")
    .max(150),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(72, "Senha muito longa")
    .regex(/[A-Z]/, "Senha deve ter ao menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve ter ao menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve ter ao menos um número"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido").max(150),
  password: z.string().min(1, "Senha obrigatória").max(72),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
