"use client";

import { useEffect } from 'react';

export default function KeyboardScroller() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore text input fields so we don't break cursor movements
      const activeElement = document.activeElement;
      if (activeElement) {
        const tag = activeElement.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') {
          return;
        }
      }

      // Check if Arrow keys dictate scroll targeting
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const modal = document.querySelector('.modal-scroll-target');
        const target = modal || window;
        const scrollAmount = e.key === 'ArrowDown' ? 100 : -100;
        
        target.scrollBy({
          top: scrollAmount,
          behavior: 'smooth'
        });
        
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
}
