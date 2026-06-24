import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/posthog-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Cadência — sua autoridade, postando todo dia",
  description:
    "30 dias de conteúdo on-brand, na sua voz, prontos pra postar. Sua autoridade no automático.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-neutral-950 text-white">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
