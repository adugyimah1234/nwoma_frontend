import Image from 'next/image';

export const Logo = () => (
  <Image
    src="/logo.png" // Update with your actual logo path
    alt="School Logo"
    width={64} // Set appropriate width
    height={64} // Set appropriate height
    className="h-16 w-auto"
    priority // Optional: improves LCP for above-the-fold images
  />
);
