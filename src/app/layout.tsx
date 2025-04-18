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
import { Container } from "@/app/components/Container";
import Link from "next/link";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; 
      setIsMobile(mobile);
      setSidebarOpen(!mobile); // Set sidebarOpen based on mobile state
    };

    checkMobile();

    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggleSidebar = () => {
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
                
                <Container maxWidth="lg">
                  <div className="flex flex-col md:flex-row justify-between items-center py-3 text-gray-500 text-xs">
                    <div className="flex space-x-4 mb-2 md:mb-0">
                      <Link href="/about" className="hover:text-gray-800 dark:hover:text-gray-300 transition">About</Link>
                      <Link href="/contact" className="hover:text-gray-800 dark:hover:text-gray-300 transition">Contact</Link>
                      <Link href="/changelog" className="hover:text-gray-800 dark:hover:text-gray-300 transition">Changelog</Link>
                    </div>
                    <div className="text-center md:text-right">
                      © 2025 MoonDex
                    </div>
                  </div>
                </Container>
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