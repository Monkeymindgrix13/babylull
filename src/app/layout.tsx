import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "BabyLull.ai — Your Baby's Perfect Sleep Sound",
  description: "AI-powered sleep sounds that learn what puts YOUR baby to sleep.",
};

export const viewport: Viewport = {
  themeColor: "#0a0b1a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-[family-name:var(--font-geist-sans)] antialiased`}>
        <Header />
        <main className="pt-14 pb-20 min-h-screen">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
