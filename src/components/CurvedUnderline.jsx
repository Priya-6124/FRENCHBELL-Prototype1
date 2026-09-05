import React from 'react';

export default function CurvedUnderline({ className = "text-french-gold w-full h-3 sm:h-4 -mt-1 sm:-mt-2" }) {
  return (
    <svg
      className={`overflow-visible pointer-events-none ${className}`}
      viewBox="0 0 240 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path
        d="M3 11.5C52 4.2 142 3.8 237 9.8C185 14 96 15.2 4 13.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-90"
      />
    </svg>
  );
}
