import React from 'react';
import { ArrowRight, Bot, Clock, Globe, Laptop, PhoneCall, Target, CheckCircle2, Users2 } from 'lucide-react';
import { Button } from './Button';

interface ForRepsProps {
  onGetStarted: () => void;
}

const payHighlights = [
  {
    icon: PhoneCall,
    text: 'Paid (floor) for every serious call, even without a transaction',
  },
  {
    icon: Bot,
    text: 'Paid commission on every transaction confirmed by our AI',
  },
  {
    icon: Target,
    text: 'Paid when you hit your monthly target',
  },
];

const benefits = [
  {
    title: "Flexible Work",
    description: "Choose your hours and work from anywhere in the world.",
    icon: Clock,
    color: "harx"
  },
  {
    title: "Growth Opportunities",
    description: "Continuous learning and career advancement possibilities.",
    icon: Users2,
    color: "harx"
  },
  {
    title: "Global Network",
    description: "Connect with clients and colleagues worldwide.",
    icon: Globe,
    color: "harx"
  },
  {
    title: "Advanced Tools",
    description: "Use our AI-powered platform to maximize your success.",
    icon: Laptop,
    color: "harx"
  }
];

const repStories = [
  {
    name: "Fatima Al-Sayed",
    location: "Kuwait City, Kuwait",
    expertise: "Financial Services & Customer Success",
    company: "HARX Global Network",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400",
    quote: "The AI-powered platform helps me provide exceptional support to global clients while maintaining a perfect work-life balance."
  },
  {
    name: "Kwame Osei",
    location: "Accra, Ghana",
    expertise: "Technical Support & Product Specialist",
    company: "HARX Global Network",
    image: "https://images.unsplash.com/photo-1578496781985-452d4a934d50?auto=format&fit=crop&w=400&h=400",
    quote: "HARX's technology allows me to focus on what matters most - solving customer problems efficiently while continuously improving my skills."
  },
  {
    name: "Mei Zhang",
    location: "Singapore",
    expertise: "E-commerce & Digital Solutions",
    company: "HARX Global Network",
    image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?auto=format&fit=crop&w=400&h=400",
    quote: "The platform's multilingual capabilities and AI assistance make it possible to serve customers across Asia effectively."
  },
  {
    name: "Raj Patel",
    location: "Mumbai, India",
    expertise: "Enterprise Solutions & Integration",
    company: "HARX Global Network",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400",
    quote: "HARX's flexible platform and continuous learning opportunities have helped me grow from a support agent to a solutions architect."
  }
];

export function ForReps({ onGetStarted }: ForRepsProps) {
  return (
    <div className="pt-8 pb-12">
      {/* Hero Section with Inspiring Image */}
      <div className="relative h-[600px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1920&q=80"
          alt="Remote work lifestyle"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-harx-950/90 to-harx-900/50">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="max-w-3xl">
              <h1 className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl">
                Earn money. Extra income. Or a full income.
              </h1>
              <h3 className="mb-5 text-xl font-bold leading-snug text-white md:text-2xl">
                No boss. No office. No fixed schedule. Just you, your laptop — and your skills.
              </h3>
              <div className="mb-8 space-y-3">
                <p className="text-base font-medium leading-relaxed text-white/90 md:text-lg">
                  HARX connects you to companies that need you. And pays you for every effort:
                </p>
                <ul className="space-y-3">
                  {payHighlights.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-3 text-base leading-relaxed text-white/90 md:text-lg">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-harx-300 ring-1 ring-white/20">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="gradient"
                  onClick={onGetStarted}
                  className="group"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-b from-harx-50 to-white">
        <div className="container mx-auto px-4 py-24">
          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-gradient-harx rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Rep Stories */}
          <div className="max-w-6xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-center mb-4">Meet Our Global Representatives</h2>
            <p className="text-center text-gray-600 mb-12">
              Discover how professionals worldwide are building successful careers with HARX
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {repStories.map((story, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center mb-6">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-16 h-16 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-lg">{story.name}</h3>
                      <p className="text-harx-600">{story.expertise}</p>
                      <p className="text-gray-600 text-sm">{story.location}</p>
                    </div>
                  </div>
                  <blockquote className="text-gray-700 italic">
                    "{story.quote}"
                  </blockquote>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements Section */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-center mb-12">What We Look For</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">Skills & Experience</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-harx-500 mr-2" />
                    <span>Customer service experience</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-harx-500 mr-2" />
                    <span>Strong communication skills</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-harx-500 mr-2" />
                    <span>Problem-solving abilities</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-harx-500 mr-2" />
                    <span>Tech-savvy mindset</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">Technical Requirements</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-harx-500 mr-2" />
                    <span>Reliable internet connection</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-harx-500 mr-2" />
                    <span>Modern computer or laptop</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-harx-500 mr-2" />
                    <span>Quiet workspace</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-harx-500 mr-2" />
                    <span>Professional headset</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Join Our Team?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="gradient"
                onClick={onGetStarted}
                className="group"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
