import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/posthog-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "RitmoPost — Calendário de Conteúdo para Instagram com IA",
  description:
    "30 dias de conteúdo para seu Instagram em 10 segundos. Gerado por IA, personalizado para seu negócio.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-950 text-white">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
