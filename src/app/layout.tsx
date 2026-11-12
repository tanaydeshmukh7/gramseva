import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-marathi",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gramसेवा — ग्रामपंचायत गोहगाव व्यवस्थापन प्रणाली",
  description: "ग्रामपंचायत गोहगाव संगणकीकृत नोंदवही, कर आकारणी, मागणी व वसुली व्यवस्थापन सॉफ्टवेअर",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="mr"
      className={`${inter.variable} ${notoSansDevanagari.variable} h-full antialiased light`}
    >
      <body className="min-h-full flex flex-row bg-[#F7F8F5] text-[#202923] overflow-hidden">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
