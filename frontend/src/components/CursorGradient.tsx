import React, { useEffect, useRef } from 'react';

const CursorGradient: React.FC = () => {
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (gradientRef.current) {
        const { clientX, clientY } = event;
        gradientRef.current.style.background = `radial-gradient(circle 100px at ${clientX}px ${clientY}px, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%)`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={gradientRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default CursorGradient;