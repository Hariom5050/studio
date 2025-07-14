
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
          fill="#000000"
        />

        {/* K */}
        <text
          x="45"
          y="85"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fontSize="50"
          fill="white"
          textAnchor="middle"
        >
          K
        </text>

        {/* Torch */}
        <g transform="translate(130 45) scale(0.2)">
          <path
            d="M65.6,35.8c0-13.2,10.7-23.9,23.9-23.9s23.9,10.7,23.9,23.9c0,11.8-8.6,21.7-19.8,23.5v11.7c0,2.3-1.8,4.1-4.1,4.1
	s-4.1-1.8-4.1-4.1V59.3C74.2,57.5,65.6,47.6,65.6,35.8z M89.5,50.1c7.8,0,14.2-6.4,14.2-14.2c0-7.8-6.4-14.2-14.2-14.2
	s-14.2,6.4-14.2,14.2C75.3,43.7,81.7,50.1,89.5,50.1z"
            fill="white"
          />
          <path
            d="M102.3,0C87.4,0,75.3,12.1,75.3,27c0,13.5,10,24.6,22.8,26.6v-8.1c-8.2-1.8-14.6-9-14.6-17.7c0-10,8.1-18.1,18.1-18.1
	s18.1,8.1,18.1,18.1c0,8.7-6.3,16-14.6,17.7v8.1c12.8-2,22.8-13.1,22.8-26.6C129.3,12.1,117.2,0,102.3,0z"
            fill="white"
          />
          <path
            d="M104.4,96.4H95.8c-2.3,0-4.1,1.8-4.1,4.1V125c0,2.3,1.8,4.1,4.1,4.1h8.6c2.3,0,4.1-1.8,4.1-4.1v-24.5
	C108.5,98.2,106.7,96.4,104.4,96.4z"
            fill="white"
          />
          <path
            d="M86.1,77.5c-3-2.1-6.4-3.4-10.2-3.8v9.9c1,0.2,2,0.4,2.9,0.7c3.8,1,6.7,4.3,6.7,8.3v36.8h8.2V83.5
	C93.7,81.3,90.3,79.1,86.1,77.5z"
            fill="white"
          />
          <path
            d="M113.8,73.7c-3.8,0.4-7.2,1.7-10.2,3.8c-4.2,2.6-7.6,4.8-7.6,7v37.9h8.2V89.6c0-4,2.9-7.3,6.7-8.3c0.9-0.2,1.9-0.5,2.9-0.7
	V73.7z"
            fill="white"
          />
        </g>

        {/* Atom */}
        <g transform="translate(50 150) scale(0.35) rotate(-30)">
          <circle cx="50" cy="50" r="5" fill="white" />
          <ellipse
            cx="50"
            cy="50"
            rx="45"
            ry="20"
            stroke="white"
            strokeWidth="3"
            fill="none"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="20"
            ry="45"
            stroke="white"
            strokeWidth="3"
            fill="none"
            transform="rotate(60 50 50)"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="20"
            ry="45"
            stroke="white"
            strokeWidth="3"
            fill="none"
            transform="rotate(-60 50 50)"
          />
        </g>

        {/* Book and Tree */}
        <g transform="translate(150 155) scale(0.35)">
          <path
            d="M80,60H20c-5.5,0-10,4.5-10,10v70h80V70C90,64.5,85.5,60,80,60z M45,130H20V70h25V130z"
            fill="white"
          />
          <path
            d="M50,40c-13.8,0-25,11.2-25,25v85h10V65c0-8.3,6.7-15,15-15s15,6.7,15,15v85h10V65C75,51.2,63.8,40,50,40z"
            fill="white"
          />
          <path
            d="M50,15 C35,15 25,25 25,40 L 25,60 C 25,50 35,45 50,45 C 65,45 75,50 75,60 L 75,40 C 75,25 65,15 50,15 Z"
            fill="white"
          />
          <path
            d="M50 70 Q 40 80 30 90 M50 70 Q 60 80 70 90 M40 80 Q 35 90 30 100 M60 80 Q 65 90 70 100"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </g>

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
