"use client";

import { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/app/components/Sidebar";
import ThemeRegistry from "@/app/components/ThemeRegistry"; 
import GlobalSearchbar from "@/app/components/GlobalSearchbar";
import "./globals.css";

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
  
  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // Use 768px as the breakpoint
      setIsMobile(mobile);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
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
          <Sidebar 
            isOpen={sidebarOpen} 
            onToggle={handleToggleSidebar}
            isMobile={isMobile}
          />
          
          <div 
            style={{ 
              marginLeft: isMobile ? 0 : "240px",
              transition: "margin 0.3s ease-in-out"
            }}
          >
            <GlobalSearchbar />
            
            <main style={{ padding: "20px" }}>
              {children}
            </main>
          </div>
        </ThemeRegistry>
      </body>
    </html>
  );
}