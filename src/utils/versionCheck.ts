// src/utils/versionCheck.ts

export async function checkAppVersion() {
  try {
    const response = await fetch('/version.json?t=' + Date.now());
    const { version } = await response.json();
    const storedVersion = localStorage.getItem('app-version');
    
    if (storedVersion && storedVersion !== version) {
      console.log('New version detected, clearing cache');
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      localStorage.setItem('app-version', version);
      window.location.reload();
    } else if (!storedVersion) {
      localStorage.setItem('app-version', version);
    }
  } catch (error) {
    console.warn('Version check failed:', error);
  }
}