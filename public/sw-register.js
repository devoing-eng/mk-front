// public/sw-register.js

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      console.log('SW registered:', registration.scope);
      
      // Force update check
      registration.addEventListener('updatefound', () => {
        console.log('New SW version available');
        const newWorker = registration.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {      
            // New SW ready, we reload
            window.location.reload();
          }
        });
      });
      
      // Updates manual check
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute
      
    }).catch(function(err) {
      console.log('SW registration failed: ', err);
    });
  });
}