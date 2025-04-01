import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "MoonDex | Pokémon TCG Explorer",
  description: "Browse and explore your Pokémon Trading Card Game collection",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: "#1A1A1A" }}
      >
        <ThemeRegistry> 
          <Sidebar />
          
          <div style={{ marginLeft: "240px" }}>
            {/* GlobalSearchbar is now sticky within itself */}
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