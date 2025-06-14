// src/app/sitemap.ts

import { MetadataRoute } from 'next'
import { config } from '@/config/environment'

// Helper function for API requests with error handling
async function fetchData<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch from ${url}: ${response.statusText}`);
      return [] as T;
    }
    return await response.json() as T;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    return [] as T;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch data from your API endpoints
  const [coins, users] = await Promise.all([
    fetchData<{ id: string }[]>(`https://api.memekult.com/api/coins/ids`),
    fetchData<{ address: string }[]>(`https://api.memekult.com/api/users/ids`)
  ]);

  // Create user page entries
  const userPages = users.map((user) => ({
    url: `${config.frontend.baseUrl}/creator/${user.address}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Create coin page entries
  const coinPages = coins.map((coin) => ({
    url: `${config.frontend.baseUrl}/coin/${coin.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Static pages
  const staticPages = [
    {
      url: config.frontend.baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${config.frontend.baseUrl}/launch`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  // Combine all pages
  return [...staticPages, ...userPages, ...coinPages];
}