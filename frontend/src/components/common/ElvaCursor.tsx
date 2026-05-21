import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const ElvaCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const trailX = useMotionValue(-100);
  const trailY = useMotionValue(-100);
  const isHovering = useRef(false);
  const scale = useMotionValue(1);

  const springX = useSpring(trailX, { damping: 22, stiffness: 280 });
  const springY = useSpring(trailY, { damping: 22, stiffness: 280 });

  useEffect(() => {
    // Only on desktop
    if (window.matchMedia('(hover: none)').matches) return;

    const isOverScrollbar = (e: MouseEvent): boolean => {
      // Native window scrollbar: clientX > clientWidth means mouse is on the scrollbar strip
      if (e.clientX > document.documentElement.clientWidth) return true;
      // Element scrollbars (modals, drawers, overflow divs)
      const target = e.target as HTMLElement;
      if (!target) return false;
      const rect = target.getBoundingClientRect();
      if (target.scrollHeight > target.clientHeight && e.clientX > rect.right - 16) return true;
      if (target.scrollWidth > target.clientWidth && e.clientY > rect.bottom - 16) return true;
      return false;
    };

    const moveCursor = (e: MouseEvent) => {
      if (isOverScrollbar(e)) {
        document.body.style.cursor = 'auto';
        cursorX.set(-200);
        cursorY.set(-200);
        trailX.set(-200);
        trailY.set(-200);
        return;
      }
      document.body.style.cursor = 'none';
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      trailX.set(e.clientX);
      trailY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      if (isOverScrollbar(e)) return;
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('a, button, [role="button"], input, select, textarea, label, [data-cursor-hover]');
      if (isInteractive && !isHovering.current) {
        isHovering.current = true;
        scale.set(1.8);
      } else if (!isInteractive && isHovering.current) {
        isHovering.current = false;
        scale.set(1);
      }
    };

    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleMouseOver);
    document.body.style.cursor = 'none';

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.body.style.cursor = '';
    };
  }, [cursorX, cursorY, trailX, trailY, scale]);

  // Hide on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]">
      {/* Main cursor dot */}
      <motion.div
        style={{ x: cursorX, y: cursorY }}
        className="absolute w-2 h-2 bg-gold-500 rounded-full -translate-x-1/2 -translate-y-1/2"
      />

      {/* Trailing ring */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          scale,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className="absolute w-8 h-8 border border-gold-400/60 rounded-full transition-[width,height,background] duration-200"
      />
    </div>
  );
};
