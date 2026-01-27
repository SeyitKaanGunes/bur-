'use client';

import { memo, useMemo } from 'react';

// Yıldızları pre-compute et (her render'da yeniden hesaplanmaz)
function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
    opacity: Math.random() * 0.5 + 0.3,
  }));
}

function StarsComponent() {
  // useMemo ile yıldızları cache'le
  const stars = useMemo(() => generateStars(50), []); // 100 yerine 50 (performans)

  return (
    <div className="stars" aria-hidden="true">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            animationDelay: star.animationDelay,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
}

// memo ile gereksiz re-render'ları engelle
export default memo(StarsComponent);
