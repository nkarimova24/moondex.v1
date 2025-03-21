"use client";

import { PokemonSet } from "@/app/lib/api";
import { formatDate } from "@/app/lib/utils";

interface SetHeaderProps {
  setInfo: PokemonSet;
}

export default function SetHeader({ setInfo }: SetHeaderProps) {
  return (
    <div className="w-full">
      <div className="p-4 mb-6 border-b border-gray-900 shadow-md w-full">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          <div className="flex-shrink-0">
            {setInfo.images?.logo && (
              <div className="h-16 md:h-24 relative">
                <img 
                  src={setInfo.images.logo} 
                  alt={`${setInfo.name} logo`} 
                  className="h-full object-contain"
                />
              </div>
            )}
          </div>

          <div className="flex-grow text-center md:text-left">
            <h1 className="text-2xl font-bold text-white">{setInfo.name}</h1>
            <p className="text-gray-400">{setInfo.series} · Released {formatDate(setInfo.releaseDate)}</p>
          </div>
          
          <div className="flex gap-6 mt-2 md:mt-0">
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-400">Total</span>
              <span className="text-xl font-bold text-white">{setInfo.printedTotal}</span>
              <span className="text-xs text-gray-400">
                  (excl. secret)
                </span>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-400">Total</span>
              <span className="text-xl font-bold text-white">{setInfo.total}</span>
              {setInfo.total && setInfo.printedTotal && setInfo.total > setInfo.printedTotal && (
                <span className="text-xs text-gray-400">
                  (incl. {setInfo.total - setInfo.printedTotal} secret)
                </span>
              )}
            </div>
            
            {setInfo.images?.symbol && (
              <div className="ml-4 flex items-center">
                <img 
                  src={setInfo.images.symbol} 
                  alt={`${setInfo.name} symbol`} 
                  className="h-10 w-10 object-contain"
                />
              </div>
            )}
          </div>
        </div>
        
        {setInfo.legalities && (
          <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
            {Object.entries(setInfo.legalities).map(([format, status]) => (
              <span 
                key={format}
                className={`px-2 py-1 text-xs rounded-full ${
                  status === 'Legal' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'
                }`}
              >
                {format.charAt(0).toUpperCase() + format.slice(1)}: {status}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}