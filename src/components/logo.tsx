import Image from 'next/image';

const Logo = () => (
  <div className="flex items-center justify-center h-screen">
    <Image
      src="https://i.ibb.co/Vt65r2n/344873839-1234390740847039-4467597143953335759-n-removebg-preview.png"
      alt="Logo"
      width={500}
      height={500}
      className="animate-in fade-in"
    />
  </div>
);

export default Logo;
