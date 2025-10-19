'use client';

import { WhatIDoProps } from '@/types';

export default function WhatIDo({ services }: WhatIDoProps) {
  return (
    <section className="min-h-screen lg:h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 lg:py-0" aria-labelledby="services-heading">
      <div className="max-w-6xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 id="services-heading" className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            What I Do
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            I specialize in building scalable, automated solutions that help businesses move faster and more efficiently.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group relative p-8 bg-background border border-foreground/10 rounded-xl transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-2"
              style={{
                animationDelay: `${index * 0.2}s`
              }}
            >
              {/* Card Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="mb-6 text-accent group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-accent transition-colors duration-300">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-muted leading-relaxed group-hover:text-foreground/90 transition-colors duration-300">
                  {service.description}
                </p>
              </div>

              {/* Hover Border Effect */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-accent/20 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}