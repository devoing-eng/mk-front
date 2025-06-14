// src/lib/metadata.ts

import { PageData } from "@/types/metadataTypes";
import { generateOGImageUrl } from "./og-helpers";
import { Metadata } from "next";


type PageType = 'coin' | 'creator' | 'default';

export async function getPageMetadata(type: PageType, data: PageData): Promise<Metadata> {
  // Base metadata that's common across all pages
  const baseMetadata: Metadata = {
    metadataBase: new URL('https://www.memekult.com'),
    authors: [{ name: 'MemeKult' }],
    icons: {
      icon: '/images/mk-logo.png',
      shortcut: '/images/mk-logo.png',
      apple: '/images/mk-logo.png',
    },
  };

  switch (type) {
    case 'coin': {
      const ogImage = generateOGImageUrl({
        type: 'coin',
        coinId: data.coinId
      });

      return {
        ...baseMetadata,
        title: `${data.name} | Buy ${data.name} on MemeKult`,
        description: `${data.description}`,
        openGraph: {
          type: 'website',
          locale: 'en_US',
          url: `https://www.memekult.com/coin/${data.coinId}`,
          siteName: 'MemeKult',
          title: `${data.name} | Buy ${data.name} on MemeKult`,
          description: `${data.description}`,
          images: [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: `${data.name} on MemeKult`,
            }
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: `${data.name} | Buy ${data.name} on MemeKult`,
          description: `${data.description}`,
          creator: '@memekult_com',
          images: [ogImage],
        },
      };
    }

    case 'creator': {
      const ogImage = generateOGImageUrl({
        type: 'creator',
        userAddress: data.id,
      });

      return {
        ...baseMetadata,
        title: `${data.name} | MemeKult - Follow ${data.name} on MemeKult`,
        description: `${data.description}`,
        openGraph: {
          type: 'profile',
          locale: 'en_US',
          url: `https://www.memekult.com/creator/${data.id}`,
          siteName: 'MemeKult',
          title: `${data.name} | MemeKult - Follow ${data.name} on MemeKult`,
          description: `${data.description}`,
          images: [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: `${data.name}'s MemeKult Profile`,
            }
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: `${data.name} | MemeKult - Follow ${data.name} on MemeKult`,
          description: `${data.description}`,
          creator: `${data.name} | MemeKult`,
          images: [ogImage],
        },
      };
    }

    default: {
      const ogImage = generateOGImageUrl({ type: 'default' });

      return {
        ...baseMetadata,
        title: "Launch Coin for Free on Ethereum | MemeKult",
        description: "Launch Meme Coins on Ethereum without Gas Fee. Create Meme on Base Layer 2 and Become Kult on Ethereum.",
        openGraph: {
          type: 'website',
          locale: 'en_US',
          url: 'https://www.memekult.com',
          siteName: 'MemeKult',
          title: 'Launch Coin for Free on Ethereum | MemeKult',
          description: 'Launch Meme Coins on Ethereum without Gas Fee. Create Meme on Base Layer 2 and Become Kult on Ethereum.',
          images: [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: 'MemeKult - Launch Coins on Ethereum',
            }
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Launch Coin for Free on Ethereum | MemeKult',
          description: 'Launch Meme Coins on Ethereum without Gas Fee. Create Meme on Base Layer 2 and Become Kult on Ethereum.',
          creator: '@memekult_com',
          images: [ogImage],
        },
      };
    }
  }
}