"use client";

import { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/app/components/Sidebar";
import ThemeRegistry from "@/app/components/ThemeRegistry";
import GlobalSearchbar from "@/app/components/GlobalSearchbar";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CollectionProvider } from "@/context/CollectionContext";
import { NotesProvider } from '@/context/NotesContext';

import "./globals.css";
import Toast from "./components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; 
      setIsMobile(mobile);
    };

    checkMobile();

    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggleSidebar = () => {
    console.log("Toggle sidebar called, current state:", sidebarOpen);
    setSidebarOpen(prevState => !prevState);
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: "#1A1A1A" }}
      >
        <ThemeRegistry>
          <AuthProvider>
            <LanguageProvider>
              <CollectionProvider>
              <NotesProvider>
              <Sidebar
                isOpen={sidebarOpen}
                onToggle={handleToggleSidebar}
              />
              
              <div 
                style={{ 
                  marginLeft: isMobile ? 0 : (sidebarOpen ? "240px" : "0px"),
                  transition: "margin 0.3s ease-in-out"
                }}
              >
                <GlobalSearchbar />

                <main style={{ padding: "20px" }}>
                  {children}
                </main>
              </div>
              </NotesProvider>
              </CollectionProvider>
            </LanguageProvider>
          </AuthProvider>
        </ThemeRegistry>
        <Toast />
      </body>
    </html>
  );
}