import React, { useEffect, useState } from 'react';
import { ArrowRight, Briefcase, MapPin, DollarSign, Target, Code, Heart, Sparkles, Building2, Monitor, ShoppingBag, GraduationCap, Plane, Stethoscope } from 'lucide-react';
import { gigsApi, Gig } from '../../services/gigsApi';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Technology: <Monitor className="w-6 h-6 text-white" />,
  Healthcare: <Stethoscope className="w-6 h-6 text-white" />,
  Education: <GraduationCap className="w-6 h-6 text-white" />,
  Travel: <Plane className="w-6 h-6 text-white" />,
  Retail: <ShoppingBag className="w-6 h-6 text-white" />,
  Finance: <DollarSign className="w-6 h-6 text-white" />,
  RealEstate: <Building2 className="w-6 h-6 text-white" />,
  Default: <Briefcase className="w-6 h-6 text-white" />
};

export function FeaturedGigs() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const featuredGigs = await gigsApi.fetchFeaturedGigs();
        setGigs(featuredGigs);
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
      <section className="py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/4 mx-auto"></div>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full flex-1 min-w-[300px] max-w-[400px] glass-card-premium rounded-3xl p-8 animate-pulse">
                <div className="h-14 w-14 bg-white/10 rounded-xl mb-6"></div>
                <div className="h-6 bg-white/20 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-5/6 mb-8"></div>
                <div className="flex justify-between items-center mt-auto pt-6 border-t border-white/10">
                  <div className="h-6 bg-white/20 rounded w-1/3"></div>
                  <div className="h-10 w-10 bg-white/10 rounded-full"></div>
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
    <section className="py-24 relative overflow-hidden bg-transparent" id="featured-gigs">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
        <div className="w-96 h-96 bg-harx-500/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
        <div className="w-96 h-96 bg-harx-alt-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Discover <span className="bg-clip-text text-transparent bg-gradient-harx">Active Gigs</span>
          </h2>
          <p className="text-xl text-slate-350 max-w-2xl mx-auto leading-relaxed">
            Browse exciting opportunities and start earning by representing top global companies today.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {gigs.map((gig, index) => (
            <div 
              key={gig._id}
              className="w-full flex-1 min-w-[300px] max-w-[400px] group relative glass-card-premium rounded-2xl p-8 hover:border-harx-500/30 hover:-translate-y-1 transition-all duration-500 flex flex-col"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-harx-500/5 to-harx-alt-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-harx rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-harx-500/10 group-hover:scale-110 transition-transform duration-500">
                  {CATEGORY_ICONS[gig.category] || CATEGORY_ICONS['Default']}
                </div>
                
                <div className="inline-block px-3 py-1 bg-white/[0.04] border border-white/10 text-slate-200 text-xs font-semibold rounded-full mb-4">
                  {gig.category || 'Business'}
                </div>

                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 drop-shadow-[0_1px_8px_rgba(255,77,77,0.15)]">
                  {gig.title}
                </h3>
                
                <p className="text-slate-350 mb-8 line-clamp-3 text-sm leading-relaxed">
                  {gig.description}
                </p>
              </div>

              <div className="mt-auto relative z-10 flex items-center justify-between pt-6 border-t border-white/10">
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1">Commission</p>
                  <p className="text-lg font-bold text-white">
                    {gig.commission?.commission_per_call ? `€${gig.commission.commission_per_call}` : 'Variable'}
                    <span className="text-sm font-normal text-slate-400"> / success</span>
                  </p>
                </div>
                
                <button 
                  onClick={() => window.location.href = '/reporchestrator/profile-import'}
                  className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center group-hover:bg-gradient-harx transition-all duration-300 shadow-md hover:shadow-harx-500/30"
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
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-white/[0.03] border border-white/10 hover:border-harx-500 hover:bg-white/[0.08] rounded-full transition-all duration-300 shadow-lg hover:shadow-harx-500/20"
          >
            Explore all opportunities
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
}
