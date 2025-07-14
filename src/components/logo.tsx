
import { cn } from "@/lib/utils";
import React from "react";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 230"
      className={cn("w-auto h-10", className)}
      fill="none"
    >
      <g clipPath="url(#clip0_105_2)">
        <path
          d="M100 0L10 40V130C10 180 50 225 100 230C150 225 190 180 190 130V40L100 0Z"
          fill="#0C0C0C"
        />
        <path
          d="M100 10L180 45V130C180 175 145 215 100 220C55 215 20 175 20 130V45L100 10Z"
          fill="#D4B23D"
        />
        <path
          d="M100 10L20 45V130C20 175 55 215 100 220V10Z"
          fill="#FFFFFF"
        />
        
        <path
          d="M95 15H105V220H95V15Z"
          fill="#0C0C0C"
          stroke="#D4B23D"
          strokeWidth="2"
        />
        <path
          d="M15 125H185V135H15V125Z"
          fill="#0C0C0C"
          stroke="#D4B23D"
          strokeWidth="2"
        />

        {/* Top Left: K */}
        <text
          x="40"
          y="95"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fontSize="60"
          fill="#0C0C0C"
        >
          K
        </text>

        {/* Top Right: Torch */}
        <g transform="translate(120 40) scale(0.3)">
          <path
            d="M50 120C50 100 70 80 90 80C110 80 130 100 130 120H50Z"
            fill="#0C0C0C"
          />
          <rect x="80" y="120" width="20" height="70" fill="#0C0C0C" />
          <path
            d="M90 70C70 70 60 50 70 30C80 10 100 10 110 30C120 50 110 70 90 70Z"
            fill="#FFC300"
          />
          <path
            d="M90 60C80 60 75 50 80 40C85 30 95 30 100 40C105 50 100 60 90 60Z"
            fill="#FFA500"
          />
        </g>
        
        {/* Bottom Left: Atom */}
        <g transform="translate(50 165) scale(0.35)">
          <circle cx="100" cy="100" r="10" fill="#0C0C0C" />
          <ellipse
            cx="100"
            cy="100"
            rx="80"
            ry="30"
            stroke="#0C0C0C"
            strokeWidth="10"
            fill="none"
            transform="rotate(45 100 100)"
          />
          <ellipse
            cx="100"
            cy="100"
            rx="80"
            ry="30"
            stroke="#0C0C0C"
            strokeWidth="10"
            fill="none"
            transform="rotate(-45 100 100)"
          />
          <ellipse
            cx="100"
            cy="100"
            rx="30"
            ry="80"
            stroke="#0C0C0C"
            strokeWidth="10"
            fill="none"
          />
        </g>
        
        {/* Bottom Right: Book and Tree */}
        <g transform="translate(115 145) scale(0.4)">
           <path d="M 20,110 Q 50,90 80,110 L 80 150 L 20 150 Z" fill="#0C0C0C" />
            <path d="M 20,110 L 80,110 L 50,80 Z" fill="#0C0C0C" />
            <path d="M50 80 L 50 50" stroke="#0C0C0C" strokeWidth="8"/>
            <path d="M50 50 L 30 30" stroke="#0C0C0C" strokeWidth="6"/>
            <path d="M50 50 L 70 30" stroke="#0C0C0C" strokeWidth="6"/>
            <path d="M50 65 L 35 50" stroke="#0C0C0C" strokeWidth="6"/>
            <path d="M50 65 L 65 50" stroke="#0C0C0C" strokeWidth="6"/>
        </g>
        
        {/* Crown */}
        <g transform="translate(60 -40) scale(0.8)">
            <path d="M20 90 C 20 70, 40 70, 40 90 L 60 90 C 60 60, 90 60, 90 90 L 110 90 C 110 70, 130 70, 130 90 L 130 100 L 20 100 Z" fill="#0C0C0C" />
            <circle cx="30" cy="65" r="8" fill="#0C0C0C" />
            <circle cx="75" cy="55" r="8" fill="#0C0C0C" />
            <circle cx="120" cy="65" r="8" fill="#0C0C0C" />
        </g>

      </g>
      <defs>
        <clipPath id="clip0_105_2">
          <path
            d="M100 0L10 40V130C10 180 50 225 100 230C150 225 190 180 190 130V40L100 0Z"
            fill="white"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
