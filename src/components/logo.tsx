import React from 'react';

const Logo = () => {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <clipPath id="circleClip">
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <image
        xlinkHref="https://i.ibb.co/b3C3N9b/kws-logo-white-bg.jpg"
        x="0"
        y="0"
        width="100"
        height="100"
        clipPath="url(#circleClip)"
      />
    </svg>
  );
};

export default Logo;
