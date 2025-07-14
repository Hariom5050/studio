import React from 'react';
import Image from 'next/image';

const Logo = () => {
  return (
    <Image
      src="https://i.ibb.co/b3C3N9b/kws-logo-white-bg.jpg"
      alt="Kingswood World School Logo"
      width={40}
      height={40}
      className="rounded-full"
    />
  );
};

export default Logo;
