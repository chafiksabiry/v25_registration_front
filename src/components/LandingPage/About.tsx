import React from 'react';
import { Award, Globe2, Rocket, Users2, ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface AboutProps {
  onGetStarted: () => void;
}

const values = [
  {
    icon: Award,
    title: "Excellence",
    description: "We're committed to delivering outstanding results for every client, every time."
  },
  {
    icon: Users2,
    title: "Collaboration",
    description: "Success comes from working together—with our clients, our reps, and each other."
  },
  {
    icon: Rocket,
    title: "Innovation",
    description: "We constantly push boundaries to create better solutions for our clients."
  },
  {
    icon: Globe2,
    title: "Global Impact",
    description: "We're building a worldwide network that transcends borders and cultures."
  }
];

export function About({ onGetStarted }: AboutProps) {
  return (
    <div className="min-h-screen pt-16">
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-24">
        <div className="container mx-auto px-4">
          {/* Mission Section */}
          <div className="max-w-3xl mx-auto text-center mb-24">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our Mission
            </h1>
            <p className="text-xl text-gray-600">
              To revolutionize customer engagement by providing businesses with on-demand access to
              AI-enhanced contact center capabilities through our innovative Transaction-as-a-Service platform.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                onClick={onGetStarted}
                className="group"
              >
                Experience AI-Powered Service
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-center mb-16">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-green-400/10 rounded-full blur-3xl -z-10" />
      </div>
    </div>
  );
}
