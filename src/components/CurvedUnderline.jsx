import React from 'react';

/**
 * Wavy Underline Component for FrenchBell Cafe
 * Renders an elegant, fluid sinusoidal wave stroke beneath section headings.
 */
export default function CurvedUnderline({
  className = "text-french-gold w-full h-4 sm:h-5 mt-1 sm:mt-1.5",
  strokeWidth = 5.2,
  pathClassName = ""
}) {
  return (
    <svg
      className={`overflow-visible pointer-events-none ${className}`}
      viewBox="0 0 288 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M 4 12 C 11 4.5, 17 4.5, 24 12 C 31 19.5, 37 19.5, 44 12 C 51 4.5, 57 4.5, 64 12 C 71 19.5, 77 19.5, 84 12 C 91 4.5, 97 4.5, 104 12 C 111 19.5, 117 19.5, 124 12 C 131 4.5, 137 4.5, 144 12 C 151 19.5, 157 19.5, 164 12 C 171 4.5, 177 4.5, 184 12 C 191 19.5, 197 19.5, 204 12 C 211 4.5, 217 4.5, 224 12 C 231 19.5, 237 19.5, 244 12 C 251 4.5, 257 4.5, 264 12 C 271 19.5, 277 19.5, 284 12"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`opacity-95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.22)] ${pathClassName}`}
      />
    </svg>
  );
}
