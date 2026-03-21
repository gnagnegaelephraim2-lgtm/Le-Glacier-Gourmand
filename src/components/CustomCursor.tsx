import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    setIsFinePointer(window.matchMedia('(pointer: fine)').matches);
  }, []);

  useEffect(() => {
    // Only activate on devices with a real mouse/trackpad
    if (!isFinePointer) return;

    let rafId: number;
    let mouseX = -200;
    let mouseY = -200;
    let ringX = -200;
    let ringY = -200;

    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setIsVisible(true);

      if (cursorRef.current) {
        cursorRef.current.style.left = `${mouseX}px`;
        cursorRef.current.style.top = `${mouseY}px`;
      }

      const target = e.target as HTMLElement;
      setIsHovering(
        !!target.closest('a, button, [role="button"], input, textarea, select, label')
      );
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;
      if (ringRef.current) {
        ringRef.current.style.left = `${ringX}px`;
        ringRef.current.style.top = `${ringY}px`;
      }
      rafId = requestAnimationFrame(animateRing);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);
    rafId = requestAnimationFrame(animateRing);

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Render nothing on phones/tablets (coarse pointer = touch screen)
  if (!isFinePointer) return null;

  return (
    <>
      {/* Ice cream emoji cursor */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 999999,
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.7 : isHovering ? 1.4 : 1}) rotate(${isHovering ? '-15deg' : '0deg'})`,
          fontSize: '22px',
          lineHeight: 1,
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease',
          opacity: isVisible ? 1 : 0,
          userSelect: 'none',
          willChange: 'left, top',
        }}
      >
        {isHovering ? '🍨' : '🍦'}
      </div>

      {/* Trailing ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 999998,
          transform: 'translate(-50%, -50%)',
          width: isHovering ? '52px' : '34px',
          height: isHovering ? '52px' : '34px',
          borderRadius: '50%',
          border: `2px solid rgba(212, 163, 115, ${isHovering ? 0.8 : 0.45})`,
          background: isHovering ? 'rgba(212, 163, 115, 0.08)' : 'transparent',
          transition: 'width 0.3s ease, height 0.3s ease, border-color 0.3s ease, background 0.3s ease, opacity 0.15s ease',
          opacity: isVisible ? 1 : 0,
          willChange: 'left, top',
        }}
      />
    </>
  );
}
