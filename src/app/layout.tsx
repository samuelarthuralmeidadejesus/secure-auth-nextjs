import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auth System",
  description: "Sistema de autenticação seguro",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
