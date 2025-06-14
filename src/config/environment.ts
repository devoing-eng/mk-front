// src/config/environment.ts

export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_MK_URL || 'https://api.memekult.com',
  },
  frontend: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://www.memekult.com',
  },
};