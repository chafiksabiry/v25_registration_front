import React from 'react';

const testimonials = [
  {
    quote: "HARX's AI-powered platform has transformed our customer service operations. We've seen substantial improvements in first-call resolution rates and consistently higher customer satisfaction scores.",
    author: "Aisha Al-Mansouri",
    role: "VP of Digital Transformation",
    company: "Gulf Innovation Systems",
    image: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=200&h=200"
  },
  {
    quote: "The transaction-based pricing model aligned perfectly with our goals. We only pay for successful resolutions, which has helped us optimize our service costs while maintaining high quality.",
    author: "Oluwaseun Adebayo",
    role: "Director of Operations",
    company: "Afritech Solutions Limited",
    image: "https://images.unsplash.com/photo-1539701938214-0d9736e1c16b?auto=format&fit=crop&w=200&h=200"
  },
  {
    quote: "What impressed us most was how HARX's AI technology enhanced our existing team's capabilities. Our agents are now more efficient and confident in handling complex customer interactions.",
    author: "Priya Ranganathan",
    role: "Chief Technology Officer",
    company: "Innovate Dynamics",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&h=200"
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">
          Trusted by Industry Leaders
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.author}</h4>
                  <p className="text-harx-600 text-sm">{testimonial.role}</p>
                  <p className="text-gray-600 text-sm">{testimonial.company}</p>
                </div>
              </div>
              <blockquote className="text-gray-700">
                "{testimonial.quote}"
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
