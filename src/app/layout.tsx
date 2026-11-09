import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { UIProvider } from "@/context/UIContext";

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
      <body className="min-h-full flex flex-row bg-[#F6F7F5] text-[#252A27] overflow-hidden">
        <UIProvider>
          {/* Fixed Left Sidebar with all 26 worksheets */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-[#F6F7F5]">
              {children}
            </main>
          </div>
        </UIProvider>
      </body>
    </html>
  );
}
