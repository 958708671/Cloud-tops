'use client';

import React from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  const imageSrc = icon ? `/images/${icon}` : '';
  
  return (
    <div className="p-4 sm:p-6 rounded-sm border border-mc-stone-dark transition-all duration-300 group bg-mc-stone-dark/80 hover:bg-mc-stone-dark border-pixel">
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300">
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt={title}
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement;
                if (fallback) {
                  const span = document.createElement('span');
                  span.className = 'inline-flex items-center justify-center w-12 h-12';
                  const icon = document.createElement('i');
                  icon.className = 'icon-pixel icon-wrench';
                  span.appendChild(icon);
                  fallback.appendChild(span);
                }
              }}
            />
          ) : (
            <span className="inline-flex items-center justify-center w-12 h-12"><i className="icon-pixel icon-wrench"></i></span>
          )}
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white">{title}</h3>
      </div>
      <p className="text-mc-stone-light text-sm sm:text-base">{description}</p>
    </div>
  );
};

export default FeatureCard;