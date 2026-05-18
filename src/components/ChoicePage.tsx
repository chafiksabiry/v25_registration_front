import React from 'react';
import { Building2, Users, ArrowRight, Headphones, PhoneCall, MessagesSquare, Phone, HeadphonesIcon, Target, LogIn } from 'lucide-react';

interface ChoicePageProps {
  onSelectRole: (role: 'company' | 'rep') => void;
  onSignIn: () => void;
}

export default function ChoicePage({ onSelectRole, onSignIn }: ChoicePageProps) {
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-harx-50 to-white flex flex-col animate-fade-in relative">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="text-2xl font-bold text-harx-600">HARX</div>

      </nav>

      <div
        className="h-[42vh] bg-cover bg-center relative flex-shrink-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80")'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-harx-900/40"></div>

        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="max-w-[43rem] w-full p-1">
            <div className="pt-16"></div>

            <h1 className="text-xl md:text-3xl font-bold text-white mb-1 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Transform Your Contact Center
            </h1>
            <p className="text-sm md:text-lg text-gray-100 max-w-2xl mx-auto leading-relaxed">
              Connect with opportunities or find the perfect talent for your customer service needs
            </p>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="flex-1 container mx-auto px-4 py-2 relative z-10 flex items-center justify-center overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 max-w-5xl w-full mx-auto">
          {/* Company Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100">
            <div className="h-40 rounded-t-2xl relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80"
                alt="Modern office"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  Post a Gig
                </h2>
                <p className="text-gray-200 text-base">
                  For companies seeking customer service talent
                </p>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="p-1 bg-harx-100 rounded-lg mr-2">
                    <HeadphonesIcon className="w-4 h-4 text-harx-600" />
                  </div>
                  <span className="font-medium text-sm">Customer Service Representatives</span>
                </div>
                <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="p-1 bg-harx-100 rounded-lg mr-2">
                    <PhoneCall className="w-4 h-4 text-harx-600" />
                  </div>
                  <span className="font-medium text-sm">Telesales Professionals</span>
                </div>
                <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="p-1 bg-harx-100 rounded-lg mr-2">
                    <MessagesSquare className="w-4 h-4 text-harx-600" />
                  </div>
                  <span className="font-medium text-sm">Live Chat Support Agents</span>
                </div>
                <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="p-1 bg-harx-100 rounded-lg mr-2">
                    <Target className="w-4 h-4 text-harx-600" />
                  </div>
                  <span className="font-medium text-sm">Technical Support Specialists</span>
                </div>
              </div>
              <button
                onClick={() => onSelectRole('company')}
                className="mt-4 w-full bg-gradient-harx text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-harx-500/30 active:scale-[0.98] group-hover:opacity-90"
              >
                Post a Gig
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Professional Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100">
            <div className="h-40 rounded-t-2xl relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80"
                alt="Customer service professional"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  Find Gigs
                </h2>
                <p className="text-gray-200 text-base">
                  For contact center professionals
                </p>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="p-1 bg-harx-alt-100 rounded-lg mr-2">
                    <Building2 className="w-4 h-4 text-harx-alt-600" />
                  </div>
                  <span className="font-medium text-sm">Work with Leading Companies</span>
                </div>
                <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="p-1 bg-harx-alt-100 rounded-lg mr-2">
                    <Phone className="w-4 h-4 text-harx-alt-600" />
                  </div>
                  <span className="font-medium text-sm">Remote Opportunities Available</span>
                </div>
                <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="p-1 bg-harx-alt-100 rounded-lg mr-2">
                    <Headphones className="w-4 h-4 text-harx-alt-600" />
                  </div>
                  <span className="font-medium text-sm">Flexible Scheduling Options</span>
                </div>
                <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="p-1 bg-harx-alt-100 rounded-lg mr-2">
                    <Users className="w-4 h-4 text-harx-alt-600" />
                  </div>
                  <span className="font-medium text-sm">Join Professional Communities</span>
                </div>
              </div>
              <button
                onClick={() => onSelectRole('rep')}
                className="mt-4 w-full bg-gradient-to-r from-harx-alt-500 to-harx-500 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-harx-alt-500/30 active:scale-[0.98] group-hover:opacity-90"
              >
                Find Gigs
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
