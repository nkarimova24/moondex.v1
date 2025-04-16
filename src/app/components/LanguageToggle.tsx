"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";

interface LanguageToggleProps {
  compact?: boolean;
  className?: string;
}

export default function LanguageToggle({ compact = false, className = "" }: LanguageToggleProps) {
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Voorkom hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "nl" : "en");
  };

  // Toon niets tijdens SSR
  if (!mounted) return null;

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 transition-colors ${
        compact
          ? "p-1.5 rounded-full"
          : "px-3 py-1.5 rounded-md"
      } ${className}`}
      style={{
        backgroundColor: "rgba(138, 63, 63, 0.15)",
        color: "white",
      }}
      aria-label={t("language.switch")}
    >
      <Globe size={compact ? 16 : 18} className="text-[#8A3F3F]" />
      {!compact && (
        <span className="text-sm font-medium">
          {t("language.current")}
        </span>
      )}
    </button>
  );
}