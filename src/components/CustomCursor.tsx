import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring   = ringRef.current;
    if (!cursor || !ring) return;

    let rafId: number;
    let posX = -200, posY = -200;
    let ringX = -200, ringY = -200;
    let hovering = false;
    let clicking = false;

    const setOpacity = (v: number) => {
      cursor.style.opacity = String(v);
      ring.style.opacity   = String(v);
    };

    const updateCursorStyle = () => {
      const scale  = clicking ? 0.7 : hovering ? 1.4 : 1;
      const rotate = hovering ? '-15deg' : '0deg';
      cursor.style.transform = `translate(-50%,-50%) scale(${scale}) rotate(${rotate})`;
      cursor.textContent = hovering ? '🍨' : '🍦';

      const size = hovering ? '52px' : '34px';
      ring.style.width  = size;
      ring.style.height = size;
      ring.style.border = `2px solid rgba(212,163,115,${hovering ? 0.8 : 0.45})`;
      ring.style.background = hovering ? 'rgba(212,163,115,0.08)' : 'transparent';
    };

    const moveTo = (x: number, y: number, target?: Element | null) => {
      posX = x;
      posY = y;
      cursor.style.left = `${x}px`;
      cursor.style.top  = `${y}px`;
      setOpacity(1);

      if (target) {
        const wasHovering = hovering;
        hovering = !!target.closest('a,button,[role="button"],input,textarea,select,label');
        if (wasHovering !== hovering) updateCursorStyle();
      }
    };

    const animateRing = () => {
      ringX += (posX - ringX) * 0.1;
      ringY += (posY - ringY) * 0.1;
      ring.style.left = `${ringX}px`;
      ring.style.top  = `${ringY}px`;
      rafId = requestAnimationFrame(animateRing);
    };

    // ── Mouse ────────────────────────────────────────────────────────────────
    const onMouseMove  = (e: MouseEvent) => moveTo(e.clientX, e.clientY, e.target as Element);
    const onMouseDown  = () => { clicking = true;  updateCursorStyle(); };
    const onMouseUp    = () => { clicking = false; updateCursorStyle(); };
    const onMouseLeave = () => setOpacity(0);
    const onMouseEnter = () => setOpacity(1);

    // ── Touch ────────────────────────────────────────────────────────────────
    let hideTimer: ReturnType<typeof setTimeout>;
    const onTouchStart = (e: TouchEvent) => {
      clearTimeout(hideTimer);
      const t = e.touches[0];
      clicking = true;
      updateCursorStyle();
      moveTo(t.clientX, t.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      clearTimeout(hideTimer);
      const t = e.touches[0];
      moveTo(t.clientX, t.clientY);
    };
    const onTouchEnd = () => {
      clicking = false;
      updateCursorStyle();
      hideTimer = setTimeout(() => setOpacity(0), 600);
    };

    document.addEventListener('mousemove',  onMouseMove);
    document.addEventListener('mousedown',  onMouseDown);
    document.addEventListener('mouseup',    onMouseUp);
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove',  onTouchMove,  { passive: true });
    document.addEventListener('touchend',   onTouchEnd);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);
    rafId = requestAnimationFrame(animateRing);

    return () => {
      document.removeEventListener('mousemove',  onMouseMove);
      document.removeEventListener('mousedown',  onMouseDown);
      document.removeEventListener('mouseup',    onMouseUp);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove',  onTouchMove);
      document.removeEventListener('touchend',   onTouchEnd);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(rafId);
      clearTimeout(hideTimer);
    };
  }, []);

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
          transform: 'translate(-50%,-50%)',
          fontSize: '22px',
          lineHeight: 1,
          transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          opacity: 0,
          userSelect: 'none',
          willChange: 'left,top,opacity',
        }}
      >
        🍦
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
          transform: 'translate(-50%,-50%)',
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          border: '2px solid rgba(212,163,115,0.45)',
          transition: 'width 0.3s ease,height 0.3s ease,border-color 0.3s ease,background 0.3s ease',
          opacity: 0,
          willChange: 'left,top,opacity',
        }}
      />
    </>
  );
}
