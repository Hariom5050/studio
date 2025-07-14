
import { cn } from "@/lib/utils";
import React from "react";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 230"
      className={cn(className)}
      aria-label="KWS AI Logo"
    >
      <g>
        <path
          d="M100 0L0 25V95C0 165 100 230 100 230S200 165 200 95V25L100 0Z"
          className="fill-current text-primary"
        />
        <path
          d="M100 20L180 40V95C180 155 100 210 100 210S20 155 20 95V40L100 20Z"
          fill="black"
        />

        {/* K */}
        <text
          x="55"
          y="80"
          fontFamily="serif"
          fontWeight="bold"
          fontSize="45"
          fill="white"
          textAnchor="middle"
        >
          K
        </text>

        {/* Torch */}
        <g transform="translate(110 50) scale(0.28)">
          <path d="M21.5,50.5 V38.2 c0,-1.3 0.9,-2.3 2,-2.3 h2.9 c1.1,0 2,1 2,2.3 v12.3 c0,1.3 -0.9,2.3 -2,2.3 h-2.9 C22.4,52.8 21.5,51.8 21.5,50.5 z" fill="white" />
          <path d="M28.5,35.8 c-0.8,-0.9 -1.3,-2 -1.3,-3.3 c0,-2.6 1.8,-4.7 4.1,-4.7 s4.1,2.1 4.1,4.7 c0,1.3 -0.5,2.5 -1.3,3.3 c-1.6,1.6 -4,2.6 -6.5,2.6 C32.5,38.4 30.1,37.4 28.5,35.8 z" fill="white" />
          <path d="M24.4,26c-1.1,0-2-0.9-2-2V13.8c0-1.1,0.9-2,2-2s2,0.9,2,2V24C26.4,25.1,25.5,26,24.4,26z" fill="white" />
          <path d="M33.4,24.5c-1.1,0-2-0.9-2-2V12.3c0-1.1,0.9-2,2-2s2,0.9,2,2v10.2C35.4,23.6,34.5,24.5,33.4,24.5z" fill="white" />
        </g>


        {/* Atom */}
        <g transform="translate(50 150) scale(0.35) rotate(-15)">
          <circle cx="50" cy="50" r="7" fill="white" />
          <ellipse
            cx="50"
            cy="50"
            rx="45"
            ry="20"
            stroke="white"
            strokeWidth="4"
            fill="none"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="45"
            ry="20"
            stroke="white"
            strokeWidth="4"
            fill="none"
            transform="rotate(60 50 50)"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="45"
            ry="20"
            stroke="white"
            strokeWidth="4"
            fill="none"
            transform="rotate(-60 50 50)"
          />
        </g>

        {/* Book and Tree */}
        <g transform="translate(145 155) scale(0.38)">
          {/* Book */}
          <path d="M80,60H20c-5.5,0-10,4.5-10,10v70h80V70C90,64.5,85.5,60,80,60z M45,130H20V70h25V130z" fill="white"/>
          {/* Tree */}
          <path d="M50,15 C35,15 25,25 25,40 L 25,60 C 25,50 35,45 50,45 C 65,45 75,50 75,60 L 75,40 C 75,25 65,15 50,15 Z" fill="white"/>
          <path d="M50 70 L 50 45" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>

        {/* Dividing Lines */}
        <path
          d="M100,20 v190 M20,105 h160"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
        />
        
        {/* Crown */}
        <path d="M40,30 Q50,10 60,30 T80,30 Q90,10 100,30 T120,30 Q130,10 140,30 T160,30 L160,40 L40,40 Z" fill="black" />
        <path d="M40,30 Q50,10 60,30 T80,30 Q90,10 100,30 T120,30 Q130,10 140,30 T160,30" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" />
        <circle cx="60" cy="22" r="3" fill="hsl(var(--primary))" />
        <circle cx="100" cy="22" r="3" fill="hsl(var(--primary))" />
        <circle cx="140" cy="22" r="3" fill="hsl(var(--primary))" />

      </g>
    </svg>
  );
}
