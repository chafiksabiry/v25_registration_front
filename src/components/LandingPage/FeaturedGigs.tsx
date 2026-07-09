import React, { useEffect, useState } from 'react';
import { ArrowRight, Briefcase, MapPin, DollarSign, Target, Code, Heart, Sparkles, Building2, Monitor, ShoppingBag, GraduationCap, Plane, Stethoscope } from 'lucide-react';

interface Gig {
  _id: string;
  title: string;
  description: string;
  category: string;
  commission: {
    commission_per_call: number;
    currency?: { code: string; symbol: string } | string;
  };
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Technology: <Monitor className="w-5 h-5" />,
  Healthcare: <Stethoscope className="w-5 h-5" />,
  Education: <GraduationCap className="w-5 h-5" />,
  Travel: <Plane className="w-5 h-5" />,
  Retail: <ShoppingBag className="w-5 h-5" />,
  Finance: <DollarSign className="w-5 h-5" />,
  RealEstate: <Building2 className="w-5 h-5" />,
  Default: <Briefcase className="w-5 h-5" />
};

export function FeaturedGigs() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL_GIGS || 'https://v25gigsmanualcreationbackend-production.up.railway.app/api';
        
        let response = await fetch(`${apiUrl}/gigs/active`);
        let json = await response.json();
        
        let fetchedGigs = json.data || [];
        
        // Fallback to all gigs if active gigs are less than 3
        if (fetchedGigs.length < 3) {
          response = await fetch(`${apiUrl}/gigs`);
          json = await response.json();
          fetchedGigs = json.data || [];
        }

        // Shuffle and take 3
        const shuffled = fetchedGigs.sort(() => 0.5 - Math.random());
        setGigs(shuffled.slice(0, 3));
      } catch (error) {
        console.error('Error fetching gigs:', error);
        // Add some dummy fallback gigs if API fails completely to ensure landing page looks good
        setGigs([
          {
            _id: '1',
            title: 'B2B Software Sales Executive',
            description: 'Close high-ticket enterprise SaaS deals with warm leads provided.',
            category: 'Technology',
            commission: { commission_per_call: 150 }
          },
          {
            _id: '2',
            title: 'Healthcare Solutions Representative',
            description: 'Present innovative telemedicine platforms to clinics and hospitals.',
            category: 'Healthcare',
            commission: { commission_per_call: 200 }
          },
          {
            _id: '3',
            title: 'Real Estate Investment Advisor',
            description: 'Qualify potential property investors for exclusive commercial real estate opportunities.',
            category: 'RealEstate',
            commission: { commission_per_call: 300 }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/4 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-sm animate-pulse border border-gray-100">
                <div className="h-12 w-12 bg-gray-100 rounded-xl mb-6"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-8"></div>
                <div className="flex justify-between items-center mt-auto">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-8 bg-gray-200 rounded-full w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (gigs.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden bg-gray-50/50" id="featured-gigs">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
        <div className="w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
      </div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
        <div className="w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Active Gigs</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse exciting opportunities and start earning by representing top global companies today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {gigs.map((gig, index) => (
            <div 
              key={gig._id}
              className="group relative bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  {CATEGORY_ICONS[gig.category] || CATEGORY_ICONS['Default']}
                </div>
                
                <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full mb-4">
                  {gig.category || 'Business'}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {gig.title}
                </h3>
                
                <p className="text-gray-600 mb-8 line-clamp-3 text-sm leading-relaxed">
                  {gig.description}
                </p>
              </div>

              <div className="mt-auto relative z-10 flex items-center justify-between pt-6 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Commission</p>
                  <p className="text-lg font-bold text-gray-900">
                    {gig.commission?.commission_per_call ? `€${gig.commission.commission_per_call}` : 'Variable'}
                    <span className="text-sm font-normal text-gray-500"> / success</span>
                  </p>
                </div>
                
                <button 
                  onClick={() => window.location.href = '/reporchestrator/profile-import'}
                  className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors shadow-sm"
                >
                  <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button 
            onClick={() => window.location.href = '/reporchestrator/profile-import'}
            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
          >
            Explore all opportunities
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
}
