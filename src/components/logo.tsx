import React from 'react';
import Image from 'next/image';

const Logo = () => {
  return (
    <Image
      src="https://res.cloudinary.com/dtjjgiitl/image/upload/q_auto:good,f_auto,fl_progressive/v1752558405/scyjghobvnawzyuhfzho.jpg"
      alt="Kingswood World School Logo"
      width={80}
      height={80}
      className="rounded-full"
    />
  );
};

export default Logo;
