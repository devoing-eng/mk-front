// src/app/not-found.tsx

import Image from 'next/image';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="flex flex-col justify-center min-h-screen">
      <div className="inset-0 flex items-center justify-center">
        <Image
          src="/images/404.svg"
          alt="Page not found"
          width={600}
          height={600}
        />
      </div>
      <div className="z-10 text-center -mt-16">
        <h1 className="bg-[#0D121F] text-2xl md:text-3xl lg:text-5xl font-bold text-purple-600 mb-8 p-2 rounded-lg">Page not found.</h1>
        <Link href="/" className="inline-block px-6 py-3 text-lg font-medium text-white bg-indigo-400 rounded-full hover:bg-indigo-600 transition duration-300">
            Go Home
        </Link>
      </div>
    </div>
  );
}