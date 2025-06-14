// src/services/launchTermsApi.ts

export const launchTermsApi = {
  getStatus: async (address: string) => {
    if (address) {

      const response = await fetch('/api/terms/status', {
        headers: {
          'X-User-Address': address,
        }
      });
      const data = await response.json();
      return data.data.hasCheckedLaunch;
    }
  },

  acceptTerms: async (address: string) => {
    if (address) {
      const response = await fetch('/api/terms/accept', {
        method: 'POST',
        headers: {
          'X-User-Address': address,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'launch' })
      });
      
      const data = await response.json();
      return data.success;
    }
  }
};