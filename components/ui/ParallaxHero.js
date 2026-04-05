"use client";
import { useEffect, useState } from 'react';

export default function ParallaxHero({ title, subtitle, ctaText, ctaLink, bgImage }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="parallax-hero" style={{ height: '85vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
      <div 
        className="parallax-bg" 
        style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: '-20%',
          backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center',
          transform: `translateY(${offset * 0.4}px)`, zIndex: 0
        }} 
      />
      <div className="parallax-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(11, 15, 21, 0.3) 0%, rgba(11, 15, 21, 1) 100%)', zIndex: 1 }} />
      
      <div className="container animate-fade-in" style={{ position: 'relative', zIndex: 2, transform: `translateY(${offset * 0.1}px)` }}>
        <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: title }} />
        <p className="hero-subtitle">{subtitle}</p>
        {ctaText && ctaLink && (
          <a href={ctaLink} className="btn-primary" style={{ display: 'inline-block', boxShadow: '0 0 15px rgba(0, 230, 118, 0.3)' }}>{ctaText}</a>
        )}
      </div>
    </section>
  );
}
