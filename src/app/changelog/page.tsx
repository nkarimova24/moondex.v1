"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import LanguageToggle from "@/app/components/LanguageToggle";

interface ChangelogEntry {
  date: string;
  version: string;
  titleKey: string;
  changes: {
    type: "added" | "changed" | "fixed" | "removed" | "upcoming";
    itemKeys: string[];
  }[];
}

export default function ChangelogPage() {
  const { t } = useLanguage();
  
  const [changelogData] = useState<ChangelogEntry[]>([
    {
      date: "11 April 2025",
      version: "0.7.1",
      titleKey: "changelog.entry.2.title",
      changes: [
        {
          type: "added",
          itemKeys: [
            "changelog.entry.2.added.0"
          ]
        },
        
      ]
    },
    {
      date: "10 April 2025",
      version: "0.7.0",
      titleKey: "changelog.entry.0.title",
      changes: [
        {
          type: "added",
          itemKeys: [
            "changelog.entry.0.added.0",
            "changelog.entry.0.added.1",
            "changelog.entry.0.added.2",
            "changelog.entry.0.added.3",
            "changelog.entry.0.added.4",
        
          ]
        },
        {
          type: "upcoming",
          itemKeys: [
            "changelog.entry.0.upcoming.0",
            "changelog.entry.0.upcoming.1",
            "changelog.entry.0.upcoming.2",
            "changelog.entry.0.upcoming.3",
            "changelog.entry.0.upcoming.4"
          ]
        }
      ]
    },
    {
      date: "20 Februari 2025",
      version: "0.5.0",
      titleKey: "changelog.entry.1.title",
      changes: [
        {
          type: "added",
          itemKeys: [
            "changelog.entry.1.added.0",
            "changelog.entry.1.added.1",
            "changelog.entry.1.added.2"
          ]
        },
        {
          type: "fixed",
          itemKeys: [
            "changelog.entry.1.fixed.0",
            "changelog.entry.1.fixed.1"
          ]
        }
      ]
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "added":
        return (
          <div className="min-w-5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
        );
      case "changed":
        return (
          <div className="min-w-5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M3 12h4l3-9 4 18 3-9h4" />
            </svg>
          </div>
        );
      case "fixed":
        return (
          <div className="min-w-5 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="m15 15 6 6m-6-6 6-6m-6 6H3" />
            </svg>
          </div>
        );
      case "removed":
        return (
          <div className="min-w-5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M5 12h14" />
            </svg>
          </div>
        );
      case "upcoming":
        return (
          <div className="min-w-5 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "added":
        return t("changelog.added");
      case "changed":
        return t("changelog.changed");
      case "fixed":
        return t("changelog.fixed");
      case "removed":
        return t("changelog.removed");
      case "upcoming":
        return t("changelog.upcoming");
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "added":
        return "bg-green-500/10 text-green-300 border-green-500/30";
      case "changed":
        return "bg-blue-500/10 text-blue-300 border-blue-500/30";
      case "fixed":
        return "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
      case "removed":
        return "bg-red-500/10 text-red-300 border-red-500/30";
      case "upcoming":
        return "bg-purple-500/10 text-purple-300 border-purple-500/30";
      default:
        return "bg-gray-500/10 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
      {/* Header with Language Toggle */}
      <div className="mb-6 sm:mb-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{t("changelog.title")}</h1>
          <div className="self-start">
            <LanguageToggle />
          </div>
        </div>
        <p className="text-gray-400 text-sm sm:text-base">
          {t("changelog.description")}
        </p>
        <div className="mt-4">
          <Link
            href="/"
            className="text-xs sm:text-sm text-[#8A3F3F] hover:text-[#612B2B] transition-colors inline-flex items-center"
          >
            <span className="mr-1">←</span> {t("app.backToHome")}
          </Link>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-[#252525] rounded-lg shadow-md">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-3">{t("changelog.legend")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
          {["added", "changed", "fixed", "removed", "upcoming"].map((type) => (
            <div key={type} className="flex items-center gap-2">
              {getTypeIcon(type)}
              <span className="text-xs sm:text-sm text-gray-300">{getTypeLabel(type)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative border-l-2 border-[#333] pl-6 sm:pl-10 ml-1 sm:ml-2">
        {changelogData.map((entry, entryIndex) => (
          <div
            key={entryIndex}
            className={`mb-8 sm:mb-12 relative ${
              entryIndex === 0 ? "pt-0" : "pt-2"
            }`}
          >
            {/* Timeline dot */}
            <div
              className="absolute left-[-33px] sm:left-[-31px] top-3 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-[#8A3F3F] border-2 sm:border-4 border-[#1A1A1A] z-10"
              style={{ boxShadow: "0 0 0 3px rgba(138, 63, 63, 0.2)" }}
            ></div>

            {/* Version & Date */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  v{entry.version}{" "}
                  <span className="text-base sm:text-lg font-normal">- {t(entry.titleKey)}</span>
                </h2>
              </div>
              <div className="mt-1 sm:mt-0 px-2 sm:px-3 py-0.5 sm:py-1 bg-[#2A2A2A] rounded-full text-xs sm:text-sm text-gray-400">
                {entry.date}
              </div>
            </div>

            {/* Change groups */}
            <div className="space-y-4 sm:space-y-6">
              {entry.changes.map((changeGroup, groupIndex) => (
                <div key={groupIndex}>
                  <h3
                    className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm font-medium mb-2 sm:mb-3 border ${getTypeColor(
                      changeGroup.type
                    )}`}
                  >
                    {getTypeLabel(changeGroup.type)}
                  </h3>
                  <ul className="space-y-2">
                    {changeGroup.itemKeys.map((itemKey, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="flex items-start gap-3"
                      >
                        <div className="pt-1">
                          {getTypeIcon(changeGroup.type)}
                        </div>
                        <div className="text-gray-300 text-xs sm:text-sm flex-1">
                          {t(itemKey)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon */}
      <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-gradient-to-br from-[#8A3F3F]/20 to-[#1A1A1A] rounded-lg border border-[#8A3F3F]/30 shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{t("changelog.helpUs")}</h2>
        <p className="text-gray-300 text-xs sm:text-sm mb-4">
          {t("changelog.inDevelopment")}
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => window.open("mailto:giesje002@gmail.com", "_blank")}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#8A3F3F] text-white rounded-md hover:bg-[#612B2B] transition-colors text-xs sm:text-sm"
          >
            {t("changelog.sendFeedback")}
          </button>
          <Link
            href="/"
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2A2A2A] text-white rounded-md hover:bg-[#333] transition-colors text-xs sm:text-sm"
          >
            {t("app.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}