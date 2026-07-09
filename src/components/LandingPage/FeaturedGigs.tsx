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
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCard(prev => prev === id ? null : id);
  };

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
            commission: { commission_per_call: 15, commission_per_transaction: 500, bonus: 100 }
          },
          {
            _id: '2',
            title: 'Healthcare Solutions Representative',
            description: 'Present innovative telemedicine platforms to clinics and hospitals.',
            category: 'Healthcare',
            commission: { commission_per_call: 20, commission_per_transaction: 800 }
          },
          {
            _id: '3',
            title: 'Real Estate Investment Advisor',
            description: 'Qualify potential property investors for exclusive commercial real estate opportunities.',
            category: 'RealEstate',
            commission: { commission_per_call: 30, bonus: 500 }
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
              
              <div className="relative z-10 flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-gradient-harx rounded-xl flex items-center justify-center shadow-lg shadow-harx-500/10 group-hover:scale-110 transition-transform duration-500">
                    {CATEGORY_ICONS[gig.category] || CATEGORY_ICONS['Default']}
                  </div>
                  <div className="inline-block px-3 py-1 bg-white/[0.04] border border-white/10 text-slate-200 text-xs font-semibold rounded-full">
                    {gig.category || 'Business'}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 drop-shadow-[0_1px_8px_rgba(255,77,77,0.15)]">
                  {gig.title}
                </h3>
                
                <div className="mb-6">
                  <p className={`text-slate-350 text-sm leading-relaxed ${expandedCard === gig._id ? '' : 'line-clamp-3'} transition-all duration-300`}>
                    {gig.description}
                  </p>
                  {(gig.description?.length > 120) && (
                    <button 
                      onClick={() => toggleExpand(gig._id)}
                      className="text-harx-400 hover:text-harx-300 text-xs font-semibold mt-2 transition-colors inline-flex items-center"
                    >
                      {expandedCard === gig._id ? 'Read less' : 'Read more...'}
                    </button>
                  )}
                </div>

                {/* Additional Details (shown when expanded) */}
                {expandedCard === gig._id && (
                  <div className="space-y-3 mb-6 animate-fade-in border-t border-white/10 pt-4">
                    {gig.requirements && (
                      <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">Requirements</span>
                        <p className="text-sm text-slate-200">{gig.requirements}</p>
                      </div>
                    )}
                    {gig.goals && (
                      <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">Goals</span>
                        <p className="text-sm text-slate-200">{gig.goals}</p>
                      </div>
                    )}
                    {gig.language && (
                      <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">Language</span>
                        <p className="text-sm text-slate-200">{gig.language}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-auto relative z-10 flex flex-col justify-between pt-6 border-t border-white/10">
                <div className="group/commission mb-4">
                  <p className="text-xs text-slate-400 font-medium mb-3">Commissions</p>
                  <div className="flex flex-wrap gap-2">
                    {gig.commission?.commission_per_call && (
                      <div className="relative inline-flex flex-col gap-0.5 px-3 py-1.5 rounded-lg bg-harx-500/10 border border-harx-500/30 animate-glow-pulse group-hover/commission:border-harx-400/60 transition-all duration-300">
                        <span className="text-sm font-black text-white drop-shadow-[0_0_8px_rgba(255,77,77,0.8)]">
                          €{(gig.commission.commission_per_call * 0.7).toFixed(2)}
                        </span>
                        <span className="text-[9px] font-bold text-harx-300 uppercase tracking-wide">/ call</span>
                      </div>
                    )}
                    {gig.commission?.commission_per_transaction && (
                      <div className="relative inline-flex flex-col gap-0.5 px-3 py-1.5 rounded-lg bg-harx-alt-500/10 border border-harx-alt-500/30 animate-glow-pulse group-hover/commission:border-harx-alt-400/60 transition-all duration-300" style={{ animationDelay: '0.5s' }}>
                        <span className="text-sm font-black text-white drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">
                          €{(gig.commission.commission_per_transaction * 0.7).toFixed(2)}
                        </span>
                        <span className="text-[9px] font-bold text-harx-alt-300 uppercase tracking-wide">/ success</span>
                      </div>
                    )}
                    {gig.commission?.bonus && (
                      <div className="relative inline-flex flex-col gap-0.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 animate-glow-pulse group-hover/commission:border-purple-400/60 transition-all duration-300" style={{ animationDelay: '1s' }}>
                        <span className="text-sm font-black text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">
                          €{(gig.commission.bonus * 0.7).toFixed(2)}
                        </span>
                        <span className="text-[9px] font-bold text-purple-300 uppercase tracking-wide">bonus</span>
                      </div>
                    )}
                    {!gig.commission?.commission_per_call && !gig.commission?.commission_per_transaction && !gig.commission?.bonus && (
                      <div className="relative inline-flex items-center px-3 py-1.5 rounded-lg bg-harx-500/10 border border-harx-500/30">
                         <span className="text-sm font-black text-white">Variable</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    onClick={() => window.location.href = '/reporchestrator/profile-import'}
                    className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center group-hover:bg-gradient-harx transition-all duration-300 shadow-md hover:shadow-harx-500/30"
                  >
                    <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                  </button>
                </div>
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
