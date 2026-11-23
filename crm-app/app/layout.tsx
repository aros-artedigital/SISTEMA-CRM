import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Menu } from "./ui/menu";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM",
  description: "Sistema de relacionamento com clientes",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Menu que aparece em todas as páginas. Os links e o botão "Sair"
            dependem do login, então carregam dentro do Suspense. */}
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <nav className="mx-auto flex w-full max-w-7xl items-center gap-6 px-4 py-3 text-sm">
            <Link href="/" className="font-semibold">
              CRM
            </Link>
            <Suspense fallback={null}>
              <Menu />
            </Suspense>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
