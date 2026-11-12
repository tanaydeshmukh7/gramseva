"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import GlobalSearchModal from "@/components/GlobalSearchModal";
import { UIProvider } from "@/context/UIContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="min-h-screen w-full bg-[#F7F8F5]">{children}</main>;
  }

  return (
    <UIProvider>
      {/* Global Quick Search (Ctrl+K) */}
      <GlobalSearchModal />

      {/* Fixed Left Sidebar with all 34 worksheets */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#F7F8F5]">
          {children}
        </main>
      </div>
    </UIProvider>
  );
}
