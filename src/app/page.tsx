// /src/app/page.tsx

import { FirstSection } from "./components/Home/MainSection/FirstSection";
import HeroSection from "./components/Home/HeroSection/HeroSection";
import AsciiLogger from "./components/Global/AsciiLogger";
import { getPageMetadata } from '@/lib/metadata';
import { Metadata } from 'next';
import React from "react";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('default', {}); 
}

export default function Home() {
  return (
    <div className="relative w-full overflow-x-hidden">
      <main className="relative w-full">
        <AsciiLogger /> 
        <HeroSection />
        <FirstSection />
      </main>
    </div>
  );
}