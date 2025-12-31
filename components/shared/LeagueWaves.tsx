import React from 'react';

export default function LeagueWaves({ league }: { league: string }) {
  // You can customize the SVG or visual per league if desired
  return (
    <div className="flex justify-center mb-4">
      <svg width="80" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 16 Q 10 8, 20 16 T 40 16 T 60 16 T 80 16" stroke="#fff" strokeWidth="3" fill="none" opacity="0.7"/>
        <path d="M0 24 Q 10 16, 20 24 T 40 24 T 60 24 T 80 24" stroke="#fff" strokeWidth="2" fill="none" opacity="0.5"/>
        <path d="M0 8 Q 10 0, 20 8 T 40 8 T 60 8 T 80 8" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.3"/>
      </svg>
    </div>
  );
}
