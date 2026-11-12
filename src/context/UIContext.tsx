"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface UIContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  collapsedSidebar: boolean;
  toggleCollapsedSidebar: () => void;
  globalSearchOpen: boolean;
  setGlobalSearchOpen: (open: boolean) => void;
  toggleGlobalSearch: () => void;
}

const UIContext = createContext<UIContextType>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  toggleSidebar: () => {},
  closeSidebar: () => {},
  collapsedSidebar: false,
  toggleCollapsedSidebar: () => {},
  globalSearchOpen: false,
  setGlobalSearchOpen: () => {},
  toggleGlobalSearch: () => {},
});

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar automatically on page navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Global Ctrl+K / Cmd+K shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setGlobalSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setGlobalSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleCollapsedSidebar = () => setCollapsedSidebar((prev) => !prev);
  const toggleGlobalSearch = () => setGlobalSearchOpen((prev) => !prev);

  return (
    <UIContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        closeSidebar,
        collapsedSidebar,
        toggleCollapsedSidebar,
        globalSearchOpen,
        setGlobalSearchOpen,
        toggleGlobalSearch,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  return useContext(UIContext);
}
