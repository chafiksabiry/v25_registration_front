export interface Gig {
  _id: string;
  title: string;
  description: string;
  category: string;
  commission: {
    commission_per_call: number;
    currency?: { code: string; symbol: string } | string;
  };
}

const API_URL = import.meta.env.VITE_API_URL_GIGS || 'https://v25gigsmanualcreationbackend-production.up.railway.app/api';

export const gigsApi = {
  fetchFeaturedGigs: async (): Promise<Gig[]> => {
    try {
      let response = await fetch(`${API_URL}/gigs/active`);
      let json = await response.json();
      
      let fetchedGigs: Gig[] = json.data || [];
      
      // Fallback to all gigs if active gigs are less than 3
      if (fetchedGigs.length < 3) {
        response = await fetch(`${API_URL}/gigs`);
        json = await response.json();
        fetchedGigs = json.data || [];
      }

      // Shuffle and take 3
      const shuffled = fetchedGigs.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      throw error;
    }
  }
};
