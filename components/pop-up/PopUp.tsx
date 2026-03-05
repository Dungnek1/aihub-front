"use client";
import { useState, useEffect } from 'react';
import BackgroundCubes from './BackgroundCubes';
import TrapezoidSection from './TrapezoidSection';

export default function PopupCard() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000); // 5 seconds delay

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const handleOpenNewTab = () => {
    window.open('/landing', '_blank'); 
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-[608px] h-[672px] flex flex-col items-center cursor-pointer group scale-[0.6] sm:scale-100 origin-center"
        onClick={handleOpenNewTab}
      >
        <BackgroundCubes />
        <TrapezoidSection />

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="absolute top-4 right-[60px] z-50 w-10 h-10 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full shadow-lg transition-all duration-200 group-hover:scale-110"
          aria-label="Close popup"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}