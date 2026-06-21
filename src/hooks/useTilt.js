import { useState, useRef, useEffect } from 'react';

/**
 * A hook that calculates 3D tilt styles based on mouse movement relative to the card's center.
 * @param {number} maxTilt Maximum tilt angle in degrees.
 * @param {number} scale Scale multiplier on hover.
 */
export default function useTilt(maxTilt = 10, scale = 1.02) {
  const [transform, setTransform] = useState('');
  const elementRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!elementRef.current) return;
    const el = elementRef.current;
    const rect = el.getBoundingClientRect();
    
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const px = x / (rect.width / 2);
    const py = y / (rect.height / 2);
    
    // Rotate relative to standard axes: X axis rotation uses Y displacement, Y axis rotation uses X displacement
    const rotateX = (-py * maxTilt).toFixed(2);
    const rotateY = (px * maxTilt).toFixed(2);
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`);
  };

  const handleMouseLeave = () => {
    setTransform(`perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
  };

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    
    el.style.transition = 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.15s ease';
    el.style.willChange = 'transform';
  }, []);

  return {
    ref: elementRef,
    style: { transform },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };
}
