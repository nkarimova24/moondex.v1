"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

interface HeaderToggleButtonProps {
  isVisible: boolean;
  onClick: () => void;
  setName?: string;
}

export default function HeaderToggleButton({ 
  isVisible, 
  onClick, 
  setName 
}: HeaderToggleButtonProps) {
  return (
    <div className="w-full">
      <button
        onClick={onClick}
        className="flex items-center justify-center w-full py-2 transition-all duration-200"
        style={{ 
          background: "#1E1E1E",
          border: "none",
          borderRadius: isVisible ? "0 0 6px 6px" : "6px",
          marginTop: isVisible ? "-24px" : "0",
          marginBottom: "16px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          zIndex: 20,
          height: "28px",
        }}
      >
        {isVisible ? (
          <div className="flex items-center text-gray-400 hover:text-white transition-colors">
            <span className="text-xs mr-1">Hide</span>
            <ChevronUp size={14} />
          </div>
        ) : (
          <div className="flex items-center" style={{ color: "#8A3F3F" }}>
            <span className="text-xs mr-1">Show {setName ? `${setName} details` : ''}</span>
            <ChevronDown size={14} />
          </div>
        )}
      </button>
    </div>
  );
}