import React, { useEffect, useRef, useState, useCallback } from 'react';

export type CursorShape = 'arrow' | 'pointer' | 'text';

export type StepTarget =
  | string // CSS selector inside stage (e.g. '[data-tour="download-btn"]')
  | { x: number; y: number } // Percentage { x: 0-100, y: 0-100 }
  | { pxX: number; pxY: number }; // Absolute pixels inside stage

export type ScriptStep =
  | {
      type: 'move';
      target: StepTarget;
      shape?: CursorShape;
      duration?: number;
      hoverSelector?: string;
    }
  | {
      type: 'click';
      target?: StepTarget;
      holdMs?: number;
    }
  | {
      type: 'type';
      target?: StepTarget;
      text: string;
      speedMs?: number;
      onChar?: (currentText: string) => void;
    }
  | {
      type: 'action';
      run: () => void | Promise<void>;
    }
  | {
      type: 'wait';
      ms: number;
    };

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

interface Props {
  containerRef: React.RefObject<HTMLElement | null>;
  steps: ScriptStep[];
  enabled?: boolean;
  loop?: boolean;
  loopDelayMs?: number;
  onLoopReset?: () => void;
}

export const SimulatedCursor: React.FC<Props> = ({
  containerRef,
  steps,
  enabled = true,
  loop = true,
  loopDelayMs = 2500,
  onLoopReset,
}) => {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [shape, setShape] = useState<CursorShape>('arrow');
  const [isDown, setIsDown] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [ripples, setRipples] = useState<ClickRipple[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const activeHoverElRef = useRef<HTMLElement | null>(null);
  const isCancelledRef = useRef(false);
  const userInteractingRef = useRef(false);
  const userResumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inViewRef = useRef(true);

  // Detect touch screens, reduced motion preferences, and window visibility
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const touchMatch = window.matchMedia('(hover: none) and (pointer: coarse)');
    const motionMatch = window.matchMedia('(prefers-reduced-motion: reduce)');

    setIsTouchDevice(touchMatch.matches || window.innerWidth < 768);
    setPrefersReducedMotion(motionMatch.matches);

    const handleTouchChange = (e: MediaQueryListEvent) => {
      setIsTouchDevice(e.matches || window.innerWidth < 768);
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    const handleVisibility = () => {
      inViewRef.current = !document.hidden;
    };

    const handleResize = () => {
      setIsTouchDevice(touchMatch.matches || window.innerWidth < 768);
    };

    touchMatch.addEventListener('change', handleTouchChange);
    motionMatch.addEventListener('change', handleMotionChange);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      touchMatch.removeEventListener('change', handleTouchChange);
      motionMatch.removeEventListener('change', handleMotionChange);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Clear hover attributes on elements
  const clearActiveHover = useCallback(() => {
    if (activeHoverElRef.current) {
      activeHoverElRef.current.removeAttribute('data-hover');
      activeHoverElRef.current = null;
    }
  }, []);

  // Resolve target position in pixels relative to container
  const resolveTargetPos = useCallback(
    (target: StepTarget): { x: number; y: number; element?: HTMLElement } | null => {
      const container = containerRef.current;
      if (!container) return null;

      const containerRect = container.getBoundingClientRect();
      if (containerRect.width === 0 || containerRect.height === 0) return null;

      if (typeof target === 'string') {
        const el = container.querySelector(target) as HTMLElement | null;
        if (!el) return null;
        const elRect = el.getBoundingClientRect();
        return {
          x: elRect.left - containerRect.left + elRect.width / 2,
          y: elRect.top - containerRect.top + elRect.height / 2,
          element: el,
        };
      } else if ('pxX' in target && 'pxY' in target) {
        return { x: target.pxX, y: target.pxY };
      } else if ('x' in target && 'y' in target) {
        return {
          x: (target.x / 100) * containerRect.width,
          y: (target.y / 100) * containerRect.height,
        };
      }
      return null;
    },
    [containerRef]
  );

  // Smooth position interpolation
  const animateTo = useCallback(
    (targetX: number, targetY: number, duration = 400): Promise<void> => {
      return new Promise((resolve) => {
        const startX = pos.x;
        const startY = pos.y;
        const deltaX = targetX - startX;
        const deltaY = targetY - startY;

        if (duration <= 0 || (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1)) {
          setPos({ x: targetX, y: targetY });
          resolve();
          return;
        }

        const startTime = performance.now();

        const tick = (now: number) => {
          if (isCancelledRef.current) {
            resolve();
            return;
          }

          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Cubic-bezier smooth easing out
          const ease = 1 - Math.pow(1 - progress, 3);

          setPos({
            x: startX + deltaX * ease,
            y: startY + deltaY * ease,
          });

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            setPos({ x: targetX, y: targetY });
            resolve();
          }
        };

        requestAnimationFrame(tick);
      });
    },
    [pos.x, pos.y]
  );

  // Pause simulation when real user interacts, resume on idle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerEnter = () => {
      userInteractingRef.current = true;
      setIsVisible(false);
      clearActiveHover();
      if (userResumeTimeoutRef.current) clearTimeout(userResumeTimeoutRef.current);
    };

    const handlePointerLeave = () => {
      if (userResumeTimeoutRef.current) clearTimeout(userResumeTimeoutRef.current);
      userResumeTimeoutRef.current = setTimeout(() => {
        userInteractingRef.current = false;
        setIsVisible(true);
      }, 2400);
    };

    container.addEventListener('pointerenter', handlePointerEnter);
    container.addEventListener('pointerleave', handlePointerLeave);
    container.addEventListener('pointerdown', handlePointerEnter);

    return () => {
      container.removeEventListener('pointerenter', handlePointerEnter);
      container.removeEventListener('pointerleave', handlePointerLeave);
      container.removeEventListener('pointerdown', handlePointerEnter);
      if (userResumeTimeoutRef.current) clearTimeout(userResumeTimeoutRef.current);
    };
  }, [containerRef, clearActiveHover]);

  // Viewport intersection observer to conserve mobile battery/GPU
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        inViewRef.current = Boolean(entry && entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);

  // Main Script Runner Loop
  useEffect(() => {
    if (!enabled || steps.length === 0) return;
    isCancelledRef.current = false;

    let isRunning = true;

    const waitWithCheck = (ms: number): Promise<void> => {
      return new Promise((resolve) => {
        const start = performance.now();
        const check = (now: number) => {
          if (isCancelledRef.current || !isRunning) {
            resolve();
            return;
          }
          if (now - start >= ms) {
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        requestAnimationFrame(check);
      });
    };

    const runScript = async () => {
      while (isRunning && !isCancelledRef.current) {
        // Yield if tab is hidden, element is offscreen, or user is manually interacting
        if (!inViewRef.current || document.hidden || userInteractingRef.current) {
          await waitWithCheck(400);
          continue;
        }

        for (let i = 0; i < steps.length; i++) {
          if (isCancelledRef.current || !isRunning) break;

          while ((!inViewRef.current || document.hidden || userInteractingRef.current) && !isCancelledRef.current) {
            await waitWithCheck(400);
          }

          const step = steps[i];

          switch (step.type) {
            case 'move': {
              const target = resolveTargetPos(step.target);
              if (target) {
                if (step.shape) setShape(step.shape);

                clearActiveHover();
                const hoverEl = step.hoverSelector
                  ? (containerRef.current?.querySelector(step.hoverSelector) as HTMLElement | null)
                  : target.element;

                await animateTo(target.x, target.y, step.duration ?? 450);

                if (hoverEl && !userInteractingRef.current) {
                  hoverEl.setAttribute('data-hover', 'true');
                  activeHoverElRef.current = hoverEl;
                }
              }
              break;
            }

            case 'click': {
              if (step.target) {
                const target = resolveTargetPos(step.target);
                if (target) {
                  await animateTo(target.x, target.y, 220);
                }
              }

              // Trigger click state and ripple animation
              setIsDown(true);
              setRipples((prev) => [...prev, { id: Date.now(), x: pos.x, y: pos.y }]);

              await waitWithCheck(step.holdMs ?? 140);
              setIsDown(false);

              // Auto clear old ripples
              setTimeout(() => {
                setRipples((prev) => prev.slice(1));
              }, 400);
              break;
            }

            case 'type': {
              if (step.target) {
                const target = resolveTargetPos(step.target);
                if (target) {
                  setShape('text');
                  await animateTo(target.x, target.y, 240);
                }
              }

              const chars = step.text.split('');
              let typed = '';
              for (const ch of chars) {
                if (isCancelledRef.current) break;
                typed += ch;
                if (step.onChar) step.onChar(typed);
                await waitWithCheck(step.speedMs ?? 55 + Math.random() * 40);
              }
              break;
            }

            case 'action': {
              await step.run();
              break;
            }

            case 'wait': {
              await waitWithCheck(step.ms);
              break;
            }
          }

          await waitWithCheck(80);
        }

        if (!loop) break;

        await waitWithCheck(loopDelayMs);
        clearActiveHover();
        if (onLoopReset) onLoopReset();
      }
    };

    runScript();

    return () => {
      isRunning = false;
      isCancelledRef.current = true;
      clearActiveHover();
    };
  }, [
    enabled,
    steps,
    loop,
    loopDelayMs,
    onLoopReset,
    animateTo,
    resolveTargetPos,
    clearActiveHover,
    pos.x,
    pos.y,
  ]);

  if (!enabled || !isVisible || prefersReducedMotion) return null;

  return (
    <>
      {/* Click Ripples */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="cursor-click"
          style={{
            transform: `translate3d(${ripple.x}px, ${ripple.y}px, 0)`,
          }}
        />
      ))}

      {/* Simulated Virtual Cursor */}
      <div
        className="cursor"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          transition: 'opacity 0.2s ease',
          pointerEvents: 'none',
          zIndex: 60,
        }}
        aria-hidden="true"
      >
        {isTouchDevice ? (
          // Sleek mobile tap indicator dot
          <div
            className={`cursor-touch-dot ${isDown ? 'cursor-touch-dot--down' : ''}`}
          />
        ) : (
          // Editorial Print SVG Desktop Cursor
          <div
            className={`cursor-shape cursor-shape--${shape} ${
              isDown ? 'cursor-shape--down' : ''
            }`}
          >
            {shape === 'text' ? (
              <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
                <path
                  d="M4 2h6M7 2v16M4 18h6"
                  stroke="#111111"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M4 2h6M7 2v16M4 18h6"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
              </svg>
            ) : shape === 'pointer' ? (
              <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                <path
                  d="M6 1v12.5l-3.2-3.2a1.8 1.8 0 0 0-2.5 0c-.7.7-.7 1.8 0 2.5l5.5 5.5c1.4 1.4 3.3 2.2 5.2 2.2h3c3.3 0 6-2.7 6-6V9.5c0-1-.8-1.8-1.8-1.8-.3 0-.6.1-.8.2V7.5c0-1-.8-1.8-1.8-1.8-.3 0-.6.1-.8.2V6c0-1-.8-1.8-1.8-1.8-.3 0-.6.1-.8.2V1c0-1-.8-1.8-1.8-1.8S6 0 6 1Z"
                  fill="#111111"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="17" height="23" viewBox="0 0 17 23" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1 1L15.5 13.5H7.5L4 21.5L1 1Z"
                  fill="#111111"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        )}
      </div>
    </>
  );
};