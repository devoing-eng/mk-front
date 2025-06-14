// src/app/launch/page.tsx

import LaunchDetails from '@/app/launch/components/LaunchDetails';
import LaunchForm from '@/app/launch/components/LaunchForm';
import { getPageMetadata } from '@/lib/metadata';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {

  return getPageMetadata('default', {}); // empty object as data since 'default' doesn't need specific data
}

const LaunchPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-8 pb-12 md:py-12 mt-10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-start md:gap-16">
        <LaunchDetails />
        <LaunchForm />
      </div>
    </div>
  );
};

export default LaunchPage;