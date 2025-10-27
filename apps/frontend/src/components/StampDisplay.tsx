
import React from 'react';
import { StampData } from '../types';

interface StampDisplayProps {
  stamp: StampData;
  isLarge?: boolean;
}

const StampDisplay: React.FC<StampDisplayProps> = ({ stamp, isLarge = false }) => {
  const sizeClasses = isLarge ? "w-64 h-64 md:w-80 md:h-80" : "w-32 h-32";
  const textClasses = isLarge ? "text-lg md:text-xl" : "text-sm";
  const countryTextClasses = isLarge ? "text-base md:text-lg" : "text-xs";
  const dateTextClasses = isLarge ? "text-sm md:text-base" : "text-xs";

  return (
    <div className="flex flex-col items-center justify-center text-center p-2">
      <div className={`${sizeClasses} bg-white/10 rounded-full flex items-center justify-center p-2 shadow-lg backdrop-blur-sm`}>
        <img
          src={stamp.imageUrl}
          alt={`Passport stamp for ${stamp.city}, ${stamp.country}`}
          className="w-full h-full object-contain rounded-full contrast-125 brightness-110"
        />
      </div>
      <h3 className={`font-serif font-bold text-slate-100 mt-4 ${textClasses}`}>{stamp.city}</h3>
      <p className={`text-slate-400 ${countryTextClasses}`}>{stamp.country}</p>
      {isLarge && <p className={`text-sky-400 mt-1 ${dateTextClasses}`}>{stamp.date}</p>}
    </div>
  );
};

export default StampDisplay;
